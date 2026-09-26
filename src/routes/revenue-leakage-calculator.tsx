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

const CANONICAL_URL = "https://getinksights.co.uk/revenue-leakage-calculator";

export const Route = createFileRoute("/revenue-leakage-calculator")({
  component: RevenueLeakageCalculator,
  head: () => ({
    meta: [
      { title: "Tattoo Studio Revenue Leakage Calculator | INKSIGHTS" },
      {
        name: "description",
        content:
          "Model value at stake across unused artist capacity, enquiry conversion, late cancellations and repeat business without treating scenarios as guaranteed revenue.",
      },
      { property: "og:title", content: "Tattoo Studio Revenue Leakage Calculator | INKSIGHTS" },
      {
        property: "og:description",
        content:
          "A transparent scenario calculator for UK tattoo studios. Inputs and assumptions stay visible and overlapping opportunities are not added together.",
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

const pct = (value: number) => Math.max(0, Math.min(100, value)) / 100;

function RevenueLeakageCalculator() {
  const started = useRef(false);
  const [availableHours, setAvailableHours] = useState(800);
  const [bookedHours, setBookedHours] = useState(640);
  const [hourValue, setHourValue] = useState(100);
  const [qualifiedEnquiries, setQualifiedEnquiries] = useState(80);
  const [currentConversion, setCurrentConversion] = useState(50);
  const [targetConversion, setTargetConversion] = useState(60);
  const [averageBookingValue, setAverageBookingValue] = useState(500);
  const [lateCancelledHours, setLateCancelledHours] = useState(30);
  const [recoveredCancelledHours, setRecoveredCancelledHours] = useState(10);
  const [retainedDeposits, setRetainedDeposits] = useState(400);
  const [eligiblePreviousClients, setEligiblePreviousClients] = useState(120);
  const [currentRepeatRate, setCurrentRepeatRate] = useState(30);
  const [targetRepeatRate, setTargetRepeatRate] = useState(40);
  const [averageRepeatValue, setAverageRepeatValue] = useState(450);
  const [calculated, setCalculated] = useState(false);

  const results = useMemo(() => {
    const unusedCapacity = Math.max(0, availableHours - Math.min(bookedHours, availableHours)) * Math.max(0, hourValue);
    const conversionOpportunity =
      Math.max(0, qualifiedEnquiries) *
      Math.max(0, pct(targetConversion) - pct(currentConversion)) *
      Math.max(0, averageBookingValue);
    const unrecoveredCancellation =
      Math.max(
        0,
        (Math.max(0, lateCancelledHours) - Math.min(Math.max(0, recoveredCancelledHours), Math.max(0, lateCancelledHours))) *
          Math.max(0, hourValue) -
          Math.max(0, retainedDeposits),
      );
    const retentionOpportunity =
      Math.max(0, eligiblePreviousClients) *
      Math.max(0, pct(targetRepeatRate) - pct(currentRepeatRate)) *
      Math.max(0, averageRepeatValue);

    return [
      { key: "capacity", label: "Unused capacity scenario", value: unusedCapacity },
      { key: "conversion", label: "Enquiry conversion scenario", value: conversionOpportunity },
      { key: "cancellation", label: "Late-cancellation scenario", value: unrecoveredCancellation },
      { key: "retention", label: "Repeat-business scenario", value: retentionOpportunity },
    ];
  }, [
    availableHours,
    bookedHours,
    hourValue,
    qualifiedEnquiries,
    currentConversion,
    targetConversion,
    averageBookingValue,
    lateCancelledHours,
    recoveredCancelledHours,
    retainedDeposits,
    eligiblePreviousClients,
    currentRepeatRate,
    targetRepeatRate,
    averageRepeatValue,
  ]);

  const strongest = [...results].sort((a, b) => b.value - a.value)[0];

  function calculate() {
    if (!started.current) {
      started.current = true;
      trackWebsiteEvent("diagnostic_started", { diagnostic: "revenue_leakage_calculator_v1" });
    }
    setCalculated(true);
    trackWebsiteEvent("diagnostic_completed", {
      diagnostic: "revenue_leakage_calculator_v1",
      strongest_scenario: strongest.key,
    });
    window.setTimeout(
      () => document.getElementById("calculator-result")?.scrollIntoView({ behavior: "smooth", block: "start" }),
      40,
    );
  }

  return (
    <PublicShell>
      <PageHero
        eyebrow="Free commercial calculator · MODELLED"
        title="Model where commercial value may be sitting — without calling it guaranteed revenue."
        description={
          <>
            Test four separate studio scenarios: unused artist capacity, enquiry conversion, late cancellations and repeat business.
            The calculator keeps assumptions visible and deliberately does <strong className="text-ice">not</strong> add overlapping scenarios into one headline promise.
          </>
        }
      >
        <PrimaryButton href="/studio-growth-check?source=revenue-leakage-calculator">Run the Studio Growth Check</PrimaryButton>
        <SecondaryButton href="/offers/studio-intelligence-audit">Review the £395 Audit</SecondaryButton>
      </PageHero>

      <section className="border-b border-border bg-ink">
        <div className="mx-auto max-w-7xl px-6 py-16 md:py-20">
          <SectionHeading
            eyebrow="Transparent inputs"
            title="Change the assumptions. Keep the evidence boundary visible."
            description="Use one consistent measurement period. Observed inputs are stronger than guesses; target rates are scenarios unless you can support them with a valid benchmark or your own history."
          />
          <div className="mt-10 grid gap-6 lg:grid-cols-2">
            <Card>
              <GroupTitle number="01" title="Artist capacity" />
              <div className="mt-5 grid gap-4 sm:grid-cols-3">
                <NumberField label="Available hours" value={availableHours} onChange={setAvailableHours} />
                <NumberField label="Booked hours" value={bookedHours} onChange={setBookedHours} />
                <NumberField label="Value / hour (£)" value={hourValue} onChange={setHourValue} />
              </div>
            </Card>

            <Card>
              <GroupTitle number="02" title="Enquiry conversion" />
              <div className="mt-5 grid gap-4 sm:grid-cols-2">
                <NumberField label="Qualified enquiries" value={qualifiedEnquiries} onChange={setQualifiedEnquiries} />
                <NumberField label="Average booking value (£)" value={averageBookingValue} onChange={setAverageBookingValue} />
                <NumberField label="Current conversion (%)" value={currentConversion} onChange={setCurrentConversion} max={100} />
                <NumberField label="Target scenario (%)" value={targetConversion} onChange={setTargetConversion} max={100} />
              </div>
            </Card>

            <Card>
              <GroupTitle number="03" title="Late cancellations" />
              <div className="mt-5 grid gap-4 sm:grid-cols-3">
                <NumberField label="Late-cancelled hours" value={lateCancelledHours} onChange={setLateCancelledHours} />
                <NumberField label="Hours refilled" value={recoveredCancelledHours} onChange={setRecoveredCancelledHours} />
                <NumberField label="Deposits retained (£)" value={retainedDeposits} onChange={setRetainedDeposits} />
              </div>
              <p className="mt-4 text-xs leading-relaxed text-muted-foreground">
                This scenario reuses the value-per-hour input above and subtracts successfully refilled hours plus retained deposits.
              </p>
            </Card>

            <Card>
              <GroupTitle number="04" title="Repeat business" />
              <div className="mt-5 grid gap-4 sm:grid-cols-2">
                <NumberField label="Eligible previous clients" value={eligiblePreviousClients} onChange={setEligiblePreviousClients} />
                <NumberField label="Average repeat value (£)" value={averageRepeatValue} onChange={setAverageRepeatValue} />
                <NumberField label="Current repeat rate (%)" value={currentRepeatRate} onChange={setCurrentRepeatRate} max={100} />
                <NumberField label="Target scenario (%)" value={targetRepeatRate} onChange={setTargetRepeatRate} max={100} />
              </div>
            </Card>
          </div>

          <button
            type="button"
            onClick={calculate}
            className="mt-8 inline-flex min-h-12 items-center gap-2 rounded-full bg-mint px-6 py-3 font-bold text-ink-deep transition hover:bg-mint-soft"
          >
            <Calculator className="h-4 w-4" /> Calculate modelled scenarios
          </button>
        </div>
      </section>

      {calculated ? (
        <section id="calculator-result" className="border-b border-border bg-ink-deep">
          <div className="mx-auto max-w-7xl px-6 py-16 md:py-20">
            <div className="inline-flex items-center gap-2 rounded-full border border-mint/25 bg-mint/5 px-4 py-2 text-xs font-bold uppercase tracking-[.16em] text-mint">
              <ShieldCheck className="h-4 w-4" /> MODELLED · not observed loss
            </div>
            <h2 className="mt-5 max-w-4xl font-display text-4xl font-black tracking-tight text-ice md:text-6xl">
              Strongest current scenario: <span className="text-mint">{strongest.label}</span>
            </h2>
            <div className="mt-10 grid gap-4 md:grid-cols-2 xl:grid-cols-4">
              {results.map((item) => (
                <Card key={item.key}>
                  <p className="text-sm font-bold text-ice">{item.label}</p>
                  <p className="mt-3 font-display text-3xl font-black text-mint">{money(item.value)}</p>
                  <p className="mt-2 text-xs leading-relaxed text-muted-foreground">modelled value at stake for the measurement period</p>
                </Card>
              ))}
            </div>
            <div className="mt-8">
              <Disclaimer>
                These four outputs are separate diagnostic scenarios. They may overlap, so INKSIGHTS does not add them into a single “total revenue loss”. A target rate, value per hour or other assumed input makes the related output MODELLED until studio evidence verifies it.
              </Disclaimer>
            </div>
            <div className="mt-8 flex flex-wrap gap-3">
              <PrimaryButton href="/studio-growth-check?source=revenue-leakage-calculator">Run the Studio Growth Check</PrimaryButton>
              <SecondaryButton href="/offers/studio-intelligence-audit">Verify the constraint with the £395 Audit</SecondaryButton>
            </div>
          </div>
        </section>
      ) : null}
    </PublicShell>
  );
}

function GroupTitle({ number, title }: { number: string; title: string }) {
  return (
    <div>
      <p className="font-mono text-xs text-mint">{number}</p>
      <h2 className="mt-2 font-display text-2xl font-black text-ice">{title}</h2>
    </div>
  );
}

function NumberField({
  label,
  value,
  onChange,
  max,
}: {
  label: string;
  value: number;
  onChange: (value: number) => void;
  max?: number;
}) {
  return (
    <label className="text-sm font-semibold text-ice">
      {label}
      <input
        type="number"
        min={0}
        max={max}
        step="any"
        value={value}
        onChange={(event) => onChange(Number(event.target.value) || 0)}
        className="mt-2 w-full rounded-xl border border-border bg-ink-deep px-4 py-3 font-normal text-ice outline-none transition focus:border-mint"
      />
    </label>
  );
}
