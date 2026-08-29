import { createFileRoute } from "@tanstack/react-router";
import { BarChart3, Database, Eye, Gauge, Search, ShieldCheck, Sparkles, Target, Users } from "lucide-react";
import { Reveal, TiltCard } from "@/components/interactive-home";
import { Card, JsonLd, PrimaryButton, PublicShell, SecondaryButton } from "@/components/public-site";
import { StudioIntelligenceMap } from "@/components/studio-intelligence-map";

const CANONICAL_URL = "https://getinksights.co.uk/";

export const Route = createFileRoute("/")({
  component: Index,
  head: () => ({
    meta: [
      { title: "INKSIGHTS | Tattoo Studio Intelligence" },
      { name: "description", content: "Business intelligence, market visibility and revenue optimisation for UK tattoo studios." },
      { property: "og:title", content: "INKSIGHTS | Tattoo Studio Intelligence" },
      { property: "og:description", content: "See the tattoo market as a dataset. Diagnose studio performance and act on the signals that matter." },
      { property: "og:url", content: CANONICAL_URL },
    ],
    links: [{ rel: "canonical", href: CANONICAL_URL }],
  }),
});

const signals = [
  [Search, "Visibility", "Find the gaps between a studio's work, local search presence and the people looking for it."],
  [BarChart3, "Performance", "Turn fragmented operational and commercial signals into measurable studio intelligence."],
  [Target, "Opportunity", "Identify the constraint, opportunity or market movement most worth acting on next."],
  [Users, "Market", "Build a structured view of the UK tattoo studio landscape instead of relying on anecdotal market knowledge."],
] as const;

