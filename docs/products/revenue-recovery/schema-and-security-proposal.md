# Business Tool Factory — Applied Database and Security Record

**Status:** APPLIED — implementation baseline  
**Database:** Existing INKSIGHTS Supabase project  
**Date:** 2026-11-21

## 1. Implementation summary

The approved generic workspace model and Revenue Recovery domain have been applied to the existing INKSIGHTS Supabase project. Existing Golden Audit, Revenue Audit, CRM, mail and intelligence tables were not repurposed or altered.

Applied migrations:

| Supabase version | Migration |
|---|---|
| 20261121071600 | create_business_tool_factory_revenue_recovery |
| 20261121071648 | add_business_tool_factory_foreign_key_indexes |
| 20261121071751 | restrict_factory_import_row_updates |

Matching SQL migration files are committed under `supabase/migrations/` on the feature branch.

## 2. Tables created

### Shared platform

| Table | Purpose |
|---|---|
| `bt_workspaces` | Tenant and workspace boundary; optional source studio ID is an unlinked reference until identity provisioning is implemented |
| `bt_workspace_members` | Workspace user membership and role |
| `bt_workspace_products` | Product activation, version and settings |
| `bt_import_jobs` | Import metadata, checksum, mapping version and row counts |
| `bt_import_rows` | Mapped and validated row staging; no raw source-file bytes |
| `bt_workflow_runs` | Idempotent, versioned workflow execution |
| `bt_approvals` | Append-only decisions bound to a draft digest |
| `bt_audit_events` | Service-only append-only audit ledger |
| `bt_usage_events` | Service-only usage/metering ledger |

### Revenue Recovery

| Table | Purpose |
|---|---|
| `rr_clients` | Workspace-scoped client references, display name, booking recency and contact-permission state |
| `rr_enquiries` | Enquiry status, age and quoted value |
| `rr_projects` | Multi-session project status, session progress and contract values |
| `rr_bookings` | Appointment/session status and deposit/balance facts |
| `rr_payments` | Imported payment facts; not a payment processor ledger |
| `rr_capacity_periods` | Available/booked hours and studio-provided hourly value |
| `rr_opportunities` | Rule-versioned findings, evidence, value classification, confidence and priority |
| `rr_actions` | Editable recommendations and draft communication metadata |
| `rr_outcomes` | Append-only reported/verified outcome records |

All monetary values are integer minor units. The initial currency defaults to GBP. Workspace-owned records carry `workspace_id`. Composite foreign keys prevent child records from linking to a parent record in a different workspace.

## 3. Data minimisation and boundaries

- `rr_clients` does not contain email or phone columns. It stores a source-system reference, optional display name, booking facts, a contact-route flag and marketing-permission state.
- `bt_import_rows` stores mapped JSON only. The application must enforce an explicit allowlist before writing this JSON; database JSONB typing does not validate the business schema.
- No source CSV bytes, payment credentials, card data, authentication secrets or unrelated client notes are stored by this migration.
- `rr_payments` is an imported record of payment facts, not a payment execution interface.
- No private Storage bucket or upload URL policy has been created yet.
- No workspace, member, product activation, client or booking rows have been seeded. The schema is ready; workspace bootstrap is a remaining backend task.

## 4. RLS and grants as applied

RLS is enabled on all 18 new tables.

There are 39 workspace-aware policies across 16 tables. Two tables intentionally have no client policies:

- `bt_audit_events`
- `bt_usage_events`

These are service-only tables with no `anon` or `authenticated` table privileges.

Policy design:

- Workspace, membership and product configuration are provisioned by trusted server-side code.
- Authenticated users can read only their own active membership row.
- Workspace and product reads require an active membership.
- Import, workflow and Revenue Recovery data reads require active workspace membership.
- Owner/admin/manager roles can perform the allowed insert/update operations.
- Analysts are read-only.
- Approvals and outcomes are append-only from authenticated clients.
- No authenticated client receives DELETE privileges on the new tables.
- `bt_import_rows` updates are explicitly revoked from authenticated clients; trusted server-side normalisation owns row-status transitions.
- No new `SECURITY DEFINER` helper was introduced. RLS policies query the caller's own membership row, which is visible under the membership table's self-read policy.
- Authorization does not rely on user-editable JWT metadata.

## 5. Verification performed

- Confirmed all 18 tables exist and RLS is enabled.
- Confirmed 39 policies across 16 tables.
- Confirmed no anonymous SELECT privileges on the new tables.
- Confirmed audit and usage tables are inaccessible to authenticated clients and accessible to the trusted service role.
- Confirmed client-side DELETE is not granted.
- Confirmed foreign-key advisor findings for the new tables were cleared after adding indexes.
- Ran a transactional test with two existing user IDs, two workspaces and two roles. Each user saw only their own workspace and client. An owner insert succeeded; an analyst insert was denied. The transaction was rolled back, leaving no test records.

### Advisor context

The project still has pre-existing security advisor warnings, including public/authenticated execution of some SECURITY DEFINER functions and leaked-password protection being disabled. The post-migration RLS-without-policy advisor count is 58; two of these are the intentionally service-only audit and usage tables introduced here. Existing findings must be handled as a separate security workstream rather than weakened or broadly papered over.

Performance advisor warnings for unused indexes are expected on newly created empty tables. Do not drop them until real workload evidence exists.

## 6. Remaining security and backend work

1. Implement trusted workspace provisioning and first-owner bootstrap.
2. Map the optional `source_studio_id` to the canonical INKSIGHTS studio identity after verifying the intended record.
3. Add product activation seeding through the trusted backend.
4. Implement the CSV allowlist, validation, idempotency and row normalisation service.
5. Define private Storage and retention only when file upload UX is ready.
6. Add API-level tenant checks in addition to database RLS.
7. Add audit events for import, analysis, draft changes, approval and outcome capture.
8. Run a local Supabase CLI reset/diff from the checked-in migrations before merging to `main`.
9. Do not enable sending, booking writes, payment actions or CRM write-back as part of this schema milestone.

## 7. Release status

- Live schema and RLS: applied.
- Feature branch migration files: committed.
- Draft pull request: remains open.
- Production app: unchanged.
- Customer data import: not started.
- Outbound communication: disabled.
- Stripe billing entitlements: not configured.

This document is the as-built record and supersedes the earlier pre-approval proposal.
