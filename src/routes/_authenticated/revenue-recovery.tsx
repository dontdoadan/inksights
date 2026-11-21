import { Logo } from "@/components/public-site";
import { supabase } from "@/integrations/supabase/client";
import {
  buildRecoveryCandidates,
  normalizeCsvRows,
  recoveryLabel,
  sha256,
  type RecoveryCategory,
  type RecoveryRecordType,
} from "@/lib/revenue-recovery";
import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import {
  Activity, ArrowDownToLine, ArrowLeft, Check,
  CircleAlert, Clock3, FileSpreadsheet, LoaderCircle, LockKeyhole,
  MessageSquareText, RefreshCw, ShieldCheck, Sparkles, Upload, Users,
  Wallet, X,
} from "lucide-react";
import { useCallback, useEffect, useMemo, useState } from "react";

type Studio = { id: string; name: string };
type Membership = { studio_id: string; role: string };
type RecoveryRecord = {
  id: string; studio_id: string; record_type: RecoveryRecordType; occurred_at: string | null;
  amount_pence: number | null; data: Record<string, unknown>; client_name: string;
  client_email: string | null; client_phone: string | null;
};
type Opportunity = {
  id: string; studio_id: string; record_id: string; category: RecoveryCategory;
  priority: "high" | "medium" | "low"; status: string; estimated_value_pence: number;
  confidence_score: number; evidence: Record<string, any>; recommendation: string;
  draft_subject: string | null; draft_message: string | null; recovered_amount_pence: number;
  created_at: string;
};
type Draft = { subject: string; message: string };
type ImportRow = {
  id: string; file_name: string; record_type: RecoveryRecordType; row_count: number;
  inserted_count: number; duplicate_count: number; created_at: string;
};

const db = supabase as any;
const money = (pence: number) => new Intl.NumberFormat("en-GB", {
  style: "currency", currency: "GBP", maximumFractionDigits: 0,
}).format((pence || 0) / 100);
const date = (value: string) => new Date(value).toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric" });
const statusLabel: Record<string, string> = {
  identified: "Identified", reviewed: "Reviewed", approved: "Approved",
  contacted: "Contacted", booked: "Booked", paid: "Recovered", dismissed: "Dismissed",
};

export const Route = createFileRoute("/_authenticated/revenue-recovery")({
  component: RevenueRecovery,
  head: () => ({
    meta: [
      { title: "Revenue Recovery — INKSIGHTS" },
      { name: "description", content: "Find and recover missed revenue from existing tattoo studio clients, projects and enquiries." },
    ],
  }),
});

