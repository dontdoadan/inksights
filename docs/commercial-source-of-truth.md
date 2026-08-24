# INKCARE Commercial Source of Truth

**Status:** Active control document  
**Effective date:** 28 July 2026  
**Owner:** INKCARE founder  
**Currency:** GBP  
**Primary market:** UK tattoo studios  
**Review cadence:** Before any product, price, checkout, proposal, campaign or policy change

This document is the canonical commercial control for INKCARE. Stripe, HubSpot, the public website, Supabase, sales materials, SEO targets, social campaigns, proposals and operating manuals must use the exact names, statuses, prices, billing rules and policy language below.

## 1. Governance rules

1. A product or offer is not considered active unless it appears in this document.
2. Public fixed prices must match Stripe and HubSpot exactly.
3. Scoped services must not be given an invented public price.
4. Prices are shown in GBP. VAT or other tax treatment must be taken from the live invoice or checkout. Do not claim that a price is VAT-inclusive or VAT-exclusive until INKCARE's tax status is confirmed and configured.
5. No offer guarantees rankings, enquiries, bookings, revenue, retention or return on investment.
6. Client-specific work begins only after the agreed payment, complete intake, required access and named approvals are received.
7. The later written service order or proposal governs where it differs from general website copy.
8. Legacy names, prices and experimental offers must be marked archived and must not be used in new campaigns, payment links or proposals.
9. All platform changes must record the offer key and policy version in metadata where supported.
10. Current policy version: `2026-07-28`.

## 2. Canonical offer architecture

### 2.1 Free lead qualification

| Field | Canonical value |
|---|---|
| Offer key | `studio_growth_check` |
| Public name | INKCARE Studio Growth Check |
| Price | Free |
| Commercial status | Active public lead qualification |
| Billing | None |
| Primary URL | `https://getinkcare.co.uk/studio-growth-check` |
| Purpose | Identify the studio's strongest commercial constraint and route it to the smallest appropriate next step. |
| Policy | Educational and diagnostic output only; not a guaranteed outcome, financial audit, legal opinion or binding quote. |

### 2.2 Fixed-scope founding service

| Field | Canonical value |
|---|---|
| Offer key | `72_hour_visibility_fix` |
| Public name | INKCARE 72-Hour Studio Visibility Fix |
| Price | £249 one-off |
| Commercial status | Active public founding offer |
| Billing | Charged in full before work begins |
| Delivery window | Three working days after payment, complete intake and required access are received |
| Primary URL | `https://getinkcare.co.uk/offers/72-hour-visibility-fix` |
| Stripe product | `prod_UxwxwkLtHfPxOY` |
| Stripe price | `price_1Ty13dQsndTiSxljvmDUNLKo` |
| Stripe payment link | `plink_1Ty1BZQsndTiSxljg9W3gR9Q` — inactive until Stripe public terms URL is configured |
| HubSpot product | Pending creation |

**Included:**

- Profile and booking-path diagnosis
- Exact copy and call-to-action corrections
- Priority local visibility checks
- Three-working-day implementation checklist
- Follow-up review and next-step recommendation

**Not included:**

- Full website rebuild
- Ongoing social management
- Paid media spend or management
- Complex CRM or booking migration
- Guaranteed rankings, enquiries, bookings or revenue

**Payment and cancellation policy:**

- Payment is required before delivery begins.
- The delivery clock starts only when prerequisites are complete.
- Where INKCARE cannot accept or commence the work, the payment should be returned.
- Once client-specific work has begun, any refund is limited to undelivered work unless the written scope states otherwise or a legal right applies.
- Client delays, missing access or changed requirements pause delivery and may require a revised scope.

### 2.3 Recurring monitoring service

| Field | Canonical value |
|---|---|
| Offer key | `visibility_watch` |
| Public name | Tattoo Studio Visibility Watch |
| Price | £99 per month |
| Commercial status | Active public subscription |
| Billing | Monthly in advance until cancelled |
| Primary URL | `https://getinkcare.co.uk/offers/visibility-watch` |
| Stripe product | `prod_UtKGmX0daCJFe7` |
| Stripe price | `price_1TtXboQsndTiSxljwEiHQzvh` |
| Stripe payment link | `plink_1Tv39xQsndTiSxljFqKpnofJ` |
| HubSpot product | `424175492300` |

