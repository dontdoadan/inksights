import { Logo } from "@/components/public-site";
import { createFounderAction, loadFounderSnapshot, updateFounderAction, updateFounderPriority } from "@/features/os/queries";
import type {
  CommercialMetric,
  FounderAction,
  FounderPriority,
  FounderRisk,
  FounderSnapshot,
} from "@/features/os/types";
import { createFileRoute, Link } from "@tanstack/react-router";
import {
  Activity,
  AlertTriangle,
  ArrowRight,
  BadgePoundSterling,
  CheckCircle2,
  CircleDot,
  Database,
  FileCheck2,
  Gauge,
  Plus,
  RefreshCw,
  RotateCcw,
  ShieldCheck,
  Target,
} from "lucide-react";
import { useCallback, useEffect, useMemo, useState } from "react";

export const Route = createFileRoute("/_authenticated/os")({
  component: InksightsOS,
  head: () => ({
    meta: [
      { title: "INKSIGHTS OS — Founder Command Centre" },
      {
        name: "description",
        content: "Private INKSIGHTS founder operating command centre.",
      },
    ],
  }),
});

function InksightsOS() {
  const [snapshot, setSnapshot] = useState<FounderSnapshot | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [mutationKey, setMutationKey] = useState("");
  const [showAddAction, setShowAddAction] = useState(false);
  const [newActionTitle, setNewActionTitle] = useState("");
  const [newActionOwner, setNewActionOwner] = useState("Founder");
  const [newActionDeadline, setNewActionDeadline] = useState("");

  const load = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      setSnapshot(await loadFounderSnapshot());
    } catch (nextError) {
      setError(nextError instanceof Error ? nextError.message : "Unable to load INKSIGHTS OS.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void load();
  }, [load]);

  const brief = snapshot?.brief ?? null;
  const cycleOverdue = useMemo(() => {
    if (!brief?.period_end) return false;
    return new Date(`${brief.period_end}T23:59:59Z`).getTime() < Date.now();
  }, [brief?.period_end]);

  const changeActionStatus = useCallback(async (action: FounderAction, status: "open" | "in_progress" | "done") => {
    setMutationKey(action.action_key);
    setError("");
    try {
      await updateFounderAction(action.action_key, status);
      await load();
    } catch (nextError) {
      setError(nextError instanceof Error ? nextError.message : "Unable to update action.");
    } finally {
      setMutationKey("");
    }
  }, [load]);

  const changePriorityStatus = useCallback(async (priority: FounderPriority, status: "active" | "done") => {
    setMutationKey(priority.priority_key);
    setError("");
    try {
      await updateFounderPriority(priority.priority_key, status);
      await load();
    } catch (nextError) {
      setError(nextError instanceof Error ? nextError.message : "Unable to update priority.");
    } finally {
      setMutationKey("");
    }
  }, [load]);

  const addAction = useCallback(async (event: React.FormEvent) => {
    event.preventDefault();
    const title = newActionTitle.trim();
    if (title.length < 3) return;
    setMutationKey("new-action");
    setError("");
    try {
      await createFounderAction({
        title,
        owner: newActionOwner.trim() || "Founder",
        deadline: newActionDeadline || null,
      });
      setNewActionTitle("");
      setNewActionDeadline("");
      setShowAddAction(false);
      await load();
    } catch (nextError) {
      setError(nextError instanceof Error ? nextError.message : "Unable to create action.");
    } finally {
      setMutationKey("");
    }
  }, [load, newActionDeadline, newActionOwner, newActionTitle]);

  return (
    <div className="min-h-screen bg-ink-deep text-foreground">
      <header className="sticky top-0 z-40 border-b border-border/50 bg-ink-deep/88 backdrop-blur-xl">
        <div className="mx-auto flex max-w-[1500px] items-center justify-between gap-5 px-5 py-4 md:px-8">
          <div className="flex items-center gap-4">
            <Link to="/" aria-label="INKSIGHTS home">
              <Logo />
            </Link>
            <div className="hidden h-8 w-px bg-border/70 sm:block" />
            <div>
              <p className="text-[10px] font-black uppercase tracking-[0.22em] text-mint">INKSIGHTS OS</p>
              <p className="text-sm font-semibold text-ice">Founder Command Centre</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            {snapshot ? (
              <span className="hidden rounded-full border border-mint/20 bg-mint/[0.06] px-3 py-1.5 text-[11px] font-bold uppercase tracking-[0.14em] text-mint sm:inline-flex">
                {snapshot.admin_role}
              </span>
            ) : null}
            <button
              type="button"
              onClick={() => void load()}
              disabled={loading}
              className="inline-flex items-center gap-2 rounded-full border border-border px-3.5 py-2 text-xs font-bold text-muted-foreground transition hover:border-mint/40 hover:text-mint disabled:opacity-50"
            >
              <RefreshCw className={`h-3.5 w-3.5 ${loading ? "animate-spin" : ""}`} />
              Refresh
            </button>
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-[1500px] space-y-7 px-5 py-8 md:px-8 md:py-10">
        {error ? (
          <div className="rounded-2xl border border-red-400/30 bg-red-400/[0.05] p-5 text-sm text-red-100">
            <p className="font-bold">INKSIGHTS OS could not load.</p>
            <p className="mt-1 text-red-200/80">{error}</p>
          </div>
        ) : null}

        <section className="grid gap-5 xl:grid-cols-[minmax(0,1fr)_360px]">
          <div className="rounded-[28px] border border-border/70 bg-ink p-6 md:p-8">
            <div className="flex flex-wrap items-start justify-between gap-5">
              <div className="max-w-4xl">
                <div className="flex flex-wrap items-center gap-2">
                  <span className="rounded-full border border-mint/20 bg-mint/[0.06] px-3 py-1 text-[10px] font-black uppercase tracking-[0.18em] text-mint">
                    P0 operating outcome
                  </span>
                  {brief ? (
                    <span
                      className={`rounded-full border px-3 py-1 text-[10px] font-bold uppercase tracking-[0.14em] ${
                        cycleOverdue
                          ? "border-amber-300/25 bg-amber-300/[0.05] text-amber-200"
                          : "border-border text-muted-foreground"
                      }`}
                    >
                      {cycleOverdue ? "Cycle review due" : "Active cycle"}
                    </span>
                  ) : null}
                </div>
                <h1 className="mt-5 font-display text-3xl font-black leading-tight text-ice md:text-5xl">
                  {brief?.company_outcome ?? (loading ? "Loading founder operating state…" : "No active founder cycle")}
                </h1>
                {brief?.success_measure ? (
                  <p className="mt-5 max-w-4xl text-sm leading-7 text-muted-foreground md:text-base">
                    <span className="font-bold text-ice">Definition of done:</span> {brief.success_measure}
                  </p>
                ) : null}
              </div>
              {brief ? (
                <div className="text-right text-xs text-muted-foreground">
                  <p className="font-bold text-ice">Operating cycle</p>
                  <p className="mt-1">{dateRange(brief.period_start, brief.period_end)}</p>
                </div>
              ) : null}
            </div>
          </div>

          <div className="rounded-[28px] border border-border/70 bg-ink p-6">
            <p className="text-[10px] font-black uppercase tracking-[0.2em] text-mint">Open operating surfaces</p>
            <div className="mt-5 space-y-2">
              <QuickLink to="/audits" label="Studio Intelligence Audits" icon={<FileCheck2 className="h-4 w-4" />} />
              <QuickLink to="/workspace" label="Intelligence Workspace" icon={<Database className="h-4 w-4" />} />
              <QuickLink to="/dashboard" label="Account Dashboard" icon={<Gauge className="h-4 w-4" />} />
            </div>
            <div className="mt-6 border-t border-border/60 pt-5">
              <p className="text-xs leading-6 text-muted-foreground">
                This surface projects canonical operating state. HubSpot remains CRM truth; Stripe remains payment truth; Supabase remains product and operating-state truth.
              </p>
            </div>
          </div>
        </section>

        <section className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
          <CountCard label="Canonical studios" value={snapshot?.counts.studios ?? null} icon={<Database className="h-4 w-4" />} />
          <CountCard label="Visibility registry" value={snapshot?.counts.visibility_studios ?? null} icon={<Activity className="h-4 w-4" />} />
          <CountCard label="Audit runs" value={snapshot?.counts.audits ?? null} icon={<FileCheck2 className="h-4 w-4" />} />
          <CountCard label="Paid orders" value={snapshot?.counts.paid_orders ?? null} icon={<BadgePoundSterling className="h-4 w-4" />} />
        </section>

        {brief?.commercial_health?.length ? (
          <section>
            <SectionHeading eyebrow="Commercial health" title="Founder KPIs" />
            <div className="mt-4 grid gap-3 sm:grid-cols-2 xl:grid-cols-5">
              {brief.commercial_health.map((metric) => (
                <MetricCard key={metric.metric_key} metric={metric} />
              ))}
            </div>
          </section>
        ) : null}

        <section className="grid gap-6 xl:grid-cols-[minmax(0,1.4fr)_minmax(360px,0.6fr)]">
          <div className="space-y-6">
            <div>
              <SectionHeading eyebrow="Execution" title="Three priorities" />
              <div className="mt-4 space-y-3">
                {(brief?.priorities ?? []).map((priority) => (
                  <PriorityCard
                    key={priority.priority_key}
                    priority={priority}
                    busy={mutationKey === priority.priority_key}
                    onStatusChange={(status) => void changePriorityStatus(priority, status)}
                  />
                ))}
                {!loading && !(brief?.priorities?.length) ? <EmptyState text="No active priorities." /> : null}
              </div>
            </div>

            <div>
              <div className="flex items-end justify-between gap-4">
                <SectionHeading eyebrow="Operating queue" title="What needs action" />
                <button
                  type="button"
                  onClick={() => setShowAddAction((value) => !value)}
                  className="inline-flex items-center gap-2 rounded-full border border-mint/25 bg-mint/[0.05] px-3.5 py-2 text-xs font-bold text-mint hover:bg-mint/[0.09]"
                >
                  <Plus className="h-3.5 w-3.5" /> Add action
                </button>
              </div>

              {showAddAction ? (
                <form onSubmit={(event) => void addAction(event)} className="mt-4 grid gap-3 rounded-[24px] border border-mint/20 bg-mint/[0.03] p-4 md:grid-cols-[minmax(0,1fr)_180px_170px_auto]">
                  <input
                    value={newActionTitle}
                    onChange={(event) => setNewActionTitle(event.target.value)}
                    placeholder="Next action"
                    className="rounded-xl border border-border bg-ink-deep px-3 py-2.5 text-sm text-ice outline-none focus:border-mint/50"
                    required
                    minLength={3}
                  />
                  <input
                    value={newActionOwner}
                    onChange={(event) => setNewActionOwner(event.target.value)}
                    placeholder="Owner"
                    className="rounded-xl border border-border bg-ink-deep px-3 py-2.5 text-sm text-ice outline-none focus:border-mint/50"
                  />
                  <input
                    type="datetime-local"
                    value={newActionDeadline}
                    onChange={(event) => setNewActionDeadline(event.target.value)}
                    className="rounded-xl border border-border bg-ink-deep px-3 py-2.5 text-sm text-ice outline-none focus:border-mint/50"
                  />
                  <button
                    type="submit"
                    disabled={mutationKey === "new-action"}
                    className="rounded-xl bg-mint px-4 py-2.5 text-sm font-black text-ink-deep disabled:opacity-50"
                  >
                    {mutationKey === "new-action" ? "Saving…" : "Create"}
                  </button>
                </form>
              ) : null}

              <div className="mt-4 overflow-hidden rounded-[24px] border border-border/70 bg-ink">
                {(brief?.execution_queue ?? []).map((action, index) => (
                  <ActionRow
                    key={action.action_key}
                    action={action}
                    last={index === (brief?.execution_queue?.length ?? 0) - 1}
                    busy={mutationKey === action.action_key}
                    onStatusChange={(status) => void changeActionStatus(action, status)}
                  />
                ))}
                {!loading && !(brief?.execution_queue?.length) ? <EmptyState text="Execution queue is clear." /> : null}
              </div>
            </div>
          </div>

          <div className="space-y-6">
            <div>
              <SectionHeading eyebrow="Risk" title="Active risks" />
              <div className="mt-4 space-y-3">
                {(brief?.risks ?? []).map((risk) => (
                  <RiskCard key={risk.risk_key} risk={risk} />
                ))}
                {!loading && !(brief?.risks?.length) ? <EmptyState text="No active risks." /> : null}
              </div>
            </div>

            <div>
              <SectionHeading eyebrow="Delivery" title="Latest audits" />
              <div className="mt-4 overflow-hidden rounded-[24px] border border-border/70 bg-ink">
                {(snapshot?.latest_audits ?? []).map((audit, index) => (
                  <Link
                    key={audit.id}
                    to="/audits/$auditId"
                    params={{ auditId: audit.id }}
                    className={`flex items-center justify-between gap-4 p-4 transition hover:bg-mint/[0.03] ${
                      index === (snapshot?.latest_audits.length ?? 0) - 1 ? "" : "border-b border-border/50"
                    }`}
                  >
                    <div className="min-w-0">
                      <p className="truncate text-sm font-bold text-ice">{audit.studio_name}</p>
                      <p className="mt-1 text-xs text-muted-foreground">{audit.status} · QA {audit.qa_status}</p>
                    </div>
                    <span className="shrink-0 text-xs font-bold text-mint">{audit.report_status}</span>
                  </Link>
                ))}
                {!loading && !(snapshot?.latest_audits?.length) ? <EmptyState text="No audit runs yet." /> : null}
              </div>
            </div>
          </div>
        </section>

        <section className="grid gap-6 xl:grid-cols-2">
          <div>
            <SectionHeading eyebrow="Evidence control" title="Evidence gaps" />
            <div className="mt-4 space-y-3">
              {(brief?.evidence_gaps ?? []).map((item) => (
                <article key={item.evidence_key} className="rounded-[24px] border border-border/70 bg-ink p-5">
                  <div className="flex items-center justify-between gap-3">
                    <p className="font-bold text-ice">{item.title}</p>
                    <span className="rounded-full border border-border px-2.5 py-1 text-[10px] font-bold uppercase tracking-[0.12em] text-muted-foreground">
                      {item.classification}
                    </span>
                  </div>
                  <p className="mt-3 text-sm leading-6 text-muted-foreground">{item.statement}</p>
                </article>
              ))}
              {!loading && !(brief?.evidence_gaps?.length) ? <EmptyState text="No evidence gaps recorded." /> : null}
            </div>
          </div>

          <div>
            <SectionHeading eyebrow="Scope control" title="Parked ideas" />
            <div className="mt-4 space-y-3">
              {(brief?.parked_ideas ?? []).map((idea) => (
                <article key={idea.idea_key} className="rounded-[24px] border border-border/70 bg-ink p-5">
                  <p className="font-bold text-ice">{idea.title}</p>
                  <p className="mt-3 text-sm leading-6 text-muted-foreground">{idea.description}</p>
                  {idea.revisit_at ? (
                    <p className="mt-4 text-xs font-semibold text-mint">Revisit {dateLabel(idea.revisit_at)}</p>
                  ) : null}
                </article>
              ))}
              {!loading && !(brief?.parked_ideas?.length) ? <EmptyState text="No parked ideas." /> : null}
            </div>
          </div>
        </section>

        {snapshot ? (
          <p className="pb-3 text-right text-[11px] text-muted-foreground">
            Live founder snapshot refreshed {new Date(snapshot.generated_at).toLocaleString("en-GB")}
          </p>
        ) : null}
      </main>
    </div>
  );
}

