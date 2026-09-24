import { createFileRoute } from "@tanstack/react-router";
import {
  ArrowRight,
  BarChart3,
  CheckCircle2,
  CircleDot,
  FileChartColumnIncreasing,
  Gauge,
  Radar,
  Search,
  ShieldCheck,
  Sparkles,
  Target,
  UsersRound,
} from "lucide-react";
import {
  Logo,
  PrimaryButton,
  PublicShell,
  RevenueLeakageMap,
  SecondaryButton,
} from "@/components/public-site";
import { Reveal } from "@/components/interactive-home";

export const Route = createFileRoute("/website-preview")({
  component: WebsiteUpgradePreview,
  head: () => ({
    meta: [
      { title: "INKSIGHTS Website Upgrade Preview" },
      { name: "description", content: "Private preview of the next-stage INKSIGHTS website system." },
      { name: "robots", content: "noindex,nofollow" },
    ],
  }),
});

const proofTypes = [
  {
    id: "01",
    label: "SYSTEM PROOF",
    icon: ShieldCheck,
    title: "Show the infrastructure that already exists.",
    description:
      "Demonstrate the operating system, diagnostics, evidence model and controlled workflows behind INKSIGHTS without pretending they are client outcomes.",
    examples: [
      "Revenue Audit → qualification → routing",
      "Studio discovery and evidence pipeline",
      "Pricing Benchmark and scoring models",
      "Version-controlled implementation and QA",
    ],
  },
  {
    id: "02",
    label: "DEMONSTRATION PROOF",
    icon: Radar,
    title: "Make the method visible with labelled simulations.",
    description:
      "Use realistic studio scenarios to show how INKSIGHTS moves from observation to diagnosis to commercial action.",
    examples: [
      "Simulated studio baseline",
      "Constraint diagnosis",
      "Opportunity ranking",
      "90-day measurement plan",
    ],
  },
  {
    id: "03",
    label: "CLIENT PROOF",
    icon: UsersRound,
    title: "Publish verified outcomes only when they exist.",
    description:
      "Client evidence follows a strict baseline → intervention → measurement → outcome structure with limitations left visible.",
    examples: [
      "Starting baseline",
      "Exact intervention",
      "Measurement window",
      "Outcome + limitations",
    ],
  },
] as const;

const serviceStages = [
  {
    number: "01",
    label: "DIAGNOSE",
    title: "Find the commercial constraint.",
    copy: "Use structured diagnosis before choosing a larger intervention.",
    items: ["Free Revenue Audit", "£395 Studio Intelligence Audit"],
  },
  {
    number: "02",
    label: "FIX",
    title: "Correct one defined weakness.",
    copy: "Use a small intervention when the evidence points to one visible problem.",
    items: ["72-Hour Visibility Fix"],
  },
  {
    number: "03",
    label: "IMPLEMENT",
    title: "Build the system required to hold the gain.",
    copy: "Standardise the workflow when the problem is operational rather than cosmetic.",
    items: ["Booking & Retention Engine", "Founding Studio Pilot"],
  },
  {
    number: "04",
    label: "MONITOR",
    title: "Watch for deterioration and new constraints.",
    copy: "Monitor only after a useful baseline exists.",
    items: ["Visibility Watch"],
  },
] as const;

const reportPages = [
  { code: "01", label: "EXECUTIVE SUMMARY", title: "One commercial priority, not ten disconnected recommendations." },
  { code: "02", label: "STUDIO SNAPSHOT", title: "A compact view of visibility, conversion, capacity and retention." },
  { code: "03", label: "CONSTRAINT DIAGNOSIS", title: "Where demand, time or value is being lost first." },
  { code: "04", label: "MARKET POSITION", title: "Competitor and local-market evidence in context." },
  { code: "05", label: "TOP 3 OPPORTUNITIES", title: "Prioritised by evidence, dependency and commercial usefulness." },
  { code: "06", label: "90-DAY PLAN", title: "A measurable implementation sequence with owners and checkpoints." },
] as const;

