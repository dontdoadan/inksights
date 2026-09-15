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

const studioResources = [
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
  {
    icon: Workflow,
    title: "Tattoo Studio Software Comparison",
    type: "Workflow guide",
    description:
      "Compare booking and studio platforms by enquiry intake, approvals, deposits, consent, communication, reporting and portability.",
    href: "/tattoo-studio-software",
  },
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
      <ResourceSection
        eyebrow="For studio owners"
        title="Diagnose the commercial system."
        description="Use these tools to identify what is restricting demand, bookings, capacity or revenue."
        resources={studioResources}
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
