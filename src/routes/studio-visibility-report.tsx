import { createFileRoute } from "@tanstack/react-router";
import { ArrowUpRight, BarChart3, CheckCircle2, Search, ShieldCheck, Target, TrendingUp } from "lucide-react";
import { useEffect, useState } from "react";
import { PageHero, PublicShell } from "@/components/public-site";
import { supabase } from "@/integrations/supabase/client";

const DEMO = {
  studio: { name: "INKSIGHT Demo Studio", website: "https://example.com" },
  visibility_score: 44,
  score_components: { keyword_visibility: 50, top_10_share: 20, tracked_keywords: 5, total_search_volume: 13180 },
  top_opportunities: [
    { keyword: "tattoo artist london", search_volume: 3600, current_rank: 42, lsos_score: 68.85 },
    { keyword: "tattoo shop london", search_volume: 2400, current_rank: null, lsos_score: 68.85 },
    { keyword: "fine line tattoo london", search_volume: 1900, current_rank: 27, lsos_score: 68.85 },
    { keyword: "tattoo studio london", search_volume: 4400, current_rank: 18, lsos_score: 55.08 },
    { keyword: "blackwork tattoo london", search_volume: 880, current_rank: 9, lsos_score: 37.87 },
  ],
  methodology: { formula: "Demand × Commercial Intent × Local Relevance × Search Position Opportunity × Conversion Potential", classification: "Modelled opportunity; not verified lost revenue" },
};

type Report = typeof DEMO;

export const Route = createFileRoute("/studio-visibility-report")({
  component: StudioVisibilityReport,
  head: () => ({
    meta: [
      { title: "Studio Visibility Report | INKSIGHT" },
      { name: "description", content: "INKSIGHT Studio Visibility Report: search demand, visibility, competition, opportunity and commercial potential." },
    ],
  }),
});

function scoreLabel(score: number) {
  if (score >= 85) return "Strong visibility";
  if (score >= 65) return "Competitive foundation";
  if (score >= 40) return "Material visibility gaps";
  return "High-priority visibility rebuild";
}

function money(value: number) {
  return new Intl.NumberFormat("en-GB", { style: "currency", currency: "GBP", maximumFractionDigits: 0 }).format(value);
}

