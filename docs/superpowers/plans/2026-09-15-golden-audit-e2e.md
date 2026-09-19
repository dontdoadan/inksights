# INKSIGHTS Golden Audit E2E Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build the canonical INKSIGHTS Golden Audit pipeline so Daniel Hughes Tattoos can be ingested, analysed, diagnosed, rendered into a client-grade report, quality-gated, stored, and rerun without manually reconstructing the analysis.

**Architecture:** Extend the existing TanStack Start + Supabase stack with a canonical audit data model and one orchestration layer. Reuse the existing visibility/search workloads where appropriate, but route their outputs into the audit evidence model. Client-facing reports are rendered from stored canonical audit intelligence, never from chat-only conclusions or hard-coded report figures.

**Tech Stack:** React 19.2, TanStack Start/Router, Supabase Postgres/RLS/Storage/Edge Functions, TypeScript 5.8, Deno 2, Node 22 test runner, Recharts, Tailwind CSS 4, Vercel.

**Spec:** `docs/superpowers/specs/2026-09-15-golden-audit-e2e-design.md`

## Global Constraints

- Keep `dontdoadan/inksights` as the canonical production application; do not create a parallel audit platform.
- Daniel Hughes Tattoos is an `internal_validation` tenant and must not be confused with an external paying studio.
- Preserve the chain `Provider Observation -> Normalised Data -> Metric -> Evidence -> Finding -> Diagnosis -> Opportunity -> Recommendation -> Intervention -> Outcome -> Attribution -> Learning`.
- Transactions, bookings, sessions, clients and deposits are separate grains; never infer one from another without source evidence.
- Every material metric/finding must carry evidence classification and confidence.
- Supported evidence classifications are `VERIFIED`, `OBSERVED`, `CALCULATED`, `MODELLED`, `HYPOTHESIS`.
- Supported confidence values are `HIGH`, `MEDIUM`, `LOW`.
- Missing funnel data must produce `not_measurable`, not fabricated estimates.
- Modelled financial values require explicit assumptions and `MODELLED` classification.
- Search/website observations must retain source reference and `observed_at`.
- A failed critical integrity step blocks report generation.
- A non-critical engine failure may degrade to a coverage warning only when QA explicitly permits it.
- The existing `revenue-audit-v1` remains a lightweight acquisition estimator and must not be repurposed as the Full Studio Intelligence Audit.
- Existing visibility/search functions may be reused, but their output is not the canonical source of truth until mapped into the audit model.
- Do not manually edit `src/routeTree.gen.ts`; route generation owns it.
- Maintain existing CI requirements: lint, build, generated route tree check, TypeScript typecheck, Node tests, and Deno security tests.

---

## File Structure

Create a focused Golden Audit feature boundary rather than adding logic to large generic files:

- `src/features/audit/types.ts` — client-side/read-model types for audit/report surfaces.
- `src/features/audit/queries.ts` — authenticated audit/report reads and query helpers.
- `src/features/audit/components/AuditRunTimeline.tsx` — orchestration status/log UI.
- `src/features/audit/components/AuditReport.tsx` — canonical report renderer shared by secure web and print/PDF view.
- `src/features/audit/components/EvidenceBadge.tsx` — evidence/confidence presentation.
- `src/routes/_authenticated/audits.tsx` — internal audit list.
- `src/routes/_authenticated/audits.$auditId.tsx` — internal audit run workspace.
- `src/routes/report.$token.tsx` — secure client report surface.
- `supabase/migrations/20260915xxxxxx_create_golden_audit_model.sql` — canonical audit schema, indexes, functions and RLS.
- `supabase/migrations/20260915xxxxxx_create_golden_audit_storage.sql` — private report/source storage policies only if not safely covered elsewhere.
- `supabase/functions/golden-audit-ingest/index.ts` — controlled source ingestion endpoint.
- `supabase/functions/golden-audit-run/index.ts` — canonical audit orchestrator.
- `supabase/functions/golden-audit-website/index.ts` — website observation adapter, reusing hardened URL logic.
- `supabase/functions/golden-audit-report/index.ts` — report manifest/QA finalisation and secure publication.
- `supabase/functions/_shared/audit/*` — pure reusable parsing, metrics, scoring and evidence helpers.
- `tests/golden-audit-*.test.mjs` — Node-level source/model invariants.
- `supabase/functions/**/_test.ts` — Deno tests for pure Edge Function logic/security.
- `scripts/golden-audit/seed-daniel-hughes.mjs` — reproducible internal validation seed/runner using a local source file path or Storage object, never hard-coded private transaction rows in git.

