# INKCARE → INKSIGHTS Cutover Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Absorb reusable INKCARE capabilities into the canonical INKSIGHTS platform, eliminate active INKCARE branding/runtime dependencies, and prepare the legacy Supabase project for safe retirement without losing IP or evidence.

**Architecture:** Treat `cpnkxfgxdoswyigjzvyh` as a read-mostly migration source and `ukaxsqwnkoqbbsufpzga` as the canonical destination. Use additive migrations first, transform legacy composite concepts into the existing intelligence model, then cut traffic and scheduled execution only after replacement paths verify successfully.

**Tech Stack:** Supabase/Postgres, Supabase Edge Functions, TypeScript/Deno, TanStack Start, Vercel, GitHub, Stripe.

**Spec:** `docs/superpowers/specs/2026-09-13-inkcare-to-inksights-cutover-design.md`

## Global Constraints

- Do not delete the legacy project during this implementation.
- Do not disable a legacy runtime dependency until its caller/replacement is verified.
- Do not rename already-applied historical migration files.
- Do not migrate synthetic/test data into production truth tables unless explicitly classified as test/provenance.
- All new internal public-schema tables: RLS enabled; `anon` and `authenticated` privileges revoked; service role receives only required privileges.
- All new product work targets `ukaxsqwnkoqbbsufpzga`.
- Preserve a 14-day quiescence window before final deletion approval.

---

### Task 1: Establish migration governance and asset matrix

**Files:**
- Create: `docs/migration/inkcare-to-inksights-asset-matrix.md`
- Create: `docs/migration/inkcare-to-inksights-cutover-runbook.md`

**Interfaces:**
- Consumes: live inventories from both Supabase projects.
- Produces: one disposition and destination for every major legacy subsystem.

- [ ] **Step 1:** Record project refs, current Edge Functions, cron jobs, core table families, storage buckets, integrations and known active traffic.
- [ ] **Step 2:** Assign `MIGRATE`, `TRANSFORM`, `REBUILD`, `ARCHIVE`, or `RETIRE` to each major asset.
- [ ] **Step 3:** Record cutover preconditions and verification evidence for anything marked `RETIRE`.
- [ ] **Step 4:** Commit the governance documents.

### Task 2: Add canonical diagnostic-support structures

**Files:**
- Create: `supabase/migrations/<server-issued-version>_create_intelligence_diagnostic_support.sql`

**Interfaces:**
- Produces:
  - `public.intelligence_taxonomy`
  - `public.intelligence_source_registry`
  - `public.intelligence_diagnostic_templates`
  - `public.intelligence_diagnostic_questions`

- [ ] **Step 1:** Create additive tables with UUID primary keys where appropriate, unique natural keys, timestamps and JSONB configuration fields.
- [ ] **Step 2:** Enable RLS on all four tables.
- [ ] **Step 3:** Revoke all table privileges from `anon` and `authenticated`.
- [ ] **Step 4:** Grant required CRUD privileges to `service_role` only.
- [ ] **Step 5:** Add foreign key from diagnostic questions to diagnostic templates with cascade delete restricted to internal administration.
- [ ] **Step 6:** Apply migration to canonical INKSIGHTS production.
- [ ] **Step 7:** Verify tables, RLS and grants.

### Task 3: Transform unique legacy Playbook Intelligence IP

**Files:**
- Create: `supabase/migrations/<server-issued-version>_seed_legacy_intelligence_assets.sql`
- Update: `docs/migration/inkcare-to-inksights-asset-matrix.md`

**Interfaces:**
- Consumes: legacy taxonomy, source registry, `Studio Appointment Leakage Diagnosis`, and its 12 questions.
- Produces: INKSIGHTS-native taxonomy/source/diagnostic records with provenance metadata.

- [ ] **Step 1:** Insert the 20 legacy taxonomy values with canonical keys and `legacy_brand='INKCARE'` provenance metadata.
- [ ] **Step 2:** Insert the four approved source-governance records, rebranding the internal product-library display label to `INKSIGHTS Legacy Product Library` while preserving its source URL and legacy name in metadata.
- [ ] **Step 3:** Insert `studio_appointment_leakage_v1` diagnostic template with the legacy scoring model and opportunity formula.
- [ ] **Step 4:** Insert the 12 evidence-backed diagnostic questions using natural-key/idempotent upserts.
- [ ] **Step 5:** Record mapping from this composite diagnostic to relevant canonical growth lever/playbook concepts in metadata rather than creating duplicate `intelligence_playbooks` rows.
- [ ] **Step 6:** Verify exact row counts and uniqueness.

### Task 4: Resolve legacy INKCARE/INKSIGHTS identity split

**Files:**
- Update: `docs/migration/inkcare-to-inksights-asset-matrix.md`

**Interfaces:**
- Consumes: `business_registry`, `connector_accounts`, `business_routing_rules` in legacy.
- Produces: documented canonical identity: INKSIGHTS = `ukaxsqwnkoqbbsufpzga`; INKCARE = legacy alias/provenance.

- [ ] **Step 1:** Snapshot rows referencing `inkcare_b2b` and `inksight_b2b`.
- [ ] **Step 2:** Determine which rows are operational dependencies versus stale registry metadata.
- [ ] **Step 3:** Update only metadata/status records that can be changed without breaking foreign-key-constrained legacy workers; do not rewrite constrained business keys while workers still run.
- [ ] **Step 4:** Mark the old Supabase connector as legacy/migration-source and the dedicated project as the canonical destination in migration documentation/metadata where schema permits.
- [ ] **Step 5:** Verify legacy workers continue to execute until intentional cutover.

