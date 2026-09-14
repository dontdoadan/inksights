# INKSIGHTS Workspace v1 Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build a secure internal INKSIGHTS workspace over the canonical Supabase intelligence model and use it to close one real studio case through Observation → Evidence → Diagnosis → Recommendation → Intervention → Outcome → Learning.

**Architecture:** Extend the existing authenticated TanStack Start application with a `/workspace` case-file interface. Keep Supabase as the source of truth, use existing tenant RLS, move public visibility-report delivery behind a same-origin server route, and avoid parallel workspace tables.

**Tech Stack:** TanStack Start/Router, React 19, TypeScript 5.8, Supabase JS 2.110, PostgreSQL/Supabase RLS, Vite 8, Vercel.

**Spec:** `docs/superpowers/specs/2026-09-14-inksights-workspace-v1-design.md`

## Global Constraints

- Preserve the existing public marketing-site behavior.
- Do not weaken RLS to support Workspace or public reports.
- Do not expose `SUPABASE_SERVICE_ROLE_KEY` to client code.
- Do not introduce HubSpot/Stripe expansion, directory work, CMS expansion, AI agents, or new intelligence modules.
- Use the existing canonical intelligence tables; do not create parallel `workspace_*` tables.
- Keep the feature branch in a working state because commits sync to Lovable.
- Completion requires one real observed outcome and learning record.

---

### Task 1: Replace anonymous privileged visibility-report RPC access

**Files:**
- Create: `src/routes/api/public/visibility-report.ts`
- Modify: `src/routes/studio-visibility-report.tsx`
- Create: `supabase/migrations/<generated>_restrict_publish_visibility_report_rpc.sql`

**Interfaces:**
- Produces: `GET /api/public/visibility-report?reportId=<uuid>&token=<token>` returning the existing `ReportPayload` JSON shape.
- Consumes: `supabaseAdmin` from `src/integrations/supabase/client.server.ts`.

- [ ] **Step 1: Add the same-origin server route**

Create a TanStack server handler using the existing server-route pattern:

```ts
import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/api/public/visibility-report")({
  server: {
    handlers: {
      GET: async ({ request }) => {
        const url = new URL(request.url);
        const reportId = url.searchParams.get("reportId");
        const token = url.searchParams.get("token");
        if (!reportId || !token) {
          return Response.json({ error: "invalid_request" }, { status: 400 });
        }
        const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
        // Load only a published report matching BOTH report ID and public token,
        // then assemble the exact public payload from the same source tables used today.
      },
    },
  },
});
```

The query must first load `visibility_report_runs` with:

```ts
.eq("id", reportId)
.eq("public_token", token)
.eq("status", "published")
.maybeSingle()
```

If no row matches, return `404` without indicating whether the ID or token was wrong.

- [ ] **Step 2: Assemble the existing public report payload**

Use service-role server queries for the same data currently returned by `publish_visibility_report`: `visibility_studios`, `visibility_observations`, `visibility_keywords`, `visibility_search_universe`, `visibility_competitor_observations`, `visibility_serp_observations`, and `visibility_opportunities`.

Return:

```ts
return Response.json({
  report: { /* existing public fields only */ },
  studio: { studio_name, website_url, town, artist_count },
  observations,
  keywords,
  search_universe,
  competitors,
  studio_search_observations,
  opportunities,
});
```

Do not return `public_token`, contact fields, internal IDs not already exposed by the current RPC payload, or service-role errors.

- [ ] **Step 3: Switch the browser to the same-origin endpoint**

Replace the direct RPC in `studio-visibility-report.tsx`:

```ts
const response = await fetch(
  `/api/public/visibility-report?reportId=${encodeURIComponent(reportId)}&token=${encodeURIComponent(token)}`,
);
if (!response.ok) throw new Error("report_unavailable");
const data = (await response.json()) as ReportPayload;
setReport(data);
```

Remove the `supabase.rpc("publish_visibility_report", ...)` client call.

- [ ] **Step 4: Restrict the database RPC**

Create the migration through the Supabase migration workflow and include:

```sql
revoke execute on function public.publish_visibility_report(uuid, text) from public;
revoke execute on function public.publish_visibility_report(uuid, text) from anon;
revoke execute on function public.publish_visibility_report(uuid, text) from authenticated;
grant execute on function public.publish_visibility_report(uuid, text) to service_role;
```

Do not add new public table policies.

