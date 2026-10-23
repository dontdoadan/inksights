import { createFileRoute } from "@tanstack/react-router";
import Stripe from "stripe";
import { getPublicOffer } from "@/lib/offer-data";

export const Route = createFileRoute("/api/public/stripe-webhook")({
  server: {
    handlers: {
      POST: async ({ request }) => {
        const secretKey = process.env["STRIPE_SECRET_KEY"];
        const webhookSecret = process.env["STRIPE_WEBHOOK_SECRET"];

        if (!secretKey) {
          console.error("Stripe secret key is missing.");
          return new Response("Stripe is not configured.", { status: 500 });
        }

        const stripe = new Stripe(secretKey, {
          apiVersion: "2026-08-26.dahlia",
          typescript: true,
        });

        const signature = request.headers.get("stripe-signature") ?? "";
        const body = await request.text();

        let event: Stripe.Event | null = null;

        if (webhookSecret && signature) {
          try {
            event = stripe.webhooks.constructEvent(body, signature, webhookSecret);
          } catch (err) {
            const message = err instanceof Error ? err.message : "Invalid signature";
            console.warn(`Webhook signature verification failed; attempting Stripe API verification: ${message}`);
          }
        }

        if (!event) {
          let candidateId = "";
          try {
            const parsed = JSON.parse(body) as { id?: unknown };
            candidateId = typeof parsed.id === "string" ? parsed.id : "";
          } catch {
            return new Response("Webhook Error: invalid JSON payload.", { status: 400 });
          }

          if (!candidateId.startsWith("evt_")) {
            return new Response("Webhook Error: invalid event id.", { status: 400 });
          }

          try {
            event = await stripe.events.retrieve(candidateId);
          } catch (err) {
            const message = err instanceof Error ? err.message : "Event verification failed";
            console.error(`Stripe API event verification failed: ${message}`);
            return new Response("Webhook Error: event could not be verified.", { status: 400 });
          }
        }

        if (event.type === "checkout.session.completed" || event.type === "checkout.session.async_payment_succeeded") {
          const session = event.data.object as Stripe.Checkout.Session;
          // Checkout completion is not proof of collected funds for delayed payment methods.
          if (session.status === "complete" && session.payment_status === "paid") {
            await recordCompletedCheckout(session, stripe);
          }
        }

        return new Response(JSON.stringify({ received: true }), {
          status: 200,
          headers: { "content-type": "application/json" },
        });
      },
    },
  },
});

async function recordCompletedCheckout(session: Stripe.Checkout.Session, stripe: Stripe) {
  const offer = getPublicOffer(session.metadata?.offer_slug ?? "");
  if (!offer?.stripePriceId) {
    // Payment-link traffic without the approved offer slug is handled by its
    // existing Stripe/Supabase intake path, not silently classified here.
    console.warn("Skipping unrecognised checkout offer", session.id);
    return;
  }
  const items = await stripe.checkout.sessions.listLineItems(session.id, { limit: 3 });
  const correctItem = items.data.length === 1 &&
    items.data[0]?.price?.id === offer.stripePriceId &&
    items.data[0]?.quantity === 1;
  const correctAuditAmount = offer.slug !== "studio-intelligence-audit" || session.amount_total === 39500;
  if (!correctItem || !correctAuditAmount || session.currency?.toLowerCase() !== "gbp") {
    console.error("Checkout amount/price verification failed", session.id);
    throw new Error("Checkout verification failed");
  }
  const { supabaseAdmin } = await import("@/integrations/supabase/client.server");

  const offerSlug = session.metadata?.offer_slug ?? "";

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
    status: "paid",
    customer_email: session.customer_details?.email ?? null,
    metadata: session.metadata ?? {},
  };

  const { error } = await supabaseAdmin.from("orders").upsert(upsert, {
    onConflict: "stripe_session_id",
  });

  if (error) {
    console.error("Failed to record order:", error);
    throw new Error("Failed to record order");
  }
}