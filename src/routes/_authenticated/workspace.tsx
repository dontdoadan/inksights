import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import {
  Activity,
  ArrowRight,
  CheckCircle2,
  CircleDot,
  Database,
  GitBranch,
  LockKeyhole,
  LogOut,
  Network,
  ShieldCheck,
  Sparkles,
  Target,
  TriangleAlert,
} from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { supabase } from "@/integrations/supabase/client";

type Studio = {
  id: string;
  studio_name: string;
  website_url: string | null;
  town: string | null;
  region: string | null;
  artist_count: number | null;
  canonical_status?: string | null;
};

type Evidence = {
  id: string;
  evidence_type: string;
  classification: string;
  source_type: string;
  claim: string;
  confidence: number | null;
  observed_at: string | null;
};

type Finding = {
  id: string;
  finding_type: string;
  statement: string;
  severity: string;
  confidence: number | null;
  status: string;
};

type Diagnosis = {
  id: string;
  primary_hypothesis: string;
  missing_evidence: unknown;
  confidence: number | null;
  status: string;
};

type Opportunity = {
  id: string;
  title: string;
  description: string | null;
  lsos_score: number | null;
  priority: number | null;
  status: string | null;
  recommended_action: string | null;
};

type Recommendation = {
  id: string;
  title: string;
  recommendation: string;
  rationale: string;
  implementation_effort: string | null;
  confidence: number | null;
  status: string;
};

type Decision = {
  id: string;
  decision: string;
  rationale: string;
  owner: string | null;
  status: string;
};

type Intervention = {
  id: string;
  intervention_type: string;
  description: string;
  target: string | null;
  owner: string | null;
  status: string;
  baseline_period_start: string | null;
  baseline_period_end: string | null;
  start_at: string | null;
};

type Outcome = {
  id: string;
  baseline_value: number | null;
  observed_value: number | null;
  delta: number | null;
  classification: string | null;
  confidence: number | null;
  observed_at: string | null;
};

type Attribution = {
  id: string;
  attribution_method: string;
  attribution_confidence: number | null;
  attributed_value: number | null;
  rationale: string | null;
};

type Learning = {
  id: string;
  hypothesis: string;
  result: string;
  learning_type: string;
  confidence: number | null;
};

type WorkspaceCase = {
  studio: Studio;
  evidence: Evidence[];
  findings: Finding[];
  diagnoses: Diagnosis[];
  opportunities: Opportunity[];
  recommendations: Recommendation[];
  decisions: Decision[];
  interventions: Intervention[];
  outcomes: Outcome[];
  attributions: Attribution[];
  learning: Learning[];
};

type WorkspaceMode = "live" | "presentation";

type Membership = { studio_id: string; role: string };

