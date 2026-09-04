import { createFileRoute } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import {
  ArrowRight,
  BarChart3,
  CheckCircle2,
  Repeat2,
  ShieldCheck,
  TrendingUp,
  Users,
  WalletCards,
} from "lucide-react";
import {
  Card,
  JsonLd,
  PageHero,
  PrimaryButton,
  PublicShell,
  SecondaryButton,
  SectionHeading,
} from "@/components/public-site";

const CANONICAL_URL = "https://getinksights.co.uk/growth-model";
const POLICY_VERSION = "2026-07-28";

export const Route = createFileRoute("/growth-model")({
  component: GrowthModel,
  head: () => ({
    meta: [
      { title: "Tattoo Studio Revenue Growth Model | INKSIGHTS" },
      {
        name: "description",
        content:
          "Model tattoo studio revenue using client numbers, average transaction value and purchase frequency, with explicit assumptions and measurement guardrails.",
      },
      { property: "og:title", content: "Tattoo Studio Revenue Growth Model | INKSIGHTS" },
      {
        property: "og:description",
        content:
          "Explore the three core revenue levers for a tattoo studio: clients, transaction value and purchase frequency.",
      },
      { property: "og:url", content: CANONICAL_URL },
    ],
    links: [{ rel: "canonical", href: CANONICAL_URL }],
  }),
});

const levers = [
  {
    icon: Users,
    title: "Increase the number of clients",
    label: "Clients",
    description:
      "Improve visibility, referrals, enquiry conversion, response speed and reactivation so more qualified people become booked clients.",
    examples: ["Local visibility", "Clear booking routes", "Enquiry follow-up", "Referral systems"],
  },
  {
    icon: WalletCards,
    title: "Increase average transaction value",
    label: "Value",
    description:
      "Increase the value created per transaction through appropriate project planning, pricing discipline, packages and premium options.",
    examples: ["Project packages", "Premium options", "Better pricing structure", "Clearer project scope"],
  },
  {
    icon: Repeat2,
    title: "Increase purchase frequency",
    label: "Frequency",
    description:
      "Create consistent reasons and processes for clients to return, continue projects, refer others and reactivate later.",
    examples: ["Rebooking", "Project continuation", "Referral systems", "Client reactivation"],
  },
] as const;

function currency(value: number) {
  return new Intl.NumberFormat("en-GB", {
    style: "currency",
    currency: "GBP",
    maximumFractionDigits: 0,
  }).format(Number.isFinite(value) ? value : 0);
}

