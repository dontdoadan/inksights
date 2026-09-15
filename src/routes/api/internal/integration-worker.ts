import { createFileRoute } from "@tanstack/react-router";
import { authenticateCronRequest } from "@/integrations/supabase/cron-auth";
import {
  payloadString,
  upsertDeal,
  upsertLeadOrCustomer,
} from "@/lib/integrations/hubspot.server";

interface RpcClient {
  rpc(
    name: string,
    args: Record<string, unknown>,
  ): Promise<{ data: unknown; error: { message: string } | null }>;
}

interface OutboxRow {
  id: string;
  event_type: "hubspot.crm_upsert" | "hubspot.payment_reconcile" | string;
  aggregate_type: string;
  aggregate_id: string;
  payload: Record<string, unknown>;
  attempt_count: number;
}

interface ExternalLink {
  external_object_id: string;
  link_status: string;
}

export const Route = createFileRoute("/api/internal/integration-worker")({
  server: {
    handlers: {
      POST: async ({ request }) => {
        const authFailure = await authenticateCronRequest(request);
        if (authFailure) return authFailure;

        const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
        const admin = supabaseAdmin as unknown as RpcClient;

        if (!process.env["HUBSPOT_ACCESS_TOKEN"]) {
          await heartbeat(admin, "degraded", "HubSpot runtime credential is not configured");
          return jsonResponse({ ok: false, gate: "hubspot_runtime_credential" }, 503);
        }

        const { data, error } = await admin.rpc("integration_claim_outbox", {
          p_provider_key: "hubspot",
          p_environment: "production",
          p_limit: 25,
        });
        if (error) {
          await heartbeat(admin, "degraded", error.message);
          return jsonResponse({ ok: false, error: "Unable to claim integration work" }, 500);
        }

        const rows = Array.isArray(data) ? (data as OutboxRow[]) : [];
        const summary = { claimed: rows.length, succeeded: 0, blocked: 0, failed: 0, dead: 0 };

        for (const row of rows) {
          try {
            const outcome = await processOutboxRow(admin, row);
            if (outcome === "blocked") summary.blocked += 1;
            else summary.succeeded += 1;
          } catch (cause) {
            const message = cause instanceof Error ? cause.message : String(cause);
            const conflict = /conflict:/i.test(message);
            const dead = conflict || row.attempt_count >= 5;
            const status = dead ? (conflict ? "blocked" : "dead") : "failed";
            const retryAt = dead ? null : nextRetryIso(row.attempt_count);

            await finishOutbox(admin, row.id, status, message, retryAt);
            await recordFailure(admin, row, message, conflict ? "data_conflict" : "provider_error", !dead);
            if (status === "blocked") summary.blocked += 1;
            else if (status === "dead") summary.dead += 1;
            else summary.failed += 1;
          }
        }

        const degraded = summary.blocked > 0 || summary.failed > 0 || summary.dead > 0;
        await heartbeat(
          admin,
          degraded ? "degraded" : "active",
          degraded ? "One or more HubSpot integration items require attention" : null,
        );

        return jsonResponse({ ok: !degraded, ...summary }, degraded ? 207 : 200);
      },
    },
  },
});