const PRESENTATION_CASE: WorkspaceCase = {
  studio: {
    id: "b9a44303-e5db-4cb6-8ae1-23dde79fdd2d",
    studio_name: "Off The Rails Tattoo Studio",
    website_url: "https://offtherailstattoostudio.com",
    town: "Beckenham",
    region: "London",
    artist_count: null,
    canonical_status: "observed",
  },
  evidence: [
    {
      id: "presentation-evidence-1",
      evidence_type: "measurement_readiness",
      classification: "evidence_backed",
      source_type: "visibility_report_run",
      claim:
        "The business identity and website footprint are evidenced, but the current production evidence set does not include a reconciled revenue/customer/transaction baseline or live search-provider observations; a three-lever commercial ranking would therefore be speculative.",
      confidence: 0.95,
      observed_at: "2026-09-08T18:04:58.151637+00:00",
    },
  ],
  findings: [
    {
      id: "presentation-finding-1",
      finding_type: "commercial_baseline_missing",
      statement:
        "INKSIGHTS cannot truthfully rank the three revenue-growth levers for this business until revenue, unique customers and completed transactions are measured over a common period.",
      severity: "high",
      confidence: 0.95,
      status: "validated",
    },
  ],
  diagnoses: [
    {
      id: "presentation-diagnosis-1",
      primary_hypothesis:
        "The binding constraint on the current INKSIGHTS growth diagnosis is measurement readiness rather than a demonstrated weakness in customers, frequency or average transaction value.",
      missing_evidence: [
        "period revenue",
        "unique paying customers",
        "completed transactions",
        "qualified leads",
        "new customers",
        "repeat behaviour",
        "live search observations",
      ],
      confidence: 0.9,
      status: "active",
    },
  ],
  opportunities: [],
  recommendations: [
    {
      id: "presentation-recommendation-1",
      title: "Instrument the baseline, then rerun the three-lever diagnostic",
      recommendation:
        "Collect revenue, unique paying customers and completed transactions for one consistent period; add qualified-lead/new-customer and repeat-behaviour data where available; restore live search observations; then rerun INKSIGHTS before recommending a customer, frequency or ATV growth intervention.",
      rationale:
        "The current evidence proves a measurement gap, not a commercial leak. Instrumentation is the highest-integrity next action because it converts unknowns into observed metrics and prevents false growth claims.",
      implementation_effort: "medium",
      confidence: 0.95,
      status: "accepted",
    },
  ],
  decisions: [
    {
      id: "presentation-decision-1",
      decision: "Proceed with measurement-first validation before any commercial growth claim.",
      rationale:
        "A real-business case study requires observed baseline and post-intervention data; the current public/registry evidence is insufficient for a revenue-growth conclusion.",
      owner: "INKSIGHTS",
      status: "approved",
    },
  ],
  interventions: [
    {
      id: "presentation-intervention-1",
      intervention_type: "measurement_instrumentation",
      description:
        "Establish the minimum viable observed baseline required by the canonical growth engine and restore the blocked visibility measurement path.",
      target:
        "Observed revenue, customers, transactions, leads and search evidence sufficient for a non-speculative diagnostic.",
      owner: "INKSIGHTS",
      status: "in_progress",
      baseline_period_start: "2026-09-08",
      baseline_period_end: "2026-09-08",
      start_at: "2026-09-13T04:45:03.365956+00:00",
    },
  ],
  outcomes: [],
  attributions: [],
  learning: [],
};

export const Route = createFileRoute("/_authenticated/workspace")({
  component: Workspace,
  head: () => ({
    meta: [
      { title: "Workspace — INKSIGHTS" },
      {
        name: "description",
        content: "Private INKSIGHTS intelligence workspace for evidence, diagnosis, interventions and measured outcomes.",
      },
    ],
  }),
});

