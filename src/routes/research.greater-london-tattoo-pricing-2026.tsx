import { createFileRoute } from "@tanstack/react-router";
import { BarChart3, Database, FileDown, ShieldCheck } from "lucide-react";
import { JsonLd, PageHero, PublicShell, SectionHeading } from "@/components/public-site";

const CANONICAL_URL = "https://getinksights.co.uk/research/greater-london-tattoo-pricing-2026";
const CSV_URL = "https://getinksights.co.uk/research/greater-london-tattoo-pricing-2026.csv";
const PUBLISHED = "2026-10-21";
const OBSERVED = "2026-10-19";

const metrics = [
  { label: "Published artist hourly rate", value: "£120", note: "Median · £90–£150 range · n=10" },
  { label: "Published artist minimum", value: "£90", note: "Median · £60–£150 range · n=9" },
  { label: "Published artist full-day rate", value: "£725", note: "Median · £500–£1,200 range · n=6" },
  { label: "Flat deposit on official pages", value: "£50", note: "Median · £50–£100 range · n=3 studios" },
] as const;

const policyMetrics = [
  ["Cancellation / reschedule window", "24–72 hours", "Median 60 hours across four deduplicated official studio policies."],
  ["Percentage deposit observed", "50%", "One official studio policy used a percentage rather than a flat amount."],
  ["Eligible observations", "19", "Across 15 unique Greater London studios; ambiguous/conflicted prices were excluded."],
  ["Source mix", "8 / 11", "8 official or primary-page records and 11 third-party artist/booking-listing records."],
] as const;

const sampleSources = [
  ["JuJu Tattoo Studio", "Studio pricing", "https://www.jujutattoostudio.co.uk/about-juju-tattoo-studio-croydon.html"],
  ["London Rabbits / Wimbledon Tattoo Group", "Studio FAQ", "https://londonrabbits.com/faq/"],
  ["Never Say Die! Tattoo Studio", "Artist pricing page", "https://kali.tattoo/"],
  ["Sorry Mum London Tattoos", "Studio booking policy", "https://www.sorrymumlondon.com/work/bookatattoo"],
  ["Steel Point Tattoos", "Studio booking terms", "https://steelpointtattoos.co.uk/booking-terms/"],
  ["Triangle Tattoo", "Studio FAQ", "https://www.triangletattoo.uk/faq"],
  ["Wanderlust Ink", "Studio FAQ", "https://wanderlustink.co.uk/faqs"],
  ["Wimbledon Tattoo Studio", "Published booking menu", "https://www.fresha.com/a/wimbledon-tattoo-studio-london-600-kingston-road-eqzl9wgs"],
] as const;

export const Route = createFileRoute("/research/greater-london-tattoo-pricing-2026")({
  component: ResearchPage,
  head: () => ({
    meta: [
      { title: "Greater London Tattoo Pricing Snapshot 2026 | INKSIGHTS" },
      {
        name: "description",
        content:
          "INKSIGHTS analysis of published Greater London tattoo pricing and booking policies: hourly rates, minimums, full-day rates, deposits and cancellation windows.",
      },
      { property: "og:title", content: "Greater London Tattoo Pricing & Booking Policy Snapshot 2026" },
      {
        property: "og:description",
        content:
          "A transparent INKSIGHTS pilot dataset covering 19 eligible public pricing observations across 15 Greater London tattoo studios.",
      },
      { property: "og:url", content: CANONICAL_URL },
      { property: "og:type", content: "article" },
    ],
    links: [{ rel: "canonical", href: CANONICAL_URL }],
  }),
});

