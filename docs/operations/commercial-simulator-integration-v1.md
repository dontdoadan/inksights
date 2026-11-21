# Commercial Simulator Lab — production integration v1

Status: **FEATURE BRANCH / REVIEW** (not live).
Owner: INKSIGHTS public marketing site + canonical Supabase project `ukaxsqwnkoqbbsufpzga`.
Commercial P0 dependency: preserve the £395 Audit and Studio Growth Check purchasing paths.

## Existing systems reused

- Public page: `/growth-model`, now includes seven simulation tools.
- Edge API: `public-commercial-simulator-submit` (new, not deployed).
- Persistence: `public.public_tool_submissions` (existing table). No new database, table, migration, privilege or RLS change.
- Studio association: `studio_members` active `user_id` + `studio_id`, and a matching `studios.id`. These controls are checked server-side using a verified session; arbitrary names, websites and client-provided IDs cannot create a studio association.
- Lead conversion: existing `/studio-growth-check` form. A simulator submission is **not** automatically a CRM contact, a new studio or evidence that a customer opted in to marketing.
- CRM authority: HubSpot; the existing Growth Check/lead router process remains unchanged.

## Data contract

POST `https://ukaxsqwnkoqbbsufpzga.supabase.co/functions/v1/public-commercial-simulator-submit`

Content-Type: `application/json`

```json
{
  "toolKey": "lead_conversion",
  "inputs": {
    "monthly_enquiries": 100,
    "current_booking_pct": 25,
    "improved_booking_pct": 35,
    "booking_value": 400,
    "variable_cost_pct": 35
  },
  "submissionKey": "47763da8-c5ca-47ce-969b-6aaf13b8a161",
  "consentVersion": "2026-10-commercial-tools-v1",
  "dataNoticeAccepted": true,
  "studioName": "Optional unverified trading name",
  "studioWebsite": "https://example.com"
}
```

For a signed-in user, the UI may additionally send `verifiedStudioId` and `Authorization: Bearer <user-access-token>`. Server verifies the session, active studio membership and canonical record. **Do not** send service-role/secret keys from the browser.

Successful response:

```json
{
  "ok": true,
  "submissionId": "<durable-row-id>",
  "studioLinked": false,
  "classification": "modelled",
  "result": { "current_bookings": 25, "improved_bookings": 35 }
}
```

The response includes more per-tool metrics than the two shown above. API failures never return a report marked as saved.

## Integrity / identity rules

1. The server owns all calculations, classifications, versions, numeric bounds and persistence semantics. The in-browser preview is non-authoritative.
2. The public tool submission row retains `quality_status=unverified_self_report` even when linked to an authenticated studio. Identity verification **does not verify the studio's financial inputs**.
3. A signed-in user may associate a submission only with a single canonical studio for which they have active membership; anonymous scenarios remain unlinked.
4. Do not automatically insert public self-report calculations into `intelligence_calculation_runs`, `intelligence_economic_opportunities`, or verified evidence. These require a separately approved validation/provenance workflow.
5. Retries with the same UUID + identical canonical payload return the original durable result/ID. Reuse with changed inputs or identity returns HTTP 409.
6. Limit requests to 12 KB and 25/hour per hashed client address; do not log raw IP addresses or financial scenario data.
7. Personal/business identifiers are optional. No email is collected. This is not implicit HubSpot consent.

## Production release gates — approval required

- [ ] Run GitHub CI: lint, TypeScript, build, route tree, all scenario policy tests and existing regressions.
- [ ] Confirm privacy notice wording covers storage and diagnostic use of self-reported business information; obtain privacy/compliance sign-off.
- [ ] Confirm `PUBLIC_RATE_LIMIT_SALT` is already configured or approve creation of a secret; never put it in source.
- [ ] Review `verify_jwt=false` for this **new public intake** only and confirm origin restrictions. Configure any specific protected-preview origin using `SIMULATOR_PREVIEW_ORIGINS` before protected preview QA; avoid unrestricted `*.vercel.app`.
- [ ] Obtain explicit approval before deploying the new Edge Function or merging to main/triggering production deployment.
- [ ] In approved staging/protected preview, test all seven tools: empty/negative/large/NaN inputs, replay with same UUID, conflicting UUID reuse, rate limit, consent, studio association with one/nonmember/multiple memberships, database row contents, mobile and print.
- [ ] Verify **real** persisted rows with test classification and no accidental CRM leads; exclude test records from production prospect automations.
- [ ] Test production Growth Check / Stripe checkout remain healthy before and after release.
- [ ] Separate follow-on decision: attach validated studio scenarios to canonical intelligence and route explicit contact requests to HubSpot. This must not be inferred from anonymous submissions.

## Formula caveats

Campaign figures are expected values, not discrete booked appointments or proved attribution; capacity may constrain real bookings. Client referrals count only the first generation, avoiding infinite geometric projections. Variable costs are simplified. Price elasticity and booking attrition are assumptions until measured. Conversion and utilisation may decline, yielding negative changes; do not clamp to a positive sales narrative.

## Failure modes

- 401: invalid signed-in session.
- 403: origin disallowed or studio membership not established.
- 409: reused submission ID with different payload.
- 413: oversized submission.
- 422: invalid numbers/data acknowledgement or selected studio missing from canonical `studios`.
- 429: rate limit.
- 503: rate limiter not configured, persistence unavailable or unexpected backend error.

No new schema is proposed for v1. If business requirements later require verified self-reports, contact verification, user-specific report retrieval, or cross-tool rollups, design a new reviewed data contract and obtain separate schema/RLS/authorization approval.