Do not store the real Daniel transaction ledger in the public repository.

---

### Task 1: Create the Canonical Audit Schema and RLS Boundary

**Files:**
- Create: `supabase/migrations/20260915180000_create_golden_audit_model.sql`
- Create: `tests/golden-audit-schema.test.mjs`
- Modify: `.github/workflows/ci.yml`

**Interfaces:**
- Produces canonical tables: `studios`, `audits`, `audit_sources`, `audit_raw_records`, `clients`, `client_aliases`, `transactions`, `audit_metrics`, `audit_evidence`, `audit_findings`, `audit_finding_evidence`, `audit_diagnoses`, `audit_opportunities`, `audit_recommendations`, `audit_interventions`, `audit_runs`, `report_versions`, `qa_checks`.
- Produces enum/check constraints for audit mode/status, measurement status, evidence classification, confidence and run status.

- [ ] **Step 1: Write a failing schema contract test**

Create `tests/golden-audit-schema.test.mjs` that reads the migration text and asserts all canonical tables and required enum/check values are present.

```js
import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';

const sql = fs.readFileSync('supabase/migrations/20260915180000_create_golden_audit_model.sql', 'utf8');

for (const table of ['studios','audits','audit_sources','transactions','audit_metrics','audit_evidence','audit_findings','audit_diagnoses','audit_opportunities','audit_recommendations','audit_runs','report_versions','qa_checks']) {
  test(`schema contains ${table}`, () => {
    assert.match(sql, new RegExp(`create table(?: if not exists)? public\\.${table}`, 'i'));
  });
}

test('schema encodes evidence and confidence classifications', () => {
  for (const value of ['VERIFIED','OBSERVED','CALCULATED','MODELLED','HYPOTHESIS','HIGH','MEDIUM','LOW']) {
    assert.ok(sql.includes(value));
  }
});
```

- [ ] **Step 2: Run the test and verify failure**

Run:

```bash
node --test tests/golden-audit-schema.test.mjs
```

Expected: fail because the migration does not exist.

- [ ] **Step 3: Implement the migration**

Use UUID PKs, explicit foreign keys and check constraints. Money values should be integer pence where they represent currency; imported transaction `amount_pence bigint not null`. Store original labels separately from canonical IDs.

Critical columns:

```sql
create table public.studios (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  slug text not null unique,
  website_url text,
  primary_location text,
  internal_validation boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.audits (
  id uuid primary key default gen_random_uuid(),
  studio_id uuid not null references public.studios(id) on delete cascade,
  audit_type text not null default 'studio_intelligence',
  audit_version text not null,
  mode text not null check (mode in ('A','B','C')),
  status text not null check (status in ('draft','collecting','normalising','analysing','diagnosing','reporting','qa','completed','failed')),
  period_start date,
  period_end date,
  context jsonb not null default '{}'::jsonb,
  qa_status text not null default 'pending',
  report_status text not null default 'draft',
  created_by uuid references auth.users(id),
  started_at timestamptz,
  completed_at timestamptz,
  created_at timestamptz not null default now()
);
```

Add analogous explicit columns for the remaining entities from the spec. Core relations must be normalised; only engine-specific payloads/provenance may use JSONB.

- [ ] **Step 4: Add indexes and RLS**

Index all `audit_id`, `studio_id`, `client_id`, `observed_at`, `metric_key`, `status` columns used in run/report queries. Enable RLS on every new exposed table. Reuse the existing studio membership/internal-role helpers if available; otherwise create minimal `SECURITY DEFINER` helpers with explicit `search_path`.

