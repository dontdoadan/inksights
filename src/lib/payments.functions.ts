import { createServerFn } from "@tanstack/react-start";
import Stripe from "stripe";

interface OfferResolution {
  offer_id: string;
  offer_key: string;
  canonical_name: string;
  lifecycle_state: "active";
  offer_version_id: string;
  version: number;
  display_name: string;
  billing_model: "one_time" | "subscription";
  currency: string | null;
  unit_amount_minor: number | null;
  billing_interval: string | null;
  approval_state: "approved";
  mapping_status: "verified";
  external_product_id: string | null;
  external_price_id: string;
}

interface RpcClient {
  rpc(
    name: string,
    args: Record<string, unknown>,
  ): Promise<{ data: unknown; error: { message: string } | null }>;
}

export const createCheckoutSession = createServerFn({ method: "POST" })
  .validator((data: { slug: string; email?: string }) => data)
  .handler(async ({ data }) => {
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    const admin = supabaseAdmin as unknown as RpcClient;
    const { data: resolved, error: resolutionError } = await admin.rpc(
      "resolve_commercial_offer",
      {
        p_offer_key: data.slug,
        p_provider_key: "stripe",
        p_environment: "production",
      },
    );

    if (resolutionError) {
      console.error("[checkout] Offer resolution failed", resolutionError.message);
      throw new Error("Checkout is temporarily unavailable.");
    }

    if (!resolved || typeof resolved !== "object") {
      throw new Error(
        "This offer is not activated for live checkout. Its commercial definition or Stripe mapping still requires approval.",
      );
    }

    const offer = resolved as OfferResolution;
    if (
      offer.lifecycle_state !== "active" ||
      offer.approval_state !== "approved" ||
      offer.mapping_status !== "verified" ||
      !offer.external_price_id?.startsWith("price_")
    ) {
      throw new Error("This offer is not activated for live checkout.");
    }

    const mode: Stripe.Checkout.SessionCreateParams.Mode =
      offer.billing_model === "subscription" ? "subscription" : "payment";

    const secretKey = process.env["STRIPE_SECRET_KEY"];
    if (!secretKey) {
      throw new Error("Stripe is not configured.");
    }

    const stripe = new Stripe(secretKey, {
      apiVersion: "2026-08-26.dahlia",
      typescript: true,
    });

    const origin = process.env["VITE_APP_ORIGIN"] || "https://getinksights.co.uk";
    const successUrl = `${origin}/offers/${offer.offer_key}?checkout=success&session_id={CHECKOUT_SESSION_ID}`;
    const cancelUrl = `${origin}/offers/${offer.offer_key}?checkout=cancelled`;

    const session = await stripe.checkout.sessions.create({
      mode,
      line_items: [
        {
          price: offer.external_price_id,
          quantity: 1,
        },
      ],
      success_url: successUrl,
      cancel_url: cancelUrl,
      automatic_tax: { enabled: true },
      metadata: {
        offer_slug: offer.offer_key,
        offer_name: offer.canonical_name,
        offer_version_id: offer.offer_version_id,
        commercial_version: String(offer.version),
      },
      ...(data.email ? { customer_email: data.email } : {}),
    });

    if (!session.url) {
      throw new Error("Checkout session could not be created.");
    }

    return { url: session.url };
  });