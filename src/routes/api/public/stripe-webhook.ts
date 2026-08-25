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
          apiVersion: "2026-07-29.dahlia",
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

        if (event.type === "checkout.session.completed") {
          const session = event.data.object as Stripe.Checkout.Session;
          await recordCompletedCheckout(session);
        }

        return new Response(JSON.stringify({ received: true }), {
          status: 200,
          headers: { "content-type": "application/json" },
        });
      },
    },
  },
});

async function recordCompletedCheckout(session: Stripe.Checkout.Session) {
  const { supabaseAdmin } = await import("@/integrations/supabase/client.server");

  const offerSlug = session.metadata?.offer_slug ?? "";
  const lineItem = session.line_items?.data[0] ?? null;
  const price = lineItem?.price;

  const upsert = {
    stripe_customer_id: session.customer as string | undefined,
    stripe_session_id: session.id,
    stripe_payment_intent_id: (session.payment_intent as string | undefined) ?? null,
    stripe_subscription_id: (session.subscription as string | undefined) ?? null,
    stripe_product_id: (price?.product as string | undefined) ?? null,
    stripe_price_id: (price?.id as string | undefined) ?? null,
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