- [ ] **Step 5: Add service-only write policy and authenticated studio read policy**

Audit engine writes must be service-role/server controlled. Client users may only read reports/audits for studios they are active members of. Public anonymous access must not exist on canonical audit tables.

- [ ] **Step 6: Run local/static checks**

```bash
node --test tests/golden-audit-schema.test.mjs
npm run lint
npm run build
npx tsc --noEmit
```

- [ ] **Step 7: Add the schema test to CI and commit**

```bash
git add supabase/migrations tests .github/workflows/ci.yml
git commit -m "feat: add canonical Golden Audit data model"
```

---

### Task 2: Implement Deterministic Transaction Parsing and Client Normalisation

**Files:**
- Create: `supabase/functions/_shared/audit/transactions.ts`
- Create: `supabase/functions/_shared/audit/transactions_test.ts`
- Create: `supabase/functions/_shared/audit/identity.ts`
- Create: `supabase/functions/_shared/audit/identity_test.ts`

**Interfaces:**
- Produces `parseTransactionLedger(text: string): ParsedLedger`.
- Produces `normaliseClientLabel(raw: string): string`.
- Produces `detectPotentialDuplicates(rows: ParsedTransaction[]): Set<string>`.

Define:

```ts
export type ParsedTransaction = {
  sourceRow: number;
  date: string;
  rawClient: string;
  normalisedClient: string;
  amountPence: number;
  currency: 'GBP';
  sourceRowKey: string;
};

export type ParsedLedger = {
  rows: ParsedTransaction[];
  rejected: Array<{ sourceRow: number; raw: string; reason: string }>;
  totalPence: number;
};
```

- [ ] **Step 1: Write failing parser tests**

Include fixtures for valid tab-separated rows, `£3.85`, `£0.01`, invalid dates, blank names, commas in currency and duplicate-looking same-day rows.

```ts
Deno.test('parses a GBP transaction without treating it as a session', () => {
  const result = parseTransactionLedger('29/03/2025\tAimee-Mae Rowles\t£50.00\tClients');
  assert(result.rows[0].amountPence === 5000);
  assert(!('session' in result.rows[0]));
});
```

- [ ] **Step 2: Verify failure**

```bash
deno test --allow-net=false supabase/functions/_shared/audit/transactions_test.ts supabase/functions/_shared/audit/identity_test.ts
```

- [ ] **Step 3: Implement strict parser**

Accept `DD/MM/YYYY`, reject malformed rows, round currency safely to pence, preserve raw labels and create stable SHA-256 row keys from source row content.

- [ ] **Step 4: Implement conservative identity normalisation**

Safe automatic normalisation only: trim, collapse whitespace, Unicode normalisation, lowercase, remove non-semantic punctuation. Do not fuzzy-merge distinct-looking names.

- [ ] **Step 5: Implement potential duplicate detection**

Flag rows sharing `(date, normalisedClient, amountPence)`; never drop them automatically.

- [ ] **Step 6: Run tests and commit**

```bash
deno test --allow-net=false supabase/functions/_shared/audit/*_test.ts
git add supabase/functions/_shared/audit
git commit -m "feat: add audit transaction normalisation"
```

---

### Task 3: Build Controlled Source Ingestion and Provenance

**Files:**
- Create: `supabase/functions/golden-audit-ingest/index.ts`
- Create: `supabase/functions/golden-audit-ingest/security_test.ts`
- Create: `supabase/migrations/20260915181000_create_golden_audit_storage.sql` if required.

**Interfaces:**
- Consumes authenticated/internal request `{ audit_id, source_type, storage_path }`.
- Produces one `audit_sources` row, zero or more `audit_raw_records`, `clients`, `client_aliases`, `transactions`, and one `audit_runs` execution record.

- [ ] **Step 1: Write failing security tests**

Assert the function rejects anonymous requests, rejects storage paths outside the approved private bucket/prefix, rejects unsupported source types, and never accepts arbitrary external URLs for transaction ingestion.

- [ ] **Step 2: Implement private source Storage policy**

