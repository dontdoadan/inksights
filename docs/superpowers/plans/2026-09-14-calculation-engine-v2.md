# Calculation Engine V2 Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build a versioned INKSIGHTS calculation engine that converts observed business evidence into low/base/high economic opportunities, applies measurable capacity constraints, and records uncertainty separately from value.

**Architecture:** A pure TypeScript calculation core owns deterministic formulas and validation. An authenticated MCP tool exposes the engine without persistence side effects. Supabase stores calculation-version metadata, reproducible calculation runs and modelled economic opportunities behind tenant RLS. V1 remains unchanged.

**Tech Stack:** TypeScript, Node 22 built-in test runner with type stripping, Zod, Lovable MCP, Supabase/Postgres.

**Spec:** `docs/superpowers/specs/2026-09-14-calculation-engine-v2-design.md`

## Global Constraints

- Engine version: `calculation-engine-v2.0.0`.
- V1 calculations, tables and historical outputs must remain intact.
- Economic value and evidence quality must remain separate outputs.
- Capacity is enforceable only when capacity, booked capacity and units-per-transaction are all explicit.
- Low/base/high scenario bands must satisfy `0 <= low <= base <= high`.
- Supermetrics non-aggregatable rate metrics must not be re-aggregated.
- New Supabase tables must use tenant RLS and deny `anon` access.

---

### Task 1: Pure Calculation Core

**Files:**
- Create: `src/lib/intelligence/calculation-engine-v2.ts`
- Test: `src/lib/intelligence/calculation-engine-v2.test.ts`
- Modify: `package.json`

**Interfaces:**
- Produces: `runCalculationEngineV2(input)`, `calculateEvidenceQuality(evidence)`, `calculateFreshnessScore(ageDays, halfLifeDays)`, `CALCULATION_ENGINE_VERSION`.
- Consumers: MCP tool and later Workspace/backend orchestration.

- [ ] **Step 1: Write failing tests** covering revenue identity, 33.1% compounding, capacity constraints, evidence/value separation, freshness half-life, optional contribution output and invalid scenario bands.
- [ ] **Step 2: Run tests and confirm RED** with `node --experimental-strip-types --test src/lib/intelligence/calculation-engine-v2.test.ts`.
- [ ] **Step 3: Implement the minimal engine** using the formulas and capacity contract in the spec.
- [ ] **Step 4: Run tests and confirm GREEN** with the same command.
- [ ] **Step 5: Add `test:calc-v2`** to `package.json` using that command.

### Task 2: Authenticated MCP Surface

**Files:**
- Create: `src/lib/mcp/tools/run-calculation-engine-v2.ts`
- Modify: `src/lib/mcp/index.ts`

**Interfaces:**
- Consumes: `runCalculationEngineV2`.
- Produces: read-only tool `run_calculation_engine_v2` with structured V2 output.

- [ ] **Step 1: Define Zod input schema** matching the V2 baseline, scenario bands and optional evidence quality inputs.
- [ ] **Step 2: Call the pure engine without persistence** so tool use remains idempotent and inspectable.
- [ ] **Step 3: Register the tool** in `src/lib/mcp/index.ts` while retaining all existing tools.
- [ ] **Step 4: Update MCP instructions** to describe V2 as the canonical general commercial model and retain the older calculator for backwards compatibility.

### Task 3: Versioned Supabase Persistence

**Files:**
- Create migration matching the production migration version returned by Supabase.

**Interfaces:**
- Produces tables `intelligence_calculation_versions`, `intelligence_calculation_runs`, `intelligence_economic_opportunities` and V2 metric definitions.

- [ ] **Step 1: Create additive tables** with checks for valid bands, 0–1 confidence/quality values and references to studios/runs.
- [ ] **Step 2: Enable RLS** and apply the existing `studio_members` tenant predicate to runs and economic opportunities.
- [ ] **Step 3: Revoke `anon` access** from all new calculation structures.
- [ ] **Step 4: Seed `calculation-engine-v2.0.0`** with transparent config: multiplicative three-lever economics, capacity conversion requirement, harmonic evidence aggregation, half-life freshness and pre-calibration status.
- [ ] **Step 5: Add V2 metric dictionary rows** without altering V1 definitions.
- [ ] **Step 6: Run Supabase security and performance advisors** after migration.

### Task 4: Source Contract and Data Quality Guardrails

**Files:**
- Create: `docs/intelligence/calculation-engine-v2-source-contract.md`

**Interfaces:**
- Defines how observed source metrics may enter V2.

- [ ] **Step 1: Document authoritative metric classes**: observed, derived, modelled, composite/calibrated.
- [ ] **Step 2: Document Supermetrics rules** discovered from the connected HubSpot source, including the distinction between additive counts/amounts and non-aggregatable rates/averages.
- [ ] **Step 3: Define minimum lineage fields**: source type/ref, observed time, confidence, completeness, freshness half-life and sample adequacy where applicable.
- [ ] **Step 4: State that unauthenticated sources are optional evidence adapters, not hidden prerequisites.**

### Task 5: Verification and Review

**Files:**
- No new production files unless verification finds a defect.

- [ ] **Step 1: Run `npm run test:calc-v2`.**
- [ ] **Step 2: Run `npm run lint`.**
- [ ] **Step 3: Run `npm run build`.**
- [ ] **Step 4: Query Supabase** to verify V2 version seed, metric definitions, table RLS state and that V1 rows remain present.
- [ ] **Step 5: Run Supabase advisors** and resolve calculation-engine-related findings.
- [ ] **Step 6: Compare branch to `main`** and confirm changes are additive and scoped to Calculation Engine V2.