function Workspace() {
  const navigate = useNavigate();
  const [workspaceCase, setWorkspaceCase] = useState<WorkspaceCase>(PRESENTATION_CASE);
  const [mode, setMode] = useState<WorkspaceMode>("presentation");
  const [loading, setLoading] = useState(true);
  const [loadNote, setLoadNote] = useState("Loading tenant intelligence…");

  useEffect(() => {
    let active = true;
    (async () => {
      try {
        const live = await loadTenantWorkspace();
        if (!active) return;
        if (live) {
          setWorkspaceCase(live);
          setMode("live");
          setLoadNote("Live tenant data loaded through authenticated RLS access.");
        } else {
          setWorkspaceCase(PRESENTATION_CASE);
          setMode("presentation");
          setLoadNote("No studio membership exists for this account. Showing the verified pilot snapshot for presentation only.");
        }
      } catch (error) {
        if (!active) return;
        console.error("Workspace load failed", error);
        setWorkspaceCase(PRESENTATION_CASE);
        setMode("presentation");
        setLoadNote("Live tenant data was unavailable. Showing the verified pilot snapshot; no synthetic outcomes have been added.");
      } finally {
        if (active) setLoading(false);
      }
    })();
    return () => {
      active = false;
    };
  }, []);

  const latestDiagnosis = workspaceCase.diagnoses[0];
  const latestRecommendation = workspaceCase.recommendations[0];
  const activeIntervention = workspaceCase.interventions[0];
  const latestEvidence = workspaceCase.evidence[0];

  const stages = useMemo(
    () => buildStages(workspaceCase),
    [workspaceCase],
  );

  async function handleSignOut() {
    await supabase.auth.signOut();
    navigate({ to: "/" });
  }

  return (
    <div className="min-h-screen bg-ink-deep text-foreground">
      <header className="sticky top-0 z-50 border-b border-border/50 bg-ink-deep/85 backdrop-blur-xl">
        <div className="mx-auto flex max-w-[1500px] items-center justify-between gap-6 px-5 py-4 md:px-8">
          <div className="flex min-w-0 items-center gap-4">
            <Link to="/" className="flex shrink-0 items-center gap-2.5">
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-mint">
                <CircleDot className="h-4 w-4 text-ink-deep" />
              </div>
              <span className="font-display text-lg font-black tracking-tight text-ice">
                INK<span className="text-mint">SIGHTS</span>
              </span>
            </Link>
            <div className="hidden h-6 w-px bg-border md:block" />
            <span className="hidden truncate text-sm font-semibold text-muted-foreground md:block">
              Workspace / {workspaceCase.studio.studio_name}
            </span>
          </div>
          <div className="flex items-center gap-2">
            <Link
              to="/dashboard"
              className="hidden rounded-full border border-border px-4 py-2 text-xs font-semibold text-muted-foreground transition-colors hover:border-mint/60 hover:text-mint sm:inline-flex"
            >
              Legacy dashboard
            </Link>
            <button
              onClick={handleSignOut}
              className="inline-flex items-center gap-2 rounded-full border border-border px-4 py-2 text-xs font-semibold text-muted-foreground transition-colors hover:border-mint/60 hover:text-mint"
            >
              <LogOut className="h-3.5 w-3.5" /> Sign out
            </button>
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-[1500px] px-5 py-8 md:px-8 md:py-10">
        <section className="grid gap-6 xl:grid-cols-[minmax(0,1fr)_360px]">
          <div className="rounded-3xl border border-border/60 bg-ink p-7 shadow-2xl shadow-black/10 md:p-9">
            <div className="flex flex-wrap items-center gap-3">
              <StatusPill tone={mode === "live" ? "green" : "amber"}>
                {mode === "live" ? "LIVE TENANT DATA" : "PRESENTATION SNAPSHOT"}
              </StatusPill>
              <StatusPill tone="neutral">
                <LockKeyhole className="h-3 w-3" /> Authenticated workspace
              </StatusPill>
            </div>
            <p className="mt-8 text-xs font-bold uppercase tracking-[0.2em] text-mint">Current intelligence case</p>
            <h1 className="mt-3 max-w-5xl font-display text-4xl font-black tracking-tight text-ice md:text-6xl">
              {workspaceCase.studio.studio_name}
            </h1>
            <p className="mt-4 max-w-4xl text-base leading-relaxed text-muted-foreground md:text-lg">
              {workspaceCase.studio.town || "Location pending"}
              {workspaceCase.studio.region ? ` · ${workspaceCase.studio.region}` : ""}
              {workspaceCase.studio.website_url ? ` · ${workspaceCase.studio.website_url.replace(/^https?:\/\//, "")}` : ""}
            </p>
            <div className="mt-8 rounded-2xl border border-mint/20 bg-mint/[0.04] p-5">
              <div className="flex items-start gap-3">
                <ShieldCheck className="mt-0.5 h-5 w-5 shrink-0 text-mint" />
                <div>
                  <p className="text-sm font-bold text-ice">Data-integrity status</p>
                  <p className="mt-1 text-sm leading-relaxed text-muted-foreground">{loadNote}</p>
                </div>
              </div>
            </div>
          </div>

          <aside className="rounded-3xl border border-border/60 bg-ink p-7">
            <p className="text-xs font-bold uppercase tracking-[0.2em] text-mint">Primary constraint</p>
            <div className="mt-5 flex h-12 w-12 items-center justify-center rounded-2xl border border-mint/20 bg-mint/10">
              <Target className="h-5 w-5 text-mint" />
            </div>
            <h2 className="mt-5 font-display text-2xl font-black text-ice">Measurement readiness</h2>
            <p className="mt-3 text-sm leading-relaxed text-muted-foreground">
              {latestDiagnosis?.primary_hypothesis || "No active diagnosis has been recorded for this studio."}
            </p>
            <div className="mt-6 flex items-center justify-between border-t border-border/50 pt-5 text-xs">
              <span className="text-muted-foreground">Diagnosis confidence</span>
              <span className="font-bold text-ice">{formatConfidence(latestDiagnosis?.confidence)}</span>
            </div>
          </aside>
        </section>

        <section className="mt-6 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
          <MetricCard label="Evidence records" value={workspaceCase.evidence.length} note="source-linked claims" />
          <MetricCard label="Validated findings" value={workspaceCase.findings.length} note="evidence-backed findings" />
          <MetricCard label="Active interventions" value={workspaceCase.interventions.filter((item) => item.status !== "complete").length} note="approved actions in motion" />
          <MetricCard label="Measured outcomes" value={workspaceCase.outcomes.length} note="never inferred or fabricated" emphasis={workspaceCase.outcomes.length > 0} />
        </section>

        <section className="mt-10 rounded-3xl border border-border/60 bg-ink p-7 md:p-9">
          <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
            <div>
              <p className="text-xs font-bold uppercase tracking-[0.2em] text-mint">Canonical intelligence loop</p>
              <h2 className="mt-2 font-display text-3xl font-black text-ice md:text-4xl">Evidence → decision → measured learning</h2>
            </div>
            <p className="max-w-2xl text-sm leading-relaxed text-muted-foreground">
              Every stage is explicit. A stage only turns complete when its corresponding canonical record exists; the presentation does not turn missing measurement into a success claim.
            </p>
          </div>

          <div className="mt-8 grid gap-3 md:grid-cols-2 xl:grid-cols-4">
            {stages.map((stage, index) => (
              <div key={stage.name} className="relative rounded-2xl border border-border/60 bg-ink-deep p-5">
                <div className="flex items-start justify-between gap-3">
                  <div className="flex h-8 w-8 items-center justify-center rounded-lg border border-border bg-ink text-xs font-black text-muted-foreground">
                    {String(index + 1).padStart(2, "0")}
                  </div>
                  <StageStatus status={stage.status} />
                </div>
                <h3 className="mt-5 font-display text-lg font-bold text-ice">{stage.name}</h3>
                <p className="mt-2 text-xs leading-relaxed text-muted-foreground">{stage.note}</p>
              </div>
            ))}
          </div>
        </section>

        <section className="mt-10 grid gap-6 xl:grid-cols-2">
          <Panel eyebrow="Evidence" title="What we can support" icon={<Database className="h-5 w-5" />}>
            {latestEvidence ? (
              <>
                <p className="text-base leading-relaxed text-ice">{latestEvidence.claim}</p>
                <div className="mt-6 grid gap-3 sm:grid-cols-3">
                  <MiniDatum label="Classification" value={latestEvidence.classification} />
                  <MiniDatum label="Source" value={latestEvidence.source_type} />
                  <MiniDatum label="Confidence" value={formatConfidence(latestEvidence.confidence)} />
                </div>
              </>
            ) : (
              <EmptyState text="No evidence records are available yet." />
            )}
          </Panel>

          <Panel eyebrow="Finding & diagnosis" title="Why this is the constraint" icon={<Activity className="h-5 w-5" />}>
            {workspaceCase.findings[0] ? (
              <>
                <p className="text-base font-semibold leading-relaxed text-ice">{workspaceCase.findings[0].statement}</p>
                <p className="mt-5 text-sm leading-relaxed text-muted-foreground">
                  Missing evidence: {normaliseMissingEvidence(latestDiagnosis?.missing_evidence).join(" · ") || "none recorded"}
                </p>
              </>
            ) : (
              <EmptyState text="No validated finding has been recorded yet." />
            )}
          </Panel>

          <Panel eyebrow="Recommendation" title={latestRecommendation?.title || "No recommendation yet"} icon={<Sparkles className="h-5 w-5" />}>
            {latestRecommendation ? (
              <>
                <p className="text-base leading-relaxed text-ice">{latestRecommendation.recommendation}</p>
                <p className="mt-5 text-sm leading-relaxed text-muted-foreground">{latestRecommendation.rationale}</p>
                <div className="mt-6 flex flex-wrap gap-2">
                  <StatusPill tone="green">{latestRecommendation.status}</StatusPill>
                  <StatusPill tone="neutral">{latestRecommendation.implementation_effort || "effort unscored"}</StatusPill>
                  <StatusPill tone="neutral">{formatConfidence(latestRecommendation.confidence)} confidence</StatusPill>
                </div>
              </>
            ) : (
              <EmptyState text="No recommendation exists until the diagnostic is sufficiently evidenced." />
            )}
          </Panel>

          <Panel eyebrow="Intervention" title="What is being changed" icon={<Network className="h-5 w-5" />}>
            {activeIntervention ? (
              <>
                <p className="text-base leading-relaxed text-ice">{activeIntervention.description}</p>
                <div className="mt-5 rounded-2xl border border-border/50 bg-ink-deep p-4">
                  <p className="text-xs font-bold uppercase tracking-[0.16em] text-muted-foreground">Measurement target</p>
                  <p className="mt-2 text-sm leading-relaxed text-ice">{activeIntervention.target || "Target pending"}</p>
                </div>
                <div className="mt-5 flex flex-wrap gap-2">
                  <StatusPill tone={activeIntervention.status === "in_progress" ? "amber" : "green"}>{activeIntervention.status}</StatusPill>
                  <StatusPill tone="neutral">Owner: {activeIntervention.owner || "unassigned"}</StatusPill>
                </div>
              </>
            ) : (
              <EmptyState text="No intervention has been approved yet." />
            )}
          </Panel>
        </section>

        <section className="mt-10 grid gap-6 xl:grid-cols-[minmax(0,1fr)_420px]">
          <div className="rounded-3xl border border-amber-400/20 bg-amber-400/[0.04] p-7 md:p-9">
            <div className="flex items-start gap-4">
              <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-amber-400/10 text-amber-300">
                <TriangleAlert className="h-5 w-5" />
              </div>
              <div>
                <p className="text-xs font-bold uppercase tracking-[0.18em] text-amber-300">Outcome gate</p>
                <h2 className="mt-2 font-display text-3xl font-black text-ice">
                  {workspaceCase.outcomes.length > 0 ? "Measured result available" : "No measured outcome yet"}
                </h2>
                <p className="mt-4 max-w-3xl text-sm leading-relaxed text-muted-foreground">
                  {workspaceCase.outcomes.length > 0
                    ? "The outcome table contains observed post-intervention data. Attribution and learning can now be assessed against the recorded evidence."
                    : "The intervention is still in progress. INKSIGHTS will not claim uplift, attribution or a case-study result until a real baseline and post-intervention observation are recorded in the canonical outcome table."}
                </p>
              </div>
            </div>
          </div>

          <div className="rounded-3xl border border-border/60 bg-ink p-7">
            <p className="text-xs font-bold uppercase tracking-[0.18em] text-mint">Control plane</p>
            <h2 className="mt-2 font-display text-2xl font-black text-ice">One business, connected systems</h2>
            <div className="mt-6 space-y-3">
              <SystemRow icon={<Database className="h-4 w-4" />} name="Supabase" purpose="canonical data + RLS" />
              <SystemRow icon={<GitBranch className="h-4 w-4" />} name="GitHub" purpose="source + change control" />
              <SystemRow icon={<Activity className="h-4 w-4" />} name="Vercel" purpose="preview + production" />
              <SystemRow icon={<Network className="h-4 w-4" />} name="HubSpot" purpose="lead + deal lifecycle" />
              <SystemRow icon={<Target className="h-4 w-4" />} name="Stripe" purpose="payment evidence" />
            </div>
            <Link
              to="/dashboard"
              className="mt-7 inline-flex items-center gap-2 text-sm font-bold text-mint hover:underline"
            >
              Open existing account dashboard <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
        </section>

        {loading ? (
          <div className="fixed bottom-6 right-6 rounded-full border border-border bg-ink px-4 py-2 text-xs font-semibold text-muted-foreground shadow-xl">
            Resolving tenant data…
          </div>
        ) : null}
      </main>
    </div>
  );
}