Use a private bucket such as `audit-sources`. Objects must be namespaced `studio/<studio-id>/audit/<audit-id>/...`. Client users may not directly list other studios' sources.

- [ ] **Step 3: Implement ingestion lifecycle**

Set audit to `normalising`, create an `audit_runs` row with `engine_key='transaction_ingest'`, download the object server-side, hash the exact bytes, create source record, parse, persist source rows and transactions in a transaction-safe order, then mark the run `success` or `failed`.

- [ ] **Step 4: Make ingestion idempotent**

Use `(audit_id, source_hash, source_type)` uniqueness to avoid duplicate ingestion. Re-running the same source must return the existing source ID instead of duplicating transactions.

- [ ] **Step 5: Persist reconciliation summary**

`output_summary` must include `source_rows`, `parsed_rows`, `rejected_rows`, `potential_duplicate_rows`, `total_pence`, `client_aliases_created`.

- [ ] **Step 6: Test and commit**

```bash
deno test --allow-net=false supabase/functions/golden-audit-ingest/security_test.ts supabase/functions/_shared/audit/*_test.ts
git add supabase/functions/golden-audit-ingest supabase/migrations
git commit -m "feat: add provenance-safe audit ingestion"
```

---

### Task 4: Implement Data Quality, Revenue and Client Metrics

**Files:**
- Create: `supabase/functions/_shared/audit/quality.ts`
- Create: `supabase/functions/_shared/audit/quality_test.ts`
- Create: `supabase/functions/_shared/audit/metrics.ts`
- Create: `supabase/functions/_shared/audit/metrics_test.ts`

**Interfaces:**
- Produces `assessTransactionQuality(rows, rejected): QualityResult`.
- Produces `calculateTransactionMetrics(rows, clients, period): AuditMetricInput[]`.

- [ ] **Step 1: Write failing metric tests using a small deterministic fixture**

Assert yearly recorded payments, payment row counts, median payment value, conservative client count, multiple-payment client count, value share from repeat-payment identities, dormant client count and full-year/YTD labelling.

- [ ] **Step 2: Add required `not_measurable` tests**

```ts
Deno.test('retention remains not measurable without booking/cohort data', () => {
  const metrics = calculateMissingOperationalMetrics(['transactions']);
  const retention = metrics.find((m) => m.metricKey === 'retention_rate');
  assert(retention?.measurementStatus === 'not_measurable');
  assert(retention?.requiredSource === 'booking/client cohort records');
});
```

Also assert `enquiry_to_booking_conversion`, `no_show_rate`, `cancellation_rate`, `artist_utilisation` are `not_measurable` for the Daniel Mode B source set.

- [ ] **Step 3: Implement quality assessment**

Return explicit checks for parse success, date range, near-zero values, duplicate candidates, partial-year coverage, unresolved identity share and source-total reconciliation.

- [ ] **Step 4: Implement metric calculators**

All values must be derived only from stored transaction/client rows. Record `CALCULATED` classification and confidence based on identity/data quality. No UK benchmark substitution.

- [ ] **Step 5: Persist metrics/evidence contract**

Create helper builders returning database-ready rows with `calculation_version='transaction-metrics-v1'` and provenance containing source IDs and formula labels.

- [ ] **Step 6: Run tests and commit**

```bash
deno test --allow-net=false supabase/functions/_shared/audit/*_test.ts
git add supabase/functions/_shared/audit
git commit -m "feat: add audit quality and commercial metrics"
```

---

### Task 5: Adapt Website, Search and Competitor Intelligence into Canonical Evidence

**Files:**
- Create: `supabase/functions/golden-audit-website/index.ts`
- Reuse/import where practical: `supabase/functions/studio-visibility-report-v2/security.ts`
- Modify: `supabase/functions/search-intelligence-v1/index.ts` only to add a canonical audit output path without breaking existing visibility reports.
- Create: `supabase/functions/_shared/audit/evidence.ts`
- Create: `supabase/functions/_shared/audit/evidence_test.ts`

