# INKSIGHTS recovery and activation plan

> **Date:** 13 September 2026
> **Status:** Active
> **Evidence:** production read audit across GitHub, Vercel, Supabase, Stripe and HubSpot; remediation PR #23.

## Decision

Treat `dontdoadan/inksights` → Vercel `inksight-main` → Supabase project `ukaxsqwnkoqbbsufpzga` as the only active INKSIGHTS delivery path. The `inksights-archive` repository and Supabase project `cpnkxfgxdoswyigjzvyh` are legacy reference systems, not deployment targets.

## What has been resolved

| Item | Result | Evidence |
| --- | --- | --- |
| Public report data leak | Fixed in production. `publish_visibility_report` now returns an explicit public-field allowlist; it does not return lead contact name/email, report-token material, or internal row payloads. | Migration `secure_visibility_public_report_payload`, applied 13 Sep 2026. |
| Visibility-crawler SSRF/source drift | Fixed in production Edge Function v8 and represented in PR #23. The crawler enforces origin, size, rate, redirect and public-network controls. | Function v8; `security_test.ts` passes 2/2. |
| Unsupported URI schemes | Fixed. Explicit non-HTTP(S) schemes are rejected rather than coerced into malformed HTTPS URLs. | `security_test.ts`. |
| Unmeasured search index rendering | Fixed in PR #23. The public report shows `—` rather than `NaN`. | `studio-visibility-report.tsx`. |

## Critical now — complete this week

### 1. Merge the remediation source of truth

**Owner:** Product/technical owner
**Status:** awaiting review