async function loadTenantWorkspace(): Promise<WorkspaceCase | null> {
  const { data } = await supabase.auth.getSession();
  const accessToken = data.session?.access_token;
  if (!accessToken) return null;

  const memberships = await restSelect<Membership>(
    "studio_members",
    { select: "studio_id,role", active: "eq.true", limit: "1" },
    accessToken,
  );
  const membership = memberships[0];
  if (!membership) return null;

  const studioId = membership.studio_id;
  const studioRows = await restSelect<Studio>(
    "visibility_studios",
    {
      select: "id,studio_name,website_url,town,region,artist_count,canonical_status",
      id: `eq.${studioId}`,
      limit: "1",
    },
    accessToken,
  );
  const studio = studioRows[0];
  if (!studio) return null;

  const [evidence, findings, diagnoses, opportunities, recommendations, decisions, interventions, outcomes, attributions, learning] =
    await Promise.all([
      restSelect<Evidence>("intelligence_evidence", { select: "id,evidence_type,classification,source_type,claim,confidence,observed_at", studio_id: `eq.${studioId}`, order: "created_at.desc" }, accessToken),
      restSelect<Finding>("intelligence_findings", { select: "id,finding_type,statement,severity,confidence,status", studio_id: `eq.${studioId}`, order: "created_at.desc" }, accessToken),
      restSelect<Diagnosis>("intelligence_diagnoses", { select: "id,primary_hypothesis,missing_evidence,confidence,status", studio_id: `eq.${studioId}`, order: "created_at.desc" }, accessToken),
      restSelect<Opportunity>("visibility_opportunities", { select: "id,title,description,lsos_score,priority,status,recommended_action", studio_id: `eq.${studioId}`, order: "priority.asc" }, accessToken),
      restSelect<Recommendation>("intelligence_recommendations", { select: "id,title,recommendation,rationale,implementation_effort,confidence,status", studio_id: `eq.${studioId}`, order: "created_at.desc" }, accessToken),
      restSelect<Decision>("intelligence_decisions", { select: "id,decision,rationale,owner,status", studio_id: `eq.${studioId}`, order: "created_at.desc" }, accessToken),
      restSelect<Intervention>("intelligence_interventions", { select: "id,intervention_type,description,target,owner,status,baseline_period_start,baseline_period_end,start_at", studio_id: `eq.${studioId}`, order: "created_at.desc" }, accessToken),
      restSelect<Outcome>("intelligence_outcomes", { select: "id,baseline_value,observed_value,delta,classification,confidence,observed_at", studio_id: `eq.${studioId}`, order: "created_at.desc" }, accessToken),
      restSelect<Attribution>("intelligence_attributions", { select: "id,attribution_method,attribution_confidence,attributed_value,rationale", studio_id: `eq.${studioId}`, order: "created_at.desc" }, accessToken),
      restSelect<Learning>("intelligence_learning", { select: "id,hypothesis,result,learning_type,confidence", studio_id: `eq.${studioId}`, order: "created_at.desc" }, accessToken),
    ]);

  return {
    studio,
    evidence,
    findings,
    diagnoses,
    opportunities,
    recommendations,
    decisions,
    interventions,
    outcomes,
    attributions,
    learning,
  };
}

