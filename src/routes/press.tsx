import { createFileRoute } from "@tanstack/react-router";
import { FileText, Link2, Search, ShieldCheck } from "lucide-react";
import { JsonLd, PageHero, PublicShell, SectionHeading } from "@/components/public-site";

const CANONICAL_URL = "https://getinksights.co.uk/press";

export const Route = createFileRoute("/press")({
  component: PressPage,
  head: () => ({
    meta: [
      { title: "INKSIGHTS Press, Media & Research Information" },
      {
        name: "description",
        content:
          "Official INKSIGHTS identity, description, research assets, methodology, media contact and citation information for UK tattoo-industry coverage.",
      },
      { property: "og:title", content: "INKSIGHTS Press, Media & Research Information" },
      { property: "og:url", content: CANONICAL_URL },
    ],
    links: [{ rel: "canonical", href: CANONICAL_URL }],
  }),
});

function PressPage() {
  const profileJsonLd = {
    "@context": "https://schema.org",
    "@type": "ProfilePage",
    name: "INKSIGHTS Press, Media & Research Information",
    url: CANONICAL_URL,
    mainEntity: { "@id": "https://getinksights.co.uk/#organization" },
    dateModified: "2026-10-21",
  };

  return (
    <PublicShell>
      <JsonLd data={profileJsonLd} />
      <PageHero
        eyebrow="Official entity and media information"
        title={<>INKSIGHTS — Growth Intelligence for UK Tattoo Studios</>}
        description={
          <>
            This is the canonical verification page for journalists, podcast hosts, suppliers, software providers and
            industry organisations referencing INKSIGHTS or its research.
          </>
        }
      />

      <section>
        <div className="mx-auto max-w-5xl px-6 py-16 md:py-24">
          <SectionHeading eyebrow="Official identity" title="Use this description when identifying INKSIGHTS." />
          <div className="mt-10 grid gap-5 md:grid-cols-2">
            {[
              ["Official name", "INKSIGHTS"],
              ["Descriptor", "Growth Intelligence for UK Tattoo Studios"],
              ["Canonical website", "https://getinksights.co.uk/"],
              ["Primary market", "United Kingdom tattoo studios and tattoo-industry businesses"],
              ["Core subject areas", "Visibility, enquiries, booking, capacity, retention, revenue and studio benchmarking"],
              ["Research standard", "Evidence-labelled, source-attributable analysis with published limitations"],
            ].map(([label, value]) => (
              <div key={label} className="rounded-2xl border border-border bg-ink p-6">
                <p className="text-xs font-bold uppercase tracking-[0.14em] text-mint">{label}</p>
                <p className="mt-3 text-sm leading-relaxed text-ice">{value}</p>
              </div>
            ))}
          </div>
          <div className="mt-8 rounded-2xl border border-border bg-ink-deep p-6 text-sm leading-relaxed text-muted-foreground">
            <strong className="text-ice">Disambiguation:</strong> INKSIGHTS at getinksights.co.uk is the UK tattoo-studio
            growth-intelligence business. Unrelated businesses, publications, apps or media projects using “Inksights” are
            not affiliated unless this page explicitly states otherwise.
          </div>
        </div>
      </section>

      <section className="border-y border-border bg-ink">
        <div className="mx-auto max-w-5xl px-6 py-16 md:py-24">
          <SectionHeading
            eyebrow="Research assets"
            title="Current public research available for citation."
            description="Research pages include methodology and limitations so the findings can be checked before reuse."
          />
          <div className="mt-10 grid gap-5 md:grid-cols-2">
            <a href="/research/greater-london-tattoo-pricing-2026" className="rounded-2xl border border-mint/30 bg-ink-deep p-6 transition hover:border-mint">
              <FileText className="h-6 w-6 text-mint" />
              <h2 className="mt-4 font-display text-2xl font-black text-ice">Greater London Tattoo Pricing & Booking Policy Snapshot 2026</h2>
              <p className="mt-3 text-sm leading-relaxed text-muted-foreground">Published rates, minimums, full-day pricing, deposits and cancellation-window observations from a 15-studio pilot sample.</p>
            </a>
            <a href="/research-methodology" className="rounded-2xl border border-border bg-ink-deep p-6 transition hover:border-mint">
              <ShieldCheck className="h-6 w-6 text-mint" />
              <h2 className="mt-4 font-display text-2xl font-black text-ice">INKSIGHTS Research Methodology</h2>
              <p className="mt-3 text-sm leading-relaxed text-muted-foreground">Evidence labels, source hierarchy, provenance, benchmark rules, attribution and correction standards.</p>
            </a>
          </div>
        </div>
      </section>

      <section>
        <div className="mx-auto max-w-5xl px-6 py-16 md:py-24">
          <SectionHeading eyebrow="Citation guidance" title="Reference the specific research release—not a broader claim." />
          <div className="mt-8 rounded-2xl border border-border bg-ink p-6">
            <p className="text-sm leading-relaxed text-muted-foreground">
              Suggested attribution: <strong className="text-ice">INKSIGHTS, “Greater London Tattoo Pricing & Booking Policy Snapshot 2026,” published 21 October 2026.</strong>
            </p>
            <p className="mt-4 text-sm leading-relaxed text-muted-foreground">
              Please retain the geography and sample caveat. The October 2026 pilot is Greater London research and should
              not be described as a complete UK tattoo-market benchmark.
            </p>
          </div>
        </div>
      </section>

      <section className="border-y border-border bg-ink">
        <div className="mx-auto max-w-5xl px-6 py-16 md:py-24">
          <SectionHeading eyebrow="Verification" title="How to verify an INKSIGHTS claim or identity." />
          <div className="mt-10 grid gap-5 md:grid-cols-3">
            {[
              [Search, "Check the canonical domain", "Official public material should resolve to getinksights.co.uk or a clearly identified INKSIGHTS-controlled service."],
              [Link2, "Follow the cited source", "Research claims should link to a methodology, source page, dataset or evidence note rather than relying on an unattributed number."],
              [ShieldCheck, "Ask about limitations", "INKSIGHTS separates verified observations from models and hypotheses and will state when a sample is too small for a stronger claim."],
            ].map(([Icon, title, text]) => {
              const ItemIcon = Icon as typeof Search;
              return (
                <div key={String(title)} className="rounded-2xl border border-border bg-ink-deep p-6">
                  <ItemIcon className="h-6 w-6 text-mint" />
                  <h2 className="mt-4 font-display text-xl font-black text-ice">{String(title)}</h2>
                  <p className="mt-3 text-sm leading-relaxed text-muted-foreground">{String(text)}</p>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      <section>
        <div className="mx-auto max-w-5xl px-6 py-16 md:py-24">
          <SectionHeading eyebrow="Media and research contact" title="Need a source check, quote or a different data cut?" />
          <p className="mt-5 max-w-3xl text-base leading-relaxed text-muted-foreground">
            Use the INKSIGHTS contact form and identify the request as media, research or partnership. Requests for
            unpublished data are assessed against the research methodology and privacy constraints before anything is shared.
          </p>
          <a href="/contact" className="mt-7 inline-flex rounded-full bg-mint px-6 py-3 font-bold text-ink-deep">Contact INKSIGHTS</a>
        </div>
      </section>
    </PublicShell>
  );
}
