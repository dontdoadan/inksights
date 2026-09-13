# INKCARE → INKSIGHTS Cutover Design

**Date:** 2026-09-13  
**Status:** Approved for staged implementation  
**Legacy Supabase:** `cpnkxfgxdoswyigjzvyh`  
**Canonical INKSIGHTS Supabase:** `ukaxsqwnkoqbbsufpzga`

## 1. Purpose

INKCARE is the former brand and technical predecessor of INKSIGHTS. The objective is therefore not to delete a separate product, but to absorb useful INKCARE intellectual property, data structures, workflows and operational evidence into the canonical INKSIGHTS architecture, then retire the old INKCARE namespace and runtime safely.

The legacy Supabase project is treated as **INKSIGHTS Legacy — Migration Source** until cutover gates are complete.

## 2. Desired end state

The dedicated INKSIGHTS Supabase project is the single canonical platform for new INKSIGHTS development and production data. Legacy INKCARE infrastructure has no remaining live external dependencies, scheduled execution or authoritative role.

Canonical INKSIGHTS capabilities include:

- canonical business/studio data;
- metric definitions and metric values;
- evidence, findings and diagnoses;
- Jay Abraham three-growth-lever diagnostics;
- opportunity scoring;
- atomic growth playbooks;
- recommendation → decision → intervention → outcome → attribution → learning;
- search and visibility intelligence;
- reusable diagnostic templates and evidence requirements migrated from the legacy Playbook Intelligence Engine.

## 3. Migration principles

1. **Preserve capability, retire branding.** INKCARE-labelled runtime assets are either translated into INKSIGHTS equivalents or retired after replacement is verified.
2. **Do not duplicate concepts.** Legacy composite playbooks are decomposed into the canonical atomic `intelligence_playbooks` model rather than copied as near-duplicates.
3. **Preserve provenance.** Historical migrations, audit records and dated documents retain their original INKCARE names when renaming would falsify history or create migration drift.
4. **No new product development in legacy.** The legacy project may only receive migration, observability or safety changes required to complete cutover.
5. **Add before subtract.** Replacement structures and routes are deployed and validated before legacy jobs/functions are disabled.
6. **Evidence over assumptions.** No legacy function, cron job, secret or table is retired solely because its name looks obsolete.
7. **Security by default.** Migrated internal intelligence tables are service-role-only, RLS-enabled, and not granted to `anon` or `authenticated` unless a documented user-facing need exists.
8. **Irreversible deletion is last.** The old project is retained through a minimum 14-day quiescence window after all legitimate traffic has been cut over.

## 4. Asset dispositions

Every legacy asset receives exactly one disposition:

- **MIGRATE** — concept and data move substantially intact under an INKSIGHTS identity.
- **TRANSFORM** — useful capability is converted into the canonical INKSIGHTS model.
- **REBUILD** — the legacy implementation is useful as requirements/evidence but the canonical implementation is materially different.
- **ARCHIVE** — retain for provenance, auditability or recovery; do not run in production.
- **RETIRE** — superseded/test-only/dead asset, removable after dependency verification.

## 5. Major subsystem mapping

### 5.1 Playbook Intelligence Engine

Legacy `playbooks` are composite operating systems. The canonical INKSIGHTS library already contains 24 atomic playbooks organised by the three growth levers. Therefore:

- `PB-001 No-Show and Cancellation Revenue Recovery` → **TRANSFORM**. Preserve its diagnostic, evidence requirements, scoring model and opportunity formula. Map interventions to atomic playbooks such as `cancellation_backfill` and future prevention-specific playbooks where evidence supports them.
- `PB-002 Rebooking and Client Retention Growth` → **TRANSFORM** into the existing frequency playbooks such as `next_booking_at_checkout`, `client_recall`, `post_purchase_nurture`, `dormant_customer_reactivation` and related tactics.
- `PB-003 Aftercare and Retail Performance` → **TRANSFORM** into average-transaction-value and frequency opportunities, with aftercare-specific implementation assets retained as domain playbooks where warranted.
- `PB-004 INKCARE Founding Studio Pilot` → **ARCHIVE/COMMERCIAL TRANSFORM**. It is a historical commercial offer/delivery model, not an intelligence playbook.

The reusable diagnostic layer becomes INKSIGHTS-native tables:

- `intelligence_taxonomy`
- `intelligence_source_registry`
- `intelligence_diagnostic_templates`
- `intelligence_diagnostic_questions`

These tables are internal/service-role-only.

### 5.2 Growth/acquisition system

Legacy `growth_*` tables combine acquisition, assessment, subscription, fulfilment and reporting. Their future is split:

