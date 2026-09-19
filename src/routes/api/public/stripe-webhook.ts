import { createFileRoute } from "@tanstack/react-router";
import Stripe from "stripe";

export const Route = createFileRoute("/api/public/stripe-webhook")({
  server: {
    handlers: {
      GET: async ({ request }) => {
        if (process.env["VERCEL_ENV"] !== "preview") {
          return new Response("Not found", { status: 404 });
        }

        const correlationId = new URL(request.url).searchParams.get("correlation_id");
        if (!correlationId || !/^[0-9a-f-]{36}$/i.test(correlationId)) {
          return new Response("A valid correlation_id is required.", { status: 400 });
        }

        try {
          const proof = await getPhase1Proof(correlationId);
          return new Response(JSON.stringify(proof, null, 2), {
            status: 200,
            headers: { "content-type": "application/json", "cache-control": "no-store" },
          });
        } catch (err) {
          const message = err instanceof Error ? err.message : "Proof query failed";
          console.error(message);
          return new Response("Proof query failed.", { status: 500 });
        }
      },
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
      sourceEventId: session.id,
      idempotencyKey: stripeEventKey(session.id, "deposit.paid"),
      correlationId,
      studioId: metadata.studio_id || null,
      contactRef: metadata.hubspot_contact_id || null,
      opportunityRef: metadata.hubspot_deal_id || null,
      interventionId: metadata.intervention_id || null,
      payload: {
        stripe_session_id: session.id,
        stripe_delivery_event_id: stripeEventId,
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


type ProofError = { message: string } | null;
type ProofRow = Record<string, unknown>;
type ProofQuery<T = ProofRow[]> = PromiseLike<{ data: T; error: ProofError }> & {
  select: (columns: string) => ProofQuery<ProofRow[]>;
  eq: (column: string, value: unknown) => ProofQuery<T>;
  order: (column: string, options?: { ascending?: boolean }) => ProofQuery<T>;
  limit: (count: number) => ProofQuery<T>;
  maybeSingle: () => PromiseLike<{ data: ProofRow | null; error: ProofError }>;
};
type ProofClient = { from: (table: string) => ProofQuery };

async function getPhase1Proof(correlationId: string) {
  const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
  const admin = supabaseAdmin as unknown as ProofClient;

  const eventResult = await admin
    .from("integration_events")
    .select("event_id,event_type,occurred_at,source_system,source_event_id,idempotency_key,studio_id,contact_ref,opportunity_ref,intervention_id,processing_status,attempt_count,payload")
    .eq("correlation_id", correlationId)
    .order("occurred_at", { ascending: true });

  if (eventResult.error) throw new Error(`Failed to query journey events: ${eventResult.error.message}`);
  const events = eventResult.data ?? [];
  const paidEvent = events.find((row) => row["event_type"] === "deposit.paid");
  const interventionId = events.find((row) => typeof row["intervention_id"] === "string")?.["intervention_id"];
  const paidPayload = paidEvent?.["payload"];
  const stripeSessionId =
    paidPayload && typeof paidPayload === "object"
      ? (paidPayload as Record<string, unknown>)["stripe_session_id"]
      : null;

  let order: ProofRow | null = null;
  if (typeof stripeSessionId === "string") {
    const orderResult = await admin
      .from("orders")
      .select("id,stripe_session_id,stripe_payment_intent_id,offer_slug,amount_total,currency,status,customer_email,metadata,created_at,updated_at")
      .eq("stripe_session_id", stripeSessionId)
      .maybeSingle();
    if (orderResult.error) throw new Error(`Failed to query order: ${orderResult.error.message}`);
    order = orderResult.data;
  }

  let outcomes: ProofRow[] = [];
  let attributions: ProofRow[] = [];
  if (typeof interventionId === "string") {
    const [outcomeResult, attributionResult] = await Promise.all([
      admin
        .from("intelligence_outcomes")
        .select("id,intervention_id,baseline_value,observed_value,delta,source_type,source_ref,classification,confidence,observed_at,payload,value_classification")
        .eq("intervention_id", interventionId)
        .order("created_at", { ascending: true }),
      admin
        .from("intelligence_attributions")
        .select("id,intervention_id,outcome_id,attribution_method,attribution_confidence,attributed_value,attributed_value_pence,confounders,evidence_ids,rationale,created_at")
        .eq("intervention_id", interventionId)
        .order("created_at", { ascending: true }),
    ]);
    if (outcomeResult.error) throw new Error(`Failed to query outcomes: ${outcomeResult.error.message}`);
    if (attributionResult.error) throw new Error(`Failed to query attributions: ${attributionResult.error.message}`);
    outcomes = outcomeResult.data ?? [];
    attributions = attributionResult.data ?? [];
  }

  return {
    test_only: true,
    correlation_id: correlationId,
    current_state: deriveProofState(events),
    event_count: events.length,
    events,
    order,
    outcomes,
    attributions,
    controls: {
      sandbox_commercial_value_excluded: attributions.every((row) => Number(row["attributed_value"] ?? 0) === 0),
      paid_event_count: events.filter((row) => row["event_type"] === "deposit.paid").length,
      failure_event_count: events.filter((row) => row["event_type"] === "workflow.failed").length,
      retry_event_count: events.filter((row) => row["event_type"] === "workflow.retried").length,
    },
  };
}

function deriveProofState(events: ProofRow[]) {
  const types = new Set(events.map((row) => String(row["event_type"] ?? "")));
  if (types.has("intervention.completed")) return "CONVERTED";
  if (types.has("booking.created")) return "BOOKED";
  if (types.has("deposit.paid")) return "DEPOSIT_PAID";
  if (types.has("deposit.requested")) return "DEPOSIT_REQUESTED";
  if (types.has("consultation.completed")) return "CONSULTATION_COMPLETED";
  if (types.has("consultation.booked")) return "CONSULTATION_BOOKED";
  if (types.has("message.replied")) return "RESPONDED";
  if (types.has("message.sent")) return "FOLLOW_UP_ACTIVE";
  if (types.has("lead.qualified")) return "CLASSIFIED";
  if (types.has("lead.created")) return "RECEIVED";
  return "UNKNOWN";
}