### Task 5: Trace and cut over application/runtime dependencies

**Files:**
- Inspect/modify as required:
  - `src/integrations/supabase/*`
  - `src/routes/api/*`
  - `supabase/functions/*`
  - `vercel.json`
  - repository workflows and environment-variable references

**Interfaces:**
- Produces: no current INKSIGHTS code path referencing `cpnkxfgxdoswyigjzvyh`.

- [ ] **Step 1:** Search repository default and migration branch for old project ref/URL and INKCARE runtime endpoint names.
- [ ] **Step 2:** Verify production Supabase configuration points to `ukaxsqwnkoqbbsufpzga`.
- [ ] **Step 3:** Identify current website calls to contact, revenue-audit, visibility and search functions.
- [ ] **Step 4:** Deploy missing replacement function only where an active route demonstrably depends on it.
- [ ] **Step 5:** Smoke-test production routes/functions after each cutover.

### Task 6: Classify legacy Edge Functions

**Files:**
- Update: `docs/migration/inkcare-to-inksights-asset-matrix.md`
- Update: `docs/migration/inkcare-to-inksights-cutover-runbook.md`

**Interfaces:**
- Consumes: source of every legacy Edge Function.
- Produces: replacement/destination and retirement gate per function.

- [ ] **Step 1:** Classify growth acquisition/fulfilment functions.
- [ ] **Step 2:** Classify Visibility Watch functions against Visibility Intelligence v2/Search Intelligence.
- [ ] **Step 3:** Classify Stripe functions against current Stripe architecture.
- [ ] **Step 4:** Classify command-centre/social/support functions.
- [ ] **Step 5:** Classify Daniel Hughes Tattoos functions as a separate destination, not INKSIGHTS core.
- [ ] **Step 6:** Do not undeploy functions until caller checks and replacement verification are green.

### Task 7: Retire obsolete INKCARE branding in active documentation/runtime surfaces

**Files:**
- Preserve unchanged: already-applied historical migration filenames.
- Update current docs/copy/config where INKCARE is incorrectly presented as the current brand.
- Add legacy headers to `docs/replication/*` rather than rewriting historical facts.

**Interfaces:**
- Produces: current operational documentation calls the product INKSIGHTS while historical artefacts remain truthful.

- [ ] **Step 1:** Add a clear legacy banner to historical INKCARE replication docs.
- [ ] **Step 2:** Replace current-brand references only where they describe present/future system state.
- [ ] **Step 3:** Preserve historical identifiers/commit evidence.
- [ ] **Step 4:** Build/test repository.

### Task 8: Prepare legacy freeze

**Files:**
- Update: `docs/migration/inkcare-to-inksights-cutover-runbook.md`

**Interfaces:**
- Consumes: verified replacement coverage from Tasks 5–7.
- Produces: safe, reversible freeze procedure.

- [ ] **Step 1:** Record baseline counts/timestamps for active legacy tables and cron jobs.
- [ ] **Step 2:** Confirm no Stripe webhook endpoint targets legacy.
- [ ] **Step 3:** Confirm no Vercel/GitHub current config targets legacy.
- [ ] **Step 4:** Disable legacy cron jobs only after each job's role is explicitly `replaced` or `retired`.
- [ ] **Step 5:** Observe for errors/failed customer journeys immediately after freeze.

### Task 9: Credential and external-integration cleanup

**Interfaces:**
- Produces: no obsolete secret or external integration can continue writing to legacy.

- [ ] **Step 1:** Inventory secret names without exposing values.
- [ ] **Step 2:** Rotate/revoke secrets associated solely with retired functions/workers.
- [ ] **Step 3:** Keep credentials required by any remaining migration/export process until that process completes.
- [ ] **Step 4:** Re-run external endpoint audit.

### Task 10: Quiescence and final retirement package

**Files:**
- Create: `docs/migration/inkcare-to-inksights-final-decommission-report.md`

**Interfaces:**
- Produces: evidence package required for a separate final deletion decision.

- [ ] **Step 1:** Start 14-day quiescence clock after legacy scheduled/runtime writes are disabled.
- [ ] **Step 2:** Check database writes, Edge Function traffic and unexpected external calls throughout the window.
- [ ] **Step 3:** Export final database/schema/configuration/function source outside the legacy project.
- [ ] **Step 4:** Reconcile required row counts/IP against canonical INKSIGHTS.
- [ ] **Step 5:** Document residual historical-only assets and any intentionally non-migrated data.
- [ ] **Step 6:** Mark deletion readiness `READY` only if every design-spec gate is green.
- [ ] **Step 7:** Obtain separate explicit approval before deleting `cpnkxfgxdoswyigjzvyh`.

## Verification commands / checks

After database changes:

```sql
select tablename, rowsecurity
from pg_tables
where schemaname='public'
  and tablename in (
    'intelligence_taxonomy',
    'intelligence_source_registry',
    'intelligence_diagnostic_templates',
    'intelligence_diagnostic_questions'
  )
order by tablename;
```

```sql
select grantee, table_name, privilege_type
from information_schema.role_table_grants
where table_schema='public'
  and table_name in (
    'intelligence_taxonomy',
    'intelligence_source_registry',
    'intelligence_diagnostic_templates',
    'intelligence_diagnostic_questions'
  )
order by table_name, grantee, privilege_type;
```

Expected: all four tables have RLS; no `anon` or `authenticated` grants; only required service-role access.

After legacy runtime freeze:

```sql
select jobid, schedule, active
from cron.job
order by jobid;
```

Expected only after cutover: legacy jobs inactive/removed according to runbook.

Deletion is outside this implementation plan until a separate final approval is given.