async function restSelect<T>(table: string, params: Record<string, string>, accessToken: string): Promise<T[]> {
  const url = import.meta.env["VITE_SUPABASE_URL"] || process.env["SUPABASE_URL"];
  const key = import.meta.env["VITE_SUPABASE_PUBLISHABLE_KEY"] || process.env["SUPABASE_PUBLISHABLE_KEY"];
  if (!url || !key) throw new Error("Supabase public configuration is unavailable");

  const query = new URLSearchParams(params);
  const response = await fetch(`${url}/rest/v1/${table}?${query.toString()}`, {
    headers: {
      apikey: key,
      Authorization: `Bearer ${accessToken}`,
      Accept: "application/json",
    },
  });
  if (!response.ok) throw new Error(`Workspace query failed for ${table}: ${response.status}`);
  return (await response.json()) as T[];
}

function buildStages(data: WorkspaceCase) {
  return [
    { name: "Observation", status: data.evidence.length ? "complete" : "pending", note: data.evidence.length ? "Source observations exist." : "Awaiting source observations." },
    { name: "Normalisation", status: data.studio.canonical_status ? "complete" : "pending", note: data.studio.canonical_status ? "Studio is represented in the canonical model." : "Canonical identity pending." },
    { name: "Metric", status: data.outcomes.length ? "complete" : "pending", note: data.outcomes.length ? "Measured values are present." : "Commercial baseline metrics are still missing." },
    { name: "Evidence", status: data.evidence.length ? "complete" : "pending", note: `${data.evidence.length} evidence record${data.evidence.length === 1 ? "" : "s"}.` },
    { name: "Finding", status: data.findings.length ? "complete" : "pending", note: data.findings.length ? "Validated finding recorded." : "No validated finding yet." },
    { name: "Diagnosis", status: data.diagnoses.length ? "complete" : "pending", note: data.diagnoses.length ? "Primary hypothesis is active." : "Diagnosis pending evidence." },
    { name: "Opportunity", status: data.opportunities.length ? "complete" : "blocked", note: data.opportunities.length ? "A ranked opportunity exists." : "Commercial opportunity is deliberately unranked until measurement improves." },
    { name: "Recommendation", status: data.recommendations.length ? "complete" : "pending", note: data.recommendations.length ? "Evidence-linked recommendation recorded." : "Recommendation pending diagnosis." },
    { name: "Decision", status: data.decisions.length ? "complete" : "pending", note: data.decisions.length ? "Implementation decision approved." : "Awaiting decision." },
    { name: "Intervention", status: data.interventions.length ? "active" : "pending", note: data.interventions.length ? "Intervention is being tracked." : "No intervention started." },
    { name: "Outcome", status: data.outcomes.length ? "complete" : "blocked", note: data.outcomes.length ? "Observed result recorded." : "Real post-intervention measurement required." },
    { name: "Attribution", status: data.attributions.length ? "complete" : "blocked", note: data.attributions.length ? "Outcome attribution recorded." : "Cannot attribute a result that has not been measured." },
    { name: "Learning", status: data.learning.length ? "complete" : "blocked", note: data.learning.length ? "Learning encoded back into the system." : "Learning remains open until outcome and attribution exist." },
  ] as const;
}

