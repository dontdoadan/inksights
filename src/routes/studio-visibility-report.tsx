/* eslint-disable prettier/prettier */
import { createFileRoute } from "@tanstack/react-router";
import { ArrowRight, CheckCircle2, Globe2, Printer, Search, ShieldCheck, Target } from "lucide-react";
import { FormEvent, useEffect, useState, type ReactNode } from "react";
import { PageHero, PublicShell } from "@/components/public-site";
import { supabase } from "@/integrations/supabase/client";

const REPORT_FUNCTION = "https://ukaxsqwnkoqbbsufpzga.supabase.co/functions/v1/studio-visibility-report-v2";

type ScoreComponents = { tracked_keywords?: number; top_10_share?: number | null; total_search_volume?: number | null };
type WebsiteSnapshot = { http_status?: number; final_url?: string; title?: string | null; meta_description?: string | null; h1s?: string[]; canonical?: string | null; robots_available?: boolean; sitemap_available?: boolean };
type Keyword = { keyword: string; search_volume: number; current_rank: number | null; lsos_score: number; target_url?: string | null; keyword_difficulty?: number | null };
type ReportPayload = {
  report: { id: string; visibility_score: number | null; score_components: ScoreComponents; executive_summary: string | null; search_demand: unknown; current_visibility: unknown; opportunity_summary: unknown; action_plan: unknown; methodology: { scoring?: string; provider?: string; geography?: string; search_set?: string }; data_classification: string; created_at: string };
  studio: { studio_name: string; website_url: string | null; town: string | null; artist_count: number };
  observations: Array<{ observation_type: string; raw_data: WebsiteSnapshot; observed_at: string }>;
  keywords: Keyword[];
  opportunities: Array<{ title: string; description: string; lsos_score: number; priority: number; evidence: unknown; recommended_action: string | null }>;
};

export const Route = createFileRoute("/studio-visibility-report")({
  component: StudioVisibilityReport,
  head: () => ({
    meta: [
      { title: "Studio Visibility Report | INKSIGHT" },
      { name: "description", content: "A verified studio visibility report built from source measurements and a factual website snapshot." },
    ],
  }),
});

function scoreLabel(score: number | null) {
  if (score === null) return "Search data not available";
  if (score >= 80) return "Strong top-10 coverage";
  if (score >= 50) return "Mixed visibility";
  return "Limited top-10 coverage";
}

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
    <PageHero eyebrow="Free · verified studio visibility report" title={<>See what your studio can verify today.</>} description={<>Submit your studio details and receive a live report built from source measurements. We do not invent search volume, rankings or revenue figures.</>} />
    <main className="bg-ink">
      <section className="mx-auto grid max-w-6xl gap-8 px-6 py-14 lg:grid-cols-[1fr_360px]">
        <form onSubmit={submit} className="rounded-3xl border border-border bg-ink-deep p-7 md:p-9">
          <div className="grid gap-5 sm:grid-cols-2">
            <Field label="Studio name" name="studio_name" required />
            <Field label="Your name" name="contact_name" required />
            <Field label="Email" name="email" type="email" required />
            <Field label="Website" name="website" placeholder="https://yourstudio.co.uk" required />
            <Field label="Town / city" name="area" required />
            <Field label="Artists" name="artist_count" type="number" min="3" max="100" placeholder="3+" required />
          </div>
          <label className="mt-5 block text-sm font-semibold text-ice">Main services / styles <span className="font-normal text-muted-foreground">(comma separated)</span><input name="services" className="mt-2 w-full rounded-xl border border-border bg-ink px-4 py-3 font-normal text-ice" placeholder="fine line, realism, blackwork" /></label>
          <div className="absolute left-[-10000px] top-auto h-px w-px overflow-hidden"><input name="website_honeypot" tabIndex={-1} autoComplete="off" /></div>
          <label className="mt-6 flex gap-3 text-sm text-muted-foreground"><input type="checkbox" required className="mt-1" /><span>I agree to INKSIGHTS using these details to generate the report and contact me about the result.</span></label>
          <button disabled={loading} type="submit" className="mt-6 inline-flex min-h-12 items-center gap-2 rounded-full bg-mint px-7 py-3 font-bold text-ink-deep disabled:opacity-60">{loading ? "Generating…" : "Generate my report"}<ArrowRight className="h-4 w-4" /></button>
          {error && <p className="mt-4 text-sm font-semibold text-red-300">{error}</p>}
        </form>
        <aside className="h-max rounded-3xl border border-border bg-ink-deep p-7">
          <p className="text-xs font-bold uppercase tracking-[0.18em] text-mint">What you receive</p>
          <div className="mt-6 space-y-5 text-sm text-muted-foreground">
            <Feature icon={<Search />} title="Search measurements" text="UK search volume and organic ranking observations when the search-data provider is configured." />
            <Feature icon={<Globe2 />} title="Website snapshot" text="HTTP status, title, description, H1s, canonical, robots and sitemap availability." />
            <Feature icon={<Target />} title="Priority opportunities" text="Transparent INKSIGHT indices derived from the observed search data." />
            <Feature icon={<ShieldCheck />} title="Evidence controls" text="Every section identifies whether a value is source-measured or studio-submitted." />
          </div>
        </aside>
      </section>
    </main>
  </PublicShell>;
}

