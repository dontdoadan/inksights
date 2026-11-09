import { createFileRoute } from "@tanstack/react-router";
import { useCallback, useEffect, useMemo, useState, type FormEvent } from "react";
import {
  Activity, ArrowLeft, ArrowRight, BadgeCheck, CheckCircle2, ClipboardCheck,
  Database, FileSearch, GitCompareArrows, LockKeyhole, RefreshCw, Search,
  ShieldCheck, TriangleAlert, XCircle,
} from "lucide-react";
import { Logo } from "@/components/public-site";
import { supabase } from "@/integrations/supabase/client";

type ReviewStatus = "unreviewed" | "needs_evidence" | "approved" | "rejected" | "all";
type Candidate = {
  name: string; postcode: string | null; town: string | null;
  website_url: string | null; companies_house_number: string | null;
  source_url: string | null; source_id: string | null; observed_at: string;
};
type Case = {
  candidate_id: string;
  review_status: string; visibility_rule: string; audit_rule: string;
  signal_strength: number; quality_flags: string[];
  alternative_visibility_matches: number;
  suggested_visibility_id: string | null; suggested_audit_id: string | null;
  refreshed_at: string; studio_candidates: Candidate;
};
type Stats = {
  queued: number; unreviewed: number; needs_evidence: number;
  approved: number; rejected: number; with_suggestion: number;
  registry_only: number; rule_version: string;
};
type ApiResponse<T> = T & { ok: boolean; error?: string };
const input = "w-full rounded-xl border border-white/15 bg-[#112c3c] px-4 py-3 text-sm text-white outline-none transition focus:border-[#5be7f2]";
const statuses: { value: ReviewStatus; label: string }[] = [
  { value: "unreviewed", label: "Awaiting review" },
  { value: "needs_evidence", label: "Needs evidence" },
  { value: "approved", label: "Reviewed matches" },
  { value: "rejected", label: "Rejected suggestions" },
  { value: "all", label: "All records" },
];
const format = (date: string) =>
  new Date(date).toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric" });

export const Route = createFileRoute("/_authenticated/studio-reconciliation")({
  ssr: false,
  component: StudioReconciliation,
  head: () => ({
    meta: [
      { title: "Studio Identity Reconciliation | INKSIGHTS" },
      { name: "robots", content: "noindex,nofollow,noarchive" },
    ],
  }),
});

