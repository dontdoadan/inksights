# INKSIGHTS Commercial Activation — Reconciliation Log

**Status:** IN REVIEW  
**Branch:** `feat/commercial-activation-20260926`  
**Production merge/deploy:** NOT AUTHORISED  
**Date:** 2026-09-26

## Objective

Complete the pre-customer commercial activation layer without inventing customer evidence:

1. align the free Studio Growth Check and £395 Studio Intelligence Audit to the governed pain / loss / evidence architecture;
2. implement the Revenue Leakage Calculator V1 and Cancellation Cost Calculator V1;
3. reconcile the production Supabase commercial definitions into repository migration history;
4. prepare the first evidence-led outbound cohort;
5. make HubSpot ready for an INKSIGHTS-only sales process as far as the connected administration surface permits.

## Source-of-truth boundaries

- **GitHub:** code, migrations, tests, version-controlled technical/operating documentation.
- **Supabase:** structured intelligence, operational/evidence registry, application data.
- **HubSpot:** lead / account / opportunity / client commercial truth.
- **Stripe:** payment truth.
- **Vercel:** deployment truth.
- **Google Drive:** business research, evidence reports and client-facing documents.

## Production state observed before this branch

- The public `/studio-growth-check` route already submitted to `revenue-audit-v1` and returned an immediate modelled result.
- The £395 `studio-intelligence-audit` offer already existed with live Stripe checkout configuration.
- Public copy still used the older “Free Revenue Audit” language in several navigation and CTA surfaces.
- Supabase already contained the new pre-customer diagnostic, playbooks and calculator definitions created through governed operator tooling on 2026-09-26.
- The repository did not yet contain an idempotent migration representing those latest configuration rows.
- HubSpot still exposes the legacy tattoo-booking deal pipeline. Non-INKSIGHTS / QA deals are quarantined and no genuine active INKSIGHTS deal currently depends on those stages.

## Branch changes

### Public commercial funnel

- Renamed the free public offer to **Studio Growth Check** while preserving its existing API/input contract.
- Reframed outputs as **MODELLED value at stake**, not proven revenue loss or guaranteed recovery.
- Clarified that the free diagnostic is indicative and the £395 Studio Intelligence Audit is the evidence-led verification step.
- Tightened the £395 Audit description, deliverables, process and FAQ around:
  - primary constraint diagnosis;
  - explicit evidence classes and unknowns;
  - value-at-stake calculations where defensible;
  - artist capacity/utilisation questions;
  - one measurable intervention baseline.

### New public tools

- `/revenue-leakage-calculator`
  - capacity, enquiry conversion, cancellation and repeat-business scenarios;
  - separate outputs only;
  - overlapping scenarios are never summed into a fabricated total.
- `/cancellation-cost-calculator`
  - gross cancelled capacity;
  - recovered capacity;
  - retained deposits;
  - unrecovered value-at-stake scenario;
  - explicit MODELLED / event-evidence boundary.

Both calculators route into the Studio Growth Check and £395 Studio Intelligence Audit.

### Navigation

- Updated public navigation/footer/default CTA to Studio Growth Check language.
- Added both calculator routes to the Studio tools surfaces and resource library.
- Updated the Revenue Growth Model’s offer-ladder CTA to the current £395 Studio Intelligence Audit.

### Supabase reconciliation

Added `20260926221500_reconcile_pre_customer_commercial_activation_v1.sql`.

The migration is intentionally idempotent and reconciles the repository with production rows for:

- `artist_utilisation_balancing`;
- `enquiry_to_deposit_conversion`;
- `studio_commercial_health` v1 + 16 governed diagnostic questions;
- `revenue-leakage-calculator-v1.0.0`;
- `cancellation-cost-calculator-v1.0.0`.

No destructive schema operation is included.

## HubSpot state and constraint

The available HubSpot connector can create/update CRM records but does **not** expose deal-pipeline definition administration. Therefore:

- legacy/test records remain excluded from INKSIGHTS reporting;
- no genuine INKSIGHTS deal will be created against the legacy tattoo-booking stages;
- the intended INKSIGHTS deal pipeline remains:
  1. New Lead
  2. Qualified
  3. Audit Proposed
  4. Payment Pending
  5. Paid / Booked
  6. In Delivery
  7. Completed
  8. Closed Lost
- earlier SIGHTS states such as Signal Found / Contacted / Engaged belong in account/contact activity rather than multiplying deal stages.
- pipeline-admin remediation remains a controlled external/admin action until a supported mutation surface is available.

## CRM contact policy

- Never guess personal contact information.
- Reuse existing contacts before creating duplicates.
- Create named contacts only where the professional identity is current enough to support outreach.
- Do not assign a generic studio inbox to a named person unless the source explicitly ties that address to them.
- HubSpot connector confirmation is required immediately before each CRM mutation batch.

## First acquisition cohort

Current active cohort:

1. Unit Two Tattoo Studio
2. Off The Rails Tattoo Studio
3. Northern Tattoo Collective
4. Bold as Brass Tattoo Co.
5. Six Bullets Tattoo
6. Old London Road Tattoos & Piercing
7. Black Sheep Tattoo
8. Redemption Tattoo Studio
9. Frontier Tattoo Parlour
10. Moth & Flame Tattoo

Brighton Tattoo Collective is excluded pending re-verification.

Each active target has a governed signal brief in Supabase. Outreach must lead with an observed signal and diagnostic question, never an unsupported “you are losing £X” claim.

## Required QA before merge

- [ ] Type/build passes on branch.
- [ ] Generated route tree includes both new calculator routes.
- [ ] Growth Check submission contract remains unchanged.
- [ ] £395 Stripe checkout configuration remains unchanged.
- [ ] Both calculators render on protected preview.
- [ ] Calculator results are labelled MODELLED.
- [ ] No calculator sums overlapping revenue-leakage scenarios.
- [ ] Studio Growth Check → £395 Audit handoff works.
- [ ] Mobile layout checked.
- [ ] No legacy branding/logo drift introduced.
- [ ] Supabase preview/migration check passes or any environment-specific limitation is recorded.
- [ ] No production merge/deploy performed without approval.

## Reconciliation rule

When this branch is reviewed, compare:

`main` → branch → Vercel preview → Supabase preview/check → HubSpot current state.

Only after evidence from those surfaces agrees should a merge recommendation be made.
