# INKSIGHTS Workspace v1 Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build the authenticated, multi-tenant INKSIGHTS Workspace on the existing application and canonical Supabase model, then use it to run one real studio through the complete intelligence loop.

**Architecture:** Extend the existing TanStack Start application under protected workspace routes. Supabase Auth provides identity; `studio_members` provides many-to-many studio membership; database RLS is the tenant boundary; React Query provides server-state caching/refetching; realtime is limited to state where immediate updates materially improve the workflow. Internal INKSIGHTS privileges remain separate from client studio membership.

**Tech Stack:** React 19.2, TanStack Start/Router, TanStack React Query, Supabase JS/Auth/Postgres/RLS, Tailwind CSS 4, Radix UI, Recharts, Zod, TypeScript 5.8, Vite 8.

**Spec:** `docs/superpowers/specs/2026-09-14-inksights-workspace-v1-design.md`

## Global Constraints

- Extend the existing `dontdoadan/inksights` application; do not create a parallel dashboard product or duplicate intelligence schema.
- V1 client onboarding is invite-only; public self-registration is excluded.
- One authenticated user may belong to multiple studios.
- Client roles are `owner`, `admin`, `member`, `viewer`.
- Owners and admins may invite users; ownership transfer/removal must never leave a studio without an owner.
- Internal INKSIGHTS access is separate from `studio_members` and cannot be self-assigned by clients.
- RLS is the authoritative tenant-isolation boundary; UI route hiding is not authorisation.
- Privileged mutations must be server-controlled and re-check authorisation.
- Preserve the canonical intelligence chain: Observation -> Metric -> Evidence -> Finding -> Diagnosis -> Opportunity -> Recommendation -> Decision -> Intervention -> Outcome -> Attribution -> Learning.
- Recommendations require an explicit recorded decision before an intervention is created.
- Material widgets expose freshness, classification, confidence and provenance where available; stale/partial data must not be presented as current fact.
- Reuse existing canonical Supabase tables before introducing any new table.
- Keep the public marketing site logically separate from authenticated Workspace UI even though both live in the same repository.
- Use the established deep-navy/mint/ice-white INKSIGHTS visual system; no generic SaaS or tattoo-cliche styling.
- Resolve the `public.spatial_ref_sys` security advisory deliberately during hardening; do not blindly enable RLS without checking dependencies.
- P0 remains: run one real studio end-to-end and record a measurable outcome before expanding integrations or adjacent modules.

---

## File Structure

The executor must first confirm exact existing Supabase type/client paths and migration naming conventions. The intended new feature boundary is:

- `src/features/workspace/auth.ts` — workspace identity, memberships and role predicates.
- `src/features/workspace/types.ts` — workspace-specific view/read-model types only; canonical DB types remain generated.
- `src/features/workspace/queries.ts` — typed read queries and query keys.
- `src/features/workspace/mutations.ts` — authorised client mutation calls; privileged operations delegate server-side.
- `src/features/workspace/components/WorkspaceShell.tsx` — navigation, studio context and responsive shell.
- `src/features/workspace/components/StudioSwitcher.tsx` — authorised studio selection.
- `src/features/workspace/components/DataTrust.tsx` — freshness/classification/confidence/provenance indicators.
- `src/features/workspace/components/IntelligenceChain.tsx` — evidence-chain navigation.
- `src/features/workspace/components/WorkspaceState.tsx` — deterministic loading/empty/error/stale/permission states.
- `src/routes/_authenticated/workspace*.tsx` or the repository-equivalent TanStack file-route structure — protected workspace routes.
- `supabase/migrations/<timestamp>_workspace_v1_authorization.sql` — only the RLS/platform-role/helper changes proven necessary after schema inspection.
- `supabase/functions/workspace-invite/index.ts` — server-controlled invitations if no existing invitation function safely covers the use case.
- `src/features/workspace/*.test.ts(x)` — unit/component tests once the test runner is selected in Task 1.
- `tests/workspace/*.spec.ts` — browser/security workflow tests if the repository already supports an E2E runner; otherwise add the smallest suitable runner in Task 1.

Do not manually edit `src/routeTree.gen.ts`; TanStack route generation owns it.

---

### Task 1: Establish the Workspace Test Harness and Repository Baseline

**Files:**
- Modify: `package.json` only if a test runner is absent.
- Create: minimal test configuration only if absent.
- Create: `src/features/workspace/auth.test.ts` as the first workspace test.

