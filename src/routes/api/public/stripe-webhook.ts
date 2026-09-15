import { createFileRoute } from "@tanstack/react-router";
import Stripe from "stripe";

interface RpcClient {
  rpc(
    name: string,
    args: Record<string, unknown>,
  ): Promise<{ data: unknown; error: { message: string } | null }>;
}

interface InboxReceipt {
  id: string;
  status: "received" | "processing" | "succeeded" | "ignored" | "failed" | "dead";
  receive_count: number;
  attempt_count: number;
}

export const Route = createFileRoute("/api/public/stripe-webhook")({
  server: {
    handlers: {
      POST: async ({ request }) => {
        const secretKey = process.env["STRIPE_SECRET_KEY"];
        const webhookSecret = process.env["STRIPE_WEBHOOK_SECRET"];

        if (!secretKey || !webhookSecret) {
          console.error("Stripe environment variables are missing.");
          return new Response("Stripe is not fully configured.", { status: 500 });
        }

        const stripe = new Stripe(secretKey, {
          apiVersion: "2026-08-26.dahlia",
          typescript: true,
        });

        const signature = request.headers.get("stripe-signature") ?? "";
        const body = await request.text();

        let event: Stripe.Event;
        try {
          event = stripe.webhooks.constructEvent(body, signature, webhookSecret);
        } catch (err) {
          const message = err instanceof Error ? err.message : "Invalid signature";
          console.error(`Webhook signature verification failed: ${message}`);
          return new Response(`Webhook Error: ${message}`, { status: 400 });
        }

        const environment = event.livemode ? "production" : "sandbox";
        const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
        const admin = supabaseAdmin as unknown as RpcClient;

        const receipt = await receiveEvent(admin, event, environment);
        if (receipt.status === "succeeded" || receipt.status === "ignored") {
          return jsonResponse({ received: true, duplicate: true });
        }

        await markEvent(admin, receipt.id, "processing");

        try {
          const handled = await reconcileStripeEvent(stripe, supabaseAdmin, event);
          await markEvent(admin, receipt.id, handled ? "succeeded" : "ignored");
          return jsonResponse({ received: true, handled });
        } catch (error) {
          const message = error instanceof Error ? error.message : String(error);
          console.error("Stripe reconciliation failed", event.id, event.type, message);
          await markEvent(admin, receipt.id, "failed", message);
          await admin.rpc("integration_record_failure", {
            p_provider_key: "stripe",
            p_environment: environment,
            p_operation: event.type,
            p_error_message: message,
            p_source_type: "integration_inbox",
            p_source_id: receipt.id,
            p_classification: "provider_error",
            p_retryable: true,
            p_error_code: null,
            p_metadata: { stripe_event_id: event.id },
          });
          return jsonResponse({ received: false, retry: true }, 500);
        }
      },
    },
  },
});

function jsonResponse(body: unknown, status = 200) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { "content-type": "application/json", "cache-control": "no-store" },
  });
}

async function receiveEvent(admin: RpcClient, event: Stripe.Event, environment: string) {
  const { data, error } = await admin.rpc("integration_receive_event", {
    p_provider_key: "stripe",
    p_environment: environment,
    p_external_event_id: event.id,
    p_event_type: event.type,
    p_payload: event,
  });

  if (error) throw new Error(`Unable to persist Stripe event: ${error.message}`);
  if (!data || typeof data !== "object") throw new Error("Stripe event receipt was not returned");
  return data as InboxReceipt;
}

async function markEvent(admin: RpcClient, id: string, status: string, errorMessage?: string) {
  const { error } = await admin.rpc("integration_mark_event", {
    p_event_id: id,
    p_status: status,
    p_error: errorMessage ?? null,
  });
  if (error) throw new Error(`Unable to update Stripe event state: ${error.message}`);
}