function RevenueRecovery() {
  const navigate = useNavigate();
  const [userId, setUserId] = useState("");
  const [studios, setStudios] = useState<Studio[]>([]);
  const [studioId, setStudioId] = useState("");
  const [role, setRole] = useState("");
  const [records, setRecords] = useState<RecoveryRecord[]>([]);
  const [opportunities, setOpportunities] = useState<Opportunity[]>([]);
  const [imports, setImports] = useState<ImportRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [busy, setBusy] = useState(false);
  const [notice, setNotice] = useState("");
  const [error, setError] = useState("");
  const [recordType, setRecordType] = useState<RecoveryRecordType>("clients");
  const [filter, setFilter] = useState("open");
  const [drafts, setDrafts] = useState<Record<string, Draft>>({});
  const [drafting, setDrafting] = useState<string | null>(null);
  const [recoveredAmounts, setRecoveredAmounts] = useState<Record<string, string>>({});

  const loadStudioData = useCallback(async (id: string) => {
    if (!id) return;
    const [recordResult, opportunityResult, importResult] = await Promise.all([
      db.from("recovery_records").select("id,studio_id,record_type,occurred_at,amount_pence,data,client_name,client_email,client_phone").eq("studio_id", id).order("created_at", { ascending: false }).limit(5000),
      db.from("recovery_opportunities").select("*").eq("studio_id", id).order("created_at", { ascending: false }).limit(2000),
      db.from("recovery_imports").select("id,file_name,record_type,row_count,inserted_count,duplicate_count,created_at").eq("studio_id", id).order("created_at", { ascending: false }).limit(30),
    ]);
    if (recordResult.error) throw recordResult.error;
    if (opportunityResult.error) throw opportunityResult.error;
    if (importResult.error) throw importResult.error;
    setRecords((recordResult.data ?? []) as RecoveryRecord[]);
    setOpportunities((opportunityResult.data ?? []) as Opportunity[]);
    setImports((importResult.data ?? []) as ImportRow[]);
  }, []);

  const load = useCallback(async () => {
    setLoading(true); setError("");
    try {
      const { data, error: authError } = await supabase.auth.getUser();
      if (authError || !data.user) { await navigate({ to: "/auth", search: { next: "/revenue-recovery" } }); return; }
      setUserId(data.user.id);
      const { data: memberships, error: membershipError } = await db.from("studio_members")
        .select("studio_id,role").eq("user_id", data.user.id).eq("active", true);
      if (membershipError) throw membershipError;
      const memberRows = (memberships ?? []) as Membership[];
      if (!memberRows.length) { setStudios([]); setStudioId(""); return; }
      const { data: studioRows, error: studioError } = await db.from("studios")
        .select("id,name").in("id", memberRows.map((m) => m.studio_id));
      if (studioError) throw studioError;
      const available = (studioRows ?? []) as Studio[];
      setStudios(available);
      const selected = available.find((s) => s.id === studioId) ?? available[0];
      setStudioId(selected.id);
      setRole(memberRows.find((m) => m.studio_id === selected.id)?.role ?? "");
      await loadStudioData(selected.id);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Unable to load Revenue Recovery.");
    } finally { setLoading(false); }
  }, [loadStudioData, navigate, studioId]);

  useEffect(() => { void load(); }, [load]);

  function changeStudio(id: string) {
    setStudioId(id);
    setDrafts({});
  }

  async function logActivity(action: string, details: Record<string, unknown>, opportunityId?: string, importId?: string) {
    const { error: activityError } = await db.from("recovery_activities").insert({
      studio_id: studioId, opportunity_id: opportunityId ?? null, import_id: importId ?? null,
      actor_user_id: userId, action, details,
    });
    if (activityError) throw activityError;
  }

  async function importFile(file: File) {
    setBusy(true); setNotice(""); setError("");
    try {
      const content = await file.text();
      const normalized = normalizeCsvRows(content, recordType);
      const fingerprint = await sha256(content);
      const { data: existing, error: duplicateCheckError } = await db.from("recovery_imports")
        .select("id").eq("studio_id", studioId).eq("import_hash", fingerprint).maybeSingle();
      if (duplicateCheckError) throw duplicateCheckError;
      if (existing) { setNotice("This exact file has already been imported. No duplicate records were added."); return; }

      const { data: importData, error: importError } = await db.from("recovery_imports").insert({
        studio_id: studioId, uploaded_by: userId, file_name: file.name.slice(0, 255),
        record_type: recordType, import_hash: fingerprint, row_count: normalized.length,
      }).select("id").single();
      if (importError) throw importError;

      const rows = [];
      for (const item of normalized) {
        rows.push({
          studio_id: studioId, import_id: importData.id, record_type: item.record_type,
          dedupe_key: await sha256(item.dedupe_source), client_name: item.client_name,
          client_email: item.client_email, client_phone: item.client_phone,
          occurred_at: item.occurred_at, amount_pence: item.amount_pence, data: item.data,
        });
      }
      let inserted = 0;
      for (let i = 0; i < rows.length; i += 100) {
        const { data: added, error: rowsError } = await db.from("recovery_records")
          .upsert(rows.slice(i, i + 100), { onConflict: "studio_id,record_type,dedupe_key", ignoreDuplicates: true })
          .select("id");
        if (rowsError) throw rowsError;
        inserted += added?.length ?? 0;
      }
      const duplicateCount = normalized.length - inserted;
      const { error: updateError } = await db.from("recovery_imports").update({
        inserted_count: inserted, duplicate_count: duplicateCount,
      }).eq("id", importData.id);
      if (updateError) throw updateError;
      await logActivity("csv_import_completed", {
        file_name: file.name, record_type: recordType, rows: normalized.length,
        inserted, duplicates: duplicateCount,
      }, undefined, importData.id);
      await runAnalysis();
      await loadStudioData(studioId);
      setNotice(`Imported ${inserted} new ${recordType} record(s). ${duplicateCount} duplicate row(s) were skipped.`);
    } catch (e) {
      setError(e instanceof Error ? e.message : "The CSV import failed.");
    } finally { setBusy(false); }
  }

  async function runAnalysis() {
    const { data, error: recordError } = await db.from("recovery_records")
      .select("id,studio_id,record_type,occurred_at,amount_pence,data,client_name,client_email,client_phone")
      .eq("studio_id", studioId).limit(5000);
    if (recordError) throw recordError;
    const candidates = buildRecoveryCandidates((data ?? []) as RecoveryRecord[]);
    if (candidates.length) {
      const payload = candidates.map((candidate) => ({ ...candidate, studio_id: studioId }));
      const { error: opportunityError } = await db.from("recovery_opportunities")
        .upsert(payload, { onConflict: "studio_id,category,record_id", ignoreDuplicates: true });
      if (opportunityError) throw opportunityError;
    }
    await logActivity("recovery_analysis_completed", { records_analysed: data?.length ?? 0, opportunities_detected: candidates.length });
    return candidates.length;
  }

  async function analyseNow() {
    setBusy(true); setNotice(""); setError("");
    try {
      const count = await runAnalysis();
      await loadStudioData(studioId);
      setNotice(`Analysis complete. ${count} qualifying recovery opportunity/opportunities found. Existing opportunity statuses were preserved.`);
    } catch (e) { setError(e instanceof Error ? e.message : "Analysis failed."); }
    finally { setBusy(false); }
  }

  async function generateDraft(opportunity: Opportunity) {
    if (opportunity.evidence.contact_allowed !== true) return;
    setDrafting(opportunity.id); setError("");
    try {
      const { data, error: invokeError } = await supabase.functions.invoke("revenue-recovery-assist", {
        body: { studio_id: studioId, opportunity_id: opportunity.id },

      });
      if (invokeError || !data?.ok) throw new Error(data?.error ?? invokeError?.message ?? "AI drafting unavailable.");
      const draft = { subject: String(data.subject), message: String(data.message) };
      setDrafts((current) => ({ ...current, [opportunity.id]: draft }));
      const { error: saveError } = await db.from("recovery_opportunities")
        .update({ draft_subject: draft.subject, draft_message: draft.message, status: opportunity.status === "identified" ? "reviewed" : opportunity.status, updated_at: new Date().toISOString() })
        .eq("id", opportunity.id).eq("studio_id", studioId);
      if (saveError) throw saveError;
      await logActivity("ai_message_drafted", { model: data.model, category: opportunity.category }, opportunity.id);
      setNotice("AI message drafted. Review and edit it before approval. Nothing has been sent.");
      await loadStudioData(studioId);
    } catch (e) {
      setError(e instanceof Error ? e.message : "AI drafting failed.");
    } finally { setDrafting(null); }
  }

  async function approveDraft(opportunity: Opportunity) {
    const draft = drafts[opportunity.id] ?? (opportunity.draft_subject && opportunity.draft_message ? { subject: opportunity.draft_subject, message: opportunity.draft_message } : null);
    if (!draft || !draft.message.trim()) return;
    setBusy(true); setError("");
    try {
      const { error: updateError } = await db.from("recovery_opportunities").update({
        draft_subject: draft.subject.trim(), draft_message: draft.message.trim(),
        status: "approved", approved_by: userId, approved_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      }).eq("id", opportunity.id).eq("studio_id", studioId);
      if (updateError) throw updateError;
      await logActivity("message_approved", { subject: draft.subject.trim() }, opportunity.id);
      await loadStudioData(studioId);
      setNotice("Message approved and saved. It has not been sent.");
    } catch (e) { setError(e instanceof Error ? e.message : "Approval failed."); }
    finally { setBusy(false); }
  }

  async function copyApproved(opportunity: Opportunity) {
    if (!opportunity.draft_message) return;
    const content = [opportunity.draft_subject, opportunity.draft_message].filter(Boolean).join("\n\n");
    await navigator.clipboard.writeText(content);
    setNotice("Approved message copied. It has not been sent.");
  }

  async function changeStatus(opportunity: Opportunity, status: string) {
    setBusy(true); setError("");
    try {
      const patch: Record<string, unknown> = { status, updated_at: new Date().toISOString() };
      if (status === "contacted") patch.contacted_at = new Date().toISOString();
      if (status === "booked") patch.booked_at = new Date().toISOString();
      if (status === "paid") {
        const amount = Number(recoveredAmounts[opportunity.id] ?? "");
        if (!Number.isFinite(amount) || amount <= 0) throw new Error("Enter the actual recovered payment amount before marking this opportunity as recovered.");
        patch.recovered_amount_pence = Math.round(amount * 100);
      }
      const { error: updateError } = await db.from("recovery_opportunities").update(patch)
        .eq("id", opportunity.id).eq("studio_id", studioId);
      if (updateError) throw updateError;
      await logActivity(`opportunity_${status}`, { status, recovered_amount_pence: patch.recovered_amount_pence ?? null }, opportunity.id);
      await loadStudioData(studioId);
      setNotice(status === "paid" ? "Recovered revenue recorded from the actual amount entered." : `Opportunity marked as ${statusLabel[status] ?? status}.`);
    } catch (e) { setError(e instanceof Error ? e.message : "Unable to update opportunity."); }
    finally { setBusy(false); }
  }

  async function signOut() {
    await supabase.auth.signOut();
    await navigate({ to: "/" });
  }

  const recordMap = useMemo(() => new Map(records.map((record) => [record.id, record])), [records]);
  const visibleOpportunities = useMemo(() => opportunities
    .filter((item) => filter === "all" || (filter === "open" ? !["paid", "dismissed"].includes(item.status) : item.status === filter))
    .sort((a, b) => ({ high: 0, medium: 1, low: 2 }[a.priority] - { high: 0, medium: 1, low: 2 }[b.priority]) || b.estimated_value_pence - a.estimated_value_pence), [opportunities, filter]);
  const potential = opportunities.filter((item) => !["paid", "dismissed"].includes(item.status)).reduce((sum, item) => sum + item.estimated_value_pence, 0);
  const recovered = opportunities.filter((item) => item.status === "paid").reduce((sum, item) => sum + item.recovered_amount_pence, 0);
  const needsReview = opportunities.filter((item) => ["identified", "reviewed"].includes(item.status)).length;

  function downloadTemplate(type: RecoveryRecordType) {
    const templates: Record<RecoveryRecordType, string> = {
      clients: "name,email,phone,last_booking_date,average_booking_value_gbp,marketing_consent,do_not_contact\nAlex Example,alex@example.com,07123456789,2025-01-15,250,yes,no",
      projects: "client_name,email,phone,project_name,status,last_session_date,remaining_sessions,total_sessions,project_value_gbp,remaining_value_gbp,next_session_booked,contact_permission,do_not_contact\nAlex Example,alex@example.com,07123456789,Full sleeve,in progress,2025-08-01,3,6,1800,,no,yes,no",
      enquiries: "name,email,phone,enquiry_date,status,quoted_value_gbp,contact_permission,marketing_consent,do_not_contact\nAlex Example,alex@example.com,07123456789,2026-10-01,awaiting response,450,yes,no,no",
    };
    const blob = new Blob([templates[type]], { type: "text/csv;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const anchor = document.createElement("a");
    anchor.href = url; anchor.download = `inksights-${type}-template.csv`; anchor.click();
    URL.revokeObjectURL(url);
  }

  const activeStudio = studios.find((studio) => studio.id === studioId);
  const canManage = ["owner", "admin", "member"].includes(role);

  return (
    <div className="min-h-screen bg-ink-deep text-foreground">
      <header className="sticky top-0 z-40 border-b border-border/50 bg-ink-deep/85 backdrop-blur-xl">
        <div className="mx-auto flex max-w-7xl items-center justify-between gap-4 px-5 py-4 md:px-8">
          <Link to="/" className="flex items-center gap-2.5"><Logo /></Link>
          <nav className="flex items-center gap-3 text-xs sm:gap-5 sm:text-sm">
            <Link to="/dashboard" className="text-muted-foreground hover:text-mint">Dashboard</Link>
            <Link to="/workspace" className="text-muted-foreground hover:text-mint">Workspace</Link>
            <span className="hidden text-muted-foreground sm:inline">{activeStudio?.name ?? "Studio account"}</span>
            <button onClick={signOut} className="rounded-full border border-border px-3 py-2 hover:border-mint hover:text-mint">Sign out</button>
          </nav>
        </div>
      </header>

      <main className="mx-auto max-w-7xl space-y-8 px-5 py-9 md:px-8 md:py-12">
        <div className="flex flex-col justify-between gap-5 lg:flex-row lg:items-end">
          <div>
            <Link to="/dashboard" className="mb-4 inline-flex items-center gap-2 text-xs text-muted-foreground hover:text-mint"><ArrowLeft size={14}/> Studio dashboard</Link>
            <p className="text-xs font-bold uppercase tracking-[0.22em] text-mint">INKSIGHTS / INTELLIGENCE PRODUCT</p>
            <h1 className="mt-3 font-display text-4xl font-black tracking-tight md:text-5xl">Revenue Recovery</h1>
            <p className="mt-3 max-w-2xl text-sm leading-6 text-muted-foreground md:text-base">Find missed revenue in existing client relationships, inactive projects and unconverted enquiries. Review every finding before taking action.</p>
          </div>
          <div className="flex flex-wrap items-center gap-3">
            {studios.length > 1 && <select value={studioId} onChange={(e) => void changeStudio(e.target.value)} className="rounded-full border border-border bg-ink-elev px-4 py-2.5 text-sm text-ice">{studios.map((s) => <option key={s.id} value={s.id}>{s.name}</option>)}</select>}
            <button onClick={() => void analyseNow()} disabled={busy || loading || !studioId || !canManage} className="inline-flex items-center gap-2 rounded-full bg-mint px-5 py-3 text-sm font-bold text-ink-deep transition hover:brightness-110 disabled:opacity-50"><RefreshCw size={16} className={busy ? "animate-spin" : ""}/> Run analysis</button>
          </div>
        </div>

        {error && <div role="alert" className="flex items-start gap-3 rounded-xl border border-red-400/30 bg-red-400/10 p-4 text-sm text-red-200"><CircleAlert size={18} className="mt-0.5 shrink-0"/><span>{error}</span><button onClick={() => setError("")} className="ml-auto"><X size={16}/></button></div>}
        {notice && <div role="status" className="flex items-start gap-3 rounded-xl border border-mint/30 bg-mint/10 p-4 text-sm text-mint"><Check size={18} className="mt-0.5 shrink-0"/><span>{notice}</span><button onClick={() => setNotice("")} className="ml-auto"><X size={16}/></button></div>}

        {loading ? <div className="flex items-center gap-3 rounded-2xl border border-border/60 p-8 text-muted-foreground"><LoaderCircle className="animate-spin"/> Loading studio recovery data…</div>
        : !studios.length ? (
          <div className="rounded-2xl border border-border/60 bg-ink-elev/40 p-10 text-center">
            <LockKeyhole size={30} className="mx-auto text-mint"/>
            <h2 className="mt-4 font-display text-2xl font-bold">Studio access required</h2>
            <p className="mx-auto mt-2 max-w-lg text-sm leading-6 text-muted-foreground">This account does not currently have an active INKSIGHTS studio membership. Ask your INKSIGHTS administrator to provision your studio workspace.</p>
            <Link to="/contact" className="mt-5 inline-flex rounded-full bg-mint px-5 py-3 text-sm font-bold text-ink-deep">Contact INKSIGHTS</Link>
          </div>
        ) : (
          <>
            <section className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
              <Metric icon={<Wallet size={18}/>} label="Estimated open opportunity" value={money(potential)} note="Unpaid, non-dismissed estimates"/>
              <Metric icon={<Activity size={18}/>} label="Verified recovered revenue" value={money(recovered)} note="Only amounts marked paid"/>
              <Metric icon={<Clock3 size={18}/>} label="Awaiting review" value={String(needsReview)} note="Identified or reviewed opportunities"/>
              <Metric icon={<Users size={18}/>} label="Imported records" value={records.length.toLocaleString("en-GB")} note="Across clients, projects and enquiries"/>
            </section>

            <section className="grid gap-5 xl:grid-cols-[1.1fr_.9fr]">
              <div className="rounded-2xl border border-border/60 bg-ink-elev/30 p-5 md:p-6">
                <div className="flex items-start justify-between gap-4">
                  <div><p className="text-xs font-bold uppercase tracking-[0.16em] text-mint">01 / Import studio data</p><h2 className="mt-2 font-display text-2xl font-bold">Bring your existing records</h2><p className="mt-2 max-w-xl text-sm leading-6 text-muted-foreground">Upload a CSV export. Files are processed in your browser; the original file is not retained. Imported records are stored securely against this studio.</p></div>
                  <FileSpreadsheet className="hidden text-mint sm:block" size={26}/>
                </div>
                <div className="mt-5 flex flex-col gap-3 sm:flex-row">
                  <select value={recordType} onChange={(e) => setRecordType(e.target.value as RecoveryRecordType)} className="rounded-xl border border-border bg-ink-deep px-4 py-3 text-sm text-ice">
                    <option value="clients">Client history</option><option value="projects">Multi-session projects</option><option value="enquiries">Enquiries</option>
                  </select>
                  <button onClick={() => downloadTemplate(recordType)} className="inline-flex items-center justify-center gap-2 rounded-xl border border-border px-4 py-3 text-sm font-semibold hover:border-mint hover:text-mint"><ArrowDownToLine size={16}/> Download CSV template</button>
                </div>
                <label className="mt-4 flex cursor-pointer flex-col items-center justify-center rounded-2xl border border-dashed border-border bg-ink-deep/60 px-5 py-9 text-center transition hover:border-mint/70">
                  <Upload size={24} className="text-mint"/>
                  <span className="mt-3 text-sm font-semibold">{busy ? "Processing…" : "Choose a CSV file to import"}</span>
                  <span className="mt-1 text-xs text-muted-foreground">Maximum 10,000 rows per file · CSV only</span>
                  <input type="file" accept=".csv,text/csv" className="sr-only" disabled={busy || !canManage} onChange={(e) => { const file = e.target.files?.[0]; if (file) void importFile(file); e.currentTarget.value = ""; }}/>
                </label>
                <div className="mt-4 flex items-start gap-2 text-xs leading-5 text-muted-foreground"><ShieldCheck size={15} className="mt-0.5 shrink-0 text-mint"/> Only import information you are authorised to process. Do not upload tattoo health-screening data, medical information or payment-card details. Reactivation requires marketing consent plus its date and source; project/enquiry follow-up requires contact permission plus its date and source (or documented marketing consent).</div>
              </div>

              <div className="rounded-2xl border border-border/60 bg-ink-elev/30 p-5 md:p-6">
                <p className="text-xs font-bold uppercase tracking-[0.16em] text-mint">02 / How the analysis works</p>
                <h2 className="mt-2 font-display text-2xl font-bold">Evidence before recommendations</h2>
                <div className="mt-5 space-y-4">
                  <Step number="01" title="Inactive projects" description="45+ days since last session, remaining sessions recorded and no next session booked."/>
                  <Step number="02" title="Unconverted enquiries" description="3+ days old and not marked as booked, converted, lost or closed."/>
                  <Step number="03" title="Inactive clients" description="180+ days since last booking, with explicit marketing consent and no opt-out."/>
                </div>
                <div className="mt-5 rounded-xl border border-mint/20 bg-mint/5 p-4 text-xs leading-5 text-muted-foreground">Financial estimates are based on imported values. Missing values are shown as £0 rather than invented. Existing opportunity statuses are preserved when analysis runs again.</div>
              </div>
            </section>

            <section className="rounded-2xl border border-border/60 bg-ink-elev/30 p-5 md:p-6">
              <div className="flex flex-col justify-between gap-3 sm:flex-row sm:items-end">
                <div><p className="text-xs font-bold uppercase tracking-[0.16em] text-mint">03 / Recovery queue</p><h2 className="mt-2 font-display text-2xl font-bold">Prioritised opportunities</h2><p className="mt-1 text-sm text-muted-foreground">Review the evidence, generate a message, then approve it. No message is sent from this screen.</p></div>
                <select value={filter} onChange={(e) => setFilter(e.target.value)} className="rounded-full border border-border bg-ink-deep px-4 py-2.5 text-sm text-ice">
                  <option value="open">Open opportunities</option><option value="all">All opportunities</option><option value="identified">Identified</option><option value="reviewed">Reviewed</option><option value="approved">Approved</option><option value="contacted">Contacted</option><option value="booked">Booked</option><option value="paid">Recovered</option><option value="dismissed">Dismissed</option>
                </select>
              </div>
              {!visibleOpportunities.length ? (
                <div className="mt-6 rounded-xl border border-dashed border-border p-8 text-center"><Sparkles size={24} className="mx-auto text-mint"/><p className="mt-3 font-semibold">No matching opportunities yet</p><p className="mt-1 text-sm text-muted-foreground">Import client, project or enquiry CSV files, then run analysis.</p></div>
              ) : (
                <div className="mt-5 space-y-4">
                  {visibleOpportunities.map((opportunity) => {
                    const record = recordMap.get(opportunity.record_id);
                    if (!record) return null;
                    const draft = drafts[opportunity.id] ?? (opportunity.draft_subject && opportunity.draft_message ? { subject: opportunity.draft_subject, message: opportunity.draft_message } : undefined);
                    const contactAllowed = opportunity.evidence.contact_allowed === true && opportunity.evidence.contact_available === true;
                    return (
                      <article key={opportunity.id} className="rounded-xl border border-border/70 bg-ink-deep/55 p-4 md:p-5">
                        <div className="flex flex-col justify-between gap-3 md:flex-row md:items-start">
                          <div className="min-w-0">
                            <div className="flex flex-wrap items-center gap-2">
                              <span className={`rounded-full px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider ${opportunity.priority === "high" ? "bg-amber-400/10 text-amber-300" : "bg-slate-400/10 text-slate-300"}`}>{opportunity.priority} priority</span>
                              <span className="rounded-full bg-mint/10 px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider text-mint">{statusLabel[opportunity.status] ?? opportunity.status}</span>
                              <span className="text-[10px] uppercase tracking-wider text-muted-foreground">{recoveryLabel(opportunity.category)}</span>
                            </div>
                            <h3 className="mt-3 truncate font-display text-xl font-bold">{record.client_name}</h3>
                            <p className="mt-1 text-xs text-muted-foreground">{record.client_email ?? record.client_phone ?? "No contact detail"}{record.occurred_at ? ` · ${date(record.occurred_at)}` : ""}</p>
                          </div>
                          <div className="shrink-0 md:text-right"><p className="font-display text-2xl font-black text-mint">{money(opportunity.estimated_value_pence)}</p><p className="text-[10px] uppercase tracking-wider text-muted-foreground">Estimated opportunity</p><p className="mt-1 text-[10px] text-muted-foreground">{Math.round(opportunity.confidence_score * 100)}% evidence confidence</p></div>
                        </div>
                        <p className="mt-4 text-sm leading-6 text-muted-foreground">{opportunity.recommendation}</p>
                        <div className="mt-4 grid gap-2 rounded-lg bg-ink-elev/60 p-3 text-xs sm:grid-cols-2">
                          {Object.entries(opportunity.evidence).filter(([key]) => !["contact_available", "contact_allowed"].includes(key)).map(([key, value]) => <div key={key}><span className="text-muted-foreground">{key.replace(/_/g, " ")}: </span><span className="font-semibold text-ice">{typeof value === "boolean" ? (value ? "Yes" : "No") : String(value ?? "Not supplied")}</span></div>)}
                        </div>
                        {draft && (
                          <div className="mt-4 space-y-3 rounded-xl border border-mint/20 bg-mint/5 p-3">
                            <p className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-mint"><MessageSquareText size={14}/> AI message draft — review before approval</p>
                            <label className="block text-xs text-muted-foreground">Subject<input value={draft.subject} onChange={(e) => setDrafts((current) => ({ ...current, [opportunity.id]: { ...draft, subject: e.target.value } }))} className="mt-1 w-full rounded-lg border border-border bg-ink-deep px-3 py-2 text-sm text-ice"/></label>
                            <label className="block text-xs text-muted-foreground">Message<textarea rows={5} value={draft.message} onChange={(e) => setDrafts((current) => ({ ...current, [opportunity.id]: { ...draft, message: e.target.value } }))} className="mt-1 w-full rounded-lg border border-border bg-ink-deep px-3 py-2 text-sm leading-6 text-ice"/></label>
                            <div className="flex flex-wrap gap-2">
                              <button onClick={() => void approveDraft(opportunity)} disabled={busy} className="rounded-full bg-mint px-4 py-2 text-xs font-bold text-ink-deep disabled:opacity-50">Approve message</button>
                              <button onClick={() => setDrafts((current) => { const next = { ...current }; delete next[opportunity.id]; return next; })} className="rounded-full border border-border px-4 py-2 text-xs font-semibold">Discard local edits</button>
                            </div>
                          </div>
                        )}
                        <div className="mt-4 flex flex-wrap items-center gap-2">
                          {!draft && !["dismissed", "paid"].includes(opportunity.status) && (
                            <button onClick={() => void generateDraft(opportunity)} disabled={!canManage || !contactAllowed || drafting === opportunity.id || busy} title={!contactAllowed ? "Contact permission is not recorded for this record." : "Generate a personalised AI draft"} className="inline-flex items-center gap-2 rounded-full border border-mint/50 px-4 py-2 text-xs font-bold text-mint hover:bg-mint/10 disabled:cursor-not-allowed disabled:opacity-40">
                              {drafting === opportunity.id ? <LoaderCircle size={14} className="animate-spin"/> : <Sparkles size={14}/>} Generate AI draft
                            </button>
                          )}
                          {opportunity.status === "approved" && <button onClick={() => void changeStatus(opportunity, "contacted")} disabled={busy} className="rounded-full border border-border px-4 py-2 text-xs font-semibold hover:border-mint">Mark contacted</button>}
                          {opportunity.status === "contacted" && <button onClick={() => void changeStatus(opportunity, "booked")} disabled={busy} className="rounded-full border border-border px-4 py-2 text-xs font-semibold hover:border-mint">Mark booked</button>}
                          {opportunity.status === "booked" && <div className="flex flex-wrap items-center gap-2"><input type="number" min="0.01" step="0.01" placeholder="Actual £ received" value={recoveredAmounts[opportunity.id] ?? ""} onChange={(e) => setRecoveredAmounts((current) => ({ ...current, [opportunity.id]: e.target.value }))} className="w-36 rounded-full border border-border bg-ink-elev px-3 py-2 text-xs text-ice"/><button onClick={() => void changeStatus(opportunity, "paid")} disabled={busy} className="rounded-full bg-mint px-4 py-2 text-xs font-bold text-ink-deep">Record recovered</button></div>}
                          {!["paid", "dismissed", "contacted", "booked"].includes(opportunity.status) && <button onClick={() => void changeStatus(opportunity, "dismissed")} disabled={busy} className="rounded-full border border-border px-4 py-2 text-xs text-muted-foreground hover:border-red-400/60 hover:text-red-300">Dismiss</button>}
                          {opportunity.status === "approved" && <><button onClick={() => void copyApproved(opportunity)} className="rounded-full border border-mint/50 px-4 py-2 text-xs font-semibold text-mint hover:bg-mint/10">Copy approved message</button><span className="text-[11px] text-muted-foreground">Approved only — sending remains manual.</span></>}
                          {!contactAllowed && <span className="text-[11px] text-amber-300">Contact permission not recorded; message generation blocked.</span>}
                        </div>
                      </article>
                    );
                  })}
                </div>
              )}
            </section>

            <section className="grid gap-5 lg:grid-cols-2">
              <div className="rounded-2xl border border-border/60 bg-ink-elev/30 p-5">
                <h2 className="font-display text-xl font-bold">Import history</h2>
                <div className="mt-4 space-y-3">
                  {!imports.length ? <p className="text-sm text-muted-foreground">No CSV files imported yet.</p> : imports.map((item) => <div key={item.id} className="flex items-center justify-between gap-3 border-b border-border/40 pb-3 last:border-0"><div className="min-w-0"><p className="truncate text-sm font-semibold">{item.file_name}</p><p className="text-xs text-muted-foreground">{item.record_type} · {date(item.created_at)}</p></div><div className="shrink-0 text-right text-xs"><p className="font-semibold text-mint">{item.inserted_count} added</p><p className="text-muted-foreground">{item.duplicate_count} skipped</p></div></div>)}
                </div>
              </div>
              <div className="rounded-2xl border border-border/60 bg-ink-elev/30 p-5">
                <h2 className="font-display text-xl font-bold">Recovery controls</h2>
                <div className="mt-4 space-y-3 text-sm leading-6 text-muted-foreground">
                  <p className="flex gap-2"><ShieldCheck size={16} className="mt-1 shrink-0 text-mint"/> Every studio's data is isolated using existing INKSIGHTS membership policies.</p>
                  <p className="flex gap-2"><LockKeyhole size={16} className="mt-1 shrink-0 text-mint"/> AI drafts contain no email address or phone number. Messages are never sent automatically.</p>
                  <p className="flex gap-2"><Activity size={16} className="mt-1 shrink-0 text-mint"/> Imports, analysis, approvals and recovery outcomes are recorded in the activity log.</p>
                  <p className="flex gap-2"><CircleAlert size={16} className="mt-1 shrink-0 text-mint"/> Estimates are not debts, booked revenue or guaranteed recoveries. Only a recorded paid amount counts as recovered revenue.</p>
                </div>
              </div>
            </section>
          </>
        )}
      </main>
    </div>
  );
}

function Metric({ icon, label, value, note }: { icon: React.ReactNode; label: string; value: string; note: string }) {
  return <div className="rounded-2xl border border-border/60 bg-ink-elev/30 p-5"><div className="flex items-center gap-2 text-mint">{icon}<span className="text-xs font-semibold text-muted-foreground">{label}</span></div><p className="mt-3 font-display text-3xl font-black">{value}</p><p className="mt-1 text-[11px] text-muted-foreground">{note}</p></div>;
}
function Step({ number, title, description }: { number: string; title: string; description: string }) {
  return <div className="flex gap-3"><span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-mint/10 text-xs font-bold text-mint">{number}</span><div><p className="text-sm font-semibold">{title}</p><p className="mt-1 text-xs leading-5 text-muted-foreground">{description}</p></div></div>;
}