function StudioVisibilityReport() {
  const [report, setReport] = useState<Report>(DEMO);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const reportId = new URLSearchParams(typeof window === "undefined" ? "" : window.location.search).get("reportId");

  useEffect(() => {
    if (!reportId) return;
    let active = true;
    setLoading(true);
    (async () => {
      const client = supabase as any;
      const { data, error: queryError } = await client
        .from("visibility_report_runs")
        .select("visibility_score,score_components,opportunity_summary,methodology,studio_id")
        .eq("id", reportId)
        .single();
      if (!active) return;
      if (queryError) {
        setError(queryError.message);
        setLoading(false);
        return;
      }
      const { data: studio } = await client.from("visibility_studios").select("studio_name,website_url").eq("id", data.studio_id).single();
      setReport({
        studio: { name: studio?.studio_name || "Studio", website: studio?.website_url || "" },
        visibility_score: data.visibility_score ?? 0,
        score_components: data.score_components || DEMO.score_components,
        top_opportunities: data.opportunity_summary?.top_opportunities || [],
        methodology: data.methodology || DEMO.methodology,
      });
      setLoading(false);
    })();
    return () => { active = false; };
  }, [reportId]);

  const score = report.visibility_score;
  const components = report.score_components;
  const opportunities = report.top_opportunities || [];
  const totalVolume = Number(components.total_search_volume || 0);
  const estimatedAnnualOpportunity = opportunities.reduce((sum, item) => {
    const clicks = Number(item.search_volume || 0) * (item.current_rank == null ? 0.12 : item.current_rank <= 10 ? 0.04 : 0.08);
    return sum + clicks * 0.08 * 250;
  }, 0) * 12;

  return (
    <PublicShell>
      <PageHero
        eyebrow={reportId ? "Live report · INKSIGHT Intelligence Engine" : "Preview · INKSIGHT Intelligence Engine"}
        title={<>Studio Visibility Report</>}
        description={<>A commercial visibility assessment built from search demand, rankings, local relevance, competitive pressure and conversion potential.</>}
      />

      {error && <div className="mx-auto max-w-7xl px-6 pt-8"><div className="rounded-xl border border-destructive/30 bg-destructive/10 p-4 text-sm text-destructive">Unable to load this report: {error}</div></div>}
      {loading && <div className="mx-auto max-w-7xl px-6 pt-8"><div className="rounded-xl border border-border bg-ink p-4 text-sm text-muted-foreground">Loading report data…</div></div>}

      <main className="bg-ink">
        <section className="mx-auto max-w-7xl px-6 py-14">
          <div className="grid gap-5 md:grid-cols-4">
            <Metric icon={<Target />} label="Visibility score" value={`${score}/100`} note={scoreLabel(score)} />
            <Metric icon={<Search />} label="Tracked demand" value={totalVolume.toLocaleString("en-GB")} note="monthly search volume" />
            <Metric icon={<TrendingUp />} label="Top 10 coverage" value={`${components.top_10_share || 0}%`} note={`${components.tracked_keywords || 0} keywords tracked`} />
            <Metric icon={<BarChart3 />} label="Modelled opportunity" value={money(estimatedAnnualOpportunity)} note="annualised estimate" />
          </div>
        </section>

        <section className="border-y border-border bg-ink-deep">
          <div className="mx-auto grid max-w-7xl gap-10 px-6 py-16 lg:grid-cols-[1fr_360px] lg:items-center">
            <div>
              <p className="text-xs font-bold uppercase tracking-[0.18em] text-mint">Executive snapshot</p>
              <h2 className="mt-3 font-display text-4xl font-black text-ice md:text-5xl">{report.studio.name}</h2>
              <p className="mt-5 max-w-2xl text-lg leading-relaxed text-muted-foreground">The studio has a measurable search footprint, but material demand sits outside the current top 10. The highest-value opportunities are concentrated around commercially relevant local searches where movement in rankings can plausibly create additional qualified enquiries.</p>
              <div className="mt-7 flex flex-wrap gap-3">
                <span className="rounded-full border border-border px-4 py-2 text-sm text-muted-foreground">{components.keyword_visibility || 0}% keyword visibility index</span>
                <span className="rounded-full border border-border px-4 py-2 text-sm text-muted-foreground">{opportunities.length} priority opportunities</span>
              </div>
            </div>
            <div className="rounded-2xl border border-mint/30 bg-ink p-7 text-center">
              <div className="mx-auto flex h-36 w-36 items-center justify-center rounded-full border-8 border-mint/20">
                <div><div className="font-display text-5xl font-black text-ice">{score}</div><div className="text-xs font-bold uppercase tracking-widest text-mint">/100</div></div>
              </div>
              <p className="mt-5 font-bold text-ice">{scoreLabel(score)}</p>
            </div>
          </div>
        </section>

        <section className="mx-auto max-w-7xl px-6 py-16">
          <div className="flex flex-wrap items-end justify-between gap-5">
            <div><p className="text-xs font-bold uppercase tracking-[0.18em] text-mint">Opportunity engine</p><h2 className="mt-2 font-display text-4xl font-black text-ice">Where the demand is</h2></div>
            <p className="max-w-md text-sm leading-relaxed text-muted-foreground">LSOS prioritises opportunities rather than reporting rankings in isolation.</p>
          </div>
          <div className="mt-8 overflow-hidden rounded-2xl border border-border">
            <div className="grid grid-cols-[minmax(220px,1.5fr)_110px_100px_100px] bg-ink-deep px-5 py-4 text-xs font-bold uppercase tracking-wider text-muted-foreground"><span>Keyword</span><span>Demand</span><span>Rank</span><span>LSOS</span></div>
            {opportunities.map((item, index) => <div key={item.keyword} className="grid grid-cols-[minmax(220px,1.5fr)_110px_100px_100px] items-center border-t border-border bg-ink px-5 py-5 text-sm"><span className="font-semibold text-ice">{index + 1}. {item.keyword}</span><span className="text-muted-foreground">{Number(item.search_volume).toLocaleString("en-GB")}</span><span className="font-bold text-ice">{item.current_rank == null ? "—" : `#${item.current_rank}`}</span><span className="font-bold text-mint">{Number(item.lsos_score).toFixed(1)}</span></div>)}
          </div>
        </section>

        <section className="border-t border-border bg-ink-deep">
          <div className="mx-auto max-w-7xl px-6 py-16">
            <p className="text-xs font-bold uppercase tracking-[0.18em] text-mint">Commercial interpretation</p>
            <h2 className="mt-2 font-display text-4xl font-black text-ice">From search visibility to revenue opportunity</h2>
            <div className="mt-8 grid gap-5 md:grid-cols-3">
              <Insight title="Demand" text={`${totalVolume.toLocaleString("en-GB")} monthly searches are represented in the tracked keyword set.`} />
              <Insight title="Position" text={`${components.top_10_share || 0}% of tracked keywords currently sit in the top 10 in this model.`} />
              <Insight title="Opportunity" text={`The model indicates approximately ${money(estimatedAnnualOpportunity)} of annualised search-derived opportunity before intervention costs.`} />
            </div>
          </div>
        </section>

        <section className="mx-auto max-w-7xl px-6 py-16">
          <div className="grid gap-5 md:grid-cols-3">
            <Action number="01" title="Capture striking-distance demand" text="Improve pages already ranking beyond the first page where demand and commercial intent justify intervention." />
            <Action number="02" title="Build local relevance" text="Align service, style and location signals around the searches that matter commercially." />
            <Action number="03" title="Measure the baseline" text="Track ranking, enquiries and bookings against the same opportunity set so improvements can be verified." />
          </div>
        </section>

        <section className="border-t border-border">
          <div className="mx-auto max-w-4xl px-6 py-14 text-center">
            <div className="flex justify-center"><ShieldCheck className="h-7 w-7 text-mint" /></div>
            <h2 className="mt-4 font-display text-3xl font-black text-ice">Evidence hierarchy</h2>
            <p className="mt-4 text-sm leading-relaxed text-muted-foreground">Search volume and ranking observations are source measurements. Revenue figures are modelled estimates unless supported by first-party attribution. The report does not represent estimated opportunity as verified lost revenue.</p>
            <p className="mt-4 text-xs text-muted-foreground">Method: {report.methodology.formula}</p>
          </div>
        </section>
      </main>
    </PublicShell>
  );
}

