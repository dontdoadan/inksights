# HubSpot Sales Pipeline v1 — INKSIGHTS

Status: **APPROVED — administrative HubSpot stage refactor pending**

Authority: HubSpot owns lead → opportunity → client CRM state. Supabase owns intervention, delivery, evidence, outcome and attribution state.

## Pipeline

Reuse the existing HubSpot pipeline internal ID `default` and rename its visible label to:

**INKSIGHTS — Sales Pipeline**

Do not create a parallel INKSIGHTS sales pipeline unless a later governance decision requires multiple businesses to share the portal.

## Canonical stages

| Order | Stage | Commercial meaning | Suggested probability | Exit condition |
|---|---|---|---:|---|
| 1 | New Opportunity | Studio/contact has entered the commercial pipeline | 10% | identity and basic context confirmed |
| 2 | Qualified | ICP fit and credible commercial problem confirmed | 25% | worth diagnostic effort |
| 3 | Discovery / Diagnostic | Growth Check, discovery or evidence gathering underway | 40% | measurable constraint/opportunity identified |
| 4 | Opportunity Identified | INKSIGHTS has identified a commercially relevant opportunity | 55% | appropriate recommendation/offer selected |
| 5 | Proposal / Recommendation | Scope, recommendation and commercial terms presented | 70% | accepted, rejected or revised |
| 6 | Awaiting Payment | Commercial agreement reached; payment/deposit outstanding | 90% | Stripe provider confirms payment |
| 7 | Closed Won — Client | Payment confirmed and engagement secured | 100% | handoff to intervention/delivery state |
| 8 | Closed Lost | Opportunity ended without a sale | 0% | loss reason recorded |

## Boundary rule

The Deal pipeline answers only:

> Where is this commercial opportunity in the sales process?

Do **not** add delivery states such as intervention running, audit complete, outcome measured or renewal due to the Deal pipeline. Those belong to Supabase intelligence/intervention entities.

## V1 payment consequence

On a provider-confirmed successful payment:

1. Stripe remains canonical payment truth.
2. Supabase records the order projection and `deposit.paid`.
3. The HubSpot Deal moves to **Closed Won — Client**.
4. Stripe provider IDs are written to approved INKSIGHTS Deal properties when those definitions are available.
5. Recovery follow-up stops.
6. Supabase records evidence, outcome and attribution.

## Minimum INKSIGHTS Deal properties

Create when HubSpot property-definition administration is available:

- `inksights_studio_id`
- `inksights_correlation_id`
- `inksights_intervention_id`
- `inksights_stripe_checkout_session_id`
- `inksights_stripe_payment_intent_id`
- `inksights_offer_key`

Until those properties exist, provider IDs may be recorded in the synthetic TEST Deal description for test evidence only. Do not use description parsing as a production integration contract.

## Current TEST Deal

Deal: `521994014909`

For Phase 1 evidence it has been moved to the current stage `5869543641` (labelled **Closed-Completed**) because that is the existing closed-success stage available through the connector. This is a temporary label only.

After the HubSpot pipeline is administratively refactored, this stage should represent **Closed Won — Client** or the TEST Deal should be migrated to whichever stage is configured as the canonical closed-won stage.

## Migration rules

- Preserve pipeline internal ID `default` where possible.
- Preserve existing TEST Deal and associations.
- Do not carry tattoo-specific operational semantics forward.
- Do not migrate intervention/delivery state into HubSpot.
- Verify stage probabilities and closed-won / closed-lost semantics after editing.
- Verify reports, automations and workflows that reference legacy stage IDs before deleting/replacing a stage.
- Do not delete legacy stages until all references have been checked.
