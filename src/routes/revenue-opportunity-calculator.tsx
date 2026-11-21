import { createFileRoute } from "@tanstack/react-router";
import { useState, type FormEvent } from "react";
import { ArrowRight, Calculator, Database, ShieldCheck, TrendingUp } from "lucide-react";
import { Card, PageHero, PublicShell, PrimaryButton, SecondaryButton } from "@/components/public-site";
import type { RevenueScenarioResult } from "@/lib/revenue-scenario";

const money = (v: number) => new Intl.NumberFormat("en-GB", { style: "currency", currency: "GBP", maximumFractionDigits: 0 }).format(v);

type Inputs = {
  averageBookingValue: number;
  extraBookingsPerWeek: number;
  availableExtraSlotsPerWeek: number;
  tradingWeeks: number;
  contributionMarginPct: number;
};
const initial: Inputs = {
  averageBookingValue: 400,
  extraBookingsPerWeek: 1,
  availableExtraSlotsPerWeek: 1,
  tradingWeeks: 46,
  contributionMarginPct: 70,
};
type Saved = { submissionKey: string; result: RevenueScenarioResult };

export const Route = createFileRoute("/revenue-opportunity-calculator")({
  component: RevenueOpportunityCalculator,
  head: () => ({
    meta: [
      { title: "Tattoo Studio Revenue Opportunity Calculator | INKSIGHTS" },
      { name: "description", content: "Model possible incremental tattoo studio bookings, capacity-adjusted revenue and contribution. Submit to save the scenario and reveal the result." },
    ],
    links: [{ rel: "canonical", href: "https://getinksights.co.uk/revenue-opportunity-calculator" }],
  }),
});

