import { createFileRoute } from "@tanstack/react-router";
import { ArrowRight, CheckCircle2 } from "lucide-react";
import { CtaSection, JsonLd, PageHero, PrimaryButton, PublicShell, SecondaryButton, SectionHeading } from "@/components/public-site";
import { StudioJourney, StudioFaqs, IndustryEnquiry } from "@/components/studio-journey";
import { publicOffers } from "@/lib/offer-data";

const CANONICAL_URL = "https://getinksights.co.uk/offers";

export const Route = createFileRoute("/offers/")({
  component: OffersPage,
  head: () => ({
    meta: [
      { title: "Tattoo Studio Growth Services | INKSIGHTS" },
      { name: "description", content: "Compare the free Growth Check, £249 Visibility Fix, £395 Studio Intelligence Audit, scoped implementation and £99/month Visibility Watch for UK studios." },
      { property: "og:title", content: "Tattoo Studio Growth Services | INKSIGHTS" },
      { property: "og:description", content: "Start with diagnosis, then use the smallest practical intervention for the studio's actual constraint." },
      { property: "og:url", content: CANONICAL_URL },
    ],
    links: [{ rel: "canonical", href: CANONICAL_URL }],
  }),
});

const serviceStages = [
  { number: "01", label: "Focused visibility help", title: "Fix a clear public-facing problem.", description: "After the free check, a visible profile or booking-route issue may justify a focused correction. The three-working-day fix and monthly watch are separate services.", slugs: ["72-hour-visibility-fix"] },
  { number: "02", label: "Investigate", title: "Understand what deserves attention first.", description: "The £395 Studio Intelligence Audit is the defined paid diagnosis. It provides a structured review, recommendations and a 90-day action plan; implementation is separate.", slugs: ["studio-intelligence-audit"] },
  { number: "03", label: "Implement and review", title: "Put one evidenced priority into practice.", description: "A Primary Constraint Programme is scoped after diagnosis. Booking and retention work is one possible intervention; the application-only pilot has its own published terms.", slugs: ["primary-constraint-programme", "booking-retention-engine", "founding-studio-pilot"] },
  { number: "04", label: "Monitor", title: "Keep watching what matters to the next decision.", description: "Visibility Watch covers agreed public signals. Broader ongoing monitoring is considered separately when useful, with scope and terms confirmed first.", slugs: ["visibility-watch"] },
  { number: "05", label: "Wider questions", title: "Need a review beyond the standard audit?", description: "If your locations, information or commercial questions fall outside the £395 audit, discuss a wider scope before committing.", slugs: ["revenue-audit"] },
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
        title={<>Choose the help your studio needs next.</>}
        description={<>INKSIGHTS separates diagnosis, correction, implementation and monitoring so a studio does not buy a larger service than the current constraint requires.</>}
      >
        <PrimaryButton href="/studio-growth-check">Start the free Studio Growth Check</PrimaryButton>
        <SecondaryButton href="/contact?topic=growth-check">Don't have monthly figures? Enquire instead</SecondaryButton>
      </PageHero>

      <StudioJourney />
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
            description="Where a studio lacks implementation capacity, decision-maker access or a commercially material problem, the appropriate next step is to establish a better baseline or take a smaller practical action."
          />
        </div>
      </section>

      <StudioFaqs />
      <IndustryEnquiry />
      <CtaSection />
    </PublicShell>
  );
}
