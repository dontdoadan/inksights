import { Reveal } from "@/components/interactive-home";
import { Card, PrimaryButton, SecondaryButton, SectionHeading } from "@/components/public-site";

export function BusinessProgress() {
  return (
    <section id="current-progress" className="scroll-mt-24 border-y border-border bg-ink">
      <div className="mx-auto max-w-7xl px-6 py-20 md:py-24">
        <Reveal>
          <SectionHeading
            eyebrow="Current state · September 2026"
            title="Useful now. Building towards a complete loop."
            description="INKSIGHTS is early-stage Tattoo Studio Intelligence. Public tools provide a starting point; the deeper diagnostic system is being built and validated."
          />
        </Reveal>
        <div className="mt-10 grid gap-5 lg:grid-cols-3">
          {[
            {
              label: "Live now",
              title: "Start with your studio",
              text: "The free Studio Growth Check offers a first-pass estimate from your operating numbers, currently for studios with 3+ artists. The Pricing Benchmark and growth model provide reference-based illustrations, not verified business outcomes.",
            },
            {
              label: "In active build",
              title: "The diagnostic engine",
              text: "Current work centres on the canonical data model, KPI dictionary, evidence-led diagnosis, opportunity scoring and growth playbooks, with recommendation, action and result tracking.",
            },
            {
              label: "Planned / roadmap",
              title: "Expand after validation",
              text: "The priority is to validate the full loop on one real business before widening integrations or acquisition. Broader provider connections, connected market intelligence and repeatable outcome learning follow that evidence.",
            },
          ].map(({ label, title, text }, index) => (
            <Reveal key={label} delay={index * 70} className="h-full">
              <Card className="h-full bg-ink-deep p-7">
                <p className="text-xs font-bold uppercase tracking-[.16em] text-mint">{label}</p>
                <h3 className="mt-4 font-display text-2xl font-black text-ice">{title}</h3>
                <p className="mt-4 text-sm leading-relaxed text-muted-foreground">{text}</p>
              </Card>
            </Reveal>
          ))}
        </div>
        <div className="mt-6 rounded-2xl border border-mint/25 bg-ink-deep p-7 md:p-8">
          <p className="text-xs font-bold uppercase tracking-[.16em] text-mint">
            Paid service · agreed scope
          </p>
          <h3 className="mt-3 font-display text-2xl font-black text-ice">Full INKSIGHTS Audit</h3>
          <p className="mt-3 max-w-3xl text-sm leading-relaxed text-muted-foreground">
            A deeper review of available studio evidence, with scope, price and data requirements
            agreed before work begins. It is separate from the free check. Connected automation and
            validated outcomes are not implied by the availability of an audit.
          </p>
          <div className="mt-6 flex flex-wrap gap-3">
            <PrimaryButton href="/studio-growth-check">Free Studio Growth Check</PrimaryButton>
            <SecondaryButton href="/offers/revenue-audit">Explore the paid audit</SecondaryButton>
          </div>
        </div>
      </div>
    </section>
  );
}

const methodology = [
  "Provider Observation",
  "Normalised Data",
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
];

export function IntelligenceMethodology() {
  return (
    <section id="methodology" className="scroll-mt-24 border-b border-border bg-ink-deep">
      <div className="mx-auto max-w-7xl px-6 py-20 md:py-24">
        <Reveal>
          <SectionHeading
            eyebrow="The canonical INKSIGHTS methodology"
            title="Every recommendation needs a traceable path."
            description="This is the method guiding the build and audit work. The complete automated loop remains in validation; a recommendation is not an intervention, and an outcome is not yet attribution."
          />
        </Reveal>
        <ol className="mt-10 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
          {methodology.map((step, index) => (
            <li key={step} className="rounded-xl border border-border bg-ink p-5">
              <span className="font-mono text-xs text-mint">
                {String(index + 1).padStart(2, "0")}
              </span>
              <h3 className="mt-3 font-display text-lg font-bold text-ice">{step}</h3>
            </li>
          ))}
        </ol>
        <p className="mt-6 max-w-4xl text-sm leading-relaxed text-muted-foreground">
          Keep source observations separate from normalised records and metric definitions. Link
          each finding and diagnosis to evidence, score the opportunity, record the recommended
          action and intervention, then measure the outcome, assess attribution and carry the
          learning forward. Missing evidence stays unknown.
        </p>
      </div>
    </section>
  );
}