function SectionHeading({ eyebrow, title }: { eyebrow: string; title: string }) {
  return (
    <div>
      <p className="text-[10px] font-black uppercase tracking-[0.2em] text-mint">{eyebrow}</p>
      <h2 className="mt-1.5 font-display text-2xl font-black text-ice">{title}</h2>
    </div>
  );
}

function QuickLink({ to, label, icon }: { to: "/audits" | "/workspace" | "/dashboard"; label: string; icon: React.ReactNode }) {
  return (
    <Link
      to={to}
      className="flex items-center justify-between gap-3 rounded-2xl border border-border/60 bg-ink-deep px-4 py-3 text-sm font-bold text-ice transition hover:border-mint/40 hover:text-mint"
    >
      <span className="flex items-center gap-3">{icon}{label}</span>
      <ArrowRight className="h-4 w-4" />
    </Link>
  );
}

function CountCard({ label, value, icon }: { label: string; value: number | null; icon: React.ReactNode }) {
  return (
    <div className="rounded-[22px] border border-border/70 bg-ink p-5">
      <div className="flex items-center justify-between gap-4 text-muted-foreground">
        <p className="text-xs font-bold uppercase tracking-[0.12em]">{label}</p>
        <span className="text-mint">{icon}</span>
      </div>
      <p className="mt-4 font-display text-3xl font-black text-ice">{value === null ? "—" : value.toLocaleString("en-GB")}</p>
    </div>
  );
}

