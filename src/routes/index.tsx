import { createFileRoute } from "@tanstack/react-router";
import { BarChart3, Database, Gauge, Search, ShieldCheck, Sparkles, Target, Users } from "lucide-react";
import { HeroSignalPanel, Reveal, SignalObservatory, SignalTicker, TiltCard } from "@/components/interactive-home";
import { StudioJourney, StudioFaqs, IndustryEnquiry } from "@/components/studio-journey";
import { Card, JsonLd, Logo, PrimaryButton, PublicShell, RevenueLeakageMap, SecondaryButton } from "@/components/public-site";

const CANONICAL_URL = "https://getinksights.co.uk/";

export const Route = createFileRoute("/")({
  component: Index,
  head: () => ({
    meta: [
      { title: "Tattoo Studio Growth & Intelligence | INKSIGHTS" },
      { name: "description", content: "Find what is holding your UK tattoo studio back. Start with a free Growth Check, then explore the £395 Studio Intelligence Audit and practical next steps." },
      { property: "og:title", content: "Tattoo Studio Growth & Intelligence | INKSIGHTS" },
      { property: "og:description", content: "Find the commercial constraint holding your tattoo studio back, then act on the evidence." },
      { property: "og:url", content: CANONICAL_URL },
    ],
    links: [{ rel: "canonical", href: CANONICAL_URL }],
  }),
});

const signals = [
  [Search, "Being found online", "Check whether people can easily find your studio on Google, Maps and other places they search."],
  [BarChart3, "Turning enquiries into bookings", "See how many people enquire, how many book and where potential clients stop."],
  [Target, "Filling available artist time", "Understand empty diary slots, cancellations and how much working time is booked."],
  [Users, "Getting clients to return", "Look at repeat appointments, ongoing projects and people who book again."],
] as const;