function Panel({ eyebrow, title, icon, children }: { eyebrow: string; title: string; icon: React.ReactNode; children: React.ReactNode }) {
  return (
    <article className="rounded-3xl border border-border/60 bg-ink p-7 md:p-8">
      <div className="flex items-start justify-between gap-4">
        <div>
          <p className="text-xs font-bold uppercase tracking-[0.18em] text-mint">{eyebrow}</p>
          <h2 className="mt-2 font-display text-2xl font-black text-ice">{title}</h2>
        </div>
        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border border-border bg-ink-deep text-mint">{icon}</div>
      </div>
      <div className="mt-6">{children}</div>
    </article>
  );
}

function MetricCard({ label, value, note, emphasis = false }: { label: string; value: number; note: string; emphasis?: boolean }) {
  return (
    <div className={`rounded-2xl border p-5 ${emphasis ? "border-mint/40 bg-mint/[0.06]" : "border-border/60 bg-ink"}`}>
      <p className="text-xs font-bold uppercase tracking-[0.14em] text-muted-foreground">{label}</p>
      <p className={`mt-3 font-display text-4xl font-black ${emphasis ? "text-mint" : "text-ice"}`}>{value}</p>
      <p className="mt-2 text-xs text-muted-foreground">{note}</p>
    </div>
  );
}