function MetricCard({ metric }: { metric: CommercialMetric }) {
  return (
    <div className="rounded-[22px] border border-border/70 bg-ink p-5">
      <div className="flex items-center justify-between gap-2">
        <p className="text-xs font-bold text-muted-foreground">{metric.name}</p>
        {metric.classification ? (
          <span className="text-[9px] font-bold uppercase tracking-[0.12em] text-mint">{metric.classification}</span>
        ) : null}
      </div>
      <p className="mt-3 font-display text-2xl font-black text-ice">{formatMetric(metric)}</p>
      <p className="mt-2 text-[11px] text-muted-foreground">
        {metric.measured_at ? `Measured ${dateLabel(metric.measured_at)}` : "Unmeasured"}
      </p>
    </div>
  );
}

function PriorityCard({
  priority,
  busy,
  onStatusChange,
}: {
  priority: FounderPriority;
  busy: boolean;
  onStatusChange: (status: "active" | "done") => void;
}) {
  return (
    <article className="rounded-[24px] border border-border/70 bg-ink p-5 md:p-6">
      <div className="flex items-start gap-4">
        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full border border-mint/30 bg-mint/[0.06] font-display text-sm font-black text-mint">
          {priority.rank}
        </div>
        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-start justify-between gap-3">
            <div>
              <h3 className="font-display text-lg font-black text-ice md:text-xl">{priority.title}</h3>
              <p className="mt-1 text-xs text-muted-foreground">{priority.owner}{priority.deadline ? ` · Due ${dateLabel(priority.deadline)}` : ""}</p>
            </div>
            <StatusPill status={priority.status} />
          </div>
          <p className="mt-4 text-sm leading-6 text-muted-foreground">{priority.outcome}</p>
          <div className="mt-5 rounded-2xl border border-border/60 bg-ink-deep p-4">
            <p className="text-[10px] font-black uppercase tracking-[0.16em] text-mint">Next action</p>
            <p className="mt-2 text-sm font-semibold leading-6 text-ice">{priority.next_action}</p>
          </div>
          <button
            type="button"
            disabled={busy}
            onClick={() => onStatusChange(priority.status === "done" ? "active" : "done")}
            className="mt-4 inline-flex items-center gap-2 rounded-full border border-border px-3.5 py-2 text-xs font-bold text-muted-foreground hover:border-mint/40 hover:text-mint disabled:opacity-50"
          >
            {priority.status === "done" ? <RotateCcw className="h-3.5 w-3.5" /> : <CheckCircle2 className="h-3.5 w-3.5" />}
            {busy ? "Saving…" : priority.status === "done" ? "Reopen priority" : "Mark priority done"}
          </button>
        </div>
      </div>
    </article>
  );
}

