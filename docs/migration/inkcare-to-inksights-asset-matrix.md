# INKCARE → INKSIGHTS Asset Disposition Matrix

**Audit date:** 2026-09-13  
**Legacy project:** `cpnkxfgxdoswyigjzvyh`  
**Canonical project:** `ukaxsqwnkoqbbsufpzga`  
**Operating interpretation:** INKCARE is the former brand/technical predecessor of INKSIGHTS. The legacy project is an INKSIGHTS migration source, not a separate current product.

## Disposition legend

| Disposition | Meaning |
| --- | --- |
| **MIGRATE** | Move the useful concept/data substantially intact into canonical INKSIGHTS. |
| **TRANSFORM** | Preserve the capability/IP but map it into the newer canonical model. |
| **REBUILD** | Preserve requirements/evidence; implement differently in INKSIGHTS. |
| **ARCHIVE** | Preserve for history, auditability or recovery; do not operate as current production. |
| **RETIRE** | Superseded/test-only/dead runtime. Remove only after its cutover gate is verified. |

## Executive status

| Domain | Legacy state | Canonical state | Disposition | Cutover status |
| --- | --- | --- | --- | --- |
| Brand identity | INKCARE + mixed INKSIGHT naming | INKSIGHTS | TRANSFORM | In progress |
| Canonical Supabase target | Legacy monolith | Dedicated INKSIGHTS project | RETIRE legacy authority | Canonical project established |
| Playbook Intelligence | Rich prototype | Atomic 24-playbook growth engine | TRANSFORM | Unique diagnostic IP migrated |
| Revenue Audit / Growth Check | Legacy growth engine + public function | `revenue-audit-v1` | RETIRE old route | Canonical route exists |
| Visibility intelligence | Visibility Watch + growth tables | Visibility Intelligence v2 | RETIRE/ARCHIVE | Canonical route exists |
| Search intelligence | INKCARE Search Intelligence / SEO jobs | Search Intelligence v1 | TRANSFORM/RETIRE | Partial; legacy daily job still active |
| Contact intake | INKCARE contact/outbox | Canonical INKSIGHTS contact store/function | RETIRE old route | Replacement deployed and integration-tested |
| Stripe workers | Legacy reconciliation/test stack | No current webhook dependency | RETIRE | Legacy schedule disabled 2026-09-13 |
| HubSpot automation worker | Legacy queue | Existing contact already synced; canonical product not dependent | RETIRE | Legacy schedule disabled 2026-09-13 |
| Command Centre | INKCARE private ops UI/API | No direct table-for-table replacement intended | ARCHIVE/REBUILD selectively | Not frozen yet |
| Social automation | Dry-run/n8n-era system | No current core dependency | ARCHIVE/RETIRE | Pending freeze |
| Commercial registry | Shared multi-brand registry | INKSIGHTS should be canonical only | TRANSFORM/ARCHIVE | Identity cleanup pending |
| Daniel Hughes Tattoos backend | Mixed into legacy monolith | Separate business/site | REBUILD/MOVE OUT | Must not be absorbed into INKSIGHTS core |
| Storage | Six empty private buckets | Dedicated project storage as required | ARCHIVE/RETIRE | No object migration required currently |

## 1. Playbook Intelligence Engine

| Legacy asset | Evidence/state | Canonical destination | Disposition | Status / gate |
| --- | --- | --- | --- | --- |
| `playbook_taxonomy` | 20 taxonomy rows | `intelligence_taxonomy` | MIGRATE | **Done:** 20 rows migrated with provenance |
| `playbook_source_registry` | 4 approved sources | `intelligence_source_registry` | MIGRATE | **Done:** 4 sources migrated; product library display rebranded while preserving legacy name |
| `playbook_diagnostics` | 1 composite diagnostic | `intelligence_diagnostic_templates` | TRANSFORM | **Done:** `studio_appointment_leakage` v1 migrated |
| `playbook_diagnostic_questions` | 12 evidence-backed questions | `intelligence_diagnostic_questions` | MIGRATE | **Done:** 12 questions migrated |
| `playbooks` PB-001 | No-show/cancellation recovery operating system | atomic playbooks + diagnostic template | TRANSFORM | Composite not duplicated; currently maps to `cancellation_backfill`, with prevention gaps recorded |
| `playbooks` PB-002 | Rebooking/retention operating system | frequency playbooks | TRANSFORM | Concepts already covered by canonical rebooking/recall/reactivation/nurture playbooks |
| `playbooks` PB-003 | Aftercare/retail operating system | ATV/frequency/domain tactics | TRANSFORM | Preserve domain tactics only when they add unique intervention detail |
| `playbooks` PB-004 | INKCARE Founding Studio Pilot | commercial history | ARCHIVE | Not an intelligence playbook; preserve as offer/provenance evidence |
| `playbook_candidates` | candidate ideas | canonical opportunity/playbook backlog | ARCHIVE/SELECTIVE TRANSFORM | Review candidates individually before importing |
| workflow/QA/performance/doc tables | prototype workflow evidence | canonical recommendation/action/result loop where useful | ARCHIVE/SELECTIVE TRANSFORM | No wholesale copy |