**Interfaces:**
- Website engine consumes `{ audit_id }`, loads `studios.website_url`, and writes `audit_sources`/`audit_evidence` observations.
- Search adapter consumes `{ audit_id }`, reuses existing provider/search logic, and writes timestamped evidence plus bounded competitor observations.

- [ ] **Step 1: Write evidence mapping tests**

Assert website observations map `robots noindex`, title, description, canonical, CTA type, placeholder portfolio signal and structured-data presence to `OBSERVED` evidence records with source reference and timestamp.

- [ ] **Step 2: Reuse hardened URL safety**

Do not duplicate SSRF logic. Extract or import the existing `validatePublicUrl`/`assertPublicNetworkTarget` logic into a shared location only if needed, preserving all existing security tests.

- [ ] **Step 3: Extend website snapshot semantics**

Add robots meta parsing, basic JSON-LD detection, `mailto:`/form CTA detection, placeholder-content signals and basic analytics script observation. Keep observations factual; do not diagnose inside the crawler.

- [ ] **Step 4: Add canonical search/competitor adapter**

Existing provider results remain provider-scoped observations, not Google rankings unless the provider genuinely represents Google. Persist `source_provider`, query, observed position, URL/domain and observed time.

- [ ] **Step 5: Bound competitor set**

Persist at most the configured top relevant competitors using geography/style/service/search-overlap rationale in evidence provenance. Do not crawl an unbounded market list.

- [ ] **Step 6: Run existing and new security tests**

```bash
deno test --allow-net=false supabase/functions/studio-visibility-report-v2/security_test.ts supabase/functions/_shared/audit/*_test.ts
```

- [ ] **Step 7: Commit**

```bash
git add supabase/functions
git commit -m "feat: map website and search intelligence into audit evidence"
```

---

### Task 6: Implement Findings, Diagnosis, Opportunity Scoring and Recommendations

**Files:**
- Create: `supabase/functions/_shared/audit/diagnosis.ts`
- Create: `supabase/functions/_shared/audit/diagnosis_test.ts`
- Create: `supabase/functions/_shared/audit/opportunities.ts`
- Create: `supabase/functions/_shared/audit/opportunities_test.ts`

**Interfaces:**
- Produces deterministic rule-backed `FindingInput[]`, `DiagnosisInput[]`, `OpportunityInput[]`, `RecommendationInput[]` from stored metric/evidence/context snapshots.
- Opportunity scoring formula version: `opportunity-score-v1`.

- [ ] **Step 1: Write failing context-gate tests**

Assert a steep revenue decline cannot create a `demand_decline` diagnosis when audit context includes `material_owner_availability_constraint=true` and no demand dataset exists.

- [ ] **Step 2: Write failing dormant-client finding test**

When the dormant-client metric exists with sufficient quality, generate a finding classified `CALCULATED` with confidence inherited from the metric. Do not hard-code Daniel's count.

- [ ] **Step 3: Write failing website-readiness finding tests**

Observed noindex + placeholder portfolio + mailto-only enquiry may support a `digital_acquisition_readiness` finding. The finding statement must reference only stored evidence.

- [ ] **Step 4: Implement opportunity score**

Use bounded 0–100 inputs and versioned weights, for example:

```ts
export function scoreOpportunity(x: {
  impact: number; confidence: number; ease: number; speed: number; costRisk: number;
}) {
  return Math.round(
    x.impact * 0.35 + x.confidence * 0.25 + x.ease * 0.15 + x.speed * 0.15 + (100 - x.costRisk) * 0.10
  );
}
```

Store each component and the formula version. Monetary impact is nullable unless separately supported/modelled.

- [ ] **Step 5: Implement recommendation generation**

Recommendations must reference an `opportunity_id`, state action/mechanism/owner/target metric where available, and sequence into 0–30, 31–60, 61–90 day phases.

- [ ] **Step 6: Test and commit**

```bash
deno test --allow-net=false supabase/functions/_shared/audit/*_test.ts
git add supabase/functions/_shared/audit
git commit -m "feat: add evidence-backed diagnosis and opportunities"
```

---

### Task 7: Build the Canonical Audit Orchestrator