function GrowthModel() {
  const [baselineClients, setBaselineClients] = useState(10);
  const [baselineValue, setBaselineValue] = useState(400);
  const [baselineFrequency, setBaselineFrequency] = useState(1);
  const [improvedClients, setImprovedClients] = useState(12);
  const [improvedValue, setImprovedValue] = useState(450);
  const [improvedFrequency, setImprovedFrequency] = useState(1.25);
  const [illustrativeFee, setIllustrativeFee] = useState(10);

  const model = useMemo(() => {
    const baseline = baselineClients * baselineValue * baselineFrequency;
    const improved = improvedClients * improvedValue * improvedFrequency;
    const uplift = Math.max(0, improved - baseline);
    const performanceFee = uplift * (illustrativeFee / 100);
    return {
      baseline,
      improved,
      uplift,
      performanceFee,
      retainedUplift: Math.max(0, uplift - performanceFee),
      upliftPercent: baseline > 0 ? (uplift / baseline) * 100 : 0,
    };
  }, [
    baselineClients,
    baselineValue,
    baselineFrequency,
    improvedClients,
    improvedValue,
    improvedFrequency,
    illustrativeFee,
  ]);

  return (
    <PublicShell>
      <JsonLd
        data={{
          "@context": "https://schema.org",
          "@type": "WebPage",
          name: "INKSIGHTS Tattoo Studio Revenue Growth Model",
          url: CANONICAL_URL,
          description:
            "A tattoo studio revenue model based on client numbers, average transaction value and purchase frequency.",
        }}
      />

      <PageHero
        eyebrow="Tattoo studio commercial model"
        title={<>Model growth through three measurable revenue levers.</>}
        description={
          <>
            Revenue is modelled as <strong>clients × average transaction value × purchase frequency</strong>. INKSIGHTS uses this as a diagnostic framework, not a guarantee: the inputs, constraints and measured outcome still have to be verified.
          </>
        }
      >
        <PrimaryButton href="/studio-growth-check">Run the free Revenue Audit</PrimaryButton>
        <SecondaryButton href="/offers/founding-studio-pilot">Review the implementation package</SecondaryButton>
      </PageHero>

      <section className="border-b border-border bg-ink">
        <div className="mx-auto max-w-7xl px-6 py-20 md:py-28">
          <SectionHeading
            eyebrow="Three ways to grow"
            title="Each lever can compound the others — but only within real studio capacity."
            description="A studio does not need one dramatic breakthrough. Several controlled improvements can compound into a meaningful commercial change, provided the diary and delivery capacity can absorb it."
          />
          <div className="mt-10 grid gap-5 lg:grid-cols-3">
            {levers.map((lever) => {
              const Icon = lever.icon;
              return (
                <Card key={lever.label} className="h-full bg-ink-deep p-7">
                  <div className="flex items-center justify-between gap-4">
                    <span className="flex h-12 w-12 items-center justify-center rounded-xl bg-mint/10 text-mint">
                      <Icon className="h-6 w-6" />
                    </span>
                    <span className="text-xs font-bold uppercase tracking-[0.16em] text-mint">{lever.label}</span>
                  </div>
                  <h2 className="mt-7 font-display text-2xl font-black text-ice">{lever.title}</h2>
                  <p className="mt-3 leading-relaxed text-muted-foreground">{lever.description}</p>
                  <ul className="mt-6 space-y-2 text-sm text-muted-foreground">
                    {lever.examples.map((example) => (
                      <li key={example} className="flex gap-2">
                        <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-mint" />
                        {example}
                      </li>
                    ))}
                  </ul>
                </Card>
              );
            })}
          </div>
        </div>
      </section>

      <section>
        <div className="mx-auto max-w-7xl px-6 py-20 md:py-28">
          <SectionHeading
            eyebrow="Interactive model"
            title="See how modest changes compound."
            description="These figures are illustrations, not a forecast or guarantee. A paid performance arrangement requires a written baseline, attribution rules and an agreed measurement window."
          />

          <div className="mt-10 grid gap-6 lg:grid-cols-[1fr_1fr]">
            <Card className="bg-ink p-7">
              <h2 className="font-display text-2xl font-black text-ice">Baseline</h2>
              <div className="mt-6 grid gap-5 sm:grid-cols-3">
                <NumberField label="Clients" value={baselineClients} min={0} step={1} onChange={setBaselineClients} />
                <NumberField label="Average value" value={baselineValue} min={0} step={25} prefix="£" onChange={setBaselineValue} />
                <NumberField label="Purchases per client" value={baselineFrequency} min={0} step={0.05} onChange={setBaselineFrequency} />
              </div>
              <div className="mt-7 rounded-2xl border border-border bg-ink-deep p-6">
                <p className="text-xs font-bold uppercase tracking-[0.16em] text-muted-foreground">Baseline revenue</p>
                <p className="mt-2 font-display text-5xl font-black text-ice">{currency(model.baseline)}</p>
                <p className="mt-3 text-sm text-muted-foreground">{baselineClients} × {currency(baselineValue)} × {baselineFrequency}</p>
              </div>
            </Card>

            <Card className="border-mint/35 bg-ink p-7">
              <h2 className="font-display text-2xl font-black text-ice">Improved position</h2>
              <div className="mt-6 grid gap-5 sm:grid-cols-3">
                <NumberField label="Clients" value={improvedClients} min={0} step={1} onChange={setImprovedClients} />
                <NumberField label="Average value" value={improvedValue} min={0} step={25} prefix="£" onChange={setImprovedValue} />
                <NumberField label="Purchases per client" value={improvedFrequency} min={0} step={0.05} onChange={setImprovedFrequency} />
              </div>
              <div className="mt-7 rounded-2xl border border-mint/35 bg-mint/5 p-6">
                <p className="text-xs font-bold uppercase tracking-[0.16em] text-mint">Improved revenue</p>
                <p className="mt-2 font-display text-5xl font-black text-mint">{currency(model.improved)}</p>
                <p className="mt-3 text-sm text-muted-foreground">{improvedClients} × {currency(improvedValue)} × {improvedFrequency}</p>
              </div>
            </Card>
          </div>

          <div className="mt-6 grid gap-4 md:grid-cols-4">
            <Metric label="Modelled uplift" value={currency(model.uplift)} />
            <Metric label="Percentage uplift" value={`${model.upliftPercent.toFixed(1)}%`} />
            <Metric label="Illustrative INKSIGHTS fee" value={currency(model.performanceFee)} />
            <Metric label="Studio retains" value={currency(model.retainedUplift)} emphasis />
          </div>

          <Card className="mt-6 bg-ink p-7">
            <div className="grid gap-6 lg:grid-cols-[.8fr_1.2fr] lg:items-center">
              <div>
                <label className="text-sm font-bold text-ice" htmlFor="performance-fee">Illustrative performance fee: {illustrativeFee}%</label>
                <input
                  id="performance-fee"
                  type="range"
                  min="0"
                  max="30"
                  step="1"
                  value={illustrativeFee}
                  onChange={(event) => setIllustrativeFee(Number(event.target.value))}
                  className="mt-4 w-full accent-current"
                />
              </div>
              <div className="flex gap-3 rounded-2xl border border-amber-300/35 bg-amber-300/5 p-5 text-sm leading-relaxed text-amber-100">
                <ShieldCheck className="mt-0.5 h-5 w-5 shrink-0 text-amber-200" />
                <p>This percentage is for modelling only. INKSIGHTS has no default public performance-fee percentage. A fee applies only where the signed scope defines the baseline, direct costs, attribution adjustments, measurement window and approval process.</p>
              </div>
            </div>
          </Card>
        </div>
      </section>

      <section className="border-y border-border bg-ink">
        <div className="mx-auto max-w-7xl px-6 py-20 md:py-28">
          <SectionHeading
            eyebrow="How INKSIGHTS is paid"
            title="A hybrid model that can align payment with delivered value."
            description="The commercial structure depends on the scope and confidence of measurement; not every engagement includes every fee layer."
          />
          <div className="mt-10 grid gap-5 lg:grid-cols-3">
            {[
              [BarChart3, "Diagnosis or implementation fee", "Pays for baseline work, analysis, setup and delivery even where later performance cannot be attributed reliably."],
              [TrendingUp, "Ongoing management fee", "Pays for monitoring, exception handling, reporting, maintenance and continuing optimisation."],
              [ArrowRight, "Optional verified-uplift fee", "An agreed percentage may apply only to verified incremental revenue or contribution that meets the written attribution rules."],
            ].map(([Icon, title, description]) => {
              const ItemIcon = Icon as typeof BarChart3;
              return (
                <Card key={String(title)} className="bg-ink-deep p-7">
                  <ItemIcon className="h-7 w-7 text-mint" />
                  <h2 className="mt-6 font-display text-2xl font-black text-ice">{String(title)}</h2>
                  <p className="mt-3 leading-relaxed text-muted-foreground">{String(description)}</p>
                </Card>
              );
            })}
          </div>
        </div>
      </section>

      <section>
        <div className="mx-auto max-w-7xl px-6 py-20 md:py-28">
          <SectionHeading
            eyebrow="Measurement sequence"
            title="No uplift claim without a defensible baseline."
          />
          <div className="mt-10 grid gap-5 md:grid-cols-2 lg:grid-cols-4">
            {[
              ["01", "Baseline", "Record clients, average transaction value, frequency, capacity, prices, advertising and other material conditions."],
              ["02", "Implement", "Document exactly what INKSIGHTS changes and which growth lever each intervention is intended to affect."],
              ["03", "Verify", "Measure collected revenue or agreed contribution over the defined window and apply agreed adjustments."],
              ["04", "Approve", "The studio reviews the evidence before any performance-linked invoice is raised."],
            ].map(([number, title, text]) => (
              <Card key={number} className="bg-ink p-6">
                <div className="font-display text-4xl font-black text-mint/35">{number}</div>
                <h2 className="mt-5 font-display text-xl font-black text-ice">{title}</h2>
                <p className="mt-3 text-sm leading-relaxed text-muted-foreground">{text}</p>
              </Card>
            ))}
          </div>
          <div className="mt-10 flex flex-wrap gap-3">
            <PrimaryButton href="/studio-growth-check">Start with the free Revenue Audit</PrimaryButton>
            <SecondaryButton href="/offers/revenue-audit">Review the Revenue Audit</SecondaryButton>
          </div>
          <p className="mt-6 text-xs text-muted-foreground">Commercial policy version {POLICY_VERSION}. Calculators provide educational illustrations only.</p>
        </div>
      </section>
    </PublicShell>
  );
}

