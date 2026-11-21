# Business Tool Factory — Database and Security Proposal

**Status:** DRAFT FOR REVIEW — NOT APPLIED  
**Database:** Existing Supabase project `INKSIGHTS`  
**Date:** 2026-11-21

## 1. Decision required

This proposal introduces a generic workspace layer and a namespaced Revenue Recovery domain in the existing database. It does not modify existing tables or repurpose the public Revenue Audit lead tables.

No SQL in this document has been applied to the live database. Applying the schema, grants, functions or RLS policies requires explicit approval after review.

## 2. Existing structures to reuse

- `public.studios` — canonical studio/business identity.
- `public.studio_members` — existing studio membership. Its `studio_id` references `visibility_studios`; the live schema also links `studios.id` to `visibility_studios.id`. The identity mapping must be verified during workspace provisioning.
- `public.clients` and `public.client_aliases` — existing Golden Audit client normalisation assets. Do not use these as the sole operational Revenue Recovery store without a separate scope and data-purpose review.
- `public.transactions` — existing transaction facts; read access is tenant-scoped through `app_private.can_read_studio(studio_id)`.
- `public.integration_events` — existing integration event ledger, currently RLS-enabled with no authenticated policy (service-only access pattern).
- `public.intelligence_evidence`, `public.intelligence_findings`, `public.intelligence_recommendations`, `public.intelligence_economic_opportunities` — reusable intelligence concepts, but not substitutes for product-owned operational records.
- `public.inksights_mail_outbox` and `public.inksights_mail_suppressions` — existing INKSIGHTS outbound governance. Do not write to this ledger from Revenue Recovery until its current RLS, eligibility and consent contracts are reviewed. MVP does not send.

## 3. Proposed shared tables

All tenant-owned tables carry `workspace_id` and RLS. All monetary columns are integer minor units; initial currency is GBP.

### `bt_workspaces`
- `id uuid primary key default gen_random_uuid()`
- `display_name text not null`
- `business_type text not null`
- `source_studio_id uuid null unique references public.studios(id)`
- `timezone text not null default 'Europe/London'`
- `currency_code text not null default 'GBP'`
- `status text not null default 'active'`
- `created_by uuid references auth.users(id)`
- `created_at / updated_at timestamptz not null default now()`

### `bt_workspace_members`
- `id uuid primary key default gen_random_uuid()`
- `workspace_id uuid not null references bt_workspaces(id)`
- `user_id uuid not null references auth.users(id)`
- `role text not null check (role in ('owner','admin','manager','analyst'))`
- `active boolean not null default true`
- `created_at timestamptz not null default now()`
- Unique constraint on `(workspace_id, user_id)`.

### `bt_workspace_products`
- `workspace_id uuid not null references bt_workspaces(id)`
- `product_key text not null`
- `product_version text not null`
- `status text not null check (status in ('enabled','disabled','trial'))`
- `settings jsonb not null default '{}'`
- `created_at / updated_at timestamptz not null default now()`
- Primary key on `(workspace_id, product_key)`.

### `bt_import_jobs`
- `id uuid primary key default gen_random_uuid()`
- `workspace_id uuid not null references bt_workspaces(id)`
- `product_key text not null`
- `source_system text not null`
- `source_filename text`
- `content_sha256 text not null`
- `mapping_version text not null`
- `status text not null`
- `rows_total / rows_valid / rows_invalid / rows_duplicate integer not null default 0`
- `created_by uuid references auth.users(id)`
- `completed_at / created_at timestamptz`
- Unique idempotency constraint on `(workspace_id, product_key, content_sha256)`.

### `bt_import_rows`
- `id uuid primary key default gen_random_uuid()`
- `workspace_id uuid not null references bt_workspaces(id)`
- `import_job_id uuid not null references bt_import_jobs(id) on delete cascade`
- `row_number integer not null`
- `raw_payload jsonb not null`
- `mapped_payload jsonb`
- `row_status text not null`
- `validation_errors jsonb not null default '[]'`
- `source_record_id text`
- `row_hash text not null`
- Unique constraint on `(import_job_id, row_number)`.

### `bt_workflow_runs`
- `id uuid primary key default gen_random_uuid()`
- `workspace_id uuid not null references bt_workspaces(id)`
- `product_key text not null`
- `workflow_key text not null`
- `workflow_version text not null`
- `idempotency_key text not null`
- `status text not null`
- `input_ref jsonb not null default '{}'`
- `result_summary jsonb not null default '{}'`
- `started_at / completed_at / created_at timestamptz`
- Unique constraint on `(workspace_id, product_key, idempotency_key)`.

### `bt_approvals`
- `id uuid primary key default gen_random_uuid()`
- `workspace_id uuid not null references bt_workspaces(id)`
- `product_key text not null`
- `target_type text not null`
- `target_id uuid not null`
- `draft_digest text not null`
- `decision text not null check (decision in ('approved','rejected','revoked'))`
- `actor_id uuid not null references auth.users(id)`
- `created_at timestamptz not null default now()`
- Approval must bind to the exact content digest; edits invalidate prior approval.

