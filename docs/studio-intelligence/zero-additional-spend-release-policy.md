# INKSIGHTS unified studio journey — mandatory £0 additional-spend release gate

**Approved 9 November 2026. Applies to PR #137 and every related test, hosting experiment, integration and production release.**

## Financial guardrails
1. **Maximum additional software/infrastructure expenditure: £0.** No new paid subscription, metered paid feature, AI credits, paid automation, paid hosting, additional domain, real payment test, or usage-based charge is approved.
2. Existing prepaid or free allocations may be used only after confirming use will not trigger charges. **Stop on quota/credit exhaustion**; do not assume an allowance applies or that overages are disabled.
3. No upgrades, payment methods, auto-recharge, new billable seats or real Stripe charges may be authorised. A fee for a genuine **customer's** purchase is different from development expenditure and needs its own financial reconciliation.
4. Use existing public GitHub repo, local Node/Playwright and no-cost CI. Never place Stripe secrets, Supabase service-role credentials or real customer data in a public repo or GitHub artifacts.
5. Keep live INKSIGHTS Vercel, Supabase, Stripe, HubSpot and DNS untouched by preview experiments; no live deploy, migration, checkout payment or CRM test record as an implicit test side-effect.

## P0 — failing browser journey tests
- Diagnose actual failing browser snapshots and request-level evidence; correct the HTML validation and session handoff, not just test assertions.
- Require passing desktop/mobile browser tests for all four stages, reload, fail-closed save and idempotent retries. Do not call a mock test a real database/payment E2E test.
- Report the exact passing GitHub Actions run and commit SHA; preserve traces for failures.

## Free isolated environment
- Prefer **second Supabase free project** where quota and project creation cost are explicitly confirmed £0; never replace or change the existing production project. Organisation selection is a user-account action, and any nonzero price or requirement for paid upgrade is a hard stop.
- Use synthetic studios and isolated auth users. Verify migration and RLS grants, cross-user denial, revoked tokens, idempotency and rollback.
- Use connected **Stripe Sandbox** for fake checkout and signed webhook events. Require £395/GBP price and single item; assert order → onboarding metadata → correct CRM relationship → only authorised report access.
- Use HubSpot Free only where test-record creation and dedupe are safe; otherwise mock calls, never push fake leads into production deal stages.

## Hosting feasibility (evaluation only, NO DNS or site migration)
1. **Netlify Free first**: official TanStack Start adapter, server-route compatibility, build output, function runtime/limits, secrets, commercial use and fail-at-credit-limit safeguards. Free plan documents 300 credits/month hard cap without auto-recharge (as checked 9 Nov 2026). Use an isolated free preview only when a free account can be verified.
2. **Cloudflare Workers Free second** if Netlify cannot pass all checks. Assess 100,000 daily requests, 10 ms free CPU limit, server runtime and functions before any deployment.
3. Existing Vercel Hobby is **not** a compliant permanent commercial production option; do not remove/redirect it until a safe replacement is independently verified.

## Acceptance evidence
- CI & true browser suite pass on the same commit.
- Data API/Edge session flow tested against isolated database, including same-studio return and another-account denial.
- Stripe Sandbox checkout to simulated/isolated CRM to published-report access traced by correlation ID, with paid status set only after trusted signed verification.
- Cost review reconfirms £0 and stop-on-limit configurations on all participating services.
- Release has rollback, consent/privacy and official-logo checks. No production cutover/merge without security and release approval.

## Current position (9 Nov 2026)
- PR #137 remains an unmerged draft; local/browser QA work is active.
- Initial four test failures were rooted in native HTML form step validation (quarter-hour booking duration with implicit whole-number step). Code fix and regression checks are on the feature branch, awaiting exact-head CI evidence.
- Live Supabase new session tables/Edge function are not proven deployed. Full live payment/CRM/report E2E is **NOT verified**.
- This policy is a spending gate, not a claim of feature completion.
