import { createFileRoute } from "@tanstack/react-router";
import { CheckCircle2, Database, FileCheck2, Scale, ShieldCheck, Workflow } from "lucide-react";
import { JsonLd, PageHero, PublicShell, SectionHeading } from "@/components/public-site";

const CANONICAL_URL = "https://getinksights.co.uk/research-methodology";
const UPDATED = "2026-10-20";

export const Route = createFileRoute("/research-methodology")({
  component: ResearchMethodologyPage,
  head: () => ({
    meta: [
      { title: "INKSIGHTS Research Methodology | Tattoo Studio Intelligence" },
      {
        name: "description",
        content:
          "How INKSIGHTS collects, labels, verifies and publishes evidence, benchmarks and commercial findings for UK tattoo studios.",
      },
      { property: "og:title", content: "INKSIGHTS Research Methodology" },
      {
        property: "og:description",
        content:
          "The evidence, provenance, benchmark and case-study standards behind INKSIGHTS tattoo-studio intelligence.",
      },
      { property: "og:url", content: CANONICAL_URL },
      { property: "og:type", content: "article" },
    ],
    links: [{ rel: "canonical", href: CANONICAL_URL }],
  }),
});

const evidenceClasses = [
  {
    label: "VERIFIED",
    text: "Confirmed against a primary source, connected first-party system or repeatable direct check.",
  },
  {
    label: "OBSERVED",
    text: "Directly visible in a public or supplied source, but not independently verified beyond that observation.",
  },
  {
    label: "CALCULATED",
    text: "Derived from disclosed inputs using a reproducible formula or transformation.",
  },
  {
    label: "MODELLED",
    text: "An estimate produced from stated assumptions, ranges or scenario inputs rather than a measured outcome.",
  },
  {
    label: "HYPOTHESIS",
    text: "A testable explanation or opportunity that requires evidence before it can be treated as a finding.",
  },
] as const;

const sourceHierarchy = [
  ["1", "First-party operating data", "Studio CRM, booking, payment, analytics or other permissioned operational records."],
  ["2", "Connected platform data", "Authenticated data from approved systems such as Search Console, analytics, CRM or payments."],
  ["3", "Primary public evidence", "The studio website, Google Business Profile, published policies, booking pages and official profiles."],
  ["4", "Independent public evidence", "Relevant directories, reviews, industry publications and other attributable third-party sources."],
  ["5", "Modelled or estimated inputs", "Used only when necessary, labelled clearly and kept separate from measured facts."],
] as const;

