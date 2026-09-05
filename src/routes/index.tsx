import { createFileRoute } from "@tanstack/react-router";
import { BarChart3, Database, Eye, Gauge, Search, ShieldCheck, Sparkles, Target, Users } from "lucide-react";
import { Reveal, TiltCard } from "@/components/interactive-home";
import { Card, JsonLd, PrimaryButton, PublicShell, RevenueLeakageMap, SecondaryButton } from "@/components/public-site";
import { StudioIntelligenceMap } from "@/components/studio-intelligence-map";

const CANONICAL_URL = "https://getinksights.co.uk/";

export const Route = createFileRoute("/")({
  component: Index,
  head: () => ({
    meta: [
      { title: "Tattoo Studio Growth & Intelligence | INKSIGHTS" },
      { name: "description", content: "Growth intelligence for UK tattoo studios. Find where you are losing visibility, enquiries, bookings, capacity or revenue, then fix the constraint that matters most." },
      { property: "og:title", content: "Tattoo Studio Growth & Intelligence | INKSIGHTS" },
      { property: "og:description", content: "Find the commercial constraint holding your tattoo studio back, then act on the evidence." },
      { property: "og:url", content: CANONICAL_URL },
    ],
    links: [{ rel: "canonical", href: CANONICAL_URL }],
  }),
});

const signals = [
  [Search, "Visibility", "Find where local search, Maps and public profiles are failing to put the right studio in front of the right clients."],
  [BarChart3, "Conversion", "Measure what happens between enquiry and booking instead of assuming more traffic is the answer."],
  [Target, "Capacity", "See whether artist time, diary gaps, cancellations or pricing are restricting revenue output."],
  [Users, "Retention", "Understand repeat projects, rebooking, referrals and client reactivation as measurable commercial levers."],
] as const;

