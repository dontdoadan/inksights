# INKSIGHTS Canonical Intelligence Reconciliation Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Reconcile valuable legacy Studio Intelligence R&D into the current Product v1 architecture without creating a parallel engine or reintroducing obsolete INKCARE commercial logic.

**Architecture:** Product v1 remains authoritative. Durable legacy concepts are promoted only where they fill a verified gap in the current intelligence model. GitHub remains the production source of truth; Supabase remains the canonical product/intelligence datastore; Google Drive holds working knowledge assets and archived provenance.

**Tech Stack:** TanStack Start, TypeScript, Supabase/Postgres, Google Drive, GitHub/Vercel.

**Spec:** `SPEC-001-INKSIGHTS-Product-v1-Operating-Specification.md` in the INKSIGHTS Google Drive product directory.

## Global Constraints

- Preserve the canonical intelligence loop: Provider Observation → Normalised Data → Metric → Evidence → Finding → Diagnosis → Opportunity → Recommendation → Decision → Intervention → Outcome → Attribution → Learning.
- Evidence classifications remain VERIFIED / OBSERVED / CALCULATED / MODELLED / HYPOTHESIS / MISSING.
- Missing evidence must block unsupported conclusions; do not convert missing values to zero.
- Do not call unrealised capacity or hypothetical growth "leakage".
- Distinguish `RECOVERABLE_LEAKAGE`, `MODELLED_OPPORTUNITY`, and `CAPTURED_UPSIDE`.
- Legacy thresholds are uncalibrated hypotheses unless a current benchmark cohort supports them.
- Do not create a second constraint/rules engine if the existing intelligence schema can represent the concept.
- Preserve legacy INKCARE data only as provenance/archive material; it must not remain current INKSIGHTS commercial authority.

---

### Task 1: Clean documentation authority

**Files:**
- Create: `docs/archive/inkcare/commercial-source-of-truth-2026-07-28.md`
- Modify: `docs/commercial-source-of-truth.md`
- Modify: `docs/README.md`

- [ ] Archive the existing INKCARE commercial control verbatim for provenance.
- [ ] Replace the active document with the current INKSIGHTS pathway: Growth Check → Studio Intelligence Audit → Primary Constraint Programme → Outcome Review → INKSIGHTS Watch.
- [ ] Make the £395 audit explicitly a founding validation price, not a permanent validated anchor.
- [ ] Remove obsolete INKCARE URLs, product IDs and legacy offers from current authority.
- [ ] Update the documentation index so Product v1 and the intelligence governance documents are the current authority.

### Task 2: Canonicalise the reusable intelligence IP

**Files:**
- Create: `docs/intelligence/constraint-diagnostic-library-v1.md`
- Create: `docs/intelligence/commercial-value-classification-v1.md`
- Create: `docs/intelligence/benchmark-cohort-specification-v1.md`

- [ ] Define constraint families and their evidence requirements.
- [ ] Define insufficient-data behaviour before a constraint may be scored.
- [ ] Define the three commercial-value classes and report wording rules.
- [ ] Define cohort dimensions and minimum-evidence requirements for benchmarks.
- [ ] Mark historical fixed thresholds as uncalibrated until empirical cohorts support them.

### Task 3: Reconcile Supabase schema and seed data

**Files:**
- Create: one migration under `supabase/migrations/` matching the migration applied to production.

- [ ] Add `value_classification` to economic opportunities with the allowed classes `recoverable_leakage`, `modelled_opportunity`, `captured_upside`.
- [ ] Add explicit diagnostic resolution state including `insufficient_data` without breaking existing diagnosis status semantics.
- [ ] Seed constraint-family taxonomy for demand_visibility, conversion, appointment_leakage, capacity_utilisation, pricing_monetisation, frequency_retention, and measurement_readiness.
- [ ] Seed metric definitions for recoverable leakage and captured upside with explicit lineage requirements.
- [ ] Preserve existing RLS/grants; no new public access.

### Task 4: Reconcile working knowledge in Google Drive

**Destinations:**
- `inksights-playbooks`
- `inksights-benchmarking`
- `inksights-databases`
- `inksights/archive/R&D`

- [ ] Create canonical working documents corresponding to the three new GitHub governance documents.
- [ ] Move the historical `inksights-studio-intelligence.md` research transcript into `archive/R&D` and label it legacy/provenance.
- [ ] Do not duplicate the current Product v1 specification.

### Task 5: Verification

- [ ] Verify GitHub changed files and PR diff contain no current INKCARE commercial authority.
- [ ] Verify Supabase migration state and read back new columns/taxonomy/metric definitions.
- [ ] Run Supabase security and performance advisors.
- [ ] Run repository CI on the PR and inspect failures before merge.
- [ ] Do not merge until CI and review evidence support it.