function ResearchMethodologyPage() {
  const articleJsonLd = {
    "@context": "https://schema.org",
    "@type": "Article",
    headline: "INKSIGHTS Research Methodology",
    description:
      "The evidence, provenance, benchmark and case-study standards used by INKSIGHTS for UK tattoo-studio intelligence.",
    url: CANONICAL_URL,
    mainEntityOfPage: CANONICAL_URL,
    dateModified: UPDATED,
    inLanguage: "en-GB",
    isPartOf: { "@id": "https://getinksights.co.uk/#website" },
    author: { "@id": "https://getinksights.co.uk/#organization" },
    publisher: { "@id": "https://getinksights.co.uk/#organization" },
    about: [
      "UK tattoo studios",
      "tattoo studio benchmarking",
      "commercial intelligence",
      "research methodology",
      "evidence standards",
    ],
  };

  const breadcrumbJsonLd = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: [
      {
        "@type": "ListItem",
        position: 1,
        name: "About INKSIGHTS",
        item: "https://getinksights.co.uk/about",
      },
      {
        "@type": "ListItem",
        position: 2,
        name: "Research methodology",
        item: CANONICAL_URL,
      },
    ],
  };

  return (
    <PublicShell>
      <JsonLd data={[articleJsonLd, breadcrumbJsonLd]} />

      <PageHero
        eyebrow="Evidence standards · Last reviewed 20 October 2026"
        title={<>How INKSIGHTS turns studio data into a recommendation.</>}
        description={
          <>
            Every useful conclusion should be traceable back to evidence. This page explains how INKSIGHTS collects,
            labels, compares and validates information before it becomes a finding, recommendation, benchmark or
            client result.
          </>
        }
      />

      <nav aria-label="Breadcrumb" className="border-b border-border bg-ink-deep">
        <ol className="mx-auto flex max-w-5xl items-center gap-2 px-6 py-4 text-sm text-muted-foreground">
          <li><a href="/about" className="font-semibold transition hover:text-mint">About INKSIGHTS</a></li>
          <li aria-hidden="true">/</li>
          <li aria-current="page" className="text-ice">Research methodology</li>
        </ol>
      </nav>

      <section>
        <div className="mx-auto max-w-5xl px-6 py-16 md:py-24">
          <SectionHeading
            eyebrow="The core method"
            title="Evidence first. Diagnosis second. Intervention last."
            description="INKSIGHTS does not treat an observation as a conclusion. The method keeps each step separate so uncertainty does not quietly turn into a fact."
          />

          <div className="mt-10 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {[
              "Observation",
              "Metric",
              "Evidence",
              "Finding",
              "Diagnosis",
              "Opportunity",
              "Recommendation",
              "Intervention",
              "Outcome",
              "Attribution",
              "Learning",
            ].map((item, index) => (
              <div key={item} className="rounded-2xl border border-border bg-ink p-5">
                <div className="font-mono text-xs text-mint">{String(index + 1).padStart(2, "0")}</div>
                <div className="mt-2 font-display text-lg font-black text-ice">{item}</div>
              </div>
            ))}
          </div>

          <div className="mt-8 rounded-2xl border border-mint/25 bg-mint/5 p-6 text-sm leading-relaxed text-muted-foreground">
            <strong className="text-ice">Important:</strong> missing information is recorded as unknown or missing. It is
            not automatically replaced with an estimate. When a model or assumption is necessary, it is labelled as
            such and should not be presented as a verified result.
          </div>
        </div>
      </section>

      <section className="border-y border-border bg-ink">
        <div className="mx-auto max-w-5xl px-6 py-16 md:py-24">
          <SectionHeading
            eyebrow="Evidence labels"
            title="A reader should be able to tell what kind of claim they are looking at."
            description="These labels are used to stop measured facts, calculations, estimates and hypotheses from being blended together."
          />
          <div className="mt-10 space-y-4">
            {evidenceClasses.map((item) => (
              <div key={item.label} className="grid gap-3 rounded-2xl border border-border bg-ink-deep p-6 md:grid-cols-[180px_1fr]">
                <div className="font-mono text-sm font-bold text-mint">{item.label}</div>
                <p className="text-sm leading-relaxed text-muted-foreground">{item.text}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section>
        <div className="mx-auto max-w-5xl px-6 py-16 md:py-24">
          <SectionHeading
            eyebrow="Source hierarchy"
            title="Use the strongest available source, and preserve provenance."
            description="A recommendation is only as trustworthy as the evidence beneath it. Source strength, date, geography and limitations are therefore part of the record."
          />
          <div className="mt-10 space-y-4">
            {sourceHierarchy.map(([number, title, text]) => (
              <div key={number} className="flex gap-5 rounded-2xl border border-border bg-ink p-6">
                <div className="font-mono text-lg font-black text-mint">{number}</div>
                <div>
                  <h2 className="font-display text-xl font-black text-ice">{title}</h2>
                  <p className="mt-2 text-sm leading-relaxed text-muted-foreground">{text}</p>
                </div>
              </div>
            ))}
          </div>

          <div className="mt-10 grid gap-5 md:grid-cols-2">
            {[
              [Database, "Provenance", "Where the evidence came from, when it was observed, what geography it applies to and which record or URL supports it."],
              [FileCheck2, "Versioning", "Benchmarks, rules and scoring methods should carry a version so a later change does not silently rewrite an earlier conclusion."],
              [Scale, "Comparability", "Studios should only be compared with a cohort that is sufficiently similar for the comparison to be useful."],
              [ShieldCheck, "Confidence", "Confidence should fall when the source is incomplete, stale, estimated or difficult to verify."],
            ].map(([Icon, title, text]) => {
              const ItemIcon = Icon as typeof Database;
              return (
                <div key={String(title)} className="rounded-2xl border border-border bg-ink p-6">
                  <ItemIcon className="h-6 w-6 text-mint" />
                  <h2 className="mt-4 font-display text-xl font-black text-ice">{String(title)}</h2>
                  <p className="mt-3 text-sm leading-relaxed text-muted-foreground">{String(text)}</p>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      <section className="border-y border-border bg-ink">
        <div className="mx-auto max-w-5xl px-6 py-16 md:py-24">
          <SectionHeading
            eyebrow="Benchmark standard"
            title="A benchmark must disclose what it actually represents."
            description="A number should not be called a UK tattoo-studio benchmark simply because it looks plausible."
          />
          <div className="mt-10 grid gap-4 md:grid-cols-2">
            {[
              "Define the cohort and geography before comparing studios.",
              "Record the observation period and freshness of the underlying data.",
              "Disclose sample size where a sample-based claim is published.",
              "Separate public observations from permissioned first-party operating data.",
              "Do not report a cohort median or percentile until the comparable dataset is large enough to support it.",
              "Label controlled reference bands when they are not proprietary market observations.",
            ].map((item) => (
              <div key={item} className="flex gap-3 rounded-2xl border border-border bg-ink-deep p-5 text-sm leading-relaxed text-muted-foreground">
                <CheckCircle2 className="mt-0.5 h-5 w-5 shrink-0 text-mint" />
                {item}
              </div>
            ))}
          </div>
          <p className="mt-8 text-sm leading-relaxed text-muted-foreground">
            The current <a href="/pricing-benchmark" className="font-semibold text-mint hover:text-mint-soft">Pricing Benchmark</a> therefore
            distinguishes its controlled reference bands from future proprietary studio observations rather than implying
            that an early reference range is already a statistically representative UK market benchmark.
          </p>
        </div>
      </section>

      <section>
        <div className="mx-auto max-w-5xl px-6 py-16 md:py-24">
          <SectionHeading
            eyebrow="Case-study standard"
            title="A result needs a baseline, an intervention and enough time to measure it."
            description="INKSIGHTS will not treat a screenshot, one unusually good week or an unattributed revenue change as proof of impact."
          />
          <div className="mt-10 grid gap-4 md:grid-cols-2">
            {[
              ["Baseline", "State what was happening before the intervention, including missing or unreliable measures."],
              ["Intervention", "Describe exactly what changed, who owned it and when it went live."],
              ["Measurement window", "Use a window long enough to distinguish an outcome from short-term noise."],
              ["External factors", "Record staffing, seasonality, ad spend, price changes and other material changes."],
              ["Attribution", "Claim only the part of an outcome that the evidence can reasonably support."],
              ["Permission and limitations", "Publish identifiable client evidence only with permission and include limitations alongside positive results."],
            ].map(([title, text]) => (
              <div key={title} className="rounded-2xl border border-border bg-ink p-6">
                <h2 className="font-display text-xl font-black text-ice">{title}</h2>
                <p className="mt-3 text-sm leading-relaxed text-muted-foreground">{text}</p>
              </div>
            ))}
          </div>
          <p className="mt-8 text-sm leading-relaxed text-muted-foreground">
            The <a href="/case-studies" className="font-semibold text-mint hover:text-mint-soft">INKSIGHTS Proof Library</a> keeps
            system demonstrations separate from verified client outcomes for this reason.
          </p>
        </div>
      </section>

      <section className="border-y border-border bg-ink">
        <div className="mx-auto max-w-5xl px-6 py-16 md:py-24">
          <SectionHeading
            eyebrow="Corrections and updates"
            title="Research should be correctable."
            description="Public evidence changes. Software changes. Prices change. A methodology that cannot be updated becomes misleading."
          />
          <div className="mt-10 grid gap-5 md:grid-cols-3">
            {[
              [Workflow, "Re-check", "Time-sensitive public claims should be rechecked before a material update or new recommendation."],
              [FileCheck2, "Record", "Material changes should update the page date, evidence record or dataset version instead of silently replacing history."],
              [ShieldCheck, "Correct", "When a material published claim is shown to be wrong, the preferred action is to correct it rather than defend the old version."],
            ].map(([Icon, title, text]) => {
              const ItemIcon = Icon as typeof Workflow;
              return (
                <div key={String(title)} className="rounded-2xl border border-border bg-ink-deep p-6">
                  <ItemIcon className="h-6 w-6 text-mint" />
                  <h2 className="mt-4 font-display text-xl font-black text-ice">{String(title)}</h2>
                  <p className="mt-3 text-sm leading-relaxed text-muted-foreground">{String(text)}</p>
                </div>
              );
            })}
          </div>
          <div className="mt-10 rounded-2xl border border-border bg-ink-deep p-6 text-sm leading-relaxed text-muted-foreground">
            INKSIGHTS does not guarantee search rankings, bookings or revenue. The purpose of the method is to improve
            decision quality and make claims auditable—not to turn uncertainty into certainty.
          </div>
        </div>
      </section>
    </PublicShell>
  );
}