function Index() {
  return (
    <PublicShell>
      <JsonLd data={[{
        "@context": "https://schema.org",
        "@type": "Organization",
        name: "INKSIGHTS",
        url: CANONICAL_URL,
        description: "Growth intelligence and commercial systems designed specifically for UK tattoo studios.",
      }, {
        "@context": "https://schema.org",
        "@type": "WebSite",
        name: "INKSIGHTS",
        url: CANONICAL_URL,
      }]} />

      <section className="hero-ambient relative overflow-hidden grid-bg">
        <div className="ambient-orb ambient-orb-one" aria-hidden="true" />
        <div className="ambient-orb ambient-orb-two" aria-hidden="true" />
        <div className="pointer-events-none absolute inset-0 bg-gradient-to-b from-transparent via-ink-deep/30 to-ink-deep" />
        <div className="relative mx-auto max-w-7xl px-6 pb-20 pt-16 md:pb-28 md:pt-24">
          <div className="grid gap-14 lg:grid-cols-[1.05fr_.95fr] lg:items-center">
            <Reveal>
              <div>
                <div className="inline-flex items-center gap-2 rounded-full border border-mint/30 bg-mint/5 px-4 py-2 text-xs font-bold uppercase tracking-[0.18em] text-mint backdrop-blur-xl">
                  <Sparkles className="h-4 w-4" /> FOR UK TATTOO STUDIO OWNERS
                </div>
                <h1 className="mt-7 max-w-5xl text-balance font-display text-5xl font-black leading-[.92] tracking-tight text-ice sm:text-6xl md:text-7xl xl:text-8xl">
                  Growth intelligence for <span className="text-mint">UK tattoo studios.</span>
                </h1>
                <p className="mt-7 max-w-2xl text-lg leading-relaxed text-muted-foreground md:text-xl">
                  Find where your studio is losing visibility, enquiries, bookings, capacity or revenue — then fix the constraint that matters most.
                </p>
                <div className="mt-9 flex flex-wrap gap-3">
                  <PrimaryButton href="/studio-growth-check">Run the free Revenue Audit</PrimaryButton>
                  <SecondaryButton href="/tattoo-studio-visibility-scorecard">Check studio visibility</SecondaryButton>
                </div>
                <p className="mt-5 max-w-2xl text-sm leading-relaxed text-muted-foreground">
                  Built for established and multi-artist studios, especially teams with 3+ artists that have outgrown ad-hoc Instagram, email and spreadsheet management.
                </p>
              </div>
            </Reveal>

            <Reveal delay={120}>
              <div className="relative rounded-3xl border border-mint/25 bg-ink/80 p-6 shadow-2xl shadow-black/30 backdrop-blur-xl">
                <div className="flex items-center justify-between border-b border-border pb-5">
                  <div><p className="text-xs font-bold uppercase tracking-[.15em] text-mint">Studio intelligence</p><h2 className="mt-2 font-display text-2xl font-black text-ice">From signal to decision</h2></div>
                  <Eye className="h-8 w-8 text-mint" />
                </div>
                <div className="mt-6 space-y-3">
                  {["VISIBILITY", "ENQUIRIES", "BOOKINGS", "CAPACITY", "REVENUE"].map((step, i) => (
                    <div key={step} className="flex items-center gap-4 rounded-xl border border-border bg-ink-deep px-4 py-4">
                      <span className="font-mono text-xs text-mint">0{i + 1}</span><span className="text-sm font-black tracking-[.12em] text-ice">{step}</span><span className="ml-auto h-1.5 w-1.5 rounded-full bg-mint" />
                    </div>
                  ))}
                </div>
                <p className="mt-5 text-sm leading-relaxed text-muted-foreground">The public website is the interface. The proprietary studio dataset, diagnostics and monitoring models are the long-term asset.</p>
              </div>
            </Reveal>
          </div>
        </div>
      </section>

      <section className="border-y border-border bg-ink">
        <div className="mx-auto max-w-7xl px-6 py-20 md:py-24">
          <Reveal><p className="text-xs font-bold uppercase tracking-[.18em] text-mint">What INKSIGHTS measures</p><h2 className="mt-4 max-w-4xl text-balance font-display text-4xl font-black text-ice md:text-6xl">Your revenue is an output. We look at the system creating it.</h2></Reveal>
          <div className="mt-10 grid gap-5 md:grid-cols-2 xl:grid-cols-4">
            {signals.map(([Icon, title, text], i) => <Reveal key={title} delay={i * 70} className="h-full"><TiltCard className="h-full"><Card className="h-full bg-ink-deep p-6"><Icon className="h-7 w-7 text-mint" /><h3 className="mt-6 font-display text-xl font-black text-ice">{title}</h3><p className="mt-3 text-sm leading-relaxed text-muted-foreground">{text}</p></Card></TiltCard></Reveal>)}
          </div>
        </div>
      </section>

      <section className="border-b border-border bg-ink-deep">
        <div className="mx-auto max-w-7xl px-6 py-16 md:py-24">
          <RevenueLeakageMap />
        </div>
      </section>

      <StudioIntelligenceMap />

      <section className="border-b border-border bg-ink">
        <div className="mx-auto max-w-7xl px-6 py-20 md:py-28">
          <div className="grid gap-6 lg:grid-cols-[.9fr_1.1fr]">
            <Reveal><div><p className="text-xs font-bold uppercase tracking-[.18em] text-mint">The dataset</p><h2 className="mt-4 text-balance font-display text-4xl font-black text-ice md:text-5xl">Built around the economics of real tattoo studios.</h2><p className="mt-5 text-lg leading-relaxed text-muted-foreground">INKSIGHTS is building a proprietary dataset covering the conditions that influence studio performance: local search visibility, enquiries, booking conversion, artist capacity, cancellations, no-shows, average booking value, repeat clients and competitive signals.</p></div></Reveal>
            <div className="grid gap-4 sm:grid-cols-2">
              {[{ icon: Database, title: "Canonical studio records", text: "Identity, location, trading status and confidence are separated from guesses." }, { icon: Gauge, title: "Scoring layer", text: "Visibility, conversion, capacity and commercial conditions become comparable signals." }, { icon: Target, title: "Opportunity engine", text: "Prioritise the studio problem worth solving next, rather than selling another tactic." }, { icon: ShieldCheck, title: "Evidence first", text: "Observed data, public evidence, estimates and unknowns remain clearly distinguished." }].map(({ icon: Icon, title, text }, i) => <Reveal key={title} delay={i * 60}><div className="rounded-2xl border border-border bg-ink-deep p-6"><Icon className="h-6 w-6 text-mint" /><h3 className="mt-5 font-display text-lg font-black text-ice">{title}</h3><p className="mt-2 text-sm leading-relaxed text-muted-foreground">{text}</p></div></Reveal>)}
            </div>
          </div>
        </div>
      </section>

      <section className="border-b border-border bg-ink-deep">
        <div className="mx-auto max-w-7xl px-6 py-16 md:py-20">
          <div className="rounded-3xl border border-mint/20 bg-ink p-8 md:p-10">
            <div className="grid gap-8 lg:grid-cols-[1fr_auto] lg:items-center">
              <div><p className="text-xs font-bold uppercase tracking-[.18em] text-mint">Free studio tool</p><h2 className="mt-3 max-w-3xl font-display text-3xl font-black text-ice md:text-4xl">Benchmark your pricing — without sending your data to a third party.</h2><p className="mt-3 max-w-2xl text-sm leading-relaxed text-muted-foreground">Use the native INKSIGHTS Pricing Benchmark to compare current rates with reference bands and interpret them alongside booking lead time.</p></div>
              <PrimaryButton href="/pricing-benchmark">Open Pricing Benchmark</PrimaryButton>
            </div>
          </div>
        </div>
      </section>

      <section className="relative overflow-hidden">
        <div className="mx-auto max-w-7xl px-6 py-20 md:py-28">
          <div className="rounded-3xl border border-mint/30 bg-ink-deep p-8 md:p-12">
            <div className="grid gap-10 lg:grid-cols-[1fr_auto] lg:items-center">
              <div><p className="text-xs font-bold uppercase tracking-[.18em] text-mint">Start with evidence</p><h2 className="mt-4 max-w-3xl text-balance font-display text-4xl font-black text-ice md:text-6xl">Stop guessing where the growth is.</h2><p className="mt-5 max-w-2xl text-lg leading-relaxed text-muted-foreground">Run the free Revenue Audit, get your first-pass opportunity estimate and use the result to decide what deserves a deeper INKSIGHTS Audit.</p></div>
              <div className="flex flex-col gap-3 sm:flex-row lg:flex-col"><PrimaryButton href="/studio-growth-check">Run the free Revenue Audit</PrimaryButton><SecondaryButton href="/offers">View studio solutions</SecondaryButton></div>
            </div>
          </div>
        </div>
      </section>

      <section className="border-t border-border bg-ink">
        <div className="mx-auto max-w-7xl px-6 py-12"><div className="flex flex-col gap-4 text-xs text-muted-foreground md:flex-row md:items-center md:justify-between"><span>INKSIGHTS · Tattoo studio intelligence / diagnostics / revenue optimisation</span><span>Built specifically for UK tattoo studio operators.</span></div></div>
      </section>
    </PublicShell>
  );
}
