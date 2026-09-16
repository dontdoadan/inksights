# INKSIGHTS Commercial Source of Truth

**Status:** Active control document  
**Effective date:** 16 September 2026  
**Owner:** INKSIGHTS founder  
**Currency:** GBP  
**Primary market:** UK tattoo studios with 3+ artists  
**Product authority:** SPEC-001 — INKSIGHTS Product v1 Operating Specification

This document controls current INKSIGHTS commercial naming, sequencing and governance. It does not preserve legacy INKCARE products or prices as active offers.

## 1. Canonical customer pathway

INKSIGHTS uses a constraint-led commercial model:

**Detect → Diagnose → Improve → Monitor → Scale**

The current customer-facing pathway is:

1. **Studio Growth Check** — free diagnostic and qualification entry point.
2. **Studio Intelligence Audit** — paid productised diagnostic. Current founding validation price: **£395**.
3. **Primary Constraint Programme** — scoped implementation proposal based on one evidenced commercial constraint.
4. **Outcome Review** — measured result review, attribution and learning capture.
5. **INKSIGHTS Watch** — recurring monitoring only where repeated monitoring creates decision value.

The £395 Studio Intelligence Audit is a validation price, not a permanent market-validated price anchor. Implementation pricing remains configurable and must not be hard-coded into product logic.

## 2. Commercial governance

1. Current public and sales materials must use INKSIGHTS naming.
2. Legacy INKCARE offers, prices, URLs and product IDs are historical provenance only unless separately re-approved under an INKSIGHTS offer key.
3. No commercial claim may present `MODELLED`, `HYPOTHESIS` or missing evidence as verified performance.
4. Missing data must be shown as missing/insufficient rather than replaced with zero or an invented industry benchmark.
5. Performance-linked pricing is allowed only where baseline, attribution and contribution are measurable.
6. Success fees, if used, must use verified incremental contribution rather than headline gross revenue.
7. Product v1 must distinguish booking value, gross collected revenue, studio-retained revenue and contribution.
8. No offer guarantees rankings, enquiries, bookings, revenue, retention or ROI.
9. The later written proposal/service order governs client-specific scope, dependencies and payment terms.
10. Stripe, HubSpot, the website and Supabase must not be treated as independent commercial authorities. They must follow this document and SPEC-001.

## 3. Offer control

| Stage | Offer | Commercial state | Price / billing rule |
| --- | --- | --- | --- |
| Detect | Studio Growth Check | Active free qualification | Free |
| Diagnose | Studio Intelligence Audit | Active founding validation product | £395 one-off validation price |
| Improve | Primary Constraint Programme | Sales-assisted / scoped | Configurable, evidence/value informed |
| Review | Outcome Review | Included where intervention measurement exists | Determined by engagement scope |
| Monitor | INKSIGHTS Watch | Deferred / selectively offered | Configure only where recurring monitoring creates value |

No additional fixed-price public product is active merely because a legacy system, page, Stripe product or HubSpot line item still exists.

## 4. Value and evidence rules

The core economic model is:

**Revenue = Customers × Purchase Frequency × Average Transaction Value**

Operational drivers such as visibility, enquiry response, consultation quality, deposit conversion, scheduling, no-shows, utilisation, retention, referrals and pricing are mechanisms that move or restrict those three levers.

Commercial value must use one of these classes:

- `RECOVERABLE_LEAKAGE` — evidenced value already escaping an existing transaction/capacity commitment, such as unrecovered no-show/cancellation value. Requires transaction-level or equivalent primary evidence.
- `MODELLED_OPPORTUNITY` — unrealised potential dependent on explicit assumptions, such as unused capacity, search visibility uplift, repeat-rate improvement or pricing headroom.
- `CAPTURED_UPSIDE` — measured incremental result after an intervention, with baseline, measurement window and attribution recorded.

Unused capacity must not be labelled cash leakage. Modelled opportunity must not be presented as realised revenue.

## 5. Platform authority

### GitHub / Vercel

- Production repository: `dontdoadan/inksights`.
- Production application source: GitHub `main`.
- Production hosting: Vercel project `inksight-main`.
- Product v1 changes follow feature branch → protected preview/QA → pull request → merge → production.

### Supabase

- Canonical product/intelligence datastore: INKSIGHTS project `ukaxsqwnkoqbbsufpzga`.
- Intelligence records use explicit provenance, evidence classification and tenant scoping.
- Missing evidence blocks unsupported calculation or diagnosis.
- Legacy INKCARE provenance may remain in metadata for traceability but must not define current brand/commercial state.

### HubSpot

- Canonical role: **lead → opportunity → client CRM**.
- HubSpot must not define product logic, benchmark logic or intelligence evidence.
- New INKSIGHTS deals/products must use current offer names; legacy tattoo/INKCARE records remain isolated historical data.

### Stripe

- Stripe is a payment execution system, not the commercial source of truth.
- Do not reactivate or reuse a legacy product/price merely because it exists in Stripe.
- Fixed payment objects should only be created/activated after the corresponding INKSIGHTS offer is approved here.

### Google Drive

- Drive stores specifications, working intelligence assets, research and case-study evidence.
- Product v1 specification and current intelligence governance documents are current authority.
- Historical R&D and legacy INKCARE material must be labelled archive/provenance and must not silently override current rules.

## 6. Change control

Any change to product name, public price, billing model, fixed scope, commercial sequence, evidence rule or guarantee language must be completed in this order:

1. Approve the change in this document and, where product behaviour changes, SPEC-001.
2. Update executable application/database definitions.
3. Update Stripe/HubSpot only where the changed offer requires them.
4. Update public website and terms/copy.
5. Update Drive operating assets and sales materials.
6. Run cross-platform verification and record the result.

Do not change one platform in isolation.

## 7. Legacy handling

The former INKCARE commercial control is archived under `docs/archive/inkcare/`. Its historical product names, prices and system identifiers are not active INKSIGHTS authority.
