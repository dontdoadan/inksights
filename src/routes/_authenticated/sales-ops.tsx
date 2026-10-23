import { createFileRoute, Link } from "@tanstack/react-router";
import { useCallback, useEffect, useMemo, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Logo } from "@/components/public-site";

type Row = {
  week_start_uk: string;
  qualified_studios_added: number;
  accounts_approached: number;
  positive_qualified_engagements: number;
  positive_engagement_rate_period: number | null;
  discovery_calls_completed: number;
  qualified_conversations: number;
  verified_audit_purchases: number;
  verified_audit_revenue_pence: number;
  direct_revenue_pence: number;
  assisted_revenue_pence: number;
  unattributed_revenue_pence: number;
  direct_purchases: number;
  assisted_purchases: number;
  unattributed_purchases: number;
  total_acquisition_spend_pence: number | null;
  acquisition_cost_per_paying_studio_pence: number | null;
  measured_delivery_hours: number | null;
  delivery_cost_pence: number | null;
  provisional_contribution_pence: number | null;
  monitoring_cohort_retention_rate: number | null;
};

type Segment = "all" | "direct" | "assisted" | "unknown";
type Payload = { weeks: Row[]; source: string; coverage: string; metric_version: string };

const money = (minor: number | null | undefined) =>
  minor == null ? "Not measurable" : new Intl.NumberFormat("en-GB", {
    style: "currency", currency: "GBP", maximumFractionDigits: 0,
  }).format(minor / 100);
const integer = (n: number | null | undefined) => n == null ? "—" : new Intl.NumberFormat("en-GB").format(n);
const percent = (n: number | null | undefined) => n == null ? "Not measurable" : `${(n * 100).toFixed(1)}%`;
const date = (s: string) => new Date(`${s}T12:00:00Z`).toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric" });

export const Route = createFileRoute("/_authenticated/sales-ops")({
  component: SalesOperatingSystem,
  head: () => ({ meta: [{ title: "Sales Operating System — INKSIGHTS" }] }),
});

