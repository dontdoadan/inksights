# INKSIGHTS Phase 0 — Frozen Data & Integration Contract

**Status:** READY FOR PHASE 0 APPROVAL  
**V1 intervention:** Enquiry Recovery  
**Scope:** specification/control plane only. This file does not authorise production schema, RLS/auth, live HubSpot mutations, live Stripe writes, production deployment, or customer messaging.

## 1. Canonical ownership

| Domain | Canonical authority | V1 rule |
|---|---|---|
| Studio identity | Supabase | `public.studios.id` is `studio_id` |
| Person / Contact | HubSpot CONTACT | HubSpot record ID is person CRM identity |
| Lead | HubSpot Contact/Company lifecycle | Lead is a state, not a Supabase master |
| Opportunity | HubSpot DEAL | Deal ID is opportunity identity |
| Event | Supabase | Immutable operational event envelope |
| Consultation | Scheduling provider / Calendar | Provider ID is schedule identity; HubSpot records CRM consequence |
| Payment | Stripe | Checkout Session / PaymentIntent are monetary truth |
| Payment projection | Supabase | `public.orders` is V1 projection candidate |
| Intervention | Supabase | `intelligence_interventions.id` |
| Outcome | Supabase | `intelligence_outcomes.id` |
| Attribution | Supabase | `intelligence_attributions.id` |
| Deployment | Vercel | Runtime/deployment state |
| Technical contract | GitHub | Version-controlled implementation authority |
| Human-readable evidence/control | Google Drive | Operating/control plane |

## 2. Identity chain

One journey receives one `correlation_id` at intake.

`studio_id → hubspot_company_id → hubspot_contact_id → hubspot_deal_id → correlation_id → consultation_provider_id → stripe_checkout_session_id/payment_intent_id → intervention_id → outcome_id → attribution_id`

Rules:
1. Provider IDs are explicit references and are never interchangeable with INKSIGHTS UUIDs.
2. Email/domain/name may help initial matching but cannot remain permanent joins once canonical IDs exist.
3. Stripe metadata carries the journey IDs before checkout is created.
4. A provider replay must not duplicate a side effect.
5. Conflicts resolve by domain authority: HubSpot CRM; Stripe payment; scheduling provider schedule; Supabase intelligence/intervention.

## 3. HubSpot property contract

The supplied HubSpot property exports were reviewed across Contact, Company, Deal, Order, Cart, Subscription, Product, Call, List and Workflow.

### 3.1 REUSE — Contact

Reuse standard properties where available:
- `email`, `firstname`, `lastname`, `phone`
- `lifecyclestage`, `hs_lead_status`, `hubspot_owner_id`
- `hs_email_optout` and relevant subscription opt-out properties for suppression
- `hs_email_bad_address`, `hs_email_quarantined`, `hs_emailconfirmationstatus` as delivery/suppression signals
- `hs_legal_basis` as a legal-basis signal where applicable
- standard source/analytics fields only as evidence; do not overwrite provider-managed analytics fields

### 3.2 REUSE — Company

Reuse:
- `name`, `domain`, `website`
- `lifecyclestage`, `hs_lead_status`
- `hubspot_owner_id`
- standard company activity timestamps as CRM evidence

### 3.3 REUSE — Deal

Reuse:
- `dealname`, `pipeline`, `dealstage`, `dealtype`, `description`
- `amount`, `amount_in_home_currency`
- `closedate`, `closed_lost_reason`, `closed_won_reason`
- `hubspot_owner_id`

The current only observed pipeline is tattoo-booking oriented. V1 must not reuse those stages for INKSIGHTS without an approved pipeline change.

### 3.4 LEGACY-ISOLATED

The supplied export identifies 33 non-HubSpot-defined Contact properties, predominantly tattoo/feedback fields, including the `tattoo_clients` group. Most have 0% fill rate. These remain legacy and are excluded from the INKSIGHTS contract.

Company custom fields `type_of_business` and `estimated_monthly_spend` are not canonical INKSIGHTS identifiers.

Deal custom commercial fields such as `base_price____`, `direct_costs____`, `discount____`, `est_avg_purchases`, `ltv_estimate____`, `net_profit____`, `total_revenue____`, `quantity`, `unit_price`, and `line_item` remain legacy-isolated unless a later product requirement explicitly adopts them.

Subscription custom membership fields remain outside V1.

