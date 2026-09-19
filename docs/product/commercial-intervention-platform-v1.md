# INKSIGHTS Commercial Intervention Platform — V1 Technical/Product Specification

**Status:** DRAFT — Phase 0  
**Branch:** `phase0/intervention-platform-spec`  
**Business project authority:** Google Drive `Commercial Intervention Platform — Project Home — ACTIVE`  
**Control register:** Google Drive `Commercial Intervention Platform — Control Register — ACTIVE`  
**V1 intervention:** Enquiry Recovery

## 1. Objective

Build the smallest complete loop that proves INKSIGHTS can:

`ENQUIRY → CRM → OPERATIONAL EVENT → CLASSIFICATION → ACKNOWLEDGEMENT → FOLLOW-UP → CONSULTATION → DEPOSIT → CONVERSION → OUTCOME → ATTRIBUTION → REPORT`

This specification freezes the target before implementation. It does **not** authorise production schema, RLS, auth, deployment, live-message, or live-payment changes.

## 2. Canonical system ownership

| Domain | Canonical system | Rule |
|---|---|---|
| Business documents / evidence / reusable business templates | Google Drive | Human-readable operating layer only |
| Code / migrations / tests / technical contracts | GitHub | Version-controlled technical authority |
| Lead → opportunity → client CRM state | HubSpot | CRM lifecycle authority |
| Payment and transaction truth | Stripe | Payment provider authority |
| Application / operational intelligence data | Supabase | Product data authority |
| Deployment / runtime state | Vercel | Deployment authority |
| Original email correspondence | Gmail | Original-message evidence |
| Scheduling / availability | Google Calendar | Calendar authority |
| Visual templates / creative assets | Canva | Design authority |

No integration may create a second competing source of truth.

## 3. Existing-state facts that constrain V1

### HubSpot

Portal `146863001` is readable/writable through the connector. The live deal pipeline is currently `Sales Pipeline` with stages including Appointment Set, Awaiting Deposit, Deposit Received, Booking Confirmed, No-show, Closed - Completed, Closed - Cancelled and Closed - Lost.

The live CRM currently contains tattoo-oriented deal semantics. Do not assume this pipeline is ready for INKSIGHTS Enquiry Recovery. Any pipeline/property mutation requires an explicit change proposal and user approval.

### Stripe

Connected accounts:
- INKSIGHTS live
- INKSIGHTS sandbox

The live account contains an active INKSIGHTS Studio Intelligence Audit payment link. The sandbox currently has no payment links. V1 end-to-end testing must use sandbox until production approval.

### Supabase

Current INKSIGHTS project: `ukaxsqwnkoqbbsufpzga`.

Existing tables already implement substantial portions of the intelligence loop:
- `intelligence_evidence`
- `intelligence_findings`
- `intelligence_diagnoses`
- `intelligence_recommendations`
- `intelligence_decisions`
- `intelligence_interventions`
- `intelligence_outcomes`
- `intelligence_attributions`
- `intelligence_learning`

The Golden Audit model also has `studios`, `audits`, `audit_interventions`, `audit_runs`, `clients`, `transactions`, `orders`, and related evidence/reporting structures.

**Rule:** map/reuse these structures before proposing a new table.

### Vercel

Canonical project: `inksight-main` / `prj_eiuxaOEwD3imsDxsnWnmofP9RAZ7`. Latest observed production deployment is READY; no runtime errors were returned for the previous seven days at the time this specification was prepared.

## 4. V1 domain model

### 4.1 Studio

Required fields:
- `studio_id` — UUID, stable internal identity
- `name`
- `slug`
- `website_url`
- `primary_location`
- `status`
- `created_at`
- `updated_at`

Existing candidate: `public.studios`.

### 4.2 Contact

HubSpot is canonical for live person/contact CRM state.

Minimum cross-system contract:
- `hubspot_contact_id`
- `email`
- `phone` when supplied
- `first_name`
- `last_name`
- `studio_id` when associated
- `consent_state`
- `suppression_state`
- `created_at`
- `updated_at`

Do not introduce a Supabase contact table until the implementation review proves a durable operational need beyond provider IDs and event payloads.

### 4.3 Lead / opportunity

HubSpot is canonical.

