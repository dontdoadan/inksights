import { createFileRoute } from "@tanstack/react-router";
import {
  ArrowRight,
  BarChart3,
  CalendarClock,
  Database,
  Repeat2,
  Target,
  Users,
} from "lucide-react";
import { INKSIGHTS_Radar } from "@/components/inksights-radar";
import { INKSIGHTS_DashboardDemo } from "@/components/inksights-dashboard-demo";
import {
  Card,
  JsonLd,
  PrimaryButton,
  PublicShell,
  SecondaryButton,
  SectionHeading,
} from "@/components/public-site";
import { Reveal, TiltCard } from "@/components/interactive-home";

const CANONICAL_URL = "https://getinksights.co.uk/";

export const Route = createFileRoute("/")({
  component: Index,
  head: () => ({
    meta: [
      { title: "INKSIGHTS | Revenue Intelligence for Tattoo Studios" },
      {
        name: "description",
        content:
          "INKSIGHTS helps UK tattoo studios with 3+ artists identify hidden revenue opportunities across capacity, bookings, clients and performance.",
      },
      { property: "og:title", content: "INKSIGHTS | Revenue Intelligence for Tattoo Studios" },
      {
        property: "og:description",
        content: "Find the revenue your tattoo studio is currently missing.",
      },
      { property: "og:url", content: CANONICAL_URL },
    ],
    links: [{ rel: "canonical", href: CANONICAL_URL }],
  }),
});

const leaks = [
  {
    icon: CalendarClock,
    title: "Capacity",
    text: "Empty or poorly allocated artist time that could have become revenue.",
  },
  {
    icon: BarChart3,
    title: "Bookings",
    text: "Enquiries and opportunities that fail to become confirmed appointments.",
  },
  {
    icon: Repeat2,
    title: "Retention",
    text: "Existing clients who could return more often and generate more lifetime value.",
  },
  {
    icon: Users,
    title: "Performance",
    text: "Differences between artists, days, services and client segments hidden by averages.",
  },
] as const;

const insightExamples = [
  [
    "CAPACITY SIGNAL",
    "Tuesday–Thursday utilisation is 17% below the studio average.",
    "Estimated opportunity: £8,400 / year",
  ],
  [
    "BOOKING SIGNAL",
    "Qualified enquiries are not consistently progressing to confirmed bookings.",
    "Estimated opportunity: £5,760 / year",
  ],
  [
    "RETENTION SIGNAL",
    "Second-booking behaviour is below the relevant studio benchmark.",
    "Estimated opportunity: £4,320 / year",
  ],
] as const;

