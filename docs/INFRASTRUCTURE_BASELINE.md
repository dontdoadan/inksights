# INKSIGHTS Infrastructure Baseline

**Baseline date:** 2026-08-27

## Canonical systems

| Layer | Canonical resource | Role |
|---|---|---|
| Source control | GitHub `dontdoadan/inksights` | Source, history, CI |
| Production hosting | Vercel `inksights` | Preview + production deployment |
| Database/backend | Supabase `INKSIGHTS` | PostgreSQL, Auth, Storage, APIs |
| Payments | Stripe | Billing and payment state |
| CRM | HubSpot | Commercial/customer lifecycle |
| AI | OpenAI | Intelligence/service layer |

## Git

- `main` = production source of truth.
- `develop` = integration branch.
- `feature/*` = feature work.
- `fix/*` = bug fixes.
- Production changes should enter `main` through a pull request.

## Vercel

- Project: `inksights`
- Project ID: `prj_icAg9UiPsuDsIDol4gc4ChgRCmaa`
- Git repository: `dontdoadan/inksights`
- Production branch: `main`
- Current project configuration declares `tanstack-start` in `vercel.json`.
- The Vercel API currently reports framework metadata as `nextjs`; do not change this metadata blindly while the explicit `vercel.json` configuration and working deployments remain authoritative.

## Supabase

- Project: `INKSIGHTS`
- Ref: `ukaxsqwnkoqbbsufpzga`
- Region: `eu-west-2`
- Status: `ACTIVE_HEALTHY`
- Public schema currently contains `enquiries`.
- RLS security advisor currently reports no findings.
- Performance advisor reports two informational unused-index candidates on `enquiries`; do not remove them until query usage is understood.
- No Edge Functions currently exist.
- Production migration history currently contains:
  - `20260824003951_create_tattoo_enquiries`
  - `20260827222530_lock_down_rls_auto_enable`

## Environment variables

Client configuration currently expects:

- `VITE_SUPABASE_URL`
- `VITE_SUPABASE_PUBLISHABLE_KEY`

SSR/server-compatible names are also supported by the generated client:

- `SUPABASE_URL`
- `SUPABASE_PUBLISHABLE_KEY`

Future server-only integrations must use server-side secrets and must never be exposed through `VITE_*` variables.

## Deployment controls

A production release should follow:

`feature/*` -> CI -> PR -> `develop` -> validation -> PR -> `main` -> Vercel Production

Database schema changes follow the same source-control principle and must be represented as Supabase migration files.

## Security baseline

- `.env`, `.env.*` and local credentials are ignored by Git.
- `.env.example` contains names only, never secrets.
- Supabase RLS is enabled on the current application table.
- Public enquiry insertion is constrained by the current RLS policy.
- Service-role/secret keys must remain server-side.

## Known remaining control-plane action

The connected GitHub write API does not expose a branch-protection/ruleset write operation. Therefore `main` protection cannot be safely enabled through this connector. The repository currently has admin access and merge methods enabled, but this does not substitute for branch protection.

Recommended GitHub settings for `main`:

- Require a pull request before merging.
- Require the CI status check to pass.
- Require branches to be up to date before merging where practical.
- Disable direct pushes for normal development.
- Prefer squash merging for feature branches.

## Change-management rule

Do not redesign or expand infrastructure merely to make the dashboard look cleaner. Change infrastructure only when it improves reproducibility, security, reliability, cost control, or developer velocity.