Minimum identifiers:
- `hubspot_contact_id`
- `hubspot_company_id`
- `hubspot_deal_id` when an opportunity/deal exists
- `lead_source`
- `lifecycle_stage`
- `deal_stage`
- `owner_id`
- `created_at`
- `updated_at`

### 4.4 Consultation / booking

V1 requires a canonical event representation even if the live scheduling object remains external.

Minimum attributes:
- stable provider event/meeting ID
- contact ID
- studio ID
- start/end
- status
- source system
- created/updated timestamps
- cancellation/reschedule reason where available

### 4.5 Payment

Stripe is canonical. Supabase stores the operational projection needed for product logic.

Existing candidate: `public.orders`, which already stores:
- `stripe_customer_id`
- `stripe_session_id`
- `stripe_payment_intent_id`
- `stripe_subscription_id`
- `stripe_product_id`
- `stripe_price_id`
- `offer_slug`
- `amount_total`
- `currency`
- `status`
- `customer_email`
- `metadata`

V1 must correlate every payment to the relevant studio/contact/opportunity/intervention through provider metadata and stable IDs, not fuzzy matching after payment.

### 4.6 Intelligence / intervention

Use the existing canonical intelligence loop:

`Evidence → Finding → Diagnosis → Recommendation → Decision → Intervention → Outcome → Attribution → Learning`

Primary cross-module intervention authority: `intelligence_interventions`.

`audit_interventions` remains audit-scoped and must not become a competing global intervention authority. Its exact projection/relationship must be verified before implementation.

## 4.7 Phase 0 canonical entity and ID contract

This section freezes the business meaning, canonical owner, and identifier rules for the ten V1 entities. Provider IDs are never treated as interchangeable with INKSIGHTS UUIDs.

| Entity | Canonical meaning | Canonical owner | Canonical ID | Provider / projection IDs | V1 persistence rule |
|---|---|---|---|---|---|
| Studio | A tattoo-studio business identity against which INKSIGHTS measures commercial performance and interventions. | Supabase | `studio_id` UUID | `hubspot_company_id` | Reuse `public.studios.id`; it is identity-linked to `visibility_studios.id`. Do not create a second studio master. |
| Contact | A natural person interacting with INKSIGHTS or a studio in a CRM journey. | HubSpot | `hubspot_contact_id` | email/phone are attributes, not durable IDs | HubSpot remains person authority. Supabase stores the HubSpot ID only where operationally required; no new contact master in V1. |
| Lead | A contact/company that has entered an INKSIGHTS acquisition or qualification process but has not yet become a qualified commercial opportunity. | HubSpot | Contact/company IDs + lifecycle/status | `source_record_id`, `correlation_id` | Lead is a CRM state, not a new Supabase entity/table. Raw intake may remain in `enquiries` as source evidence/projection. |
| Opportunity | A qualified commercial pursuit with a defined next commercial action and potentially monetary value. | HubSpot | `hubspot_deal_id` | `studio_id`, `hubspot_contact_id`, `correlation_id` | HubSpot DEAL is authoritative. Existing tattoo-oriented pipeline is not approved for INKSIGHTS use; pipeline design remains gated. |
| Event | An immutable fact that something relevant happened at a point in time and can drive workflow/measurement. | Supabase | `event_id` UUID | `source_system`, `source_event_id`, deterministic idempotency key, `correlation_id` | A generic durable event store is required by the V1 contract unless an existing structure is proven to meet the envelope/idempotency/replay requirements. No table is approved by this spec alone. |
| Consultation | A scheduled/completed qualification or commercial conversation linked to a contact/opportunity. | Scheduling provider / Calendar for schedule; HubSpot for CRM consequence | provider meeting/event ID | `hubspot_contact_id`, `hubspot_deal_id`, `studio_id`, `correlation_id` | Supabase stores only the event/projection needed for workflow and measurement. It must not become a competing calendar. |
| Payment | A provider-confirmed monetary transaction/attempt associated with an INKSIGHTS commercial journey. | Stripe | Stripe Checkout Session / PaymentIntent IDs | Supabase `orders.id`, `hubspot_deal_id`, `studio_id`, `intervention_id`, `correlation_id` | Stripe is monetary truth. Reuse `orders` as the V1 operational projection where its semantics fit; `transactions` remains audit/source-normalisation data and is not the live Stripe authority. |
| Intervention | An approved, measurable action deployed to address a diagnosed commercial constraint. | Supabase | `intelligence_interventions.id` UUID | `studio_id`, `decision_id`, `correlation_id` where journey-specific | `intelligence_interventions` is cross-module authority. `audit_interventions` is audit-scoped only. |
| Outcome | A measured post-intervention result for a defined metric and measurement period. | Supabase | `intelligence_outcomes.id` UUID | `studio_id`, `intervention_id`, `metric_definition_id`, source reference | Reuse `intelligence_outcomes`; preserve baseline, observed value, delta, period, source, classification and confidence. |
| Attribution | The explicit claim about how much of an outcome can reasonably be credited to an intervention, with method, evidence, confidence and confounders. | Supabase | `intelligence_attributions.id` UUID | `studio_id`, `intervention_id`, `outcome_id` | Reuse `intelligence_attributions`; never equate modelled opportunity with captured revenue. |