## 2. Canonical INKSIGHTS intelligence loop

The dedicated INKSIGHTS project is authoritative for new development. Existing canonical families include:

- `intelligence_metric_definitions`
- `intelligence_metric_values`
- `intelligence_evidence`
- `intelligence_findings`
- `intelligence_diagnoses`
- `intelligence_recommendations`
- `intelligence_decisions`
- `intelligence_interventions`
- `intelligence_outcomes`
- `intelligence_attributions`
- `intelligence_learning`
- `intelligence_business_profiles`
- `intelligence_growth_diagnostics`
- `intelligence_opportunity_scoring_versions`
- `intelligence_opportunity_scores`
- `intelligence_playbooks`
- newly migrated diagnostic-support tables

No legacy INKCARE table should replace these canonical objects.

## 3. Growth / acquisition / fulfilment system

| Legacy asset/function | Finding | Destination | Disposition | Gate/status |
| --- | --- | --- | --- | --- |
| `growth_leads` | mix of historic/test acquisition records | preserve as historic lead evidence unless specifically needed | ARCHIVE | Do not mass-import into canonical truth tables |
| `growth_assessments` | predecessor diagnostic outputs | canonical intelligence loop / Revenue Audit | TRANSFORM | Migrate only evidence needed for case-study/provenance work |
| `growth_clients` | 2 remaining records classified `internal_test` | none required | ARCHIVE/RETIRE | No verified client migration needed from these rows |
| `growth_funnel_events` | only 9 page views in 14-day audit + one assessment-routing event | current product analytics if later required | ARCHIVE/RETIRE | Residual telemetry; caller removal should be verified before function deletion |
| `growth_automation_jobs` | 3 queued HubSpot jobs all point to same self-test lead; contact already exists in HubSpot | none | RETIRE | Cron disabled; leave queue evidence intact for audit |
| `growth_subscription_events` | 6 events, all processed by 2026-07-19, zero processing errors | none | ARCHIVE | Stripe cron disabled |
| `growth_delivery_log` | old fulfilment evidence | canonical interventions/outcomes only if useful | ARCHIVE/SELECTIVE TRANSFORM | No live dependency found |
| `growth-report-generate` | predecessor report engine | canonical Revenue Audit / visibility reports | RETIRE | Keep source until final archive |
| `growth-lead-intake` | predecessor public growth intake | `revenue-audit-v1` | RETIRE | Current `/studio-growth-check` uses canonical function |
| `growth-booking-request` | predecessor call-request workflow | future canonical booking/CTA if needed | ARCHIVE/REBUILD | Do not carry forward automatically |
| `growth-onboarding` | predecessor paid-client onboarding | future product onboarding | ARCHIVE/REBUILD | No current verified live client dependency |
| `growth-funnel-event` | residual page telemetry | none/current analytics | RETIRE | Stop caller before undeploy |
| `growth-automation-worker` | processed old email/HubSpot jobs; only duplicate self-test backlog remains | none | RETIRE | **Schedule disabled 2026-09-13** |

## 4. Stripe

| Asset | Finding | Disposition | Status |
| --- | --- | --- | --- |
| `stripe-sync-worker` cron | every 15 min; recent successful runs returned zero rows | RETIRE | **Disabled 2026-09-13** |
| `stripe-worker` | reconciles legacy subscription ledger | ARCHIVE/RETIRE | Source retained; schedule disabled |
| `growth-stripe-webhook` | legacy production webhook handler | RETIRE | Connected live INKSIGHTS Stripe account currently exposes no webhook endpoints |
| `growth-stripe-webhook-test` | synthetic test handler | ARCHIVE/RETIRE | Test-only |
| `stripe-webhook`, `stripe-live-webhook-manager`, `stripe-test-manager`, `stripe-setup` | historical/payment setup tooling | ARCHIVE/RETIRE | No current endpoint duty proven |
| Stripe Vault secret names | live/test signing + worker secrets remain | ROTATE/REVOKE | Revoke only after all legacy Stripe functions are frozen/exported |

