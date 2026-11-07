import { createFileRoute } from "@tanstack/react-router";
import { BarChart3, Clock3, Info, PoundSterling, ShieldCheck, TrendingUp } from "lucide-react";
import { useMemo, useRef, useState } from "react";
import {
  Card,
  JsonLd,
  PageHero,
  PrimaryButton,
  PublicShell,
  SecondaryButton,
  SectionHeading,
} from "@/components/public-site";

const CANONICAL_URL = "https://getinksights.co.uk/pricing-benchmark";
const DATASET_VERSION = "2026-09-05-initial";

type Region = "uk" | "london";
type Benchmark = { name: string; sub: string; min: number; max: number };
type PricingResponse = { submissionId: string; result: { below: number; above: number; positions: Array<"below" | "within" | "above" | null>; lead_time_signal: string; dataset_version: string } };
type SubmittedPricing = { prices: Array<number | null>; result: PricingResponse["result"] };
const CONSENT_VERSION = "2026-10-tool-v1";

const BENCHMARKS: Record<Region, Benchmark[]> = {
  uk: [
    { name: "Small tattoo (1–2 hrs)", sub: "Simple design, single colour", min: 80, max: 200 },
    { name: "Half-day session (4–5 hrs)", sub: "Medium-large piece", min: 300, max: 600 },
    { name: "Full-day session (7–8 hrs)", sub: "Large / complex work", min: 550, max: 1100 },
    { name: "Hourly rate", sub: "Per hour billing", min: 80, max: 180 },
    { name: "Minimum charge", sub: "Walk-in / tiny pieces", min: 50, max: 100 },
  ],
  london: [
    { name: "Small tattoo (1–2 hrs)", sub: "Simple design, single colour", min: 100, max: 280 },
    { name: "Half-day session (4–5 hrs)", sub: "Medium-large piece", min: 400, max: 800 },
    { name: "Full-day session (7–8 hrs)", sub: "Large / complex work", min: 750, max: 1500 },
    { name: "Hourly rate", sub: "Per hour billing", min: 120, max: 250 },
    { name: "Minimum charge", sub: "Walk-in / tiny pieces", min: 80, max: 150 },
  ],
};

const REGION_LABELS: Record<Region, string> = {
  uk: "UK national reference",
  london: "London / South East reference",
};

function currency(value: number) {
  return new Intl.NumberFormat("en-GB", {
    style: "currency",
    currency: "GBP",
    maximumFractionDigits: 0,
  }).format(value);
}

function position(value: number, benchmark: Benchmark) {
  if (value < benchmark.min) return { label: "Below reference", tone: "text-amber-300", pct: 20 };
  if (value > benchmark.max) return { label: "Above reference", tone: "text-mint", pct: 90 };
  const pct = ((value - benchmark.min) / (benchmark.max - benchmark.min)) * 70 + 20;
  return { label: "Within reference", tone: "text-sky-300", pct };
}

export const Route = createFileRoute("/pricing-benchmark")({
  component: PricingBenchmark,
  head: () => ({
    meta: [
      { title: "Tattoo Studio Pricing Benchmark | INKSIGHTS" },
      {
        name: "description",
        content:
          "Compare tattoo studio pricing with INKSIGHTS UK reference bands and combine price position with booking lead time before changing rates.",
      },
      { property: "og:title", content: "Tattoo Studio Pricing Benchmark | INKSIGHTS" },
      {
        property: "og:description",
        content:
          "Benchmark tattoo studio rates against UK reference bands and interpret pricing alongside booking lead time.",
      },
      { property: "og:url", content: CANONICAL_URL },
    ],
    links: [{ rel: "canonical", href: CANONICAL_URL }],
  }),
});

