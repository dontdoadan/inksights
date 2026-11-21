# Studio Revenue Recovery — MVP Implementation Plan

**Status:** DRAFT — sequencing baseline  
**Date:** 2026-11-21

## Delivery principle

Ship one narrow, measurable workflow to 3–5 pilot studios before adding live integrations. The first useful version is CSV-in → evidence-backed opportunity queue → action draft → manual outcome capture. Do not start with autonomous messaging or a large connector catalogue.

## Workstream 0 — Baseline and safety (current)
- [x] Confirm existing GitHub, Vercel and Supabase source-of-truth systems.
- [x] Confirm existing studio identity and membership foundations.
- [x] Confirm existing revenue audit, evidence, recommendations and mail outbox assets.
- [x] Identify database schema/RLS changes as an explicit approval gate.
- [x] Review exact RLS policies and grants for new tenancy design.
- [x] Reconcile repository migration history with live database before migration.

## Workstream 1 — Product and data contract
- [x] Shared architecture specification.
- [x] Revenue Recovery technical specification.
- [x] MVP scope and acceptance criteria.
- [ ] Finalise import field map against 2–3 real anonymised studio CSV exports.
- [ ] Confirm retention, privacy notice, processor terms and lawful-basis model.
- [ ] Agree pilot thresholds (7/45/180-day rules) with studio owners.

## Workstream 2 — Database foundation (applied)
- [x] Create generic workspace/product tables.
- [x] Add workspace membership and role policies.
- [x] Add import job and mapped-row staging tables.
- [x] Add Revenue Recovery canonical domain tables.
- [x] Add append-only audit and usage events.
- [x] Add constraints, indexes, grants and RLS.
- [x] Run Supabase security/performance advisors and transactional cross-tenant tests.
- [x] Commit migration files matching the applied Supabase migration versions.
- [x] Apply live schema after explicit user approval.
- **Gate passed:** schema and RLS changes approved by user and applied; no production app deployment or external actions approved.

## Workstream 3 — Domain engine (initial engine implemented; import pipeline outstanding)
- [x] Initial pure TypeScript canonical types and rule-engine input/output contracts.
- [ ] Deterministic CSV parser/mapping pipeline.
- [ ] Normalisation and duplicate detection.
- [x] Initial detection rules and rule versioning.
- [x] Initial non-overlapping value calculation.
- [x] Transparent priority and confidence scoring.
- [x] Unit tests with fixtures and edge cases added; CI execution pending.

## Workstream 4 — Application UX
- [ ] Authenticated Revenue Recovery product area.
- [ ] Workspace/product switcher using shared platform services.
- [ ] Import wizard and validation report.
- [ ] Opportunity dashboard and filters.
- [ ] Opportunity evidence/detail view.
- [ ] Draft action editor and approval status.
- [ ] Outcome capture and recovery reporting.
- [ ] Empty states, loading, failure and permission states.

## Workstream 5 — AI and approval
- [ ] Server-side structured AI draft service.
- [ ] Minimise prompt data; no raw dataset prompts.
- [ ] Schema validation and deterministic fallback.
- [ ] Approval bound to exact content digest.
- [ ] Audit events for draft, edit, approve and outcome.
- [ ] Sending remains disabled.

## Workstream 6 — Commercial and pilot
- [ ] Create Stripe product/price only after packaging validation.
- [ ] Map verified subscription webhooks to product entitlements.
- [ ] Onboard 3–5 pilot studios.
- [ ] Measure import completion, usable-data rate, actionable opportunity rate, actions taken and verified recovery.
- [ ] Interview users after first 2 weeks.
- [ ] Decide whether to add one booking-platform connector based on pilot data.

## Indicative sequence

| Stage | Output | Exit condition |
|---|---|---|
| 1. Architecture + data contract | Approved spec and mapping | Sample exports map without unsafe ambiguity |
| 2. Database | Tenant-safe schema | RLS tests pass and migration is approved |
| 3. Engine | Reproducible opportunities | Unit tests pass; double counting controlled |
| 4. Web MVP | Import and recovery queue | End-to-end test with synthetic fixture passes |
| 5. Pilot | Real usage evidence | 3–5 studios complete a real workflow |
| 6. Commercial | Paid offer and entitlements | Pricing and usage economics validated |

Timing is deliberately not committed until real CSV formats and the schema approval gate are resolved.

## MVP success metrics

- Import completion rate.
- Percentage of imported rows mapped successfully.
- Duplicate rate and false-merge rate.
- Percentage of opportunities with evidence-backed values.
- Opportunities reviewed per studio per week.
- Draft-to-action rate.
- Bookings recovered.
- Deposits/payments collected and verified.
- Time from import to first useful action.
- Customer retention and willingness to pay.

Do not use total modelled opportunity as a headline recovery result. The north-star metric is **verified recovered revenue attributable to a recorded action**, with attribution rules disclosed.

## Key risks and mitigations

| Risk | Mitigation |
|---|---|
| Booking exports differ widely | CSV mapping templates and explicit unsupported-column feedback |
| False-positive inactivity flags | Adjustable thresholds and user dismissal reasons |
| Duplicate revenue across findings | Source-level value attribution and linked-opportunity grouping |
| Poor source data | Confidence and unknown states; no forced amount |
| Unlawful or unwanted outreach | Draft-only MVP, permission states, suppression and review gates |
| PII exposure | Minimise fields, RLS, private storage, no raw prompt uploads |
| Overbuilding integrations | Pilot CSV-first; add only the highest-value connector |
| Existing RLS gaps | Audit and remediate through separately approved security work |

## Release governance

- Feature branch only until reviewed.
- Preview deployment only; production remains unchanged.
- No merge to `main` without explicit approval.
- Live schema/RLS changes applied only after explicit user approval.
- No outbound messages or customer-impacting actions in the MVP.


## Implementation status — 2026-11-21

### Completed
- Shared architecture, product technical specification and implementation plan committed.
- Three Supabase migrations applied and recorded: `20261121071600_create_business_tool_factory_revenue_recovery`, `20261121071648_add_business_tool_factory_foreign_key_indexes`, `20261121071751_restrict_factory_import_row_updates`.
- 18 tables created with RLS enabled; 39 policies across 16 tables.
- No anonymous access; no client-side delete; audit and usage tables are service-only.
- Foreign-key indexes added after advisor review.
- Transactional two-workspace RLS test passed and rolled back.
- Deterministic engine, product registry and initial unit tests committed.

### Outstanding P0
Finish CI validation, then build workspace bootstrap, CSV import/mapping/validation and the authenticated recovery queue. Do not add live integrations or sending until this path is proven with anonymised studio exports.

### Validation caveat
The remote migrations are recorded and matching SQL files are checked into this branch. A local Supabase CLI reset/diff has not been run in this execution environment; perform that before merging to `main`.
