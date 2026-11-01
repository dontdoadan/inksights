import { createFileRoute } from "@tanstack/react-router";
import { ArrowRight, CheckCircle2, FileSearch2, ShieldCheck } from "lucide-react";
import { PageHero, PublicShell, PrimaryButton } from "@/components/public-site";

const CANONICAL_URL = "https://getinksights.co.uk/studio-opportunity-receipt";

export const Route = createFileRoute("/studio-opportunity-receipt")({
  component: StudioOpportunityReceiptPage,
  head: () => ({
    meta: [
      { title: "Studio Opportunity Receipt | INKSIGHTS" },
      {
        name: "description",
        content: "How an INKSIGHTS Studio Opportunity Receipt separates observable booking-journey issues from hypothetical revenue scenarios for UK tattoo studios.",
      },
      { property: "og:url", content: CANONICAL_URL },
      { property: "og:title", content: "Studio Opportunity Receipt | INKSIGHTS" },
    ],
    links: [{ rel: "canonical", href: CANONICAL_URL }],
  }),
});

const steps = [
  {
    number: "01",
    title: "One public observation",
    body: "We identify a specific, source-linked condition on your public website or booking journey. A public observation is not proof of missed customers.",
  },
  {
    number: "02",
    title: "A commercial hypothesis",
    body: "We explain a plausible consequence of that condition and what first-party data would be needed to establish whether it actually matters.",
  },
  {
    number: "03",
    title: "One measurable test",
    body: "We propose a narrow improvement and identify how to measure customer enquiries, deposits or administrative effort before and after.",
  },
] as const;

function StudioOpportunityReceiptPage() {
  return (
    <PublicShell>
      <PageHero
        eyebrow="Commercial evidence · Personalised studio insight"
        title={<>One observable issue. One testable opportunity.</>}
        description={<>An INKSIGHTS Studio Opportunity Receipt is a short, source-backed observation of your studio's public customer journey. It never claims that an assumed financial scenario represents actual lost revenue.</>}
      >
        <PrimaryButton href="/offers/studio-intelligence-audit">
          Explore the £395 Studio Intelligence Audit <ArrowRight className="ml-2 h-4 w-4" />
        </PrimaryButton>
      </PageHero>

      <section className="border-y border-border bg-ink">
        <div className="mx-auto max-w-6xl px-6 py-16 md:py-24">
          <p className="text-xs font-bold uppercase tracking-[.18em] text-mint">What the receipt contains</p>
          <h2 className="mt-3 max-w-3xl font-display text-3xl font-black text-ice md:text-5xl">Evidence first. Revenue assumptions clearly labelled.</h2>
          <div className="mt-10 grid gap-5 md:grid-cols-3">
            {steps.map((step) => (
              <div key={step.number} className="rounded-3xl border border-border bg-ink-deep p-7">
                <span className="font-mono text-sm font-bold text-mint">{step.number}</span>
                <h3 className="mt-4 font-display text-xl font-black text-ice">{step.title}</h3>
                <p className="mt-3 text-sm leading-7 text-muted-foreground">{step.body}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="bg-ink-deep">
        <div className="mx-auto grid max-w-6xl gap-10 px-6 py-16 md:grid-cols-[1fr_1fr] md:py-24">
          <div>
            <p className="text-xs font-bold uppercase tracking-[.18em] text-mint">Illustrative model · Not a studio finding</p>
            <h2 className="mt-3 font-display text-3xl font-black text-ice">What would one additional booking mean?</h2>
            <p className="mt-5 leading-7 text-muted-foreground">For illustration only, suppose a studio has 25 eligible enquiries per month, improves booking conversion by four percentage points, and earns £350 gross per additional completed booking. None of these figures is a measured INKSIGHTS client result or tattoo-industry benchmark.</p>
            <p className="mt-5 text-sm text-muted-foreground">The actual effect could be zero. A completed booking's value differs from profit; delivery costs and artist capacity matter.</p>
          </div>
          <div className="rounded-3xl border border-border bg-ink p-8">
            <div className="flex items-start gap-3">
              <FileSearch2 className="mt-1 h-6 w-6 text-mint" aria-hidden="true" />
              <div>
                <div className="text-xs font-bold uppercase tracking-[.14em] text-muted-foreground">Explicitly modelled · gross booking value</div>
                <div className="mt-3 font-display text-5xl font-black text-ice">£350<span className="ml-2 text-base text-muted-foreground">per month</span></div>
              </div>
            </div>
            <div className="my-7 h-px bg-border" />
            <p className="text-sm font-semibold text-ice">25 enquiries × 0.04 conversion-point improvement × £350</p>
            <div className="mt-6 flex gap-3 text-sm leading-6 text-muted-foreground"><ShieldCheck className="h-5 w-5 shrink-0 text-mint" aria-hidden="true" />No customer-level evidence, private business data or genuine revenue loss is implied by this scenario.</div>
          </div>
        </div>
      </section>

      <section className="border-t border-border bg-ink">
        <div className="mx-auto max-w-6xl px-6 py-16 md:py-20">
          <div className="flex items-start gap-3"><CheckCircle2 className="mt-1 h-6 w-6 shrink-0 text-mint" aria-hidden="true" /><h2 className="font-display text-2xl font-black text-ice">The £395 Audit answers the next question: is the opportunity material?</h2></div>
          <p className="mt-5 max-w-3xl leading-7 text-muted-foreground">The Studio Intelligence Audit examines market visibility, competitors and your customer journey, identifies three priorities and sets out a 90-day action plan. Implementation is separately scoped. If the evidence does not support a change, the appropriate recommendation can be to measure rather than spend.</p>
          <div className="mt-7 flex flex-wrap gap-4"><PrimaryButton href="/offers/studio-intelligence-audit">Review the full audit scope</PrimaryButton><a href="/research-methodology" className="inline-flex items-center text-sm font-bold text-mint underline underline-offset-4">Read the evidence methodology</a></div>
        </div>
      </section>
    </PublicShell>
  );
}
