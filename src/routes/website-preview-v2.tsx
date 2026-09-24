import { createFileRoute } from "@tanstack/react-router";
import {
  BarChart3,
  CheckCircle2,
  Database,
  FileChartColumnIncreasing,
  Search,
  ShieldCheck,
  Target,
  UsersRound,
  Workflow,
} from "lucide-react";
import {
  Card,
  CtaSection,
  PageHero,
  PrimaryButton,
  PublicShell,
  RevenueLeakageMap,
  SecondaryButton,
  SectionHeading,
} from "@/components/public-site";

export const Route = createFileRoute("/website-preview-v2")({
  component: WebsitePreviewV2,
  head: () => ({
    meta: [
      { title: "INKSIGHTS Website Content & Layout Preview" },
      {
        name: "description",
        content:
          "Preview of content, hierarchy and commercial improvements using the existing INKSIGHTS visual system unchanged.",
      },
      { name: "robots", content: "noindex,nofollow" },
    ],
  }),
});

const deliverables = [
  {
    number: "01",
    title: "Executive Summary",
    text: "The primary commercial constraint, the evidence supporting it and the next decision the studio should make.",
  },
  {
    number: "02",
    title: "Studio Snapshot",
    text: "A concise view of visibility, enquiry conversion, capacity, booking conditions and retention signals.",
  },
  {
    number: "03",
    title: "Market & Competitor Review",
    text: "Local positioning, search visibility, competitor evidence and identifiable gaps in the studio's public journey.",
  },
  {
    number: "04",
    title: "Top Three Opportunities",
    text: "Commercial opportunities ordered by evidence, dependency, effort and usefulness — not a generic list of tactics.",
  },
  {
    number: "05",
    title: "Prioritised Recommendations",
    text: "Specific actions linked to the diagnosed constraint, with unknowns and assumptions kept visible.",
  },
  {
    number: "06",
    title: "90-Day Action Plan",
    text: "A practical sequence of actions, owners, checkpoints and one measurable starting intervention.",
  },
];

const proofTypes = [
  {
    icon: Database,
    eyebrow: "System proof",
    title: "Show what is already built and working.",
    text: "Diagnostics, scoring, evidence handling, studio records, lead qualification and controlled routing can be demonstrated without presenting them as client results.",
  },
  {
    icon: BarChart3,
    eyebrow: "Demonstration proof",
    title: "Show the method with labelled sample data.",
    text: "Simulated examples can demonstrate how INKSIGHTS interprets signals, identifies a constraint and turns that diagnosis into a recommendation.",
  },
  {
    icon: ShieldCheck,
    eyebrow: "Client proof",
    title: "Publish outcomes only when they are verifiable.",
    text: "Real case studies should include baseline, intervention, measurement window, external factors, result and limitations.",
  },
];

const journey = [
  {
    number: "01",
    label: "Diagnose",
    title: "Understand what is actually wrong.",
    text: "The free Revenue Audit or paid Studio Intelligence Audit establishes the first meaningful commercial constraint.",
  },
  {
    number: "02",
    label: "Fix",
    title: "Correct one defined weakness.",
    text: "Use a small intervention when the problem is visible, specific and does not require a wider system rebuild.",
  },
  {
    number: "03",
    label: "Implement",
    title: "Build the system required to hold the gain.",
    text: "Where the constraint is operational, standardise the booking, retention or client-management workflow.",
  },
  {
    number: "04",
    label: "Monitor",
    title: "Measure whether the change holds.",
    text: "Monitor the relevant signals and only expand when the evidence justifies a larger intervention.",
  },
];