function SalesOperatingSystem() {
  const [payload, setPayload] = useState<Payload | null>(null);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);
  const [segment, setSegment] = useState<Segment>("all");
  const [week, setWeek] = useState("");
  const load = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      const session = (await supabase.auth.getSession()).data.session;
      if (!session) throw new Error("Please sign in again.");
      const response = await fetch("/api/internal/sales-ops-weekly", {
        headers: { authorization: `Bearer ${session.access_token}` },
        cache: "no-store",
      });
      if (!response.ok) {
        if (response.status === 403) throw new Error("Founder or administrator access is required.");
        if (response.status === 503) throw new Error("The sales database migration or reconciled source data is not ready.");
        throw new Error("The sales dashboard is unavailable.");
      }
      const result = await response.json() as Payload;
      if (!Array.isArray(result.weeks)) throw new Error("The service returned an invalid scorecard.");
      setPayload(result);
      setWeek((current) => current || result.weeks[0]?.week_start_uk || "");
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : "Sales data unavailable.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { void load(); }, [load]);
  const rows = payload?.weeks ?? [];
  const active = useMemo(() => rows.find((r) => r.week_start_uk === week) ?? rows[0], [rows, week]);
  const grouped = active ? {
    all: { purchases: active.verified_audit_purchases, amount: active.verified_audit_revenue_pence },
    direct: { purchases: active.direct_purchases, amount: active.direct_revenue_pence },
    assisted: { purchases: active.assisted_purchases, amount: active.assisted_revenue_pence },
    unknown: { purchases: active.unattributed_purchases, amount: active.unattributed_revenue_pence },
  } : null;
  const selected = grouped?.[segment];

  return <div className="min-h-screen bg-ink-deep text-foreground">
    <header className="border-b border-border/50 bg-ink-deep/90">
      <div className="mx-auto max-w-7xl px-5 py-5 flex flex-wrap items-center justify-between gap-4">
        <Link to="/" className="flex items-center"><Logo /></Link>
        <div className="flex gap-4 items-center text-sm">
          <Link to="/dashboard" className="text-muted-foreground hover:text-mint">Studio Dashboard</Link>
          <span className="text-mint font-semibold">Sales Intelligence</span>
        </div>
      </div>
    </header>
    <main className="max-w-7xl mx-auto px-5 py-10 space-y-8">
      <div className="flex flex-wrap gap-5 items-end justify-between">
        <div>
          <p className="uppercase tracking-[0.22em] text-xs text-mint font-semibold">Internal / Commercial intelligence</p>
          <h1 className="font-display font-black text-3xl md:text-5xl mt-3">Sales Operating System</h1>
          <p className="mt-3 text-muted-foreground max-w-2xl text-sm leading-relaxed">
            Reconciled studio acquisition, verified payment and delivery. All financial amounts use GBP actually collected, not proposal values.
          </p>
        </div>
        <button onClick={() => void load()} disabled={loading}
          className="rounded-full border border-border px-5 py-2.5 text-sm font-semibold hover:text-mint disabled:opacity-50">
          {loading ? "Checking sources…" : "Refresh sources"}
        </button>
      </div>
      {error && <section role="alert" className="rounded-2xl border border-border bg-ink-elev/50 p-6">
        <p className="text-sm font-semibold">Data access or reconciliation is not ready</p>
        <p className="mt-2 text-sm text-muted-foreground">{error}</p>
      </section>}
      {!error && !loading && rows.length === 0 && <p className="text-muted-foreground">No reconciled reporting periods are available yet.</p>}
      {active && <div className="space-y-8">
        <div className="flex flex-wrap gap-3 items-center justify-between">
          <div className="flex items-center gap-3">
            <label htmlFor="sales-week-select" className="text-sm text-muted-foreground">Week beginning</label>
            <select id="sales-week-select" value={week} onChange={e => setWeek(e.target.value)}
              className="rounded-xl bg-ink-elev border border-border p-2.5 text-sm text-foreground">
              {rows.map(r => <option key={r.week_start_uk} value={r.week_start_uk}>{date(r.week_start_uk)}</option>)}
            </select>
          </div>
          <div className="flex flex-wrap gap-2" role="group" aria-label="Acquisition path">
            {(["all","direct","assisted","unknown"] as const).map(value =>
              <button key={value} onClick={() => setSegment(value)} aria-pressed={segment === value}
                className={`rounded-full px-4 py-2 text-sm border transition-colors ${segment===value ? "border-mint bg-mint/15 text-mint" : "border-border text-muted-foreground hover:border-mint"}`}>
                {value === "all" ? "All paths" : value === "unknown" ? "Unattributed" : value[0].toUpperCase()+value.slice(1)}
              </button>)}
          </div>
        </div>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <Stat label="Verified audit revenue" value={money(selected?.amount)} note="Payment verified, linked to studio" />
          <Stat label="Paid audit purchases" value={integer(selected?.purchases)} note={segment === "all" ? "All acquisition paths" : `${segment} purchases`} />
          <Stat label="Qualified studios added" value={integer(active.qualified_studios_added)} note="Research qualification events" />
          <Stat label="Accounts approached" value={integer(active.accounts_approached)} note="Contact-permitted outreach activity" />
        </div>
        <div className="grid gap-5 lg:grid-cols-2">
          <section className="rounded-2xl bg-ink-elev/35 border border-border/60 p-6">
            <h2 className="font-display font-bold text-xl">Sales performance</h2>
            <dl className="divide-y divide-border/40 mt-4">
              <Metric name="Positive qualified engagement rate" value={percent(active.positive_engagement_rate_period)} />
              <Metric name="Discovery calls completed" value={integer(active.discovery_calls_completed)} />
              <Metric name="Qualified conversations" value={integer(active.qualified_conversations)} />
              <Metric name="Unattributed purchases" value={integer(active.unattributed_purchases)} />
            </dl>
            <p className="text-xs text-muted-foreground mt-5">Same-week activity is not a buyer-cohort conversion rate. Qualified sales cohorts need separately matched opportunities.</p>
          </section>
          <section className="rounded-2xl bg-ink-elev/35 border border-border/60 p-6">
            <h2 className="font-display font-bold text-xl">Unit economics & delivery</h2>
            <dl className="divide-y divide-border/40 mt-4">
              <Metric name="Acquisition spend" value={money(active.total_acquisition_spend_pence)} />
              <Metric name="Acquisition cost / paying studio" value={money(active.acquisition_cost_per_paying_studio_pence)} />
              <Metric name="Measured delivery hours" value={active.measured_delivery_hours == null ? "Not measured" : String(active.measured_delivery_hours)} />
              <Metric name="Provisional delivery contribution" value={money(active.provisional_contribution_pence)} />
              <Metric name="Monitoring retention" value={percent(active.monitoring_cohort_retention_rate)} />
            </dl>
          </section>
        </div>
        <section className="rounded-2xl border border-border/60 overflow-hidden">
          <div className="px-6 py-5 border-b border-border/50">
            <h2 className="font-display font-bold text-xl">12-week revenue register</h2>
            <p className="text-xs text-muted-foreground mt-1">Source-verified, studio-linked audit purchases; all three acquisition classifications remain visible.</p>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full min-w-[700px] text-sm">
              <thead className="bg-ink-elev/40 text-muted-foreground">
                <tr><th className="text-left p-4">Week</th><th className="text-right p-4">Direct</th><th className="text-right p-4">Assisted</th><th className="text-right p-4">Unattributed</th><th className="text-right p-4">Verified total</th></tr>
              </thead>
              <tbody>{rows.map(row => <tr key={row.week_start_uk} className="border-t border-border/40">
                <td className="p-4">{date(row.week_start_uk)}</td>
                <td className="p-4 text-right">{money(row.direct_revenue_pence)}</td>
                <td className="p-4 text-right">{money(row.assisted_revenue_pence)}</td>
                <td className="p-4 text-right">{money(row.unattributed_revenue_pence)}</td>
                <td className="p-4 text-right font-semibold text-mint">{money(row.verified_audit_revenue_pence)}</td>
              </tr>)}</tbody>
            </table>
          </div>
        </section>
        <p className="text-xs text-muted-foreground">
          Data contract: {payload?.metric_version} · {payload?.source}. Unlinked Stripe purchases, unfinished report deliveries and unknown costs remain outside verified commercial KPIs. No synthetic/test results are included.
        </p>
      </div>}
    </main>
  </div>;
}

function Stat({label,value,note}:{label:string;value:string;note:string}) {
  return <div className="rounded-2xl bg-ink-elev/35 border border-border/60 p-5 min-w-0">
    <p className="text-xs tracking-wide text-muted-foreground">{label}</p>
    <p className="font-display font-black text-2xl md:text-3xl mt-3 break-words">{value}</p>
    <p className="text-xs text-muted-foreground mt-2">{note}</p>
  </div>;
}
function Metric({name,value}:{name:string;value:string}) {
  return <div className="flex justify-between gap-3 items-center py-3">
    <dt className="text-sm text-muted-foreground">{name}</dt>
    <dd className="font-semibold text-sm text-right">{value}</dd>
  </div>;
}