function ReportView({ data }: { data: ReportPayload }) {
  const r = data.report; const s = data.studio; const website = data.observations.find(o => o.observation_type === "website")?.raw_data || {};
  const kws = data.keywords || []; const score = r.visibility_score; const totalVolume = kws.reduce((sum, k) => sum + Number(k.search_volume || 0), 0); const ranked = kws.filter(k => k.current_rank !== null); const top10 = ranked.filter(k => Number(k.current_rank) <= 10).length;
  return <PublicShell>
    <PageHero eyebrow="Verified report · INKSIGHT" title={<>Studio Visibility Report</>} description={<>A source-led snapshot of your search visibility and website footprint. <b className="text-ice">No revenue is estimated in this report.</b></>} />
    <main className="bg-ink print:bg-white">
      <div className="mx-auto max-w-7xl px-6 py-8 flex justify-end print:hidden"><button onClick={() => window.print()} className="inline-flex items-center gap-2 rounded-full border border-border px-4 py-2 text-sm font-semibold text-ice"><Printer className="h-4 w-4" /> Save / print PDF</button></div>
      <section className="mx-auto max-w-7xl px-6 pb-14"><div className="grid gap-5 md:grid-cols-4">
        <Metric label="Visibility index" value={score === null ? "—" : `${score}/100`} note={scoreLabel(score)} />
        <Metric label="Tracked searches" value={String(kws.length)} note="initial local sample" />
        <Metric label="Search demand" value={totalVolume ? totalVolume.toLocaleString("en-GB") : "—"} note={totalVolume ? "monthly UK volume" : "not measured"} />
        <Metric label="Top-10 coverage" value={kws.length ? `${Math.round((top10 / kws.length) * 100)}%` : "—"} note={kws.length ? `${top10} of ${kws.length} sampled searches` : "not measured"} />
      </div></section>
      <section className="border-y border-border bg-ink-deep"><div className="mx-auto max-w-7xl px-6 py-14"><p className="text-xs font-bold uppercase tracking-[0.18em] text-mint">Executive snapshot</p><h2 className="mt-3 font-display text-4xl font-black text-ice">{s.studio_name}</h2><p className="mt-5 max-w-3xl text-lg leading-relaxed text-muted-foreground">{r.executive_summary}</p><div className="mt-7 flex flex-wrap gap-3 text-xs text-muted-foreground"><span className="rounded-full border border-border px-3 py-2">{s.town || "Location supplied"}</span><span className="rounded-full border border-border px-3 py-2">{s.artist_count} artists supplied</span><span className="rounded-full border border-border px-3 py-2">Observed {new Date(r.created_at).toLocaleDateString("en-GB")}</span></div></div></section>
      <section className="mx-auto max-w-7xl px-6 py-14"><div className="grid gap-8 lg:grid-cols-[1fr_380px]"><div><p className="text-xs font-bold uppercase tracking-[0.18em] text-mint">Search evidence</p><h2 className="mt-2 font-display text-4xl font-black text-ice">Observed search positions</h2><div className="mt-7 overflow-hidden rounded-2xl border border-border"><div className="grid grid-cols-[1fr_110px_90px_90px] bg-ink-deep px-5 py-4 text-xs font-bold uppercase tracking-wider text-muted-foreground"><span>Search</span><span>Volume</span><span>Rank</span><span>Index</span></div>{kws.sort((a,b) => Number(b.lsos_score)-Number(a.lsos_score)).map(k => <div key={k.keyword} className="grid grid-cols-[1fr_110px_90px_90px] items-center border-t border-border px-5 py-4 text-sm"><span className="font-semibold text-ice">{k.keyword}</span><span className="text-muted-foreground">{Number(k.search_volume).toLocaleString("en-GB")}</span><span className="font-bold text-ice">{k.current_rank == null ? "Not in top 100" : `#${k.current_rank}`}</span><span className="font-bold text-mint">{Number(k.lsos_score).toFixed(1)}</span></div>)}</div></div>
        <div><p className="text-xs font-bold uppercase tracking-[0.18em] text-mint">Website evidence</p><h2 className="mt-2 font-display text-4xl font-black text-ice">What we verified</h2><div className="mt-7 space-y-3">{[["HTTP status", website.http_status ? String(website.http_status) : "Not measured"],["Title", website.title || "Not found"],["Meta description", website.meta_description || "Not found"],["H1 count", String((website.h1s || []).length)],["Canonical", website.canonical || "Not found"],["robots.txt", website.robots_available ? "Available" : "Not confirmed"],["sitemap.xml", website.sitemap_available ? "Available" : "Not confirmed"]].map(([label,value]) => <div key={label} className="rounded-xl border border-border bg-ink-deep p-4"><p className="text-xs uppercase tracking-wider text-muted-foreground">{label}</p><p className="mt-1 break-words text-sm font-semibold text-ice">{value}</p></div>)}</div></div></div></section>
      <section className="border-t border-border bg-ink-deep"><div className="mx-auto max-w-7xl px-6 py-14"><p className="text-xs font-bold uppercase tracking-[0.18em] text-mint">Priority opportunities</p><h2 className="mt-2 font-display text-4xl font-black text-ice">What the evidence points to</h2><div className="mt-7 grid gap-4 md:grid-cols-2">{(data.opportunities || []).slice(0, 6).map(o => <div key={`${o.priority}-${o.title}`} className="rounded-2xl border border-border bg-ink p-6"><div className="flex items-center justify-between"><span className="font-mono text-mint">0{o.priority}</span><span className="text-xs font-bold text-muted-foreground">INDEX {Number(o.lsos_score).toFixed(1)}</span></div><h3 className="mt-4 text-lg font-bold text-ice">{o.title}</h3><p className="mt-2 text-sm leading-relaxed text-muted-foreground">{o.description}</p><p className="mt-4 text-sm font-semibold text-mint">{o.recommended_action}</p></div>)}</div></div></section>
      <section><div className="mx-auto max-w-4xl px-6 py-14 text-center"><ShieldCheck className="mx-auto h-7 w-7 text-mint" /><h2 className="mt-4 font-display text-3xl font-black text-ice">Evidence & limitations</h2><p className="mt-4 text-sm leading-relaxed text-muted-foreground">This report separates source measurements from studio-submitted information. Search measurements use the UK database available from the configured provider and represent the sampled searches shown above; they are not a substitute for city-level position tracking. Revenue opportunity is intentionally not calculated because no first-party attribution has been supplied.</p><p className="mt-4 text-xs leading-relaxed text-muted-foreground">Method: {r.methodology?.scoring || "Transparent source-derived index."} Data classification: {r.data_classification}.</p></div></section>
    </main>
  </PublicShell>;
}

function Field({ label, name, type = "text", placeholder, required, min, max }: { label: string; name: string; type?: string; placeholder?: string; required?: boolean; min?: string; max?: string }) { return <label className="text-sm font-semibold text-ice">{label}<input name={name} type={type} placeholder={placeholder} required={required} min={min} max={max} className="mt-2 w-full rounded-xl border border-border bg-ink px-4 py-3 font-normal text-ice" /></label>; }
function Feature({ icon, title, text }: { icon: ReactNode; title: string; text: string }) { return <div className="flex gap-3"><div className="mt-0.5 text-mint">{icon}</div><div><p className="font-semibold text-ice">{title}</p><p className="mt-1 leading-relaxed">{text}</p></div></div>; }
function Metric({ label, value, note }: { label: string; value: string; note: string }) { return <div className="rounded-2xl border border-border bg-ink-deep p-6"><p className="text-xs font-bold uppercase tracking-wider text-mint">{label}</p><div className="mt-4 font-display text-4xl font-black text-ice">{value}</div><p className="mt-1 text-xs text-muted-foreground">{note}</p></div>; }
