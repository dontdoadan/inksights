import { createFileRoute } from "@tanstack/react-router";
import { Calculator, ShieldCheck } from "lucide-react";
import { useMemo, useRef, useState } from "react";

import {
  Card,
  Disclaimer,
  PageHero,
  PrimaryButton,
  PublicShell,
  SecondaryButton,
  SectionHeading,
} from "@/components/public-site";
import { trackWebsiteEvent } from "@/lib/website-events";

const CANONICAL_URL = "https://getinksights.co.uk/cancellation-cost-calculator";

export const Route = createFileRoute("/cancellation-cost-calculator")({
  component: CancellationCostCalculator,
  head: () => ({
    meta: [
      { title: "Tattoo Studio Cancellation Cost Calculator | INKSIGHTS" },
      {
        name: "description",
        content:
          "Estimate the value at stake from late-cancelled tattoo capacity after refilled hours and retained deposits are accounted for.",
      },
      { property: "og:title", content: "Tattoo Studio Cancellation Cost Calculator | INKSIGHTS" },
      {
        property: "og:description",
        content:
          "A transparent late-cancellation capacity calculator for UK tattoo studios. Outputs remain modelled unless supported by event-level booking and payment evidence.",
      },
    ],
    links: [{ rel: "canonical", href: CANONICAL_URL }],
  }),
});

const money = (value: number) =>
  new Intl.NumberFormat("en-GB", {
    style: "currency",
    currency: "GBP",
    maximumFractionDigits: 0,
  }).format(Number.isFinite(value) ? Math.max(0, value) : 0);

