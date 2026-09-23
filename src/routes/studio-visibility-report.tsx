/* eslint-disable prettier/prettier */
import { createFileRoute } from "@tanstack/react-router";
import { ArrowRight, Globe2, Printer, Search, ShieldCheck, Target } from "lucide-react";
import { FormEvent, useEffect, useState, type ReactNode } from "react";
import { PageHero, PublicShell } from "@/components/public-site";
import { supabase } from "@/integrations/supabase/client";

const REPORT_FUNCTION = "https://ukaxsqwnkoqbbsufpzga.supabase.co/functions/v1/studio-visibility-report-v2";

type WebsiteSnapshot = {
  http_status?: number;
  final_url?: string;
  title?: string | null;
  meta_description?: string | null;
  h1s?: string[];
  canonical?: string | null;
  robots_available?: boolean;
  sitemap_available?: boolean;
};
type SearchUniverseRow = {
  query: string;
  category?: string | null;
  demand_measured?: boolean;
  demand_kind?: string | null;
  demand_signal?: number | null;
  provider_position?: number | null;
  provider?: string | null;
  database?: string | null;
  lsos?: number;
  status?: string;
};
type Competitor = {
  domain: string | null;
  competitor_name?: string | null;
  query_overlap: number | null;
  best_observed_position: number | null;
  visibility_share?: number | null;
  source_provider?: string | null;
};
type Opportunity = {
  title: string;
  description: string;
  lsos_score: number;
  priority: number;
  evidence: unknown;
  recommended_action: string | null;
};
type ReportPayload = {
  report: {
    id: string;
    visibility_score: number | null;
    executive_summary: string | null;
    search_demand: { measured?: boolean; note?: string; keywords_measured?: number; generated_candidates?: number };
    current_visibility: { provider?: string; serp_queries?: number; observed_results?: number; observed_studio_positions?: number; google_rankings_measured?: boolean; note?: string };
    competitor_intelligence: unknown;
    opportunity_summary: unknown;
    action_plan: unknown;
    methodology: { provider?: string; demand?: string; serp?: string; ranking_scope?: string; lsos?: string; revenue?: string };
    qa_checks: unknown;
    data_classification: string;
    created_at: string;
  };
  studio: { studio_name: string; website_url: string | null; town: string | null; artist_count: number };
  observations: Array<{ observation_type: string; entity_name?: string | null; source_provider?: string; source_reference?: string | null; raw_data: WebsiteSnapshot & Record<string, unknown>; observed_at: string }>;
  search_universe: SearchUniverseRow[];
  competitors: Competitor[];
  studio_search_observations: Array<{ query: string; provider_position: number | null; url: string | null; source_provider: string; database: string }>;
  opportunities: Opportunity[];
};

export const Route = createFileRoute("/studio-visibility-report")({
  component: StudioVisibilityReport,
  head: () => ({
    meta: [
      { title: "Studio Visibility Report | INKSIGHTS" },
      { name: "description", content: "An evidence-led studio visibility report built from website and search observations." },
      { property: "og:url", content: "https://getinksights.co.uk/studio-visibility-report" },
    ],
    links: [{ rel: "canonical", href: "https://getinksights.co.uk/studio-visibility-report" }],
  }),
});

function StudioVisibilityReport() {
  const params = typeof window === "undefined" ? new URLSearchParams() : new URLSearchParams(window.location.search);
  const reportId = params.get("reportId");
  const token = params.get("token");
  const [report, setReport] = useState<ReportPayload | null>(null);
  const [loading, setLoading] = useState(Boolean(reportId));
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!reportId || !token) return;
    let active = true;
    (async () => {
      const rpcClient = supabase as unknown as { rpc: (name: string, args: Record<string, string>) => Promise<{ data: unknown; error: Error | null }> };
      const { data, error: rpcError } = await rpcClient.rpc("publish_visibility_report", { p_report_id: reportId, p_public_token: token });
      if (!active) return;
      if (rpcError) setError("This report link is invalid or has expired.");
      else setReport(data as ReportPayload);
      setLoading(false);
    })();
    return () => { active = false; };
  }, [reportId, token]);

  if (!reportId || !token) return <ReportRequest />;
  if (loading) return <PublicShell><div className="mx-auto max-w-4xl px-6 py-24 text-center text-muted-foreground">Preparing your report…</div></PublicShell>;
  if (error || !report) return <PublicShell><div className="mx-auto max-w-4xl px-6 py-24 text-center"><ShieldCheck className="mx-auto h-8 w-8 text-mint" /><h1 className="mt-5 font-display text-4xl font-black text-ice">Report unavailable</h1><p className="mt-4 text-muted-foreground">{error || "We could not load this report."}</p></div></PublicShell>;
  return <ReportView data={report} />;
}

