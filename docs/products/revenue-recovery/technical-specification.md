# Studio Revenue Recovery — Technical Specification

**Product:** AI Business Tool Factory / Studio Revenue Recovery  
**Version:** 0.1.0  
**Status:** IMPLEMENTATION BASELINE — shared database foundation applied; application MVP in progress  
**Date:** 2026-11-21

## 1. Product objective

Help tattoo studios find and act on revenue opportunities already present in their own booking and client records. The system imports operational data, detects recoverable situations, estimates values conservatively, ranks actions and prepares messages for studio approval.

The product is not a booking system, CRM replacement, accounting ledger or autonomous marketing sender.

## 2. Target user and initial ICP

Primary buyer: owner/manager of a UK tattoo studio with 3+ artists and an existing digital booking or spreadsheet workflow.

Daily user: studio manager, front desk or owner responsible for enquiries, diaries, deposits and client follow-up.

Core job: “Show me which revenue opportunities I should act on next, why they matter, what evidence supports them and what I can do about them.”

## 3. MVP scope

### Included
- CSV import using a guided field-mapping flow.
- Preview, validation, duplicate detection and import summary.
- Minimum entities: clients, enquiries, projects, bookings/sessions, payments and appointment capacity.
- Rule-based detection for:
  1. Unconverted enquiries.
  2. Inactive multi-session projects.
  3. Clients with no recent booking.
  4. Outstanding deposits or balances.
  5. Unfilled appointment capacity where the studio provides diary/capacity data.
- Opportunity amount range and confidence, with source evidence.
- Prioritised recovery queue.
- AI-generated action explanation and optional message draft.
- Human status/outcome tracking: open, reviewed, action planned, contacted externally, booked, deposit paid, recovered, dismissed.
- Outcome reporting that separates estimated opportunity, booked value, collected value and verified recovered revenue.
- Tenant isolation, audit trail and import deletion.

### Excluded from MVP
- Automatic email/SMS/WhatsApp sending.
- Live booking-calendar writes.
- Refunds, payment collection, deposit chasing or balance collection.
- Automatic appointment creation or rescheduling.
- Full two-way integrations with booking platforms.
- AI-generated financial values.
- Predictive churn models.
- Native mobile app.
- Automated CRM write-back.
- Multi-currency (GBP only initially).

## 4. User workflow

1. Owner creates or joins a workspace.
2. User chooses Revenue Recovery and uploads a CSV export.
3. User maps columns to the canonical import schema.
4. System validates rows and presents errors/warnings before import.
5. User confirms import.
6. Deterministic analysis creates opportunities with evidence and rule version.
7. Dashboard shows total potential value, value by opportunity type, confidence and priority.
8. User opens an opportunity and sees why it was identified, source rows and calculation.
9. User requests an AI-assisted recommended action or message draft.
10. User edits and saves the draft.
11. Approval is recorded against the exact draft digest. In MVP this approval is internal only; sending is disabled.
12. User manually contacts the client outside the product and records the result.
13. Dashboard reports verified outcomes separately from estimates.

## 5. Canonical data contract

Import schema is versioned and independent of the source platform. The applied schema stores mapped, normalised row payloads in a restricted staging table; it does not store original raw row payloads or source file bytes.

### Client
- external_client_id (optional)
- client_name (required for display; pseudonymous ID preferred where possible)
- contact route available (boolean)
- external contact reference retained in source system; email and phone are not stored in the current schema
- last_completed_booking_at (optional)
- total_completed_sessions (optional)
- marketing_permission_state (unknown / permitted / not_permitted / suppressed)
- source_system and source_record_id

### Enquiry
- external_enquiry_id
- client reference or contact details
- created_at
- status (new / replied / quoted / booked / declined / closed / unknown)
- quoted_value_minor (optional)
- project_summary (optional; do not import sensitive details)
- source metadata

### Project
- external_project_id
- client reference
- status (active / paused / completed / cancelled / unknown)
- agreed_value_minor (optional)
- sessions_planned (optional)
- sessions_completed (optional)
- last_session_at (optional)
- next_session_at (optional)
- source metadata

### Booking / session
- external_booking_id
- client and project references
- scheduled_at
- status (held / completed / cancelled / no_show / rescheduled / unknown)
- value_minor (optional)
- deposit_due_minor and deposit_paid_minor (optional)
- balance_due_minor and balance_paid_minor (optional)
- source metadata

### Payment
- external_payment_id
- booking/project reference
- amount_minor
- payment_status (paid / pending / refunded / failed / unknown)
- paid_at (optional)
- payment_type (deposit / balance / other / unknown)
- source metadata

### Capacity
- period_start / period_end
- available_hours
- booked_hours
- optional unfilled slots and artist identifier
- source metadata

