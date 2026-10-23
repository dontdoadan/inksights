# Unified Studio Journey — release audit (23 October 2026)

**Scope:** PR #137; read-only inspection of current Supabase; no production schema, webhook, CRM, Stripe or deployment changes.

## Verified build state
- GitHub head before audit: `003fb20b9c47d7f45170b008a9ac083383ddd935`; latest two CI workflows passed (after previous generated route tree failures).
- Vercel preview status for both configured projects returned `build-rate-limit` failures on head. Previously published previews existing is **not proof** the new head was deployed or validated.
- Proposed `studio_journey_sessions` and `studio_journey_steps` do **not** yet exist in live Supabase (`to_regclass` returned null). The current public studio journey Edge Function has not been deployed/verified. API/UX are therefore not a live end-to-end flow.
- Branch contains additive session migration, four-stage Edge Function, same-origin proxy, authenticated profile view, checkout journey metadata, and tests; none of that proves production payment/delivery.

## Fixes made in this audit
- `public-studio-journey` `mine` now excludes revoked and expired sessions from list results. Previously expired or revoked links could remain visible on authenticated account dashboards despite linked-profile access being denied.

## Open release blockers and risks (not marked fixed)
1. **P0 — Release deployment / verification**: two Vercel head preview checks are rate-limited. Verify restored preview deploys then run browser E2E on exact commit.
2. **P0 — Central persistence unavailable in production**: inspect/test/apply migration in isolated environment, confirm rollback, explicit production permission required before any live schema/RLS modifications. Verify zero pre-existing duplicate `public_contact_requests` session IDs before unique index.
3. **P0 — Session ownership security**: test cross-user and revoked-membership access, token theft/claim races, expiration, linked history, and report grants with actual authenticated accounts. Ensure no claims based on matching name.
4. **P0 — Full payment/CRM handoff unverified**: Stripe Checkout £395 price and server-paid confirmation, competing webhook paths, idempotent order/contact/deal creation, account association, failure replay and onboarding/report entitlement require a test-environment trace. Do not create real live charges or test CRM leads by accident.
5. **P1 — Consent/privacy**: check assessment notice, optional marketing consent, token lifecycle, deletion and data-retention behaviour against public notices; avoid storing visitor secrets in logs.
6. **P1 — Accessibility and UI**: manual mobile/desktop coverage, focus/ARIA/keyboard, visual overflow and official-logo asset resolution in protected preview not yet evidenced.
7. **P1 — Reconcile existing toolkit function**: deployed `public-studio-toolkit-submit` exists outside `main` source tree; do not overwrite or silently migrate its records.
8. **P1 — Authenticated read semantics**: `mine` filters expired sessions (fixed); confirm login and active member read checks in the authenticated panel and ensure paid report links cannot be accessed with the anonymous journey token.
9. **P1 — Legacy generated tree failures**: historical workflow failures were resolved by later commits; preserve committed `src/routeTree.gen.ts`, monitor for drift.

## Release definition of done
- All required CI and preview deploy checks successful for exact head SHA.
- Fresh + returning browsers can submit 4 stages; API verifies persisted record before showing personalised results.
- Retries do not duplicate records; revision history is reproducible; errors fail closed.
- Studio owner claim verified against existing `studio_members` and Supabase Auth; hostile second user blocked.
- £395 sandbox purchase → Stripe signature verification → order → correct HubSpot company/contact/deal → onboarding → published report access demonstrated on a single correlation ID.
- Consent, RLS, privacy, mobile/desktop, performance and rollback checks signed off.
- Explicit production approval before applying migration or merging/deploying the feature.

**Status:** NOT RELEASE-READY. This ledger is an audit of actual work, not a claim of successful end-to-end operation.
