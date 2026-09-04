import { createFileRoute } from "@tanstack/react-router";
import { ArrowRight, BookOpen, Calculator, HeartPulse, Search, ShieldCheck, Workflow } from "lucide-react";
import { CtaSection, JsonLd, PageHero, PublicShell, SectionHeading } from "@/components/public-site";

const CANONICAL_URL = "https://getinksights.co.uk/resources";

export const Route = createFileRoute("/resources")({
  component: ResourcesPage,
  head: () => ({
    meta: [
      { title: "Tattoo Studio Growth Tools & Guides | INKSIGHTS" },
      { name: "description", content: "Free tattoo studio growth diagnostics, visibility tools, booking guides, software comparisons and commercial calculators from INKSIGHTS." },
      { property: "og:title", content: "Tattoo Studio Growth Tools & Guides | INKSIGHTS" },
      { property: "og:description", content: "Practical tools for UK tattoo studio owners, plus a small library of client education worth sharing." },
      { property: "og:url", content: CANONICAL_URL },
    ],
    links: [{ rel: "canonical", href: CANONICAL_URL }],
  }),
});

const studioResources = [
  { icon: Search, title: "Free Tattoo Studio Revenue Audit", type: "Free diagnostic", description: "Estimate where revenue may be leaking across capacity, enquiries, bookings, cancellations and repeat clients.", href: "/studio-growth-check" },
  { icon: ShieldCheck, title: "Tattoo Studio SEO & Visibility Scorecard", type: "15-point diagnostic", description: "Check Google and local discovery, website indexability, public proof, booking friction and measurement foundations.", href: "/tattoo-studio-visibility-scorecard" },
  { icon: Workflow, title: "Tattoo Studio Software Comparison", type: "Workflow guide", description: "Compare booking and studio platforms by enquiry intake, approvals, deposits, consent, communication, reporting and portability.", href: "/tattoo-studio-software" },
  { icon: Calculator, title: "Tattoo Studio Revenue Growth Model", type: "Commercial calculator", description: "Model the effect of client volume, average transaction value and purchase frequency, then stress-test the assumptions.", href: "/growth-model" },
] as const;

const clientResources = [
  { icon: HeartPulse, title: "Tattoo Pain Chart Reality Check", type: "Client guide", description: "A practical explanation of why viral pain maps are only a rough guide and how placement, technique and individual tolerance interact.", href: "/tools/tattoo-pain-chart-reality-check" },
  { icon: Calculator, title: "How Much Does a Full Sleeve Cost in the UK?", type: "Pricing guide", description: "A transparent framework for comparing day rates, hourly rates and multi-session sleeve budgets.", href: "/guides/full-sleeve-cost-uk" },
  { icon: BookOpen, title: "Grey-Line Healing: Week-by-Week", type: "Healing education", description: "A cautious guide to normal visual changes during healing and when professional advice may be appropriate.", href: "/guides/grey-line-healing-week-by-week" },
] as const;

function ResourcesPage() {
  return (
    <PublicShell>
      <JsonLd data={{ "@context": "https://schema.org", "@type": "CollectionPage", name: "INKSIGHTS resource library", url: CANONICAL_URL, description: "Tattoo studio growth tools and selected client education." }} />
      <PageHero eyebrow="Resources for UK tattoo studios" title={<>Tools that help an owner understand the studio before spending more.</>} description={<>The primary library is built for tattoo studio owners and operators: diagnose performance, test visibility, compare workflows and model revenue. A smaller client-education section contains resources studios can share with customers.</>} />
      <ResourceSection eyebrow="For studio owners" title="Diagnose the commercial system." description="Use these tools to identify what is restricting demand, bookings or revenue." resources={studioResources} />
      <ResourceSection eyebrow="For your clients" title="Useful education worth sharing." description="A secondary library for common client questions about pricing, pain and healing." resources={clientResources} shaded />
      <section><div className="mx-auto max-w-7xl px-6 py-20 md:py-28"><SectionHeading eyebrow="Editorial standard" title="Specific, sourced and honest about uncertainty." description="Where resources use public prices, competitor features or health-related guidance, they distinguish evidence from examples and avoid universal claims. Studio-facing resources are built around real operational decisions rather than keyword volume." /></div></section>
      <CtaSection title="Start with the studio diagnosis." description="Run the free Revenue Audit and use the result to decide whether a visibility fix, revenue audit, booking intervention or deeper intelligence work is justified." />
    </PublicShell>
  );
}

function ResourceSection({ eyebrow, title, description, resources, shaded = false }: { eyebrow: string; title: string; description: string; resources: ReadonlyArray<{ icon: typeof Search; title: string; type: string; description: string; href: string }>; shaded?: boolean }) {
  return <section className={shaded ? "border-y border-border bg-ink" : ""}><div className="mx-auto max-w-7xl px-6 py-20 md:py-28"><SectionHeading eyebrow={eyebrow} title={title} description={description} /><div className="mt-10 grid gap-5 md:grid-cols-2">{resources.map((resource) => { const Icon = resource.icon; return <a key={resource.href} href={resource.href} className="group rounded-2xl border border-border bg-ink-deep p-7 transition hover:border-mint"><div className="flex items-start justify-between gap-5"><span className="flex h-12 w-12 items-center justify-center rounded-xl bg-mint/10 text-mint"><Icon className="h-6 w-6" /></span><span className="rounded-full border border-border px-3 py-1 text-xs font-bold text-muted-foreground">{resource.type}</span></div><h3 className="mt-6 font-display text-2xl font-black text-ice">{resource.title}</h3><p className="mt-3 leading-relaxed text-muted-foreground">{resource.description}</p><span className="mt-6 inline-flex items-center gap-2 font-bold text-mint">Open resource <ArrowRight className="h-4 w-4 transition group-hover:translate-x-1" /></span></a>; })}</div></div></section>;
}