**Files:**
- Create: `supabase/functions/golden-audit-run/index.ts`
- Create: `supabase/functions/golden-audit-run/orchestrator.ts`
- Create: `supabase/functions/golden-audit-run/orchestrator_test.ts`

**Interfaces:**
- `runAudit(auditId: string, deps: AuditDependencies): Promise<AuditRunResult>`.
- Steps: `quality -> transaction_metrics -> website -> search_visibility -> findings -> diagnosis -> opportunities -> recommendations -> report_manifest -> qa`.

- [ ] **Step 1: Write failing dependency-order test**

Use fake engine functions that append to an array; assert diagnosis never runs before evidence/metrics and report never runs before recommendations.

- [ ] **Step 2: Write critical/non-critical failure tests**

Transaction integrity failure => audit `failed`, report blocked. Search provider failure => run marked `partial`, audit continues with coverage warning if website/transaction evidence remains valid.

- [ ] **Step 3: Implement run locking/idempotency**

Use an audit status transition or DB advisory/atomic update so two concurrent requests cannot execute the same active audit. Each engine step checks for an existing successful run with the same input hash before recomputing.

- [ ] **Step 4: Persist every step to `audit_runs`**

Record timestamps, status, retry count, bounded input/output summaries and error code/message. Never store secrets or complete source files in logs.

- [ ] **Step 5: Implement source-aware engine selection**

Mode B with transactions but no enquiries must run transaction/client engines and write not-measurable funnel metrics. It must not call a fake enquiry engine.

- [ ] **Step 6: Test and commit**

```bash
deno test --allow-net=false supabase/functions/golden-audit-run/orchestrator_test.ts supabase/functions/_shared/audit/*_test.ts
git add supabase/functions/golden-audit-run
git commit -m "feat: orchestrate the canonical Golden Audit"
```

---

### Task 8: Build Canonical Report Manifest, QA Gate and Secure Publication

**Files:**
- Create: `supabase/functions/_shared/audit/report.ts`
- Create: `supabase/functions/_shared/audit/report_test.ts`
- Create: `supabase/functions/_shared/audit/qa.ts`
- Create: `supabase/functions/_shared/audit/qa_test.ts`
- Create: `supabase/functions/golden-audit-report/index.ts`

**Interfaces:**
- Produces one immutable `report_versions` manifest referencing canonical audit IDs/sections.
- Produces QA result `{ passed: boolean; checks: QaCheckInput[] }`.

- [ ] **Step 1: Write failing manifest tests**

The report manifest must reference studio/audit IDs, report period, metrics, findings, diagnoses, opportunities, recommendations, coverage warnings and evidence appendix IDs. It must not duplicate authoritative metric values into an unrelated free-text blob.

- [ ] **Step 2: Write failing QA tests**

Block client-ready status when:

- material metric has no provenance;
- `MODELLED` money lacks assumptions;
- unsupported funnel metric is presented as measured;
- critical engine failed;
- report contains a placeholder/null section required by the mode;
- chart/table totals conflict with canonical metrics.

- [ ] **Step 3: Implement QA severity**

`critical`/`high` failures block publication; documented `medium` coverage warnings may allow report publication with visible disclosure.

- [ ] **Step 4: Implement secure token publication**

Generate a high-entropy token, store only a hash where practical, and expose a security-definer RPC/server endpoint that returns the report only when token/audit/report status is valid. Never expose source transaction rows via the public report endpoint.

- [ ] **Step 5: Implement PDF-ready publication metadata**

The same report version drives web and print/PDF. Store `pdf_storage_path` only after a PDF is successfully generated/exported; do not create a second analytical payload.

- [ ] **Step 6: Test and commit**

```bash
deno test --allow-net=false supabase/functions/_shared/audit/*_test.ts
git add supabase/functions/golden-audit-report supabase/functions/_shared/audit
git commit -m "feat: add audit report QA and publication gate"
```

---

### Task 9: Build Internal Audit Workspace and Client Report UI

