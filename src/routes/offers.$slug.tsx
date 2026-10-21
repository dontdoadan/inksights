import { createFileRoute, useSearch } from "@tanstack/react-router";
import { useServerFn } from "@tanstack/react-start";
import { AlertTriangle, CheckCircle2, Clock3, Loader2, XCircle } from "lucide-react";
import { useEffect, useState } from "react";
import type { ReactNode } from "react";
import { toast } from "sonner";
import { FoundingStudioCompletionExperience, FoundingStudioInviteExperience } from "@/components/founding-studio-experience";
import {
  CtaSection,
  JsonLd,
  PageHero,
  PrimaryButton,
  PublicShell,
  SecondaryButton,
  SectionHeading,
} from "@/components/public-site";
import { createCheckoutSession, verifyCheckoutSession } from "@/lib/payments.functions";
import { trackWebsiteEvent } from "@/lib/website-events";
import { getPublicOffer, growthLeverLabels } from "@/lib/offer-data";

const OFFER_SEO: Record<string, { title: string; description: string }> = {
  "primary-constraint-programme": { title: "Tattoo Studio Improvement Programme | INKSIGHTS", description: "Implement one evidenced studio priority with an INKSIGHTS Primary Constraint Programme. Scope, price, responsibilities and outcome review agreed in writing." },
  "founding-studio-pilot": { title: "Founding Studio Pilot: Scope & Cost | INKSIGHTS", description: "Application-only implementation for one UK tattoo studio: £1,500 setup plus £750/month for three months. Review scope, requirements and minimum commitment." },
  "studio-intelligence-audit": {
    title: "Tattoo Studio Business Audit UK | INKSIGHTS",
    description:
      "A £395 one-off audit for UK tattoo studios: visibility, competitors, booking journey, prioritised recommendations, a 90-day plan and findings session.",
  },
  "72-hour-visibility-fix": {
    title: "Tattoo Studio SEO & Google Visibility Fix | INKSIGHTS",
    description:
      "£249 one-off visibility fix for UK tattoo studios. Profile, local-search and booking-route corrections over three working days once intake and access are complete.",
  },
  "visibility-watch": {
    title: "Tattoo Studio Google Visibility Monitoring | INKSIGHTS",
    description:
      "£99/month Visibility Watch for UK tattoo studios. Monitor agreed search, public-profile and reputation changes, with prioritised actions when needed.",
  },
  "revenue-audit": {
    title: "Tattoo Studio Revenue Audit UK | INKSIGHTS",
    description:
      "Diagnose tattoo studio revenue leakage across enquiries, bookings, capacity, cancellations, transaction value, repeat work and measurement.",
  },
  "booking-retention-engine": {
    title: "Tattoo Studio Booking & Retention System | INKSIGHTS",
    description:
      "Build a controlled tattoo studio enquiry, booking, reminder, cancellation, follow-up and client-retention system around the studio's real workflow.",
  },
};

export const Route = createFileRoute("/offers/$slug")({
  component: OfferPage,
  validateSearch: (search: Record<string, unknown>) => ({
    checkout: typeof search.checkout === "string" ? search.checkout : undefined,
    session_id: typeof search.session_id === "string" ? search.session_id : undefined,
    lead_id: typeof search.lead_id === "string" ? search.lead_id : undefined,
    audit_id: typeof search.audit_id === "string" ? search.audit_id : undefined,
    invite: typeof search.invite === "string" ? search.invite : undefined,
  }),
  head: ({ params, match }) => {
    const offer = getPublicOffer(params.slug);
    const canonical = `https://getinksights.co.uk/offers/${params.slug}`;
    const routeSearch = (match.search || {}) as Record<string, unknown>;
    const privateFoundingState = typeof routeSearch.invite === "string" || routeSearch.checkout === "founding-success";
    const seo = offer ? OFFER_SEO[offer.slug] : undefined;
    return {
      meta: [
        { title: seo?.title ?? (offer ? `${offer.name} | INKSIGHTS` : "INKSIGHTS Offer") },
        ...(privateFoundingState || !offer ? [{ name: "robots", content: "noindex,nofollow,noarchive" }] : []),
        { name: "description", content: seo?.description ?? offer?.summary ?? "INKSIGHTS tattoo studio growth solution." },
        { property: "og:title", content: seo?.title ?? offer?.name ?? "INKSIGHTS Offer" },
        { property: "og:description", content: seo?.description ?? offer?.summary ?? "INKSIGHTS tattoo studio growth solution." },
        { property: "og:url", content: canonical },
        { property: "og:type", content: "website" },
      ],
      links: [{ rel: "canonical", href: canonical }],
    };
  },
  headers: ({ match }) => {
    const routeSearch = (match.search || {}) as Record<string, unknown>;
    const privateFoundingState = typeof routeSearch.invite === "string" || routeSearch.checkout === "founding-success";
    return privateFoundingState ? { "X-Robots-Tag": "noindex, nofollow, noarchive" } : undefined;
  },
});