**Included:**

- Search and public-profile health monitoring
- Google Business Profile issue checks where data and access permit
- Reputation and public-detail change alerts
- Competitor visibility observations
- Prioritised action queue
- Periodic visibility summary

**Payment and cancellation policy:**

- £99 is billed monthly in advance.
- Cancellation must be completed before the next renewal to avoid the next charge.
- Service continues until the end of the paid billing period.
- No partial-period refund is promised except where a legal right applies or INKCARE agrees otherwise in writing.
- The service does not guarantee ranking, enquiry or revenue changes.

### 2.4 Scoped diagnosis

| Field | Canonical value |
|---|---|
| Offer key | `revenue_audit` |
| Public name | Tattoo Studio Revenue Audit |
| Price | Scoped quote after the Studio Growth Check |
| Commercial status | Active sales-assisted service |
| Billing | Written scope and payment schedule required before work begins |
| Primary URL | `https://getinkcare.co.uk/offers/revenue-audit` |
| Stripe product | Not created until a repeatable fixed scope is approved |
| HubSpot product | Not created until a repeatable fixed scope is approved |

**Policy:** This is an operational and commercial diagnosis, not accountancy, tax, legal or regulated financial advice. Missing data is marked unknown rather than replaced with invented assumptions.

### 2.5 Scoped implementation capability

| Field | Canonical value |
|---|---|
| Offer key | `booking_retention_engine` |
| Public name | Booking & Retention Engine |
| Price | Scoped quote after diagnosis |
| Commercial status | Active sales-assisted implementation capability |
| Billing | Written scope, dependencies and payment schedule required before work begins |
| Primary URL | `https://getinkcare.co.uk/offers/booking-retention-engine` |
| Stripe product | Use the Founding Studio Pilot package where the studio qualifies |
| HubSpot product | Use the Founding Studio Pilot package where the studio qualifies |

**Policy:** Automation must retain human exception handling. INKCARE does not replace professional legal advice for booking, cancellation, consent or data-protection policies.

### 2.6 Limited implementation package

| Field | Canonical value |
|---|---|
| Offer key | `founding_studio_pilot` |
| Public name | INKCARE Founding Studio Pilot |
| Price | £1,500 installation plus £750 per month for three months |
| Total minimum commitment | £3,750 |
| Commercial status | Active application-only package |
| Billing | £1,500 before implementation; £750 monthly in advance; minimum three-month management term |
| Primary URL | `https://getinkcare.co.uk/offers/founding-studio-pilot` |
| Stripe installation product | `prod_UusdDcUnkzCt2Q` |
| Stripe installation price | `price_1Tv2sJQsndTiSxlj6GbkuyIz` |
| Stripe management product | `prod_UusdGtVfsUDrVN` |
| Stripe management price | `price_1Tv4JeQsndTiSxljxoOrLREv` |
| HubSpot installation product | `424085231847` |
| HubSpot management product | `424152561895` |

**Canonical scope:**

- One UK studio location
- One primary commercial constraint
- Up to two workflows
- Baseline and diagnosis
- Configuration and controlled launch
- Workflow monitoring and exception review
- Reporting and one monthly performance review

**Payment and cancellation policy:**

- The installation fee is due before client-specific implementation begins.
- Management is billed monthly in advance for a minimum three-month term.
- The signed service order governs early termination, access, dependencies and any remaining commitment.
- Completed work and the current paid management period are not promised as refundable except where a legal right applies or INKCARE fails to deliver the agreed scope.
- No open public checkout is required; use an approved proposal, quote or invoice.

## 3. Legacy and prohibited commercial variants

| Legacy item | Status | Required handling |
|---|---|---|
| INKCARE Studio Search Pulse | Retired name | Use Tattoo Studio Visibility Watch |
| INKCARE Visibility Watch as the primary product name | Accepted search alias only | Public commercial name remains Tattoo Studio Visibility Watch |
| £750 one-time Monthly Management price `price_1Tv2sQQsndTiSxlj4dpeP2n9` | Archived 28 July 2026 | Never use for new sales |
| Unpriced or experimental concepts presented as active products | Not approved | Mark planned, internal or scoped; do not create checkout links |
| Performance fee | Not currently active | Requires an approved baseline, attribution rules and written agreement before use |
| Revenue or ranking guarantees | Prohibited | Use evidence-controlled language only |