- [ ] **Step 5: Verify security behavior**

Verify with SQL:

```sql
select
  has_function_privilege('anon', 'public.publish_visibility_report(uuid,text)', 'EXECUTE') as anon_execute,
  has_function_privilege('authenticated', 'public.publish_visibility_report(uuid,text)', 'EXECUTE') as authenticated_execute,
  has_function_privilege('service_role', 'public.publish_visibility_report(uuid,text)', 'EXECUTE') as service_execute;
```

Expected: `false`, `false`, `true`.

- [ ] **Step 6: Verify public-report behavior**

Check a known valid published report URL through the new route and an invalid token. Expected: valid report `200`; invalid token `404`; direct anonymous RPC no longer executable.

- [ ] **Step 7: Run quality gates**

Run:

```bash
npm run lint
npm run build
```

Expected: both succeed.

- [ ] **Step 8: Commit**

```bash
git add src/routes/api/public/visibility-report.ts src/routes/studio-visibility-report.tsx supabase/migrations
 git commit -m "security: remove anonymous privileged report RPC access"
```

### Task 2: Create the Workspace data-access boundary

**Files:**
- Create: `src/lib/workspace/types.ts`
- Create: `src/lib/workspace/queries.ts`
- Create: `src/lib/workspace/mutations.ts`

**Interfaces:**
- Produces: typed `WorkspaceStudio`, `WorkspaceCase`, stage-record types, `listWorkspaceStudios()`, `loadWorkspaceCase(studioId)`, and mutation functions for case progression.
- Consumes: browser `supabase` client; all access remains subject to RLS.

- [ ] **Step 1: Define workspace types**

Create focused types mirroring persisted fields only. Include:

```ts
export type WorkspaceStudio = {
  id: string;
  studio_name: string;
  town: string | null;
  website_url: string | null;
  artist_count: number | null;
};

export type WorkspaceStage =
  | "observation"
  | "evidence"
  | "finding"
  | "diagnosis"
  | "opportunity"
  | "recommendation"
  | "decision"
  | "intervention"
  | "outcome"
  | "attribution"
  | "learning";
```

Define `WorkspaceCase` with arrays for each canonical table and a derived `currentStage`.

- [ ] **Step 2: Implement `listWorkspaceStudios()`**

Query `visibility_studios` through the authenticated Supabase client. Do not use a service-role client. RLS must determine the visible studio set.

- [ ] **Step 3: Implement `loadWorkspaceCase(studioId)`**

Load the studio and canonical intelligence collections in parallel with explicit `.eq("studio_id", studioId)` filters. Include evidence, findings, diagnoses, opportunities, recommendations, decisions, interventions, outcomes, attributions, and learning.

- [ ] **Step 4: Derive current stage without new persistence**

Implement a pure helper such as:

```ts
export function deriveCurrentStage(data: WorkspaceCaseData): WorkspaceStage {
  if (data.learning.length) return "learning";
  if (data.attributions.length) return "attribution";
  if (data.outcomes.length) return "outcome";
  if (data.interventions.length) return "intervention";
  if (data.decisions.length) return "decision";
  if (data.recommendations.length) return "recommendation";
  if (data.diagnoses.length) return "diagnosis";
  if (data.findings.length) return "finding";
  if (data.evidence.length) return "evidence";
  return "observation";
}
```

- [ ] **Step 5: Implement minimum mutations**

Create explicit functions:

```ts
createEvidence(input)
createFinding(input)
createDiagnosis(input)
createRecommendation(input)
recordDecision(input)
createIntervention(input)
recordOutcome(input)
recordAttribution(input)
recordLearning(input)
```

Every input must require `studio_id`; do not silently infer it from an unrelated profile.

- [ ] **Step 6: Run lint/build**

```bash
npm run lint
npm run build
```

- [ ] **Step 7: Commit**

```bash
git add src/lib/workspace
 git commit -m "feat: add workspace intelligence data layer"
```

### Task 3: Build the authenticated Workspace shell

**Files:**
- Create: `src/routes/_authenticated/workspace.tsx`
- Create: `src/components/workspace/WorkspaceShell.tsx`
- Create: `src/components/workspace/StudioList.tsx`
- Create: `src/components/workspace/StudioCaseHeader.tsx`

**Interfaces:**
- Produces: `/workspace` route guarded by existing `/_authenticated` route.
- Consumes: `listWorkspaceStudios()` and `loadWorkspaceCase()`.