function OfferPage() {
  const { slug } = Route.useParams();
  const search = useSearch({ from: "/offers/$slug" });
  const offer = getPublicOffer(slug);
  const verifyCheckout = useServerFn(verifyCheckoutSession);

  useEffect(() => {
    if (!offer || search.checkout !== "success" || !search.session_id) return;
    void verifyCheckout({ data: { sessionId: search.session_id } })
      .then((verified) => {
        if (!verified.paid) return;
        trackWebsiteEvent("payment_completed", {
          offer: verified.offerSlug || offer.slug,
          amount_minor: verified.amountTotal || 0,
          currency: verified.currency || "gbp",
        });
      })
      .catch(() => {
        trackWebsiteEvent("checkout_error", { offer: offer.slug, reason: "verification_failed" });
      });
  }, [offer, search.checkout, search.session_id, verifyCheckout]);

  if (!offer) {
    return (
      <PublicShell>
        <PageHero eyebrow="Offer not found" title="This solution is not currently published." description="Return to the complete INKSIGHTS offer catalogue." compact>
          <PrimaryButton href="/offers">View all solutions</PrimaryButton>
        </PageHero>
      </PublicShell>
    );
  }

  if (offer.slug === "studio-intelligence-audit" && search.invite) {
    return <FoundingStudioInviteExperience token={search.invite} />;
  }

  if (offer.slug === "studio-intelligence-audit" && search.checkout === "founding-success" && search.session_id) {
    return <FoundingStudioCompletionExperience sessionId={search.session_id} />;
  }

  const canonical = `https://getinksights.co.uk/offers/${offer.slug}`;
  return (
    <PublicShell>
      <JsonLd data={[{
        "@context": "https://schema.org",
        "@type": "Service",
        name: offer.name,
        description: offer.summary,
        url: canonical,
        provider: { "@type": "Organization", name: "INKSIGHTS", url: "https://getinksights.co.uk" },
        areaServed: { "@type": "Country", name: "United Kingdom" },
        offers: offer.structuredPrice
          ? {
              "@type": "Offer",
              priceCurrency: "GBP",
              price: offer.structuredPrice,
              availability: "https://schema.org/InStock",
              url: offer.checkoutUrl || canonical,
            }
          : undefined,
      }, {
        "@context": "https://schema.org",
        "@type": "BreadcrumbList",
        itemListElement: [
          { "@type": "ListItem", position: 1, name: "Services", item: "https://getinksights.co.uk/offers" },
          { "@type": "ListItem", position: 2, name: offer.name, item: canonical },
        ],
      }]} />
      <PageHero eyebrow={offer.eyebrow} title={offer.name} description={offer.summary}>
        {offer.stripePriceId ? <CheckoutButton offer={offer} leadId={search.lead_id} auditId={search.audit_id} /> : <PrimaryButton href={`/contact?topic=${offer.slug === "founding-studio-pilot" || offer.slug === "booking-retention-engine" || offer.slug === "revenue-audit" ? "other" : offer.slug}`}>Discuss this service</PrimaryButton>}
        <SecondaryButton href="/studio-growth-check">Start with the free Growth Check</SecondaryButton>
      </PageHero>

      <nav aria-label="Breadcrumb" className="border-b border-border bg-ink-deep">
        <ol className="mx-auto flex max-w-7xl items-center gap-2 px-6 py-4 text-sm text-muted-foreground">
          <li><a href="/offers" className="font-semibold transition hover:text-mint">Services</a></li>
          <li aria-hidden="true">/</li>
          <li aria-current="page" className="truncate text-ice">{offer.name}</li>
        </ol>
      </nav>

      {search.checkout === "success" && (
        <div className="border-b border-mint/30 bg-mint/10 px-6 py-4 text-center text-sm font-medium text-mint">
          Payment successful. Thank you — INKSIGHTS will contact you within one working day to begin intake.
        </div>
      )}
      {search.checkout === "cancelled" && (
        <div className="border-b border-amber-300/30 bg-amber-300/10 px-6 py-4 text-center text-sm font-medium text-amber-200">
          Checkout was cancelled. No payment was taken. You can try again whenever you are ready.
        </div>
      )}

      <section className="border-b border-border bg-ink">
        <div className="mx-auto grid max-w-7xl gap-6 px-6 py-10 md:grid-cols-2 lg:grid-cols-4">
          <Info label="Price" value={offer.price} />
          <Info label="Billing" value={offer.billing} />
          <Info label="Availability" value={offer.commercialStatus} />
          <Info label="Delivery" value={offer.timeframe} icon={<Clock3 className="h-5 w-5" />} />
          <Info label="Growth levers" value={offer.growthLevers.map((lever) => growthLeverLabels[lever]).join(" · ")} />
          <Info label="Performance pricing" value={offer.performancePricing} />
        </div>
      </section>

      {offer.slug === "studio-intelligence-audit" ? (
        <section className="border-b border-border bg-ink-deep">
          <div className="mx-auto max-w-7xl px-6 py-20 md:py-28">
            <SectionHeading
              eyebrow="What you receive"
              title="What your £395 audit includes."
              description="One clearly defined £395 purchase: a written, evidence-led diagnosis for one location, prioritised next steps and a live findings session. You can purchase without a sales call."
            />
            <div className="mt-10 grid gap-5 md:grid-cols-2 xl:grid-cols-3">
              {[
                ["01", "Executive Summary", "The primary commercial constraint, the evidence supporting it and the next decision the studio should make."],
                ["02", "Studio Snapshot", "A concise view of visibility, enquiry conversion, capacity, booking conditions and retention signals."],
                ["03", "Market & Competitor Review", "Local positioning, search visibility, competitor evidence and identifiable gaps in the public customer journey."],
                ["04", "Top Three Opportunities", "Commercial opportunities ordered by evidence, dependency, effort and usefulness rather than a generic list of tactics."],
                ["05", "Prioritised Recommendations", "Specific actions linked to the diagnosed constraint, with assumptions and unknowns kept visible."],
                ["06", "90-Day Action Plan", "A practical sequence of actions, owners, checkpoints and one measurable starting intervention."],
              ].map(([number, title, description]) => (
                <div key={number} className="rounded-2xl border border-border bg-ink p-6">
                  <div className="font-mono text-xs text-mint">{number}</div>
                  <h3 className="mt-4 font-display text-xl font-black text-ice">{title}</h3>
                  <p className="mt-3 text-sm leading-relaxed text-muted-foreground">{description}</p>
                </div>
              ))}
            </div>
            <div className="mt-6 rounded-2xl border border-mint/25 bg-mint/5 p-5 text-sm leading-relaxed text-muted-foreground">
              <strong className="text-ice">Delivery commitment:</strong> we email the intake request within one working day of payment. Your PDF report follows within five working days of complete intake; we offer a 45–60 minute remote findings session within five further working days. Implementation and monitoring are separate purchases.
            </div>
          </div>
        </section>
      ) : null}

      <section>
        <div className="mx-auto max-w-7xl px-6 py-20 md:py-28">
          <div className="grid gap-12 lg:grid-cols-2">
            <div>
              <SectionHeading eyebrow="What is delivered" title="A defined output, not an open-ended promise." />
              <ul className="mt-8 space-y-4">
                {offer.deliverables.map((item) => (
                  <li key={item} className="flex gap-3 rounded-xl border border-border bg-ink p-4 text-muted-foreground">
                    <CheckCircle2 className="mt-0.5 h-5 w-5 shrink-0 text-mint" />
                    <span>{item}</span>
                  </li>
                ))}
              </ul>
            </div>
            <div>
              <SectionHeading eyebrow="Best fit" title="Who this route is designed for." />
              <ul className="mt-8 space-y-4">
                {offer.idealFor.map((item) => (
                  <li key={item} className="flex gap-3 rounded-xl border border-border bg-ink p-4 text-muted-foreground">
                    <CheckCircle2 className="mt-0.5 h-5 w-5 shrink-0 text-mint" />
                    <span>{item}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      </section>

      <section className="border-y border-border bg-ink">
        <div className="mx-auto max-w-7xl px-6 py-20 md:py-28">
          <SectionHeading eyebrow="Delivery sequence" title="How the work moves from diagnosis to verification." />
          <div className="mt-10 grid gap-5 lg:grid-cols-4">
            {offer.process.map((step, index) => (
              <div key={step.title} className="rounded-2xl border border-border bg-ink-deep p-6">
                <div className="font-display text-4xl font-black text-mint/35">{String(index + 1).padStart(2, "0")}</div>
                <h3 className="mt-5 font-display text-xl font-black text-ice">{step.title}</h3>
                <p className="mt-3 text-sm leading-relaxed text-muted-foreground">{step.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section>
        <div className="mx-auto grid max-w-7xl gap-8 px-6 py-20 lg:grid-cols-2 md:py-28">
          <div className="rounded-2xl border border-mint/35 bg-mint/5 p-7">
            <h2 className="flex items-center gap-3 font-display text-2xl font-black text-ice"><CheckCircle2 className="h-6 w-6 text-mint" />What the studio must provide</h2>
            <ul className="mt-6 space-y-3 text-sm leading-relaxed text-muted-foreground">
              {offer.requirements.map((item) => <li key={item}>• {item}</li>)}
            </ul>
          </div>
          <div className="rounded-2xl border border-amber-300/35 bg-amber-300/5 p-7">
            <h2 className="flex items-center gap-3 font-display text-2xl font-black text-ice"><AlertTriangle className="h-6 w-6 text-amber-200" />Not included or promised</h2>
            <ul className="mt-6 space-y-3 text-sm leading-relaxed text-muted-foreground">
              {offer.exclusions.map((item) => <li key={item} className="flex gap-2"><XCircle className="mt-0.5 h-4 w-4 shrink-0 text-amber-200" />{item}</li>)}
            </ul>
          </div>
        </div>
      </section>

      <section className="border-t border-border bg-ink">
        <div className="mx-auto max-w-5xl px-6 py-20 md:py-28">
          <SectionHeading eyebrow="Questions before commitment" title="Scope, billing and limitations." />
          <div className="mt-8 space-y-3">
            {offer.faqs.map(([question, answer]) => (
              <details key={question} className="rounded-2xl border border-border bg-ink-deep p-5 open:border-mint/50">
                <summary className="cursor-pointer list-none font-display text-lg font-bold text-ice">{question}</summary>
                <p className="mt-4 leading-relaxed text-muted-foreground">{answer}</p>
              </details>
            ))}
          </div>
        </div>
      </section>
      {offer.slug === "studio-intelligence-audit" ? (
        <section className="border-t border-border bg-ink-deep">
          <div className="mx-auto flex max-w-5xl flex-col items-start gap-5 px-6 py-16 md:py-20">
            <h2 className="font-display text-3xl font-black text-ice md:text-4xl">One studio. One clear diagnosis. £395.</h2>
            <p className="max-w-2xl leading-relaxed text-muted-foreground">Secure one-time checkout, with no subscription or mandatory sales call. You receive an intake request within one working day of payment.</p>
            <CheckoutButton offer={offer} leadId={search.lead_id} auditId={search.audit_id} />
            <p className="text-xs text-muted-foreground">Please review the <a href="/terms" className="font-bold text-mint">terms</a> and <a href="/privacy" className="font-bold text-mint">privacy notice</a> before purchase.</p>
          </div>
        </section>
      ) : <CtaSection title={`Check whether ${offer.name} is the correct next step.`} /> }
    </PublicShell>
  );
}

function CheckoutButton({
  offer,
  leadId,
  auditId,
}: {
  offer: { slug: string; name: string; checkoutUrl?: string };
  leadId?: string;
  auditId?: string;
}) {
  const [isLoading, setIsLoading] = useState(false);
  const startCheckout = useServerFn(createCheckoutSession);

  return (
    <button
      type="button"
      disabled={isLoading}
      onClick={async () => {
        setIsLoading(true);
        trackWebsiteEvent("checkout_started", { offer: offer.slug });

        if (offer.checkoutUrl) {
          window.location.href = offer.checkoutUrl;
          return;
        }

        try {
          const { url } = await startCheckout({ data: { slug: offer.slug, leadId, auditId } });
          if (url) {
            window.location.href = url;
            return;
          }
          throw new Error("Checkout session did not return a URL.");
        } catch {
          trackWebsiteEvent("checkout_error", { offer: offer.slug, reason: "checkout_initialization_failed" });
          toast.error("Secure checkout is temporarily unavailable. Please ask a scope question and we will help you complete the purchase.");
          setIsLoading(false);
        }
      }}
      className="inline-flex items-center justify-center gap-2 rounded-full bg-mint px-6 py-3 text-sm font-bold text-ink-deep transition hover:bg-mint-soft disabled:opacity-60"
    >
      {isLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : null}
      {offer.slug === "studio-intelligence-audit" ? "Buy the audit — £395 one-off" : "Continue to secure checkout"}
    </button>
  );
}

function Info({ label, value, icon }: { label: string; value: string; icon?: ReactNode }) {
  return (
    <div className="rounded-2xl border border-border bg-ink-deep p-5">
      <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-[0.15em] text-mint">{icon}{label}</div>
      <p className="mt-3 text-sm leading-relaxed text-ice">{value}</p>
    </div>
  );
}
