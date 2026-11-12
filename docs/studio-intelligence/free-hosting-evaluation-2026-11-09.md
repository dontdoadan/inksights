# Hosting feasibility review — £0, no production changes (9 November 2026)

**Scope:** INKSIGHTS TanStack Start site / PR #137. This is a compatibility and cost review, **not** a deploy or a DNS cutover. Source code remains the current GitHub repository and the running Vercel site is not altered.

## Current application facts
- Framework: TanStack Start `1.168.60`, Vite `8.0.16`, Nitro `3.0.260603-beta`.
- Current `vite.config.ts`: `plugins: [tailwindcss(), tanstackStart(), nitro(), viteReact()]`.
- Frontend uses TanStack server functions and server routes including `/api/public/studio-journey-submit`, Stripe Checkout and signed webhook, plus server-only Supabase admin calls. A static-only host is not sufficient.
- No existing `netlify.toml` or verified Netlify deployment. **Do not** presume existing Nitro Vite plugin and a new target adapter can safely coexist. Build/plugin precedence and handler functionality need genuine validation.
- Existing Vercel Hobby is currently connected to commercial INKSIGHTS properties. Keep current live domain untouched while evaluating a compliant option.

## Preferred candidate: Netlify Free
Official documentation (read 9 Nov 2026):
- https://docs.netlify.com/build/frameworks/framework-setup-guides/tanstack-start/
- https://docs.netlify.com/manage/accounts-and-billing/billing/billing-for-credit-based-plans/credit-based-pricing-plans/
- https://www.netlify.com/pricing/

Netlify documents TanStack Start SSR, server routes/functions and an official `@netlify/vite-plugin-tanstack-start` adapter. For supported versions, its example config adds `netlify()` to the Vite plugins and uses `dist/client` as publish output. **These instructions are not yet verified against this app's existing Nitro 3 beta integration.** Verify by a local trial branch and no-billing preview. Free plan advertises $0, 300 monthly credits, **hard limit and no automatic recharge**. Validate eligible commercial use and account-level credit guard in the actual account before deployment.

Required proof:
1. Adapter install does not force paying, unexpected dependency changes or a repo-wide rebuild.
2. Production-equivalent build succeeds; generated route-tree and server-handler mapping intact.
3. GET pages/SSR, POST API proxy, checkout initialization, webhook signature verification, and server-only Supabase secret isolation function on a protected preview using **synthetic/sandbox credentials**.
4. Cookies/CORS/redirect callbacks and Supabase Auth agree with preview origin. No production secrets copied without a validated scope.
5. Usage/credits tracked and stop when 300 are exhausted; site may pause at threshold and therefore free uptime is not guaranteed.
6. No DNS modification, upgrade, payment method or paid AI product enabled during evaluation.

## Fallback: Cloudflare Workers Free
Official limits: https://developers.cloudflare.com/workers/platform/limits/
- 100,000 requests/day; 10ms CPU per request; 128MB memory; 50 subrequests per invocation on free plan (as of late Oct 2026).
- This application's TanStack server rendering, Nitro/Stripe dependencies, Node APIs, and authenticated server functions may exceed free CPU or runtime compatibility. A separate adapter proof and mocked SSR benchmark are mandatory.
- Cloudflare is **not** a verified fallback today. Do not migrate merely because the headline request allowance is larger.

## Decision
**Netlify: technically plausible but not accepted until test deployment.**
**Cloudflare: secondary feasibility study only.**
**Go-live: HOLD** until account-level £0 guarantees, real runtime tests, Auth, Stripe sandbox, report access, and rollback are proven. Keep both candidates outside INKSIGHTS production until then.

## Expenditure boundaries
- No payment method/autorecharge/new subscription/paid test transaction.
- No net-new Vercel paid plan, Netlify paid plan, Cloudflare paid plan, Supabase Pro, HubSpot paid seat, AI credit purchase or paid deployment tool.
- Optional integration/test-project creation only if the provider confirms *exactly £0* for the selected account/organization; anything else is a stop condition.
