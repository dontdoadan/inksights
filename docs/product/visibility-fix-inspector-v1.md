# INKSIGHTS Visibility Fix Inspector — v1 implementation contract

**Status:** Review branch only. Do not claim production release until acceptance checks pass.
**Entry:** /tools/visibility-fix-inspector.html
**Audience:** UK tattoo studio owners (existing 3+ artist visibility report eligibility).
**Design:** Existing INKSIGHTS dark/navy visual language, linked from /resources.

## What is implemented
1. Visitor explores five stages: search → profile → website → enquiry → booking.
2. A pre-submission example shows illustrative scenarios with before/after visual treatment.
3. Optional intake reuses the *existing* Supabase Edge Function \`studio-visibility-report-v2\`. There is no second ingestion schema or direct browser database write.
4. The existing Edge Function validates consent, honeypot, origin, URL and public network target, rate limits requests, captures website observation and saves a visibility report. The search intelligence pipeline and existing human publication gate remain unchanged.
5. The Inspector reads the published report through the existing same-origin \`/api/public/visibility-report\` endpoint with its token; it does **not** read unapproved tables or bypass report publication.
6. Once published, website metadata/status/robots/sitemap and scoped search provider observations enter stage-specific cards. The remaining profile/enquiry/booking stages explicitly read **not measured**.
7. The Inspector retains the original report URL, offers a non-secret report reference for an enquiry, and links into the existing 72-Hour Visibility Fix contact flow and £395 Studio Intelligence Audit.
8. Links and tokens are scoped to the current visitor; no new CRM records, transactions or charges are produced from browsing this tool.

## Evidence classification
- **Observed** = named source observation exists; does not imply an adverse diagnosis.
- **Review required** = metadata absent from the *captured HTML* or a robots/sitemap probe could not confirm availability; not an established commercial failure.
- **Not measured** = this report has no evidence for the journey stage; never infer a failing CRM, payment or profile configuration.
- **Example** = fictional scenario with no claim that the studio has been checked.
- **After** = proposed target experience; does not imply implementation or financial improvement.
- Search positions are provider-specific, *not necessarily Google rankings*; search demand and financial uplift are not inferred.

## Data flow
Browser intake with explicit consent
→ Existing \`studio-visibility-report-v2\` (trusted Origin, rate limit, URL/redirect SSRF defenses)
→ Existing visibility_studios / visibility_report_runs / visibility_observations
→ existing search-intelligence process and quality approval
→ existing \`publish_visibility_report\` RPC
→ existing same-origin token-gated API
→ Inspector evidence mapping
→ manual service enquiry \`/contact?topic=72-hour-visibility-fix\` or existing paid audit offer.

## Privacy and security boundaries
- No new Supabase tables, keys, RLS policies, secret environment variables, Stripe actions or webhook changes.
- No output or display of contact email, raw secret token or raw provider payloads.
- Report ID is a reference. The bearer report token stays inside the private URL and existing same-origin access route.
- Noindex/nofollow/noarchive and no-referrer meta tags on the Inspector page.
- The Inspector never renders studio/provider strings as raw HTML: dynamic text uses \`textContent\`.
- Any form submission is stored by the existing consent-aware service and only published after source QA.
- A 404 from the report API means *pending or unavailable*; the UI must never declare an unpublished report complete.

## Test coverage
\`node --test tests/visibility-fix-inspector.test.mjs\`
- Embedded script syntax and expected noindex/referrer/consent boundaries.
- No synthetic ranking claim from empty provider observations.
- Observed vs review-required website snapshot classification.
- Unmeasured profile/enquiry/booking remain unknown.
- Browser code contains no service key, direct database write or payment action.

## Known limitations / release blockers
1. **Canonical studio identity:** Existing visibility Edge Function inserts a new \`visibility_studios\` row on each request. It does not currently reconcile reports to an existing verified studio profile. Avoid repeated real submissions until canonical identity/idempotency is implemented.
2. **Publication latency:** The existing report starts in \`analysing\` and publication is subject to the existing search pipeline and QA. The public API returns report data only for \`published\` records. This tool does not bypass that rule; a visitor can retry later via the saved private link.
3. **Origin restriction:** The current Edge Function permits only the production apex and www origins. Preview-domain live submission is expected to be rejected. Validate preview with demo mode, then conduct controlled, permissioned production smoke tests after release approval.
4. **Commercial workflow:** The Visibility Fix remains an enquiry-led/scoped service. Do not state that £249 Checkout, automatic fix delivery or Stripe-to-HubSpot reconciliation is operational until independently accepted.
5. **Evidence gap:** Business profile, form delivery, booking and deposit checks need additional permissioned integrations or manual tests; the existing homepage snapshot is insufficient.
6. **Customer identity and CRM:** The report intake and service enquiry do not yet enforce an authenticated, verified studio-owner identity or a unified HubSpot-to-Supabase identity handoff. Do not assert E2E deduplication.
7. **Provider-specific search context:** Always retain source provider, locale, observation timestamp and coverage; do not present provider positions as Google ranks.
8. **Private URL:** Like the pre-existing report, the Inspector relies on URL bearer tokens. For future customer portal access, replace token-in-query with authenticated report access and short-lived scoped links.

## Production acceptance checklist
- [ ] PR CI: eslint, build, generated route tree, TypeScript and inspector tests succeed.
- [ ] Vercel preview READY and demo mode works desktop + mobile; inspect design overflow, responsiveness and keyboard navigation.
- [ ] Verify preview pages do not leak report tokens in analytics, links or third-party referrers.
- [ ] Confirm permitted, synthetic report submission from the production origin, with valid public website, consent and no duplicate live customer record.
- [ ] Confirm report is not shown until published; observe published data and source metadata in Inspector.
- [ ] Verify source snapshot absence, missing metadata, provider-empty, HTTP error and server error handling.
- [ ] Confirm service enquiry persists in canonical CRM, and audit checkout is still verified server-side.
- [ ] Confirm full report URL and Inspector URL load the same published report without exposing contact PII.
- [ ] Check active production security advisories and relevant RLS/RPC permissions.
- [ ] Merge only after release owner approval; otherwise keep branch/PR for review.

## Next engineering stage
1. Add verified studio identity resolution + idempotent report creation in the existing backend (without changing existing published records).
2. Add permissioned business-profile data and real booking-path checks, with opt-in authorisation and immutable observation provenance.
3. Store inspector-specific issue lifecycle states and before/after evidence under the canonical studio record; attach CRM deal/contact references.
4. Add monitored queues and service delivery SLA workflows for scoped fixes, independent of report generation.
