import { createFileRoute } from "@tanstack/react-router";
import { ArrowRight, BarChart3, CalendarCheck2, Eye, Gauge, Search, ShieldCheck, Sparkles, Users } from "lucide-react";
import {
  HeroSignalPanel,
  InteractiveJourney,
  Reveal,
  SignalTicker,
  TiltCard,
} from "@/components/interactive-home";
import {
  Card,
  CtaSection,
  JsonLd,
  PrimaryButton,
  PublicShell,
  SecondaryButton,
  SectionHeading,
} from "@/components/public-site";
import { publicOffers } from "@/lib/offer-data";

const CANONICAL_URL = "https://getinksight.co.uk/";

export const Route = createFileRoute("/")({
  component: Index,
  head: () => ({
    meta: [
      { title: "INKSIGHT | Growth Systems for UK Tattoo Studios" },
      {
        name: "description",
        content:
          "Improve tattoo studio visibility, enquiry conversion, booking protection, client retention and post-session revenue with INKSIGHT.",
      },
      { property: "og:title", content: "INKSIGHT | Growth Systems for UK Tattoo Studios" },
      {
        property: "og:description",
        content: "Turn more studio visibility into booked, retained and higher-value clients.",
      },
      { property: "og:url", content: CANONICAL_URL },
      { property: "og:image", content: "https://getinksight.co.uk/og/inksight-growth-systems.png" },
    ],
    links: [{ rel: "canonical", href: CANONICAL_URL }],
  }),
});

const problems = [
  {
    icon: Search,
    title: "Be found locally",
    description: "Correct the Google, website and reputation gaps that prevent nearby clients from finding and trusting the studio.",
    metric: "Visibility",
  },
  {
    icon: CalendarCheck2,
    title: "Convert more enquiries",
    description: "Create a controlled route from first contact to qualified request, deposit, booking and reminder.",
    metric: "Conversion",
  },
  {
    icon: Users,
    title: "Keep more client value",
    description: "Reduce cancellations, improve rebooking and build aftercare, review and return-client systems.",
    metric: "Retention",
  },
] as const;

const faqs = [
  [
    "Is INKSIGHT a generic marketing agency?",
    "No. INKSIGHT is being built from direct experience inside tattooing and is organised around the operational reality of custom enquiries, deposits, multi-session work, aftercare and repeat clients.",
  ],
  [
    "What should a studio do first?",
    "Complete the free Studio Growth Check. It identifies the strongest pressure before recommending an offer, tool or implementation route.",
  ],
  [
    "Are results guaranteed?",
    "No. INKSIGHT provides diagnosis, implementation and measurement. Commercial outcomes depend on the studio, market, offer, access, speed of execution and existing demand.",
  ],
  [
    "Why is the founding offer £249?",
    "The INKSIGHT 72-Hour Studio Visibility Fix is deliberately narrow and action-led. It is not ongoing management; it corrects a defined set of visibility and conversion issues within a controlled scope.",
  ],
] as const;

