import { createFileRoute } from "@tanstack/react-router";
import Stripe from "stripe";

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

        try {
          if (event.type === "checkout.session.completed") {
            const session = event.data.object as Stripe.Checkout.Session;
            await recordCompletedCheckout(event.id, event.created, session);
          }
        } catch (err) {
          const message = err instanceof Error ? err.message : "Webhook processing failed";
          console.error(message);
          return new Response("Webhook processing failed.", { status: 500 });
        }

        return new Response(JSON.stringify({ received: true }), {
          status: 200,
          headers: { "content-type": "application/json" },
        });
      },
    },
  },
});

async function recordCompletedCheckout(
  stripeEventId: string,
  stripeEventCreated: number,
  session: Stripe.Checkout.Session,
) {
  const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
  const { recordIntegrationEvent, stripeEventKey } = await import("@/lib/integration-events.server");
  const { materializeDepositOutcome } = await import("@/lib/deposit-outcome.server");

  const metadata = session.metadata ?? {};
  const offerSlug = metadata.offer_slug ?? "";
  const correlationId = metadata.correlation_id ?? null;
  const testMode = metadata.test_mode === "true";

  const upsert = {
    stripe_customer_id: session.customer as string | undefined,
    stripe_session_id: session.id,
    stripe_payment_intent_id: (session.payment_intent as string | undefined) ?? null,
    stripe_subscription_id: (session.subscription as string | undefined) ?? null,
    stripe_product_id: null as string | null,
    stripe_price_id: null as string | null,
    offer_slug: offerSlug,
    amount_total: session.amount_total ?? null,
    currency: session.currency ?? null,
    status: session.payment_status === "paid" ? "paid" : session.payment_status,
    customer_email: session.customer_details?.email ?? null,
    metadata,
  };

  const { error } = await supabaseAdmin.from("orders").upsert(upsert, {
    onConflict: "stripe_session_id",
  });

  if (error) {
    console.error("Failed to record order:", error);
    throw new Error("Failed to record order");
  }

  // Only correlated intervention journeys enter the Phase 1 event stream.
  // Existing unrelated checkout traffic remains an order projection only.
  if (correlationId && session.payment_status === "paid") {
    await recordIntegrationEvent({
      eventType: "deposit.paid",
      sourceSystem: "stripe",
      sourceEventId: stripeEventId,
      idempotencyKey: stripeEventKey(stripeEventId, "deposit.paid"),
      correlationId,
      studioId: metadata.studio_id || null,
      contactRef: metadata.hubspot_contact_id || null,
      opportunityRef: metadata.hubspot_deal_id || null,
      interventionId: metadata.intervention_id || null,
      payload: {
        stripe_session_id: session.id,
        stripe_payment_intent_id: session.payment_intent,
        amount_total: session.amount_total,
        currency: session.currency,
        offer_slug: offerSlug,
        offer_key: metadata.offer_key ?? null,
        module_key: metadata.module_key ?? null,
        test_mode: testMode,
      },
    });

    if (metadata.studio_id && metadata.intervention_id) {
      await materializeDepositOutcome({
        stripeEventId,
        stripeSessionId: session.id,
        stripePaymentIntentId: (session.payment_intent as string | null) ?? null,
        correlationId,
        studioId: metadata.studio_id,
        interventionId: metadata.intervention_id,
        contactRef: metadata.hubspot_contact_id || null,
        opportunityRef: metadata.hubspot_deal_id || null,
        amountTotal: session.amount_total,
        currency: session.currency,
        testMode,
        observedAt: new Date(stripeEventCreated * 1000).toISOString(),
      });
    }
  }
}