Review and merge [PR #23](https://github.com/dontdoadan/inksights/pull/23). Production Supabase already contains the defensive migration and Edge Function v8, so the merge is required to make `main` the accurate recovery source.

**Acceptance criteria**

- The PR is merged without unrelated generated Open Graph assets or sitemap changes.
- `main` contains the v8 Edge Function, `security.ts`, its Deno test and the public-payload migration.
- A fresh read of `main` shows `external_unverified` classification and rate-limit/network controls in `studio-visibility-report-v2`.

### 2. Restore a reproducible web build

**Owner:** Engineering
**Status:** unresolved release-engineering blocker

`package.json` and `package-lock.json` disagree, so `npm ci` fails. The repository also has a Bun lockfile, while this workspace has no Bun runtime. Do not blindly regenerate or delete lockfiles.

**Recommended approach**

1. Determine the package manager actually used by the successful Vercel production deployment.
2. Make one package manager canonical (recommended: Bun if Vercel is already building from `bun.lock`).
3. Regenerate that lockfile with the corresponding exact runtime version, then run its frozen-lock install and `npm run lint`/`npm run build` equivalent in CI.
4. Remove or explicitly deprecate the other lockfile only after the production-equivalent build passes.
5. Add a CI job that fails if the declared package manager cannot perform a frozen install.

**Acceptance criteria**

- A clean checkout builds with a frozen lockfile.
- Vercel preview and production builds use the same runtime and command.
- The current repository-wide Prettier backlog is either fixed in a dedicated formatting PR or scoped out of the release gate with a documented baseline.

### 3. Resolve PostGIS API ownership safely

**Owner:** Supabase platform owner / Supabase Support
**Status:** blocked by extension ownership

`public.spatial_ref_sys` is extension-owned. It has RLS disabled in an API-exposed schema and the current credentials cannot alter it (`must be owner of table spatial_ref_sys`). A direct migration was correctly rejected and was not retained.

**Required action**

Open a Supabase Support request requesting the supported method to: preserve read-only spatial-reference access; revoke anonymous/authenticated DML; enable RLS where compatible; and, if recommended, move PostGIS from `public` to a dedicated `gis` schema. Include the exact security-advisor finding and the ownership error.

**Do not** move the extension or force ownership changes ad hoc in production.

**Acceptance criteria**

- The `rls_disabled_in_public` error for `spatial_ref_sys` is cleared through a supported change.
- The `extension_in_public` warnings are either eliminated through the supported migration or accepted with written rationale.
- A post-change test confirms anon/authenticated roles retain only the intended read behaviour.

## Important next — activate the commercial loop

### 4. Make the Growth Check a measurable acquisition funnel

**Owner:** Product + Growth
**Status:** product flow exists; commercial activation is not evidenced

The Visibility Report is a credible lead magnet only if every submitted studio becomes an attributable commercial opportunity.

**Implement**

1. Define lifecycle states: `submitted`, `report_ready`, `report_viewed`, `qualified`, `contacted`, `meeting_booked`, `pilot_started`, `paid`, `lost`.
2. Add a first-party event/lead record keyed to the report run and consent timestamp; do not use the public report token as a CRM identity key.
3. Send consented, minimal lead data to HubSpot only after field mapping and lawful-basis review.
4. Add a report-ready notification and follow-up workflow with one explicit conversion CTA: book a revenue review or start a pilot.
5. Track activation metrics: submit-to-view rate, view-to-booked rate, booked-to-pilot rate, time to first value, and cost per qualified studio.

**Acceptance criteria**

- A report submission produces one deduplicated lead and an auditable event trail.
- A sales owner can see source, consent, report status and next action without accessing the public report token.
- Monthly funnel metrics distinguish observed facts from estimates.

### 5. Implement payments only after the offer is explicit

**Owner:** Commercial + Engineering
**Status:** Stripe account is live but no live Payment Links, webhook endpoints or Payment Intents exist as of this audit.

Choose one initial paid offer before integrating Stripe: a paid studio intelligence pilot, a monthly intelligence subscription, or a paid implementation plus subscription. The recommendation is a time-bounded paid pilot that proves revenue improvement, then converts to recurring intelligence access.

**Implement after commercial decision**

1. Define GBP price, tax treatment, refund/cancellation terms and deliverables.
2. Create a Stripe Product and Price; use Checkout or Payment Links for the smallest viable payment path.
3. Add a signed Stripe webhook that records subscription/payment lifecycle events server-side.
4. Map only required lifecycle fields to HubSpot and the INKSIGHTS tenant/studio model.
5. Reconcile payment status daily and never activate paid access from browser-side payment assertions.

**Acceptance criteria**

- Test and live payment paths are independently verified.
- Webhook signature validation and idempotency are covered by tests.
- Payment, access and CRM state converge after retries and duplicate events.

### 6. Turn report data into defensible intelligence

**Owner:** Product + Data
**Status:** canonical intelligence schema exists; live provider and attribution activation are not yet evidenced.

Prioritise data that causes a studio decision, not dashboard breadth:

1. Establish the canonical metric catalogue with definition, formula, source, grain, confidence and allowed action.
2. Connect one first-party source per pilot studio (booking/POS/CRM export is sufficient initially).
3. Implement data-quality checks for completeness, freshness, duplicate identity and attribution confidence.
4. Launch three action-oriented intelligence outputs: utilisation/rebooking leakage, cancellation/no-show leakage and client value/retention opportunity.
5. Record recommendations, studio decisions, interventions and measured outcomes in the existing intelligence loop.

**Acceptance criteria**

- Every customer-facing metric shows provenance and confidence.
- No revenue-opportunity figure is shown without first-party attribution or a clearly labelled model assumption.
- At least one pilot action has a before/after commercial outcome record.

## Platform hardening — execute after the commercial path works

### 7. Establish a release contract

**Owner:** Engineering

Add a release manifest that records Git commit, Supabase migration versions, Edge Function names/versions and Vercel deployment URL. A release must not be marked complete when the deployed Edge Function is ahead of `main`.

### 8. Address remaining Supabase advisor findings by risk, not count

| Finding | Decision |
| --- | --- |
| Seven studio-registry tables have RLS with no policy | Currently fail-closed, so do **not** add public policies merely to silence the INFO finding. Move server-only registry workflows to a private schema or document service-role-only access when their ingestion interface is designed. |
| SECURITY DEFINER public report RPC | Intentional capability endpoint. Keep anon execution only with the high-entropy report token, explicit field allowlist and tests. Review token expiry/revocation as a future enhancement. |
| PostGIS functions publicly executable | Investigate with the PostGIS ownership/support work; do not revoke blanket extension function grants without usage testing. |
| Unindexed foreign keys and unused indexes | Use production query statistics and `EXPLAIN (ANALYZE, BUFFERS)` on actual workload before adding or dropping indexes. |
| RLS auth-initplan warnings | Rewrite only the canonical-intelligence tenant policies to use statement-stable `(select auth.uid())`, then verify equivalent access in a development branch. |

### 9. Define archive policy

**Owner:** Technical owner

Retain INKCARE as read-only historical reference for 90 days while its data inventory and retention obligations are reviewed. Freeze new deployment and data-ingestion activity there. Then choose one: archive with documented retention/deletion schedule, or export only legally required records and decommission.

## Operating scorecard

Review weekly until the first paid pilot is live:

| Area | Leading measure | Guardrail |
| --- | --- | --- |
| Acquisition | Qualified report submissions | Consent captured; duplicate rate |
| Activation | Report submit → viewed within 24 hours | Report generation failure rate |
| Sales | Viewed → booked review | Median lead response time |
| Value | Pilot action → measured commercial improvement | Metric provenance/confidence |
| Revenue | Pilot conversion and MRR | Payment/access reconciliation failures |
| Reliability | Deployment success and function errors | Source/deployment version drift |
| Security | Open high-severity advisor findings | Public PII fields in capability responses |

## Explicitly deferred

- Moving PostGIS or `pg_trgm` out of `public` without the supported ownership path.
- Adding public RLS policies to server-only registry tables.
- Bulk index creation/removal without real workload evidence.
- Building broad dashboards, AI summaries or complex integrations before the acquisition-to-paid-pilot loop is measurable.