function PricingBenchmark() {
  const [region, setRegion] = useState<Region>("uk");
  const [prices, setPrices] = useState<Record<number, string>>({});
  const [leadTime, setLeadTime] = useState("4");
  const [dataNoticeAccepted, setDataNoticeAccepted] = useState(false);
  const [submitted, setSubmitted] = useState<SubmittedPricing | null>(null);
  const [submissionId, setSubmissionId] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const submissionKey = useRef<string | null>(null);
  const benchmarks = BENCHMARKS[region];

  function clearResult() {
    setSubmitted(null);
    setSubmissionId(null);
    setSubmitError(null);
    submissionKey.current = null;
  }

  async function submitPricing() {
    if (submitting) return;
    setSubmitError(null);
    const normalizedPrices = benchmarks.map((_, index) => {
      const raw = prices[index];
      return raw === undefined || raw === "" ? null : Number(raw);
    });
    if (!normalizedPrices.some((value) => value !== null)) {
      setSubmitError("Enter at least one current price to receive your benchmark.");
      return;
    }
    if (normalizedPrices.some((value) => value !== null && (!Number.isFinite(value) || value <= 0 || value > 50000 || Math.round(value * 100) !== value * 100))) {
      setSubmitError("Enter valid GBP prices greater than £0 and no more than £50,000.");
      return;
    }
    if (!dataNoticeAccepted) {
      setSubmitError("Please acknowledge how your submitted data will be used.");
      return;
    }
    const key = submissionKey.current ?? crypto.randomUUID();
    submissionKey.current = key;
    setSubmitting(true);
    try {
      const response = await fetch("/api/public/pricing-benchmark-submit", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "same-origin",
        body: JSON.stringify({
          region,
          prices: normalizedPrices,
          leadTimeWeeks: Number(leadTime),
          submissionKey: key,
          consentVersion: CONSENT_VERSION,
          dataNoticeAccepted: true,
        }),
      });
      const payload = await response.json() as Partial<PricingResponse> & { error?: string };
      if (!response.ok || !payload.result || !payload.submissionId) {
        throw new Error(payload.error || "Your result could not be saved. Please try again.");
      }
      setSubmitted({ prices: normalizedPrices, result: payload.result });
      setSubmissionId(payload.submissionId);
    } catch (error) {
      setSubmitted(null);
      setSubmitError(error instanceof Error ? error.message : "Submission failed. Please try again.");
    } finally {
      setSubmitting(false);
    }
  }

  const results = useMemo(
    () =>
      benchmarks.map((benchmark, index) => {
        const value = submitted?.prices[index] ?? NaN;
        return { benchmark, value, result: submitted && Number.isFinite(value) && value > 0 ? position(value, benchmark) : null };
      }),
    [benchmarks, submitted],
  );

  const below = submitted?.result.below ?? 0;
  const above = submitted?.result.above ?? 0;
  const leadTimeNumber = Number(leadTime);

  const leadTimeSignal =
    leadTimeNumber >= 6
      ? { title: "Strong demand signal", text: "A 6+ week lead time can indicate pricing may be below what demand supports. Validate against actual utilisation and waitlist behaviour before changing rates." }
      : leadTimeNumber >= 4
        ? { title: "Balanced demand signal", text: "A 4–8 week lead time is a useful operating reference. Combine it with utilisation, conversion and margin before making a pricing decision." }
        : { title: "Check perceived value", text: "A 2–4 week lead time can indicate weaker demand or a healthy short booking cycle. Do not reduce price without checking visibility, conversion and portfolio positioning." };

  return (
    <PublicShell>
      <JsonLd
        data={{
          "@context": "https://schema.org",
          "@type": "WebPage",
          name: "Tattoo Studio Pricing Benchmark | INKSIGHTS",
          url: CANONICAL_URL,
          description: "INKSIGHTS native tattoo studio pricing benchmark.",
        }}
      />

      <PageHero
        eyebrow="Studio economics"
        title={<>Benchmark your pricing.<br /><span className="text-mint">Then test the demand signal.</span></>}
        description="A native INKSIGHTS pricing benchmark for UK tattoo studios. Compare your rates against reference bands, then interpret them alongside booking lead time instead of treating a market range as a recommended price."
      />

      <section className="border-y border-border bg-ink-deep">
        <div className="mx-auto max-w-7xl px-6 py-12 md:py-16">
          <div className="grid gap-6 lg:grid-cols-[1.15fr_.85fr]">
            <Card className="bg-ink p-6 md:p-8">
              <div className="flex items-start justify-between gap-5">
                <div>
                  <p className="text-xs font-bold uppercase tracking-[.18em] text-mint">1. Price position</p>
                  <h2 className="mt-3 font-display text-2xl font-black text-ice md:text-3xl">Enter your current prices</h2>
                  <p className="mt-2 text-sm leading-relaxed text-muted-foreground">Use the rate you actually quote today, not the price you intend to introduce.</p>
                </div>
                <PoundSterling className="h-8 w-8 shrink-0 text-mint" />
              </div>

              <div className="mt-7">
                <label className="text-xs font-bold uppercase tracking-[.14em] text-muted-foreground" htmlFor="region">Reference market</label>
                <select
                  id="region"
                  value={region}
                  onChange={(event) => { setRegion(event.target.value as Region); setPrices({}); clearResult(); }}
                  className="mt-2 w-full rounded-xl border border-border bg-ink-deep px-4 py-3 text-sm text-ice outline-none focus:border-mint"
                >
                  <option value="uk">{REGION_LABELS.uk}</option>
                  <option value="london">{REGION_LABELS.london}</option>
                </select>
              </div>

              <div className="mt-6 space-y-3">
                {benchmarks.map((benchmark, index) => (
                  <div key={benchmark.name} className="grid gap-4 rounded-xl border border-border bg-ink-deep p-4 sm:grid-cols-[1fr_150px] sm:items-center">
                    <div>
                      <p className="font-semibold text-ice">{benchmark.name}</p>
                      <p className="mt-1 text-xs text-muted-foreground">{benchmark.sub} · reference {currency(benchmark.min)}–{currency(benchmark.max)}</p>
                    </div>
                    <div className="relative">
                      <span className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-sm text-muted-foreground">£</span>
                      <input
                        aria-label={`${benchmark.name} current price`}
                        type="number"
                        min="0"
                        step="1"
                        inputMode="decimal"
                        value={prices[index] ?? ""}
                        onChange={(event) => { setPrices((current) => ({ ...current, [index]: event.target.value })); clearResult(); }}
                        placeholder="Your price"
                        className="w-full rounded-lg border border-border bg-ink px-3 py-3 pl-7 text-sm text-ice placeholder:text-muted-foreground outline-none focus:border-mint"
                      />
                    </div>
                  </div>
                ))}
              </div>

              <div className="mt-7 rounded-xl border border-border bg-ink-deep p-5">
                <label className="flex items-start gap-3 text-sm leading-relaxed text-muted-foreground">
                  <input type="checkbox" checked={dataNoticeAccepted} onChange={(event) => setDataNoticeAccepted(event.target.checked)} className="mt-1 h-4 w-4 shrink-0 accent-current" />
                  <span>I understand that INKSIGHTS will store the prices and booking lead time I submit to provide my result and may use de-identified, unverified responses for aggregated research. <a className="text-mint underline" href="/privacy">Read the Privacy Notice</a>.</span>
                </label>
                <button type="button" onClick={submitPricing} disabled={submitting} className="mt-5 inline-flex min-h-12 w-full items-center justify-center rounded-xl bg-mint px-6 py-3 font-bold text-ink-deep transition-opacity hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-60">
                  {submitting ? "Saving your submission…" : "Submit data and view my benchmark"}
                </button>
                {submitError && <p role="alert" className="mt-3 text-sm text-amber-300">{submitError}</p>}
                {submissionId && <p role="status" className="mt-3 text-sm text-mint">Submission saved. Your benchmark results are displayed below.</p>}
              </div>
            </Card>

            <Card className="bg-ink p-6 md:p-8">
              <div className="flex items-start justify-between gap-5">
                <div>
                  <p className="text-xs font-bold uppercase tracking-[.18em] text-mint">2. Demand signal</p>
                  <h2 className="mt-3 font-display text-2xl font-black text-ice md:text-3xl">How far ahead are you booked?</h2>
                  <p className="mt-2 text-sm leading-relaxed text-muted-foreground">Lead time gives pricing context that a national benchmark cannot.</p>
                </div>
                <Clock3 className="h-8 w-8 shrink-0 text-mint" />
              </div>

              <div className="mt-8">
                <div className="flex items-end justify-between">
                  <label className="text-xs font-bold uppercase tracking-[.14em] text-muted-foreground" htmlFor="lead-time">Typical lead time</label>
                  <span className="font-display text-3xl font-black text-ice">{leadTime} weeks</span>
                </div>
                <input id="lead-time" type="range" min="1" max="26" value={leadTime} onChange={(event) => { setLeadTime(event.target.value); clearResult(); }} className="mt-6 w-full accent-current" />
                <div className="mt-2 flex justify-between text-[11px] text-muted-foreground"><span>1 week</span><span>13 weeks</span><span>26 weeks</span></div>
              </div>

              <div className="mt-8 rounded-2xl border border-mint/20 bg-mint/5 p-5">
                <TrendingUp className="h-6 w-6 text-mint" />
                <h3 className="mt-4 font-display text-xl font-black text-ice">{submitted ? leadTimeSignal.title : "Submit your data to reveal the demand signal"}</h3>
                <p className="mt-2 text-sm leading-relaxed text-muted-foreground">{submitted ? leadTimeSignal.text : "Your demand interpretation will be shown only after your data has been successfully saved."}</p>
              </div>

              <div className="mt-6 grid grid-cols-2 gap-3">
                <div className="rounded-xl border border-border bg-ink-deep p-4"><p className="text-xs uppercase tracking-[.12em] text-muted-foreground">Below reference</p><p className="mt-2 font-display text-2xl font-black text-ice">{submitted ? below : "—"}</p></div>
                <div className="rounded-xl border border-border bg-ink-deep p-4"><p className="text-xs uppercase tracking-[.12em] text-muted-foreground">Above reference</p><p className="mt-2 font-display text-2xl font-black text-ice">{submitted ? above : "—"}</p></div>
              </div>
            </Card>
          </div>
        </div>
      </section>

      <section className="border-b border-border bg-ink">
        <div className="mx-auto max-w-7xl px-6 py-16 md:py-24">
          <SectionHeading
            eyebrow="Your pricing position"
            title="See the signal, not just the number."
            description="A benchmark is a reference point. It is not a pricing recommendation. Use the position below with demand, utilisation, conversion, portfolio strength and margin."
          />

          {!submitted && (
            <div className="mt-10 rounded-xl border border-border bg-ink-deep p-6 text-muted-foreground" role="status">
              Your personal pricing position is hidden until you submit your information using the button above. No submission means no result is recorded.
            </div>
          )}
          {submitted && <div className="mt-10 grid gap-4 md:grid-cols-2">
            {results.map(({ benchmark, value, result }) => (
              <Card key={benchmark.name} className="bg-ink-deep p-5">
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <p className="font-display text-lg font-black text-ice">{benchmark.name}</p>
                    <p className="mt-1 text-xs text-muted-foreground">Reference {currency(benchmark.min)}–{currency(benchmark.max)}</p>
                  </div>
                  <span className={`text-xs font-bold uppercase tracking-[.1em] ${result?.tone ?? "text-muted-foreground"}`}>
                    {result?.label ?? "Not entered"}
                  </span>
                </div>
                {result ? (
                  <>
                    <div className="mt-5 h-2 overflow-hidden rounded-full bg-border">
                      <div className="h-full rounded-full bg-mint transition-all" style={{ width: `${result.pct}%` }} />
                    </div>
                    <div className="mt-3 flex justify-between text-xs text-muted-foreground"><span>{currency(benchmark.min)}</span><span className="font-bold text-ice">Your price {currency(value)}</span><span>{currency(benchmark.max)}+</span></div>
                  </>
                ) : (
                  <p className="mt-5 text-sm text-muted-foreground">Enter a current price above to calculate its position.</p>
                )}
              </Card>
            ))}
          </div>}

          <div className="mt-10 grid gap-4 md:grid-cols-3">
            <Card className="bg-ink-deep p-5"><BarChart3 className="h-6 w-6 text-mint" /><h3 className="mt-4 font-display text-lg font-black text-ice">Add utilisation</h3><p className="mt-2 text-sm leading-relaxed text-muted-foreground">A high rate with an empty diary is a different problem from a high rate with a stable waitlist.</p></Card>
            <Card className="bg-ink-deep p-5"><ShieldCheck className="h-6 w-6 text-mint" /><h3 className="mt-4 font-display text-lg font-black text-ice">Protect the decision</h3><p className="mt-2 text-sm leading-relaxed text-muted-foreground">Do not change prices solely because a benchmark says you are high or low. Check margin, demand and conversion first.</p></Card>
            <Card className="bg-ink-deep p-5"><Info className="h-6 w-6 text-mint" /><h3 className="mt-4 font-display text-lg font-black text-ice">Know the dataset</h3><p className="mt-2 text-sm leading-relaxed text-muted-foreground">This first release uses explicit reference bands. Future INKSIGHTS releases should replace these with versioned, evidence-backed studio observations.</p></Card>
          </div>

          <div className="mt-10 rounded-2xl border border-border bg-ink-deep p-5 text-sm leading-relaxed text-muted-foreground">
            <strong className="text-ice">Dataset {DATASET_VERSION}.</strong> Initial reference bands are a controlled baseline for the native INKSIGHTS tool. They are not presented as INKSIGHTS proprietary market observations. The benchmark should evolve into a versioned dataset with source provenance, sample size, geography, observation date, confidence and methodology before being used for stronger commercial claims.
          </div>

          <div className="mt-8 flex flex-wrap gap-3">
            <PrimaryButton href="/studio-growth-check">Run the free Revenue Audit</PrimaryButton>
            <SecondaryButton href="/offers">Explore INKSIGHTS solutions</SecondaryButton>
          </div>
        </div>
      </section>
    </PublicShell>
  );
}
