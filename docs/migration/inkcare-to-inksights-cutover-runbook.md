# INKCARE → INKSIGHTS Cutover Runbook

**Legacy Supabase:** `cpnkxfgxdoswyigjzvyh`  
**Canonical Supabase:** `ukaxsqwnkoqbbsufpzga`  
**Rule:** This runbook retires the former INKCARE runtime while preserving useful INKSIGHTS IP. It does not authorize project deletion.

## Safety model

- Treat the legacy project as read-mostly migration infrastructure.
- Make additive canonical changes before subtractive legacy changes.
- Prefer disabling schedules over deleting jobs/functions during cutover.
- Preserve queues, audit records and historical identifiers until final export.
- Never transform sample/test evidence into verified customer proof.
- Any unexpected traffic during freeze/quiescence is investigated, not ignored.

## Phase 1 — Canonical capability establishment

### Intelligence IP

- [x] Create service-role-only canonical diagnostic support tables.
- [x] Enable RLS and revoke browser-role privileges.
- [x] Migrate 20 legacy taxonomy records with provenance.
- [x] Migrate 4 governed source records with provenance.
- [x] Transform the Studio Appointment Leakage diagnostic into canonical INKSIGHTS format.
- [x] Migrate 12 evidence-backed diagnostic questions.
- [x] Avoid duplicating composite legacy playbooks inside the 24 atomic canonical playbooks.

### Contact intake

- [x] Create canonical `public_contact_requests` table.
- [x] Deploy canonical `public-contact-intake` Edge Function.
- [x] Restrict accepted production origins to INKSIGHTS domains.
- [x] Add validation, honeypot, body-size bound and hashed rate limiting.
- [x] Integration-test canonical function: expected HTTP 200 and canonical row classification.
- [x] Remove controlled integration-test row after verification.
- [x] Update migration branch `/contact` route to call the canonical project explicitly.
- [ ] Deploy migration branch and browser-smoke-test the live contact form.

## Phase 2 — Legacy runtime freeze

### Stripe worker

Evidence required before freeze:

- [x] Live connected INKSIGHTS Stripe account checked for webhook endpoints: zero found.
- [x] Legacy subscription events checked: six processed, no unprocessed/error events.
- [x] Remaining legacy growth clients checked: two `internal_test` records.
- [x] `stripe-sync-worker` schedule disabled via `cron.alter_job`.
- [ ] After observation, revoke Stripe worker/webhook secrets used only by legacy.
- [ ] After final export, retire legacy Stripe Edge Functions.

### Growth automation worker

Evidence required before freeze:

- [x] Queue inspected.
- [x] Three queued jobs traced to one self-test lead.
- [x] HubSpot checked: corresponding contact already exists.
- [x] Current INKSIGHTS Revenue Audit route is canonical and independent of legacy worker.
- [x] `growth-automation-worker` schedule disabled via `cron.alter_job`.
- [ ] Preserve queue rows as migration evidence until final export.
- [ ] After observation, revoke `growth_worker_secret` if no remaining function needs it.

### Search intelligence maintenance

Evidence required before freeze:

- [x] Legacy `search-console-sync` inspected and found hard-coded to former INKCARE semantics/domain.
- [x] Canonical Search Intelligence v1 exists.
- [x] `seo_refresh_opportunities()` and `seo_publish_command_centre_metrics()` inspected.
- [x] Legacy Search Console property is `sc-domain:getinkcare.co.uk`, status `awaiting_authorization`.
- [x] Legacy `seo_query_daily` contains zero rows and therefore no current Search Console observations.
- [x] Legacy `seo_opportunities` contains zero rows.
- [x] The daily job only republishes legacy Command Centre metrics from that empty/stale SEO source.
- [x] `inkcare-search-intelligence-maintenance` schedule disabled via `cron.alter_job` on 2026-09-14.
- [ ] Rebuild Search Console ingestion later only if it becomes a deliberate canonical INKSIGHTS requirement.

## Phase 3 — Legacy Edge Function retirement

For each function, record one of: `replacement verified`, `no caller`, `historical only`, `separate destination required`.

### Superseded by canonical INKSIGHTS

- [ ] `growth-lead-intake` → Revenue Audit / canonical intelligence flow.
- [ ] `growth-report-generate` → canonical Revenue Audit/visibility reporting.
- [ ] `growth-funnel-event` → retire after no caller is confirmed.
- [ ] `visibility-watch*` → Visibility Intelligence v2 / Search Intelligence.
- [ ] `visibility-fix-*` → archive historical offer workflow unless reintroduced deliberately.
- [x] legacy `public-contact-intake` → canonical replacement exists and passed integration test; legacy endpoint remains deployed only for rollback until route cutover is live.
- [x] `studio-growth-check` legacy hosted page → canonical site route is the intended replacement; old function is INKCARE-branded and should not be migrated.

### Historical/test-only Stripe

- [ ] `growth-stripe-webhook`
- [ ] `growth-stripe-webhook-test`
- [ ] `stripe-setup`
- [ ] `stripe-webhook`
- [ ] `stripe-worker`
- [ ] `stripe-test-manager`
- [ ] `stripe-live-webhook-manager`
- [ ] `stripe-support-url-repair`

### Legacy operations / observability

- [ ] `inkcare-command-centre` — archive source; rebuild only current observability requirements.
- [ ] `inkcare-social-assets` — archive/retire after social evidence export.
- [ ] `inkcare-support` — inspect current callers before retirement.
- [ ] `commercial-reconcile` — determine whether any current commercial process depends on it.

### Separate Daniel Hughes Tattoos destination

