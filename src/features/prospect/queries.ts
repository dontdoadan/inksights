import { supabase } from "@/integrations/supabase/client";
import { loadAuditBundle } from "@/features/audit/queries";
import type { Audit, AuditBundle, Studio } from "@/features/audit/types";
import type { Database } from "@/integrations/supabase/types";

type ProspectMetricRow = Pick<Database["public"]["Tables"]["audit_metrics"]["Row"], "audit_id" | "value_numeric" | "confidence" | "provenance">;
type ProspectSnapshotRow = Pick<Database["public"]["Tables"]["audit_runs"]["Row"], "audit_id" | "status">;

export type ProspectListItem = {
  audit: Audit;
  studio?: Studio;
  score: number | null;
  priority: string;
  confidence: string;
  snapshotReady: boolean;
};

export type ProspectScanInput = {
  studio_name?: string;
  website?: string;
  address?: string;
  postcode?: string;
  town?: string;
  gbp_url?: string;
  contact_name?: string;
  contact_email?: string;
  force_new?: boolean;
};

type InternalResponse<T> = T & { ok?: boolean; error?: string };

async function accessToken() {
  const { data, error } = await supabase.auth.getSession();
  if (error || !data.session?.access_token) throw new Error("Authentication required");
  return data.session.access_token;
}

async function internalAction<T>(payload: Record<string, unknown>): Promise<T> {
  const token = await accessToken();
  const response = await fetch("/api/internal/prospect-intelligence", {
    method: "POST",
    headers: {
      "content-type": "application/json",
      authorization: `Bearer ${token}`,
    },
    body: JSON.stringify(payload),
  });
  const data = await response.json() as InternalResponse<T>;
  if (!response.ok || data.ok === false) throw new Error(data.error || "Prospect Intelligence request failed");
  return data as T;
}

export async function loadProspects(): Promise<ProspectListItem[]> {
  const [{ data: audits, error: auditError }, { data: metrics, error: metricError }, { data: snapshots, error: snapshotError }] = await Promise.all([
    supabase
      .from("audits")
      .select("*")
      .eq("audit_type", "prospect_intelligence")
      .order("created_at", { ascending: false }),
    supabase
      .from("audit_metrics")
      .select("audit_id,value_numeric,confidence,provenance")
      .eq("metric_key", "prospect_acquisition_score"),
    supabase
      .from("audit_runs")
      .select("audit_id,status")
      .eq("engine_key", "prospect_snapshot")
      .eq("status", "success"),
  ]);
  if (auditError) throw auditError;
  if (metricError) throw metricError;
  if (snapshotError) throw snapshotError;

  const typedAudits = (audits ?? []) as Audit[];
  const studioIds = [...new Set(typedAudits.map((audit) => audit.studio_id))];
  const { data: studios, error: studioError } = studioIds.length
    ? await supabase.from("studios").select("*").in("id", studioIds)
    : { data: [], error: null };
  if (studioError) throw studioError;

  const byStudio = new Map(((studios ?? []) as Studio[]).map((studio) => [studio.id, studio]));
  const byMetric = new Map(
    ((metrics ?? []) as ProspectMetricRow[]).map((metric) => [metric.audit_id, metric]),
  );
  const snapshotIds = new Set(
    ((snapshots ?? []) as ProspectSnapshotRow[]).map((row) => row.audit_id),
  );

  return typedAudits.map((audit) => {
    const metric = byMetric.get(audit.id);
    const provenance = metric?.provenance && typeof metric.provenance === "object" ? metric.provenance : {};
    return {
      audit,
      studio: byStudio.get(audit.studio_id),
      score: typeof metric?.value_numeric === "number" ? metric.value_numeric : metric?.value_numeric != null ? Number(metric.value_numeric) : null,
      priority: String(provenance.priority ?? "PENDING"),
      confidence: String(metric?.confidence ?? "—"),
      snapshotReady: snapshotIds.has(audit.id),
    };
  });
}

export function loadProspectBundle(auditId: string): Promise<AuditBundle> {
  return loadAuditBundle(auditId);
}

export async function runProspectScan(input: ProspectScanInput) {
  return internalAction<{
    ok: true;
    reused: boolean;
    auditId?: string;
    audit?: { id: string };
    score?: { value: number; priority: string; confidence: string };
  }>({ action: "scan", ...input });
}

export async function publishProspectSnapshot(auditId: string) {
  return internalAction<{
    ok: true;
    auditId: string;
    snapshotPath: string;
    snapshot: unknown;
  }>({ action: "publish_snapshot", audit_id: auditId });
}

export async function handoffProspectToCrm(auditId: string, contactName: string, contactEmail: string, phone = "") {
  return internalAction<{
    ok: true;
    auditId: string;
    hubspot: {
      ok?: boolean;
      already_synced?: boolean;
      contact_id?: string;
      company_id?: string | null;
      deal_id?: string;
    };
  }>({
    action: "crm_handoff",
    audit_id: auditId,
    contact_name: contactName,
    contact_email: contactEmail,
    phone,
  });
}
