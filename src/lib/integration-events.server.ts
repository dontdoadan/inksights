import { supabaseAdmin } from "@/integrations/supabase/client.server";

export const INTEGRATION_EVENT_TYPES = [
  "lead.created","lead.updated","lead.qualified","lead.disqualified",
  "message.sent","message.delivered","message.failed","message.replied",
  "consultation.booked","consultation.completed",
  "deposit.requested","deposit.paid","deposit.failed",
  "booking.created","booking.cancelled","appointment.completed",
  "intervention.started","intervention.paused","intervention.completed",
  "outcome.recorded","attribution.calculated",
  "workflow.failed","workflow.retried","workflow.escalated",
] as const;

export type IntegrationEventType = (typeof INTEGRATION_EVENT_TYPES)[number];

export type IntegrationEventInput = {
  eventType: IntegrationEventType;
  occurredAt?: string;
  sourceSystem: string;
  sourceEventId?: string | null;
  idempotencyKey: string;
  correlationId: string;
  studioId?: string | null;
  contactRef?: string | null;
  opportunityRef?: string | null;
  interventionId?: string | null;
  payload?: Record<string, unknown>;
};

type RpcError = { message: string } | null;
type IntegrationEventRpcClient = {
  rpc: (
    fn: string,
    args: Record<string, unknown>,
  ) => Promise<{ data: unknown; error: RpcError }>;
};

export async function recordIntegrationEvent(input: IntegrationEventInput) {
  // The generated client types currently lag the wider intelligence schema.
  // Keep this cast narrow to the reviewed service-only RPC instead of weakening the global client type.
  const rpcClient = supabaseAdmin as unknown as IntegrationEventRpcClient;
  const { data, error } = await rpcClient.rpc("record_integration_event", {
    p_event_type: input.eventType,
    p_occurred_at: input.occurredAt ?? new Date().toISOString(),
    p_source_system: input.sourceSystem,
    p_idempotency_key: input.idempotencyKey,
    p_correlation_id: input.correlationId,
    p_source_event_id: input.sourceEventId ?? null,
    p_studio_id: input.studioId ?? null,
    p_contact_ref: input.contactRef ?? null,
    p_opportunity_ref: input.opportunityRef ?? null,
    p_intervention_id: input.interventionId ?? null,
    p_payload: input.payload ?? {},
  });

  if (error) throw new Error(`Failed to record integration event: ${error.message}`);
  return data;
}

export function stripeEventKey(stripeEventId: string, eventType: IntegrationEventType) {
  return `stripe:${stripeEventId}:${eventType}`;
}