**Files:**
- Create: `src/features/audit/types.ts`
- Create: `src/features/audit/queries.ts`
- Create: `src/features/audit/components/EvidenceBadge.tsx`
- Create: `src/features/audit/components/AuditRunTimeline.tsx`
- Create: `src/features/audit/components/AuditReport.tsx`
- Create: `src/routes/_authenticated/audits.tsx`
- Create: `src/routes/_authenticated/audits.$auditId.tsx`
- Create: `src/routes/report.$token.tsx`

**Interfaces:**
- Internal routes consume authenticated canonical audit tables/RPCs.
- Public report consumes only the secure published-report endpoint.

- [ ] **Step 1: Add type-safe report/read models**

Define `AuditReportModel` with explicit arrays for metrics/findings/opportunities/recommendations/evidence and `coverageWarnings`.

- [ ] **Step 2: Build `EvidenceBadge`**

Render classification and confidence independently, e.g. `CALCULATED · MEDIUM`. Include accessible text, not colour alone.

- [ ] **Step 3: Build run timeline**

Show engine name, status, started/completed times, records read/written, and failure/coverage warning. No raw secrets/source data.

- [ ] **Step 4: Build `AuditReport`**

Required sections: executive diagnosis, data confidence/coverage, commercial baseline, client intelligence, website/customer journey, search/visibility, competitive position, constraint diagnosis, opportunity register, top recommendations, 90-day plan, evidence appendix.

- [ ] **Step 5: Reuse INKSIGHTS visual system**

Use existing `PublicShell`, typography and navy/mint/ice tokens. Do not create a separate brand language. Print CSS must hide navigation/buttons and preserve readable tables/charts.

- [ ] **Step 6: Add secure print/PDF control**

Initially use a print-optimised route/button against the canonical report. If server PDF generation is later necessary, it must consume the same published report version.

- [ ] **Step 7: Run UI build/type checks**

```bash
npm run lint
npm run build
npx tsc --noEmit
git diff --exit-code -- src/routeTree.gen.ts || true
```

Generate and commit the route tree using the repository's normal build route generation if it changes.

- [ ] **Step 8: Commit**

```bash
git add src src/routeTree.gen.ts
git commit -m "feat: add Golden Audit workspace and client report"
```

---

### Task 10: Seed and Run Daniel Hughes Tattoos as the Golden Mode B Acceptance Test

**Files:**
- Create: `scripts/golden-audit/seed-daniel-hughes.mjs`
- Create: `scripts/golden-audit/README.md`
- Create: `tests/golden-audit-daniel-contract.test.mjs`
- Do not commit the real transaction ledger.

**Interfaces:**
- Script consumes environment values plus a local path/Storage path supplied at runtime.
- Produces/reuses the internal validation studio, creates Audit v1.1 Mode B, attaches context, uploads/registers source and triggers orchestration.

- [ ] **Step 1: Write contract test for safe seed script**

Assert script contains `internal_validation: true`, `mode: 'B'`, audit version `1.1`, and does not contain known client names/transaction values from the private ledger.

- [ ] **Step 2: Implement idempotent studio/audit seed**

Use studio slug `daniel-hughes-tattoos-internal-validation`. Context includes privacy-safe `material_owner_availability_constraint: true`, current price/capacity context required for diagnosis, and no sensitive family-health detail.

- [ ] **Step 3: Materialise/upload the recovered ledger outside git**

Use the previously recovered file as runtime input. Upload to the private audit source bucket or otherwise make it available to the ingestion function. Record source hash.

- [ ] **Step 4: Trigger the full audit**

The script waits/polls canonical audit state only for test observability; it does not perform analysis itself.

- [ ] **Step 5: Assert Golden acceptance invariants**

At minimum:

- source ingested once;
- parsed transaction count reconciles to source parser output;
- transaction total reconciles exactly;
- potential duplicates are flagged, not deleted;
- client identity resolution remains conservative;
- 2026 is marked partial/YTD;
- enquiry/booking/no-show/retention/utilisation metrics are not fabricated;
- website observations include current indexability/CTA/portfolio facts from the live site at run time;
- evidence-backed findings exist;
- at least one diagnosis exists;
- opportunities link to diagnoses;
- recommendations link to opportunities;
- report version exists only after QA;
- rerunning the same audit does not duplicate the source/transactions.

