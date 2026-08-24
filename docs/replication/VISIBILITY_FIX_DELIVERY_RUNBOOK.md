# INKCARE 72-Hour Studio Visibility Fix — Delivery Runbook

Last verified: 1 August 2026
Offer slug: `72-hour-visibility-fix`
Canonical price: **£249 one-off**
Policy version: `2026-07-28`

## Purpose

This runbook defines exactly how INKCARE delivers the first fixed-scope paid service without improvising the core process.

The service is designed for a UK tattoo studio that already produces credible work but has avoidable friction in its public visibility, trust or booking path.

The promise is controlled and specific:

> INKCARE identifies the most important in-scope visibility and booking-path problems, corrects or prepares the agreed changes, verifies the resulting route and documents what changed within three working days after all prerequisites are complete.

INKCARE does **not** guarantee rankings, enquiries, bookings, revenue or return on investment.

---

## Commercial scope

### Price

- £249 paid in full before client-specific delivery begins.
- No retainer is required.
- No performance percentage applies to this offer.

### Standard deliverables

1. Visibility and booking-path baseline.
2. Google/search presentation review where publicly observable.
3. Instagram/profile review where applicable.
4. Website/homepage and mobile booking-route review.
5. Selection of the three highest-priority in-scope corrections.
6. Exact copy, CTA or public-detail corrections required by those priorities.
7. Implementation by INKCARE where approved access and scope permit, otherwise ready-to-paste instructions.
8. One structured enquiry-response starter template where useful.
9. Before-and-after evidence pack.
10. Thirty-day action plan.
11. One follow-up review.

### Exclusions

Unless separately quoted, the £249 service does not include:

- a full website rebuild;
- ongoing SEO management;
- ongoing social-media management;
- paid advertising;
- complex CRM migration;
- unlimited revisions;
- automatic public changes without approval;
- review manipulation;
- guarantees of rankings, leads, bookings or revenue.

---

# Release gate before accepting a studio

Do not accept payment until all items below are true.

## INKCARE system gate

- [ ] The live £249 offer page resolves publicly.
- [ ] The £249 Stripe checkout resolves and reflects £249 one-off pricing.
- [ ] The Terms of Service route resolves publicly.
- [ ] Stripe webhook health is healthy.
- [ ] Offer-aware fulfilment is deployed.
- [ ] Secure Visibility Fix onboarding is deployed.
- [ ] The Command Centre can display paid client records for this offer.
- [ ] The latest technical validation suite has no failed checks.
- [ ] Any known limitation that could affect this specific delivery is documented.

## Studio fit gate

Confirm before payment:

- [ ] UK tattoo studio or specifically approved exception.
- [ ] Credible active tattoo business.
- [ ] At least one meaningful in-scope public visibility or booking-path issue is observable.
- [ ] A named decision-maker can approve changes.
- [ ] Current website/profile/booking links can be supplied.
- [ ] Studio understands that outcomes are not guaranteed.
- [ ] Studio understands the three-working-day timer starts only after payment, complete intake and required access/approval.

If fewer than three meaningful in-scope improvements can be identified during qualification, do not sell the sprint merely to create work.

---

# Payment and onboarding workflow

## Expected technical flow

1. Buyer completes the canonical £249 Stripe checkout.
2. Stripe sends the live signed webhook event.
3. `growth-stripe-webhook` verifies the signature and resolves `72-hour-visibility-fix` from metadata or the exact canonical payment-link mapping.
4. Minimal payment evidence enters `growth_subscription_events`.
5. A `growth_clients` record is created or updated with:
   - `offer_slug=72-hour-visibility-fix`
   - `billing_type=one_time`
   - `payment_status=paid`
   - `service_status=onboarding`
   - `onboarding_status=invited`
6. A random time-limited onboarding token is generated; only its SHA-256 hash is stored.
7. A delivery-log record stores the secure onboarding URL.
8. Real client fulfilment may queue the approved CRM/worker actions.
9. The buyer completes `visibility-fix-onboarding`.
10. Onboarding status changes to `complete` and a confirmation delivery record is created.

## Required onboarding information

- Contact name.
- Delivery email.
- Studio name.
- Website URL.
- Postcode.
- Instagram URL or Google Business Profile URL.
- Current booking/enquiry link where available.
- Trading address where required for local visibility review.
- Priority tattoo styles/services.
- Known competitors where useful.
- What would make the sprint worthwhile.
- Current enquiry/booking process.
- Access and approval notes.
- Explicit authority/consent for INKCARE to diagnose and prepare the agreed changes.

Public changes still require approval. Onboarding consent is not a blanket permission to alter accounts beyond the agreed scope.

---

# Day 0 — Intake and preflight

The three-working-day clock does not start until Day 0 is complete.

## Operator checklist

- [ ] Confirm payment status is `paid`.
- [ ] Confirm offer slug is correct.
- [ ] Confirm client is not sample/test data.
- [ ] Confirm onboarding is complete.
- [ ] Confirm decision-maker identity.
- [ ] Confirm all URLs load.
- [ ] Confirm any requested account access is the minimum necessary.
- [ ] Capture the exact agreed scope in the client record/evidence folder.
- [ ] Record delivery start timestamp.
- [ ] Record expected end-of-Day-3 deadline.

If access is missing, stop the delivery clock and request the missing prerequisite rather than working around it silently.

---

# Day 1 — Diagnose and baseline

## 1. Capture evidence before changing anything

Capture dated screenshots/records of the relevant current state:

- Google/search-result presentation where observable.
- Google Business Profile where applicable.
- Instagram profile and bio.
- Pinned posts / first-impression content where relevant.
- Website homepage desktop/mobile.
- Artist discovery path where relevant.
- Booking/contact page.
- Link-in-bio/link page.
- Enquiry form.
- Confirmation/next-step messaging where publicly testable.

Do not use a client’s private customer data in screenshots unless necessary and authorised. Redact personal data in evidence packs.

## 2. Test the potential-client journey

Follow the journey as a prospective tattoo client:

**Discovery → Trust → Style/artist fit → Booking information → Enquiry action → Next-step clarity**

Record friction such as:

- no obvious next step;
- conflicting CTAs;
- broken or outdated links;
- inconsistent studio/location details;
- unclear artist/style fit;
- buried booking requirements;
- poor mobile hierarchy;
- weak trust signals;
- unnecessary steps;
- incorrect public details;
- confusing response expectations.

## 3. Score and prioritise

Rank findings using four criteria:

- commercial relevance;
- customer friction;
- confidence/evidence;
- scope/effort.

Select **three priority corrections maximum** for the sprint.

Avoid filling the sprint with cosmetic tasks simply because they are easy.

## 4. Approval checkpoint

Send the decision-maker:

- the three selected problems;
- evidence for each;
- proposed correction;
- what INKCARE will change directly versus supply for the studio;
- any risk/dependency.

Do not proceed with material public changes until the agreed approval is recorded.

---

# Day 2 — Correct

Implement or prepare only the approved priority corrections.

Possible in-scope corrections include:

- Instagram bio and profile CTA;
- profile/link hierarchy;
- booking instructions;
- homepage headline/subheadline;
- booking/contact CTA copy;
- location/style clarity;
- Google Business Profile public-detail corrections where the client has authority and the change is approved;
- first-impression/pinned-content recommendations;
- enquiry-form instruction copy;
- initial enquiry-response template;
- broken booking/contact link correction.

## Change log requirement

For every implemented correction record:

- problem;
- evidence;
- prior state;
- approved change;
- timestamp;
- owner;
- affected URL/account;
- expected purpose;
- rollback method where relevant.

Never describe an unimplemented recommendation as an implemented change.

---

# Day 3 — Verify and deliver

## Verification

Repeat the potential-client journey after the changes.

Verify:

- [ ] All relevant links resolve.
- [ ] Mobile journey is usable.
- [ ] Studio/location details are internally consistent.
- [ ] Booking CTA is obvious.
- [ ] Enquiry requirements are understandable.
- [ ] No approved correction created a new contradiction.
- [ ] Tracking still operates where applicable.
- [ ] Any studio-owned change supplied for manual implementation is clearly marked as pending until the studio confirms it is live.

## Evidence pack

The delivery evidence must clearly separate:

### Before
- Screenshots and observed issue.

### Change
- Exact correction implemented or supplied.

### After
- Screenshot/test result after implementation.

### Remaining limitations
- What could not be changed and why.

### Next 30 days
- What the studio should observe.
- What should not be changed prematurely.
- The next constraint to review if evidence justifies it.

## Final delivery status

Mark the delivery complete only when:

- the three agreed priority items have an evidenced outcome;
- verification is complete;
- the evidence pack is ready;
- pending client-side actions are explicitly labelled;
- known limitations are disclosed;
- follow-up timing is recorded.

---

# Follow-up review

The included follow-up is a focused review, not a second unrestricted sprint.

Review:

- whether agreed changes remained live;
- whether broken/conflicting details returned;
- qualitative enquiry feedback supplied by the studio;
- any measurable funnel signal that is actually available;
- whether the next constraint is visibility, acquisition, booking/retention or broader revenue diagnosis.

Possible recommendations:

- stop and maintain;
- continue monitoring;
- Revenue Audit;
- Booking & Retention Engine;
- Founding Studio Pilot.

Do not force an upsell where the evidence does not justify one.

---

# Acceptance criteria

A £249 delivery passes INKCARE QA when:

1. Payment and client identity are correctly mapped.
2. Onboarding and scope prerequisites are complete.
3. A dated baseline exists.
4. Three or fewer priority corrections are explicitly agreed.
5. Every claimed implementation has evidence.
6. Links and booking route have been retested.
7. Outstanding limitations are visible.
8. Sample/internal data are not presented as results.
9. No result guarantee has been implied.
10. The operator can explain exactly what the £249 purchased.

---

# Failure and escalation rules

## Missing access

Pause the delivery clock and document the missing prerequisite.

## Platform prevents a change

Provide the precise limitation, evidence and manual next action. Do not replace it with an unrelated change merely to fill the deliverable count.

## Change creates a regression

Rollback where possible, capture the failure, retest and document what happened.

## INKCARE misses the delivery deadline for an INKCARE-controlled reason

Apply the commercial remedy promised in the current signed terms/scope. Do not reinterpret the start date after the fact.

## Studio requests out-of-scope work

Document it separately. Complete the agreed sprint first unless the original scope must be formally changed.

---

# Client Zero validation evidence

As of 1 August 2026, the backend £249 fulfilment path has passed an isolated signed synthetic test:

**signed synthetic Stripe checkout → one-time paid client record → secure offer-specific onboarding → completed intake → delivery evidence**

The test:

- used `data_classification=internal_test`;
- created no HubSpot contact;
- created no production automation job;
- used no real studio payment or customer information;
- expired the test onboarding token after completion.

This proves the tested technical handoff, not a real-world studio outcome and not a live-payment result.

The production website must still pass the release gate before the offer is actively sold.