### 4.8 Identity and relationship rules

1. `studio_id` is the stable INKSIGHTS business key. HubSpot Company IDs are external references to that studio, not replacements for it.
2. `hubspot_contact_id` is the stable CRM person key. Email and phone may be used for initial matching but must not remain the join key once a HubSpot identity exists.
3. A Lead is a lifecycle state; an Opportunity is a HubSpot DEAL. Do not create parallel lead/opportunity masters in Supabase.
4. Every V1 journey receives a `correlation_id` at intake. It persists across intake, HubSpot, events, consultation, Stripe, intervention, outcome and attribution wherever the provider supports metadata/reference fields.
5. `source_system + source_event_id` is the preferred provider-event identity. When unavailable, derive a deterministic idempotency key from provider + provider object ID + transition + provider timestamp/version.
6. Stripe payment identity is provider-native: Checkout Session and/or PaymentIntent. Supabase `orders.id` is a projection ID only.
7. Consultation identity remains provider-native. Supabase records its operational event/projection, not an independent scheduling master.
8. Intervention → Outcome is one-to-many. Outcome → Attribution may be one-to-many if different defensible attribution methods are recorded, but each attribution must identify one outcome and one intervention.
9. Provider IDs must be stored explicitly. Fuzzy joins by studio name, contact name or email are prohibited after canonical identities exist.
10. Cross-system conflicts resolve by domain ownership: HubSpot wins CRM lifecycle; Stripe wins payment state; Calendar/scheduling provider wins schedule state; Supabase wins intelligence/intervention/outcome/attribution state.

### 4.9 Minimum V1 field dictionary

| Entity | Required V1 fields |
|---|---|
| Studio | `studio_id`, `name`, `slug`, `website_url?`, `primary_location?`, `internal_validation`, `created_at`, `updated_at`, `hubspot_company_id?` as mapped external reference |
| Contact | `hubspot_contact_id`, `email`, `first_name?`, `last_name?`, `phone?`, `lifecycle_stage`, `lead_status?`, `owner_id?`, `consent_state`, `suppression_state`, timestamps |
| Lead | `hubspot_contact_id`, `hubspot_company_id?`, `lead_source`, `lifecycle_stage`, `lead_status`, `source_record_id`, `correlation_id`, timestamps |
| Opportunity | `hubspot_deal_id`, `hubspot_contact_id`, `hubspot_company_id?`, `pipeline`, `deal_stage`, `amount?`, `owner_id?`, `correlation_id`, timestamps |
| Event | `event_id`, `event_type`, `occurred_at`, `received_at`, `source_system`, `source_event_id`, `correlation_id`, `studio_id?`, `contact_ref?`, `opportunity_ref?`, `intervention_id?`, `processing_status`, `attempt_count`, `payload`, error fields |
| Consultation | provider ID, `studio_id`, `hubspot_contact_id`, `hubspot_deal_id?`, `correlation_id`, start/end, status, source, timestamps, cancellation/reschedule reason? |
| Payment | Stripe Session ID, PaymentIntent ID?, Customer ID?, `orders.id` projection ID, `studio_id`, `hubspot_contact_id`, `hubspot_deal_id`, `intervention_id`, `correlation_id`, offer/module key, amount, currency, status, timestamps |
| Intervention | `intervention_id`, `studio_id`, `decision_id`, type, description, target?, baseline period?, start/end?, owner?, status, implementation evidence, timestamps |
| Outcome | `outcome_id`, `studio_id`, `intervention_id`, metric definition?, baseline value?, observed value?, delta?, measurement period, source type/ref?, classification, confidence?, value classification?, observed/created timestamps |
| Attribution | `attribution_id`, `studio_id`, `intervention_id`, `outcome_id`, method, confidence?, attributed value/pence?, confounders, evidence IDs, rationale?, created timestamp |