function Index() {
  return (
    <PublicShell>
      <JsonLd
        data={{
          "@context": "https://schema.org",
          "@type": "Organization",
          name: "INKSIGHTS",
          url: CANONICAL_URL,
          description: "Revenue intelligence for UK tattoo studios.",
        }}
      />

      <section className="hero-ambient relative overflow-hidden grid-bg">
        <div className="ambient-orb ambient-orb-one" aria-hidden="true" />
        <div className="ambient-orb ambient-orb-two" aria-hidden="true" />
        <div className="pointer-events-none absolute inset-0 bg-gradient-to-b from-transparent via-ink-deep/30 to-ink-deep" />
        <div className="relative mx-auto max-w-7xl px-6 pb-16 pt-14 md:pb-24 md:pt-20">
          <div className="grid gap-12 lg:grid-cols-[.92fr_1.08fr] lg:items-center">
            <Reveal>
              <div>
                <p className="text-xs font-bold uppercase tracking-[.2em] text-mint">
                  Revenue intelligence for tattoo studios
                </p>
                <h1 className="mt-5 max-w-3xl text-balance font-display text-5xl font-black leading-[.92] tracking-tight text-ice sm:text-6xl md:text-7xl xl:text-[5.25rem]">
                  Find the revenue your tattoo studio is{" "}
                  <span className="text-mint">currently missing.</span>
                </h1>
                <p className="mt-7 max-w-2xl text-lg leading-relaxed text-muted-foreground md:text-xl">
                  INKSIGHTS analyses your bookings, revenue, clients, artists and studio performance
                  to show you where money is being lost, what is causing it and what to fix first.
                </p>
                <p className="mt-4 text-sm font-semibold text-ice">
                  Built specifically for UK tattoo studios with 3+ artists.
                </p>
                <div className="mt-8 flex flex-wrap gap-3">
                  <PrimaryButton href="/studio-growth-check">
                    Get Your Free Studio Growth Check
                  </PrimaryButton>
                  <SecondaryButton href="#how-it-works">See How INKSIGHTS Works</SecondaryButton>
                </div>
              </div>
            </Reveal>
            <Reveal delay={120}>
              <INKSIGHTS_Radar />
            </Reveal>
          </div>
        </div>
      </section>

      <section className="border-y border-border bg-ink">
        <div className="mx-auto max-w-7xl px-6 py-20 md:py-24">
          <SectionHeading
            eyebrow="The problem"
            title="Your studio generates the data. Most studios don't use it."
            description="Every booking, enquiry, cancellation, client, artist and transaction creates a signal. INKSIGHTS turns those scattered signals into a view of where revenue is leaking and which opportunity deserves attention first."
          />
          <div className="mt-10 grid gap-5 md:grid-cols-2 xl:grid-cols-4">
            {leaks.map(({ icon: Icon, title, text }, i) => (
              <Reveal key={title} delay={i * 60} className="h-full">
                <TiltCard className="h-full">
                  <Card className="h-full bg-ink-deep">
                    <Icon className="h-7 w-7 text-mint" />
                    <h3 className="mt-6 font-display text-xl font-black text-ice">{title}</h3>
                    <p className="mt-3 text-sm leading-relaxed text-muted-foreground">{text}</p>
                  </Card>
                </TiltCard>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      <section
        id="how-it-works"
        className="relative overflow-hidden border-b border-border bg-ink-deep"
      >
        <div className="mx-auto max-w-7xl px-6 py-20 md:py-28">
          <div className="grid gap-12 lg:grid-cols-[.8fr_1.2fr] lg:items-end">
            <Reveal>
              <SectionHeading
                eyebrow="From data to decision"
                title="INKSIGHTS doesn't just show you what happened. It tells you where the opportunity is."
              />
            </Reveal>
            <Reveal delay={100}>
              <p className="max-w-2xl text-lg leading-relaxed text-muted-foreground">
                The data, analytics, benchmarking and AI are the mechanism. The outcome is a
                prioritised view of what could improve revenue — followed by a way to measure
                whether the action worked.
              </p>
            </Reveal>
          </div>
          <div className="mt-12 grid gap-3 md:grid-cols-5">
            {["CONNECT", "ANALYSE", "BENCHMARK", "DETECT", "ACT + MEASURE"].map((step, i) => (
              <Reveal key={step} delay={i * 60}>
                <div className="relative rounded-2xl border border-border bg-ink p-5">
                  <span className="font-mono text-xs text-mint">0{i + 1}</span>
                  <h3 className="mt-5 font-display text-lg font-black text-ice">{step}</h3>
                  {i < 4 ? (
                    <ArrowRight className="absolute right-3 top-1/2 hidden h-4 w-4 -translate-y-1/2 text-muted-foreground md:block" />
                  ) : null}
                </div>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      <section className="border-b border-border bg-ink">
        <div className="mx-auto max-w-7xl px-6 py-20 md:py-28">
          <Reveal>
            <SectionHeading
              eyebrow="Inside the product"
              title="The output isn't another report. It's a decision."
              description="This is the kind of intelligence the INKSIGHTS platform is designed to surface."
            />
          </Reveal>
          <Reveal delay={100} className="mt-10">
            <INKSIGHTS_DashboardDemo />
          </Reveal>
        </div>
      </section>

      <section className="border-b border-border bg-ink-deep">
        <div className="mx-auto max-w-7xl px-6 py-20 md:py-28">
          <div className="grid gap-10 lg:grid-cols-[.8fr_1.2fr] lg:items-start">
            <Reveal>
              <SectionHeading
                eyebrow="Opportunity detection"
                title="See what your averages are hiding."
                description="INKSIGHTS looks across capacity, booking behaviour, client return and performance to identify opportunities that are specific enough to act on."
              />
            </Reveal>
            <div className="space-y-4">
              {insightExamples.map(([label, text, value], i) => (
                <Reveal key={label} delay={i * 70}>
                  <div className="rounded-2xl border border-border bg-ink p-5 md:p-6">
                    <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
                      <div>
                        <p className="text-[10px] font-bold uppercase tracking-[.16em] text-mint">
                          {label}
                        </p>
                        <p className="mt-2 text-base font-bold text-ice">{text}</p>
                      </div>
                      <p className="shrink-0 font-display text-lg font-black text-mint">{value}</p>
                    </div>
                  </div>
                </Reveal>
              ))}
            </div>
          </div>
        </div>
      </section>

      <section className="border-b border-border bg-ink">
        <div className="mx-auto max-w-7xl px-6 py-20 md:py-28">
          <div className="grid gap-8 lg:grid-cols-3">
            <Reveal>
              <div className="lg:col-span-2">
                <SectionHeading
                  eyebrow="The intelligence layer"
                  title="Your studio doesn't operate in isolation."
                  description="INKSIGHTS combines studio performance with benchmarking and broader market intelligence. Your numbers tell us what happened; context helps determine what deserves attention."
                />
              </div>
            </Reveal>
            <Reveal delay={120}>
              <div className="rounded-2xl border border-mint/20 bg-ink-deep p-6">
                <Database className="h-7 w-7 text-mint" />
                <h3 className="mt-5 font-display text-xl font-black text-ice">
                  UK studio intelligence
                </h3>
                <p className="mt-3 text-sm leading-relaxed text-muted-foreground">
                  Explore the separate public Studio Map — a growing geographic index of tattoo
                  studios across the UK.
                </p>
                <a
                  href="/studio-map"
                  className="mt-5 inline-flex items-center gap-2 text-sm font-bold text-mint"
                >
                  Explore the Studio Map <ArrowRight className="h-4 w-4" />
                </a>
              </div>
            </Reveal>
          </div>
        </div>
      </section>

      <section className="border-b border-border bg-ink-deep">
        <div className="mx-auto max-w-7xl px-6 py-20 md:py-28">
          <Reveal>
            <SectionHeading
              eyebrow="Built for the right studios"
              title="For tattoo studios that have outgrown guesswork."
              description="INKSIGHTS is designed for established UK studios with 3+ artists, meaningful booking volume and an owner or manager who wants a clearer commercial picture."
            />
          </Reveal>
          <div className="mt-10 grid gap-4 sm:grid-cols-3">
            <div className="rounded-2xl border border-border bg-ink p-5">
              <Target className="h-6 w-6 text-mint" />
              <h3 className="mt-4 font-display text-lg font-black text-ice">3+ artists</h3>
              <p className="mt-2 text-sm text-muted-foreground">
                Enough operational complexity for hidden opportunities to emerge.
              </p>
            </div>
            <div className="rounded-2xl border border-border bg-ink p-5">
              <BarChart3 className="h-6 w-6 text-mint" />
              <h3 className="mt-4 font-display text-lg font-black text-ice">Real booking volume</h3>
              <p className="mt-2 text-sm text-muted-foreground">
                Enough activity for meaningful trends, benchmarks and signals.
              </p>
            </div>
            <div className="rounded-2xl border border-border bg-ink p-5">
              <Users className="h-6 w-6 text-mint" />
              <h3 className="mt-4 font-display text-lg font-black text-ice">
                Commercial ownership
              </h3>
              <p className="mt-2 text-sm text-muted-foreground">
                A decision-maker who is prepared to act on what the data reveals.
              </p>
            </div>
          </div>
        </div>
      </section>

      <section className="relative overflow-hidden bg-ink">
        <div className="ambient-orb ambient-orb-one" aria-hidden="true" />
        <div className="relative mx-auto max-w-5xl px-6 py-20 text-center md:py-28">
          <Reveal>
            <p className="text-xs font-bold uppercase tracking-[.18em] text-mint">
              Start with the diagnosis
            </p>
            <h2 className="mt-4 text-balance font-display text-4xl font-black text-ice md:text-6xl">
              Find out where your studio's biggest opportunity is.
            </h2>
            <p className="mx-auto mt-5 max-w-2xl text-lg leading-relaxed text-muted-foreground">
              Answer a few questions about your studio and identify the commercial constraint most
              worth investigating.
            </p>
            <div className="mt-8 flex justify-center">
              <PrimaryButton href="/studio-growth-check">
                Get Your Free Studio Growth Check
              </PrimaryButton>
            </div>
          </Reveal>
        </div>
      </section>
    </PublicShell>
  );
}
