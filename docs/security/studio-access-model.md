# INKSIGHTS Studio Access & Security Model

## Purpose

This document is the canonical access-control model for the INKSIGHTS studio workspace. It preserves the existing data model while separating tenant visibility, human contribution surfaces, backend-owned intelligence, realtime events and private report files.

## Roles

| Role | Tenant dashboard | Decisions | Interventions | Canonical intelligence | Membership management | Service/config tables |
| --- | --- | --- | --- | --- | --- | --- |
| `owner` | Read own studio | Read + contribute | Read + contribute | Read own studio only | Service-side | No client access |
| `admin` | Read own studio | Read + contribute | Read + contribute | Read own studio only | Service-side | No client access |
| `member` | Read own studio | Read + contribute | Read + contribute | Read own studio only | Service-side | No client access |
| `viewer` | Read own studio | Read-only | Read-only | Read own studio only | Service-side | No client access |
| unauthenticated / `anon` | No tenant access | None | None | None | None | None |
| `service_role` | Backend access | Backend access | Backend access | Backend write authority | Backend authority | Backend authority |

`owner`, `admin`, `member` and `viewer` are already enforced by the existing `studio_members.role` check constraint. Membership mutation remains service-side to prevent privilege escalation and accidental owner lockout.

## Dashboard RLS

Tenant dashboard tables are readable by authenticated active members of the matching `studio_id`. The former broad `FOR ALL` member policies were converted to `SELECT` policies. Browser roles do not receive direct write privileges to canonical visibility/intelligence tables.

The only client contribution surfaces are:

- `intelligence_decisions`
- `intelligence_interventions`

For those two tables, `owner`, `admin` and `member` may insert/update rows for their own active studio. `viewer` remains read-only.

## Service-only tables

The following tables are explicitly denied to `public`, `anon` and `authenticated`; `service_role` owns application access:

- `intelligence_diagnostic_questions`
- `intelligence_diagnostic_templates`
- `intelligence_source_registry`
- `intelligence_taxonomy`
- `orders`
- `public_contact_requests`
- `public_endpoint_rate_limits`
- `revenue_audits`
- `studio_aliases`
- `studio_candidates`
- `studio_change_events`
- `studio_identity_matches`
- `studio_source_observations`
- `studio_sources`
- `studio_verification_events`
- `visibility_provider_configs`

Tables with RLS enabled and no client policies are intentionally deny-by-default when they are service-only. Supabase Security Advisor reports these as informational findings; they are not client exposure.

## Edge Functions

Public intake functions remain public only where that is product-required and are protected with origin validation, request validation and rate limiting:

- `revenue-audit-v1`
- `studio-visibility-report-v2`
- `public-contact-intake`

`search-intelligence-v1` is a privileged worker. Supabase JWT verification remains enabled and the function additionally requires the verified JWT role claim to equal `service_role` before creating a privileged Supabase client or making provider calls. It is invoked by the server-side visibility-report pipeline, not by normal authenticated browser users.

## Realtime

Dashboard broadcasts use private topic names:

`studio:<studio_uuid>`

The existing Supabase-managed `realtime.messages` policies require:

- authenticated caller
- active `studio_members` record
- exact `studio:<studio_id>` topic match
- broadcast/presence receive scope
- presence-only client insert scope

The database broadcast trigger helper is `private.broadcast_studio_dashboard_changes()`. The former exposed `public.broadcast_studio_dashboard_changes()` SECURITY DEFINER RPC was removed. Browser roles have no access to the `private` schema/function.

## Private report Storage

Bucket: `studio-reports`

- `public = false`
- 25 MB object limit
- allowed MIME types: `application/pdf`, `application/json`
- backend/service role writes reports
- authenticated active studio members may read only objects whose first path segment equals their `studio_id`

Canonical object convention:

`<studio_uuid>/<report_or_export_filename>`

No authenticated upload/update/delete policy is granted.

## Performance

A covering index was added for the composite foreign key reported by Supabase Performance Advisor:

`intelligence_economic_opportunities(calculation_run_id, studio_id)`

Unused-index notices are observation-only at the current traffic level. Indexes are not removed without workload evidence.

## Known residual platform findings

### PostGIS `spatial_ref_sys`

`public.spatial_ref_sys` is owned/managed by the PostGIS extension/Supabase admin. The application migration attempts to revoke browser grants, but the platform retains/restores extension-owned ACLs. We deliberately do **not** enable RLS on this extension table or drop/recreate/relocate PostGIS merely to silence the advisor because that can break geospatial dependencies.

### Extensions in `public`

Supabase currently reports `postgis` and `pg_trgm` in the `public` schema. Moving PostGIS after installation is a materially destructive operation and is not part of this hardening pass.

### Public visibility report RPC

`publish_visibility_report(uuid, text)` remains intentionally callable by the existing public report flow until the already-staged same-origin replacement route is production-verified. Its privilege-revocation migration must remain gated until that cutover is complete.

### Authentication password protection

Supabase currently reports leaked-password protection as disabled. This is an Auth configuration hardening item, separate from tenant/database authorization.

## Verification

Regression assets:

- `supabase/tests/20260915_studio_access_hardening.sql`
- `supabase/functions/search-intelligence-v1/auth_policy_test.mjs`

The SQL regression test runs role changes and no-op writes inside a transaction and rolls back, so production business data is not altered.