PII fields are optional unless required for a specific approved workflow. An import can still generate useful aggregate findings without email or phone.

## 6. Detection rules (initial deterministic rules)

All thresholds are configurable and versioned. Initial defaults are hypotheses to test with pilot studios, not industry facts.

| Opportunity | Initial rule | Value method | Confidence conditions |
|---|---|---|---|
| Unconverted enquiry | Enquiry is not booked/closed and age exceeds 7 days | Quoted value if present; otherwise no amount or a clearly modelled range from studio-provided average booking value | Status and created date present; value source explicit |
| Inactive multi-session project | Project not completed/cancelled, sessions remain and no future session; last activity > 45 days | Remaining agreed project value only if contract/value and completed payments support calculation | Planned/completed sessions and financial fields complete |
| Lapsed client | Completed client relationship, no future booking and last completed session > 180 days | No amount by default; model only if studio average booking value supplied and clearly labelled | Last booking date and completed status reliable |
| Outstanding deposit/balance | Positive due amount remains after payments/refunds | Exact due amount from imported ledger | Due and paid/refunded totals present; currency known |
| Unfilled capacity | Available hours > booked hours in supplied future period | Unfilled hours × studio-provided realised hourly value, constrained by date and demand assumptions | Diary/capacity data present; estimate labelled modelled |

Rules must not double count the same value. For example, an outstanding balance and inactive project may refer to one underlying contract; the analysis groups them under a shared source project and calculates a non-overlapping recoverable amount.

## 7. Value and confidence semantics

Every amount is stored as integer GBP pence.

- **Observed:** exact amount/date/status present in source record.
- **Calculated:** arithmetic derived directly from observed values.
- **Modelled:** estimate requiring explicit assumptions, such as unfilled hours × realised hourly value.
- **Hypothesis:** possible opportunity without sufficient data to assign a defensible amount.

Opportunity records contain low/base/high amount, value classification, confidence score, assumptions, evidence references, rule key/version, calculation timestamp and exclusion/deduplication reason.

Confidence is a data-quality score, not probability that a client will book. It must not be presented as conversion likelihood.

## 8. Priority model

Initial priority score (0–100) is transparent and configurable:
- Financial amount supported by evidence: 0–30.
- Time sensitivity / ageing: 0–20.
- Actionability / completeness of contact and next step: 0–20.
- Confidence / data completeness: 0–20.
- Effort to act: 0–10 (lower effort scores higher).

Do not rank unknown amounts above evidence-backed exact liabilities merely because the model invents a larger potential value. Show value and confidence as separate dimensions.

## 9. Proposed product data model

Shared tables are specified in `docs/architecture/ai-business-tool-factory-shared-architecture.md`.

Revenue Recovery domain tables (proposed):
- `rr_clients`: workspace-scoped client reference, source identifiers, display name, last completed booking, completed-session count, future booking date and permission state. Direct email/phone fields are intentionally absent.
- `rr_projects`: multi-session projects and contract/session progress.
- `rr_bookings`: appointment/session facts and statuses.
- `rr_enquiries`: inbound enquiry and conversion state.
- `rr_payments`: imported payment facts; not a payment processor ledger.
- `rr_capacity_periods`: supplied diary/capacity facts.
- `rr_opportunities`: detected opportunity, classification, value range, confidence, priority, evidence and rule version.
- `rr_actions`: recommended next action and communication draft metadata.
- `rr_outcomes`: manually recorded booking/payment/recovery result and evidence.

Every domain row contains `workspace_id`, timestamps and source lineage. Unique constraints prevent duplicate source records per workspace/source system/source ID. Raw import rows are retained only for a bounded period and deleted or minimised after successful normalisation according to the approved retention policy.

## 10. Import pipeline

```text
Upload -> file safety/type/size checks -> import job
       -> row staging -> column mapping -> validation
       -> duplicate detection -> user confirmation
       -> canonical normalisation -> import complete
       -> deterministic analysis -> opportunity queue
```

Requirements:
- CSV only for MVP; UTF-8 with BOM support.
- Configurable maximum file size and row count.
- Reject executable content and unsupported file types.
- Escape formula-leading values on any CSV export.
- Detect duplicate source IDs; fallback matching on conservative normalised contact keys.
- Never merge clients automatically on fuzzy name-only matches.
- Show row-level validation errors and allow correction/re-upload.
- Idempotency key for every import.
- Store checksum and mapping version.
- No raw PII in application logs.

## 11. AI generation contract

AI input is limited to fields required for the selected draft. The model must not receive complete source CSVs or unrelated client records.

Structured output:
- suggested_action (enum)
- rationale (text)
- message_subject (optional)
- message_body (optional)
- missing_information (array)
- risk_flags (array)
- assumptions (array)