- diagnostic/recommendation concepts → canonical intelligence loop;
- real lead/customer data required by the current INKSIGHTS product → migrate only after field-level mapping and classification;
- synthetic/test records → archive, not production-migrate by default;
- old funnel telemetry → preserve as historical evidence unless a current acquisition analysis requires it;
- old automation outbox/workers → retire after current web/app routes are proven independent.

### 5.3 Visibility/search/SEO

Legacy visibility and SEO systems are superseded conceptually by INKSIGHTS Visibility Intelligence v2, Search Intelligence and the studio search universe. Preserve unique source/evidence data only where it improves the canonical system; do not duplicate old SEO tables wholesale.

### 5.4 Command Centre

`inkcare-command-centre` and `command_centre_*` are **REBUILD/ARCHIVE**. The useful concepts are connector health, sync evidence, mappings, alerts and operational metrics. These should become INKSIGHTS platform observability only when needed by current production operations, not a direct table-for-table port.

### 5.5 Commercial and business registry

The legacy project temporarily became an ecosystem registry for INKCARE/INKSIGHTS and other future brands. This is not the desired permanent architecture.

- INKSIGHTS should point authoritatively at `ukaxsqwnkoqbbsufpzga`.
- `inkcare_b2b` becomes a legacy alias/provenance identity rather than an active business identity.
- commercial offers are reviewed individually and either rebranded to INKSIGHTS, archived, or retired.
- unrelated future business namespaces are not migrated into INKSIGHTS merely because they existed in the shared legacy database.

### 5.6 Social automation

Legacy social tables and n8n-era orchestration are **ARCHIVE/RETIRE** unless a current INKSIGHTS content workflow explicitly depends on them. Historical dry-run evidence remains provenance. No live publishing is enabled as part of this migration.

### 5.7 Daniel Hughes Tattoos assets

Tattoo-business functions/tables (`ingest-dht-submission`, `upload-dht-reference`, tattoo commercial tables) are not inherently INKSIGHTS product capabilities. They require a separate destination/cutover and must not be silently folded into INKSIGHTS intelligence tables.

## 6. Branding rules

Active customer-facing and operational runtime surfaces should use `INKSIGHTS` / `inksights` naming.

Do **not** rewrite:

- historical SQL migration filenames already applied;
- immutable audit history;
- dated evidence documents where INKCARE was the true contemporary name;
- historical external identifiers where renaming would break reconciliation.

Instead add explicit metadata/aliases where needed: `legacy_brand = 'INKCARE'`, `canonical_brand = 'INKSIGHTS'`.

## 7. Cutover phases

### Phase A — Preserve and map
- inventory tables/functions/cron/secrets/integrations;
- create disposition matrix;
- preserve unique intelligence IP in canonical INKSIGHTS structures;
- document external dependencies.

### Phase B — Migrate current capabilities
- migrate/rebuild only capabilities still required by current INKSIGHTS;
- update application/configuration to the dedicated project;
- establish canonical connector/source-of-truth records;
- validate current INKSIGHTS flows end-to-end.

### Phase C — Freeze legacy runtime
- stop new product writes to legacy;
- redirect external callers;
- disable legacy cron/workers only after replacements are verified;
- rotate/revoke obsolete credentials.

### Phase D — Quiescence
- observe legacy for at least 14 consecutive days;
- zero legitimate reads/writes/function calls/scheduled jobs;
- investigate any unexpected traffic rather than deleting around it.

### Phase E — Final archive and deletion
- export database schema/data and relevant function/configuration source;
- reconcile record counts and required IP;
- issue final decommission report;
- delete only after explicit final deletion approval.

## 8. Verification gates

Deletion is prohibited until all are true:

1. dedicated INKSIGHTS project is canonical in code and operational routing;
2. all retained legacy IP has a documented destination;
3. no production feature requires a legacy Edge Function;
4. all legacy cron jobs are disabled and replacements validated where required;
5. no external webhook/integration points at the legacy project;
6. obsolete secrets are revoked/rotated;
7. a recoverable final export exists outside the project;
8. 14-day quiescence passes without legitimate traffic;
9. final reconciliation shows no required unmigrated data;
10. deletion is separately authorised.

## 9. Security constraints

- Do not expose service-role credentials to client code.
- New internal tables must enable RLS immediately.
- Do not grant `anon` or `authenticated` access to internal migration/intelligence support tables.
- Explicit grants are required for any Data API access, consistent with Supabase's 2026 Data API exposure changes.
- Public endpoints must retain rate limits, input validation and bounded payloads.
- The existing `public.spatial_ref_sys` RLS advisory is tracked separately; remediation must not be applied without deciding whether PostGIS/client access requires a policy or privilege adjustment.

## 10. Non-goals

This cutover does not:

- delete the legacy Supabase project immediately;
- turn historical sample/test data into verified customer evidence;
- merge unrelated future ventures into INKSIGHTS;
- enable live social publishing;
- rewrite immutable history solely for cosmetic branding consistency.
