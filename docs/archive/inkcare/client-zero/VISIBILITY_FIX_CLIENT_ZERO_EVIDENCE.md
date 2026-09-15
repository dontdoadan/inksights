# INKCARE Client Zero — £249 Visibility Fix Evidence

Status date: 1 August 2026
Offer: `72-hour-visibility-fix`
Price: **£249 one-off**

## Current verdict

**Backend fulfilment: PASSED in isolated signed synthetic testing.**

**Customer-facing release: BLOCKED by stale production website publishing.**

This document records what was actually tested. It must not be represented as a real customer purchase or external studio result.

## Problems found during Client Zero

### 1. Production website is not the current application

Live smoke test:

- `/` → 200
- `/terms` → 200
- `/support` → 404
- `/studio-growth-check` → 404
- `/offers/72-hour-visibility-fix` → 404
- `/robots.txt` → 200
- `/sitemap.xml` → 200

DNS/hosting evidence:

- `www.getinkcare.co.uk` CNAME → `custom-domains.chatgpt.site`
- the known `inkcare-growth-engine.inkcareoncodex.chatgpt.site` deployment also serves the older static build;
- the current TanStack Start application exists in GitHub but has not been published to the current ChatGPT site host.

This remains the primary release blocker.

### 2. Growth Check contained retired products and prices

The deployed lead-routing backend previously contained old routes including legacy fixed-price and subscription offers.

It was replaced with the current canonical offer set only.

Validation matrix passed:

- focused visibility → £249 Visibility Fix;
- reputation/review monitoring → £99/month Visibility Watch;
- enquiry/diary/no-show/rebooking → Booking & Retention Engine, scoped quote;
- owner overload/larger implementation → Founding Studio Pilot, £1,500 + £750/month for three months;
- multiple material leaks → Revenue Audit, scoped quote;
- low intent/readiness → free action plan.

No retired price surfaced in the route tests.

### 3. Qualification booking request had an invalid state transition

The booking workflow attempted to write `booking_requested` before that status was allowed by the lead database constraint.

The constraint and function were corrected.

Client Zero booking test:

- request saved;
- assessment/lead relationship verified;
- data remained `internal_test`;
- test lead remained archived;
- zero production automation jobs were created.

### 4. Live Stripe webhook only fulfilled Visibility Watch

The production webhook previously hardcoded `visibility-watch`. A real £249 checkout could have been logged without creating the correct £249 onboarding path.

The webhook is now offer-aware.

Supported direct fulfilment mappings include:

- canonical Visibility Fix payment link → `72-hour-visibility-fix` → one-time billing → `visibility-fix-onboarding`;
- canonical Visibility Watch payment link → `visibility-watch` → subscription billing → existing monitoring onboarding.

The webhook can resolve the offer from either approved metadata or the canonical payment-link mapping.

## Dedicated £249 onboarding

A separate `visibility-fix-onboarding` function was created rather than risking the working Visibility Watch onboarding.

It collects only information required for the fixed sprint:

- contact and delivery details;
- studio identity and postcode;
- website;
- Instagram or Google Business Profile;
- booking/enquiry link;
- tattoo styles/services;
- useful competitor context;
- desired result;
- current booking process;
- approval/access notes;
- explicit service consent.

It does not automatically make public changes.

## Signed synthetic Stripe test

A synthetic `checkout.session.completed` event was signed with the existing isolated Stripe webhook-test secret inside Supabase. The secret value was not exposed.

Test event:

- event: `evt_clientzero_visibilityfix_001`
- session: `cs_test_clientzero_visibilityfix_001`
- amount: £249
- currency: GBP
- offer: `72-hour-visibility-fix`
- environment: test
- livemode: false

Webhook result:

- HTTP 200;
- `fulfilled=true`;
- correct offer resolved;
- one-time paid client created;
- secure onboarding URL generated.

Test client:

- ID: `51964432-2c19-461a-b987-f50c2bfbc2ba`
- offer slug: `72-hour-visibility-fix`
- billing type: `one_time`
- payment status: `paid`
- classification: `internal_test`

## Onboarding validation

The generated onboarding link returned HTTP 200.

The form was submitted with synthetic Client Zero information.

Result:

- HTTP 200;
- environment `test`;
- offer `72-hour-visibility-fix`;
- onboarding status `complete`;
- client remained `internal_test`;
- onboarding link delivery evidence created;
- onboarding confirmation evidence created.

After the test, the plaintext token was no longer needed and the stored token hash was cleared/expired.

## Isolation validation

The test created:

- **0 HubSpot contacts** for `clientzero.stripe@getinkcare.co.uk`;
- **0 production automation jobs** for the test client;
- **0 verified-client records**;
- **0 external-revenue claims**.

Therefore the test validated the workflow without contaminating sales reporting or customer proof.

## Command Centre

The Command Centre now exposes:

- the canonical offer catalogue;
- real commercial client records separately from sample/internal test records;
- Client Zero offer tests;
- payment status;
- billing type;
- offer slug;
- onboarding state;
- Stripe/HubSpot identifiers where present.

Metric `client_zero_visibility_fix_fulfilment` records the successful sample validation.

## Technical regression check

After the fulfilment changes, the system validation suite passed:

- **11 passed**
- **0 failed**
- **100%**
- run ID `d7ef4f91-27c7-4cef-8f62-5a6f2d27cc39`

This does not prove a live Stripe charge; it proves the isolated signed event and downstream fulfilment logic.

## Release status

### Passed

- canonical £249 product/price exists;
- offer-aware webhook deployed;
- isolated signed checkout event handled correctly;
- one-time client state created correctly;
- secure onboarding generated;
- onboarding submitted correctly;
- delivery evidence stored;
- test data isolated from HubSpot and production automation;
- delivery runbook documented;
- system regression validation passed.

### Still required before active outreach

1. Publish the current GitHub application to the production ChatGPT custom-domain host.
2. Verify `/studio-growth-check` and `/offers/72-hour-visibility-fix` return 200 on production.
3. Verify `/support`, `/terms`, robots and sitemap from the same published application.
4. Perform one production smoke test of the live offer page → Stripe checkout without making a real charge.
5. Run the complete delivery checklist against INKCARE and capture the before/after evidence pack.

The backend is now materially closer to first-sale readiness, but the production site must be fixed before INKCARE actively sends studios into this funnel.