function Metric({ icon, label, value, note }: { icon: React.ReactNode; label: string; value: string; note: string }) {
  return <div className="rounded-2xl border border-border bg-ink-deep p-6"><div className="flex items-center gap-2 text-mint">{icon}<span className="text-xs font-bold uppercase tracking-wider">{label}</span></div><div className="mt-4 font-display text-4xl font-black text-ice">{value}</div><div className="mt-1 text-xs text-muted-foreground">{note}</div></div>;
}

function Insight({ title, text }: { title: string; text: string }) {
  return <div className="rounded-2xl border border-border bg-ink p-6"><p className="font-bold text-mint">{title}</p><p className="mt-3 text-sm leading-relaxed text-muted-foreground">{text}</p></div>;
}

function Action({ number, title, text }: { number: string; title: string; text: string }) {
  return <div className="rounded-2xl border border-border bg-ink p-7"><div className="flex items-center justify-between"><span className="font-display text-3xl font-black text-ice">{number}</span><ArrowUpRight className="h-5 w-5 text-mint" /></div><h3 className="mt-7 text-xl font-bold text-ice">{title}</h3><p className="mt-3 text-sm leading-relaxed text-muted-foreground">{text}</p><div className="mt-5 flex items-center gap-2 text-xs font-semibold text-mint"><CheckCircle2 className="h-4 w-4" />Priority action</div></div>;
}