function ActionRow({
  action,
  last,
  busy,
  onStatusChange,
}: {
  action: FounderAction;
  last: boolean;
  busy: boolean;
  onStatusChange: (status: "open" | "in_progress" | "done") => void;
}) {
  const nextStatus = action.status === "open" ? "in_progress" : action.status === "in_progress" ? "done" : "open";
  const nextLabel = action.status === "open" ? "Start" : action.status === "in_progress" ? "Complete" : "Reopen";

  return (
    <div className={`grid gap-3 p-4 md:grid-cols-[1fr_auto_auto] md:items-center ${last ? "" : "border-b border-border/50"}`}>
      <div>
        <p className="text-sm font-bold leading-6 text-ice">{action.title}</p>
        <p className="mt-1 text-xs text-muted-foreground">{action.owner}{action.deadline ? ` · ${dateLabel(action.deadline)}` : ""}</p>
      </div>
      <StatusPill status={action.status} />
      <button
        type="button"
        disabled={busy}
        onClick={() => onStatusChange(nextStatus)}
        className="inline-flex items-center justify-center gap-2 rounded-full border border-border px-3 py-1.5 text-[11px] font-bold text-muted-foreground hover:border-mint/40 hover:text-mint disabled:opacity-50"
      >
        {action.status === "done" ? <RotateCcw className="h-3 w-3" /> : <CheckCircle2 className="h-3 w-3" />}
        {busy ? "Saving…" : nextLabel}
      </button>
    </div>
  );
}