function RevenueOpportunityCalculator() {
  const [values, setValues] = useState<Inputs>(initial);
  const [studioName, setStudioName] = useState("");
  const [studioWebsite, setStudioWebsite] = useState("");
  const [area, setArea] = useState("");
  const [consent, setConsent] = useState(false);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [saved, setSaved] = useState<Saved | null>(null);

  function change(key: keyof Inputs, n: number) {
    setValues(old => ({ ...old, [key]: n }));
    setSaved(null);
    setError("");
  }

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!consent) return setError("Confirm that you understand your inputs will be saved as an unverified scenario.");
    setBusy(true);
    setError("");
    setSaved(null);
    try {
      const response = await fetch("/api/public/revenue-scenario", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({
          ...values, studioName, studioWebsite, area, consent,
          submissionKey: crypto.randomUUID(),
          honeypot: (event.currentTarget.elements.namedItem("company_fax") as HTMLInputElement)?.value ?? "",
        }),
      });
      const data: { ok?: boolean; error?: string; submissionKey?: string; result?: RevenueScenarioResult } = await response.json();
      if (!response.ok || !data.ok || !data.result || !data.submissionKey) throw new Error(data.error || "The scenario could not be saved.");
      setSaved({ submissionKey: data.submissionKey, result: data.result });
    } catch (failure) {
      setError(failure instanceof Error ? failure.message : "Unable to save the scenario.");
    } finally { setBusy(false); }
  }

  return (
    <PublicShell>
      <PageHero eyebrow="Studio economics · Free tool" title={<>What could one more booking <span className="text-mint">per week</span> be worth?</>}
        description="Build a capacity-aware commercial scenario. We save your inputs only when you submit, then display your calculation. The figures are assumptions, not proof that your studio is losing money.">
        <SecondaryButton href="/studio-growth-check">Run the full Growth Check</SecondaryButton>
      </PageHero>
      <section className="border-y border-border bg-ink-deep px-6 py-12 md:py-20">
        <div className="mx-auto grid max-w-6xl gap-6 lg:grid-cols-[1.1fr_.9fr]">
          <form onSubmit={submit} className="space-y-5">
            <Card className="bg-ink p-6 md:p-8">
              <div className="mb-7 flex items-center gap-3"><Calculator className="h-7 w-7 text-mint" /><h2 className="font-display text-2xl font-black text-ice">Build your scenario</h2></div>
              <div className="space-y-7">
                {([
                  { key: "averageBookingValue", label: "Average booking value", suffix: "£", min: 50, max: 1000, step: 10 },
                  { key: "extraBookingsPerWeek", label: "Additional bookings you want each week", suffix: "", min: 0, max: 20, step: 1 },
                  { key: "availableExtraSlotsPerWeek", label: "Available extra appointment slots per week", suffix: "", min: 0, max: 20, step: 1 },
                  { key: "tradingWeeks", label: "Trading weeks per year", suffix: "", min: 1, max: 52, step: 1 },
                  { key: "contributionMarginPct", label: "Assumed contribution margin (after variable costs)", suffix: "%", min: 0, max: 100, step: 5 },
                ] as const).map(field => (
                  <div key={field.key}>
                    <div className="mb-3 flex justify-between gap-2 text-sm">
                      <label htmlFor={field.key} className="font-semibold text-ice">{field.label}</label>
                      <span className="shrink-0 font-bold text-mint">{field.suffix === "£" ? "£" + values[field.key] : values[field.key] + field.suffix}</span>
                    </div>
                    <input id={field.key} type="range" min={field.min} max={field.max} step={field.step} value={values[field.key]}
                      onChange={e => change(field.key, Number(e.target.value))} className="w-full accent-[#00E5D1]" />
                  </div>
                ))}
              </div>
            </Card>
            <Card className="bg-ink p-6 md:p-8">
              <h2 className="font-display text-xl font-black text-ice">Submit and save</h2>
              <p className="mt-2 text-sm text-muted-foreground">Your studio details help classify results. Submission does not create a verified profile or opt you into marketing.</p>
              <div className="mt-5 grid gap-4">
                <div><label htmlFor="studio-name" className="text-sm font-semibold text-ice">Studio name *</label><input id="studio-name" value={studioName} required minLength={2} maxLength={150} onChange={e => {setStudioName(e.target.value);setSaved(null)}} placeholder="Your studio" className="mt-2 w-full rounded-lg border border-border bg-ink-deep px-4 py-3 text-ice" /></div>
                <div><label htmlFor="studio-web" className="text-sm font-semibold text-ice">Website (optional)</label><input id="studio-web" value={studioWebsite} type="url" maxLength={240} onChange={e => {setStudioWebsite(e.target.value);setSaved(null)}} placeholder="https://yourstudio.co.uk" className="mt-2 w-full rounded-lg border border-border bg-ink-deep px-4 py-3 text-ice" /></div>
                <div><label htmlFor="studio-area" className="text-sm font-semibold text-ice">Town or area (optional)</label><input id="studio-area" value={area} maxLength={100} onChange={e => {setArea(e.target.value);setSaved(null)}} placeholder="Croydon, London" className="mt-2 w-full rounded-lg border border-border bg-ink-deep px-4 py-3 text-ice" /></div>
                <input name="company_fax" type="text" tabIndex={-1} autoComplete="off" aria-hidden="true" className="absolute -left-[9999px]" />
                <label className="flex items-start gap-3 text-sm text-muted-foreground"><input type="checkbox" checked={consent} onChange={e => {setConsent(e.target.checked);setSaved(null)}} required className="mt-1 accent-[#00E5D1]" /><span>I understand INKSIGHTS will store these submitted figures and the resulting illustrative scenario as unverified data, subject to the <a className="text-mint underline" href="/privacy">privacy policy</a>. This is not marketing consent.</span></label>
              </div>
              {error && <p role="alert" className="mt-4 rounded-lg border border-rose-600/30 bg-rose-900/20 p-3 text-sm text-rose-200">{error}</p>}
              <button type="submit" disabled={busy} className="mt-6 inline-flex w-full items-center justify-center gap-2 rounded-full bg-mint px-6 py-3.5 font-bold text-ink-deep disabled:opacity-50">{busy ? "Saving your scenario…" : "Submit and reveal my results"} <ArrowRight className="h-4 w-4" /></button>
            </Card>
          </form>
          <div aria-live="polite" className="lg:sticky lg:top-20 lg:self-start">
            <Card className="bg-ink p-6 md:p-8">
              <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-widest text-mint"><TrendingUp className="h-4 w-4" /> Commercial opportunity</div>
              {!saved ? (
                <div className="py-16 text-center">
                  <Database className="mx-auto mb-4 h-10 w-10 text-mint/70" />
                  <h2 className="font-display text-2xl font-black text-ice">Results locked until submission</h2>
                  <p className="mt-3 text-sm leading-relaxed text-muted-foreground">Enter your assumptions, acknowledge how the information is used and submit to save the scenario. No revenue results are calculated for display before a successful save.</p>
                </div>
              ) : (
                <div className="mt-7 space-y-5">
                  <div><p className="text-sm text-muted-foreground">Illustrative annual gross revenue uplift within available capacity</p><p className="mt-2 font-display text-4xl font-black text-mint">{money(saved.result.grossCapacityAdjustedGbp)}</p></div>
                  <div className="grid grid-cols-2 gap-3">
                    <div className="rounded-xl border border-border p-4"><p className="text-xs text-muted-foreground">Extra appointments/year</p><p className="mt-2 text-xl font-black text-ice">{saved.result.additionalBookingsPerYear}</p></div>
                    <div className="rounded-xl border border-border p-4"><p className="text-xs text-muted-foreground">Illustrative contribution</p><p className="mt-2 text-xl font-black text-ice">{money(saved.result.estimatedContributionGbp)}</p></div>
                  </div>
                  {saved.result.capacityLimited && <p className="rounded-xl border border-amber-700/40 bg-amber-900/10 p-4 text-sm text-amber-100">Capacity limits your scenario: the original unconstrained estimate was {money(saved.result.grossUnconstrainedGbp)}. More enquiries alone cannot achieve that amount without extra appointment capacity.</p>}
                  <p className="text-xs leading-relaxed text-muted-foreground">{saved.result.disclaimer}</p>
                  <div className="flex items-center gap-2 text-sm text-mint"><ShieldCheck className="h-4 w-4" /> Saved in INKSIGHTS as an unverified scenario</div>
                  <p className="break-all text-xs text-muted-foreground">Submission reference: {saved.submissionKey}</p>
                  <PrimaryButton href="/studio-growth-check">Run the full Studio Growth Check</PrimaryButton>
                </div>
              )}
            </Card>
          </div>
        </div>
      </section>
    </PublicShell>
  );
}
