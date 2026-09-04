import { ArrowRight, CheckCircle2, Database, Search, TrendingUp } from "lucide-react";
import { createFileRoute, Link } from "@tanstack/react-router";
import { CtaSection, JsonLd, PageHero, PrimaryButton, PublicShell, SectionHeading } from "../components/public-site";

const CANONICAL_URL = "https://getinksights.co.uk/full-audit";

export const Route = createFileRoute("/full-audit")({
  head: () => ({
    meta: [
      { title: "Full Tattoo Studio Audit | INKSIGHTS" },
      {
        name: "description",
        content:
          "Replace estimates with an evidence-led review of visibility, conversion, capacity, retention and studio economics for established UK tattoo studios.",
      },
      { property: "og:title", content: "Full Tattoo Studio Audit | INKSIGHTS" },
      {
        property: "og:description",
        content: "An evidence-led commercial audit for established UK tattoo studios, built to identify the constraint worth fixing next.",
      },
      { property: "og:url", content: CANONICAL_URL },
    ],
    links: [{ rel: "canonical", href: CANONICAL_URL }],
  }),
  component: FullAuditPage,
});

const areas = [
  {
    icon: Search,
    title: "Visibility",
    copy: "Assess local search presence, market coverage, competitor visibility and the demand your studio is positioned to capture.",
  },
  {
    icon: TrendingUp,
    title: "Conversion & capacity",
    copy: "Trace the path from enquiry to booking and identify where demand, artist time or booking capacity is being lost.",
  },
  {
    icon: Database,
    title: "Studio economics",
    copy: "Review the operating numbers behind revenue, average booking value, cancellations, repeat clients and utilisation.",
  },
];

function FullAuditPage() {
  return (
    <PublicShell>
      <JsonLd
        data={{
          "@context": "https://schema.org",
          "@type": "Service",
          name: "INKSIGHTS Full Tattoo Studio Audit",
          provider: { "@type": "Organization", name: "INKSIGHTS", url: "https://getinksights.co.uk" },
          url: CANONICAL_URL,
          description: "Evidence-led commercial audit for established UK tattoo studios.",
          areaServed: "United Kingdom",
        }}
      />

      <PageHero
        eyebrow="Full INKSIGHTS Audit"
        title="Replace estimates with evidence."
        description="The free Revenue Audit shows where an opportunity may exist. The Full Audit investigates what is actually happening inside the studio, using available business, digital and commercial evidence to identify the constraint worth fixing next."
      >
        <div className="flex flex-wrap gap-3">
          <PrimaryButton href="/contact?subject=Full%20INKSIGHTS%20Audit">Discuss the Full Audit <ArrowRight className="h-4 w-4" /></PrimaryButton>
          <Link to="/studio-growth-check" className="inline-flex items-center gap-2 rounded-full border border-border px-5 py-3 text-sm font-bold text-ice hover:border-mint/40 hover:text-mint">Run the free Revenue Audit</Link>
        </div>
        <p className="mt-5 text-sm text-muted-foreground">Best fit: established UK studios, particularly multi-artist teams with 3+ artists.</p>
      </PageHero>

      <section className="border-y border-border bg-ink">
        <div className="mx-auto max-w-7xl px-6 py-16 md:py-20">
          <SectionHeading eyebrow="What gets audited" title="One commercial picture, not another dashboard." description="The audit connects the signals that determine whether a studio can turn demand into profitable booked work." />
          <div className="mt-10 grid gap-5 md:grid-cols-3">
            {areas.map(({ icon: Icon, title, copy }) => (
              <article key={title} className="rounded-3xl border border-border bg-ink-deep p-7">
                <Icon className="h-6 w-6 text-mint" />
                <h3 className="mt-5 font-display text-2xl font-black text-ice">{title}</h3>
                <p className="mt-3 text-sm leading-relaxed text-muted-foreground">{copy}</p>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-6 py-16 md:py-20">
        <div className="grid gap-10 lg:grid-cols-[.8fr_1.2fr] lg:items-start">
          <SectionHeading eyebrow="Audit output" title="The result is designed to produce a decision." description="Not a list of generic marketing tasks. A prioritised view of what is supported by evidence, what remains uncertain and what should happen next." />
          <div className="grid gap-4 sm:grid-cols-2">
            {[
              "Current-state baseline",
              "Evidence and data-quality assessment",
              "Primary commercial constraint",
              "Opportunity and leakage analysis",
              "Prioritised actions by impact and effort",
              "Measurement plan for the next intervention",
            ].map((item) => (
              <div key={item} className="flex gap-3 rounded-2xl border border-border bg-ink p-5 text-sm text-muted-foreground">
                <CheckCircle2 className="mt-0.5 h-5 w-5 shrink-0 text-mint" />
                <span>{item}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="border-y border-border bg-ink">
        <div className="mx-auto max-w-4xl px-6 py-16 text-center md:py-20">
          <p className="text-xs font-bold uppercase tracking-[0.16em] text-mint">Evidence standard</p>
          <h2 className="mt-3 font-display text-3xl font-black tracking-tight text-ice md:text-5xl">If the evidence does not support the claim, the report says so.</h2>
          <p className="mx-auto mt-5 max-w-2xl text-base leading-relaxed text-muted-foreground">Observed data, derived calculations, estimates and modelled opportunities are kept distinct. The objective is a commercially useful diagnosis, not false precision.</p>
        </div>
      </section>

      <CtaSection
        eyebrow="Next step"
        title="Start with the free diagnosis. Upgrade when the evidence warrants it."
        description="Use the Revenue Audit to establish the initial signal. If the opportunity is material, the Full Audit turns that signal into an evidence-led commercial review and prioritised action plan."
        primary={{ href: "/studio-growth-check", label: "Run the Free Revenue Audit" }}
        secondary={{ href: "/contact?subject=Full%20INKSIGHTS%20Audit", label: "Discuss the Full Audit" }}
      />
    </PublicShell>
  );
}