- [x] DHT backend confirmed isolated in the `daniel_hughes_tattoos` schema rather than INKSIGHTS tables.
- [x] DHT current production site inspected: current landing page uses email enquiry only and does not invoke Supabase.
- [x] DHT backend data checked: 0 submissions, 0 assets, 0 submission events; one historic rate-limit row.
- [ ] `ingest-dht-submission` — preserve as separate-business standby source or rebuild only when the tattoo site needs structured intake.
- [ ] `upload-dht-reference` — preserve as separate-business standby source or rebuild only when the tattoo site needs reference uploads.

No function is deleted merely because it contains `inkcare` in its name.

## Phase 4 — Registry/source-of-truth cleanup

- [ ] Snapshot `business_registry`, `connector_accounts`, `business_routing_rules`.
- [ ] Make canonical INKSIGHTS project ref authoritative in current metadata/configuration.
- [ ] Convert `inkcare_b2b` from an active identity into a legacy alias/provenance identity where schema constraints allow.
- [ ] Normalize current identity to `inksights_b2b` in new canonical records.
- [ ] Do not mutate legacy foreign-key keys while remaining legacy functions depend on them.
- [ ] Remove false assertion that the old Supabase project is authoritative for current INKSIGHTS.

## Phase 5 — Documentation/brand cleanup

- [x] Add legacy banner to `docs/replication/README.md`.
- [ ] Add legacy banner to `docs/replication/CURRENT_INKCARE_BASELINE.md`.
- [ ] Add legacy banner to remaining dated replication runbooks where useful.
- [x] Preserve original historical names and dates below the banner.
- [ ] Search active product code/copy for `INKCARE`, `inkcare`, `getinkcare.co.uk` and old project ref.
- [ ] Replace only current/future references; retain provenance references explicitly marked legacy.

## Phase 6 — Repository/database reconciliation

Canonical production migrations recovered into the cutover branch:

- [x] `20260911024506_create_uk_studio_intelligence_registry`
- [x] `20260913014953_secure_visibility_public_report_payload`
- [x] `20260913044331_create_canonical_growth_engine_v1`
- [x] `20260913044539_index_growth_engine_foreign_keys`
- [x] `20260913225306_create_intelligence_diagnostic_support`
- [x] `20260913225333_seed_legacy_intelligence_assets`
- [x] `20260913225357_tighten_intelligence_diagnostic_support_grants`
- [x] `20260913230122_create_public_contact_requests`

These files represent the applied production statements in source-control form. Merge remains gated on CI/build/deployment verification.

## Phase 7 — Deployment verification

Before merging the migration branch:

1. run policy/unit tests;
2. run lint/type checks if configured;
3. run production build;
4. inspect changed files;
5. deploy preview or production through the normal Git/Vercel path;
6. smoke-test:
   - `/`
   - `/contact`
   - `/studio-growth-check`
   - `/studio-visibility-report`
   - canonical Revenue Audit endpoint
   - canonical visibility endpoint
   - canonical search endpoint;
7. verify no new runtime errors;
8. verify canonical contact write and remove the controlled test record;
9. search deployed/current source for old Supabase project ref.

Current verification state:

- [x] PR changed-file set inspected.
- [x] PR reports mergeable against `main`.
- [ ] GitHub CI for the latest head must finish green.
- [ ] Vercel preview for the cutover branch has not yet appeared and must be resolved before merge.

## Phase 8 — Credential retirement

After all callers are cut over:

- [ ] inventory legacy secret names again;
- [ ] revoke production/test Stripe webhook secrets belonging only to retired endpoints;
- [ ] revoke legacy Stripe worker secret;
- [ ] revoke growth automation worker secret;
- [ ] revoke legacy Command Centre control token after its endpoint is frozen;
- [ ] keep only credentials required for final read/export operations;
- [ ] do not expose secret values in reports or commits.

## Phase 9 — Quiescence

Start the clock only when:

- all legacy scheduled jobs are inactive;
- all current public traffic routes to canonical INKSIGHTS or a separate intended business backend;
- no legitimate integration is expected to write to legacy.

The first condition is now satisfied: cron jobs 2, 3 and 4 are inactive. The quiescence clock is **not started** because public legacy Edge Functions remain reachable and the migration branch has not yet completed live route cutover.

Observe for **14 consecutive days** after all conditions are met.

Monitor:

- latest write timestamps on legacy operating tables;
- Edge Function invocation evidence/logs where available;
- cron job state and run history;
- new funnel/contact/lead/subscription records;
- unexpected external webhook/API activity;
- user-facing failures in INKSIGHTS production.

Any legitimate legacy traffic resets the relevant investigation/cutover gate.

## Phase 10 — Final archive and deletion decision

Before deletion readiness can be marked green:

- [ ] export legacy database schema/data needed for recovery;
- [ ] preserve Edge Function source/configuration externally;
- [ ] preserve historical migration/audit evidence;
- [ ] verify Storage still contains no required objects or export any that appear;
- [ ] reconcile migrated diagnostic/IP counts;
- [ ] reconcile any verified customer/commercial data;
- [ ] document intentionally non-migrated test/sample data;
- [ ] issue `inkcare-to-inksights-final-decommission-report.md`;
- [ ] obtain separate explicit user approval for irreversible deletion.

## Rollback

If disabling a legacy schedule causes a verified regression before final retirement:

```sql
select cron.alter_job(job_id := <job_id>, active := true);
```

Reactivation is temporary. Record the dependency, repair the canonical replacement, validate it, then restart the freeze.

## Current state snapshot — 2026-09-14

```text
Legacy cron 2  stripe-sync-worker                      INACTIVE
Legacy cron 3  growth-automation-worker                INACTIVE
Legacy cron 4  inkcare-search-intelligence-maintenance INACTIVE
Legacy project deletion                                PROHIBITED
Canonical INKSIGHTS development                        ACTIVE
14-day quiescence                                      NOT STARTED
```
