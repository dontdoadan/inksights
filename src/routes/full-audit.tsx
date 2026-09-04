import { createFileRoute } from "@tanstack/react-router";
import { ArrowRight, BarChart3, CheckCircle2, Database, Search, Target } from "lucide-react";
import { CtaSection, JsonLd, PageHero, PrimaryButton, PublicShell, SectionHeading } from "@/components/public-site";

const CANONICAL_URL = "https://getinksights.co.uk/full-audit";

export const Route = createFileRoute("/full-audit")({
  component: FullAuditPage,
  head: () => ({
    meta: [
      { title: "Full Tattoo Studio Audit | INKSIGHTS" },
      { name: "description", content: "Replace estimates with a structured audit of visibility, enquiries, bookings, capacity, retention and studio economics for established UK tattoo studios." },
      { property: "og:title", content: "Full Tattoo Studio Audit | INKSIGHTS" },
      { property: "og:description", content: "Find the constraint that matters most and build an evidence-led action plan." },
      { property: "og:url", content: CANONICAL_URL },
    ],
    links: [{ rel: "canonical", href: CANONICAL_URL }],
  }),
});

const auditAreas = [
  [Search, "Visibility", "Local search, website evidence, competitive presence and the searches that could plausibly produce a customer."],
  [Target, "Conversion", "The journey from profile or website visit through enquiry, qualification, response, deposit and confirmed booking."],
  [BarChart3, "Studio economics", "Clients, average booking value, frequency, utilisation, cancellations, no-shows and measurable revenue constraints."],
  [Database, "Data & control", "What the studio can actually measure today, where evidence is missing and which systems should become the operating baseline."],
] as const;

function FullAuditPage() {
  return <PublicShell>
    <JsonLd data={{ "@context": "https://schema.org", "@type": "Service", name: "INKSIGHTS Full Tattoo Studio Audit", provider: { "@type": "Organization", name: "INKSIGHTS", url: "https://getinksights.co.uk/" }, url: CANONICAL_URL, areaServed: "United Kingdom", serviceType: "Tattoo studio commercial intelligence audit" }} />
    <PageHero eyebrow="Full INKSIGHTS Audit · Sales-assisted" title={<>Replace the estimate with <span className="text-mint">evidence.</span></>} description={<>The free Studio Revenue Audit shows where an opportunity may exist. The Full INKSIGHTS Audit determines what is actually happening, what can be measured, and which constraint should be addressed first.</>}>
      <PrimaryButton href="/contact?subject=Full%20INKSIGHTS%20Audit">Request the Full Audit</PrimaryButton>
      <a href="/studio-growth-check" className="inline-flex min-h-12 items-center justify-center rounded-full border border-border px-6 py-3 font-bold text-ice hover:border-mint hover:text-mint">Start with the free audit</a>
    </PageHero>

    <section className="bg-ink"><div className="mx-auto max-w-7xl px-6 py-20 md:py-28"><SectionHeading eyebrow="What changes" title="From a modelled opportunity to a studio-specific diagnosis." description="The Full Audit is designed for owners who need to understand the constraint before committing to advertising, software, hiring or another disconnected tactic." /><div className="mt-10 grid gap-5 md:grid-cols-2 lg:grid-cols-4">{auditAreas.map(([Icon, title, text]) => <div key={String(title)} className="rounded-2xl border border-border bg-ink-deep p-6"><Icon className="h-7 w-7 text-mint" /><h2 className="mt-5 font-display text-xl font-black text-ice">{String(title)}</h2><p className="mt-3 text-sm leading-relaxed text-muted-foreground">{String(text)}</p></div>)}</div></div></section>

    <section className="border-y border-border"><div className="mx-auto max-w-7xl px-6 py-20 md:py-28"><div className="grid gap-10 lg:grid-cols-2"><div><SectionHeading eyebrow="The audit output" title="A decision document, not a metric dump." /><ul className="mt-8 space-y-4">{["Current-state studio and market baseline", "Evidence and data-quality assessment", "Primary commercial constraint", "Opportunity and leakage analysis where the evidence supports it", "Prioritised actions with dependencies, effort and expected commercial relevance", "Measurement plan for the next intervention"].map((item) => <li key={item} className="flex gap-3 text-sm leading-relaxed text-muted-foreground"><CheckCircle2 className="mt-0.5 h-5 w-5 shrink-0 text-mint" />{item}</li>)}</ul></div><div className="rounded-3xl border border-mint/30 bg-ink p-8"><p className="text-xs font-bold uppercase tracking-[.16em] text-mint">The governing principle</p><h2 className="mt-4 font-display text-3xl font-black text-ice">If the evidence does not support the claim, the report says so.</h2><p className="mt-5 leading-relaxed text-muted-foreground">Modelled figures remain labelled as modelled. Unknowns remain unknown. The objective is not to make the studio look worse or better; it is to identify the most useful decision with the evidence available.</p><div className="mt-7 rounded-2xl border border-border bg-ink-deep p-5"><p className="text-sm font-bold text-ice">Best fit</p><p className="mt-2 text-sm leading-relaxed text-muted-foreground">Established UK tattoo studios, particularly multi-artist teams of 3+ artists, where the owner needs a commercial baseline before deciding what to change.</p></div></div></div></div></section>

    <section className="bg-ink"><div className="mx-auto max-w-7xl px-6 py-20 md:py-28"><SectionHeading eyebrow="Audit → intervention" title="The audit should lead somewhere useful." description="Where the evidence identifies a clear constraint, INKSIGHTS can route the studio into a scoped intervention. Where it does not, the correct recommendation may be to measure first or do nothing yet." /><div className="mt-10 grid gap-4 md:grid-cols-3"><div className="rounded-2xl border border-border bg-ink-deep p-6"><div className="font-bold text-mint">01 · Diagnose</div><p className="mt-3 text-sm leading-relaxed text-muted-foreground">Map the studio's current state, data and commercial journey.</p></div><div className="rounded-2xl border border-border bg-ink-deep p-6"><div className="font-bold text-mint">02 · Prioritise</div><p className="mt-3 text-sm leading-relaxed text-muted-foreground">Choose the smallest intervention that addresses the strongest constraint.</p></div><div className="rounded-2xl border border-border bg-ink-deep p-6"><div className="font-bold text-mint">03 · Measure</div><p className="mt-3 text-sm leading-relaxed text-muted-foreground">Define the baseline and outcome measures before implementation begins.</p></div></div><div className="mt-10 flex justify-center"><PrimaryButton href="/contact?subject=Full%20INKSIGHTS%20Audit">Request an audit scope</PrimaryButton></div></div></section>
    <CtaSection eyebrow="Not sure where to start?" title="Run the free Studio Revenue Audit first." description="If you do not yet know whether the problem is demand, conversion, capacity, retention or pricing, start there. The result tells you what deserves investigation next." />
  </PublicShell>;
}
