import { createServerFn } from "@tanstack/react-start";
import Stripe from "stripe";
import { getPublicOffer } from "./offer-data";

export const createCheckoutSession = createServerFn({ method: "POST" })
  .inputValidator((data: { slug: string; email?: string }) => data)
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
      apiVersion: "2025-08-27.basil",
      typescript: true,
    });

    const origin = process.env["VITE_APP_ORIGIN"] || "https://getinksight.co.uk";
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
      automatic_tax: { enabled: true },
      metadata: {
        offer_slug: offer.slug,
        offer_name: offer.name,
      },
      ...(data.email ? { customer_email: data.email } : {}),
    });

    if (!session.url) {
      throw new Error("Checkout session could not be created.");
    }

    return { url: session.url };
  });
