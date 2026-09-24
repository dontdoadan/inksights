import { createFileRoute } from "@tanstack/react-router";
import { BarChart3, Calculator, Search, ShieldCheck, Workflow } from "lucide-react";
import { CtaSection, JsonLd, PageHero, PublicShell, SectionHeading } from "@/components/public-site";

const CANONICAL_URL = "https://getinksights.co.uk/resources";

export const Route = createFileRoute("/resources")({
  component: ResourcesPage,
  head: () => ({
    meta: [
      { title: "Tattoo Studio Growth Tools & Guides | INKSIGHTS" },
      {
        name: "description",
        content:
          "Free tattoo studio growth diagnostics, visibility tools, booking guides, software comparisons and commercial calculators from INKSIGHTS.",
      },
      { property: "og:title", content: "Tattoo Studio Growth Tools & Guides | INKSIGHTS" },
      {
        property: "og:description",
        content: "Practical growth, visibility, pricing and commercial tools for UK tattoo studio owners.",
      },
      { property: "og:url", content: CANONICAL_URL },
    ],
    links: [{ rel: "canonical", href: CANONICAL_URL }],
  }),
});

const diagnosticResources = [
  {
    icon: Search,
    title: "Free Tattoo Studio Revenue Audit",
    type: "Free diagnostic",
    description:
      "Estimate where revenue may be leaking across capacity, enquiries, bookings, cancellations and repeat clients.",
    href: "/studio-growth-check",
  },
  {
    icon: ShieldCheck,
    title: "Tattoo Studio SEO & Visibility Scorecard",
    type: "15-point diagnostic",
    description:
      "Check Google and local discovery, website indexability, public proof, booking friction and measurement foundations.",
    href: "/tattoo-studio-visibility-scorecard",
  },
] as const;

const modelResources = [
  {
    icon: Calculator,
    title: "Tattoo Studio Revenue Growth Model",
    type: "Commercial calculator",
    description:
      "Model the effect of client volume, average transaction value and purchase frequency, then stress-test the assumptions.",
    href: "/growth-model",
  },
  {
    icon: BarChart3,
    title: "Tattoo Studio Pricing Benchmark",
    type: "Pricing benchmark",
    description:
      "Compare studio pricing with UK reference bands and interpret price position alongside booking lead time before changing rates.",
    href: "/pricing-benchmark",
  },
] as const;

const operatingResources = [
  {
    icon: Workflow,
    title: "Tattoo Studio Software Comparison",
    type: "Workflow guide",
    description:
      "Compare booking and studio platforms by enquiry intake, approvals, deposits, consent, communication, reporting and portability.",
    href: "/tattoo-studio-software",
  },
  {
    icon: Search,
    title: "Tattoo Studio SEO",
    type: "Growth guide",
    description:
      "Understand local-search visibility, website relevance, proof and the conditions that affect whether nearby clients can discover the studio.",
    href: "/tattoo-studio-seo",
  },
  {
    icon: Workflow,
    title: "Tattoo Studio Booking",
    type: "Operations guide",
    description:
      "Review the path from enquiry through qualification, deposit, appointment and follow-up without reducing booking to a calendar tool.",
    href: "/tattoo-studio-booking",
  },
  {
    icon: BarChart3,
    title: "Tattoo Studio Revenue",
    type: "Commercial guide",
    description:
      "Break studio revenue into client volume, transaction value, frequency, capacity and leakage so the total becomes explainable.",
    href: "/tattoo-studio-revenue",
  },
  {
    icon: ShieldCheck,
    title: "Tattoo Studio Client Retention",
    type: "Retention guide",
    description:
      "Examine repeat booking, reactivation, referrals and the systems that determine whether the client relationship continues after a session.",
    href: "/tattoo-studio-client-retention",
  },
] as const;