### `bt_audit_events` and `bt_usage_events`
Append-only, service-write tables for actor/action provenance, workflow usage, metering and billing reconciliation. Keep RLS enabled with no client write policies; access through trusted server-side services only. Audit payloads must avoid unnecessary PII.

## 4. Proposed Revenue Recovery tables

### `rr_clients`
Workspace-scoped canonical client references. Store source identifiers, display name, optional normalised email/phone, last completed booking date, completed-session count and marketing permission state. Avoid storing unrelated client notes.

### `rr_enquiries`
Source-system enquiry ID, optional client link, created date, status, quoted amount in pence, contact-route flag and source lineage.

### `rr_projects`
Source-system project ID, optional client link, project status, agreed value, paid value, planned/completed sessions, last activity and next session.

### `rr_bookings`
Source-system booking ID, optional client/project link, scheduled date, status, booking amount, deposit due/paid, balance due/paid and source lineage.

### `rr_payments`
Imported payment facts only: source payment ID, optional booking/project link, amount in pence, payment type, payment status, paid date and source lineage. This is not a payment processor ledger.

### `rr_capacity_periods`
Source period, start/end, available hours, booked hours and studio-provided realised hourly value.

### `rr_opportunities`
Rule version, deterministic opportunity key, source record/group, category, explanation, recommendation, low/base/high amount in pence, classification, confidence, priority, evidence JSON, actionability and status. Unique constraint on `(workspace_id, rule_version, opportunity_key)`.

### `rr_actions`
Opportunity link, action type, draft subject/body, draft digest, status, created-by and timestamps. Approval references live in `bt_approvals`. No send status or outbound execution is enabled in MVP.

### `rr_outcomes`
Manually recorded outcome type, related opportunity/action, amount in pence, evidence reference, classification (reported/verified), recorded-by and timestamp. Only verified, evidence-backed outcomes count as recovered revenue.

## 5. RLS and role policy design

RLS must be enabled on every exposed Factory and Revenue Recovery table.

Roles:
- **owner:** full workspace and product administration.
- **admin:** member, product and data administration.
- **manager:** import, analyse, draft and approve actions.
- **analyst:** read-only access to product data and reports.

Proposed helper:
- Add a narrowly scoped function `app_private.bt_can_access_workspace(workspace_id uuid, allowed_roles text[] default null)`.
- The function checks `auth.uid()`, active membership and optional role membership.
- If `SECURITY DEFINER` is required to avoid recursive membership-table RLS, it must remain in the non-exposed `app_private` schema, use a fixed safe search path and fully qualified table/function names, explicitly check `auth.uid()`, revoke default execution from `PUBLIC` and `anon`, and grant only the required execution role.
- No authorization may rely on `raw_user_meta_data` or client-supplied workspace IDs alone.

Policy matrix:
- Workspace and product configuration: member SELECT; owner/admin write.
- Memberships: self SELECT; owner/admin manage.
- Imports and canonical Revenue Recovery records: all active members SELECT; owner/admin/manager write.
- Approvals: manager/admin/owner can create/revoke through server-validated workflow; analyst read-only.
- Audit and usage events: service-only writes; member read only if a product-facing audit view is explicitly approved.
- Storage bucket: private, workspace-scoped object paths and short-lived signed URLs.

RLS policy predicates must be tested for cross-workspace ID substitution, inactive memberships, role escalation, UPDATE with both USING and WITH CHECK, and anonymous access.

## 6. Required migration order

1. Create generic workspace and membership tables.
2. Add private workspace authorization helper and grants.
3. Add workspace RLS and policies.
4. Add product activation, import and workflow tables.
5. Add Revenue Recovery domain tables and indexes.
6. Add storage policies only if a private import bucket is approved.
7. Run advisors and tenant-isolation tests.
8. Generate the committed migration with the Supabase CLI workflow required by the repository.
9. Apply only after explicit approval and verify with read-back queries.

## 7. Known security observations from the live audit

- Existing core tables `studios`, `clients` and `transactions` have tenant-scoped read policies.
- `studio_members` has a self-membership read policy.
- Existing mail and integration event tables have RLS enabled but no authenticated policy; this is consistent with a service-only pattern and must not be weakened.
- Supabase security advisors currently report 56 RLS-enabled tables without policies. This includes existing service-only tables; it is an audit item requiring classification, not a reason to add broad permissive policies.
- Existing `app_private` schema contains `can_read_studio`, `si_admin`, `si_command` and `si_guard_report`; the proposed helper name is distinct.

## 8. Approval checklist

- [ ] Approve generic workspace model and studio identity mapping.
- [ ] Approve role model and membership bootstrap process.
- [ ] Approve private helper function and grants.
- [ ] Approve table definitions, retention and data minimisation.
- [ ] Approve RLS policy matrix and storage approach.
- [ ] Approve creation of the migration through the repository's Supabase CLI workflow.
- [ ] Approve applying the migration to the live INKSIGHTS Supabase project.

Until these items are approved, the proposal remains documentation only.
