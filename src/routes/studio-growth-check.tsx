import { createFileRoute, Link } from "@tanstack/react-router";
import { ArrowRight, CheckCircle2, ShieldCheck } from "lucide-react";
import { FormEvent, useState } from "react";

const AUDIT_URL = "/api/public/revenue-audit";

export const Route = createFileRoute("/studio-growth-check")({
  head: () => ({
    meta: [
      { title: "Free Revenue Audit V1 — INKSIGHTS" },
      {
        name: "description",
        content:
          "Get a first-pass estimate of the revenue your tattoo studio may be leaving on the table across capacity, enquiries, cancellations and repeat clients.",
      },
    ],
    links: [{ rel: "canonical", href: "https://getinksights.co.uk/studio-growth-check" }],
  }),
  component: RevenueAuditPage,
});

type Result = {
  estimate: { annual_low: number; annual_high: number; primary_opportunity: string; score: number };
  findings: Array<{ label: string; annual_low: number; annual_high: number }>;
  recommendations: string[];
  disclaimer: string;
};

const currency = (value: number) =>
  new Intl.NumberFormat("en-GB", { style: "currency", currency: "GBP", maximumFractionDigits: 0 }).format(value);

function RevenueAuditPage() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [result, setResult] = useState<Result | null>(null);

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError("");
    setLoading(true);
    setResult(null);

    const form = new FormData(event.currentTarget);
    const payload = {
      name: String(form.get("name") || ""),
      email: String(form.get("email") || ""),
      studio_name: String(form.get("studio_name") || ""),
      website: String(form.get("website") || ""),
      area: String(form.get("area") || ""),
      team_size: Number(form.get("team_size") || 0),
      monthly_revenue: Number(form.get("monthly_revenue") || 0),
      monthly_enquiries: Number(form.get("monthly_enquiries") || 0),
      monthly_bookings: Number(form.get("monthly_bookings") || 0),
      average_booking_value: Number(form.get("average_booking_value") || 0),
      monthly_available_hours: Number(form.get("monthly_available_hours") || 0),
      monthly_booked_hours: Number(form.get("monthly_booked_hours") || 0),
      repeat_client_rate: Number(form.get("repeat_client_rate") || 0),
      cancellation_rate: Number(form.get("cancellation_rate") || 0),
      no_show_rate: Number(form.get("no_show_rate") || 0),
      primary_problem: String(form.get("primary_problem") || ""),
      marketing_consent: form.get("marketing_consent") === "on",
      consent: form.get("consent") === "on",
      website_honeypot: String(form.get("website_honeypot") || ""),
    };

    try {
      const response = await fetch(AUDIT_URL, {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify(payload),
      });
      const data = await response.json();
      if (!response.ok || !data.ok) throw new Error(data.error || "The audit could not be generated.");
      setResult(data);
      window.setTimeout(() => document.getElementById("audit-result")?.scrollIntoView({ behavior: "smooth", block: "start" }), 50);
    } catch (err) {
      setError(err instanceof Error ? err.message : "The audit could not be generated. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="min-h-screen bg-ink-deep text-foreground">
      <header className="border-b border-border bg-ink-deep/90 backdrop-blur-xl">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-4">
          <Link to="/" className="text-xl font-black tracking-tight text-ice">
            INK<span className="text-mint">SIGHTS</span>
          </Link>
          <Link to="/" className="text-sm font-semibold text-muted-foreground hover:text-mint">Back to INKSIGHTS</Link>
        </div>
      </header>

      <section className="border-b border-border bg-ink">
        <div className="mx-auto max-w-5xl px-6 py-16 md:py-24">
          <div className="max-w-3xl">
            <div className="inline-flex items-center gap-2 rounded-full border border-mint/25 bg-mint/5 px-4 py-2 text-xs font-bold uppercase tracking-[0.16em] text-mint">
              <ShieldCheck className="h-4 w-4" /> Free Revenue Audit V1
            </div>
            <h1 className="mt-6 text-balance font-display text-4xl font-black leading-[.95] tracking-tight text-ice md:text-6xl">
              Estimate how much revenue your studio may be leaving on the table.
            </h1>
            <p className="mt-6 max-w-2xl text-lg leading-relaxed text-muted-foreground md:text-xl">
              Give us a few operating numbers and INKSIGHTS will calculate a first-pass opportunity estimate across unused capacity, unconverted enquiries, cancellations and repeat clients.
            </p>
            <div className="mt-6 flex flex-wrap gap-3 text-sm text-muted-foreground">
              {["Built for studios with 3+ artists", "Takes about 3 minutes", "Result shown immediately", "No payment required"].map((item) => <span key={item} className="rounded-full border border-border px-3 py-2">✓ {item}</span>)}
            </div>
          </div>
        </div>
      </section>

      <section className="mx-auto grid max-w-7xl gap-8 px-6 py-12 lg:grid-cols-[1fr_320px] lg:py-16">
        <form onSubmit={submit} className="rounded-3xl border border-border bg-ink p-6 md:p-9">
          <div className="space-y-10">
            <div>
              <p className="text-xs font-bold uppercase tracking-[0.16em] text-mint">01 · Studio</p>
              <h2 className="mt-2 font-display text-2xl font-black text-ice">Tell us about the studio.</h2>
              <div className="mt-5 grid gap-4 sm:grid-cols-2">
                <Field label="Studio name" name="studio_name" required />
                <Field label="Your name" name="name" required />
                <Field label="Email" name="email" type="email" required />
                <Field label="Website" name="website" placeholder="https://..." />
                <Field label="Town / city" name="area" />
                <Field label="Artists" name="team_size" type="number" min="3" max="100" placeholder="e.g. 5" required />
              </div>
            </div>
            <div>
              <p className="text-xs font-bold uppercase tracking-[0.16em] text-mint">02 · Economics</p>
              <h2 className="mt-2 font-display text-2xl font-black text-ice">Use your average month.</h2>
              <p className="mt-2 text-sm text-muted-foreground">Approximate figures are fine. The more accurate the inputs, the more useful the estimate.</p>
              <div className="mt-5 grid gap-4 sm:grid-cols-2">
                <Field label="Monthly studio revenue (£)" name="monthly_revenue" type="number" min="1" placeholder="30000" required />
                <Field label="Monthly enquiries" name="monthly_enquiries" type="number" min="1" placeholder="120" required />
                <Field label="Monthly bookings" name="monthly_bookings" type="number" min="1" placeholder="60" required />
                <Field label="Average booking value (£)" name="average_booking_value" type="number" min="1" placeholder="500" required />
                <Field label="Available artist hours / month" name="monthly_available_hours" type="number" min="1" placeholder="800" required />
                <Field label="Booked artist hours / month" name="monthly_booked_hours" type="number" min="1" placeholder="600" required />
              </div>
            </div>
            <div>
              <p className="text-xs font-bold uppercase tracking-[0.16em] text-mint">03 · Leakage</p>
              <h2 className="mt-2 font-display text-2xl font-black text-ice">Where might money be escaping?</h2>
              <div className="mt-5 grid gap-4 sm:grid-cols-2">
                <Field label="Repeat-client rate (%)" name="repeat_client_rate" type="number" min="0" max="100" placeholder="35" required />
                <Field label="Cancellation rate (%)" name="cancellation_rate" type="number" min="0" max="100" placeholder="5" required />
                <Field label="No-show rate (%)" name="no_show_rate" type="number" min="0" max="100" placeholder="2" required />
                <label className="text-sm font-semibold text-ice">Biggest concern<select name="primary_problem" className="mt-2 w-full rounded-xl border border-border bg-ink-deep px-4 py-3 font-normal text-ice"><option value="capacity">Empty / underused artist time</option><option value="conversion">Enquiries not becoming bookings</option><option value="cancellation">Cancellations / no-shows</option><option value="retention">Clients not returning</option><option value="pricing">Pricing / average booking value</option><option value="unknown">I'm not sure</option></select></label>
              </div>
            </div>
            <div>
              <p className="text-xs font-bold uppercase tracking-[0.16em] text-mint">04 · Get the result</p>
              <div className="mt-5 rounded-2xl border border-mint/20 bg-mint/5 p-5"><div className="flex gap-3"><CheckCircle2 className="mt-0.5 h-5 w-5 shrink-0 text-mint" /><p className="text-sm leading-relaxed text-muted-foreground">Your result is generated from the figures you provide. We will clearly distinguish an estimate from verified studio data.</p></div></div>
              <div className="absolute left-[-10000px] top-auto h-px w-px overflow-hidden"><input name="website_honeypot" tabIndex={-1} autoComplete="off" /></div>
              <label className="mt-5 flex gap-3 text-sm text-muted-foreground"><input className="mt-1" type="checkbox" name="consent" required /><span>I agree to INKSIGHTS using these details to generate and follow up this Revenue Audit. <b className="text-mint">Required.</b></span></label>
              <label className="mt-3 flex gap-3 text-sm text-muted-foreground"><input className="mt-1" type="checkbox" name="marketing_consent" /><span>Send me occasional INKSIGHTS growth insights.</span></label>
              <button disabled={loading} className="mt-6 inline-flex min-h-12 items-center gap-2 rounded-full bg-mint px-6 py-3 font-bold text-ink-deep transition hover:bg-mint-soft disabled:cursor-wait disabled:opacity-60" type="submit">{loading ? "Calculating…" : "Generate My Revenue Audit"} <ArrowRight className="h-4 w-4" /></button>
              {error && <p className="mt-4 text-sm font-semibold text-red-300">{error}</p>}
            </div>
          </div>
        </form>
        <aside className="h-max rounded-3xl border border-border bg-ink p-6 lg:sticky lg:top-24"><p className="text-xs font-bold uppercase tracking-[0.16em] text-mint">What you receive</p><h2 className="mt-2 font-display text-2xl font-black text-ice">A commercial starting point.</h2><ul className="mt-5 space-y-4 text-sm leading-relaxed text-muted-foreground"><li>01 — Estimated annual opportunity range</li><li>02 — Largest potential leakage area</li><li>03 — Breakdown across four revenue levers</li><li>04 — Three practical next actions</li><li>05 — Clear boundary between estimates and verified data</li></ul><div className="mt-6 rounded-2xl border border-border bg-ink-deep p-4 text-xs leading-relaxed text-muted-foreground"><b className="text-ice">Important:</b> V1 is a lead-generation diagnostic, not a financial audit. The paid/full INKSIGHTS service will use actual booking, client and revenue data to replace estimates with observed results.</div></aside>
      </section>
      {result && <section id="audit-result" className="border-t border-border bg-ink"><div className="mx-auto max-w-7xl px-6 py-14 md:py-20"><div className="max-w-4xl"><p className="text-xs font-bold uppercase tracking-[0.16em] text-mint">Your Revenue Audit V1</p><h2 className="mt-3 font-display text-4xl font-black tracking-tight text-ice md:text-6xl">Estimated opportunity: <span className="text-mint">{currency(result.estimate.annual_low)}–{currency(result.estimate.annual_high)}</span> / year</h2><p className="mt-4 text-lg leading-relaxed text-muted-foreground">The largest estimated opportunity in your inputs is <b className="text-ice">{result.estimate.primary_opportunity}</b>.</p></div><div className="mt-10 grid gap-4 md:grid-cols-2 xl:grid-cols-4">{result.findings.map((finding) => <div key={finding.label} className="rounded-2xl border border-border bg-ink-deep p-5"><p className="text-sm font-bold text-ice">{finding.label}</p><p className="mt-3 font-display text-2xl font-black text-mint">{currency(finding.annual_low)}–{currency(finding.annual_high)}</p><p className="mt-1 text-xs text-muted-foreground">estimated annual opportunity</p></div>)}</div><div className="mt-8 grid gap-6 lg:grid-cols-[1fr_.8fr]"><div className="rounded-2xl border border-border bg-ink-deep p-6"><p className="text-xs font-bold uppercase tracking-[0.16em] text-mint">What to do next</p><ol className="mt-5 space-y-4">{result.recommendations.map((item, i) => <li key={item} className="flex gap-4 text-sm leading-relaxed text-muted-foreground"><span className="font-mono text-mint">0{i + 1}</span><span>{item}</span></li>)}</ol></div><div className="rounded-2xl border border-mint/20 bg-mint/5 p-6"><p className="text-xs font-bold uppercase tracking-[0.16em] text-mint">Next step</p><h3 className="mt-2 font-display text-2xl font-black text-ice">Want the estimate replaced with real data?</h3><p className="mt-3 text-sm leading-relaxed text-muted-foreground">The next version connects or imports your studio data and identifies actual revenue leakage rather than relying on assumptions.</p><a href="mailto:hello@getinksights.co.uk?subject=Revenue%20Audit%20V1%20follow-up" className="mt-5 inline-flex items-center gap-2 rounded-full bg-mint px-5 py-3 text-sm font-bold text-ink-deep">Discuss the full audit <ArrowRight className="h-4 w-4" /></a></div></div><p className="mt-8 max-w-3xl text-xs leading-relaxed text-muted-foreground">{result.disclaimer}</p></div></section>}
    </main>
  );
}
function Field({ label, name, type = "text", placeholder, required, min, max }: { label: string; name: string; type?: string; placeholder?: string; required?: boolean; min?: string; max?: string }) { return <label className="text-sm font-semibold text-ice">{label}{required && <span className="ml-1 text-mint">*</span>}<input className="mt-2 w-full rounded-xl border border-border bg-ink-deep px-4 py-3 font-normal text-ice outline-none transition focus:border-mint" name={name} type={type} placeholder={placeholder} required={required} min={min} max={max} /></label>; }
