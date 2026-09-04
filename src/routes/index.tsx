import { createFileRoute } from "@tanstack/react-router";
import { BarChart3, Database, Eye, Gauge, Search, ShieldCheck, Target, Users } from "lucide-react";
import { Reveal, TiltCard } from "@/components/interactive-home";
import { Card, JsonLd, PrimaryButton, PublicShell, SecondaryButton } from "@/components/public-site";
import { StudioIntelligenceMap } from "@/components/studio-intelligence-map";

const CANONICAL_URL = "https://getinksights.co.uk/";

export const Route = createFileRoute("/")({
  component: Index,
  head: () => ({
    meta: [
      { title: "Tattoo Studio Growth & Intelligence | INKSIGHTS" },
      { name: "description", content: "Growth intelligence for UK tattoo studios with 3+ artists. Find where demand, bookings, capacity or revenue are leaking — then fix the constraint that matters most." },
      { property: "og:title", content: "Tattoo Studio Growth & Intelligence | INKSIGHTS" },
      { property: "og:description", content: "Find where your studio is losing demand, bookings, capacity or revenue — then fix the constraint that matters most." },
      { property: "og:url", content: CANONICAL_URL },
    ],
    links: [{ rel: "canonical", href: CANONICAL_URL }],
  }),
});

const problems = [
  [Search, "Not enough enquiries", "Find whether local search visibility, service coverage or competitor presence is suppressing demand."],
  [Target, "Enquiries not becoming bookings", "Identify friction between discovery, enquiry, qualification, deposits and confirmed appointments."],
  [Gauge, "Artists have empty time", "Separate a demand problem from a capacity, scheduling, pricing or utilisation problem."],
  [BarChart3, "Revenue feels unpredictable", "Map the commercial levers behind clients, transaction value, purchase frequency and leakage."],
] as const;

const measures = ["Google visibility", "Enquiry conversion", "Booking performance", "Artist utilisation", "Cancellations", "No-shows", "Average booking value", "Repeat clients", "Revenue"];