- [ ] **Step 1: Add `/workspace` route**

Use `createFileRoute("/_authenticated/workspace")`. Keep `ssr` behavior inherited from the authenticated route.

- [ ] **Step 2: Load studios on route mount**

Display explicit `loading`, `empty`, and `error` states. Do not substitute demo studios.

- [ ] **Step 3: Add studio selection**

Selecting a studio loads its `WorkspaceCase`. Keep selection in URL search parameters where practical, e.g. `?studio=<uuid>`, so refresh preserves context.

- [ ] **Step 4: Build case header**

Show studio name, town, artist count, derived current stage, active diagnosis if available, active recommendation if available, and intervention/outcome status.

- [ ] **Step 5: Keep Workspace private**

Do not add `/workspace` to public navigation, sitemap, or marketing CTAs.

- [ ] **Step 6: Run lint/build and commit**

```bash
npm run lint
npm run build
git add src/routes/_authenticated/workspace.tsx src/components/workspace
 git commit -m "feat: add authenticated INKSIGHTS workspace shell"
```

### Task 4: Build the canonical intelligence timeline

**Files:**
- Create: `src/components/workspace/IntelligenceTimeline.tsx`
- Create: `src/components/workspace/stages/EvidenceStage.tsx`
- Create: `src/components/workspace/stages/DiagnosisStage.tsx`
- Create: `src/components/workspace/stages/RecommendationStage.tsx`
- Create: `src/components/workspace/stages/InterventionStage.tsx`
- Create: `src/components/workspace/stages/OutcomeStage.tsx`
- Create: `src/components/workspace/stages/LearningStage.tsx`
- Modify: `src/routes/_authenticated/workspace.tsx`

**Interfaces:**
- Produces: sequential stage UI and forms required to progress a case.
- Consumes: `WorkspaceCase` and mutation functions from `src/lib/workspace`.

- [ ] **Step 1: Build timeline navigation**

Render all canonical stages in order and mark each as `complete`, `current`, or `pending` based on persisted records.

- [ ] **Step 2: Implement evidence/finding stage**

Allow an authorised user to add evidence with `evidence_type`, `classification`, `source_type`, `source_ref`, `claim`, and optional confidence, then create a finding linked to selected evidence IDs.

- [ ] **Step 3: Implement diagnosis/recommendation stage**

Require an existing finding before diagnosis. Require an existing diagnosis before recommendation. Persist confidence and rationale where supported.

- [ ] **Step 4: Implement decision/intervention stage**

Record decision status and rationale, then create an intervention with description, target, owner, start date, baseline period, and status.

- [ ] **Step 5: Implement outcome/attribution stage**

Require a completed or in-progress intervention. Record actual observed outcome with measurement period, baseline value, observed value, source, classification, and confidence. Record attribution separately; do not automatically claim causation.

- [ ] **Step 6: Implement learning stage**

Record hypothesis, result, learning type, confidence, applicability, and recommendation adjustment. This is the completion record for the case loop.

- [ ] **Step 7: Refresh persisted state after each mutation**

After successful mutation, reload `WorkspaceCase` from Supabase. No optimistic state is required.

- [ ] **Step 8: Run lint/build and commit**

```bash
npm run lint
npm run build
git add src/components/workspace src/routes/_authenticated/workspace.tsx
 git commit -m "feat: implement canonical workspace intelligence timeline"
```

### Task 5: Verify tenant authorisation and advisor posture

**Files:**
- Modify only if required by findings: `supabase/migrations/<generated>_workspace_rls_hardening.sql`

**Interfaces:**
- Produces: documented, verified RLS behavior for Workspace tables.

- [ ] **Step 1: Inspect grants/policies for all workspace tables**

Verify that studio-scoped intelligence tables use `studio_members` membership checks and have both `USING` and `WITH CHECK` for writes.

- [ ] **Step 2: Review the 13 no-policy tables**

For each advisor finding, classify it as one of:

```text
SERVICE_ROLE_ONLY
AUTHENTICATED_READ_REQUIRED
AUTHENTICATED_TENANT_ACCESS_REQUIRED
PUBLIC_ENDPOINT_INTERNAL_ONLY
```

Do not add a policy unless Workspace or another existing user flow genuinely requires direct client access.

- [ ] **Step 3: Re-run Supabase security advisors**