function ReportRequest() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault(); setError(""); setLoading(true);
    const form = new FormData(event.currentTarget);
    const payload = {
      studio_name: String(form.get("studio_name") || ""), contact_name: String(form.get("contact_name") || ""), email: String(form.get("email") || ""), website: String(form.get("website") || ""), area: String(form.get("area") || ""), artist_count: Number(form.get("artist_count") || 0),
      services: String(form.get("services") || "").split(",").map(s => s.trim()).filter(Boolean).slice(0, 10), website_honeypot: String(form.get("website_honeypot") || ""),
    };
    try {
      const response = await fetch(REPORT_FUNCTION, { method: "POST", headers: { "content-type": "application/json" }, body: JSON.stringify(payload) });
      const data = await response.json() as { ok?: boolean; reportUrl?: string; error?: string };
      if (!response.ok || !data.ok || !data.reportUrl) throw new Error(data.error || "The report could not be generated.");
      window.location.assign(data.reportUrl);
    } catch (err) { setError(err instanceof Error ? err.message : "The report could not be generated."); setLoading(false); }
  }
  return <PublicShell>
    <PageHero eyebrow="Free · evidence-led studio visibility report" title={<>See what your studio can verify today.</>} description={<>Submit your studio details and receive a report built from source observations. We do not invent search volume, rankings or revenue figures.</>} />
    <div className="bg-ink">
      <section className="mx-auto grid max-w-6xl gap-8 px-6 py-14 lg:grid-cols-[1fr_360px]">
        <form onSubmit={submit} className="rounded-3xl border border-border bg-ink-deep p-7 md:p-9">
          <div className="grid gap-5 sm:grid-cols-2">
            <Field label="Studio name" name="studio_name" required /><Field label="Your name" name="contact_name" required />
            <Field label="Email" name="email" type="email" required /><Field label="Website" name="website" placeholder="https://yourstudio.co.uk" required />
            <Field label="Town / city" name="area" required /><Field label="Artists" name="artist_count" type="number" min="3" max="100" placeholder="3+" required />
          </div>
          <label className="mt-5 block text-sm font-semibold text-ice">Main services / styles <span className="font-normal text-muted-foreground">(comma separated)</span><input name="services" className="mt-2 w-full rounded-xl border border-border bg-ink px-4 py-3 font-normal text-ice" placeholder="fine line, realism, blackwork" /></label>
          <div className="absolute left-[-10000px] top-auto h-px w-px overflow-hidden"><input name="website_honeypot" tabIndex={-1} autoComplete="off" /></div>
          <label className="mt-6 flex gap-3 text-sm text-muted-foreground"><input type="checkbox" required className="mt-1" /><span>I agree to INKSIGHTS using these details to generate the report and contact me about the result.</span></label>
          <button disabled={loading} type="submit" className="mt-6 inline-flex min-h-12 items-center gap-2 rounded-full bg-mint px-7 py-3 font-bold text-ink-deep disabled:opacity-60">{loading ? "Generating…" : "Generate my report"}<ArrowRight className="h-4 w-4" /></button>
          {error && <p className="mt-4 text-sm font-semibold text-red-300">{error}</p>}
        </form>
        <aside className="h-max rounded-3xl border border-border bg-ink-deep p-7"><p className="text-xs font-bold uppercase tracking-[0.18em] text-mint">What you receive</p><div className="mt-6 space-y-5 text-sm text-muted-foreground">
          <Feature icon={<Search />} title="Observed search evidence" text="Provider-specific result observations, clearly labelled by source and scope." />
          <Feature icon={<Globe2 />} title="Website snapshot" text="HTTP status, title, description, H1s, canonical, robots and sitemap availability." />
          <Feature icon={<Target />} title="Priority actions" text="Human-QA'd actions tied to observed evidence rather than invented opportunity scores." />
          <Feature icon={<ShieldCheck />} title="Evidence controls" text="Unmeasured demand, Google rankings and revenue remain explicitly unmeasured." />
        </div></aside>
      </section>
    </div>
  </PublicShell>;
}

