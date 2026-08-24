import { createFileRoute } from "@tanstack/react-router";
import { ArrowRight, BookOpen, Calculator, HeartPulse, Search, ShieldCheck, Workflow } from "lucide-react";
import { CtaSection, JsonLd, PageHero, PublicShell, SectionHeading } from "@/components/public-site";

const CANONICAL_URL = "https://getinksight.co.uk/resources";

export const Route = createFileRoute("/resources")({
  component: ResourcesPage,
  head: () => ({
    meta: [
      { title: "Tattoo Studio Tools and Client Guides | INKSIGHT" },
      { name: "description", content: "Free tattoo studio diagnostics, software comparisons, pricing tools, pain guidance and grey-line healing education." },
      { property: "og:title", content: "Tattoo Studio Tools and Client Guides | INKSIGHT" },
      { property: "og:url", content: CANONICAL_URL },
    ],
    links: [{ rel: "canonical", href: CANONICAL_URL }],
  }),
});

const studioResources = [
  {
    icon: Search,
    title: "Free Studio Growth Check",
    type: "Qualification tool",
    description: "Diagnose visibility, enquiries, diary utilisation, cancellations, retention and readiness, then receive the most useful route.",
    href: "/studio-growth-check",
  },
  {
    icon: ShieldCheck,
    title: "Tattoo Studio Visibility Scorecard",
    type: "15-point diagnostic",
    description: "Check local discovery, website indexability, public proof, booking friction and retention foundations.",
    href: "/tattoo-studio-visibility-scorecard",
  },
  {
    icon: Workflow,
    title: "Tattoo Studio Software Comparison",
    type: "Workflow guide",
    description: "Compare booking and studio platforms by enquiry, approval, deposits, consent, communication and economics.",
    href: "/tattoo-studio-software",
  },
  {
    icon: Calculator,
    title: "Studio Growth Model",
    type: "Commercial calculator",
    description: "Explore how visibility, transaction value, repeat clients and operational systems compound across the studio.",
    href: "/growth-model",
  },
] as const;

const clientResources = [
  {
    icon: HeartPulse,
    title: "Tattoo Pain Chart Reality Check",
    type: "Interactive guide",
    description: "An honest alternative to viral pain maps, showing why placement is only one part of the experience.",
    href: "/tools/tattoo-pain-chart-reality-check",
  },
  {
    icon: Calculator,
    title: "How Much Does a Full Sleeve Actually Cost in the UK?",
    type: "Guide and calculator",
    description: "Compare day-rate and hourly budgeting across grey-lining, shading, finishing and possible touch-up work.",
    href: "/guides/full-sleeve-cost-uk",
  },
  {
    icon: BookOpen,
    title: "Grey-Line Healing: What to Expect Week by Week",
    type: "Healing guide",
    description: "Understand why grey lines can look darker, lighter, patchier or duller while the surface heals—and when to seek advice.",
    href: "/guides/grey-line-healing-week-by-week",
  },
] as const;

function ResourcesPage() {
  return (
    <PublicShell>
      <JsonLd data={{
        "@context": "https://schema.org",
        "@type": "CollectionPage",
        name: "INKSIGHT resource library",
        url: CANONICAL_URL,
        description: "Tattoo studio tools and shareable tattoo client education.",
      }} />
      <PageHero
        eyebrow="INKSIGHT resource library"
        title={<>Useful tools before a studio ever becomes a client.</>}
        description={<>Studio-owner diagnostics and tattoo-client education are separated into clear sections so each resource has an honest purpose and audience.</>}
      />

      <ResourceSection
        eyebrow="For studio owners"
        title="Diagnose the commercial and operational system."
        description="Use these resources internally to decide what should be fixed, measured or left alone."
        resources={studioResources}
      />

      <ResourceSection
        eyebrow="Tattoo client education"
        title="Credible guides studios can share."
        description="These articles answer common client questions without pretending that pain, pricing or healing can be reduced to one universal number."
        resources={clientResources}
        shaded
      />

      <section>
        <div className="mx-auto max-w-7xl px-6 py-20 md:py-28">
          <SectionHeading
            eyebrow="Editorial standard"
            title="Honest uncertainty is part of the answer."
            description="INKSIGHT resources distinguish published evidence, current public examples, practitioner experience and personal variability. Medical warning signs are signposted to appropriate healthcare guidance rather than diagnosed online."
          />
        </div>
      </section>
      <CtaSection />
    </PublicShell>
  );
}

function ResourceSection({
  eyebrow,
  title,
  description,
  resources,
  shaded = false,
}: {
  eyebrow: string;
  title: string;
  description: string;
  resources: ReadonlyArray<{ icon: typeof Search; title: string; type: string; description: string; href: string }>;
  shaded?: boolean;
}) {
  return (
    <section className={shaded ? "border-y border-border bg-ink" : ""}>
      <div className="mx-auto max-w-7xl px-6 py-20 md:py-28">
        <SectionHeading eyebrow={eyebrow} title={title} description={description} />
        <div className="mt-10 grid gap-5 md:grid-cols-2">
          {resources.map((resource) => {
            const Icon = resource.icon;
            return (
              <a key={resource.href} href={resource.href} className="group rounded-2xl border border-border bg-ink-deep p-7 transition hover:border-mint">
                <div className="flex items-start justify-between gap-5">
                  <span className="flex h-12 w-12 items-center justify-center rounded-xl bg-mint/10 text-mint"><Icon className="h-6 w-6" /></span>
                  <span className="rounded-full border border-border px-3 py-1 text-xs font-bold text-muted-foreground">{resource.type}</span>
                </div>
                <h3 className="mt-6 font-display text-2xl font-black text-ice">{resource.title}</h3>
                <p className="mt-3 leading-relaxed text-muted-foreground">{resource.description}</p>
                <span className="mt-6 inline-flex items-center gap-2 font-bold text-mint">Open resource <ArrowRight className="h-4 w-4 transition group-hover:translate-x-1" /></span>
              </a>
            );
          })}
        </div>
      </div>
    </section>
  );
}