function NumberField({
  label,
  value,
  min,
  step,
  prefix,
  onChange,
}: {
  label: string;
  value: number;
  min: number;
  step: number;
  prefix?: string;
  onChange: (value: number) => void;
}) {
  return (
    <label className="block">
      <span className="text-xs font-bold uppercase tracking-[0.14em] text-muted-foreground">{label}</span>
      <div className="mt-2 flex items-center rounded-xl border border-border bg-ink-deep px-4 py-3 focus-within:border-mint">
        {prefix ? <span className="mr-1 text-muted-foreground">{prefix}</span> : null}
        <input
          type="number"
          min={min}
          step={step}
          value={value}
          onChange={(event) => onChange(Math.max(min, Number(event.target.value) || 0))}
          className="w-full bg-transparent font-display text-xl font-bold text-ice outline-none"
        />
      </div>
    </label>
  );
}

function Metric({ label, value, emphasis = false }: { label: string; value: string; emphasis?: boolean }) {
  return (
    <div className={`rounded-2xl border p-5 ${emphasis ? "border-mint/40 bg-mint/5" : "border-border bg-ink"}`}>
      <p className="text-xs font-bold uppercase tracking-[0.14em] text-muted-foreground">{label}</p>
      <p className={`mt-2 font-display text-3xl font-black ${emphasis ? "text-mint" : "text-ice"}`}>{value}</p>
    </div>
  );
}