async function reconcileStripeEvent(
  stripe: Stripe,
  supabaseAdmin: Awaited<ReturnType<typeof loadAdminClient>>,
  event: Stripe.Event,
) {
  switch (event.type) {
    case "checkout.session.completed":
    case "checkout.session.async_payment_succeeded": {
      const incoming = event.data.object as Stripe.Checkout.Session;
      const session = await stripe.checkout.sessions.retrieve(incoming.id, {
        expand: ["line_items.data.price.product"],
      });
      await reconcileCheckoutSession(supabaseAdmin, session);
      return true;
    }
    case "checkout.session.async_payment_failed": {
      const session = event.data.object as Stripe.Checkout.Session;
      await updateOrderBySession(supabaseAdmin, session.id, "payment_failed");
      return true;
    }
    case "invoice.paid": {
      const invoice = event.data.object as Stripe.Invoice;
      const subscriptionId = invoiceSubscriptionId(invoice);
      if (subscriptionId) await updateOrderBySubscription(supabaseAdmin, subscriptionId, "paid");
      return Boolean(subscriptionId);
    }
    case "invoice.payment_failed": {
      const invoice = event.data.object as Stripe.Invoice;
      const subscriptionId = invoiceSubscriptionId(invoice);
      if (subscriptionId) await updateOrderBySubscription(supabaseAdmin, subscriptionId, "payment_failed");
      return Boolean(subscriptionId);
    }
    case "customer.subscription.updated": {
      const subscription = event.data.object as Stripe.Subscription;
      await updateOrderBySubscription(supabaseAdmin, subscription.id, subscriptionStatus(subscription.status));
      return true;
    }
    case "customer.subscription.deleted": {
      const subscription = event.data.object as Stripe.Subscription;
      await updateOrderBySubscription(supabaseAdmin, subscription.id, "cancelled");
      return true;
    }
    case "charge.refunded": {
      const charge = event.data.object as Stripe.Charge;
      const paymentIntentId = stripeId(charge.payment_intent);
      if (paymentIntentId) {
        await updateOrderByPaymentIntent(
          supabaseAdmin,
          paymentIntentId,
          charge.amount_refunded >= charge.amount ? "refunded" : "partially_refunded",
        );
      }
      return Boolean(paymentIntentId);
    }
    default:
      return false;
  }
}

async function loadAdminClient() {
  const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
  return supabaseAdmin;
}

async function reconcileCheckoutSession(
  supabaseAdmin: Awaited<ReturnType<typeof loadAdminClient>>,
  session: Stripe.Checkout.Session,
) {
  const offerSlug = session.metadata?.offer_slug?.trim() ?? "";
  if (!offerSlug) throw new Error("Stripe checkout session is missing offer_slug metadata");

  const firstLine = session.line_items?.data?.[0];
  const priceId = firstLine?.price?.id ?? null;
  const productId = stripeId(firstLine?.price?.product);
  const status = session.payment_status === "paid" ? "paid" : session.payment_status || "pending";

  const upsert = {
    stripe_customer_id: stripeId(session.customer),
    stripe_session_id: session.id,
    stripe_payment_intent_id: stripeId(session.payment_intent),
    stripe_subscription_id: stripeId(session.subscription),
    stripe_product_id: productId,
    stripe_price_id: priceId,
    offer_slug: offerSlug,
    amount_total: session.amount_total ?? null,
    currency: session.currency ?? null,
    status,
    customer_email: session.customer_details?.email ?? session.customer_email ?? null,
    metadata: {
      ...(session.metadata ?? {}),
      payment_status: session.payment_status,
      checkout_status: session.status,
    },
  };

  const { error } = await supabaseAdmin.from("orders").upsert(upsert, {
    onConflict: "stripe_session_id",
  });
  if (error) throw new Error(`Failed to reconcile checkout session: ${error.message}`);
}

async function updateOrderBySession(
  supabaseAdmin: Awaited<ReturnType<typeof loadAdminClient>>,
  sessionId: string,
  status: string,
) {
  const { error } = await supabaseAdmin.from("orders").update({ status }).eq("stripe_session_id", sessionId);
  if (error) throw new Error(`Failed to reconcile order by checkout session: ${error.message}`);
}

async function updateOrderBySubscription(
  supabaseAdmin: Awaited<ReturnType<typeof loadAdminClient>>,
  subscriptionId: string,
  status: string,
) {
  const { error } = await supabaseAdmin.from("orders").update({ status }).eq("stripe_subscription_id", subscriptionId);
  if (error) throw new Error(`Failed to reconcile order by subscription: ${error.message}`);
}

async function updateOrderByPaymentIntent(
  supabaseAdmin: Awaited<ReturnType<typeof loadAdminClient>>,
  paymentIntentId: string,
  status: string,
) {
  const { error } = await supabaseAdmin.from("orders").update({ status }).eq("stripe_payment_intent_id", paymentIntentId);
  if (error) throw new Error(`Failed to reconcile order by payment intent: ${error.message}`);
}

function stripeId(value: unknown): string | null {
  if (typeof value === "string") return value;
  if (value && typeof value === "object" && "id" in value && typeof value.id === "string") return value.id;
  return null;
}

function invoiceSubscriptionId(invoice: Stripe.Invoice): string | null {
  const parent = invoice.parent as unknown as
    | { subscription_details?: { subscription?: string | { id?: string } | null } | null }
    | null;
  return stripeId(parent?.subscription_details?.subscription);
}

function subscriptionStatus(status: Stripe.Subscription.Status) {
  switch (status) {
    case "active":
    case "trialing":
      return "active";
    case "past_due":
    case "unpaid":
      return "payment_failed";
    case "canceled":
      return "cancelled";
    case "paused":
      return "paused";
    default:
      return status;
  }
}