function WebsiteUpgradePreview() {
  return (
    <PublicShell>
      <section className="brand-dark cinematic-hero hero-ambient relative overflow-hidden grid-bg">
        <div className="ambient-orb ambient-orb-one" aria-hidden="true" />
        <div className="ambient-orb ambient-orb-two" aria-hidden="true" />
        <div className="pointer-events-none absolute inset-0 bg-gradient-to-b from-transparent via-ink-deep/25 to-ink-deep" />
        <div className="relative mx-auto max-w-7xl px-6 pb-20 pt-14 md:pb-28 md:pt-20">
          <div className="mb-10 flex flex-wrap items-center justify-between gap-4 border-b border-border/70 pb-5">
            <div className="flex items-center gap-3">
              <Logo variant="icon" decorative className="h-10 w-10" />
              <div>
                <p className="text-xs font-bold uppercase tracking-[0.18em] text-mint">PRIVATE PREVIEW</p>
                <p className="text-sm text-muted-foreground">Website refinement concept · no production systems changed</p>
              </div>
            </div>
            <a href="/" className="text-sm font-semibold text-muted-foreground transition hover:text-mint">Back to current site</a>
          </div>

          <div className="grid gap-14 lg:grid-cols-[1.03fr_.97fr] lg:items-center">
            <Reveal>
              <div>
                <div className="inline-flex items-center gap-2 rounded-full border border-mint/30 bg-mint/5 px-4 py-2 text-xs font-bold uppercase tracking-[0.18em] text-mint backdrop-blur-xl">
                  <Sparkles className="h-4 w-4" />
                  NEXT-STAGE WEBSITE SYSTEM
                </div>
                <h1 className="mt-7 max-w-5xl text-balance font-display text-4xl font-bold leading-[1.03] tracking-tight text-ice sm:text-5xl md:text-6xl xl:text-7xl">
                  Keep the identity. <span className="text-mint">Make the product tangible.</span>
                </h1>
                <p className="mt-7 max-w-2xl text-lg leading-relaxed text-muted-foreground md:text-xl">
                  This preview shows how INKSIGHTS can move from a strong branded website to a measurable acquisition,
                  diagnosis and proof system — without redesigning the homepage again.
                </p>
                <div className="mt-9 flex flex-wrap gap-3">
                  <PrimaryButton href="#audit-preview">See the £395 Audit product</PrimaryButton>
                  <SecondaryButton href="#proof-preview">See the proof system</SecondaryButton>
                </div>
              </div>
            </Reveal>

            <Reveal delay={120}>
              <div className="relative overflow-hidden rounded-[2rem] border border-mint/30 bg-ink-deep p-5 shadow-2xl shadow-black/30 md:p-7">
                <div className="absolute inset-0 grid-bg opacity-35" aria-hidden="true" />
                <div className="relative">
                  <div className="flex items-center justify-between border-b border-border pb-4">
                    <div>
                      <p className="font-mono text-[11px] uppercase tracking-[0.18em] text-mint">STUDIO SIGNAL / DEMO</p>
                      <h2 className="mt-2 font-display text-2xl font-black text-ice">Commercial pressure map</h2>
                    </div>
                    <div className="flex items-center gap-2 text-xs font-bold text-mint">
                      <span className="live-dot" />
                      LIVE MODEL
                    </div>
                  </div>

                  <div className="mt-6 grid gap-3 sm:grid-cols-2">
                    {[
                      ["VISIBILITY", "78", "+4"],
                      ["CONVERSION", "41%", "PRIMARY LEAK"],
                      ["CAPACITY", "76%", "STABLE"],
                      ["RETENTION", "52%", "WATCH"],
                    ].map(([label, value, state]) => (
                      <div key={label} className="signal-metric">
                        <p className="text-[11px] font-bold uppercase tracking-[0.16em] text-muted-foreground">{label}</p>
                        <div className="mt-3 flex items-end justify-between gap-3">
                          <span className="font-display text-3xl font-black text-ice">{value}</span>
                          <span className="rounded-full border border-mint/20 bg-mint/10 px-2 py-1 text-[10px] font-bold text-mint">{state}</span>
                        </div>
                      </div>
                    ))}
                  </div>

                  <div className="mt-5 rounded-2xl border border-mint/25 bg-mint/5 p-5">
                    <p className="text-xs font-bold uppercase tracking-[.16em] text-mint">PRIORITY SIGNAL</p>
                    <p className="mt-2 font-display text-xl font-black text-ice">Demand exists. Booking conversion is losing it.</p>
                    <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
                      Demonstration data only. The point is to show the buyer the type of conclusion INKSIGHTS produces.
                    </p>
                  </div>
                </div>
              </div>
            </Reveal>
          </div>
        </div>
      </section>

      <section className="border-y border-border bg-ink">
        <div className="mx-auto max-w-7xl px-6 py-10">
          <div className="grid gap-6 text-center sm:grid-cols-2 lg:grid-cols-4">
            {[
              ["01", "PROOF", "Show evidence, not claims."],
              ["02", "PRODUCT", "Make the £395 Audit visible."],
              ["03", "FUNNEL", "Measure each conversion stage."],
              ["04", "SYSTEM", "Reuse one website design language."],
            ].map(([n, label, copy]) => (
              <div key={n} className="border-border lg:border-r lg:last:border-r-0">
                <div className="font-mono text-xs text-mint">{n}</div>
                <div className="mt-2 font-display text-lg font-black text-ice">{label}</div>
                <div className="mt-1 text-xs text-muted-foreground">{copy}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section id="audit-preview" className="brand-dark bg-ink-deep">
        <div className="mx-auto max-w-7xl px-6 py-20 md:py-28">
          <Reveal>
            <div className="max-w-4xl">
              <p className="text-xs font-bold uppercase tracking-[0.18em] text-mint">01 / MAKE THE PAID PRODUCT VISIBLE</p>
              <h2 className="mt-4 text-balance font-display text-4xl font-black text-ice md:text-6xl">
                Sell the £395 Audit like a product, not a paragraph.
              </h2>
              <p className="mt-5 max-w-3xl text-lg leading-relaxed text-muted-foreground">
                A buyer should be able to understand the shape, quality and decision value of the deliverable before checkout.
              </p>
            </div>
          </Reveal>

          <div className="mt-12 grid gap-6 lg:grid-cols-[.75fr_1.25fr]">
            <Reveal>
              <div className="rounded-3xl border border-border bg-ink p-7 lg:sticky lg:top-28">
                <div className="flex items-center gap-3">
                  <FileChartColumnIncreasing className="h-7 w-7 text-mint" />
                  <div>
                    <p className="text-xs font-bold uppercase tracking-[.16em] text-mint">STUDIO INTELLIGENCE AUDIT</p>
                    <p className="mt-1 text-sm text-muted-foreground">Representative deliverable preview</p>
                  </div>
                </div>
                <div className="mt-7 border-t border-border pt-6">
                  <div className="flex items-end justify-between gap-3">
                    <span className="font-display text-5xl font-black text-ice">£395</span>
                    <span className="rounded-full border border-mint/25 bg-mint/10 px-3 py-2 text-xs font-bold text-mint">ONE-OFF</span>
                  </div>
                  <p className="mt-5 text-sm leading-relaxed text-muted-foreground">
                    Commercial diagnosis, top opportunities, prioritised recommendations, 90-day action plan and findings session.
                  </p>
                </div>
                <div className="mt-7 space-y-3 text-sm text-muted-foreground">
                  {["Clear scope", "Demonstration preview before purchase", "Evidence / estimate / unknown labels", "One measurable starting intervention"].map((item) => (
                    <div key={item} className="flex gap-3">
                      <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-mint" />
                      <span>{item}</span>
                    </div>
                  ))}
                </div>
                <div className="mt-8">
                  <PrimaryButton href="/offers/studio-intelligence-audit">Current purchase page</PrimaryButton>
                </div>
              </div>
            </Reveal>

            <div className="grid gap-5 sm:grid-cols-2">
              {reportPages.map((page, index) => (
                <Reveal key={page.code} delay={index * 50}>
                  <div className="group relative min-h-[290px] overflow-hidden rounded-3xl border border-border bg-ink p-6 transition hover:border-mint/60">
                    <div className="absolute inset-0 grid-bg opacity-[0.12]" aria-hidden="true" />
                    <div className="relative flex h-full flex-col">
                      <div className="flex items-center justify-between gap-4">
                        <span className="font-mono text-xs text-mint">{page.code}</span>
                        <span className="rounded-full border border-border px-3 py-1 text-[10px] font-bold uppercase tracking-[.14em] text-muted-foreground">DEMO</span>
                      </div>
                      <div className="mt-8">
                        <p className="text-[11px] font-bold uppercase tracking-[.18em] text-mint">{page.label}</p>
                        <h3 className="mt-3 font-display text-2xl font-black leading-tight text-ice">{page.title}</h3>
                      </div>
                      <div className="mt-auto pt-8">
                        {index === 0 ? (
                          <div className="space-y-2">
                            <div className="h-2 w-4/5 rounded-full bg-mint/25" />
                            <div className="h-2 w-3/5 rounded-full bg-border" />
                            <div className="h-2 w-2/3 rounded-full bg-border" />
                          </div>
                        ) : index === 1 ? (
                          <div className="grid grid-cols-4 gap-2">
                            {[72, 41, 76, 52].map((n) => <div key={n} className="rounded-xl border border-border bg-ink-deep p-2 text-center font-display text-lg font-black text-ice">{n}</div>)}
                          </div>
                        ) : index === 2 ? (
                          <div className="flex items-end gap-2">
                            {[34, 56, 82, 48, 66].map((n, i) => <div key={i} className="flex-1 rounded-t bg-mint/70" style={{ height: `${n}px` }} />)}
                          </div>
                        ) : index === 3 ? (
                          <div className="grid grid-cols-2 gap-2">
                            <div className="rounded-xl border border-mint/30 bg-mint/5 p-3 text-xs text-mint">LOCAL POSITION</div>
                            <div className="rounded-xl border border-border bg-ink-deep p-3 text-xs text-muted-foreground">COMPETITOR GAP</div>
                          </div>
                        ) : index === 4 ? (
                          <div className="space-y-2">
                            {["01", "02", "03"].map((n) => <div key={n} className="flex items-center gap-3 rounded-xl border border-border bg-ink-deep p-2"><span className="font-mono text-xs text-mint">{n}</span><div className="h-2 flex-1 rounded bg-border" /></div>)}
                          </div>
                        ) : (
                          <div className="flex items-center gap-2">
                            {["30D", "60D", "90D"].map((n) => <div key={n} className="flex-1 rounded-xl border border-border bg-ink-deep p-3 text-center text-xs font-bold text-muted-foreground">{n}</div>)}
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                </Reveal>
              ))}
            </div>
          </div>
        </div>
      </section>

      <section id="proof-preview" className="brand-light border-y border-border bg-ink">
        <div className="mx-auto max-w-7xl px-6 py-20 md:py-28">
          <Reveal>
            <div className="max-w-4xl">
              <p className="text-xs font-bold uppercase tracking-[0.18em] text-mint">02 / PROOF ARCHITECTURE</p>
              <h2 className="mt-4 text-balance font-display text-4xl font-black text-ice md:text-6xl">
                Make credibility explicit without overstating maturity.
              </h2>
              <p className="mt-5 max-w-3xl text-lg leading-relaxed text-muted-foreground">
                Three proof classes let INKSIGHTS show serious evidence now while reserving client-result claims for verified outcomes.
              </p>
            </div>
          </Reveal>

          <div className="mt-12 grid gap-5 lg:grid-cols-3">
            {proofTypes.map(({ id, label, icon: Icon, title, description, examples }, index) => (
              <Reveal key={id} delay={index * 70}>
                <div className="interactive-card h-full rounded-3xl border border-border bg-ink-deep p-7">
                  <div className="flex items-center justify-between">
                    <Icon className="h-7 w-7 text-mint" />
                    <span className="font-mono text-xs text-mint">{id}</span>
                  </div>
                  <p className="mt-8 text-xs font-bold uppercase tracking-[.18em] text-mint">{label}</p>
                  <h3 className="mt-3 font-display text-2xl font-black text-ice">{title}</h3>
                  <p className="mt-4 text-sm leading-relaxed text-muted-foreground">{description}</p>
                  <div className="mt-7 space-y-2 border-t border-border pt-5">
                    {examples.map((item) => (
                      <div key={item} className="flex gap-2 text-xs leading-relaxed text-muted-foreground">
                        <CircleDot className="mt-0.5 h-3.5 w-3.5 shrink-0 text-mint" />
                        {item}
                      </div>
                    ))}
                  </div>
                </div>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      <section className="brand-dark bg-ink-deep">
        <div className="mx-auto max-w-7xl px-6 py-20 md:py-28">
          <Reveal>
            <p className="text-xs font-bold uppercase tracking-[0.18em] text-mint">03 / COMMERCIAL ROUTING</p>
            <h2 className="mt-4 max-w-4xl text-balance font-display text-4xl font-black text-ice md:text-6xl">
              One commercial sequence. Fewer competing choices.
            </h2>
          </Reveal>

          <div className="mt-12 grid gap-4 lg:grid-cols-4">
            {serviceStages.map((stage, index) => (
              <Reveal key={stage.number} delay={index * 60}>
                <div className="relative h-full rounded-3xl border border-border bg-ink p-6">
                  {index < serviceStages.length - 1 ? <div className="absolute -right-2 top-10 z-10 hidden h-px w-4 bg-mint/60 lg:block" aria-hidden="true" /> : null}
                  <div className="font-mono text-xs text-mint">{stage.number}</div>
                  <p className="mt-4 text-xs font-bold uppercase tracking-[.18em] text-mint">{stage.label}</p>
                  <h3 className="mt-3 font-display text-2xl font-black text-ice">{stage.title}</h3>
                  <p className="mt-3 text-sm leading-relaxed text-muted-foreground">{stage.copy}</p>
                  <div className="mt-7 space-y-2 border-t border-border pt-5">
                    {stage.items.map((item) => (
                      <div key={item} className="text-xs font-semibold text-ice">{item}</div>
                    ))}
                  </div>
                </div>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      <section className="brand-dark border-y border-border bg-ink">
        <div className="mx-auto max-w-7xl px-6 py-20 md:py-28">
          <Reveal>
            <div className="max-w-4xl">
              <p className="text-xs font-bold uppercase tracking-[0.18em] text-mint">04 / PRODUCT-LIKE FREE AUDIT</p>
              <h2 className="mt-4 text-balance font-display text-4xl font-black text-ice md:text-6xl">
                Give the user a signal before asking for everything.
              </h2>
              <p className="mt-5 max-w-3xl text-lg leading-relaxed text-muted-foreground">
                This is a front-end concept only. The production Revenue Audit should not change until step-level completion data proves where friction exists.
              </p>
            </div>
          </Reveal>

          <div className="mt-12 grid gap-6 lg:grid-cols-[1fr_.86fr]">
            <div className="rounded-3xl border border-border bg-ink-deep p-6 md:p-8">
              <div className="flex items-center justify-between gap-4 border-b border-border pb-5">
                <div>
                  <p className="text-xs font-bold uppercase tracking-[.16em] text-mint">FREE REVENUE AUDIT / PREVIEW</p>
                  <h3 className="mt-2 font-display text-2xl font-black text-ice">Progressive diagnostic flow</h3>
                </div>
                <span className="rounded-full border border-mint/25 bg-mint/10 px-3 py-2 text-xs font-bold text-mint">02 / 04</span>
              </div>
              <div className="mt-6 grid gap-3 sm:grid-cols-4">
                {[
                  ["01", "Studio", true],
                  ["02", "Economics", true],
                  ["03", "Leakage", false],
                  ["04", "Result", false],
                ].map(([n, label, active]) => (
                  <div key={String(n)} className={`rounded-2xl border p-4 ${active ? "border-mint/40 bg-mint/5" : "border-border bg-ink"}`}>
                    <div className="font-mono text-xs text-mint">{n}</div>
                    <div className="mt-2 text-sm font-bold text-ice">{label}</div>
                  </div>
                ))}
              </div>
              <div className="mt-6 grid gap-4 sm:grid-cols-2">
                <div className="rounded-2xl border border-border bg-ink p-5">
                  <label className="text-xs font-bold uppercase tracking-[.14em] text-muted-foreground">Artists</label>
                  <div className="mt-3 rounded-xl border border-border bg-ink-deep px-4 py-3 font-display text-xl font-black text-ice">5</div>
                </div>
                <div className="rounded-2xl border border-border bg-ink p-5">
                  <label className="text-xs font-bold uppercase tracking-[.14em] text-muted-foreground">Average occupied days / week</label>
                  <div className="mt-3 rounded-xl border border-border bg-ink-deep px-4 py-3 font-display text-xl font-black text-ice">3.2</div>
                </div>
              </div>
              <div className="mt-6 rounded-2xl border border-mint/30 bg-mint/5 p-5">
                <p className="text-xs font-bold uppercase tracking-[.16em] text-mint">INTERIM SIGNAL</p>
                <p className="mt-2 font-display text-2xl font-black text-ice">Capacity pressure may not be the first constraint.</p>
                <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
                  The next questions should test booking conversion and cancellation leakage before recommending more demand.
                </p>
              </div>
            </div>

            <div className="rounded-3xl border border-mint/25 bg-ink-deep p-6 md:p-8">
              <p className="text-xs font-bold uppercase tracking-[.16em] text-mint">WHY THIS MATTERS</p>
              <h3 className="mt-3 font-display text-3xl font-black text-ice">Value arrives before the lead form feels expensive.</h3>
              <div className="mt-7 space-y-5">
                {[
                  [Gauge, "Progressive value", "Every stage produces a useful interpretation rather than waiting until the end."],
                  [Target, "Better qualification", "The diagnostic can collect the context needed to route the user to the smallest relevant intervention."],
                  [BarChart3, "Measurable funnel", "Track starts, step completion, abandonment, result views and commercial handoff."],
                ].map(([Icon, title, copy]) => (
                  <div key={String(title)} className="flex gap-4">
                    <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border border-mint/25 bg-mint/10 text-mint">
                      <Icon className="h-5 w-5" />
                    </div>
                    <div>
                      <h4 className="font-display text-lg font-black text-ice">{title}</h4>
                      <p className="mt-1 text-sm leading-relaxed text-muted-foreground">{copy}</p>
                    </div>
                  </div>
                ))}
              </div>
              <div className="mt-8 border-t border-border pt-6">
                <p className="text-xs leading-relaxed text-muted-foreground">
                  <strong className="text-ice">Important:</strong> no backend or submission logic is changed in this preview.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="brand-dark bg-ink-deep">
        <div className="mx-auto max-w-7xl px-6 py-16 md:py-24">
          <RevenueLeakageMap />
        </div>
      </section>

      <section className="brand-dark relative overflow-hidden border-t border-border bg-ink">
        <div className="ambient-orb ambient-orb-one" aria-hidden="true" />
        <div className="relative mx-auto max-w-5xl px-6 py-20 text-center md:py-28">
          <Search className="mx-auto h-8 w-8 text-mint" />
          <p className="mt-6 text-xs font-bold uppercase tracking-[.18em] text-mint">PREVIEW CONCLUSION</p>
          <h2 className="mt-4 text-balance font-display text-4xl font-black text-ice md:text-6xl">
            The next upgrade is not more decoration.
          </h2>
          <p className="mx-auto mt-5 max-w-3xl text-lg leading-relaxed text-muted-foreground">
            It is making INKSIGHTS easier to trust, easier to understand, easier to buy and easier to measure — while keeping the visual identity already established on the live site.
          </p>
          <div className="mt-8 flex flex-wrap justify-center gap-3">
            <PrimaryButton href="/offers/studio-intelligence-audit">View current £395 Audit</PrimaryButton>
            <SecondaryButton href="/">Compare with current homepage</SecondaryButton>
          </div>
        </div>
      </section>
    </PublicShell>
  );
}
