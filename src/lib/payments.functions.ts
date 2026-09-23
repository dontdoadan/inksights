import { createServerFn } from "@tanstack/react-start";
import Stripe from "stripe";
import { getPublicOffer } from "./offer-data";

export const createCheckoutSession = createServerFn({ method: "POST" })
  .validator((data: { slug: string; email?: string; leadId?: string; auditId?: string }) => data)
  .handler(async ({ data }) => {
    const offer = getPublicOffer(data.slug);
    if (!offer || !offer.stripePriceId || !offer.stripeMode) {
      throw new Error("This offer is not available for checkout.");
    }

    const secretKey = process.env["STRIPE_SECRET_KEY"];
    if (!secretKey) {
      throw new Error("Stripe is not configured.");
    }

    const stripe = new Stripe(secretKey, {
      apiVersion: "2026-08-26.dahlia",
      typescript: true,
    });

    const origin = process.env["VITE_APP_ORIGIN"] || "https://getinksights.co.uk";
    const successUrl = `${origin}/offers/${offer.slug}?checkout=success&session_id={CHECKOUT_SESSION_ID}`;
    const cancelUrl = `${origin}/offers/${offer.slug}?checkout=cancelled`;

    const session = await stripe.checkout.sessions.create({
      mode: offer.stripeMode,
      line_items: [
        {
          price: offer.stripePriceId,
          quantity: 1,
        },
      ],
      success_url: successUrl,
      cancel_url: cancelUrl,
      automatic_tax: { enabled: false },
      managed_payments: { enabled: false },
      metadata: {
        offer_slug: offer.slug,
        offer_name: offer.name,
        ...(data.leadId ? { lead_id: data.leadId } : {}),
        ...(data.auditId ? { audit_id: data.auditId } : {}),
      },
      ...(data.email ? { customer_email: data.email } : {}),
    });

    if (!session.url) {
      throw new Error("Checkout session could not be created.");
    }

    return { url: session.url };
  });

export const verifyCheckoutSession = createServerFn({ method: "POST" })
  .validator((data: { sessionId: string }) => data)
  .handler(async ({ data }) => {
    const secretKey = process.env["STRIPE_SECRET_KEY"];
    if (!secretKey) throw new Error("Stripe is not configured.");
    if (!data.sessionId || !data.sessionId.startsWith("cs_")) throw new Error("Invalid checkout session.");

    const stripe = new Stripe(secretKey, {
      apiVersion: "2026-08-26.dahlia",
      typescript: true,
    });
    const session = await stripe.checkout.sessions.retrieve(data.sessionId);
    const paid = session.payment_status === "paid" || (session.mode === "subscription" && session.status === "complete");

    return {
      paid,
      status: session.status,
      paymentStatus: session.payment_status,
      offerSlug: session.metadata?.offer_slug || null,
      leadId: session.metadata?.lead_id || null,
      auditId: session.metadata?.audit_id || null,
      amountTotal: session.amount_total ?? null,
      currency: session.currency ?? null,
    };
  });
