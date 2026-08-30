import { createFileRoute } from "@tanstack/react-router";
import { ArrowRight, CheckCircle2 } from "lucide-react";
import {
  CtaSection,
  JsonLd,
  PageHero,
  PrimaryButton,
  PublicShell,
  SectionHeading,
} from "@/components/public-site";
import { publicOffers } from "@/lib/offer-data";

const CANONICAL_URL = "https://getinksight.co.uk/offers";

export const Route = createFileRoute("/offers")({
  component: OffersPage,
  head: () => ({
    meta: [
      { title: "Tattoo Studio Growth Services | INKSIGHT" },
      {
        name: "description",
        content:
          "Compare INKSIGHT visibility, revenue, booking and retention solutions for UK tattoo studios.",
      },
      { property: "og:title", content: "Tattoo Studio Growth Services | INKSIGHT" },
      { property: "og:url", content: CANONICAL_URL },
    ],
    links: [{ rel: "canonical", href: CANONICAL_URL }],
  }),
});

function OffersPage() {
  return (
    <PublicShell>
      <JsonLd
        data={{
          "@context": "https://schema.org",
          "@type": "CollectionPage",
          name: "INKSIGHT tattoo studio growth solutions",
          url: CANONICAL_URL,
          hasPart: publicOffers.map((offer) => ({
            "@type": "Service",
            name: offer.name,
            url: `${CANONICAL_URL}/${offer.slug}`,
          })),
        }}
      />
      <PageHero
        eyebrow="Solutions by constraint"
        title={<>Do not buy a larger service than the studio needs.</>}
        description={
          <>
            INKSIGHT begins with diagnosis, then uses the smallest practical intervention that can
            remove the current visibility, booking, retention or control problem.
          </>
        }
      >
        <PrimaryButton href="/studio-growth-check">Diagnose the studio first</PrimaryButton>
      </PageHero>

      <section>
        <div className="mx-auto max-w-7xl px-6 py-20 md:py-28">
          <SectionHeading
            eyebrow="Current offer stack"
            title="Clear scope, requirements and exclusions."
            description="Each page explains what is delivered, what access is required and what the service does not promise."
          />
          <div className="mt-12 grid gap-6 lg:grid-cols-2">
            {publicOffers.map((offer) => (
              <a
                key={offer.slug}
                href={`/offers/${offer.slug}`}
                className="group flex h-full flex-col rounded-3xl border border-border bg-ink p-7 transition hover:border-mint md:p-9"
              >
                <div className="flex flex-wrap items-start justify-between gap-4">
                  <div>
                    <p className="text-xs font-bold uppercase tracking-[0.16em] text-mint">
                      {offer.eyebrow}
                    </p>
                    <h2 className="mt-3 font-display text-3xl font-black text-ice">{offer.name}</h2>
                  </div>
                  <span className="rounded-full border border-mint/30 bg-mint/10 px-4 py-2 text-xs font-bold text-mint">
                    {offer.price}
                  </span>
                </div>
                <p className="mt-5 flex-1 leading-relaxed text-muted-foreground">{offer.summary}</p>
                <div className="mt-6 grid gap-2 text-sm text-muted-foreground sm:grid-cols-2">
                  {offer.deliverables.slice(0, 4).map((item) => (
                    <span key={item} className="flex gap-2">
                      <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-mint" />
                      {item}
                    </span>
                  ))}
                </div>
                <span className="mt-7 inline-flex items-center gap-2 font-bold text-mint">
                  Review complete scope{" "}
                  <ArrowRight className="h-4 w-4 transition group-hover:translate-x-1" />
                </span>
              </a>
            ))}
          </div>
        </div>
      </section>

      <section className="border-y border-border bg-ink">
        <div className="mx-auto max-w-7xl px-6 py-18 md:py-24">
          <SectionHeading
            eyebrow="Routing principle"
            title="The correct answer can be: do nothing yet."
            description="Where a studio lacks implementation capacity, decision-maker access or a clear commercial problem, the appropriate route is a free action plan or nurture—not an unnecessary sales call."
          />
        </div>
      </section>
      <CtaSection />
    </PublicShell>
  );
}
