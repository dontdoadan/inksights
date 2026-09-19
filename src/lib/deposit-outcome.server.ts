import { supabaseAdmin } from "@/integrations/supabase/client.server";
import { recordIntegrationEvent, stripeEventKey } from "@/lib/integration-events.server";

type QueryError = { message: string } | null;
type Row = Record<string, unknown>;
type QueryResult<T> = { data: T; error: QueryError };

type ServiceQuery<T = Row[]> = PromiseLike<QueryResult<T>> & {
  select: (columns: string) => ServiceQuery<Row[]>;
  eq: (column: string, value: unknown) => ServiceQuery<T>;
  limit: (count: number) => ServiceQuery<T>;
  maybeSingle: () => PromiseLike<QueryResult<Row | null>>;
  single: () => PromiseLike<QueryResult<Row>>;
  insert: (values: Row | Row[]) => ServiceQuery<Row[]>;
};

type ServiceClient = {
  from: (table: string) => ServiceQuery;
};

export type DepositOutcomeInput = {
  stripeEventId: string;
  stripeSessionId: string;
  stripePaymentIntentId?: string | null;
  correlationId: string;
  studioId: string;
  interventionId: string;
  contactRef?: string | null;
  opportunityRef?: string | null;
  amountTotal?: number | null;
  currency?: string | null;
  testMode: boolean;
  observedAt?: string;
};

function moneyMajor(amountTotal: number | null | undefined) {
  return (amountTotal ?? 0) / 100;
}

function asId(row: Row | null, label: string) {
  const id = row?.["id"];
  if (typeof id !== "string") throw new Error(`${label} did not return an id.`);
  return id;
}