function Index() {
  return (
    <PublicShell>
      <JsonLd
        data={[
          {
            "@context": "https://schema.org",
            "@type": "Organization",
            name: "INKSIGHT",
            url: CANONICAL_URL,
            email: "contact@getinksight.co.uk",
            description: "Growth systems for UK tattoo studios.",
          },
          {
            "@context": "https://schema.org",
            "@type": "WebSite",
            name: "INKSIGHT",
            url: CANONICAL_URL,
          },
        ]}
      />

      <section className="hero-ambient relative overflow-hidden grid-bg">
        <div className="ambient-orb ambient-orb-one" aria-hidden="true" />
        <div className="ambient-orb ambient-orb-two" aria-hidden="true" />
        <div className="pointer-events-none absolute inset-0 bg-gradient-to-b from-transparent via-ink-deep/40 to-ink-deep" />
        <div className="relative mx-auto grid max-w-7xl gap-14 px-6 pb-20 pt-16 lg:grid-cols-[1.08fr_.92fr] lg:items-center md:pb-28 md:pt-24">
          <Reveal>
            <div>
              <div className="inline-flex items-center gap-2 rounded-full border border-mint/30 bg-mint/5 px-4 py-2 text-xs font-bold uppercase tracking-[0.18em] text-mint backdrop-blur-xl">
                <Sparkles className="h-4 w-4" /> Growth systems built for tattoo studios
              </div>
              <h1 className="mt-7 max-w-5xl text-balance font-display text-5xl font-black leading-[0.95] tracking-tight text-ice sm:text-6xl md:text-7xl xl:text-8xl">
                Turn more studio visibility into <span className="text-mint">booked, retained and higher-value clients.</span>
              </h1>
              <p className="mt-7 max-w-3xl text-lg leading-relaxed text-muted-foreground md:text-xl">
                INKSIGHT diagnoses and improves the commercial systems behind tattoo studio growth—from Google visibility and enquiry conversion to cancellations, retention and aftercare revenue.
              </p>
              <div className="mt-9 flex flex-wrap gap-3">
                <PrimaryButton href="/studio-growth-check">Start the free Growth Check</PrimaryButton>
                <SecondaryButton href="/offers/72-hour-visibility-fix">See the £249 Visibility Fix</SecondaryButton>
              </div>
              <div className="mt-10 grid max-w-4xl gap-3 sm:grid-cols-2">
                {["Direct tattoo-industry experience", "No invented performance claims", "Immediate diagnostic result", "Founding-studio offer live"].map((item, index) => (
                  <Reveal key={item} delay={80 + index * 60}>
                    <div className="flex items-center gap-2 rounded-xl border border-border bg-ink/70 px-4 py-3 text-sm text-muted-foreground backdrop-blur-xl">
                      <ShieldCheck className="h-4 w-4 shrink-0 text-mint" /> {item}
                    </div>
                  </Reveal>
                ))}
              </div>
            </div>
          </Reveal>

          <Reveal delay={140}>
            <HeroSignalPanel />
          </Reveal>
        </div>
        <SignalTicker />
      </section>

      <InteractiveJourney />

      <section className="border-b border-border bg-ink">
        <div className="mx-auto max-w-7xl px-6 py-20 md:py-24">
          <Reveal>
            <SectionHeading
              eyebrow="The commercial system"
              title="A studio does not have one marketing problem."
              description="Demand is lost across discovery, trust, enquiry handling, booking protection and retention. INKSIGHT fixes the constraint that matters first."
            />
          </Reveal>
          <div className="mt-10 grid gap-5 lg:grid-cols-3">
            {problems.map((problem, index) => {
              const Icon = problem.icon;
              return (
                <Reveal key={problem.title} delay={index * 90} className="h-full">
                  <TiltCard className="h-full">
                    <Card className="h-full bg-ink-deep p-7">
                      <div className="flex items-center justify-between">
                        <span className="flex h-12 w-12 items-center justify-center rounded-xl bg-mint/10 text-mint"><Icon className="h-6 w-6" /></span>
                        <span className="text-xs font-bold uppercase tracking-[0.15em] text-muted-foreground">{problem.metric}</span>
                      </div>
                      <h3 className="mt-7 font-display text-2xl font-black text-ice">{problem.title}</h3>
                      <p className="mt-3 leading-relaxed text-muted-foreground">{problem.description}</p>
                    </Card>
                  </TiltCard>
                </Reveal>
              );
            })}
          </div>
        </div>
      </section>

      <section>
        <div className="mx-auto max-w-7xl px-6 py-20 md:py-28">
          <Reveal>
            <SectionHeading
              eyebrow="How it works"
              title="Diagnose. Correct. Measure."
              description="The service architecture prevents a studio from buying disconnected tactics before the underlying constraint is understood."
            />
          </Reveal>
          <div className="mt-12 grid gap-5 md:grid-cols-3">
            {[
              ["01", "Diagnose the constraint", "Score visibility, enquiries, diary utilisation, no-shows, retention, reviews and owner control."],
              ["02", "Correct the smallest useful system", "Apply a tightly scoped fix instead of starting with a large retainer or unnecessary software migration."],
              ["03", "Measure the commercial change", "Track leads, bookings, response time, cancellations, repeat clients and the next operational bottleneck."],
            ].map(([number, title, text], index) => (
              <Reveal key={number} delay={index * 90} className="h-full">
                <TiltCard className="h-full">
                  <div className="interactive-card h-full rounded-2xl border border-border bg-ink p-7">
                    <div className="font-display text-5xl font-black text-mint/35">{number}</div>
                    <h3 className="mt-5 font-display text-2xl font-black text-ice">{title}</h3>
                    <p className="mt-3 leading-relaxed text-muted-foreground">{text}</p>
                  </div>
                </TiltCard>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      <section className="border-y border-border bg-ink">
        <div className="mx-auto grid max-w-7xl gap-10 px-6 py-20 lg:grid-cols-[1.1fr_.9fr] lg:items-center md:py-28">
          <Reveal>
            <div>
              <p className="text-xs font-bold uppercase tracking-[0.18em] text-mint">Primary founding offer</p>
              <h2 className="mt-4 text-balance font-display text-4xl font-black text-ice md:text-6xl">INKSIGHT 72-Hour Studio Visibility Fix</h2>
              <p className="mt-6 max-w-2xl text-lg leading-relaxed text-muted-foreground">
                A compact intervention for studios that already produce strong work but present it through a vague profile, weak booking call to action or inconsistent local visibility path.
              </p>
              <div className="mt-8 flex flex-wrap gap-3">
                <PrimaryButton href="/offers/72-hour-visibility-fix">Review the complete offer</PrimaryButton>
                <SecondaryButton href="/studio-growth-check">Check studio fit first</SecondaryButton>
              </div>
            </div>
          </Reveal>
          <Reveal delay={140} className="h-full">
            <TiltCard className="h-full">
              <Card className="h-full border-mint/40 bg-ink-deep p-8">
                <div className="flex items-end justify-between gap-4">
                  <div>
                    <p className="text-xs font-bold uppercase tracking-[0.16em] text-mint">Founding rate</p>
                    <div className="mt-2 font-display text-6xl font-black text-ice">£249</div>
                  </div>
                  <span className="rounded-full border border-mint/30 bg-mint/10 px-4 py-2 text-xs font-bold text-mint">3 studios</span>
                </div>
                <ul className="mt-7 space-y-3 text-sm leading-relaxed text-muted-foreground">
                  <li>✓ Profile and booking-flow review</li>
                  <li>✓ Exact copy and CTA corrections</li>
                  <li>✓ Priority local visibility corrections</li>
                  <li>✓ Three-working-day implementation checklist</li>
                  <li>✓ Follow-up review and next-step recommendation</li>
                </ul>
              </Card>
            </TiltCard>
          </Reveal>
        </div>
      </section>

      <section>
        <div className="mx-auto max-w-7xl px-6 py-20 md:py-28">
          <div className="flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
            <Reveal>
              <SectionHeading
                eyebrow="Solutions by constraint"
                title="Use the smallest offer that solves the real problem."
                description="Every route begins with diagnosis; no studio should be pushed into a larger engagement because the website lacks a smaller option."
              />
            </Reveal>
            <a href="/offers" className="group inline-flex items-center gap-2 font-bold text-mint hover:text-mint-soft">View all solutions <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" /></a>
          </div>
          <div className="mt-10 grid gap-5 md:grid-cols-2 xl:grid-cols-3">
            {publicOffers.map((solution, index) => (
              <Reveal key={solution.slug} delay={(index % 3) * 75} className="h-full">
                <TiltCard className="h-full">
                  <a href={`/offers/${solution.slug}`} className="interactive-card group block h-full rounded-2xl border border-border bg-ink p-7 transition hover:border-mint">
                    <div className="flex flex-wrap items-start justify-between gap-3">
                      <h3 className="font-display text-2xl font-black text-ice">{solution.name}</h3>
                      <span className="rounded-full bg-mint/10 px-3 py-1 text-xs font-bold text-mint">{solution.price}</span>
                    </div>
                    <p className="mt-4 leading-relaxed text-muted-foreground">{solution.summary}</p>
                    <p className="mt-4 text-xs font-bold uppercase tracking-[0.12em] text-muted-foreground">{solution.commercialStatus}</p>
                    <span className="mt-6 inline-flex items-center gap-2 text-sm font-bold text-mint">Explore route <ArrowRight className="h-4 w-4 transition group-hover:translate-x-1" /></span>
                  </a>
                </TiltCard>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      <section className="border-y border-border bg-ink">
        <div className="mx-auto grid max-w-7xl gap-10 px-6 py-20 lg:grid-cols-[.9fr_1.1fr] lg:items-center md:py-28">
          <Reveal>
            <div>
              <p className="text-xs font-bold uppercase tracking-[0.18em] text-mint">Process proof</p>
              <h2 className="mt-4 text-balance font-display text-4xl font-black text-ice md:text-5xl">See the diagnosis before trusting the claim.</h2>
              <p className="mt-5 text-lg leading-relaxed text-muted-foreground">
                Until INKSIGHT has a larger body of client outcomes, proof is shown through transparent methodology, working systems and clearly labelled demonstrations—not fabricated testimonials.
              </p>
              <div className="mt-7"><SecondaryButton href="/case-studies">Open proof library</SecondaryButton></div>
            </div>
          </Reveal>
          <Reveal delay={130} className="h-full">
            <TiltCard className="h-full">
              <div className="interactive-card h-full rounded-3xl border border-mint/35 bg-ink-deep p-7 shadow-2xl shadow-black/20">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-xs font-bold uppercase tracking-[0.16em] text-mint">Demonstration audit</p>
                    <h3 className="mt-2 font-display text-2xl font-black text-ice">Example growth diagnosis</h3>
                  </div>
                  <Gauge className="h-9 w-9 text-mint" />
                </div>
                <div className="mt-7 grid grid-cols-2 gap-3 sm:grid-cols-4">
                  {[["Visibility", "42"], ["Conversion", "38"], ["Retention", "61"], ["Readiness", "85"]].map(([label, value]) => (
                    <div key={label} className="rounded-xl border border-border bg-ink p-4">
                      <div className="font-display text-3xl font-black text-mint">{value}</div>
                      <div className="mt-1 text-xs text-muted-foreground">{label}</div>
                    </div>
                  ))}
                </div>
                <div className="mt-5 rounded-xl border border-border bg-ink p-5">
                  <p className="text-xs font-bold uppercase tracking-[0.14em] text-muted-foreground">Primary constraint</p>
                  <p className="mt-2 font-bold text-ice">Visitors reach the profile but cannot identify a clear booking route.</p>
                  <p className="mt-2 text-sm leading-relaxed text-muted-foreground">Recommended first action: simplify headline, pinned proof and enquiry CTA before increasing ad spend.</p>
                </div>
              </div>
            </TiltCard>
          </Reveal>
        </div>
      </section>

      <section>
        <div className="mx-auto grid max-w-7xl gap-10 px-6 py-20 lg:grid-cols-[1fr_1fr] lg:items-center md:py-28">
          <Reveal className="h-full">
            <TiltCard className="h-full">
              <div className="interactive-card h-full rounded-3xl border border-border bg-gradient-to-br from-ink-elev to-ink p-8 md:p-10">
                <Eye className="h-9 w-9 text-mint" />
                <h2 className="mt-7 font-display text-4xl font-black text-ice">Built from inside tattooing.</h2>
                <p className="mt-5 leading-relaxed text-muted-foreground">
                  INKSIGHT was started by a working tattoo artist who understands the practical difference between a normal appointment business and custom tattoo work: projects need qualification, references, deposits, multiple sittings, healing, content and long-term client trust.
                </p>
                <a href="/about" className="group mt-7 inline-flex items-center gap-2 font-bold text-mint">Read the operating principles <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" /></a>
              </div>
            </TiltCard>
          </Reveal>
          <Reveal delay={130}>
            <div>
              <SectionHeading
                eyebrow="Resource system"
                title="Useful before a studio ever becomes a client."
                description="Tools and guides are separated for studio owners and tattoo clients, allowing studios to learn internally and share credible education externally."
              />
              <div className="mt-7 grid gap-3 sm:grid-cols-2">
                {[
                  [BarChart3, "Visibility Scorecard", "/tattoo-studio-visibility-scorecard"],
                  [CalendarCheck2, "Full Sleeve Cost Guide", "/guides/full-sleeve-cost-uk"],
                  [Sparkles, "Grey-Line Healing Guide", "/guides/grey-line-healing-week-by-week"],
                  [Gauge, "Pain Chart Reality Check", "/tools/tattoo-pain-chart-reality-check"],
                ].map(([Icon, label, href]) => {
                  const ResourceIcon = Icon as typeof BarChart3;
                  return (
                    <a key={String(href)} href={String(href)} className="interactive-card flex items-center gap-3 rounded-xl border border-border bg-ink p-4 font-bold text-ice hover:border-mint hover:text-mint">
                      <ResourceIcon className="h-5 w-5 text-mint" /> {String(label)}
                    </a>
                  );
                })}
              </div>
              <div className="mt-6"><SecondaryButton href="/resources">Browse all resources</SecondaryButton></div>
            </div>
          </Reveal>
        </div>
      </section>

      <section className="border-t border-border bg-ink">
        <div className="mx-auto max-w-5xl px-6 py-20 md:py-28">
          <Reveal>
            <SectionHeading eyebrow="Common questions" title="Clear scope before commitment." />
          </Reveal>
          <div className="mt-9 space-y-3">
            {faqs.map(([question, answer], index) => (
              <Reveal key={question} delay={index * 45}>
                <details className="group interactive-card rounded-2xl border border-border bg-ink-deep p-5 open:border-mint/50">
                  <summary className="cursor-pointer list-none font-display text-lg font-bold text-ice">{question}</summary>
                  <p className="mt-4 max-w-3xl leading-relaxed text-muted-foreground">{answer}</p>
                </details>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      <CtaSection />
    </PublicShell>
  );
}