### 4.10 Verified current-system mapping and gaps

- **Supabase:** `public.studios` already provides the stable UUID studio identity and is identity-linked to `visibility_studios`. `enquiries` already captures source intake and a HubSpot contact reference. `orders` already contains the Stripe IDs and metadata needed for a payment projection. `intelligence_interventions`, `intelligence_outcomes`, and `intelligence_attributions` already cover the downstream measurement chain. Existing `clients`/`transactions` are audit-normalisation structures and must not be repurposed as the live CRM/payment masters.
- **HubSpot:** CONTACT, COMPANY and DEAL are readable/writable. Standard lifecycle/lead-status fields exist. The only observed DEAL pipeline is `Sales Pipeline` and its stages are tattoo-booking oriented; therefore the INKSIGHTS opportunity-stage model is still a controlled design gap, not something to mutate implicitly.
- **Stripe sandbox:** at verification time it contains zero PaymentIntents and zero Checkout Sessions. This is a clean baseline for the synthetic V1 fixture, but no sandbox payment route should be created until the metadata contract and test fixture are approved.
- **Contact compliance gap:** consent/suppression semantics are required by the V1 contract but are not yet frozen as HubSpot property mappings. They must be mapped to existing suitable HubSpot properties or introduced through an approved CRM change before live messaging.
- **Studio ↔ HubSpot gap:** `public.studios` does not currently expose a dedicated HubSpot Company ID in the verified columns. The mapping location must be approved before implementation; do not use studio name/domain as the permanent join.
- **Event-store gap:** no existing structure has yet been verified to satisfy the generic event envelope, provider idempotency, replay and processing-status requirements. This remains a schema-design gate.

## 5. Event contract

V1 needs a consistent event envelope regardless of provider.

### Required envelope

```json
{
  "event_id": "uuid",
  "event_type": "lead.created",
  "occurred_at": "timestamp",
  "received_at": "timestamp",
  "source_system": "hubspot",
  "source_event_id": "provider-id",
  "correlation_id": "uuid-or-stable-business-key",
  "studio_id": "uuid|null",
  "contact_ref": "provider-id|null",
  "opportunity_ref": "provider-id|null",
  "intervention_id": "uuid|null",
  "processing_status": "received|processed|failed|ignored",
  "attempt_count": 0,
  "payload": {},
  "error_code": null,
  "error_detail": null
}
```

### Initial event catalogue

- `lead.created`
- `lead.updated`
- `lead.qualified`
- `lead.disqualified`
- `message.sent`
- `message.delivered`
- `message.failed`
- `message.replied`
- `consultation.booked`
- `consultation.completed`
- `deposit.requested`
- `deposit.paid`
- `deposit.failed`
- `booking.created`
- `booking.cancelled`
- `appointment.completed`
- `review.requested`
- `client.reactivated`
- `intervention.started`
- `intervention.paused`
- `intervention.completed`
- `outcome.recorded`
- `attribution.calculated`
- `workflow.failed`
- `workflow.retried`
- `workflow.escalated`

### Idempotency

- Each provider event must have a deterministic idempotency key.
- A replay must not create duplicate messages, deposits, bookings, or outcome records.
- If a provider does not supply a stable event ID, derive a key from provider + object ID + transition + provider timestamp/version.
- Duplicate detection must be testable.

## 6. Correlation contract

Every cross-system journey requires a stable `correlation_id`.

For Enquiry Recovery, the correlation chain should carry:
- `studio_id`
- `hubspot_contact_id`
- `hubspot_company_id` when applicable
- `hubspot_deal_id`
- `intervention_id`
- `stripe_checkout_session_id` / `payment_intent_id`
- booking/meeting provider ID
- original intake/source ID

