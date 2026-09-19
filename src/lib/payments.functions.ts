import { createServerFn } from "@tanstack/react-start";
import Stripe from "stripe";
import { getPublicOffer } from "./offer-data";

type JourneyCheckoutInput = {
  slug: string;
  email?: string;
  journey?: {
    correlationId: string;
    studioId: string;
    hubspotContactId: string;
    hubspotDealId: string;
    interventionId: string;
    offerKey: string;
    moduleKey: "enquiry_recovery";
    testMode?: boolean;
  };
};

type QueryError = { message: string } | null;
type Row = Record<string, unknown>;
type UntypedQuery = {
  select: (columns: string) => UntypedQuery;
  eq: (column: string, value: string) => UntypedQuery;
  maybeSingle: () => Promise<{ data: Row | null; error: QueryError }>;
  limit: (count: number) => Promise<{ data: Row[] | null; error: QueryError }>;
};
type UntypedAdminClient = {
  from: (table: string) => UntypedQuery;
};

export const createCheckoutSession = createServerFn({ method: "POST" })
  .validator((data: JourneyCheckoutInput) => data)
  .handler(async ({ data }) => {
    const offer = getPublicOffer(data.slug);
    if (!offer || !offer.stripePriceId || !offer.stripeMode) {
      throw new Error("This offer is not available for checkout.");
    }

    const secretKey = process.env["STRIPE_SECRET_KEY"];
    if (!secretKey) throw new Error("Stripe is not configured.");

    const stripe = new Stripe(secretKey, {
      apiVersion: "2026-08-26.dahlia",
      typescript: true,
    });

    const origin = process.env["VITE_APP_ORIGIN"] || "https://getinksights.co.uk";
    const successUrl = `${origin}/offers/${offer.slug}?checkout=success&session_id={CHECKOUT_SESSION_ID}`;
    const cancelUrl = `${origin}/offers/${offer.slug}?checkout=cancelled`;

    let metadata: Record<string, string> = {
      offer_slug: offer.slug,
      offer_name: offer.name,
    };

    if (data.journey) {
      await validateJourney(data.journey);
      metadata = {
        ...metadata,
        business: "INKSIGHTS",
        studio_id: data.journey.studioId,
        hubspot_contact_id: data.journey.hubspotContactId,
        hubspot_deal_id: data.journey.hubspotDealId,
        intervention_id: data.journey.interventionId,
        correlation_id: data.journey.correlationId,
        offer_key: data.journey.offerKey,
        module_key: data.journey.moduleKey,
        test_mode: data.journey.testMode ? "true" : "false",
      };
    }

    const session = await stripe.checkout.sessions.create({
      mode: offer.stripeMode,
      line_items: [{ price: offer.stripePriceId, quantity: 1 }],
      success_url: successUrl,
      cancel_url: cancelUrl,
      automatic_tax: { enabled: true },
      metadata,
      ...(data.email ? { customer_email: data.email } : {}),
    });

    if (!session.url) throw new Error("Checkout session could not be created.");

    if (data.journey) {
      const { recordIntegrationEvent } = await import("@/lib/integration-events.server");
      await recordIntegrationEvent({
        eventType: "deposit.requested",
        sourceSystem: "stripe",
        sourceEventId: session.id,
        idempotencyKey: `stripe:${session.id}:deposit.requested`,
        correlationId: data.journey.correlationId,
        studioId: data.journey.studioId,
        contactRef: data.journey.hubspotContactId,
        opportunityRef: data.journey.hubspotDealId,
        interventionId: data.journey.interventionId,
        payload: {
          stripe_session_id: session.id,
          offer_slug: offer.slug,
          offer_key: data.journey.offerKey,
          module_key: data.journey.moduleKey,
          test_mode: data.journey.testMode ?? false,
        },
      });
    }

    return { url: session.url, sessionId: session.id };
  });

async function validateJourney(journey: NonNullable<JourneyCheckoutInput["journey"]>) {
  // Dynamic import is required here: *.functions.ts can be included in a client bundle.
  const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
  const admin = supabaseAdmin as unknown as UntypedAdminClient;

  const [studio, intervention, leadEvent] = await Promise.all([
    admin.from("studios").select("id").eq("id", journey.studioId).maybeSingle(),
    admin
      .from("intelligence_interventions")
      .select("id,studio_id")
      .eq("id", journey.interventionId)
      .maybeSingle(),
    admin
      .from("integration_events")
      .select("event_id")
      .eq("correlation_id", journey.correlationId)
      .eq("contact_ref", journey.hubspotContactId)
      .eq("opportunity_ref", journey.hubspotDealId)
      .limit(1),
  ]);

  if (studio.error || !studio.data) throw new Error("Journey studio is not valid.");
  if (
    intervention.error ||
    !intervention.data ||
    intervention.data["studio_id"] !== journey.studioId
  ) {
    throw new Error("Journey intervention is not valid for this studio.");
  }
  if (leadEvent.error || !leadEvent.data?.length) {
    throw new Error("Journey CRM identity has not been correlated.");
  }
}