function ResearchPage() {
  const datasetJsonLd = {
    "@context": "https://schema.org",
    "@type": "Dataset",
    name: "Greater London Tattoo Pricing & Booking Policy Snapshot 2026",
    description:
      "A pilot INKSIGHTS dataset of published tattoo pricing and booking-policy observations across 15 Greater London studios.",
    url: CANONICAL_URL,
    creator: { "@id": "https://getinksights.co.uk/#organization" },
    publisher: { "@id": "https://getinksights.co.uk/#organization" },
    datePublished: PUBLISHED,
    dateModified: PUBLISHED,
    temporalCoverage: "2026-10",
    spatialCoverage: { "@type": "Place", name: "Greater London, United Kingdom" },
    measurementTechnique:
      "Manual evidence review of official studio/artist pages and published third-party artist or booking listings, with conflicted prices excluded from aggregate calculations.",
    variableMeasured: [
      "published hourly tattoo rate",
      "published minimum tattoo charge",
      "published full-day tattoo rate",
      "published deposit amount",
      "published cancellation or reschedule notice window",
    ],
    distribution: {
      "@type": "DataDownload",
      encodingFormat: "text/csv",
      contentUrl: CSV_URL,
    },
    isBasedOn: "https://getinksights.co.uk/research-methodology",
    license: "https://getinksights.co.uk/terms",
  };

  const articleJsonLd = {
    "@context": "https://schema.org",
    "@type": "Article",
    headline: "Greater London Tattoo Pricing & Booking Policy Snapshot 2026",
    url: CANONICAL_URL,
    datePublished: PUBLISHED,
    dateModified: PUBLISHED,
    author: { "@id": "https://getinksights.co.uk/#organization" },
    publisher: { "@id": "https://getinksights.co.uk/#organization" },
    isPartOf: { "@id": "https://getinksights.co.uk/#website" },
    about: ["tattoo studio pricing", "Greater London tattoo studios", "tattoo deposits", "tattoo booking policies"],
  };

  return (
    <PublicShell>
      <JsonLd data={[datasetJsonLd, articleJsonLd]} />

      <PageHero
        eyebrow="INKSIGHTS Research · Published 21 October 2026"
        title={<>Greater London Tattoo Pricing & Booking Policy Snapshot 2026</>}
        description={
          <>
            A transparent pilot analysis of publicly published tattoo rates, minimum charges, day rates, deposits and
            cancellation policies. The sample is Greater London-led and should not be presented as a UK-wide market benchmark.
          </>
        }
      >
        <a href={CSV_URL} className="inline-flex min-h-12 items-center gap-2 rounded-full bg-mint px-6 py-3 font-bold text-ink-deep">
          <FileDown className="h-4 w-4" /> Download source table
        </a>
        <a href="/research-methodology" className="inline-flex min-h-12 items-center rounded-full border border-border px-6 py-3 font-bold text-ice">
          Research methodology
        </a>
      </PageHero>

      <section className="border-b border-border bg-ink">
        <div className="mx-auto max-w-6xl px-6 py-10">
          <div className="grid gap-4 md:grid-cols-4">
            {metrics.map((metric) => (
              <div key={metric.label} className="rounded-2xl border border-border bg-ink-deep p-5">
                <p className="text-xs font-bold uppercase tracking-[0.14em] text-muted-foreground">{metric.label}</p>
                <div className="mt-3 font-display text-4xl font-black text-mint">{metric.value}</div>
                <p className="mt-2 text-xs leading-relaxed text-muted-foreground">{metric.note}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section>
        <div className="mx-auto max-w-5xl px-6 py-16 md:py-24">
          <SectionHeading
            eyebrow="What the sample says"
            title="Published tattoo pricing varies materially even within one London market."
            description="The useful finding is not a single 'correct' price. It is the spread, the mix of pricing models and the amount of policy information a prospective client has to interpret."
          />
          <div className="mt-10 grid gap-5 md:grid-cols-2">
            <div className="rounded-2xl border border-border bg-ink p-6">
              <BarChart3 className="h-6 w-6 text-mint" />
              <h2 className="mt-4 font-display text-2xl font-black text-ice">Artist-level published rates</h2>
              <p className="mt-3 text-sm leading-relaxed text-muted-foreground">
                Among ten eligible artist-level hourly observations, the median published rate was £120/hour, with a range
                from £90 to £150. Nine published minimum-charge observations had a £90 median, while six full-day observations
                had a £725 median.
              </p>
            </div>
            <div className="rounded-2xl border border-border bg-ink p-6">
              <ShieldCheck className="h-6 w-6 text-mint" />
              <h2 className="mt-4 font-display text-2xl font-black text-ice">Booking-policy variation</h2>
              <p className="mt-3 text-sm leading-relaxed text-muted-foreground">
                On official pages with explicit cancellation or reschedule windows, the observed policies ranged from
                24 to 72 hours. Flat deposits in the small official-policy sample clustered around £50, while at least one
                studio used a percentage-based deposit instead.
              </p>
            </div>
          </div>

          <div className="mt-10 rounded-2xl border border-mint/25 bg-mint/5 p-6">
            <p className="text-xs font-bold uppercase tracking-[0.16em] text-mint">Interpretation</p>
            <p className="mt-3 text-sm leading-relaxed text-muted-foreground">
              The strongest commercial implication is transparency rather than price alone. Public prices are split across
              studio pages, artist pages and third-party booking/listing platforms, and the same studio can expose different
              scopes of information in different places. Studios should therefore treat pricing and booking-policy consistency
              as part of the customer journey, not just an internal admin decision.
            </p>
          </div>
        </div>
      </section>

      <section className="border-y border-border bg-ink">
        <div className="mx-auto max-w-5xl px-6 py-16 md:py-24">
          <SectionHeading
            eyebrow="Policy signals"
            title="The observed booking rules are not standardised."
            description="These are descriptive observations from a small pilot sample, not recommendations for what every studio should charge or require."
          />
          <div className="mt-10 grid gap-4 md:grid-cols-2">
            {policyMetrics.map(([label, value, note]) => (
              <div key={label} className="rounded-2xl border border-border bg-ink-deep p-6">
                <p className="text-xs font-bold uppercase tracking-[0.14em] text-muted-foreground">{label}</p>
                <div className="mt-3 font-display text-3xl font-black text-ice">{value}</div>
                <p className="mt-2 text-sm leading-relaxed text-muted-foreground">{note}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section>
        <div className="mx-auto max-w-5xl px-6 py-16 md:py-24">
          <SectionHeading
            eyebrow="Method and limitations"
            title="This is a pilot public-pricing snapshot—not a national pricing index."
            description="The study was deliberately scoped narrowly enough to keep the claims supportable."
          />
          <div className="mt-10 grid gap-5 md:grid-cols-2">
            {[
              ["Observation date", "The publishable source set was rechecked on 19 October 2026."],
              ["Geography", "The eligible sample covers Greater London studios and artist listings. It is not representative of all UK regions."],
              ["Sample", "19 eligible source observations across 15 unique studio identities. Conflicted or malformed prices were excluded from the aggregate figures."],
              ["Source mix", "8 observations came from official or primary pages and 11 from published artist/booking-listing pages. Source scope is preserved in the CSV."],
              ["Unit of analysis", "Artist rates are kept separate conceptually from studio-wide booking policies. A published artist rate is not automatically a studio-wide rate."],
              ["No causal claims", "This snapshot does not claim that a particular rate, deposit or policy produces better bookings, revenue or retention."],
            ].map(([title, text]) => (
              <div key={title} className="rounded-2xl border border-border bg-ink p-6">
                <h2 className="font-display text-xl font-black text-ice">{title}</h2>
                <p className="mt-3 text-sm leading-relaxed text-muted-foreground">{text}</p>
              </div>
            ))}
          </div>
          <p className="mt-8 text-sm leading-relaxed text-muted-foreground">
            See the full <a href="/research-methodology" className="font-bold text-mint hover:text-mint-soft">INKSIGHTS research methodology</a> for
            evidence labels, provenance, benchmark rules and correction standards.
          </p>
        </div>
      </section>

      <section className="border-y border-border bg-ink">
        <div className="mx-auto max-w-5xl px-6 py-16 md:py-24">
          <SectionHeading
            eyebrow="Selected primary sources"
            title="The public evidence remains inspectable."
            description="Source pages can change after observation. The CSV preserves the source URL and scope used for this release."
          />
          <div className="mt-8 overflow-hidden rounded-2xl border border-border">
            <div className="divide-y divide-border">
              {sampleSources.map(([studio, scope, href]) => (
                <div key={href} className="grid gap-2 bg-ink-deep p-5 md:grid-cols-[1fr_180px_auto] md:items-center">
                  <strong className="text-ice">{studio}</strong>
                  <span className="text-sm text-muted-foreground">{scope}</span>
                  <a href={href} rel="noopener noreferrer" className="text-sm font-bold text-mint hover:text-mint-soft">
                    View source →
                  </a>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      <section>
        <div className="mx-auto max-w-5xl px-6 py-16 md:py-24">
          <div className="rounded-3xl border border-mint/30 bg-ink p-8 md:p-10">
            <Database className="h-7 w-7 text-mint" />
            <h2 className="mt-5 font-display text-3xl font-black text-ice">For journalists, suppliers and industry partners</h2>
            <p className="mt-4 max-w-3xl text-sm leading-relaxed text-muted-foreground">
              You may cite the aggregate findings with attribution to INKSIGHTS and a link to this page. For methodology
              questions, additional cuts of the underlying public-source research, or future UK-wide releases, use the
              INKSIGHTS media and research contact route.
            </p>
            <div className="mt-6 flex flex-wrap gap-3">
              <a href="/press" className="rounded-full bg-mint px-6 py-3 font-bold text-ink-deep">Press & research information</a>
              <a href="/contact" className="rounded-full border border-border px-6 py-3 font-bold text-ice">Contact INKSIGHTS</a>
            </div>
          </div>
        </div>
      </section>
    </PublicShell>
  );
}