### 3.5 CREATE — minimum INKSIGHTS extension, subject to explicit HubSpot change approval

**Company**
- `inksights_studio_id` — string; immutable reference to Supabase `studio_id`.

**Deal**
- `inksights_studio_id` — string.
- `inksights_correlation_id` — string/UUID text.
- `inksights_intervention_id` — string/UUID text when a deal is intervention-linked.
- `inksights_stripe_checkout_session_id` — string when created.
- `inksights_stripe_payment_intent_id` — string when available.
- `inksights_offer_key` — string/enumeration for the commercial module/offer.

Do not create Contact duplicates for journey IDs: a Contact can participate in multiple opportunities. Journey-level IDs belong on the Deal/event/payment chain.

### 3.6 Consent and suppression

V1 uses existing HubSpot suppression/legal-basis signals where applicable instead of inventing a generic boolean. Before any automated outbound message, eligibility must evaluate:
- channel and purpose;
- applicable lawful basis/consent record;
- `hs_email_optout`;
- relevant subscription-type opt-out;
- invalid/quarantined email signals;
- explicit workflow suppression;
- complaint/dispute/manual hold.

The implementation must preserve evidence of the eligibility decision. This is a product control, not legal advice.

## 4. Supabase mapping

### Reuse
- Studio: `public.studios`
- Raw website intake candidate: `public.enquiries`
- Payment projection: `public.orders`
- Intervention: `public.intelligence_interventions`
- Outcome: `public.intelligence_outcomes`
- Attribution: `public.intelligence_attributions`
- Evidence: `public.intelligence_evidence`

### Do not repurpose
- `clients` and `transactions` are audit/source-normalisation structures, not live HubSpot/Stripe masters.
- `audit_interventions` is audit-scoped, not the global intervention authority.
- `studio_change_events` and `studio_verification_events` are domain-specific and cannot satisfy generic workflow event semantics.
- `audit_runs`, `visibility_pipeline_runs`, `visibility_report_runs`, and `intelligence_calculation_runs` describe jobs/runs, not immutable provider/business events.

### Required implementation proposal: generic event store

No existing table satisfies the full V1 envelope. Phase 1 should propose one `integration_events` table (name may change only through review) with:
- `event_id uuid primary key`
- `event_type text not null`
- `occurred_at timestamptz not null`
- `received_at timestamptz not null default now()`
- `source_system text not null`
- `source_event_id text`
- `idempotency_key text not null unique`
- `correlation_id uuid not null`
- `studio_id uuid`
- `contact_ref text`
- `opportunity_ref text`
- `intervention_id uuid`
- `processing_status text not null`
- `attempt_count integer not null default 0`
- `payload jsonb not null default '{}'`
- `error_code text`
- `error_detail text`
- `created_at timestamptz not null default now()`
- `updated_at timestamptz not null default now()`

Access class: service/internal. RLS/policies, indexes, FKs, retention and replay procedure require a reviewed migration before application.

## 5. Event catalogue

V1 frozen events:
- `lead.created`, `lead.updated`, `lead.qualified`, `lead.disqualified`
- `message.sent`, `message.delivered`, `message.failed`, `message.replied`
- `consultation.booked`, `consultation.completed`
- `deposit.requested`, `deposit.paid`, `deposit.failed`
- `booking.created`, `booking.cancelled`, `appointment.completed`
- `intervention.started`, `intervention.paused`, `intervention.completed`
- `outcome.recorded`, `attribution.calculated`
- `workflow.failed`, `workflow.retried`, `workflow.escalated`

Later modules may add events without changing existing semantics.

Idempotency: prefer provider event ID. Otherwise derive `source_system + provider_object_id + transition + provider_timestamp/version`.

## 6. Stripe correlation contract

Stripe remains monetary truth. Sandbox first.

Before creating Checkout:
- generate/persist `correlation_id`;
- resolve `studio_id`, HubSpot Contact and Deal IDs;
- resolve `intervention_id` when applicable.

Required Stripe metadata:
- `business=INKSIGHTS`
- `studio_id`
- `hubspot_contact_id`
- `hubspot_deal_id`
- `intervention_id` when applicable
- `correlation_id`
- `offer_key`

On provider-confirmed success:
1. upsert `orders` projection idempotently;
2. emit `deposit.paid`;
3. update approved HubSpot Deal stage/payment references;
4. stop recovery follow-up;
5. record evidence;
6. allow conversion/outcome logic.

