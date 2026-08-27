# INKSIGHTS Production Audit — 2026-08-27

## Canonical production path

GitHub `dontdoadan/inksights` → Vercel project `inksights` → Supabase project `INKSIGHTS`.

Lovable projects are retained as design/prototype references only.

## Findings

### GitHub

- Canonical repository selected: `dontdoadan/inksights`.
- Repository is currently public. This should be reviewed before proprietary intelligence/data tooling is added.
- Repository contains TanStack Start/Vite application code, Supabase integration, MCP routes and historical Lovable integration files.
- Studio Intelligence Map component exists and currently uses deliberately labelled demonstration records rather than the production studio dataset.
- README previously described the project as an INKCARE/Lovable build and has been replaced with the current INKSIGHTS production architecture.

### Vercel

- Team: `inksights` (Hobby plan).
- Project: `inksights`.
- Git integration: `dontdoadan/inksights`.
- Production deployment after the framework correction completed successfully.
- Historical failed deployments remain in deployment history and are rollback candidates where applicable; they are not production.
- No production runtime errors were observed in the last seven days.
- The project metadata may still report a legacy `nextjs` framework preset while `vercel.json` explicitly selects `tanstack-start`; keep the repository configuration as the source of truth and review the dashboard preset if it remains inconsistent.

### Supabase

- Canonical project: `INKSIGHTS`, region `eu-west-2`.
- Current exposed application schema contains one public application table: `public.enquiries`.
- RLS is enabled on `public.enquiries` with one policy.
- `public.enquiries` currently contains zero rows.
- No Edge Functions are deployed.
- Security advisor found `public.rls_auto_enable()` as a `SECURITY DEFINER` function callable by `anon`/`authenticated`.
- Remediation applied: `EXECUTE` revoked from `public`, `anon`, and `authenticated`. Verification confirms only `postgres` and `service_role` retain execute privilege.
- Performance advisor reports two currently unused indexes on `public.enquiries`: `enquiries_created_at_idx` and `enquiries_status_idx`. Do not remove until query patterns are finalised.

## Clean-up decisions

1. Keep one production repository: `dontdoadan/inksights`.
2. Keep one production Vercel project: `inksights`.
3. Keep one canonical Supabase project: `INKSIGHTS`.
4. Use Lovable only for reference/prototyping; do not use it as the production host.
5. Treat Supabase as the canonical studio-data source once the Studio Intelligence schema is built.
6. Do not hard-code production studio records into the frontend.
7. Preserve historical repositories/projects until dependencies are verified; archive/delete only after confirming they are not production sources or required references.

## Next technical work

- Rebuild the Studio Intelligence schema in Supabase around canonical studio identity, location, Companies House identifiers, digital profiles, observations, signals, scores, verification and history.
- Replace demonstration map records with Supabase-backed records.
- Add geographic coordinates and a real map library rather than a decorative SVG when production map work begins.
- Remove remaining Lovable-only runtime dependencies and integration code once Supabase-native auth/production requirements are verified and the lockfile can be regenerated.
- Review Vercel framework metadata for consistency with TanStack Start.
- Review GitHub repository visibility before proprietary intelligence data, algorithms or customer data are introduced.