## 5. Contact intake

| Asset | Finding | Destination | Disposition | Status |
| --- | --- | --- | --- | --- |
| legacy `public-contact-intake` | hard-coded `getinkcare.co.uk`, INKCARE email/copy, old outbox tables | canonical `public-contact-intake` | RETIRE | Replacement deployed |
| legacy contact/outbox tables | old messaging architecture | `public_contact_requests` for current form | ARCHIVE | Do not copy old operational plumbing wholesale |
| canonical `public_contact_requests` | canonical INKSIGHTS secure contact store | canonical | KEEP | Created with RLS and service-role-only grants |
| canonical `public-contact-intake` | validates, honeypot, origin control, hashed rate limiting, canonical write | canonical | KEEP | Integration test returned HTTP 200; controlled test row removed |
| `/contact` frontend | previously depended on build-time Supabase client target | explicit canonical function URL | TRANSFORM | Branch now pins canonical project URL |

## 6. Visibility / search / SEO

| Legacy asset | Finding | Destination | Disposition | Status/gate |
| --- | --- | --- | --- | --- |
| `visibility-watch` family | predecessor visibility product | Visibility Intelligence v2 | RETIRE/ARCHIVE | Canonical `studio-visibility-report-v2` exists |
| `visibility-watch-api` | proxy into old growth/visibility functions | canonical visibility/search routes | RETIRE | No reason to migrate proxy architecture |
| `visibility-fix-*` | old onboarding/welcome/offer flows | historical offer evidence | ARCHIVE/RETIRE | Do not migrate without a current offer requirement |
| `search-console-sync` | hard-coded legacy domain/Command Centre semantics | future canonical Search Console sync if needed | REBUILD/RETIRE | **Do not migrate as-is** |
| `seo_*` tables | legacy SEO opportunity/observation system | Search Intelligence / Visibility Intelligence | SELECTIVE TRANSFORM | Preserve unique evidence only |
| cron job 4 `inkcare-search-intelligence-maintenance` | daily calls legacy SEO refresh + Command Centre publishing | canonical search/visibility maintenance or retirement | TRANSFORM/RETIRE | **Still active pending caller/output reconciliation** |

## 7. Command Centre / observability

| Asset | Finding | Destination | Disposition | Status/gate |
| --- | --- | --- | --- | --- |
| `inkcare-command-centre` | large authenticated legacy ops API over INKCARE/growth/connector/social/test tables | future INKSIGHTS observability only where current need exists | ARCHIVE/REBUILD | Do not port table-for-table |
| `command_centre_metrics` | 281 historic metrics at audit | canonical observability selectively | ARCHIVE/SELECTIVE TRANSFORM | Preserve export |
| `command_centre_connector_health` | 12 rows | future connector health | SELECTIVE TRANSFORM | Rebuild around current connectors if operationally needed |
| `command_centre_sync_runs` | 16 historic runs | evidence/provenance | ARCHIVE | Preserve |
| `command_centre_entity_mappings` | 6 mappings | provider reconciliation if current | SELECTIVE TRANSFORM | Review current relevance first |
| `command_centre_alerts` | 23 historic alerts | future observability | ARCHIVE/SELECTIVE TRANSFORM | Preserve history |
| `inkcare_control_tokens` | command-centre auth token record | none after retirement | RETIRE | Revoke after endpoint frozen |
| `inkcare_audit_log` | legacy audit trail | historical provenance | ARCHIVE | Never cosmetically rewrite history |

## 8. Social automation

| Asset | Finding | Disposition | Status/gate |
| --- | --- | --- | --- |
| `campaign_library` | 2 records | ARCHIVE/SELECTIVE TRANSFORM | Preserve useful content IP only |
| `social_content_queue` | 5 queued items from dry-run migration | ARCHIVE | No live publishing inferred |
| `publication_log` | 10 dry-run validations | ARCHIVE | Provenance only |
| `social_automation_settings` | DRY_RUN / migration-era controls | RETIRE after export | Do not enable live publishing as part of cutover |
| `inkcare-social-assets` | legacy asset support | ARCHIVE/RETIRE | No current core dependency |
| n8n-era migration state | historical orchestration | ARCHIVE | n8n trial/legacy workflow is not a canonical dependency |