export async function materializeDepositOutcome(input: DepositOutcomeInput) {
  const admin = supabaseAdmin as unknown as ServiceClient;
  const observedAt = input.observedAt ?? new Date().toISOString();
  const period = observedAt.slice(0, 10);

  const existingOutcomeResult = await admin
    .from("intelligence_outcomes")
    .select("id")
    .eq("intervention_id", input.interventionId)
    .eq("source_ref", input.stripeEventId)
    .limit(1)
    .maybeSingle();

  if (existingOutcomeResult.error) {
    throw new Error(`Failed to check deposit outcome: ${existingOutcomeResult.error.message}`);
  }

  let outcomeId = existingOutcomeResult.data ? asId(existingOutcomeResult.data, "Existing outcome") : null;

  const evidenceResult = await admin
    .from("intelligence_evidence")
    .select("id")
    .eq("studio_id", input.studioId)
    .eq("source_type", "stripe")
    .eq("source_ref", input.stripeEventId)
    .limit(1)
    .maybeSingle();

  if (evidenceResult.error) {
    throw new Error(`Failed to check payment evidence: ${evidenceResult.error.message}`);
  }

  let evidenceId = evidenceResult.data ? asId(evidenceResult.data, "Existing evidence") : null;

  if (!evidenceId) {
    const createdEvidence = await admin
      .from("intelligence_evidence")
      .insert({
        studio_id: input.studioId,
        evidence_type: "deposit_payment",
        classification: "observed",
        source_type: "stripe",
        source_ref: input.stripeEventId,
        claim: input.testMode
          ? "TEST ONLY — Stripe sandbox confirmed the correlated deposit payment path."
          : "Stripe confirmed the correlated deposit payment.",
        payload: {
          correlation_id: input.correlationId,
          stripe_session_id: input.stripeSessionId,
          stripe_payment_intent_id: input.stripePaymentIntentId ?? null,
          amount_total: input.amountTotal ?? null,
          currency: input.currency ?? null,
          test_mode: input.testMode,
        },
        confidence: 1,
        observed_at: observedAt,
      })
      .select("id")
      .single();

    if (createdEvidence.error) {
      throw new Error(`Failed to record payment evidence: ${createdEvidence.error.message}`);
    }
    evidenceId = asId(createdEvidence.data, "Created evidence");
  }

  if (!outcomeId) {
    const amount = moneyMajor(input.amountTotal);
    const createdOutcome = await admin
      .from("intelligence_outcomes")
      .insert({
        studio_id: input.studioId,
        intervention_id: input.interventionId,
        baseline_value: 0,
        observed_value: amount,
        delta: amount,
        measurement_period_start: period,
        measurement_period_end: period,
        source_type: "stripe",
        source_ref: input.stripeEventId,
        classification: "observed",
        confidence: 1,
        observed_at: observedAt,
        payload: {
          correlation_id: input.correlationId,
          stripe_session_id: input.stripeSessionId,
          stripe_payment_intent_id: input.stripePaymentIntentId ?? null,
          amount_total: input.amountTotal ?? null,
          currency: input.currency ?? null,
          test_mode: input.testMode,
          commercial_value_excluded: input.testMode,
        },
        value_classification: input.testMode ? null : "captured_upside",
      })
      .select("id")
      .single();

    if (createdOutcome.error) {
      throw new Error(`Failed to record deposit outcome: ${createdOutcome.error.message}`);
    }
    outcomeId = asId(createdOutcome.data, "Created outcome");
  }

  const existingAttribution = await admin
    .from("intelligence_attributions")
    .select("id")
    .eq("outcome_id", outcomeId)
    .limit(1)
    .maybeSingle();

  if (existingAttribution.error) {
    throw new Error(`Failed to check deposit attribution: ${existingAttribution.error.message}`);
  }

  let attributionId = existingAttribution.data
    ? asId(existingAttribution.data, "Existing attribution")
    : null;

  if (!attributionId) {
    const commercialValue = input.testMode ? 0 : moneyMajor(input.amountTotal);
    const commercialPence = input.testMode ? 0 : input.amountTotal ?? 0;

    const createdAttribution = await admin
      .from("intelligence_attributions")
      .insert({
        studio_id: input.studioId,
        intervention_id: input.interventionId,
        outcome_id: outcomeId,
        attribution_method: "manual_analyst_assessment",
        attribution_confidence: 1,
        attributed_value: commercialValue,
        attributed_value_pence: commercialPence,
        confounders: input.testMode ? ["sandbox_transaction"] : [],
        evidence_ids: [evidenceId],
        rationale: input.testMode
          ? "TEST ONLY — direct ID correlation is proven, but sandbox money is excluded from commercial revenue."
          : "Stripe provider IDs and INKSIGHTS journey metadata directly correlate the payment to this intervention.",
      })
      .select("id")
      .single();

    if (createdAttribution.error) {
      throw new Error(`Failed to record deposit attribution: ${createdAttribution.error.message}`);
    }
    attributionId = asId(createdAttribution.data, "Created attribution");
  }

  await recordIntegrationEvent({
    eventType: "outcome.recorded",
    sourceSystem: "inksights",
    sourceEventId: input.stripeEventId,
    idempotencyKey: stripeEventKey(input.stripeEventId, "outcome.recorded"),
    correlationId: input.correlationId,
    studioId: input.studioId,
    contactRef: input.contactRef ?? null,
    opportunityRef: input.opportunityRef ?? null,
    interventionId: input.interventionId,
    payload: { outcome_id: outcomeId, test_mode: input.testMode },
  });

  await recordIntegrationEvent({
    eventType: "attribution.calculated",
    sourceSystem: "inksights",
    sourceEventId: input.stripeEventId,
    idempotencyKey: stripeEventKey(input.stripeEventId, "attribution.calculated"),
    correlationId: input.correlationId,
    studioId: input.studioId,
    contactRef: input.contactRef ?? null,
    opportunityRef: input.opportunityRef ?? null,
    interventionId: input.interventionId,
    payload: { attribution_id: attributionId, outcome_id: outcomeId, test_mode: input.testMode },
  });

  return { evidenceId, outcomeId, attributionId };
}