function Index() {
  return (
    <PublicShell>
      <JsonLd data={[{ "@context": "https://schema.org", "@type": "Organization", name: "INKSIGHTS", url: CANONICAL_URL, description: "Business intelligence and revenue optimisation for UK tattoo studios." }]} />

      <section className="hero-ambient relative overflow-hidden grid-bg">
        <div className="ambient-orb ambient-orb-one" aria-hidden="true" />
        <div className="ambient-orb ambient-orb-two" aria-hidden="true" />
        <div className="pointer-events-none absolute inset-0 bg-gradient-to-b from-transparent via-ink-deep/30 to-ink-deep" />
        <div className="relative mx-auto max-w-7xl px-6 pb-20 pt-16 md:pb-28 md:pt-24">
          <div className="grid gap-14 lg:grid-cols-[1.05fr_.95fr] lg:items-center">
            <Reveal>
              <div>
                <div className="inline-flex items-center gap-2 rounded-full border border-mint/30 bg-mint/5 px-4 py-2 text-xs font-bold uppercase tracking-[0.18em] text-mint backdrop-blur-xl">
                  <Sparkles className="h-4 w-4" /> HUGHES GROUP / INTELLIGENCE LAYER
                </div>
                <h1 className="mt-7 max-w-5xl text-balance font-display text-5xl font-black leading-[.92] tracking-tight text-ice sm:text-6xl md:text-7xl xl:text-8xl">
                  Know what is changing <span className="text-mint">before it matters.</span>
                </h1>
                <p className="mt-7 max-w-2xl text-lg leading-relaxed text-muted-foreground md:text-xl">
                  INKSIGHTS turns fragmented studio, market and visibility signals into clear intelligence, measurable opportunities and decisions you can act on.
                </p>
                <div className="mt-9 flex flex-wrap gap-3">
                  <PrimaryButton href="#studio-map">Explore the UK studio map</PrimaryButton>
                  <SecondaryButton href="/studio-growth-check">Run a studio diagnosis</SecondaryButton>
                </div>
                <div className="mt-10 flex flex-wrap gap-3 text-xs font-bold uppercase tracking-[.13em] text-muted-foreground">
                  {["Market intelligence", "Studio diagnostics", "Visibility monitoring", "Revenue optimisation"].map((item) => <span key={item} className="rounded-full border border-border bg-ink/70 px-4 py-2">{item}</span>)}
                </div>
              </div>
            </Reveal>

            <Reveal delay={120}>
              <div className="relative rounded-3xl border border-mint/25 bg-ink/80 p-6 shadow-2xl shadow-black/30 backdrop-blur-xl">
                <div className="flex items-center justify-between border-b border-border pb-5">
                  <div><p className="text-xs font-bold uppercase tracking-[.15em] text-mint">Live intelligence model</p><h2 className="mt-2 font-display text-2xl font-black text-ice">From data to decision</h2></div>
                  <Eye className="h-8 w-8 text-mint" />
                </div>
                <div className="mt-6 space-y-3">
                  {["COLLECT", "NORMALISE", "COMPARE", "DETECT", "ACT"].map((step, i) => (
                    <div key={step} className="flex items-center gap-4 rounded-xl border border-border bg-ink-deep px-4 py-4">
                      <span className="font-mono text-xs text-mint">0{i + 1}</span><span className="text-sm font-black tracking-[.12em] text-ice">{step}</span><span className="ml-auto h-1.5 w-1.5 rounded-full bg-mint" />
                    </div>
                  ))}
                </div>
                <p className="mt-5 text-sm leading-relaxed text-muted-foreground">The website is the interface. The proprietary dataset, scoring models and monitoring loops are the asset.</p>
              </div>
            </Reveal>
          </div>
        </div>
      </section>

      <section className="border-y border-border bg-ink">
        <div className="mx-auto max-w-7xl px-6 py-20 md:py-24">
          <Reveal><p className="text-xs font-bold uppercase tracking-[.18em] text-mint">The INKSIGHTS model</p><h2 className="mt-4 max-w-4xl text-balance font-display text-4xl font-black text-ice md:text-6xl">The advantage is not another dashboard. It is the intelligence underneath it.</h2></Reveal>
          <div className="mt-10 grid gap-5 md:grid-cols-2 xl:grid-cols-4">
            {signals.map(([Icon, title, text], i) => <Reveal key={title} delay={i * 70} className="h-full"><TiltCard className="h-full"><Card className="h-full bg-ink-deep p-6"><Icon className="h-7 w-7 text-mint" /><h3 className="mt-6 font-display text-xl font-black text-ice">{title}</h3><p className="mt-3 text-sm leading-relaxed text-muted-foreground">{text}</p></Card></TiltCard></Reveal>)}
          </div>
        </div>
      </section>

      <StudioIntelligenceMap />

      <section className="border-b border-border bg-ink">
        <div className="mx-auto max-w-7xl px-6 py-20 md:py-28">
          <div className="grid gap-6 lg:grid-cols-[.9fr_1.1fr]">
            <Reveal><div><p className="text-xs font-bold uppercase tracking-[.18em] text-mint">Why the map matters</p><h2 className="mt-4 text-balance font-display text-4xl font-black text-ice md:text-5xl">The map becomes the front door to the dataset.</h2><p className="mt-5 text-lg leading-relaxed text-muted-foreground">The long-term product is not a directory. It is a structured intelligence network where every studio can become a record, every record can accumulate signals, and every signal can create a commercial opportunity.</p></div></Reveal>
            <div className="grid gap-4 sm:grid-cols-2">
              {[{ icon: Database, title: "Canonical records", text: "Studio identity, location, trading status and data confidence." }, { icon: Gauge, title: "Scoring layer", text: "Visibility, reputation, conversion and market signals." }, { icon: Target, title: "Opportunity engine", text: "Prioritise prospects, clients and interventions." }, { icon: ShieldCheck, title: "Verified intelligence", text: "Separate evidence, candidates and unverified records." }].map(({ icon: Icon, title, text }, i) => <Reveal key={title} delay={i * 60}><div className="rounded-2xl border border-border bg-ink-deep p-6"><Icon className="h-6 w-6 text-mint" /><h3 className="mt-5 font-display text-lg font-black text-ice">{title}</h3><p className="mt-2 text-sm leading-relaxed text-muted-foreground">{text}</p></div></Reveal>)}
            </div>
          </div>
        </div>
      </section>

      <section className="relative overflow-hidden">
        <div className="mx-auto max-w-7xl px-6 py-20 md:py-28">
          <div className="rounded-3xl border border-mint/30 bg-ink-deep p-8 md:p-12">
            <div className="grid gap-10 lg:grid-cols-[1fr_auto] lg:items-center">
              <div><p className="text-xs font-bold uppercase tracking-[.18em] text-mint">For tattoo studio owners</p><h2 className="mt-4 max-w-3xl text-balance font-display text-4xl font-black text-ice md:text-6xl">Stop guessing where the growth is.</h2><p className="mt-5 max-w-2xl text-lg leading-relaxed text-muted-foreground">Start with a structured diagnosis, understand the strongest constraint and use intelligence to decide what deserves attention next.</p></div>
              <div className="flex flex-col gap-3 sm:flex-row lg:flex-col"><PrimaryButton href="/studio-growth-check">Start the free diagnosis</PrimaryButton><SecondaryButton href="/contact">Talk to INKSIGHTS</SecondaryButton></div>
            </div>
          </div>
        </div>
      </section>

      <section className="border-t border-border bg-ink">
        <div className="mx-auto max-w-7xl px-6 py-12"><div className="flex flex-col gap-4 text-xs text-muted-foreground md:flex-row md:items-center md:justify-between"><span>INKSIGHTS · Business intelligence / Analytics / Revenue optimisation</span><span>Built as an operating intelligence layer for the tattoo industry.</span></div></div>
      </section>
    </PublicShell>
  );
}