function Index() {
  return <PublicShell>
    <JsonLd data={{ "@context": "https://schema.org", "@type": "Organization", name: "INKSIGHTS", url: CANONICAL_URL, description: "Growth intelligence for UK tattoo studios with three or more artists." }} />

    <section className="hero-ambient relative overflow-hidden grid-bg">
      <div className="ambient-orb ambient-orb-one" aria-hidden="true" /><div className="ambient-orb ambient-orb-two" aria-hidden="true" /><div className="pointer-events-none absolute inset-0 bg-gradient-to-b from-transparent via-ink-deep/30 to-ink-deep" />
      <div className="relative mx-auto max-w-7xl px-6 pb-20 pt-16 md:pb-28 md:pt-24">
        <div className="grid gap-14 lg:grid-cols-[1.05fr_.95fr] lg:items-center">
          <Reveal><div>
            <div className="inline-flex items-center gap-2 rounded-full border border-mint/30 bg-mint/5 px-4 py-2 text-xs font-bold uppercase tracking-[0.18em] text-mint">INKSIGHTS · UK TATTOO STUDIO INTELLIGENCE</div>
            <h1 className="mt-7 max-w-5xl text-balance font-display text-5xl font-black leading-[.92] tracking-tight text-ice sm:text-6xl md:text-7xl xl:text-8xl">Growth intelligence for <span className="text-mint">UK tattoo studios.</span></h1>
            <p className="mt-7 max-w-2xl text-lg leading-relaxed text-muted-foreground md:text-xl">Find where your studio is losing demand, bookings, capacity or revenue — then fix the constraint that matters most.</p>
            <p className="mt-4 max-w-2xl text-sm leading-relaxed text-muted-foreground">Built specifically for established multi-artist studios, especially teams of 3+ artists that have outgrown guesswork, fragmented enquiries and disconnected reporting.</p>
            <div className="mt-9 flex flex-wrap gap-3"><PrimaryButton href="/studio-growth-check">Run the free Studio Audit</PrimaryButton><SecondaryButton href="/tattoo-studio-visibility-scorecard">Check your visibility</SecondaryButton></div>
            <div className="mt-10 flex flex-wrap gap-3 text-xs font-bold uppercase tracking-[.13em] text-muted-foreground">{["3+ artist studios", "UK market", "Evidence-led", "Action-focused"].map((item) => <span key={item} className="rounded-full border border-border bg-ink/70 px-4 py-2">{item}</span>)}</div>
          </div></Reveal>

          <Reveal delay={120}><div className="relative rounded-3xl border border-mint/25 bg-ink/80 p-6 shadow-2xl shadow-black/30 backdrop-blur-xl">
            <div className="flex items-center justify-between border-b border-border pb-5"><div><p className="text-xs font-bold uppercase tracking-[.15em] text-mint">The studio diagnostic</p><h2 className="mt-2 font-display text-2xl font-black text-ice">Find the constraint.</h2></div><Eye className="h-8 w-8 text-mint" /></div>
            <div className="mt-6 space-y-3">{["VISIBILITY", "ENQUIRIES", "BOOKINGS", "CAPACITY", "REVENUE"].map((step, i) => <div key={step} className="flex items-center gap-4 rounded-xl border border-border bg-ink-deep px-4 py-4"><span className="font-mono text-xs text-mint">0{i + 1}</span><span className="text-sm font-black tracking-[.12em] text-ice">{step}</span><span className="ml-auto h-1.5 w-1.5 rounded-full bg-mint" /></div>)}</div>
            <p className="mt-5 text-sm leading-relaxed text-muted-foreground">INKSIGHTS connects the signals so the owner can decide what deserves attention next — not simply see another dashboard.</p>
          </div></Reveal>
        </div>
      </div>
    </section>

    <section className="border-y border-border bg-ink"><div className="mx-auto max-w-7xl px-6 py-20 md:py-24">
      <Reveal><p className="text-xs font-bold uppercase tracking-[.18em] text-mint">What is holding your studio back?</p><h2 className="mt-4 max-w-4xl text-balance font-display text-4xl font-black text-ice md:text-6xl">Start with the commercial problem — not the software.</h2><p className="mt-5 max-w-3xl text-lg leading-relaxed text-muted-foreground">A studio does not need another tool simply because a metric moved. INKSIGHTS diagnoses the underlying constraint first, then routes the studio to the smallest useful intervention.</p></Reveal>
      <div className="mt-10 grid gap-5 md:grid-cols-2 xl:grid-cols-4">{problems.map(([Icon, title, text], i) => <Reveal key={String(title)} delay={i * 70} className="h-full"><TiltCard className="h-full"><Card className="h-full bg-ink-deep p-6"><Icon className="h-7 w-7 text-mint" /><h3 className="mt-6 font-display text-xl font-black text-ice">{String(title)}</h3><p className="mt-3 text-sm leading-relaxed text-muted-foreground">{String(text)}</p></Card></TiltCard></Reveal>)}</div>
    </div></section>

    <StudioIntelligenceMap />

    <section className="border-b border-border bg-ink"><div className="mx-auto max-w-7xl px-6 py-20 md:py-28"><div className="grid gap-10 lg:grid-cols-[.85fr_1.15fr] lg:items-start">
      <Reveal><div><p className="text-xs font-bold uppercase tracking-[.18em] text-mint">What we measure</p><h2 className="mt-4 text-balance font-display text-4xl font-black text-ice md:text-5xl">One commercial view of the studio.</h2><p className="mt-5 text-lg leading-relaxed text-muted-foreground">The long-term asset is a proprietary dataset around UK tattoo-studio economics. Every diagnostic adds structured evidence that can improve future benchmarks and recommendations.</p></div></Reveal>
      <div className="grid gap-3 sm:grid-cols-3">{measures.map((item, i) => <Reveal key={item} delay={i * 35}><div className="rounded-xl border border-border bg-ink-deep p-4"><span className="text-xs font-bold uppercase tracking-[.12em] text-mint">{String(i + 1).padStart(2, "0")}</span><p className="mt-2 text-sm font-semibold text-ice">{item}</p></div></Reveal>)}</div>
    </div></div></section>

    <section className="border-b border-border"><div className="mx-auto max-w-7xl px-6 py-20 md:py-28"><div className="grid gap-6 lg:grid-cols-2">
      <Reveal><div className="rounded-3xl border border-border bg-ink p-8"><Database className="h-7 w-7 text-mint" /><h2 className="mt-5 font-display text-3xl font-black text-ice">Diagnose → Measure → Prioritise → Fix → Monitor</h2><p className="mt-4 leading-relaxed text-muted-foreground">The website is the interface. The intelligence layer is the product: evidence, models, opportunity detection, interventions and measured outcomes.</p></div></Reveal>
      <Reveal delay={100}><div className="rounded-3xl border border-mint/30 bg-ink-deep p-8"><ShieldCheck className="h-7 w-7 text-mint" /><h2 className="mt-5 font-display text-3xl font-black text-ice">Evidence before claims.</h2><p className="mt-4 leading-relaxed text-muted-foreground">Demonstrations are labelled. Estimates remain estimates. Verified studio outcomes will be published only when the baseline, intervention and result can be evidenced.</p></div></Reveal>
    </div></div></section>

    <section className="relative overflow-hidden"><div className="mx-auto max-w-7xl px-6 py-20 md:py-28"><div className="rounded-3xl border border-mint/30 bg-ink-deep p-8 md:p-12"><div className="grid gap-10 lg:grid-cols-[1fr_auto] lg:items-center"><div><p className="text-xs font-bold uppercase tracking-[.18em] text-mint">For established studios</p><h2 className="mt-4 max-w-3xl text-balance font-display text-4xl font-black text-ice md:text-6xl">Know what to fix before you spend more.</h2><p className="mt-5 max-w-2xl text-lg leading-relaxed text-muted-foreground">Start with the free Studio Revenue Audit. If visibility is the constraint, measure it. If conversion is the constraint, fix the journey. If the studio is already visible, find the next bottleneck.</p></div><div className="flex flex-col gap-3 sm:flex-row lg:flex-col"><PrimaryButton href="/studio-growth-check">Find my constraint</PrimaryButton><SecondaryButton href="/offers">See how we fix it</SecondaryButton></div></div></div></div></section>

    <section className="border-t border-border bg-ink"><div className="mx-auto max-w-7xl px-6 py-12"><div className="flex flex-col gap-4 text-xs text-muted-foreground md:flex-row md:items-center md:justify-between"><span>INKSIGHTS · Tattoo Studio Intelligence</span><span>Built for UK studios with 3+ artists.</span></div></div></section>
  </PublicShell>;
}
