import { createFileRoute } from "@tanstack/react-router";
import { ArrowRight, CalendarCheck2, ChartNoAxesCombined, Search, Target, UsersRound } from "lucide-react";
import { CtaSection, JsonLd, PageHero, PublicShell, SectionHeading } from "@/components/public-site";

const CANONICAL_URL = "https://getinksights.co.uk/solutions";

const constraints = [
  {
    icon: Search,
    title: "Not enough qualified enquiries",
    summary: "Your portfolio may be strong, but the studio is difficult to discover or weakly positioned when people search locally.",
    symptoms: ["Weak Google visibility", "Inconsistent local signals", "Poor search-to-profile conversion", "Traffic that does not match your preferred work"],
    route: "/offers/72-hour-visibility-fix",
    cta: "Fix the visibility path",
  },
  {
    icon: Target,
    title: "Enquiries are not becoming bookings",
    summary: "Demand exists, but vague intake, slow responses or unclear next steps create leakage between interest and deposit.",
    symptoms: ["High enquiry volume", "Low enquiry-to-booking conversion", "Repeated questions in DMs", "No clear response-time expectation"],
    route: "/offers/revenue-audit",
    cta: "Audit the conversion path",
  },
  {
    icon: CalendarCheck2,
    title: "Artist time is going unused",
    summary: "The studio has available capacity, but the diary is not being filled with the right projects at the right value.",
    symptoms: ["Gaps between appointments", "Unclear utilisation", "Last-minute filling of the diary", "No consistent capacity baseline"],
    route: "/offers/revenue-audit",
    cta: "Audit capacity and revenue",
  },
  {
    icon: UsersRound,
    title: "Clients are not returning",
    summary: "The relationship effectively ends at checkout instead of becoming repeat projects, referrals or future bookings.",
    symptoms: ["Low repeat-booking rate", "Dormant client lists", "No reactivation process", "Inconsistent review or referral requests"],
    route: "/offers/booking-retention-engine",
    cta: "Build the return path",
  },
  {
    icon: ChartNoAxesCombined,
    title: "Revenue looks healthy, but the owner cannot explain it",
    summary: "Reporting shows totals but not the commercial conditions producing them or the constraint most worth fixing next.",
    symptoms: ["Spreadsheet-heavy reporting", "No common KPI definitions", "Unknown lead sources", "Decisions based on anecdote"],
    route: "/offers/revenue-audit",
    cta: "Create a commercial baseline",
  },
];

export const Route = createFileRoute("/solutions")({
  component: SolutionsPage,
  head: () => ({
    meta: [
      { title: "Tattoo Studio Growth Solutions UK | INKSIGHTS" },
      { name: "description", content: "Find the right tattoo studio growth solution for visibility, enquiry conversion, capacity, retention or revenue control." },
      { property: "og:title", content: "Tattoo Studio Growth Solutions UK | INKSIGHTS" },
      { property: "og:description", content: "Start with the constraint. Choose the smallest practical intervention for the studio's actual problem." },
      { property: "og:url", content: CANONICAL_URL },
    ],
    links: [{ rel: "canonical", href: CANONICAL_URL }],
  }),
});