Expected result: no application-specific anonymous `SECURITY DEFINER` warning for `publish_visibility_report`. Extension-owned PostGIS warnings may remain and must be documented rather than hacked around.

- [ ] **Step 4: Commit any required RLS migration**

```bash
git add supabase/migrations
 git commit -m "security: verify workspace tenant access"
```

### Task 6: Select and initialise one real studio case

**Files:**
- Create: `docs/workspace/pilot-case.md`

**Interfaces:**
- Produces: one named real studio selected from existing studio data and a baseline record of what is already known.

- [ ] **Step 1: Select a studio that already exists in `visibility_studios`**

Prefer a studio with existing observations/report data so Workspace proves connection to the current intelligence engine rather than starting from synthetic data.

- [ ] **Step 2: Record baseline evidence only from existing source data**

Document studio ID, existing report/observation IDs, evidence classifications, known gaps, and the initial commercial question. Do not fabricate missing metrics.

- [ ] **Step 3: Open the studio in `/workspace` and confirm existing evidence is visible**

If existing visibility evidence is not represented in canonical `intelligence_evidence`, add a deliberate evidence record referencing the original source IDs rather than copying unsupported claims.

- [ ] **Step 4: Commit pilot-case baseline**

```bash
git add docs/workspace/pilot-case.md
 git commit -m "docs: establish workspace pilot studio baseline"
```

### Task 7: Run the pilot through recommendation and intervention

**Files:**
- Modify: `docs/workspace/pilot-case.md`

**Interfaces:**
- Produces: persisted finding, diagnosis, recommendation, decision, and intervention for the real studio.

- [ ] **Step 1: Validate one evidence-backed finding**

The finding must cite stored evidence IDs and must not exceed what the evidence supports.

- [ ] **Step 2: Create one primary diagnosis**

Record competing explanations and missing evidence where relevant. Confidence must be explicit.

- [ ] **Step 3: Create one recommendation**

The recommendation must directly target the diagnosis and include rationale, expected effect, implementation effort, confidence, and evidence IDs.

- [ ] **Step 4: Record the implementation decision**

Set the decision to approved only when an actual intervention will be carried out.

- [ ] **Step 5: Execute and record one bounded intervention**

Use a change that can produce a measurable signal with current tools/data. Record start time, target, owner, baseline period, and implementation evidence.

- [ ] **Step 6: Update pilot-case documentation and commit**

```bash
git add docs/workspace/pilot-case.md
 git commit -m "feat: progress pilot studio through intervention"
```

### Task 8: Record an actual outcome, attribution, and learning

**Files:**
- Modify: `docs/workspace/pilot-case.md`
- Create: `docs/workspace/first-case-study.md`

**Interfaces:**
- Produces: at least one persisted `intelligence_outcomes` row, one attribution row, one learning row, and a case-study draft grounded in those records.

- [ ] **Step 1: Measure the intervention outcome**

Use an actual post-intervention observation. Record source, period, baseline, observed value, classification, and confidence. If the metric did not improve, record the negative/null result rather than inventing success.

- [ ] **Step 2: Record attribution separately**

Use the most defensible method available. For a simple pilot this may be `before_after` or `manual_analyst_assessment`, with explicit confounders and a conservative confidence value.

- [ ] **Step 3: Capture learning**

Persist what the result implies for the original hypothesis and how the recommendation/playbook should change.

- [ ] **Step 4: Draft the first case study**

Use only verified/observed/calculated/modelled labels appropriate to the underlying records. Keep causal claims aligned with attribution confidence.

- [ ] **Step 5: Final verification**

Confirm the selected studio has records at every required stage and that Workspace renders them after refresh.

Run:

```bash
npm run lint
npm run build
```

Re-run Supabase security advisors and verify the preview deployment is READY.

- [ ] **Step 6: Commit**

```bash
git add docs/workspace
 git commit -m "docs: record first complete INKSIGHTS workspace case"
```

## Self-Review

- Spec coverage: security hardening, authenticated workspace, canonical data mapping, one-studio loop, actual outcome, attribution and learning are all represented.
- Placeholder scan: migration filenames are intentionally generated by the Supabase migration command; no behavioral requirement is left unspecified.
- Type consistency: `WorkspaceStudio`, `WorkspaceCase`, `WorkspaceStage`, query names and mutation names are consistent across tasks.
- Scope: integrations and new intelligence modules remain explicitly excluded until the completion gate is met.
