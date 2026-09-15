# INKSIGHTS Presentable v1 — Implementation Plan

## Goal
Deliver a presentation-ready, non-destructive INKSIGHTS v1 that demonstrates the real operating loop, uses the canonical Supabase model, and connects the supporting commercial/operating systems without inventing results.

## Execution order
1. Freeze the canonical design/spec and branch from current `main`.
2. Audit Supabase schema, RLS, real pilot data and current security findings.
3. Build `/workspace` inside the authenticated route group with live RLS reads plus an explicitly labelled presentation snapshot when no tenant membership exists.
4. Add the canonical intelligence timeline and integration/status surfaces.
5. Replace public browser RPC usage with a same-origin server route; stage the database privilege revocation migration for production rollout.
6. Audit and map Stripe billing objects/webhook flow; do not create live charges unnecessarily.
7. Audit and map HubSpot lead/deal lifecycle; reuse existing objects where possible and avoid duplicate commercial records.
8. Create the Figma/FigJam workspace/system-atlas artefacts from the canonical architecture.
9. Create the Notion operating manual/presentation index with links and status.
10. Push code to `feat/inksights-presentable-v1`, verify Vercel preview/build/runtime, then open a PR to `main`.
11. Complete production security cutover only after the same-origin public report endpoint is deployed, preventing breakage of the current public report.
12. Record the remaining real-world measurement gate: Outcome → Attribution → Learning cannot be completed until observed post-intervention data exists.

## Verification gates
- Code: route compiles, lint/build checks pass in the connected CI/Vercel environment.
- Auth: `/workspace` remains behind the existing `_authenticated` guard.
- RLS: live workspace queries are tenant-scoped by `studio_members` policies.
- Security: service-role client is server-only; public report migration is staged, not applied before deployment.
- Data integrity: no synthetic outcome/attribution/learning rows are inserted.
- Deployment: preview reaches READY with no blocking runtime errors.
- Presentation: system atlas covers product, data, security, client journey, revenue, UI, development workflow and roadmap.

## Rollout safety
This branch must not alter customer-facing production behaviour until preview QA succeeds. Do not merge automatically. Do not revoke the anonymous public-report RPC in the production database before the replacement server endpoint is deployed. Do not create Stripe charges or customer-facing HubSpot communications as part of presentation setup.