- [ ] **Step 6: Commit the seed harness, not private data**

```bash
git add scripts/golden-audit tests/golden-audit-daniel-contract.test.mjs
git commit -m "test: add Daniel Hughes Golden Audit harness"
```

---

### Task 11: Preview Deployment, Browser QA, PDF QA and Final Verification

**Files:**
- Modify only defects discovered by QA.
- Update: `docs/superpowers/specs/2026-09-15-golden-audit-e2e-design.md` only if implementation reveals an approved design correction.
- Create: `docs/releases/2026-09-15-golden-audit-acceptance.md` after completion.

**Interfaces:**
- Consumes Vercel preview deployment and completed internal audit.
- Produces a recorded pass/fail acceptance document.

- [ ] **Step 1: Run complete CI-equivalent suite**

```bash
npm install --legacy-peer-deps --no-audit --no-fund
npm run lint
npm run build
git diff --exit-code -- src/routeTree.gen.ts
npx tsc --noEmit
node --test tests/*.test.mjs
deno test --allow-net=false supabase/functions/studio-visibility-report-v2/security_test.ts
deno test --allow-net=false supabase/functions/_shared/audit/*_test.ts supabase/functions/golden-audit-*/**/*_test.ts
```

Adjust the final Deno glob to explicit test files if the shell/CI runner does not expand `**`.

- [ ] **Step 2: Deploy protected preview through normal GitHub/Vercel flow**

Do not bypass Deployment Protection. Confirm deployment is READY and inspect runtime errors.

- [ ] **Step 3: Browser QA internal workflow**

Verify desktop and mobile: audit list, Daniel audit detail, run timeline, evidence badges, missing-data states, opportunity links, report generation, QA state and secure report navigation.

- [ ] **Step 4: Browser QA client report**

Check every report section against canonical DB values. Confirm no client names/transaction rows leak into public-facing sections unless intentionally aggregated. Verify print layout and Save/Print PDF output.

- [ ] **Step 5: Validate evidence/provenance manually**

Select at least five material report claims and trace each backwards `report -> finding/metric -> evidence -> source`. Any untraceable material claim fails acceptance.

- [ ] **Step 6: Validate rerun behaviour**

Rerun the Daniel audit with unchanged inputs and confirm idempotent ingestion plus a new/report version policy consistent with the spec; no duplicated financial rows.

- [ ] **Step 7: Write acceptance record**

Document exact audit ID, report version, QA results, any coverage warnings, preview URL/deployment ID, transaction reconciliation, known limitations and whether Golden Audit is `PASS`, `CONDITIONAL PASS`, or `FAIL`.

- [ ] **Step 8: Commit QA fixes and acceptance record**

```bash
git add .
git commit -m "test: verify Golden Audit end to end"
```

---

## Final Definition of Done

Implementation is complete only when all of the following are true:

1. The canonical audit schema exists with RLS and service-controlled writes.
2. Daniel's raw ledger is ingested as a private source artifact without being committed to git.
3. Transaction totals and row counts reconcile to the source parser output.
4. Identity ambiguity and potential duplicates are visible rather than silently rewritten.
5. Website/search/competitor observations are stored with provenance/timestamps.
6. Unsupported operational metrics are explicitly `not_measurable`.
7. Findings are evidence-linked; diagnoses are finding-linked; opportunities are diagnosis-linked; recommendations are opportunity-linked.
8. The orchestrator records every engine run and handles critical/non-critical failure correctly.
9. The client report is rendered from canonical stored intelligence.
10. QA blocks unsupported or internally inconsistent reports.
11. The secure web report is usable on desktop/mobile and can be saved/printed as a branded PDF.
12. The entire audit can be rerun without manually reconstructing analysis or duplicating source transactions.
13. Five sampled material claims can be traced end-to-end to source evidence.
14. The Daniel Golden Audit acceptance record is `PASS` before an external validation studio is recruited.