function RiskCard({ risk }: { risk: FounderRisk }) {
  const critical = risk.risk_score >= 20;
  return (
    <article className="rounded-[24px] border border-border/70 bg-ink p-5">
      <div className="flex items-start gap-3">
        <span className={critical ? "text-amber-200" : "text-muted-foreground"}>
          <AlertTriangle className="mt-0.5 h-4 w-4" />
        </span>
        <div className="min-w-0 flex-1">
          <div className="flex items-start justify-between gap-3">
            <p className="text-sm font-bold leading-6 text-ice">{risk.title}</p>
            <span className="shrink-0 rounded-full border border-border px-2.5 py-1 text-[10px] font-black text-muted-foreground">{risk.risk_score}</span>
          </div>
          <p className="mt-3 text-xs leading-5 text-muted-foreground">{risk.next_action}</p>
        </div>
      </div>
    </article>
  );
}

function StatusPill({ status }: { status: string }) {
  const positive = ["complete", "completed", "approved", "paid", "ready"].some((value) => status.toLowerCase().includes(value));
  const active = ["active", "progress", "open"].some((value) => status.toLowerCase().includes(value));
  const Icon = positive ? CheckCircle2 : active ? CircleDot : ShieldCheck;
  return (
    <span className={`inline-flex w-fit items-center gap-1.5 rounded-full border px-2.5 py-1 text-[10px] font-bold uppercase tracking-[0.1em] ${
      positive
        ? "border-mint/25 bg-mint/[0.06] text-mint"
        : active
          ? "border-sky-300/20 bg-sky-300/[0.04] text-sky-200"
          : "border-border text-muted-foreground"
    }`}>
      <Icon className="h-3 w-3" />
      {status.replaceAll("_", " ")}
    </span>
  );
}

function EmptyState({ text }: { text: string }) {
  return <div className="rounded-[22px] border border-dashed border-border p-5 text-sm text-muted-foreground">{text}</div>;
}

function formatMetric(metric: CommercialMetric) {
  if (metric.value === null) return "Unmeasured";
  if (metric.unit.toLowerCase() === "gbp") {
    return new Intl.NumberFormat("en-GB", { style: "currency", currency: "GBP", maximumFractionDigits: 0 }).format(metric.value);
  }
  if (metric.unit.toLowerCase() === "percent") return `${metric.value.toLocaleString("en-GB")}%`;
  if (metric.unit.toLowerCase() === "months") return `${metric.value.toLocaleString("en-GB")} mo`;
  return metric.value.toLocaleString("en-GB");
}

function dateLabel(value: string) {
  const date = new Date(value.length === 10 ? `${value}T12:00:00Z` : value);
  if (Number.isNaN(date.getTime())) return value;
  return date.toLocaleDateString("en-GB", { day: "2-digit", month: "short", year: "numeric" });
}

function dateRange(start: string, end: string) {
  return `${dateLabel(start)} — ${dateLabel(end)}`;
}
