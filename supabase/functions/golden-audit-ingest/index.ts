import "jsr:@supabase/functions-js/edge-runtime.d.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import { detectPotentialDuplicates, parseTransactionLedger } from "../_shared/audit/transactions.ts";
import { isServiceRoleAuthorization, validateSourceType, validateStoragePath, validateUuid } from "./security.ts";

const json = (body: unknown, status = 200) => new Response(JSON.stringify(body), {
  status,
  headers: { "content-type": "application/json; charset=utf-8", "cache-control": "no-store" },
});

async function sha256Hex(bytes: Uint8Array): Promise<string> {
  const digest = await crypto.subtle.digest("SHA-256", bytes);
  return Array.from(new Uint8Array(digest)).map((byte) => byte.toString(16).padStart(2, "0")).join("");
}

Deno.serve(async (req) => {
  if (req.method !== "POST") return json({ ok: false, error: "method_not_allowed" }, 405);
  if (!isServiceRoleAuthorization(req.headers.get("authorization"))) {
    return json({ ok: false, error: "service_role_required" }, 403);
  }

  const sb = createClient(
    Deno.env.get("SUPABASE_URL") ?? "",
    Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? Deno.env.get("SUPABASE_SECRET_KEY") ?? "",
  );

  let auditId = "";
  let runId: string | null = null;
  try {
    const body = await req.json();
    auditId = validateUuid(body.audit_id, "audit_id");
    const sourceType = validateSourceType(body.source_type);

    const audit = await sb.from("audits").select("id,studio_id,status").eq("id", auditId).maybeSingle();
    if (audit.error) throw new Error(`audit_lookup:${audit.error.message}`);
    if (!audit.data) return json({ ok: false, error: "audit_not_found" }, 404);

    const studioId = validateUuid(audit.data.studio_id, "studio_id");
    const storagePath = validateStoragePath(body.storage_path, studioId, auditId);

    const run = await sb.from("audit_runs").insert({
      audit_id: auditId,
      engine_key: "transaction_ingest",
      status: "started",
      input_summary: { source_type: sourceType, storage_path: storagePath },
    }).select("id").single();
    if (run.error) throw new Error(`run_insert:${run.error.message}`);
    runId = run.data.id;

    const downloaded = await sb.storage.from("audit-sources").download(storagePath);
    if (downloaded.error || !downloaded.data) throw new Error(`source_download:${downloaded.error?.message ?? "missing object"}`);
    const bytes = new Uint8Array(await downloaded.data.arrayBuffer());
    const sourceHash = await sha256Hex(bytes);

    const existing = await sb.from("audit_sources")
      .select("id")
      .eq("audit_id", auditId)
      .eq("source_hash", sourceHash)
      .eq("source_type", sourceType)
      .maybeSingle();
    if (existing.error) throw new Error(`idempotency_lookup:${existing.error.message}`);
    if (existing.data) {
      await sb.from("audit_runs").update({
        status: "success",
        completed_at: new Date().toISOString(),
        output_summary: { source_id: existing.data.id, idempotent: true },
      }).eq("id", runId);
      return json({ ok: true, source_id: existing.data.id, run_id: runId, idempotent: true });
    }

    const text = new TextDecoder("utf-8", { fatal: true }).decode(bytes);
    const parsed = await parseTransactionLedger(text);
    const duplicateKeys = detectPotentialDuplicates(parsed.rows);
    const rows = parsed.rows.map((row) => ({ ...row, potentialDuplicate: duplicateKeys.has(row.sourceRowKey) }));

    const persisted = await sb.rpc("persist_golden_audit_ledger", {
      p_audit_id: auditId,
      p_source_type: sourceType,
      p_source_name: storagePath.split("/").pop() ?? "ledger",
      p_storage_path: storagePath,
      p_source_hash: sourceHash,
      p_rows: rows,
      p_rejected: parsed.rejected,
      p_total_pence: parsed.totalPence,
      p_potential_duplicate_rows: duplicateKeys.size,
    });
    if (persisted.error) throw new Error(`persist:${persisted.error.message}`);

    const summary = typeof persisted.data === "object" && persisted.data ? persisted.data : {};
    await sb.from("audit_runs").update({
      status: "success",
      completed_at: new Date().toISOString(),
      output_summary: summary,
    }).eq("id", runId);

    return json({ ok: true, run_id: runId, ...summary });
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    console.error("golden-audit-ingest", message);
    if (runId) {
      await sb.from("audit_runs").update({
        status: "failed",
        completed_at: new Date().toISOString(),
        error_code: message.split(":", 1)[0],
        error_message: message.slice(0, 1000),
      }).eq("id", runId);
    }
    if (auditId) await sb.from("audits").update({ status: "failed" }).eq("id", auditId);
    return json({ ok: false, error: "ingest_failed" }, 500);
  }
});
