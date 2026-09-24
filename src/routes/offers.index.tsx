import { createFileRoute } from "@tanstack/react-router";
import { ArrowRight, CheckCircle2 } from "lucide-react";
import { CtaSection, JsonLd, PageHero, PrimaryButton, PublicShell, SectionHeading } from "@/components/public-site";
import { publicOffers } from "@/lib/offer-data";

const CANONICAL_URL = "https://getinksights.co.uk/offers";

export const Route = createFileRoute("/offers/")({
  component: OffersPage,
  head: () => ({
    meta: [
      { title: "Tattoo Studio Growth Services | INKSIGHTS" },
      { name: "description", content: "Compare INKSIGHTS diagnosis, correction, implementation and monitoring services for UK tattoo studios." },
      { property: "og:title", content: "Tattoo Studio Growth Services | INKSIGHTS" },
      { property: "og:description", content: "Start with diagnosis, then use the smallest practical intervention for the studio's actual constraint." },
      { property: "og:url", content: CANONICAL_URL },
    ],
    links: [{ rel: "canonical", href: CANONICAL_URL }],
  }),
});

const serviceStages = [
  {
    number: "01",
    label: "Diagnose",
    title: "Find the constraint before choosing the intervention.",
    description: "Use a structured diagnosis when several commercial problems could be causing the same revenue symptom.",
    slugs: ["studio-intelligence-audit", "revenue-audit"],
  },
  {
    number: "02",
    label: "Fix",
    title: "Correct one visible, commercially relevant weakness.",
    description: "Use a tightly scoped correction when the evidence points to one immediate public-facing problem.",
    slugs: ["72-hour-visibility-fix"],
  },
  {
    number: "03",
    label: "Implement",
    title: "Build the operating system required to hold the gain.",
    description: "Use implementation when the constraint depends on workflow, routing, booking control, follow-up or operational consistency.",
    slugs: ["booking-retention-engine", "founding-studio-pilot"],
  },
  {
    number: "04",
    label: "Monitor",
    title: "Watch the signals that can deteriorate after the fix.",
    description: "Use ongoing monitoring only where an established baseline and meaningful change thresholds already exist.",
    slugs: ["visibility-watch"],
  },
] as const;

function OfferCard({ slug }: { slug: string }) {
  const offer = publicOffers.find((item) => item.slug === slug);
  if (!offer) return null;

  return (
    <a href={`/offers/${offer.slug}`} className="interactive-card group flex h-full flex-col rounded-3xl border border-border bg-ink p-7 transition hover:border-mint md:p-9">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <p className="text-xs font-bold uppercase tracking-[0.16em] text-mint">{offer.eyebrow}</p>
          <h3 className="mt-3 font-display text-2xl font-black text-ice md:text-3xl">{offer.name}</h3>
        </div>
        <span className="rounded-full border border-mint/30 bg-mint/10 px-4 py-2 text-xs font-bold text-mint">{offer.price}</span>
      </div>
      <p className="mt-5 flex-1 leading-relaxed text-muted-foreground">{offer.summary}</p>
      <div className="mt-6 grid gap-2 text-sm text-muted-foreground sm:grid-cols-2">
        {offer.deliverables.slice(0, 4).map((item) => (
          <span key={item} className="flex gap-2"><CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-mint" />{item}</span>
        ))}
      </div>
      <span className="mt-7 inline-flex items-center gap-2 font-bold text-mint">Review complete scope <ArrowRight className="h-4 w-4 transition group-hover:translate-x-1" /></span>
    </a>
  );
}

function OffersPage() {
  return (
    <PublicShell>
      <JsonLd data={{
        "@context": "https://schema.org",
        "@type": "CollectionPage",
        name: "INKSIGHTS tattoo studio growth services",
        url: CANONICAL_URL,
        hasPart: publicOffers.map((offer) => ({ "@type": "Service", name: offer.name, url: `${CANONICAL_URL}/${offer.slug}` })),
      }} />

      <PageHero
        eyebrow="Services by stage"
        title={<>Diagnose first. Buy only what the evidence justifies.</>}
        description={<>INKSIGHTS separates diagnosis, correction, implementation and monitoring so a studio does not buy a larger service than the current constraint requires.</>}
      >
        <PrimaryButton href="/studio-growth-check">Diagnose the studio first</PrimaryButton>
      </PageHero>

      <section className="border-b border-border bg-ink-deep">
        <div className="mx-auto max-w-7xl px-6 py-16 md:py-20">
          <div className="grid gap-4 md:grid-cols-4">
            {serviceStages.map((stage) => (
              <div key={stage.number} className="rounded-2xl border border-border bg-ink p-5">
                <div className="font-mono text-xs text-mint">{stage.number}</div>
                <div className="mt-3 font-display text-lg font-black text-ice">{stage.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {serviceStages.map((stage, index) => (
        <section key={stage.number} className={index % 2 === 0 ? "bg-ink-deep" : "border-y border-border bg-ink"}>
          <div className="mx-auto max-w-7xl px-6 py-20 md:py-24">
            <div className="grid gap-10 lg:grid-cols-[.72fr_1.28fr]">
              <div className="lg:sticky lg:top-28 lg:self-start">
                <p className="text-xs font-bold uppercase tracking-[0.18em] text-mint">{stage.number} / {stage.label}</p>
                <h2 className="mt-4 text-balance font-display text-3xl font-black text-ice md:text-5xl">{stage.title}</h2>
                <p className="mt-5 max-w-xl leading-relaxed text-muted-foreground">{stage.description}</p>
              </div>
              <div className={stage.slugs.length > 1 ? "grid gap-6 xl:grid-cols-2" : "grid gap-6"}>
                {stage.slugs.map((slug) => <OfferCard key={slug} slug={slug} />)}
              </div>
            </div>
          </div>
        </section>
      ))}

      <section className="border-y border-border bg-ink">
        <div className="mx-auto max-w-7xl px-6 py-20 md:py-24">
          <SectionHeading
            eyebrow="Routing principle"
            title="The correct answer can still be: do nothing yet."
            description="Where a studio lacks implementation capacity, decision-maker access or a commercially material problem, the appropriate route is a free action plan or nurture—not an unnecessary sales call."
          />
        </div>
      </section>

      <CtaSection />
    </PublicShell>
  );
}