function WebsitePreviewV2() {
  return (
    <PublicShell>
      <PageHero
        eyebrow="Website refinement preview"
        title={
          <>
            Same INKSIGHTS visual system. <span className="text-mint">Stronger commercial clarity.</span>
          </>
        }
        description={
          <>
            This preview does not introduce a new visual direction. It keeps the existing animations, radar language,
            colour system, typography, glow, interaction patterns and UI effects, while improving content hierarchy,
            page composition and the way the offer is explained.
          </>
        }
      >
        <PrimaryButton href="#audit-preview">See the Audit section</PrimaryButton>
        <SecondaryButton href="#proof-preview">See the Proof section</SecondaryButton>
      </PageHero>

      <section className="border-b border-border bg-ink">
        <div className="mx-auto max-w-7xl px-6 py-12">
          <div className="grid gap-5 md:grid-cols-3">
            <Card>
              <Target className="h-6 w-6 text-mint" />
              <h2 className="mt-5 font-display text-xl font-black text-ice">Keep the current identity</h2>
              <p className="mt-3 text-sm leading-relaxed text-muted-foreground">
                No replacement colour system, no new animation language and no redesign of the current radar or signal
                effects.
              </p>
            </Card>
            <Card>
              <Workflow className="h-6 w-6 text-mint" />
              <h2 className="mt-5 font-display text-xl font-black text-ice">Improve page structure</h2>
              <p className="mt-3 text-sm leading-relaxed text-muted-foreground">
                Reorder information so visitors understand what INKSIGHTS does, what they receive and what action to take
                next.
              </p>
            </Card>
            <Card>
              <Search className="h-6 w-6 text-mint" />
              <h2 className="mt-5 font-display text-xl font-black text-ice">Add useful content</h2>
              <p className="mt-3 text-sm leading-relaxed text-muted-foreground">
                Expand proof, product previews, methodology and commercial explanation using the site's existing visual
                components.
              </p>
            </Card>
          </div>
        </div>
      </section>

      <section id="audit-preview">
        <div className="mx-auto max-w-7xl px-6 py-20 md:py-28">
          <SectionHeading
            eyebrow="Studio Intelligence Audit"
            title="Make the £395 deliverable easier to understand before checkout."
            description="The current service description is accurate. The improvement is to show the shape of the output more clearly using the existing INKSIGHTS design system."
          />

          <div className="mt-12 grid gap-8 lg:grid-cols-[0.78fr_1.22fr]">
            <div>
              <Card className="lg:sticky lg:top-28">
                <FileChartColumnIncreasing className="h-7 w-7 text-mint" />
                <p className="mt-6 text-xs font-bold uppercase tracking-[0.16em] text-mint">Paid commercial diagnosis</p>
                <h2 className="mt-3 font-display text-3xl font-black text-ice">INKSIGHTS Studio Intelligence Audit</h2>
                <div className="mt-6 flex items-end justify-between gap-4 border-t border-border pt-6">
                  <div>
                    <div className="font-display text-5xl font-black text-ice">£395</div>
                    <div className="mt-1 text-sm text-muted-foreground">one-off</div>
                  </div>
                  <span className="rounded-full border border-mint/30 bg-mint/10 px-4 py-2 text-xs font-bold text-mint">
                    ACTIVE OFFER
                  </span>
                </div>
                <p className="mt-6 text-sm leading-relaxed text-muted-foreground">
                  A structured commercial audit for established UK tattoo studios combining visibility, competitor,
                  customer-journey and commercial analysis with prioritised recommendations and a 90-day plan.
                </p>
                <div className="mt-7 space-y-3">
                  {[
                    "Top three commercial opportunities",
                    "Prioritised recommendations",
                    "90-day action plan",
                    "45–60 minute findings session",
                    "Baseline for one measurable intervention",
                  ].map((item) => (
                    <div key={item} className="flex gap-3 text-sm text-muted-foreground">
                      <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-mint" />
                      <span>{item}</span>
                    </div>
                  ))}
                </div>
                <div className="mt-8">
                  <PrimaryButton href="/offers/studio-intelligence-audit">View current Audit page</PrimaryButton>
                </div>
              </Card>
            </div>

            <div>
              <p className="text-xs font-bold uppercase tracking-[0.18em] text-mint">What the client receives</p>
              <h3 className="mt-4 max-w-3xl font-display text-3xl font-black text-ice md:text-4xl">
                Turn an intangible service into a visible deliverable.
              </h3>
              <p className="mt-4 max-w-3xl leading-relaxed text-muted-foreground">
                These are representative sections, not claims about a specific client. The purpose is to make the paid
                Audit easier to evaluate before purchase.
              </p>

              <div className="mt-8 grid gap-5 md:grid-cols-2">
                {deliverables.map((item) => (
                  <Card key={item.number}>
                    <div className="font-mono text-xs text-mint">{item.number}</div>
                    <h4 className="mt-4 font-display text-xl font-black text-ice">{item.title}</h4>
                    <p className="mt-3 text-sm leading-relaxed text-muted-foreground">{item.text}</p>
                  </Card>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      <section id="proof-preview" className="border-y border-border bg-ink">
        <div className="mx-auto max-w-7xl px-6 py-20 md:py-28">
          <SectionHeading
            eyebrow="Proof library"
            title="Separate what is working, what is demonstrated and what is verified."
            description="This improves credibility without changing the current visual design or overstating the maturity of the business."
          />

          <div className="mt-10 grid gap-5 lg:grid-cols-3">
            {proofTypes.map(({ icon: Icon, eyebrow, title, text }) => (
              <Card key={eyebrow} className="h-full bg-ink-deep">
                <Icon className="h-7 w-7 text-mint" />
                <p className="mt-6 text-xs font-bold uppercase tracking-[0.16em] text-mint">{eyebrow}</p>
                <h3 className="mt-3 font-display text-2xl font-black text-ice">{title}</h3>
                <p className="mt-4 text-sm leading-relaxed text-muted-foreground">{text}</p>
              </Card>
            ))}
          </div>

          <div className="mt-8 rounded-2xl border border-amber-300/35 bg-amber-300/10 p-5 text-sm leading-relaxed text-amber-100">
            <strong className="text-amber-200">Evidence rule:</strong> simulated numbers remain labelled as demonstration
            data. Genuine client outcomes are only presented once a baseline, intervention and measurement window can be
            evidenced.
          </div>
        </div>
      </section>

      <section>
        <div className="mx-auto max-w-7xl px-6 py-20 md:py-28">
          <SectionHeading
            eyebrow="Commercial journey"
            title="Keep the service architecture simple enough to understand."
            description="The current Diagnose → Fix → Implement → Monitor structure can be reinforced across the site without changing the visual system."
          />

          <div className="mt-10 grid gap-5 md:grid-cols-2 xl:grid-cols-4">
            {journey.map((item) => (
              <Card key={item.number} className="h-full">
                <div className="font-display text-4xl font-black text-mint/35">{item.number}</div>
                <p className="mt-5 text-xs font-bold uppercase tracking-[0.16em] text-mint">{item.label}</p>
                <h3 className="mt-3 font-display text-xl font-black text-ice">{item.title}</h3>
                <p className="mt-3 text-sm leading-relaxed text-muted-foreground">{item.text}</p>
              </Card>
            ))}
          </div>
        </div>
      </section>

      <section className="border-y border-border bg-ink">
        <div className="mx-auto max-w-7xl px-6 py-20 md:py-24">
          <div className="grid gap-10 lg:grid-cols-[0.9fr_1.1fr] lg:items-start">
            <div>
              <SectionHeading
                eyebrow="Revenue Audit"
                title="Improve the explanation before changing the form."
                description="The existing Revenue Audit should remain functionally unchanged until we have step-level abandonment data. The immediate improvement is to explain the value of each stage more clearly."
              />
              <div className="mt-8 space-y-4">
                {[
                  ["01", "Studio", "Establish studio structure and operating context."],
                  ["02", "Economics", "Understand capacity, transaction value and commercial conditions."],
                  ["03", "Leakage", "Identify where demand, time or value is most likely being lost."],
                  ["04", "Result", "Return a first-pass estimate and route the studio to the smallest useful next step."],
                ].map(([number, label, text]) => (
                  <div key={number} className="flex gap-4 rounded-2xl border border-border bg-ink-deep p-5">
                    <div className="font-mono text-xs text-mint">{number}</div>
                    <div>
                      <div className="font-display text-lg font-black text-ice">{label}</div>
                      <p className="mt-1 text-sm leading-relaxed text-muted-foreground">{text}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div>
              <RevenueLeakageMap />
            </div>
          </div>
        </div>
      </section>

      <CtaSection
        eyebrow="Preview conclusion"
        title="Improve clarity and proof before changing the visual identity."
        description="The current animations, radar, signal language, UI effects, typography and colour system stay intact. The next gains come from stronger content, better page hierarchy and clearer commercial explanation."
      />
    </PublicShell>
  );
}