function MiniDatum({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-xl border border-border/50 bg-ink-deep p-4">
      <p className="text-[11px] font-bold uppercase tracking-[0.14em] text-muted-foreground">{label}</p>
      <p className="mt-2 break-words text-sm font-semibold text-ice">{value}</p>
    </div>
  );
}

function StatusPill({ tone, children }: { tone: "green" | "amber" | "neutral"; children: React.ReactNode }) {
  const toneClass =
    tone === "green"
      ? "border-mint/30 bg-mint/10 text-mint"
      : tone === "amber"
        ? "border-amber-400/30 bg-amber-400/10 text-amber-300"
        : "border-border bg-ink-deep text-muted-foreground";
  return <span className={`inline-flex items-center gap-1.5 rounded-full border px-3 py-1.5 text-[11px] font-bold uppercase tracking-[0.12em] ${toneClass}`}>{children}</span>;
}

function StageStatus({ status }: { status: "complete" | "active" | "pending" | "blocked" }) {
  if (status === "complete") return <CheckCircle2 className="h-5 w-5 text-mint" />;
  if (status === "active") return <Activity className="h-5 w-5 text-amber-300" />;
  if (status === "blocked") return <LockKeyhole className="h-5 w-5 text-muted-foreground" />;
  return <CircleDot className="h-5 w-5 text-muted-foreground" />;
}

function SystemRow({ icon, name, purpose }: { icon: React.ReactNode; name: string; purpose: string }) {
  return (
    <div className="flex items-center gap-3 rounded-xl border border-border/50 bg-ink-deep px-4 py-3">
      <div className="text-mint">{icon}</div>
      <div className="min-w-0 flex-1">
        <p className="text-sm font-bold text-ice">{name}</p>
        <p className="text-xs text-muted-foreground">{purpose}</p>
      </div>
      <CheckCircle2 className="h-4 w-4 shrink-0 text-mint/70" />
    </div>
  );
}

function EmptyState({ text }: { text: string }) {
  return <p className="rounded-2xl border border-dashed border-border p-5 text-sm text-muted-foreground">{text}</p>;
}

function formatConfidence(value: number | null | undefined) {
  if (typeof value !== "number") return "—";
  return `${Math.round(value * 100)}%`;
}

function normaliseMissingEvidence(value: unknown): string[] {
  if (!Array.isArray(value)) return [];
  return value.filter((item): item is string => typeof item === "string");
}