## 9. Business/commercial registry

| Legacy asset | Finding | Destination | Disposition | Status/gate |
| --- | --- | --- | --- | --- |
| `business_registry` | five brands all reference old Supabase project | canonical INKSIGHTS identity + historical aliases | TRANSFORM | Do not rewrite constrained keys while legacy runtime remains |
| `inkcare_b2b` | former brand identity | legacy alias/provenance for INKSIGHTS | ARCHIVE/ALIAS | Not a separate active product going forward |
| `inksight_b2b` | old spelling/namespace points at legacy ref | `inksights_b2b` canonical identity | TRANSFORM | Canonical metadata cleanup pending |
| `connector_accounts` | 19 legacy registry records; old Supabase marked authoritative | current connector configuration | TRANSFORM/ARCHIVE | Source-of-truth split must be removed |
| `business_routing_rules` | legacy shared routing | canonical routing only if current | SELECTIVE TRANSFORM | Review before retirement |
| `inkcare_offer_catalogue` / `commercial_offers` | includes former-brand offers | INKSIGHTS offers where still commercially valid | TRANSFORM/ARCHIVE | Offer-by-offer review; historical pilot remains historical |
| `commercial_projects`, `commercial_assets`, `commercial_line_items` | mixed ecosystem/commercial records | business-specific destinations | SELECTIVE TRANSFORM | Do not force unrelated ventures into INKSIGHTS |
| `commercial-reconcile` | shared legacy reconciler | future business-specific reconciliation if required | ARCHIVE/REBUILD | No blanket migration |

## 10. Daniel Hughes Tattoos

| Asset | Finding | Disposition | Status/gate |
| --- | --- | --- | --- |
| `ingest-dht-submission` | tattoo-business intake | MOVE OUT / REBUILD | Separate from INKSIGHTS core |
| `upload-dht-reference` | tattoo reference upload | MOVE OUT / REBUILD | Separate destination required before legacy deletion |
| tattoo client/project/payment tables | currently zero rows at audit | ARCHIVE/REBUILD | Schema may be reusable, but no data migration blocker currently |
| `daniel-hughes-tattoos-assets` bucket | empty at audit | RETIRE/RECREATE in tattoo stack if needed | No object migration required currently |

## 11. Storage

Legacy private buckets:

- `daniel-hughes-tattoos-assets`
- `ecosystem-shared-assets`
- `inkcare-assets`
- `inkcentives-assets`
- `inksight-assets`
- `inkstructure-assets`

`storage.objects` contained **zero objects** during the audit. Bucket definitions are architectural provenance only; there is currently no binary-object migration workload.

## 12. Historical assets that must retain INKCARE naming

Do not rename solely for aesthetics:

- already-applied SQL migrations;
- immutable audit log records;
- dated validation evidence;
- dated `docs/replication/*` facts;
- provider IDs and historical reconciliation keys;
- historical offer names when describing what was actually offered at the time.

Add a legacy/rebrand banner or metadata instead.

## 13. Current freeze state

As of 2026-09-13:

| Legacy cron | Job ID | Status |
| --- | ---: | --- |
| `stripe-sync-worker` | 2 | **Inactive** |
| `growth-automation-worker` | 3 | **Inactive** |
| `inkcare-search-intelligence-maintenance` | 4 | **Active** pending search/Command Centre reconciliation |

No legacy Edge Functions have been deleted. No legacy data has been deleted. This preserves rollback while scheduled side effects are progressively removed.

## 14. Final deletion blockers

The legacy project remains **NOT READY FOR DELETION** until:

1. job 4 is replaced or retired and disabled;
2. all externally reachable legacy functions are confirmed unused or redirected;
3. current INKSIGHTS contact/growth/visibility/search flows are deployed from the migration branch and smoke-tested;
4. Daniel Hughes Tattoos legacy functions have a separate destination or explicit retirement decision;
5. legacy credentials/control tokens are revoked after final export;
6. source/configuration/database exports are stored outside the legacy project;
7. a 14-day zero-legitimate-traffic quiescence window completes;
8. reconciliation confirms no required IP/data remains only in legacy;
9. deletion receives separate explicit approval.