function Index() {
  return (
    <PublicShell>
      <JsonLd data={[{
        "@context": "https://schema.org",
        "@type": "Organization",
        "@id": "https://getinksights.co.uk/#organization",
        name: "INKSIGHTS",
        alternateName: "INKSIGHTS Tattoo Studio Growth Intelligence",
        url: CANONICAL_URL,
        logo: "https://getinksights.co.uk/brand/logo-v3/primary-dark.svg",
        description: "Growth intelligence and commercial systems designed specifically for UK tattoo studios.",
        areaServed: { "@type": "Country", name: "United Kingdom" },
        contactPoint: [{ "@type": "ContactPoint", contactType: "customer support", email: "contact@getinksights.co.uk", availableLanguage: "English" }, { "@type": "ContactPoint", contactType: "sales", email: "commercial@getinksights.co.uk", availableLanguage: "English" }],
        knowsAbout: [
          "tattoo studio growth",
          "tattoo studio SEO",
          "tattoo studio marketing",
          "tattoo studio booking",
          "tattoo studio management",
          "tattoo studio revenue",
          "tattoo client retention",
        ],
      }, {
        "@context": "https://schema.org",
        "@type": "WebSite",
        "@id": "https://getinksights.co.uk/#website",
        name: "INKSIGHTS",
        alternateName: "INKSIGHTS Tattoo Studio Growth Intelligence",
        url: CANONICAL_URL,
        publisher: { "@id": "https://getinksights.co.uk/#organization" },
      }]} />

      <section className="brand-dark cinematic-hero hero-ambient relative overflow-hidden">
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
                <h1 className="mt-7 max-w-5xl text-balance font-display text-4xl font-bold leading-tight tracking-tight text-ice sm:text-5xl md:text-6xl xl:text-7xl">
                  Find what's holding <span className="text-mint">your tattoo studio back.</span>
                </h1>
                <p className="mt-7 max-w-2xl text-lg leading-relaxed text-muted-foreground md:text-xl">
                  Understand why enquiries may not become bookings, where artist time goes unused, and which improvements are worth testing first. INKSIGHTS helps UK studio owners decide what to do next, using evidence rather than guesses.
                </p>
                <div className="mt-9 flex flex-wrap gap-3">
                  <PrimaryButton href="/studio-growth-check">Run the free Studio Growth Check</PrimaryButton>
                  <SecondaryButton href="/offers/studio-intelligence-audit">Explore the £395 audit</SecondaryButton>
                </div>
                <p className="mt-5 max-w-2xl text-sm leading-relaxed text-muted-foreground">
                  For UK studios with 3+ artists. The free check uses your figures; you can also contact us if you do not have them ready. No purchase required.
                </p>
              </div>
            </Reveal>

            <Reveal delay={120}>
              <HeroSignalPanel />
            </Reveal>
          </div>
        </div>
      </section>

      <StudioJourney />
      <SignalTicker />
      <SignalObservatory />

      <section className="brand-dark border-y border-border bg-ink">
        <div className="mx-auto max-w-7xl px-6 py-20 md:py-24">
          <Reveal><p className="text-xs font-bold uppercase tracking-[.18em] text-mint">What INKSIGHTS checks</p><h2 className="mt-4 max-w-4xl text-balance font-display text-4xl font-black text-ice md:text-6xl">More enquiries do not always mean more bookings. Find out where to focus.</h2></Reveal>
          <div className="mt-10 grid gap-5 md:grid-cols-2 xl:grid-cols-4">
            {signals.map(([Icon, title, text], i) => <Reveal key={title} delay={i * 70} className="h-full"><TiltCard className="h-full"><Card className="h-full bg-ink-deep p-6"><Icon className="h-7 w-7 text-mint" /><h3 className="mt-6 font-display text-xl font-black text-ice">{title}</h3><p className="mt-3 text-sm leading-relaxed text-muted-foreground">{text}</p></Card></TiltCard></Reveal>)}
          </div>
        </div>
      </section>

      <section className="brand-dark border-b border-border bg-ink-deep">
        <div className="mx-auto max-w-7xl px-6 py-16 md:py-24">
          <RevenueLeakageMap />
        </div>
      </section>


      <section className="brand-light brand-light-logo-surface relative overflow-hidden border-b border-border bg-ink">
        <Logo variant="primary-light" decorative className="brand-light-logo-watermark" />
        <div className="relative mx-auto max-w-7xl px-6 py-20 md:py-28">
          <div className="grid gap-6 lg:grid-cols-[.9fr_1.1fr]">
            <Reveal><div><p className="text-xs font-bold uppercase tracking-[.18em] text-mint">Evidence you can inspect</p><h2 className="mt-4 text-balance font-display text-4xl font-black text-ice md:text-5xl">Know what supports each recommendation.</h2><p className="mt-5 text-lg leading-relaxed text-muted-foreground">INKSIGHTS is early-stage. Our proof library shows labelled examples and the method behind the work. We are building towards measured studio case studies; the illustrative scores on this site are not client results.</p><a href="/case-studies" className="mt-5 inline-flex font-bold text-mint">See the examples and evidence standard →</a><a href="/research-methodology" className="mt-3 block text-sm font-bold text-mint hover:text-mint-soft">How the data is collected and verified →</a></div></Reveal>
            <div className="grid gap-4 sm:grid-cols-2">
              {[{ icon: Database, title: "Studio context", text: "Check the studio, location and available information before drawing conclusions." }, { icon: Gauge, title: "Clear baselines", text: "Record the starting position and data gaps before recommending a change." }, { icon: Target, title: "A practical priority", text: "Prioritise the studio problem worth solving next, rather than selling another tactic." }, { icon: ShieldCheck, title: "Evidence first", text: "Observed data, public evidence, estimates and unknowns remain clearly distinguished." }].map(({ icon: Icon, title, text }, i) => <Reveal key={title} delay={i * 60}><div className="rounded-2xl border border-border bg-ink-deep p-6"><Icon className="h-6 w-6 text-mint" /><h3 className="mt-5 font-display text-lg font-black text-ice">{title}</h3><p className="mt-2 text-sm leading-relaxed text-muted-foreground">{text}</p></div></Reveal>)}
            </div>
          </div>
        </div>
      </section>

      <section className="brand-light relative overflow-hidden border-b border-border bg-ink-deep">
        <Logo variant="icon" decorative className="brand-light-icon-watermark" />
        <div className="relative mx-auto max-w-7xl px-6 py-16 md:py-20">
          <div className="rounded-3xl border border-mint/20 bg-ink p-8 md:p-10">
            <div className="grid gap-8 lg:grid-cols-[1fr_auto] lg:items-center">
              <div><p className="text-xs font-bold uppercase tracking-[.18em] text-mint">Free studio tool</p><h2 className="mt-3 max-w-3xl font-display text-3xl font-black text-ice md:text-4xl">Explore what a pricing change could mean.</h2><p className="mt-3 max-w-2xl text-sm leading-relaxed text-muted-foreground">Compare your rates with the tool’s reference bands alongside booking lead time. Treat the result as a planning aid, not a verified market valuation or a reason to raise prices automatically.</p></div>
              <PrimaryButton href="/pricing-benchmark">Open Pricing Benchmark</PrimaryButton>
            </div>
          </div>
        </div>
      </section>

      <section className="brand-dark border-b border-border bg-ink">
        <div className="mx-auto max-w-7xl px-6 py-20 md:py-24">
          <Reveal>
            <div className="grid gap-8 lg:grid-cols-[.8fr_1.2fr] lg:items-start">
              <div>
                <p className="text-xs font-bold uppercase tracking-[.18em] text-mint">Tattoo studio growth library</p>
                <h2 className="mt-4 text-balance font-display text-4xl font-black text-ice md:text-5xl">
                  Understand the system before choosing the tactic.
                </h2>
                <p className="mt-5 text-base leading-relaxed text-muted-foreground">
                  Use the INKSIGHTS guides to diagnose the commercial relationship between discovery, enquiries, bookings,
                  capacity, client return and revenue.
                </p>
                <a href="/resources" className="mt-6 inline-flex font-bold text-mint hover:text-mint-soft">
                  Browse all studio tools and guides →
                </a>
              </div>
              <div className="grid gap-4 sm:grid-cols-2">
                {[
                  ["/tattoo-studio-growth", "Tattoo studio growth", "Find the first constraint limiting profitable growth."],
                  ["/tattoo-studio-seo", "Tattoo studio SEO", "Improve Google and local-search discovery with evidence."],
                  ["/tattoo-studio-marketing", "Tattoo studio marketing", "Connect demand generation to qualified bookings."],
                  ["/tattoo-studio-management", "Tattoo studio management", "Control enquiries, capacity, workflow and KPIs."],
                  ["/tattoo-studio-booking", "Tattoo studio booking", "Turn qualified enquiries into protected diary time."],
                  ["/tattoo-studio-client-retention", "Client retention", "Build repeat work, referrals and reactivation."],
                  ["/tattoo-studio-revenue", "Tattoo studio revenue", "Explain revenue through volume, value and frequency."],
                  ["/tattoo-studio-software", "Tattoo studio software", "Compare platforms against the workflow they must support."],
                ].map(([href, title, description]) => (
                  <a key={href} href={href} className="rounded-2xl border border-border bg-ink-deep p-5 transition hover:border-mint">
                    <h3 className="font-display text-lg font-black text-ice">{title}</h3>
                    <p className="mt-2 text-sm leading-relaxed text-muted-foreground">{description}</p>
                  </a>
                ))}
              </div>
            </div>
          </Reveal>
        </div>
      </section>

      <StudioFaqs />
      <IndustryEnquiry />
      <section className="brand-dark relative overflow-hidden">
        <div className="mx-auto max-w-7xl px-6 py-20 md:py-28">
          <div className="rounded-3xl border border-mint/30 bg-ink-deep p-8 md:p-12">
            <div className="grid gap-10 lg:grid-cols-[1fr_auto] lg:items-center">
              <div><p className="text-xs font-bold uppercase tracking-[.18em] text-mint">Start with evidence</p><h2 className="mt-4 max-w-3xl text-balance font-display text-4xl font-black text-ice md:text-6xl">Stop guessing where the growth is.</h2><p className="mt-5 max-w-2xl text-lg leading-relaxed text-muted-foreground">Start with a free estimate based on your figures. If the opportunity needs investigation, the £395 Studio Intelligence Audit provides a structured review and a 90-day action plan.</p></div>
              <div className="flex flex-col gap-3 sm:flex-row lg:flex-col"><PrimaryButton href="/studio-growth-check">Run the free Studio Growth Check</PrimaryButton><SecondaryButton href="/offers">View studio solutions</SecondaryButton></div>
            </div>
          </div>
        </div>
      </section>

      <section className="brand-dark border-t border-border bg-ink">
        <div className="mx-auto max-w-7xl px-6 py-12"><div className="flex flex-col gap-4 text-xs text-muted-foreground md:flex-row md:items-center md:justify-between"><span>INKSIGHTS · Tattoo studio intelligence / diagnostics / revenue optimisation</span><span>Built specifically for UK tattoo studio operators.</span></div></div>
      </section>
    </PublicShell>
  );
}