## 4. Platform alignment register

### Stripe

- Live account: `acct_1Tj3xfQsndTiSxlj`
- Business display name: INKCARE
- Currency: GBP
- Active product catalogue must contain the 72-Hour Fix, Visibility Watch and the two Founding Studio Pilot components.
- The redundant £750 one-time management price is archived.
- Visibility Watch payment-link metadata uses policy version `2026-07-28`.
- The 72-Hour Fix payment link remains inactive until the Stripe public business profile has the Terms of Service URL `https://getinkcare.co.uk/terms`; after that, require terms acceptance before activation.
- Automatic tax remains disabled and price tax behaviour remains unspecified until tax/VAT status is confirmed.

### HubSpot

- Account: `148925665`
- Currency and account settings must remain GBP / Europe-London where supported.
- Products must mirror Stripe names, prices, frequencies and IDs.
- Create the 72-Hour Fix product at £249 one-time.
- Do not create catalogue products for scoped services until their repeatable fixed scope and price are approved.
- Deal and line-item descriptions must identify the canonical offer key and policy version.

### Website and GitHub

- Repository: `inkcaregroup-cpu/inkcare`
- Primary branch: `main`
- Public offer data must use this document's names and prices.
- Public pages must distinguish fixed-price, subscription, scoped and application-only routes.
- The sitemap must include all active public offer pages and must not contain retired URLs.
- The terms page must state the canonical billing, cancellation, tax and no-guarantee rules.

### Supabase and Command Centre

- Store canonical offer keys rather than display-name variants.
- Stripe and HubSpot IDs must be mapped to the same offer key.
- Sample or test records must be labelled and excluded from verified client revenue.
- Connector health must alert on product-name, price, frequency, active-status and policy-version drift.
- Current direct Supabase administration access must be restored before the catalogue can be mirrored and automatically reconciled.

### SE Ranking and search systems

- Authoritative project: `12608570` — INKCARE | UK Tattoo Studio Growth.
- Duplicate project `12667673` is archived and set to manual.
- Target URLs must point to active canonical offer pages.
- Studio-client rank tracking must remain separate from INKCARE acquisition tracking.

### Meta, ads and social

- Campaign names and creative must use canonical offer names and prices.
- Do not advertise the Founding Studio Pilot as open checkout; route to qualification/application.
- Do not advertise any guarantee of rankings, bookings, revenue or ROI.
- Paid campaigns must include the offer key in UTMs and platform naming.
- Social posts using legacy offer names must be revised before approval or publishing.

### Google Drive and operating documents

- This file and the current master report are the commercial control layer.
- Older strategy documents remain evidence and history, not current pricing authority.
- Documents containing retired names or prices must be labelled `ARCHIVE`, `LEGACY` or `SUPERSEDED` rather than silently reused.

## 5. Required metadata standard

Where supported, attach:

- `offer`
- `commercial_status`
- `billing`
- `currency=gbp`
- `policy_version=2026-07-28`
- `sales_channel`
- `component` where an offer has installation and management elements

## 6. Pre-publication control checklist

Before publishing a page, payment link, proposal, campaign or social post:

1. Confirm the offer exists in this document.
2. Confirm exact display name.
3. Confirm price and billing frequency.
4. Confirm active/scoped/application status.
5. Confirm checkout or quote route.
6. Confirm cancellation and refund wording.
7. Confirm tax wording is not invented.
8. Confirm no outcome guarantee is implied.
9. Confirm Stripe and HubSpot IDs where applicable.
10. Confirm website URL and UTM offer key.
11. Record the policy version.
12. Run the catalogue reconciliation check.

## 7. Change control

Any change to a name, price, frequency, minimum term, scope or policy must be completed in this order:

1. Approve the change in this document.
2. Update Stripe.
3. Update HubSpot.
4. Update website offer data and terms.
5. Update Supabase mappings and validation rules.
6. Update SEO targets.
7. Update social and ad campaigns.
8. Update proposals, manuals and Drive assets.
9. Run a cross-platform audit and record the result.

Do not change one platform in isolation.