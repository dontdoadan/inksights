# INKSIGHTS Sandbox E2E Remediation Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Convert the current schema-heavy INKSIGHTS growth foundation into a safe, deterministic, executable sandbox and reconcile the application/database drift without introducing paid infrastructure.

**Architecture:** Keep production business data in `public`, create a non-exposed `sandbox` schema for synthetic fixtures and validation runs, and expose only pure/read-safe calculation RPCs needed by the application. Use deterministic fixtures to exercise the canonical loop: inputs -> KPIs -> three-lever diagnosis -> opportunities -> scoring -> playbook -> recommendation -> intervention -> outcome -> attribution -> learning. Persist scenario records under authenticated RLS in `public` while preventing sandbox fixtures from entering production tables.

**Tech Stack:** PostgreSQL/Supabase, TypeScript, TanStack Start, GitHub Actions, Node test runner via pinned `tsx`.

**Spec:** Audit findings from 2026-09-14 and the existing INKCARE validation pattern under `docs/replication/`.

## Global Constraints

- Keep the implementation compatible with free-tier infrastructure.
- Do not use real client/contact/payment data in sandbox fixtures.
- Sandbox schema must not be exposed through the browser API.
- No synthetic fixture may write to production intelligence tables.
- Preserve evidence classifications and explicit modelled-vs-observed lineage.
- All new calculation behavior requires deterministic regression coverage.

---

### Task 1: Canonical scenario engine and regression contract

**Files:**
- Create: `src/lib/intelligence/growth-engine.ts`
- Create: `src/lib/intelligence/growth-engine.test.ts`
- Modify: `src/lib/mcp/tools/run-growth-calculators.ts`
- Modify: `package.json`
- Modify: `.github/workflows/ci.yml`

**Interfaces:**
- Produces: `calculateGrowthScenario(input)` returning baseline and modelled annual/monthly revenue, three lever uplifts, capacity-constrained revenue and diagnostics.
- Consumers: MCP growth calculator, future UI scenario form, sandbox expected-output fixtures.

- [ ] Write tests for baseline identity `revenue = customers * frequency * ATV`, isolated customer/frequency/ATV uplifts, combined uplift, capacity constraint, and invalid inputs.
- [ ] Run the tests and verify RED because `growth-engine.ts` does not exist.
- [ ] Implement the minimal canonical scenario engine.
- [ ] Refactor `run-growth-calculators.ts` to delegate to the engine and remove aftercare/retail-specific assumptions.
- [ ] Add `test:intelligence` and CI execution.
- [ ] Verify tests GREEN.

### Task 2: Database reconciliation and authenticated scenario persistence

**Files:**
- Create: `supabase/migrations/20260914030000_reconcile_growth_engine_and_sandbox.sql`
- Modify: `src/routes/_authenticated/dashboard.tsx`
- Modify: `src/lib/mcp/tools/save-scenario.ts`
- Modify: `src/lib/mcp/tools/list-scenarios.ts`
- Update: `src/integrations/supabase/types.ts`

**Interfaces:**
- Produces: authenticated `profiles` and `scenarios` tables with tenant RLS; dashboard reads canonical `revenue_audit_leads` rather than nonexistent `audit_submissions`.

- [ ] Confirm the current DB does not contain `profiles`/`scenarios` and the stale code fails its persistence contract.
- [ ] Add idempotent tables/indexes/RLS policies.
- [ ] Update dashboard query to canonical lead data.
- [ ] Apply migration to the connected project.
- [ ] Generate and commit updated TypeScript database types.
- [ ] Verify authenticated tables/policies and relation existence.

### Task 3: Free-tier sandbox isolation and synthetic fixtures

**Files:**
- Same reconciliation migration or a follow-on migration if required.
- Create: `docs/sandbox/README.md`

**Interfaces:**
- Produces: non-exposed `sandbox` schema; deterministic fixture catalog; validation run/result tables; no FK dependency on production customer data.

- [ ] Create sandbox schema and revoke browser-role access.
- [ ] Create deterministic fixture tables with fixed scenario keys and input JSON.
- [ ] Seed at least ten business archetypes covering acquisition, conversion, ATV, frequency, capacity, cancellation/no-show, margin and healthy-control conditions.
- [ ] Ensure fixtures contain no real customer/contact/payment identifiers.
- [ ] Document reset/run procedure and isolation guarantees.

### Task 4: Executable three-lever diagnostic and opportunity engine

**Files:**
- Create/modify SQL migration containing sandbox calculation functions.
- Extend `src/lib/intelligence/growth-engine.test.ts` where client-side parity is required.

**Interfaces:**
- Produces SQL functions for KPI derivation, lever diagnosis, opportunity scoring and deterministic playbook selection.

- [ ] Write failing SQL assertions against expected fixture outputs.
- [ ] Implement KPI derivation for revenue, customers, transactions, frequency, ATV, conversion, retention/cancellation/capacity/margin where inputs exist.
- [ ] Implement three-lever opportunity calculations with explicit assumptions and confidence.
- [ ] Implement versioned opportunity score using the existing `growth-opportunity-v1` weights.
- [ ] Implement deterministic playbook matching from fixture conditions to the existing 24-playbook catalog.
- [ ] Verify fixture expected outputs.

### Task 5: Closed-loop recommendation/outcome/learning simulation

**Files:**
- Extend sandbox migration and documentation.

**Interfaces:**
- Produces isolated sandbox recommendation, decision, intervention, outcome, attribution and learning records.

- [ ] Add sandbox-only workflow tables mirroring the canonical lifecycle without writing synthetic rows into `public` production intelligence tables.
- [ ] Execute recommendation -> approved decision -> intervention -> simulated result -> attribution -> learning for each fixture.
- [ ] Verify measurable delta and classification on each simulated outcome.

### Task 6: Durable validation suite and hardening

**Files:**
- Extend sandbox migration.
- Modify CI if needed.
- Create: `docs/sandbox/VALIDATION_RUNBOOK.md`

**Interfaces:**
- Produces: `sandbox.run_validation_suite()` with durable run/result IDs and fail/pass evidence.

- [ ] Add checks for fixture count, expected KPI outputs, expected primary lever, opportunity score tolerances, playbook assignment, closed-loop records, production-write isolation and stale relation regressions.
- [ ] Run validation and require 0 failures.
- [ ] Address safe Supabase security/performance advisories affecting INKSIGHTS-owned objects; do not blindly modify PostGIS-managed objects.
- [ ] Document remaining platform-managed advisories separately.

### Task 7: Verification and promotion

- [ ] Run GitHub CI: lint, build, typecheck, intelligence tests, existing social tests.
- [ ] Run database validation suite and capture run ID/results.
- [ ] Compare feature branch against `main` and review for production-write leakage.
- [ ] Open PR with evidence-backed change summary.
- [ ] Merge only if CI and database validation are green.