async function processOutboxRow(admin: RpcClient, row: OutboxRow) {
  if (row.event_type === "hubspot.crm_upsert") {
    const payload = row.payload ?? {};
    const email = payloadString(payload, "email");
    if (!email) throw new Error("HubSpot CRM upsert requires email");

    const result = await upsertLeadOrCustomer({
      email,
      name: payloadString(payload, "name", "contact_name"),
      studioName: payloadString(payload, "studio_name"),
      website: payloadString(payload, "website", "website_url"),
      phone: payloadString(payload, "phone"),
      lifecycleStage: "lead",
    });

    await upsertLink(admin, row, "contact", result.contactId, {
      sync_status: "synced",
      company_sync_status: result.companySyncStatus,
    });
    if (result.companyId) {
      await upsertLink(admin, row, "company", result.companyId, { sync_status: "synced" });
    }
    await finishOutbox(admin, row.id, "succeeded", null, null);
    return "succeeded" as const;
  }

  if (row.event_type === "hubspot.payment_reconcile") {
    const payload = row.payload ?? {};
    const email = payloadString(payload, "customer_email");
    if (email) {
      const contact = await upsertLeadOrCustomer({
        email,
        name: null,
        studioName: null,
        website: null,
        phone: null,
        lifecycleStage: "customer",
      });
      await upsertLink(admin, row, "contact", contact.contactId, {
        sync_status: "payment_reconciled",
      });
    }

    const pipelineId = process.env["HUBSPOT_INKSIGHTS_PIPELINE_ID"];
    const paidStageId = process.env["HUBSPOT_INKSIGHTS_PAID_STAGE_ID"];
    if (!pipelineId || !paidStageId) {
      const reason = "INKSIGHTS HubSpot deal pipeline/stage is not configured; payment contact state was reconciled but deal sync is approval-gated";
      await finishOutbox(admin, row.id, "blocked", reason, null);
      await recordFailure(admin, row, reason, "approval_gate", false);
      return "blocked" as const;
    }

    const existing = await getLink(admin, row, "deal");
    const amountMinor = typeof payload.amount_total === "number" ? payload.amount_total : null;
    const offerSlug = payloadString(payload, "offer_slug") ?? "INKSIGHTS order";
    const dealId = await upsertDeal({
      existingDealId: existing?.external_object_id ?? null,
      dealName: `INKSIGHTS — ${offerSlug} — ${row.aggregate_id}`,
      pipelineId,
      stageId: paidStageId,
      amount: amountMinor == null ? null : amountMinor / 100,
      currency: payloadString(payload, "currency"),
    });
    await upsertLink(admin, row, "deal", dealId, { sync_status: "payment_reconciled" });
    await finishOutbox(admin, row.id, "succeeded", null, null);
    return "succeeded" as const;
  }

  await finishOutbox(admin, row.id, "ignored", `Unsupported event type: ${row.event_type}`, null);
  return "succeeded" as const;
}

async function upsertLink(
  admin: RpcClient,
  row: OutboxRow,
  externalObjectType: string,
  externalObjectId: string,
  metadata: Record<string, unknown>,
) {
  const { error } = await admin.rpc("integration_upsert_external_link", {
    p_provider_key: "hubspot",
    p_environment: "production",
    p_canonical_entity_type: row.aggregate_type,
    p_canonical_entity_id: row.aggregate_id,
    p_external_object_type: externalObjectType,
    p_external_object_id: externalObjectId,
    p_metadata: metadata,
  });
  if (error) throw new Error(`Failed to write HubSpot external link: ${error.message}`);
}

async function getLink(admin: RpcClient, row: OutboxRow, externalObjectType: string) {
  const { data, error } = await admin.rpc("integration_get_external_link", {
    p_provider_key: "hubspot",
    p_environment: "production",
    p_canonical_entity_type: row.aggregate_type,
    p_canonical_entity_id: row.aggregate_id,
    p_external_object_type: externalObjectType,
  });
  if (error) throw new Error(`Failed to read HubSpot external link: ${error.message}`);
  return data && typeof data === "object" ? (data as ExternalLink) : null;
}

async function finishOutbox(
  admin: RpcClient,
  id: string,
  status: string,
  errorMessage: string | null,
  retryAt: string | null,
) {
  const { error } = await admin.rpc("integration_finish_outbox", {
    p_outbox_id: id,
    p_status: status,
    p_error: errorMessage,
    p_retry_at: retryAt,
  });
  if (error) throw new Error(`Failed to update integration outbox: ${error.message}`);
}

async function recordFailure(
  admin: RpcClient,
  row: OutboxRow,
  message: string,
  classification: string,
  retryable: boolean,
) {
  const { error } = await admin.rpc("integration_record_failure", {
    p_provider_key: "hubspot",
    p_environment: "production",
    p_operation: row.event_type,
    p_error_message: message,
    p_source_type: "integration_outbox",
    p_source_id: row.id,
    p_classification: classification,
    p_retryable: retryable,
    p_error_code: null,
    p_metadata: { aggregate_type: row.aggregate_type, aggregate_id: row.aggregate_id },
  });
  if (error) console.error("Failed to record integration failure", error.message);
}

async function heartbeat(admin: RpcClient, status: string, errorMessage: string | null) {
  const { error } = await admin.rpc("integration_provider_heartbeat", {
    p_provider_key: "hubspot",
    p_environment: "production",
    p_status: status,
    p_error_message: errorMessage,
  });
  if (error) console.error("Failed to update HubSpot integration heartbeat", error.message);
}

function nextRetryIso(attemptCount: number) {
  const attempt = Math.max(1, Math.floor(attemptCount || 1));
  const delayMinutes = Math.min(60, 2 ** (attempt - 1));
  return new Date(Date.now() + delayMinutes * 60_000).toISOString();
}

function jsonResponse(body: unknown, status: number) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { "content-type": "application/json", "cache-control": "no-store" },
  });
}