Where supported, write these values into provider metadata at creation time. Never rely on names alone.

## 7. Enquiry Recovery state machine

### States

1. `RECEIVED`
2. `VALIDATED`
3. `IDENTIFIED`
4. `CLASSIFIED`
5. `ACKNOWLEDGED`
6. `FOLLOW_UP_ACTIVE`
7. `RESPONDED`
8. `CONSULTATION_BOOKED`
9. `CONSULTATION_COMPLETED`
10. `DEPOSIT_REQUESTED`
11. `DEPOSIT_PAID`
12. `BOOKED`
13. `CONVERTED`
14. `CLOSED_LOST`
15. `PAUSED`
16. `ESCALATED`
17. `FAILED`

### Stop conditions

Automatic follow-up must stop immediately when any of these becomes true:
- valid reply received;
- consultation booked;
- deposit paid;
- explicit opt-out/suppression;
- lead disqualified;
- operator pause;
- complaint/dispute;
- human escalation;
- terminal failure requiring manual resolution.

### Retry model

Every side effect has:
- attempt count;
- maximum attempts;
- next retry time;
- exponential or provider-appropriate backoff;
- final failed state;
- operator alert;
- replay-safe idempotency key.

No silent failure.

## 8. Human-control matrix

### AUTO

- ingest and normalise approved provider events;
- create/update operational projections;
- classify using approved taxonomy;
- send pre-approved acknowledgement/follow-up when consent and eligibility checks pass;
- stop automation when a configured stop condition occurs;
- calculate approved deterministic metrics;
- record evidence and logs.

### APPROVAL

- exceptional pricing;
- policy exception;
- ambiguous artist/service recommendation;
- material change to an active customer's commercial terms;
- transition from test to live messaging/payment.

### ESCALATE

- complaint;
- refund/dispute;
- legal/privacy request;
- medical/safety topic;
- identity uncertainty;
- low-confidence AI output;
- unusual contract/pricing request;
- repeated sync failure.

AI must not invent prices, availability, guarantees, refund terms, medical advice, policies, or contractual commitments.

## 9. Evidence model

Every material conclusion/result must carry:
- evidence ID;
- studio ID;
- evidence type;
- classification;
- source system/type;
- source reference;
- claim;
- observed timestamp;
- confidence;
- payload/metadata.

Business-facing evidence states:
- VERIFIED
- OBSERVED
- CALCULATED
- MODELLED
- HYPOTHESIS
- MISSING

Existing `intelligence_evidence` should be reused unless a gap is proven.

## 10. Outcome and attribution model

Use existing `intelligence_outcomes` and `intelligence_attributions`.

Outcome fields already support baseline, observed value, delta, measurement period, source, classification and confidence.

Attribution fields already support:
- method;
- confidence;
- attributed value;
- value in pence;
- confounders;
- evidence IDs;
- rationale.

Commercial value classifications already supported by the canonical intelligence reconciliation:
- `recoverable_leakage`
- `modelled_opportunity`
- `captured_upside`

Do not present modelled opportunity as captured revenue.

## 11. Required V1 metrics

Acquisition:
- enquiry count
- qualified enquiry count
- source

Conversion:
- first-response time
- enquiry → consultation
- consultation → deposit
- deposit → booking
- overall enquiry → booked-client conversion

Revenue:
- deposits collected
- booked value where defensible
- realised revenue
- revenue per enquiry
- recovered revenue/value

Reliability:
- message delivery failure
- workflow failure/retry
- cancellation/no-show where present

All metric definitions must have a canonical key, unit, formula, evidence classification and version.

## 12. Operator workspace requirements

Internal only for V1.

Must answer:
1. What changed?
2. Why does it matter?
3. What may it be worth?
4. What action is running/recommended?
5. Did the previous intervention work?

Minimum surfaces:
- Studio Overview
- Alerts
- Opportunities
- Recommendations
- Active Interventions
- Outcomes
- Attribution / Value
- Evidence / History
- Failed Workflows / Manual Actions

No studio portal in V1.

## 13. Security requirements