**Interfaces:**
- Consumes: current TanStack/Supabase application.
- Produces: repeatable commands `npm test` (or the repository's existing equivalent), `npm run lint`, and `npm run build` that later tasks use.

- [ ] **Step 1: Inspect existing test/config files and scripts**

Run repository search for `vitest`, `playwright`, `test(`, `describe(` and existing CI workflow test commands. Record the existing convention in the plan execution notes.

- [ ] **Step 2: Add the smallest missing test harness**

If no unit runner exists, add Vitest and configure the `@/` alias consistently with Vite. Add `"test": "vitest run"` to `package.json`. Do not add a second runner if one already exists.

- [ ] **Step 3: Write the first failing role-predicate test**

```ts
import { describe, expect, it } from "vitest";
import { canInviteStudioMember } from "./auth";

describe("canInviteStudioMember", () => {
  it.each(["owner", "admin"] as const)("allows %s", (role) => {
    expect(canInviteStudioMember(role)).toBe(true);
  });

  it.each(["member", "viewer"] as const)("denies %s", (role) => {
    expect(canInviteStudioMember(role)).toBe(false);
  });
});
```

- [ ] **Step 4: Run the focused test and verify failure**

Expected: failure because `auth.ts`/predicate does not exist.

- [ ] **Step 5: Create the minimal predicate implementation**

```ts
export type StudioRole = "owner" | "admin" | "member" | "viewer";

export function canInviteStudioMember(role: StudioRole): boolean {
  return role === "owner" || role === "admin";
}
```

- [ ] **Step 6: Run test, lint and build**

Expected: all pass. Fix only baseline issues attributable to this task; separately record pre-existing failures.

- [ ] **Step 7: Commit**

```bash
git add package.json src/features/workspace test* vite* 2>/dev/null || true
git commit -m "test: establish workspace test harness"
```

---

### Task 2: Audit Canonical Auth, Membership and RLS Before Schema Changes

**Files:**
- Inspect: `supabase/migrations/*`
- Inspect: generated Supabase types and `src/integrations/supabase/*`
- Create/Modify: `supabase/migrations/<timestamp>_workspace_v1_authorization.sql` only for demonstrated gaps.
- Test: SQL policy assertions or local Supabase tests using the repository's established mechanism.

**Interfaces:**
- Consumes: `auth.users`, `profiles`, `studio_members`, `visibility_studios`, existing policies.
- Produces: `is_internal_user()`, `is_studio_member(studio_id)`, and `studio_role(studio_id)` only if equivalent safe helpers do not already exist.

- [ ] **Step 1: Inventory current schema and policies**

Confirm exact columns, role representation, active-membership semantics, foreign keys and existing policies for `profiles`, `studio_members`, `visibility_studios`, all `intelligence_*` studio-scoped tables, report/visibility tables and internal-role storage.

- [ ] **Step 2: Write failing isolation assertions before policy changes**

Use two authenticated test identities A and B and studios Alpha/Beta. Assert A can read Alpha when actively assigned, cannot read Beta without membership, and B cannot read Alpha. Also assert `viewer` cannot execute mutation paths reserved for owner/admin.

- [ ] **Step 3: Implement only missing RLS/helper policy changes**

Use `auth.uid()` and membership checks. Any `SECURITY DEFINER` helper must set an explicit `search_path` and expose the minimum required result. Internal-role elevation must come from server-controlled data, never user-editable metadata.

- [ ] **Step 4: Add owner-safeguard tests**

Assert removal/transfer cannot leave zero owners and an admin cannot promote itself to owner unless the approved ownership-transfer path permits it.

- [ ] **Step 5: Review `public.spatial_ref_sys` advisory**

Identify its owner, grants and dependencies. Apply a remediation only if dependency-safe; otherwise document why it remains and what compensating control exists. Do not make speculative changes.

- [ ] **Step 6: Run Supabase policy/security tests and advisors**

Expected: cross-tenant reads/mutations denied; authorised reads succeed; no new critical security advisor findings.

- [ ] **Step 7: Commit**

```bash
git add supabase/migrations
git commit -m "security: enforce workspace tenant authorization"
```

---

### Task 3: Build Workspace Identity, Membership and Studio Context

**Files:**
- Create: `src/features/workspace/auth.ts`
- Create: `src/features/workspace/types.ts`
- Create: `src/features/workspace/queries.ts`
- Test: `src/features/workspace/auth.test.ts`
- Test: `src/features/workspace/queries.test.ts`

**Interfaces:**
- Produces:
  - `StudioRole`
  - `WorkspaceMembership { studioId: string; studioName: string; role: StudioRole; active: boolean }`
  - `WorkspaceIdentity { userId: string; internal: boolean; memberships: WorkspaceMembership[] }`
  - `workspaceKeys.memberships(userId)`
  - `getWorkspaceIdentity(userId): Promise<WorkspaceIdentity>`
  - `canAccessStudio(identity, studioId): boolean`

- [ ] **Step 1: Write failing tests for multi-studio access**

```ts
it("permits only active memberships for client users", () => {
  const identity = {
    userId: "u1",
    internal: false,
    memberships: [
      { studioId: "a", studioName: "A", role: "owner", active: true },
      { studioId: "b", studioName: "B", role: "viewer", active: false },
    ],
  } as const;
  expect(canAccessStudio(identity, "a")).toBe(true);
  expect(canAccessStudio(identity, "b")).toBe(false);
  expect(canAccessStudio(identity, "c")).toBe(false);
});
```

Also test that an authenticated internal user can select studios through the internal access path without fake membership rows.

- [ ] **Step 2: Run focused tests and verify failure**

- [ ] **Step 3: Implement types, query keys and access predicates**

Map exact database column names discovered in Task 2; do not guess schema names in production code.

- [ ] **Step 4: Implement `getWorkspaceIdentity` with typed Supabase queries**

Return only active client memberships. Validate external/raw records with Zod at the query boundary when generated DB typing is insufficient.

- [ ] **Step 5: Run focused tests, lint and build**

- [ ] **Step 6: Commit**

```bash
git add src/features/workspace
git commit -m "feat: add workspace identity and studio context"
```

---

### Task 4: Add Protected Workspace Routes and Branded Shell

**Files:**
- Create: workspace route files under `src/routes/_authenticated/` following current TanStack file-routing convention.
- Create: `src/features/workspace/components/WorkspaceShell.tsx`
- Create: `src/features/workspace/components/StudioSwitcher.tsx`
- Create: `src/features/workspace/components/WorkspaceState.tsx`
- Modify: `src/styles.css` only for reusable Workspace tokens/classes not already represented.
- Test: component/route tests.

**Interfaces:**
- Consumes: `getWorkspaceIdentity`, `canAccessStudio`, React Query.
- Produces: authenticated `/workspace` shell and authorised studio context.

- [ ] **Step 1: Write failing route tests**

Assert unauthenticated `/workspace` redirects to `/auth`; a one-studio user lands in that studio context; a multi-studio user sees only authorised studios; an unauthorised `studioId` renders permission denial/redirect without querying protected studio data.

- [ ] **Step 2: Implement the route guard on top of existing `/_authenticated`**

Reuse the current Supabase `getUser()` guard rather than introducing a second auth system.

- [ ] **Step 3: Implement `WorkspaceShell`**

Desktop: compact left navigation + top studio/status context. Mobile: accessible drawer/navigation. Use existing design tokens first; add only missing navy/mint/ice-white workspace tokens.

- [ ] **Step 4: Implement `StudioSwitcher`**

Switching must update route context and invalidate/remove studio-scoped React Query caches before rendering the next studio.

- [ ] **Step 5: Implement deterministic workspace states**

`WorkspaceState` must cover loading, empty, permission denied, stale/partial source, retryable failure and non-retryable failure.

- [ ] **Step 6: Run tests, lint, build and responsive visual check**

- [ ] **Step 7: Commit**

```bash
git add src/routes/_authenticated src/features/workspace/components src/styles.css
git commit -m "feat: add protected workspace shell"
```

---

### Task 5: Build the Studio Overview Live Read Model

**Files:**
- Modify: `src/features/workspace/queries.ts`
- Create: `src/features/workspace/components/DataTrust.tsx`
- Create: `src/features/workspace/components/Overview.tsx`
- Create: studio Overview route.
- Test: query and component tests.

**Interfaces:**
- Produces `StudioOverview` containing studio identity, current health/diagnosis, priority opportunity, current recommendation/intervention, KPI summaries, freshness state and latest supported outcome.

- [ ] **Step 1: Write failing query tests using representative canonical records**

Assert the read model answers: what is happening, what is wrong, best opportunity, next action, and whether the current intervention is working.

- [ ] **Step 2: Implement a small number of typed parallel queries**

Query canonical tables directly or through an existing safe view/RPC. Do not create a duplicated dashboard table. Prefer a server-side read view/RPC only if it materially reduces client round trips while preserving RLS.

- [ ] **Step 3: Implement `DataTrust`**

Render last-updated timestamp, freshness, classification, confidence and provenance when present. A stale/partial result must be visibly labelled.

- [ ] **Step 4: Implement Overview UI**

Use compact intelligence-terminal cards, restrained charts only where a chart answers a decision question, and clear priority hierarchy.

- [ ] **Step 5: Configure React Query refresh policy**

Dashboard aggregates refetch on focus/reconnect and after relevant mutations; do not create blanket realtime subscriptions.

- [ ] **Step 6: Test empty/stale/partial/error states, lint and build**

- [ ] **Step 7: Commit**

```bash
git add src/features/workspace src/routes/_authenticated
git commit -m "feat: add live studio overview"
```

---

### Task 6: Build Navigable Intelligence Chain

**Files:**
- Modify: `src/features/workspace/queries.ts`
- Create: `src/features/workspace/components/IntelligenceChain.tsx`
- Create: Intelligence route.
- Test: query/component tests.

**Interfaces:**
- Produces `IntelligenceNode` and `IntelligenceLink` read models linking canonical observation/metric/evidence/finding/diagnosis/opportunity/recommendation/decision/intervention/outcome/attribution/learning records.

- [ ] **Step 1: Write a failing chain-construction test**

Create representative IDs for each stage and assert a recommendation can traverse backward to its supporting evidence and forward to its decision/intervention/outcome when those records exist.

- [ ] **Step 2: Implement chain queries using canonical foreign keys/linkage fields**

Do not infer unsupported links. Missing stages render as missing, not fabricated continuity.

- [ ] **Step 3: Implement classification mapping**

Map backend values consistently to client labels: VERIFIED, OBSERVED, CALCULATED/DERIVED, MODELLED, HYPOTHESIS/INFERRED, EVIDENCE-BACKED as supported by actual canonical values.

- [ ] **Step 4: Implement `IntelligenceChain`**

Each node opens its evidence/details panel and preserves source, confidence, timestamp and linked record IDs for auditability.

- [ ] **Step 5: Test incomplete chains and client/internal visibility rules**

- [ ] **Step 6: Run lint/build and commit**

```bash
git add src/features/workspace src/routes/_authenticated
git commit -m "feat: add evidence-backed intelligence chain"
```

---

### Task 7: Build Opportunity and Recommendation Decision Workflow

**Files:**
- Modify: `src/features/workspace/queries.ts`
- Create/Modify: `src/features/workspace/mutations.ts`
- Create: Opportunities route/components.
- Create: Actions route/components.
- Add server function/RPC only if existing mutation paths are insufficient.
- Test: workflow and permission tests.

**Interfaces:**
- Produces:
  - `getStudioOpportunities(studioId)`
  - `recordRecommendationDecision({ recommendationId, decision, rationale })`
  - decision enum matching canonical backend values.

- [ ] **Step 1: Write failing permission/workflow tests**

Assert viewer cannot decide; owner/admin can decide; member follows the exact limited action policy confirmed from canonical schema/business rules; a decision cannot target another studio; an intervention is not created before an accepted decision.

- [ ] **Step 2: Implement opportunity list/query**

Expose only scoring dimensions actually present in the canonical opportunity model: impact, evidence strength, confidence, ease, speed, strategic fit, feasibility, learning value, total score and linked playbook where available.

- [ ] **Step 3: Implement server-controlled decision mutation**

Re-check authenticated user, active membership/internal role, studio linkage and allowed transition server-side. Record the decision atomically.

- [ ] **Step 4: Implement Opportunities and Actions UI**

Provide filtering/sorting, evidence drill-down, explicit Accept/Reject/Defer actions and clear audit metadata.

- [ ] **Step 5: Invalidate affected Overview/Intelligence/Actions queries after mutation**

- [ ] **Step 6: Run tests including cross-tenant mutation attempts, lint/build**

- [ ] **Step 7: Commit**

```bash
git add src/features/workspace src/routes/_authenticated supabase
git commit -m "feat: add opportunity decision workflow"
```

---

### Task 8: Implement Intervention, Outcome, Attribution and Learning Views

**Files:**
- Modify: `src/features/workspace/queries.ts`
- Modify: `src/features/workspace/mutations.ts`
- Create: Results route/components.
- Create: Learning route/components.
- Test: outcome/learning tests.

**Interfaces:**
- Produces typed read models for intervention baseline/measurement window, outcome delta, attribution/confounders and linked learning.

- [ ] **Step 1: Write failing tests for measured-result rendering**

Assert baseline and measurement periods remain distinct; delta is calculated/displayed only from supported values; missing attribution is labelled un-attributed rather than implied causal impact.

- [ ] **Step 2: Implement intervention/result queries**

Return baseline, observed value, delta, source, classification, confidence, attribution method/confidence/value, confounders and rationale where the schema supports them.

- [ ] **Step 3: Implement Results UI**

Prefer baseline-vs-observed comparisons and explicit attribution state over vanity charts.

- [ ] **Step 4: Implement Learning UI**

Show hypothesis, observed result, learning type, confidence, applicability/scope, recommendation adjustment and linked intervention/outcome/attribution.

- [ ] **Step 5: Add selective realtime only for active intervention status**

Subscribe per currently selected studio; unsubscribe on studio switch/unmount. On event, invalidate the narrow affected query keys.

- [ ] **Step 6: Run tests, lint/build and commit**

```bash
git add src/features/workspace src/routes/_authenticated
git commit -m "feat: add workspace results and learning"
```

---

### Task 9: Add Visibility and Reports Without Creating a Separate SEO Dashboard

**Files:**
- Modify: `src/features/workspace/queries.ts`
- Create: Visibility route/components.
- Create: Reports route/components.
- Test: visibility/report permission and state tests.

**Interfaces:**
- Consumes: existing visibility/search/competitor/LSOS/report tables.
- Produces: studio-scoped visibility intelligence and published/authorised report history.

- [ ] **Step 1: Write failing tests for studio-scoped visibility/report access**

Assert draft/internal reports do not leak to client roles and cross-studio visibility records are inaccessible.

- [ ] **Step 2: Implement visibility read model**

Include search universe, positions, competitor observations, SERP observations, LSOS/opportunity score and provenance only where present.

- [ ] **Step 3: Implement Reports read model**

Respect canonical publication/status fields rather than inventing client visibility from timestamps.

- [ ] **Step 4: Build UI linked back to Intelligence/Opportunities**

Every visibility insight that drives an opportunity should expose the relevant intelligence link rather than standing alone.

- [ ] **Step 5: Run tests, lint/build and commit**

```bash
git add src/features/workspace src/routes/_authenticated
git commit -m "feat: integrate visibility and reports into workspace"
```

---

### Task 10: Implement Invite-Only Team Management

**Files:**
- Create/Modify: `supabase/functions/workspace-invite/index.ts` or reuse existing safe invite function.
- Modify: `src/features/workspace/mutations.ts`
- Create: Team route/components.
- Test: invitation/role/ownership tests.

**Interfaces:**
- Produces:
  - `inviteStudioMember({ studioId, email, role })`
  - `changeStudioMemberRole({ studioId, memberUserId, role })`
  - `deactivateStudioMember({ studioId, memberUserId })`
  - ownership transfer path with last-owner safeguard.

- [ ] **Step 1: Write failing authorisation tests**

Owner/admin can invite; member/viewer cannot. Admin cannot remove/replace owner. No operation can target a studio outside the actor's authority. Last owner cannot be removed.

- [ ] **Step 2: Implement invitation server path**

Validate email/role with Zod, verify actor server-side, invoke Supabase administrative invite capability only from the protected server environment, and create/activate membership through an idempotent approved flow.

- [ ] **Step 3: Implement Team UI**

Show active members, roles, pending invitations and permitted actions. Do not expose service-role credentials or admin APIs to browser code.

- [ ] **Step 4: Add realtime membership invalidation**

Use a studio-scoped subscription only for membership/invitation changes; invalidate membership/team queries.

- [ ] **Step 5: Test duplicate invites, expired/revoked membership and owner safeguards**

- [ ] **Step 6: Run lint/build and commit**

```bash
git add src/features/workspace src/routes/_authenticated supabase/functions
git commit -m "feat: add invite-only workspace team management"
```

---

### Task 11: Build Internal Command Centre and System Health

**Files:**
- Modify: `src/features/workspace/queries.ts`
- Create: internal admin route files.
- Create: internal Command Centre/System Health components.
- Test: internal/client route and data tests.

**Interfaces:**
- Consumes: internal-role check, studios, recommendations, interventions, outcomes, pipeline/provider/report status tables.
- Produces: cross-studio operational triage views available only to INKSIGHTS internal users.

- [ ] **Step 1: Write failing internal-access tests**

Client owner must receive denial for `/workspace/admin/*`; internal user can access without fake studio memberships.

- [ ] **Step 2: Implement internal route guard**

Validate internal role server-side/data-side; do not trust a client-provided flag.

- [ ] **Step 3: Implement Command Centre read model**

Return active studios, attention-required studios, incomplete loops, recommendations awaiting review, active interventions, outcomes awaiting measurement, stale evidence, pipeline failures/partial runs, top opportunities and data-health exceptions.

- [ ] **Step 4: Implement System Health states**

Show provider/pipeline status, last successful collection, failed/partial runs and stale data. Avoid exposing secrets/raw credentials.

- [ ] **Step 5: Add selective realtime for critical pipeline-state changes**

Invalidate system-health queries rather than streaming every provider table.

- [ ] **Step 6: Run client-leakage tests, lint/build and commit**

```bash
git add src/features/workspace src/routes/_authenticated
git commit -m "feat: add internal command centre"
```

---

### Task 12: Production Hardening and End-to-End Verification

**Files:**
- Modify: only files implicated by verification failures.
- Create/Modify: E2E/security tests and execution evidence document, e.g. `docs/workspace-v1-verification.md`.

**Interfaces:**
- Consumes: complete Workspace v1.
- Produces: verified release candidate and evidence for the P0 real-studio run.

- [ ] **Step 1: Run full automated checks**

```bash
npm test
npm run lint
npm run build
```

Expected: exit 0 for each.

- [ ] **Step 2: Run tenant/role security matrix**

Verify unauthenticated denial, one-studio client, multi-studio switch, guessed foreign `studioId`, viewer mutation denial, owner/admin permissions, owner safeguard and internal cross-studio access.

- [ ] **Step 3: Run Supabase security/performance advisors**

Record findings. No newly introduced critical finding is acceptable. Re-evaluate the `spatial_ref_sys` advisory based on Task 2 findings.

- [ ] **Step 4: Perform representative browser visual QA**

Check desktop and mobile viewport(s), wait for network idle, capture Overview/Intelligence/Opportunities/Actions/Results/Team/Internal views, verify console errors, CTA/action states, loading/empty/error states and responsive navigation.

- [ ] **Step 5: Verify live-data behavior**

Change one authorised intervention or membership state and confirm the relevant UI updates through the intended realtime/invalidation mechanism without a full page reload. Confirm stale data is visibly labelled.

- [ ] **Step 6: Run one real studio through the complete loop**

Create/use real records in sequence: Observation -> Metric/Evidence -> Finding -> Diagnosis -> Opportunity -> Recommendation -> Decision -> Intervention -> Outcome -> Attribution -> Learning. Do not fabricate an outcome: if the measurement window has not elapsed, record the intervention as awaiting measurement and do not claim the P0 case study is complete.

- [ ] **Step 7: Record verification evidence**

Document studio identifier, record IDs, timestamps, test/build outputs, known limitations and whether the measurable-outcome acceptance criterion has actually been met. Keep client-sensitive values out of public documentation.

- [ ] **Step 8: Final commit**

```bash
git add .
git commit -m "chore: verify workspace v1 release candidate"
```

---

## Self-Review

- Spec coverage: authentication, multi-studio tenancy, roles, invite-only onboarding, RLS, internal access, Overview, Intelligence, Opportunities, Actions, Results, Learning, Visibility, Reports, Team, Command Centre, live-data strategy, trust indicators, failure states, brand, responsive QA, security verification and the real-studio P0 loop are each assigned to explicit tasks.
- Placeholder scan: no TBD/TODO/"implement later" instructions are used. Schema-dependent details are explicitly resolved by inspection in Task 2 rather than guessed.
- Type consistency: `StudioRole`, `WorkspaceMembership`, `WorkspaceIdentity`, `canAccessStudio`, query-key ownership and mutation names are defined once and reused consistently.
- Scope: public signup, billing, chat, generic PM, white-labelling, native mobile, marketplace, CRM replacement and broad AI chat remain excluded.