function StudioReconciliation() {
  const [stats, setStats] = useState<Stats | null>(null);
  const [records, setRecords] = useState<Case[]>([]);
  const [statusFilter, setStatusFilter] = useState<ReviewStatus>("unreviewed");
  const [query, setQuery] = useState("");
  const [offset, setOffset] = useState(0);
  const [nextOffset, setNextOffset] = useState<number | null>(null);
  const [selected, setSelected] = useState<Case | null>(null);
  const [loading, setLoading] = useState(true);
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  async function call<T>(body: Record<string, unknown>): Promise<T> {
    const { data: auth, error: authError } = await supabase.auth.getSession();
    if (authError || !auth.session?.access_token) {
      throw new Error("Sign in as an INKSIGHTS administrator before opening the reconciliation workspace.");
    }
    const { data, error: apiError } = await supabase.functions.invoke("studio-reconciliation-admin", {
      body, headers: { Authorization: "Bearer " + auth.session.access_token },
    });
    if (apiError || !data?.ok) {
      throw new Error((data as ApiResponse<T> | null)?.error || apiError?.message ||
        "The reconciliation service is not available. The staged migration and gateway may not yet be deployed.");
    }
    return data as T;
  }

  const refreshPage = useCallback(async (filter: ReviewStatus, start: number) => {
    setLoading(true); setError("");
    try {
      const [summary, page] = await Promise.all([
        call<ApiResponse<{ stats: Stats }>>({ action: "summary" }),
        call<ApiResponse<{ cases: Case[]; next_offset: number | null }>>({
          action: "list", status: filter, offset: start,
        }),
      ]);
      setStats(summary.stats);
      setRecords(page.cases || []);
      setNextOffset(page.next_offset);
      setOffset(start);
      setSelected(prev => (page.cases || []).find(c => c.candidate_id === prev?.candidate_id) || null);
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : "The reconciliation workspace could not load.");
    } finally { setLoading(false); }
  }, []);

  useEffect(() => { void refreshPage(statusFilter, 0); }, [statusFilter, refreshPage]);
  const visible = useMemo(() => records.filter(c => {
    const needle = query.trim().toLowerCase();
    return !needle || [
      c.studio_candidates.name, c.studio_candidates.postcode,
      c.studio_candidates.town, c.studio_candidates.companies_house_number,
    ].some(value => (value || "").toLowerCase().includes(needle));
  }), [records, query]);

  async function buildQueue() {
    setBusy(true); setError(""); setMessage("");
    try {
      const result = await call<ApiResponse<{ result: { refreshed: number; version: string } }>>({
        action: "refresh",
      });
      setMessage("Suggestions refreshed for " + result.result.refreshed +
        " records. Existing reviewed decisions were preserved. No public listings or CRM records changed.");
      await refreshPage(statusFilter, 0);
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : "Queue refresh failed.");
    } finally { setBusy(false); }
  }

  async function submitReview(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!selected) return;
    const f = new FormData(event.currentTarget);
    const decision = String(f.get("decision") || "");
    setBusy(true); setError(""); setMessage("");
    try {
      await call<ApiResponse<{ result: unknown }>>({
        action: "review",
        candidate_id: selected.candidate_id,
        decision,
        visibility_studio_id: String(f.get("visibility_id") || "").trim() || null,
        audit_studio_id: selected.suggested_audit_id,
        reason: String(f.get("reason") || "").trim(),
        evidence_url: String(f.get("evidence_url") || "").trim() || null,
      });
      setMessage("Decision saved with its reviewer evidence. Approving a match does not verify a trading premises or publish an Atlas listing.");
      setSelected(null);
      await refreshPage(statusFilter, offset);
    } catch (cause) { setError(cause instanceof Error ? cause.message : "Review failed."); }
    finally { setBusy(false); }
  }

  return <main className="min-h-screen bg-[#071620] text-[#eff8fb]">
    <header className="border-b border-white/10 bg-[#091d2b]">
      <div className="mx-auto flex max-w-[1550px] items-center justify-between gap-4 px-5 py-5 lg:px-9">
        <a href="/" aria-label="INKSIGHTS home"><Logo /></a>
        <div className="hidden items-center gap-2 text-xs font-semibold uppercase tracking-[.16em] text-[#a1c2cb] md:flex">
          <span className="h-2 w-2 rounded-full bg-[#5be7f2]"/> Internal / Studio registry / Identity review
        </div>
        <a href="/workspace" className="inline-flex items-center gap-2 text-sm font-semibold text-[#95c9d7] hover:text-white">
          <ArrowLeft size={16}/> Workspace
        </a>
      </div>
    </header>
    <section className="border-b border-white/10 bg-[radial-gradient(ellipse_at_75%_0%,#184658_0%,#102a39_35%,#071620_85%)]">
      <div className="mx-auto max-w-[1550px] px-5 py-11 lg:px-9 lg:py-14">
        <p className="mb-4 flex items-center gap-2 text-xs font-bold uppercase tracking-[.19em] text-[#5be7f2]">
          <GitCompareArrows size={16}/> Studio Identity / Control Plane
        </p>
        <div className="flex flex-col justify-between gap-6 lg:flex-row lg:items-end">
          <div className="max-w-3xl">
            <h1 className="font-display text-4xl font-black tracking-tight md:text-6xl">
              One studio record.<br/><span className="text-[#5be7f2]">Evidence before identity.</span>
            </h1>
            <p className="mt-5 max-w-2xl text-sm leading-7 text-[#aac8d1] md:text-base">
              Review candidate businesses, compare their source evidence and approve identity links.
              Suggestions are calculated; trading premises and owner authority remain separately verified.
            </p>
          </div>
          <button onClick={buildQueue} disabled={busy} className="inline-flex shrink-0 items-center justify-center gap-2 rounded-xl bg-[#5be7f2] px-5 py-3.5 text-sm font-bold text-[#05212c] hover:bg-white disabled:opacity-50">
            <RefreshCw size={17}/>{busy ? "Processing…" : "Refresh suggestions"}
          </button>
        </div>
        <div className="mt-10 grid grid-cols-2 gap-3 lg:grid-cols-5">
          {[
            { label: "Queued candidates", value: stats?.queued, icon: Database },
            { label: "Suggested links", value: stats?.with_suggestion, icon: GitCompareArrows },
            { label: "Awaiting decision", value: stats?.unreviewed, icon: ClipboardCheck },
            { label: "Approved matches", value: stats?.approved, icon: BadgeCheck },
            { label: "Registry-only flags", value: stats?.registry_only, icon: TriangleAlert },
          ].map(card => <div key={card.label} className="rounded-2xl border border-white/10 bg-[#122c3a]/80 p-4">
            <card.icon size={18} className="mb-4 text-[#5be7f2]"/>
            <p className="font-display text-3xl font-extrabold tabular-nums">{card.value ?? "—"}</p>
            <p className="mt-2 text-xs text-[#9cbcc7]">{card.label}</p>
          </div>)}
        </div>
      </div>
    </section>

    <div className="mx-auto grid max-w-[1550px] gap-0 lg:grid-cols-[270px_minmax(0,1fr)]">
      <aside className="border-b border-white/10 bg-[#0a1e2b] p-5 lg:min-h-[820px] lg:border-b-0 lg:border-r lg:p-7">
        <p className="mb-5 text-xs font-bold uppercase tracking-[.2em] text-[#799eab]">Review status</p>
        <nav aria-label="Reconciliation status filters" className="grid gap-2">
          {statuses.map(s => <button key={s.value}
            onClick={() => { setStatusFilter(s.value); setQuery(""); setSelected(null); }}
            className={"flex justify-between rounded-xl px-4 py-3 text-left text-sm font-semibold transition " +
              (statusFilter === s.value ? "bg-[#19475a] text-[#e5fcff]" :
                "text-[#9dbbc6] hover:bg-white/5 hover:text-white")}>
            {s.label}
            {s.value !== "all" ? <span className="text-xs tabular-nums">
              {stats?.[s.value as keyof Stats] ?? "—"}
            </span> : null}
          </button>)}
        </nav>
        <div className="mt-9 space-y-4 border-t border-white/10 pt-7">
          <p className="text-xs font-bold uppercase tracking-[.18em] text-[#799eab]">Evidence rules</p>
          <p className="flex gap-2 text-xs leading-relaxed text-[#a7c4cf]"><FileSearch size={17} className="shrink-0 text-[#5be7f2]"/> Compare company numbers, domains, names and addresses. A score is a heuristic signal, not a probability.</p>
          <p className="flex gap-2 text-xs leading-relaxed text-[#a7c4cf]"><ShieldCheck size={17} className="shrink-0 text-[#5be7f2]"/> Human decisions require evidence. They never automatically publish a studio or contact a prospect.</p>
          <p className="flex gap-2 text-xs leading-relaxed text-[#a7c4cf]"><LockKeyhole size={17} className="shrink-0 text-[#5be7f2]"/> Administrator-only review; existing Supabase remains the source of truth.</p>
        </div>
      </aside>

      <section className="min-w-0 p-5 lg:p-8">
        <div className="mb-5 flex flex-col justify-between gap-3 sm:flex-row sm:items-center">
          <div>
            <p className="text-xs font-bold uppercase tracking-[.16em] text-[#5be7f2]">Candidate evidence queue</p>
            <h2 className="mt-2 font-display text-2xl font-bold">Review possible identities</h2>
          </div>
          <label className="relative block min-w-0 sm:w-72">
            <Search size={17} className="absolute left-4 top-1/2 -translate-y-1/2 text-[#6d9aa9]"/>
            <input value={query} onChange={e => setQuery(e.target.value)} className={input + " pl-11"}
              aria-label="Filter current page" placeholder="Filter the current 50 records"/>
          </label>
        </div>
        {message ? <p role="status" className="mb-5 rounded-xl border border-[#5be7f2]/40 bg-[#123d4b] p-4 text-sm text-white">{message}</p> : null}
        {error ? <p role="alert" className="mb-5 rounded-xl border border-rose-500/40 bg-rose-950/20 p-4 text-sm text-rose-200">{error}</p> : null}
        <div className="grid gap-6 xl:grid-cols-[minmax(0,1fr)_380px]">
          <div className="min-w-0 space-y-2">
            {loading ? <div className="rounded-2xl border border-white/10 bg-[#102a39] p-8 text-sm text-[#aac7d1]">Loading the registry queue…</div> : null}
            {!loading && !visible.length ? <div className="rounded-2xl border border-dashed border-[#4a6e7b] bg-[#102a39] p-8">
              <Database size={29} className="mb-4 text-[#5be7f2]"/>
              <h3 className="font-semibold">No records in this view</h3>
              <p className="mt-3 text-sm leading-relaxed text-[#aac7d1]">Refresh suggestions after the approved database migration is applied, or change your filter.</p>
            </div> : null}
            {visible.map(record => {
              const c = record.studio_candidates;
              return <button key={record.candidate_id} onClick={() => setSelected(record)}
                className={"w-full rounded-2xl border p-5 text-left transition " +
                  (record.candidate_id === selected?.candidate_id ?
                  "border-[#5be7f2]/80 bg-[#183b4d]" :
                  "border-white/10 bg-[#102735] hover:border-white/30")}>
                <div className="flex items-start justify-between gap-3">
                  <div><strong className="block font-semibold">{c.name}</strong>
                    <p className="mt-1 text-xs text-[#a3bfca]">{c.town || "Town not recorded"} · {c.postcode || "No postcode"}</p>
                  </div>
                  <span className="shrink-0 rounded-lg border border-[#5be7f2]/25 bg-[#5be7f2]/10 px-2.5 py-1 text-xs font-semibold tabular-nums text-[#5be7f2]">{record.signal_strength}/100</span>
                </div>
                <div className="mt-4 flex flex-wrap items-center gap-2 text-xs text-[#a9c7d0]">
                  <span className="rounded-md bg-white/5 px-2 py-1">{record.visibility_rule.replace(/_/g," ")}</span>
                  {(record.quality_flags || []).slice(0,2).map(flag =>
                    <span key={flag} className="rounded-md border border-amber-400/15 px-2 py-1 text-amber-100/75">{flag.replace(/_/g," ")}</span>)}
                  <ArrowRight size={15} className="ml-auto text-[#5be7f2]"/>
                </div>
              </button>;
            })}
            <div className="flex items-center justify-between pt-4 text-xs text-[#a1bdc7]">
              <span>Page {Math.floor(offset / 50) + 1} · 50 records maximum per page</span>
              <div className="flex gap-2">
                <button disabled={loading || offset === 0} onClick={() => void refreshPage(statusFilter, Math.max(0,offset-50))}
                  className="rounded-lg border border-white/20 px-4 py-2 disabled:opacity-40">Previous</button>
                <button disabled={loading || nextOffset == null} onClick={() => nextOffset != null && void refreshPage(statusFilter,nextOffset)}
                  className="rounded-lg border border-white/20 px-4 py-2 disabled:opacity-40">Next</button>
              </div>
            </div>
          </div>
          <aside className="min-w-0 self-start rounded-2xl border border-white/10 bg-[#102c3b] p-5 xl:sticky xl:top-6">
            {!selected ? <div className="py-10 text-center">
              <GitCompareArrows size={32} className="mx-auto text-[#5be7f2]"/>
              <h3 className="mt-4 text-lg font-bold">Select a candidate</h3>
              <p className="mt-2 text-sm leading-relaxed text-[#a4c1cb]">Inspect source identifiers and record a decision backed by independent evidence.</p>
            </div> : <div key={selected.candidate_id}>
              <div className="mb-5 flex items-center justify-between">
                <span className="text-xs font-bold uppercase tracking-[.16em] text-[#5be7f2]">Identity review</span>
                <button onClick={() => setSelected(null)} aria-label="Close review" className="text-[#a5bfcb]"><XCircle size={19}/></button>
              </div>
              <h3 className="font-display text-xl font-bold">{selected.studio_candidates.name}</h3>
              <dl className="mt-5 grid gap-4 border-b border-white/10 pb-5 text-xs">
                <div><dt className="text-[#87aab8]">Companies House number</dt><dd className="mt-1 break-all text-sm">{selected.studio_candidates.companies_house_number || "Not supplied"}</dd></div>
                <div><dt className="text-[#87aab8]">Source observed</dt><dd className="mt-1 text-sm">{format(selected.studio_candidates.observed_at)}</dd></div>
                <div><dt className="text-[#87aab8]">Proposed visibility match</dt><dd className="mt-1 break-all font-mono text-[11px]">{selected.suggested_visibility_id || "No supported suggestion"}</dd></div>
                <div><dt className="text-[#87aab8]">Proposed audit record</dt><dd className="mt-1 break-all font-mono text-[11px]">{selected.suggested_audit_id || "No supported suggestion"}</dd></div>
                {selected.studio_candidates.source_url ? <div>
                  <dt className="text-[#87aab8]">Source</dt>
                  <dd className="mt-1 break-words"><a href={selected.studio_candidates.source_url} target="_blank" rel="noreferrer" className="text-[#5be7f2] underline underline-offset-4">Open evidence source</a></dd>
                </div> : null}
              </dl>
              <form onSubmit={submitReview} className="mt-5 grid gap-3">
                <label className="text-xs font-semibold text-[#a8c8d2]">Decision<select name="decision" required className={input + " mt-2"}>
                  <option value="needs_evidence">Needs more evidence</option>
                  <option value="reject_suggestion">Reject the suggested match</option>
                  <option value="approve_visibility_match">Approve evidenced identity link</option>
                  <option value="reopen">Reopen a previously reviewed case</option>
                </select></label>
                <label className="text-xs text-[#a8c8d2]">Visibility studio ID (for approved match)
                  <input className={input+" mt-2 font-mono text-xs"} name="visibility_id"
                    defaultValue={selected.suggested_visibility_id || ""} placeholder="Existing studio UUID"/>
                </label>
                <label className="text-xs text-[#a8c8d2]">Independent evidence URL for approval
                  <input className={input+" mt-2"} name="evidence_url" type="url" placeholder="https://verified-source.co.uk"/>
                </label>
                <label className="text-xs text-[#a8c8d2]">Reviewer evidence and reasoning
                  <textarea className={input+" mt-2"} name="reason" rows={5} minLength={40} maxLength={2000}
                    required placeholder="Describe which identifiers agree, what was independently checked, and any conflicting evidence."/>
                </label>
                <button disabled={busy} className="mt-2 inline-flex items-center justify-center gap-2 rounded-xl bg-[#5be7f2] p-4 text-sm font-bold text-[#061f29] disabled:opacity-40">
                  <CheckCircle2 size={17}/>{busy ? "Saving decision…" : "Record evidence-led decision"}
                </button>
              </form>
              <p className="mt-4 flex gap-2 text-xs leading-relaxed text-[#97b8c3]"><ShieldCheck size={16} className="shrink-0 text-[#5be7f2]"/>This is a reviewed business identity link, not permission to advertise, edit or publish an Atlas studio.</p>
            </div>}
          </aside>
        </div>
      </section>
    </div>
    <footer className="border-t border-white/10 px-6 py-6 text-xs text-[#91b0bc]">
      <div className="mx-auto flex max-w-[1500px] flex-col gap-2 sm:flex-row sm:justify-between">
        <span>INKSIGHTS / STUDIO REGISTRY · ADMINISTRATOR ONLY</span>
        <span className="flex gap-2"><Activity size={14}/> Source observations remain authoritative. No automatic publication or CRM writes.</span>
      </div>
    </footer>
  </main>;
}