function ResourcesPage() {
  return (
    <PublicShell>
      <JsonLd
        data={{
          "@context": "https://schema.org",
          "@type": "CollectionPage",
          name: "INKSIGHTS resource library",
          url: CANONICAL_URL,
          description: "Tattoo studio growth, visibility, pricing and commercial tools for UK studio owners.",
        }}
      />
      <PageHero
        eyebrow="Resources for UK tattoo studios"
        title={<>Tools that help an owner understand the studio before spending more.</>}
        description={
          <>
            Diagnose performance, test visibility, compare workflows, benchmark pricing and model revenue using tools built for tattoo
            studio owners and operators.
          </>
        }
      />
      <section className="border-b border-border bg-ink">
        <div className="mx-auto max-w-7xl px-6 py-10">
          <div className="grid gap-4 md:grid-cols-3">
            {[
              ["01", "Diagnose", "Start with a diagnostic when the studio is unsure which commercial problem matters most."],
              ["02", "Model", "Use calculators and benchmarks when the question is about economics, pricing or the size of an opportunity."],
              ["03", "Improve the system", "Use the operating guides when the constraint is already understood and the studio needs a better workflow."],
            ].map(([number, title, text]) => (
              <div key={number} className="rounded-2xl border border-border bg-ink-deep p-5">
                <div className="font-mono text-xs text-mint">{number}</div>
                <h2 className="mt-3 font-display text-lg font-black text-ice">{title}</h2>
                <p className="mt-2 text-sm leading-relaxed text-muted-foreground">{text}</p>
              </div>
            ))}
          </div>
        </div>
      </section>
      <ResourceSection
        eyebrow="Diagnose first"
        title="Find the strongest commercial pressure."
        description="Use these diagnostics when the studio is not yet certain whether the problem sits in visibility, conversion, capacity, retention or revenue."
        resources={diagnosticResources}
      />
      <ResourceSection
        eyebrow="Model and benchmark"
        title="Put commercial questions into numbers."
        description="Use these tools to test revenue assumptions, pricing position and the possible size of an opportunity before making a change."
        resources={modelResources}
      />
      <ResourceSection
        eyebrow="Guides and operating systems"
        title="Improve a constraint that is already understood."
        description="Use the operating guides when the studio needs deeper context on search visibility, booking, software, revenue or client retention."
        resources={operatingResources}
      />
      <section className="border-y border-border bg-ink">
        <div className="mx-auto max-w-7xl px-6 py-20 md:py-28">
          <SectionHeading
            eyebrow="Editorial standard"
            title="Specific, sourced and honest about uncertainty."
            description="Where resources use public prices, competitor features or commercial benchmarks, they distinguish evidence from examples and avoid universal claims. Studio-facing resources are built around real operational decisions rather than keyword volume."
          />
        </div>
      </section>
      <CtaSection
        title="Start with the studio diagnosis."
        description="Run the free Revenue Audit and use the result to decide whether a visibility fix, revenue audit, booking intervention or deeper intelligence work is justified."
      />
    </PublicShell>
  );
}

function ResourceSection({
  eyebrow,
  title,
  description,
  resources,
}: {
  eyebrow: string;
  title: string;
  description: string;
  resources: ReadonlyArray<{
    icon: typeof Search;
    title: string;
    type: string;
    description: string;
    href: string;
  }>;
}) {
  return (
    <section>
      <div className="mx-auto max-w-7xl px-6 py-20 md:py-28">
        <SectionHeading eyebrow={eyebrow} title={title} description={description} />
        <div className="mt-10 grid gap-5 md:grid-cols-2">
          {resources.map((resource) => {
            const Icon = resource.icon;
            return (
              <a
                key={resource.href}
                href={resource.href}
                className="group rounded-2xl border border-border bg-ink-deep p-7 transition hover:border-mint"
              >
                <div className="flex items-start justify-between gap-5">
                  <span className="flex h-12 w-12 items-center justify-center rounded-xl bg-mint/10 text-mint">
                    <Icon className="h-6 w-6" />
                  </span>
                  <span className="rounded-full border border-border px-3 py-1 text-xs font-bold text-muted-foreground">
                    {resource.type}
                  </span>
                </div>
                <h3 className="mt-6 font-display text-2xl font-black text-ice">{resource.title}</h3>
                <p className="mt-3 leading-relaxed text-muted-foreground">{resource.description}</p>
                <span className="mt-6 inline-flex items-center gap-2 font-bold text-mint">Open resource</span>
              </a>
            );
          })}
        </div>
      </div>
    </section>
  );
}
