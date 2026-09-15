# Studio Access Hardening — Verification Record

Date: 2026-09-15
Supabase project: INKSIGHTS
Branch: `security/studio-access-hardening-2026-09-15`

## Verified

- Role constraint supports `owner`, `admin`, `member`, `viewer`.
- Transactional role matrix passed:
  - owner: own-studio read + decision contribution; canonical write denied
  - admin: own-studio read + intervention contribution
  - member: own-studio read + decision contribution
  - viewer: own-studio read; contribution denied by RLS
  - unauthenticated: tenant data denied
  - service role: canonical read/write retained
- Broad authenticated tenant `FOR ALL` policies: `0`.
- Designated service-only tables exposed to browser roles: `0`.
- Realtime receive/presence policies retain active membership + exact `studio:<studio_id>` topic predicates.
- Public SECURITY DEFINER broadcast helper removed; private trigger helper present.
- `studio-reports` is private; transactional Storage test verified own-path read, cross-studio denial and authenticated write denial.
- Search intelligence worker authorization unit test passed for service-role-only access.
- `search-intelligence-v1` deployed ACTIVE as version 4 with `verify_jwt=true` and the service-role body guard.
- Composite FK index on `intelligence_economic_opportunities(calculation_run_id, studio_id)` exists.
- Performance Advisor no longer reports an unindexed foreign key.

## Expected residuals

- `public.spatial_ref_sys` remains an extension-managed RLS/ACL finding. Do not force RLS or relocate PostGIS without a dedicated migration and dependency/backup plan.
- `postgis` and `pg_trgm` remain installed in `public` and are reported by Security Advisor.
- `publish_visibility_report(uuid,text)` remains deliberately public until its already-staged same-origin replacement route is production-verified.
- leaked-password protection is still disabled in Supabase Auth.
- RLS-enabled/no-policy INFO findings on service-only tables are expected deny-by-default behavior with browser grants revoked.
- unused-index INFO findings are retained pending meaningful production workload evidence.