The verified sandbox baseline has zero PaymentIntents and zero Checkout Sessions. No live payment writes are part of Phase 0.

## 7. Enquiry Recovery state machine

Happy path:
`RECEIVED → VALIDATED → IDENTIFIED → CLASSIFIED → ACKNOWLEDGED → FOLLOW_UP_ACTIVE → RESPONDED → CONSULTATION_BOOKED → CONSULTATION_COMPLETED → DEPOSIT_REQUESTED → DEPOSIT_PAID → BOOKED → CONVERTED`

Exception/terminal states:
`CLOSED_LOST | PAUSED | ESCALATED | FAILED`

Stop follow-up on:
- valid reply;
- consultation booked;
- deposit paid;
- opt-out/suppression;
- disqualification;
- operator pause;
- complaint/dispute;
- escalation;
- terminal failure.

Every side effect requires attempt count, max attempts, next retry, backoff, final failure state, operator alert and idempotency key.

## 8. Evidence and attribution contract

Evidence states:
`VERIFIED | OBSERVED | CALCULATED | MODELLED | HYPOTHESIS | MISSING`.

Outcome reuses `intelligence_outcomes`: baseline, observed value, delta, measurement period, source, classification, confidence and value classification.

Attribution reuses `intelligence_attributions`: method, confidence, attributed value, confounders, evidence IDs and rationale.

Value classes:
- `recoverable_leakage`
- `modelled_opportunity`
- `captured_upside`

Modelled opportunity must never be presented as captured revenue.

## 9. Operator workspace contract

V1 internal workspace must expose:
- Studio Overview
- Alerts
- Opportunities
- Recommendations
- Active Interventions
- Outcomes
- Attribution / Value
- Evidence / History
- Failed Workflows / Manual Actions

It must answer:
1. What changed?
2. Why does it matter?
3. What may it be worth?
4. What is running/recommended?
5. Did the intervention work?

## 10. Synthetic acceptance fixture

Fixture: `TEST CLIENT — INKSIGHTS V1`.

Required IDs created only in test/sandbox contexts:
- test `studio_id`
- HubSpot test Contact/Company/Deal IDs or isolated test records
- one `correlation_id`
- one test `intervention_id`
- sandbox Stripe Session/PaymentIntent
- provider consultation event ID

Acceptance proof:
1. enquiry ingested exactly once;
2. CRM identity created/matched exactly once;
3. source recorded;
4. event persisted;
5. classification persisted;
6. acknowledgement recorded/sent in approved test channel;
7. follow-up starts;
8. reply stops follow-up;
9. consultation recorded;
10. sandbox deposit route created;
11. sandbox payment succeeds;
12. payment correlates to correct Deal/intervention;
13. HubSpot state updates;
14. Supabase state updates;
15. conversion recorded;
16. outcome recorded;
17. attribution calculated;
18. operator view reflects result;
19. failure/retry/replay test proves no duplicate side effects;
20. test data is tagged and removed/archived per test policy.

## 11. Phase 0 decisions frozen by this contract

- One source of truth per domain.
- Thin HubSpot: CRM and useful commercial summaries only.
- Supabase owns product intelligence and intervention measurement.
- Stripe owns payment truth.
- No parallel Contact/Lead/Opportunity masters in Supabase.
- One journey correlation ID.
- Generic event store required; implementation is a gated Phase 1 migration.
- Existing tattoo-specific HubSpot properties remain isolated.
- Existing tattoo Deal pipeline is not an INKSIGHTS pipeline.
- Sandbox-only payment proof before any live route.
- Branding is P1 and does not block this technical contract.

## 12. Phase 0 completion boundary

Phase 0 is specification complete when:
- entity/field dictionary is frozen;
- event catalogue/envelope is frozen;
- Supabase reuse/gap map is frozen;
- HubSpot property/ownership map is frozen;
- Stripe metadata/correlation contract is frozen;
- workflow state machine is frozen;
- evidence/attribution contract is frozen;
- operator workspace requirements are frozen;
- synthetic acceptance fixture is frozen;
- implementation/security gates are explicit;
- evidence and decisions are logged in Drive and GitHub;
- branch/PR verification passes.

Actual synthetic transaction execution is the first implementation proof after Phase 0 because it requires gated HubSpot/Supabase/Stripe mutations.