function CancellationCostCalculator() {
  const started = useRef(false);
  const [lateCancelledHours, setLateCancelledHours] = useState(30);
  const [recoveredHours, setRecoveredHours] = useState(10);
  const [hourValue, setHourValue] = useState(100);
  const [retainedDeposits, setRetainedDeposits] = useState(400);
  const [calculated, setCalculated] = useState(false);

  const result = useMemo(() => {
    const cancelled = Math.max(0, lateCancelledHours);
    const recovered = Math.min(Math.max(0, recoveredHours), cancelled);
    const unitValue = Math.max(0, hourValue);
    const gross = cancelled * unitValue;
    const recoveredValue = recovered * unitValue;
    const unrecovered = Math.max(0, (cancelled - recovered) * unitValue - Math.max(0, retainedDeposits));
    const recoveryRate = cancelled > 0 ? (recovered / cancelled) * 100 : 0;
    return { gross, recoveredValue, unrecovered, recoveryRate };
  }, [lateCancelledHours, recoveredHours, hourValue, retainedDeposits]);

  function calculate() {
    if (!started.current) {
      started.current = true;
      trackWebsiteEvent("diagnostic_started", { diagnostic: "cancellation_cost_calculator_v1" });
    }
    setCalculated(true);
    trackWebsiteEvent("diagnostic_completed", {
      diagnostic: "cancellation_cost_calculator_v1",
      recovery_rate: Math.round(result.recoveryRate),
    });
    window.setTimeout(
      () => document.getElementById("calculator-result")?.scrollIntoView({ behavior: "smooth", block: "start" }),
      40,
    );
  }

  return (
    <PublicShell>
      <PageHero
        eyebrow="Free capacity-recovery calculator · MODELLED"
        title="Estimate what late cancellations put at stake after recovery is counted."
        description={
          <>
            A cancelled appointment is not automatically a full revenue loss. This calculator separates cancelled capacity from time you successfully refill and deposits you retain, so the result is a more disciplined <strong className="text-ice">value-at-stake scenario</strong>.
          </>
        }
      >
        <PrimaryButton href="/studio-growth-check?source=cancellation-cost-calculator">Run the Studio Growth Check</PrimaryButton>
        <SecondaryButton href="/offers/studio-intelligence-audit">Review the £395 Audit</SecondaryButton>
      </PageHero>

      <section className="border-b border-border bg-ink">
        <div className="mx-auto max-w-5xl px-6 py-16 md:py-20">
          <SectionHeading
            eyebrow="One measurement period"
            title="Count the event, the recovery and the deposit."
            description="Use late cancellations from the same period. If value per hour is assumed rather than observed, the monetary output remains MODELLED."
          />

          <Card className="mt-10">
            <div className="grid gap-5 sm:grid-cols-2">
              <NumberField label="Late-cancelled artist hours" value={lateCancelledHours} onChange={setLateCancelledHours} />
              <NumberField label="Cancelled hours successfully refilled" value={recoveredHours} onChange={setRecoveredHours} />
              <NumberField label="Realistic value per artist hour (£)" value={hourValue} onChange={setHourValue} />
              <NumberField label="Deposits retained against those events (£)" value={retainedDeposits} onChange={setRetainedDeposits} />
            </div>
            <button
              type="button"
              onClick={calculate}
              className="mt-7 inline-flex min-h-12 items-center gap-2 rounded-full bg-mint px-6 py-3 font-bold text-ink-deep transition hover:bg-mint-soft"
            >
              <Calculator className="h-4 w-4" /> Calculate cancellation scenario
            </button>
          </Card>
        </div>
      </section>

      {calculated ? (
        <section id="calculator-result" className="border-b border-border bg-ink-deep">
          <div className="mx-auto max-w-5xl px-6 py-16 md:py-20">
            <div className="inline-flex items-center gap-2 rounded-full border border-mint/25 bg-mint/5 px-4 py-2 text-xs font-bold uppercase tracking-[.16em] text-mint">
              <ShieldCheck className="h-4 w-4" /> MODELLED · verify with booking evidence
            </div>
            <h2 className="mt-5 font-display text-4xl font-black tracking-tight text-ice md:text-6xl">
              Unrecovered value at stake: <span className="text-mint">{money(result.unrecovered)}</span>
            </h2>
            <div className="mt-10 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
              <Metric label="Gross cancelled capacity" value={money(result.gross)} />
              <Metric label="Recovered capacity value" value={money(result.recoveredValue)} />
              <Metric label="Deposits retained" value={money(retainedDeposits)} />
              <Metric label="Capacity recovery rate" value={`${result.recoveryRate.toFixed(0)}%`} />
            </div>
            <div className="mt-8">
              <Disclaimer>
                This is not a claim that the studio “lost” the displayed amount. Event-level booking and payment records are required to calculate evidence-backed unrecovered value. If the hourly value is assumed, the result remains MODELLED.
              </Disclaimer>
            </div>
            <div className="mt-8 flex flex-wrap gap-3">
              <PrimaryButton href="/studio-growth-check?source=cancellation-cost-calculator">Run the Studio Growth Check</PrimaryButton>
              <SecondaryButton href="/offers/studio-intelligence-audit">Verify the constraint with the £395 Audit</SecondaryButton>
            </div>
          </div>
        </section>
      ) : null}
    </PublicShell>
  );
}

function Metric({ label, value }: { label: string; value: string }) {
  return (
    <Card>
      <p className="text-xs font-bold uppercase tracking-[.12em] text-muted-foreground">{label}</p>
      <p className="mt-3 font-display text-2xl font-black text-mint">{value}</p>
    </Card>
  );
}

function NumberField({
  label,
  value,
  onChange,
}: {
  label: string;
  value: number;
  onChange: (value: number) => void;
}) {
  return (
    <label className="text-sm font-semibold text-ice">
      {label}
      <input
        type="number"
        min={0}
        step="any"
        value={value}
        onChange={(event) => onChange(Number(event.target.value) || 0)}
        className="mt-2 w-full rounded-xl border border-border bg-ink-deep px-4 py-3 font-normal text-ice outline-none transition focus:border-mint"
      />
    </label>
  );
}