- never expose service-role or secret keys to client code;
- do not commit secrets;
- preserve deployment protection;
- classify every new table/function by access class;
- RLS/security changes require explicit approval and migration review;
- run Supabase security/performance advisors after any DDL;
- use least privilege;
- retain an audit trail for material mutations.

### Open security evidence

Supabase currently reports `public.spatial_ref_sys` with RLS disabled. Do **not** blindly enable RLS: enabling it without compatible policies/access analysis may break PostGIS consumers. Treat as a separate gated remediation.

Some RLS-enabled service/internal tables currently have no RLS policies. Classify them before changing them; this may be intentional service-role-only isolation.

## 14. V1 cross-system contracts to freeze in Phase 0

### Contract A — Intake → HubSpot

Input:
- source
- source record ID
- person details
- studio/company context
- enquiry text
- consent state
- timestamp

Output:
- HubSpot contact ID
- company ID when applicable
- deal/opportunity ID when created
- lifecycle/stage
- owner
- correlation ID

### Contract B — HubSpot → Supabase

Persist provider IDs and the minimum event/projection required for workflow and measurement.

Conflict rule: HubSpot wins for CRM lifecycle fields. Supabase wins for INKSIGHTS intelligence/intervention state.

### Contract C — Stripe → HubSpot/Supabase

Before checkout/payment route creation, write stable IDs into Stripe metadata where supported.

Required metadata:
- `business=INKSIGHTS`
- `studio_id`
- `hubspot_contact_id`
- `hubspot_deal_id`
- `intervention_id`
- `correlation_id`
- `offer/module_key`

On provider-confirmed payment:
- update Supabase payment projection;
- update CRM deal/stage as configured;
- record `deposit.paid`;
- stop follow-up;
- emit outcome/evidence where appropriate.

### Contract D — Calendar/booking

Calendar is scheduling truth. Product state stores provider IDs/status/events needed for workflow and measurement, not a competing calendar.

### Contract E — Gmail

Gmail remains original correspondence evidence. Only structured facts required for CRM/workflow are promoted into the relevant canonical system.

## 15. V1 acceptance fixture

Synthetic identity: `TEST CLIENT — INKSIGHTS V1`.

Required proof:
1. enquiry ingested once;
2. HubSpot identity created/matched once;
3. source captured;
4. operational event persisted;
5. classification persisted;
6. acknowledgement sent;
7. follow-up begins;
8. reply stops follow-up;
9. consultation is recorded;
10. sandbox deposit route created;
11. sandbox payment succeeds;
12. payment correlates to correct opportunity/intervention;
13. HubSpot state updates;
14. Supabase state updates;
15. conversion is recorded;
16. outcome is recorded;
17. attribution is calculated;
18. operator view updates;
19. error/retry path works;
20. test data is identifiable and removed/archived according to test-data policy.

## 16. Phase 0 implementation gates

Before any product implementation:
- entity/field dictionary frozen;
- event catalogue frozen;
- existing Supabase table mapping completed;
- HubSpot CRM mapping approved;
- Stripe metadata/correlation contract approved;
- workflow state machine approved;
- evidence/attribution contract approved;
- operator UI spec approved;
- synthetic fixtures approved;
- security impact classified.

## 17. Known gaps / decisions still required

1. **Generic integration event store:** no canonical generic event table has yet been approved. Determine whether existing run/audit structures can satisfy V1 before proposing a new `integration_events` table.
2. **HubSpot pipeline:** current live deal stages are tattoo-oriented. Define an INKSIGHTS-safe CRM model before any mutation.
3. **Stripe sandbox:** no payment link currently exists. Create only after the sandbox test offer and metadata contract are approved.
4. **Gmail connector:** profile access succeeds, but mailbox read operations currently fail through the connector; reconnect/reauthorisation may be required before email evidence can be integrated.
5. **Canva Brand Kit:** the connected Canva account currently returns no Brand Kits. Visual-template storage exists, but automated brand-kit generation remains unavailable until resolved.
6. **Drive registry duplication:** two files named `Master File Register — ACTIVE` exist. The richer self-registering file is being used operationally; archival of the smaller duplicate requires an explicit cleanup decision.

## 18. Definition of Done

V1 is done only when it is:

**Built → Connected → Protected → Tested → Measured → Attributed → Documented → Repeatable → Verified.**