System constraints:
- Do not state an amount, booking, deposit, consent or prior interaction unless present in the approved evidence payload.
- Do not use pressure, false urgency or imply a booking is reserved.
- Do not include health or sensitive tattoo details.
- If marketing permission is unknown/not permitted/suppressed, do not create a marketing message. A neutral service/admin message may only be drafted where the studio confirms a valid service context and legal basis.
- Always label AI output as a draft requiring review.
- Validate structured output; retry once on schema failure then fall back to deterministic action text.

## 12. API contracts

- `POST /api/tool-factory/imports`: create upload job; authenticated user and workspace required.
- `POST /api/tool-factory/imports/:id/validate`: validate mapping and source rows.
- `POST /api/tool-factory/imports/:id/confirm`: confirm canonical import.
- `POST /api/revenue-recovery/analyses`: run versioned detection rules; idempotent per workspace/import/rule-set.
- `GET /api/revenue-recovery/opportunities`: paginated and filtered queue.
- `GET /api/revenue-recovery/opportunities/:id`: evidence and calculation detail.
- `POST /api/revenue-recovery/opportunities/:id/drafts`: prepare action/message draft.
- `POST /api/revenue-recovery/actions/:id/approve`: approve exact draft digest; no sending.
- `POST /api/revenue-recovery/actions/:id/outcome`: record externally observed outcome.

Every endpoint validates tenant membership server-side, uses schema validation, rate limits imports/AI calls and writes audit events.

## 13. Security, privacy and legal requirements

- RLS enabled on all exposed tables with workspace membership checks.
- Tenant isolation tests for every read/write/approval operation.
- Strict role checks for imports, data export, approvals and workspace administration.
- No client-side service-role credentials.
- Private storage for source files; signed URLs short-lived.
- Data minimisation, configurable retention, deletion and export.
- Privacy notice and data-processing terms before paid onboarding.
- Studio/customer role allocation and lawful basis documented before any communications feature.
- PECR review and suppression checks required before marketing sending.
- No email/SMS sending in MVP.
- No data sharing across workspaces, including AI prompts or training.

## 14. Acceptance criteria

1. A studio can import a supported CSV and see row counts, errors and duplicates before commit.
2. Re-uploading the same file does not duplicate canonical records.
3. Detection results are reproducible for the same data and rule version.
4. Each opportunity shows evidence, calculation, classification and confidence.
5. Duplicate value across linked opportunities is not summed twice.
6. AI drafts contain no unsupported facts and can be edited.
7. Approval is invalidated when draft content changes.
8. No external message is sent by any MVP action.
9. A studio member cannot read another workspace's records by changing IDs.
10. Recovered revenue is reported only after an outcome is recorded with evidence; modelled opportunity is not counted as recovered revenue.


## 15. Applied implementation baseline — 2026-11-21

### Supabase tables now present

Shared platform: `bt_workspaces`, `bt_workspace_members`, `bt_workspace_products`, `bt_import_jobs`, `bt_import_rows`, `bt_workflow_runs`, `bt_approvals`, `bt_audit_events`, `bt_usage_events`.

Revenue Recovery: `rr_clients`, `rr_enquiries`, `rr_projects`, `rr_bookings`, `rr_payments`, `rr_capacity_periods`, `rr_opportunities`, `rr_actions`, `rr_outcomes`.

All 18 tables have RLS enabled. Workspace-owned records are scoped by `workspace_id`. Membership and product activation are provisioned server-side. The client can read its own active membership and workspace/product data only where an active membership exists. Managers/owners/admins can create and update the operational rows allowed by policy; analysts are read-only. Approvals and outcomes are append-only from the client. Audit and usage tables are service-only.

### Implemented in code

- Product registry: `src/lib/tool-factory/product-registry.ts`.
- Deterministic rule engine: `src/lib/tool-factory/revenue-recovery-engine.ts`.
- Engine tests: `tests/revenue-recovery-engine.test.mjs`.
- CI step added to run the engine tests.

### Not yet implemented

- CSV parser, field-mapping wizard and confirmation UX.
- Authenticated workspace provisioning and first-user bootstrap.
- Persistence adapter connecting the pure rule engine to Supabase.
- Revenue Recovery dashboard and opportunity detail views.
- AI explanation/draft endpoint and digest-bound approval UI.
- Outcome capture UI, private file storage and retention jobs.
- Stripe product entitlements or booking-platform connectors.

### Current data minimisation

The applied client table does not persist email addresses or phone numbers. It records a source reference, display name, contact-route flag and marketing-permission state. The import validator must enforce an allowlist before writing `mapped_payload`; the JSON column itself is not a substitute for application-level validation. The MVP still does not send communications.