function SolutionsPage() {
  return (
    <PublicShell>
      <JsonLd data={{
        "@context": "https://schema.org",
        "@type": "CollectionPage",
        name: "Tattoo studio growth solutions",
        url: CANONICAL_URL,
        description: "Growth and commercial solutions for UK tattoo studios organised around the constraint being experienced.",
      }} />
      <PageHero
        eyebrow="For UK tattoo studio owners"
        title={<>Do not buy another tactic. Find the constraint.</>}
        description={<>INKSIGHTS diagnoses the commercial system first, then routes the studio to the smallest useful intervention. This is built for established and multi-artist UK studios—not generic small-business marketing.</>}
      >
        <a href="/studio-growth-check" className="inline-flex min-h-12 items-center gap-2 rounded-full bg-mint px-6 py-3 font-bold text-ink-deep">Run the free Revenue Audit <ArrowRight className="h-4 w-4" /></a>
        <a href="/tattoo-studio-visibility-scorecard" className="inline-flex min-h-12 items-center rounded-full border border-border px-6 py-3 font-bold text-ice">Check studio visibility</a>
      </PageHero>

      <section>
        <div className="mx-auto max-w-7xl px-6 py-20 md:py-28">
          <SectionHeading
            eyebrow="Common studio constraints"
            title="The same revenue total can hide very different problems."
            description="A studio can need more visibility, better conversion, tighter booking control, stronger capacity management or better retention. Treating every problem as a traffic problem wastes time and money."
          />
          <div className="mt-10 grid gap-5 md:grid-cols-2 xl:grid-cols-3">
            {constraints.map((item) => {
              const Icon = item.icon;
              return (
                <article key={item.title} className="group flex h-full flex-col rounded-2xl border border-border bg-ink p-7 transition hover:border-mint">
                  <Icon className="h-7 w-7 text-mint" />
                  <h2 className="mt-6 font-display text-2xl font-black text-ice">{item.title}</h2>
                  <p className="mt-3 leading-relaxed text-muted-foreground">{item.summary}</p>
                  <ul className="mt-5 space-y-2 text-sm text-muted-foreground">
                    {item.symptoms.map((symptom) => <li key={symptom} className="flex gap-2"><span className="text-mint">•</span>{symptom}</li>)}
                  </ul>
                  <a href={item.route} className="mt-auto pt-7 inline-flex items-center gap-2 font-bold text-mint">{item.cta} <ArrowRight className="h-4 w-4 transition group-hover:translate-x-1" /></a>
                </article>
              );
            })}
          </div>
        </div>
      </section>

      <section className="border-y border-border bg-ink">
        <div className="mx-auto max-w-7xl px-6 py-20 md:py-28">
          <SectionHeading
            eyebrow="How INKSIGHTS works"
            title="Diagnosis before implementation. Evidence before expansion."
            description="Every engagement starts by establishing what is known, what is missing and which constraint is commercially material. The intervention then has a defined baseline, owner and measurement path."
          />
          <div className="mt-10 grid gap-5 md:grid-cols-4">
            {[
              ["01", "Diagnose", "Map the studio's demand, booking and revenue conditions."],
              ["02", "Baseline", "Separate measured data from assumptions and missing information."],
              ["03", "Intervene", "Apply the smallest useful correction that addresses the constraint."],
              ["04", "Verify", "Measure the change before recommending a larger system."],
            ].map(([number, title, text]) => (
              <div key={number} className="rounded-2xl border border-border bg-ink-deep p-6">
                <div className="font-display text-4xl font-black text-mint/35">{number}</div>
                <h2 className="mt-5 font-display text-xl font-black text-ice">{title}</h2>
                <p className="mt-3 text-sm leading-relaxed text-muted-foreground">{text}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section>
        <div className="mx-auto max-w-5xl px-6 py-20 text-center md:py-28">
          <p className="text-xs font-bold uppercase tracking-[0.18em] text-mint">Built for tattoo studios</p>
          <h2 className="mt-4 text-balance font-display text-4xl font-black text-ice md:text-6xl">The operating model behind the website is the product.</h2>
          <p className="mx-auto mt-6 max-w-3xl text-lg leading-relaxed text-muted-foreground">INKSIGHTS is building a proprietary dataset covering the conditions that shape tattoo-studio performance: visibility, enquiries, bookings, capacity, cancellations, transaction value, retention and market signals.</p>
        </div>
      </section>
      <CtaSection title="Start with your studio's actual constraint." description="Run the free Revenue Audit, get the first-pass opportunity estimate and decide whether a deeper INKSIGHTS Audit is justified." />
    </PublicShell>
  );
}