function ReportView({ data }: { data: ReportPayload }) {
  const r = data.report; const s = data.studio;
  const website = data.observations.find(o => o.observation_type === "website")?.raw_data || {};
  const searches = data.search_universe || []; const competitors = data.competitors || [];
  const observedStudioPositions = data.studio_search_observations || [];
  const topCompetitor = competitors[0]; const demandMeasured = Boolean(r.search_demand?.measured);
  const providerLabel = r.current_visibility?.provider || r.methodology?.provider || "external observation";
  return <PublicShell>
    <PageHero eyebrow="Evidence-led report · INKSIGHTS" title={<>Studio Visibility Report</>} description={<>A source-led snapshot of observed search coverage, competitors and website evidence. <b className="text-ice">No revenue is estimated in this report.</b></>} />
    <div className="bg-ink print:bg-white">
      <div className="mx-auto max-w-7xl px-6 py-8 flex justify-end print:hidden"><button onClick={() => window.print()} className="inline-flex items-center gap-2 rounded-full border border-border px-4 py-2 text-sm font-semibold text-ice"><Printer className="h-4 w-4" /> Save / print PDF</button></div>
      <section className="mx-auto max-w-7xl px-6 pb-14"><div className="grid gap-5 md:grid-cols-4">
        <Metric label="Observed searches" value={String(searches.length)} note="studio-specific validation sample" />
        <Metric label="Studio-domain appearances" value={String(observedStudioPositions.length)} note={`within ${providerLabel} observations`} />
        <Metric label="Search demand" value={demandMeasured ? String(r.search_demand.keywords_measured || "Measured") : "Not quantified"} note="no volume invented" />
        <Metric label="Top competitor overlap" value={topCompetitor?.query_overlap != null ? `${topCompetitor.query_overlap}/${searches.length}` : "—"} note={topCompetitor?.domain || "not observed"} />
      </div></section>

      <section className="border-y border-border bg-ink-deep"><div className="mx-auto max-w-7xl px-6 py-14"><p className="text-xs font-bold uppercase tracking-[0.18em] text-mint">Executive intelligence</p><h2 className="mt-3 font-display text-4xl font-black text-ice">{s.studio_name}</h2><p className="mt-5 max-w-4xl text-lg leading-relaxed text-muted-foreground">{r.executive_summary}</p><div className="mt-7 flex flex-wrap gap-3 text-xs text-muted-foreground"><span className="rounded-full border border-border px-3 py-2">{s.town || "Location supplied"}</span><span className="rounded-full border border-border px-3 py-2">{s.artist_count} artists observed</span><span className="rounded-full border border-border px-3 py-2">Observed {new Date(r.created_at).toLocaleDateString("en-GB")}</span><span className="rounded-full border border-border px-3 py-2">Human QA complete</span></div></div></section>

      <section className="mx-auto max-w-7xl px-6 py-14"><p className="text-xs font-bold uppercase tracking-[0.18em] text-mint">Search evidence</p><h2 className="mt-2 font-display text-4xl font-black text-ice">What the sampled search environment showed</h2><p className="mt-3 max-w-3xl text-sm leading-relaxed text-muted-foreground">Positions below are positions in the named observation provider, not Google rankings. A blank position means the studio domain was not observed in the retained result set; it does not mean “not in Google”.</p><div className="mt-7 overflow-hidden rounded-2xl border border-border"><div className="grid grid-cols-[1fr_150px_150px] bg-ink-deep px-5 py-4 text-xs font-bold uppercase tracking-wider text-muted-foreground"><span>Search</span><span>Studio domain</span><span>Demand</span></div>{searches.map(row => <div key={row.query} className="grid grid-cols-[1fr_150px_150px] items-center border-t border-border px-5 py-4 text-sm"><span className="font-semibold text-ice">{row.query}</span><span className="text-ice">{row.provider_position == null ? "Not observed" : `Observed #${row.provider_position}`}</span><span className="text-muted-foreground">{row.demand_measured ? "Measured" : row.demand_kind === "observed_presence" ? "Market observed" : "Not quantified"}</span></div>)}</div></section>

      <section className="border-y border-border bg-ink-deep"><div className="mx-auto grid max-w-7xl gap-8 px-6 py-14 lg:grid-cols-[1fr_380px]"><div><p className="text-xs font-bold uppercase tracking-[0.18em] text-mint">Competitor observations</p><h2 className="mt-2 font-display text-4xl font-black text-ice">Recurring domains in the sample</h2><div className="mt-7 space-y-3">{competitors.slice(0, 6).map((c, index) => <div key={`${c.domain}-${index}`} className="grid grid-cols-[1fr_100px_130px] items-center rounded-xl border border-border bg-ink p-4 text-sm"><span className="font-semibold text-ice">{c.domain || c.competitor_name || "Observed competitor"}</span><span className="text-muted-foreground">{c.query_overlap || 0}/{searches.length} queries</span><span className="text-muted-foreground">best observed {c.best_observed_position ? `#${c.best_observed_position}` : "—"}</span></div>)}</div></div>
        <div><p className="text-xs font-bold uppercase tracking-[0.18em] text-mint">Website evidence</p><h2 className="mt-2 font-display text-4xl font-black text-ice">What we verified</h2><div className="mt-7 space-y-3">{[["HTTP status",website.http_status ? String(website.http_status) : "Not measured"],["Title",website.title || "Not found"],["Meta description",website.meta_description || "Not found"],["H1 count",String((website.h1s || []).length)],["Canonical",website.canonical || "Not found"],["robots.txt",website.robots_available ? "Available" : "Not confirmed"],["sitemap.xml",website.sitemap_available ? "Available" : "Not confirmed"]].map(([label,value]) => <div key={label} className="rounded-xl border border-border bg-ink p-4"><p className="text-xs uppercase tracking-wider text-muted-foreground">{label}</p><p className="mt-1 break-words text-sm font-semibold text-ice">{value}</p></div>)}</div></div></div></section>

      <section className="mx-auto max-w-7xl px-6 py-14"><p className="text-xs font-bold uppercase tracking-[0.18em] text-mint">Priority actions</p><h2 className="mt-2 font-display text-4xl font-black text-ice">What the evidence points to</h2><div className="mt-7 grid gap-4 md:grid-cols-3">{(data.opportunities || []).slice(0, 6).map(o => <div key={`${o.priority}-${o.title}`} className="rounded-2xl border border-border bg-ink-deep p-6"><span className="font-mono text-mint">PRIORITY 0{o.priority}</span><h3 className="mt-4 text-lg font-bold text-ice">{o.title}</h3><p className="mt-2 text-sm leading-relaxed text-muted-foreground">{o.description}</p><p className="mt-5 border-t border-border pt-4 text-sm font-semibold leading-relaxed text-mint">{o.recommended_action}</p></div>)}</div></section>

      <section className="border-t border-border bg-ink-deep"><div className="mx-auto max-w-4xl px-6 py-14 text-center"><ShieldCheck className="mx-auto h-7 w-7 text-mint" /><h2 className="mt-4 font-display text-3xl font-black text-ice">Evidence & limitations</h2><p className="mt-4 text-sm leading-relaxed text-muted-foreground">This report uses website evidence and provider-specific web-search observations. They are not represented as Google rankings. Absolute monthly search demand has not been measured, so LSOS is not scored and revenue opportunity is not calculated. Competitor overlap describes only this sampled query set.</p><p className="mt-4 text-xs leading-relaxed text-muted-foreground">Provider: {providerLabel}. Data classification: {r.data_classification}. Method: {r.methodology?.lsos || "Evidence-first, unscored where inputs are unmeasured."}</p></div></section>
    </div>
  </PublicShell>;
}

function Field({ label, name, type = "text", placeholder, required, min, max }: { label: string; name: string; type?: string; placeholder?: string; required?: boolean; min?: string; max?: string }) { return <label className="text-sm font-semibold text-ice">{label}<input name={name} type={type} placeholder={placeholder} required={required} min={min} max={max} className="mt-2 w-full rounded-xl border border-border bg-ink px-4 py-3 font-normal text-ice" /></label>; }
function Feature({ icon, title, text }: { icon: ReactNode; title: string; text: string }) { return <div className="flex gap-3"><div className="mt-0.5 text-mint">{icon}</div><div><p className="font-semibold text-ice">{title}</p><p className="mt-1 leading-relaxed">{text}</p></div></div>; }
function Metric({ label, value, note }: { label: string; value: string; note: string }) { return <div className="rounded-2xl border border-border bg-ink-deep p-6"><p className="text-xs font-bold uppercase tracking-wider text-mint">{label}</p><div className="mt-4 font-display text-4xl font-black text-ice">{value}</div><p className="mt-1 text-xs text-muted-foreground">{note}</p></div>; }
