# INKSIGHTS website funnel release — 31 October 2026

Status: REVIEW; release is NOT a declaration of commercial lift or validated payments.

## Objective

Improve clarity and the probability that qualified UK tattoo-studio visitors can find the right next step, while retaining the existing homepage motion, brand system, diagnostics, calculation endpoint, consent model, CRM and Stripe checkout.

## Changes staged

- Make homepage copy and business-problem labels understandable without commercial consulting terms. No animation or visual component was removed.
- Add a clearly visible option from the Studio Growth Check to the existing contact form for owners without reliable monthly figures. This route is a **contact enquiry**, not a numeric report; do not invent zeros or show an estimated result without required data.
- Keep the same server-side Growth Check calculation, required data validation, submission-gated result, privacy terms and CRM pipeline.
- Clarify the selected enquiry path on the contact page and keep existing persistence and consent.
- Track click events from shared primary and secondary call-to-action components using the existing consent-gated event system; pass only the destination pathname without query parameters.
- Improve organic-search identification for Google UK search referrers and avoid treating known paid UTM media as organic.

## Observed baseline (not evidence of conversion uplift)

Read-only aggregation of `public.website_events` for the trailing 30 days on 31 October 2026:
- `page_view`: 145 recorded events across 52 distinct consented session identifiers.
- `cta_clicked`: 2 events across 2 sessions.
- `diagnostic_started`: 2 events across 2 sessions.
- `diagnostic_completed`: 2 events across 2 sessions.
- `checkout_started`: 6 events across 5 sessions.
- `checkout_error`: 2 events across 1 session.

These are consent-gated event records, NOT total site visitors or qualified-studio counts. Event under-instrumentation, retries and the lack of customer matching make any conversion rate or causal claim unreliable. `checkout_started` records a button attempt on the production version, not necessarily a successfully created checkout session. The Stripe webhook/verified order record remains the financial source of truth.

The observed event totals are not deduplicated user counts, and start/completion events should be matched by session and diagnostic ID before producing rates.

## Event measurement dictionary

| Event | Trigger | Interpretation | Source |
|---|---|---|---|
| `page_view` | Site route rendered with analytics consent | Consented route view, not all sessions | First-party and GA4 |
| `cta_clicked` | Primary/secondary button clicked with analytics consent | Expressed navigation intent | First-party and GA4 |
| `diagnostic_started` | First focus inside Growth Check | Started interacting with form | First-party |
| `diagnostic_completed` | Valid server response after successfully saved result | Completed a calculation | First-party, corroborate with Supabase audit record |
| `contact_started` | First focus in contact form | Started enquiry | First-party |
| `contact_submitted` | Positive response from public-contact-intake endpoint | Stored contact enquiry | First-party, corroborate with Supabase request |
| `checkout_started` | Currently checkout CTA clicked | Checkout *attempt* (needs refinement) | First-party |
| `payment_completed` | Client receives positive server-side checkout verification | Useful UX event only; may repeat on re-entry | Stripe webhook / verified order is authoritative |

No personal identifiers, arbitrary message text or transaction token should be sent to analytics. Studio-level qualification must come from the allowed CRM records and consent status rather than inferring fit from a web visit.

## Explicit outstanding safeguards (NOT complete)

1. `src/routes/offers.$slug.tsx` fires `checkout_started` before a payment URL is ready. A proposed refinement could not be written during this pass, so do not calculate an initiated-checkout conversion rate from the current event. Leave payments unchanged until the separate payments review, then confirm purchase flow in an authorised test mode and verify Stripe webhook reconciliation.
2. `src/lib/consent.ts` includes `window.location.href` in GA4 `page_location` when consent permits. A change to remove query parameters and any private path fragments was blocked during this pass. Treat this as a **privacy/measurement priority**. Avoid passing customer-identifying URLs to analytics and separately review existing settings and retention where appropriate. Do not infer the issue has been fixed.
3. First-party analytics is opt-in. Google Search Console provides search clicks and impressions, but does not itself identify qualified visitors. A robust view of qualified organic leads requires compliant joining of recorded acquisition context to canonical lead/CRM data, and should not be inferred from session counts.
4. No real-user usability study, mobile Core Web Vitals baseline, independently verified case study, or additional paid-customer test has been completed in this release. A clean preview build is not the same as demonstrated commercial effectiveness.

## Acceptance and rollback checklist

- [ ] GitHub CI, type checking, generated route tree, browser smoke and preview deployment all pass.
- [ ] Homepage: original HeroSignalPanel, SignalTicker, SignalObservatory, RevenueLeakageMap, reveal and tilt interactions remain.
- [ ] Mobile 320px and desktop 1440px: no clipped controls or overlay regressions.
- [ ] Growth Check with complete representative figures: server validates/persists once before showing a result; no duplicates or early results.
- [ ] Growth Check with incomplete figures: clear alternative link to `/contact?topic=growth-check`, no default zeros or pseudo-estimate.
- [ ] Contextual contact form: correct topic selected; submitted message saves correctly; no marketing consent implied.
- [ ] Analytics consent accepted/rejected: CTA events only when accepted, no unexpected events without consent.
- [ ] Existing Stripe £395 checkout remains functional and verified via signed server-side payment flow (separate controlled test).
- [ ] Release authorised explicitly under `AGENTS.md` immediately before merge/production.
- [ ] Post-release: check canonical traffic, page-view and action events, support/lead routing, plus responsive visual regressions.

## Continuous improvement decision loop

1. Weekly: examine Search Console landing pages and search queries, and consented first-party event data; exclude internal/test activity where identifiable.
2. Identify a single bottleneck with an explicit numerator, denominator, scope, limitations and an underlying observable symptom.
3. Prioritise a modest test using time to implement, ability to measure and commercial relevance.
4. Record the hypothesis and baseline, then ship only through preview and approved production release.
5. After an appropriate observation window and sufficient actual data, retain, revise or roll back the change. Never represent an assumed traffic/ranking/conversion improvement as observed.
6. Record the result and next decision in GitHub documentation and canonical INKSIGHTS operational systems. 

## Focused next step

Resolve the two outstanding analytics/payment issues first, then measure the full funnel and interview 5 UK tattoo studio owners about comprehension and form completion. Only then consider broader navigation or SEO expansion.
