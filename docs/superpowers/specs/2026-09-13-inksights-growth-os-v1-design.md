# INKSIGHTS Growth OS v1 — Canonical Design Specification

**Status:** Approved architecture; written specification pending final review  
**Date:** 2026-09-13  
**Scope:** Canonical product loop, business-data model, KPI dictionary, three-growth-lever diagnostic, opportunity scoring, playbook contract, recommendation-to-action workflow, outcome tracking, and case-study proof path.  
**Implementation order:** Tranche 1 = Product Loop v1 + Business Data Model v1 + KPI Dictionary v1. Tranches 2–4 build diagnostics, scoring, playbooks, workflow, tracking, and the first verified case study on top of those contracts.

---

## 1. Purpose

INKSIGHTS is a business growth operating system for tattoo studios. Data and intelligence are the diagnostic input layer; the product's value is translating evidence into prioritized commercial action and then measuring whether those actions improved the business.

The system must answer five questions for a studio owner:

1. **Where is growth being lost or constrained?**
2. **How much is each opportunity economically worth?**
3. **What should the business do next?**
4. **Did the recommended action work?**
5. **What did INKSIGHTS learn that should improve future recommendations?**

The core strategic framework is the three primary ways to grow a business:

- acquire more customers;
- increase average transaction value;
- increase purchase frequency.

Capacity, cancellations, no-shows, operational bottlenecks, data quality, and similar factors are modeled as constraints, leakage, or modifiers — not as additional top-level growth levers.

---

## 2. Design principles

### 2.1 Evidence before interpretation

All material findings, scores, recommendations, and claims must trace back to stored evidence, user-supplied data, deterministic calculations, or explicitly labeled analyst assumptions. AI may interpret, summarize, rank within controlled rules, or improve explanation; it must not invent evidence.

### 2.2 Deterministic economics first

The economic estimate and the recommendation priority score are separate outputs. A recommendation must never collapse a quantified GBP opportunity into a single opaque score.

Example output:

> Estimated annual opportunity: £8,000–£13,000  
> Priority score: 82/100  
> Confidence: 0.74

### 2.3 Version everything that can change meaning

Metric definitions, diagnostic rules, scoring formulas, playbooks, recommendation logic, and attribution methods require explicit versions so historic recommendations remain explainable after the product evolves.

### 2.4 Canonical internal model; integrations as adapters

Stripe, HubSpot, booking systems, CSV/XLSX uploads, website forms, Google Search data, and future integrations map into the INKSIGHTS canonical model. External vendor schemas must not define the internal domain model.

### 2.5 Preserve current production assets unless there is a clear migration benefit

Existing `visibility_studios` remains the canonical studio identity record for v1. Existing `intelligence_*` tables remain the canonical intelligence/action spine. New work should extend these contracts rather than duplicate or prematurely rename them.

### 2.6 Recommendations must be actionable and measurable

Every recommendation must point to a structured playbook, an expected metric movement, a measurement window, an evidence standard, and explicit success criteria.

### 2.7 Learning closes the loop

A completed intervention is not the end state. Outcomes should feed attribution and learning so future scoring, confidence, and playbook selection can improve.

---

## 3. Canonical product loop

The canonical INKSIGHTS loop is:

**Connect / Capture → Normalize → Measure → Diagnose → Quantify Opportunity → Prioritize → Recommend → Decide → Act → Measure Outcome → Attribute → Learn → Re-rank**

### 3.1 Connect / Capture

Inputs may include:

- owner-entered Revenue Audit data;
- CSV/XLSX exports;
- booking-system exports;
- CRM data;
- payments/revenue data;
- search/visibility intelligence;
- manually verified analyst evidence;
- future API integrations.

Each source must retain provenance and import/run identity.

### 3.2 Normalize

Source-specific fields are mapped into the canonical business-activity model. Normalization is responsible for:

- stable identifiers;
- timestamp normalization;
- monetary normalization to minor units + currency;
- de-duplication;
- mapping source status values into canonical enums;
- linking records to the studio and, where possible, artist, client, service, or channel;
- preserving source record IDs and source payload references for auditability.

### 3.3 Measure

Metrics are calculated from normalized business activity and/or verified evidence using versioned metric definitions.

### 3.4 Diagnose

Metrics are evaluated against diagnostic rules under the three growth levers and against constraint/leakage conditions.

### 3.5 Quantify Opportunity

Each diagnosis produces an economic opportunity estimate where feasible, preferably as a low/base/high range with documented assumptions.

### 3.6 Prioritize

Opportunities are ranked using a versioned priority model that considers economic impact and execution reality without replacing the underlying GBP estimate.

### 3.7 Recommend

A ranked opportunity maps to one or more structured playbooks. Recommendations contain context-specific rationale, expected movement, evidence, and measurement rules.

### 3.8 Decide

The business accepts, rejects, or defers the recommendation. Rejection and deferral reasons are retained as product learning.

### 3.9 Act

Accepted recommendations instantiate interventions/tasks using the selected playbook version.

### 3.10 Measure Outcome

After the defined measurement window, INKSIGHTS calculates the post-intervention metric state and records observed commercial results.

### 3.11 Attribute

The system records how confidently the observed result can be attributed to the intervention using an explicit method such as before/after, experiment, control group, difference-in-differences, modeled attribution, or analyst assessment.

### 3.12 Learn and Re-rank

Observed results update the learning record and may alter future confidence, estimated impact, or preferred playbook ordering. Historic scores and recommendations remain immutable except for correction workflows.

---

## 4. Canonical domain model

The domain model has four layers.

## 4.1 Layer A — Business identity

Existing `visibility_studios` remains the studio/business identity anchor for v1.

Required entities:

| Entity | Purpose | v1 treatment |
|---|---|---|
| Studio | Canonical business account/location | Use `visibility_studios` |
| Location | Physical operating location | Model explicitly when multi-location support is required; v1 may remain one primary location per target studio |
| Team member / artist | Capacity and performance unit | Add canonical activity-layer entity linked to studio |
| Service / offer | Tattoo/service/package/product being sold | Add canonical activity-layer entity linked to studio |
| Acquisition channel | Where demand originated | Canonical enum/dimension, extensible for source-specific values |

### Identity rules

- A studio may have many source identities but one canonical `visibility_studios.id`.
- Source registry/identity-resolution tables remain responsible for resolving external studio identities.
- Artists and clients must use studio-scoped identifiers to prevent cross-tenant collision.
- Personally identifiable client data should be minimized to what is necessary for retention/frequency analytics.

---

## 4.2 Layer B — Business activity

This is the principal missing layer required to move from narrow audits/visibility intelligence into a general growth OS.

Recommended canonical entities:

### `business_artists`

Represents a revenue-producing team member.

Minimum fields:

- `id`
- `studio_id`
- `external_source_type`
- `external_source_id`
- `display_name`
- `active_from`
- `active_to`
- `status`
- `created_at`
- `updated_at`

### `business_clients`

Represents a studio-scoped client identity suitable for cohort, repeat-rate, and lifecycle analysis.

Minimum fields:

- `id`
- `studio_id`
- `external_source_type`
- `external_source_id`
- `first_seen_at`
- `last_seen_at`
- `consent_or_tracking_status` where required
- optional hashed or privacy-preserving contact key for deduplication
- `created_at`
- `updated_at`

### `business_enquiries`

Represents inbound commercial demand before a confirmed appointment/transaction.

Minimum fields:

- `id`
- `studio_id`
- `client_id` nullable
- `artist_id` nullable
- `service_id` nullable
- `channel`
- `occurred_at`
- `status`
- `qualified_at` nullable
- `consultation_at` nullable
- `booked_at` nullable
- `lost_at` nullable
- `lost_reason` nullable
- `external_source_type`
- `external_source_id`
- `created_at`
- `updated_at`

Canonical enquiry statuses should support at least:

`new`, `contacted`, `qualified`, `consultation`, `booked`, `lost`, `spam`, `unknown`.

### `business_appointments`

Represents booked service capacity and attendance outcome.

Minimum fields:

- `id`
- `studio_id`
- `client_id` nullable
- `artist_id` nullable
- `service_id` nullable
- `enquiry_id` nullable
- `scheduled_start_at`
- `scheduled_end_at`
- `booked_at` nullable
- `status`
- `cancelled_at` nullable
- `cancellation_reason` nullable
- `completed_at` nullable
- `quoted_amount_minor` nullable
- `deposit_amount_minor` nullable
- `currency`
- source identifiers
- timestamps

Canonical appointment statuses should support at least:

`pending`, `confirmed`, `completed`, `cancelled_client`, `cancelled_studio`, `no_show`, `rescheduled`, `unknown`.

### `business_transactions`

Represents money received/refunded and supports revenue/AOV/LTV analysis.

Minimum fields:

- `id`
- `studio_id`
- `client_id` nullable
- `artist_id` nullable
- `appointment_id` nullable
- `service_id` nullable
- `transaction_type`
- `occurred_at`
- `gross_amount_minor`
- `refund_amount_minor`
- `net_amount_minor`
- `currency`
- `payment_status`
- source identifiers
- timestamps

Transaction types should include at least:

`deposit`, `service_payment`, `retail`, `membership`, `package`, `refund`, `adjustment`, `other`.

### `business_capacity_periods`

Represents available sellable capacity per studio/artist over a defined period.

Minimum fields:

- `id`
- `studio_id`
- `artist_id` nullable
- `period_start`
- `period_end`
- `available_minutes`
- `blocked_minutes`
- `booked_minutes`
- `source_type`
- source identifiers
- timestamps

### `business_services`

Represents sellable services/offers/packages relevant to monetisation analysis.

Minimum fields:

- `id`
- `studio_id`
- `name`
- `category`
- `pricing_model`
- `list_price_minor` nullable
- `currency`
- `active_from`
- `active_to`
- source identifiers
- timestamps

### Activity-model rules

- Monetary values are stored in minor units plus ISO currency.
- Source payloads should not be treated as canonical records until normalized.
- Records should support idempotent upsert using `(studio_id, external_source_type, external_source_id)` where feasible.
- Deletion from external systems should be represented deliberately rather than silently removing historic commercial evidence.
- Normalization confidence/data-quality status should be recorded when mappings are uncertain.

---

## 4.3 Layer C — Intelligence

Use the existing canonical `intelligence_*` spine:

- `intelligence_metric_definitions`
- `intelligence_metric_values`
- `intelligence_evidence`
- `intelligence_findings`
- `intelligence_diagnoses`
- `intelligence_recommendations`
- `intelligence_decisions`
- `intelligence_interventions`
- `intelligence_outcomes`
- `intelligence_attributions`
- `intelligence_learning`

### Required semantic boundaries

- **Metric value:** calculated or observed business measurement.
- **Evidence:** source material that supports a claim, metric, diagnosis, or recommendation.
- **Finding:** descriptive observation; not yet a causal diagnosis.
- **Diagnosis:** interpreted commercial problem/opportunity tied to a growth lever or constraint.
- **Recommendation:** ranked proposed action tied to one or more diagnoses and a playbook version.

---

## 4.4 Layer D — Execution and learning

The existing decision/intervention/outcome/attribution/learning tables form this layer.

Required lifecycle:

**Opportunity → Recommendation → Accepted / Rejected / Deferred → Decision → Planned Intervention → In Progress → Completed → Outcome Measured → Attribution → Learning → Future score/playbook adjustment**

The implementation must enforce legal state transitions at the service/domain layer even if the underlying database stores generic statuses.

---

## 5. KPI and metric dictionary v1

The existing metric-definition infrastructure is retained and expanded from the current small seed set into a versioned commercial dictionary.

Every metric definition must include:

- stable `metric_key`;
- display name;
- description;
- growth lever or constraint category;
- unit;
- grain/time window;
- numerator and denominator semantics where applicable;
- required source entities;
- deterministic calculation rule or explicit observed-input rule;
- minimum data-quality requirements;
- version;
- active/effective dates;
- interpretation guidance;
- directionality (`higher_is_better`, `lower_is_better`, `contextual`);
- optional benchmark semantics;
- null/insufficient-data behavior.

## 5.1 Lever 1 — More customers

Initial canonical metrics:

1. `enquiry_count`
2. `qualified_enquiry_count`
3. `booking_count_new_clients`
4. `enquiry_to_booking_rate`
5. `qualified_to_booking_rate`
6. `median_first_response_minutes`
7. `lost_enquiry_rate`
8. `channel_enquiry_share`
9. `channel_booking_conversion_rate`
10. `new_client_revenue`
11. `customer_acquisition_cost` — only when spend data is available and source quality is sufficient
12. `referral_booking_share`
13. `local_search_opportunity_score` — existing metric retained, evidence-driven only

## 5.2 Lever 2 — Higher average transaction value

Initial canonical metrics:

14. `average_booking_value`
15. `average_completed_appointment_revenue`
16. `average_client_revenue_per_visit`
17. `deposit_value_average`
18. `premium_service_mix_share`
19. `package_or_multi_session_mix_share`
20. `ancillary_revenue_per_client`
21. `discount_rate`
22. `revenue_per_booked_hour`

## 5.3 Lever 3 — Higher purchase frequency

Initial canonical metrics:

23. `repeat_client_rate`
24. `rebooking_rate`
25. `median_days_between_completed_visits`
26. `visits_per_active_client_12m`
27. `repeat_revenue_share`
28. `reactivation_rate`
29. `dormant_client_count`
30. `client_12m_revenue`

## 5.4 Constraints and leakage

Initial canonical metrics:

31. `capacity_utilisation_rate`
32. `unused_capacity_hours`
33. `cancellation_rate`
34. `no_show_rate`
35. `cancellation_recovery_rate`
36. `artist_utilisation_rate`
37. `data_completeness_score`
38. `data_freshness_days`

## 5.5 Existing generic/legacy intelligence metrics

Existing seed metrics such as `demand`, `conversion_potential`, and `revenue_opportunity` should remain for compatibility but must be explicitly classified as either:

- composite/derived intelligence metrics; or
- legacy/deprecated metrics superseded by more precise canonical metrics.

They must not remain ambiguous catch-all concepts.

---

## 6. Three-growth-lever diagnostic v1

Every diagnosis must map primarily to exactly one growth lever, with zero or more constraint/leakage modifiers.

### 6.1 Lever A — More customers

Diagnostic families:

- insufficient demand;
- poor channel mix;
- slow response handling;
- weak qualification;
- low enquiry-to-consult conversion;
- low enquiry-to-booking conversion;
- excessive lost-lead volume;
- weak referral acquisition;
- search/visibility opportunity.

### 6.2 Lever B — Higher average transaction value

Diagnostic families:

- pricing below observed value/capacity economics;
- weak package/session architecture;
- low premium-service mix;
- weak deposit structure;
- missing cross-sell/retail/membership revenue;
- poor monetisation of high-demand capacity;
- low revenue per booked hour.

### 6.3 Lever C — Higher purchase frequency

Diagnostic families:

- low rebooking;
- low repeat-client rate;
- long revisit interval;
- dormant client base;
- weak follow-up/reactivation;
- weak lifecycle offers;
- unaddressed cancellation recovery;
- insufficient post-service retention system.

### 6.4 Constraints / leakage

Examples:

- inadequate capacity;
- excessive cancellations/no-shows;
- insufficient data quality;
- insufficient sample size;
- team bottleneck;
- schedule fragmentation;
- compliance/consent limitation.

A constraint may reduce the priority, feasibility, or confidence of an otherwise attractive growth opportunity.

---

## 7. Opportunity Scoring Engine v1

The first canonical scoring model is deterministic and versioned.

### 7.1 Priority score

`Priority = 0.40 Impact + 0.20 Confidence + 0.15 Feasibility + 0.10 Speed + 0.10 Strategic Fit + 0.05 Learning Value`

Each component is normalized to 0–100 before weighting.

### 7.2 Component definitions

- **Impact:** expected commercial value relative to the studio's economic base, informed by the absolute GBP opportunity and materiality.
- **Confidence:** evidence quality, sample size, data completeness, causal plausibility, and estimate uncertainty.
- **Feasibility:** complexity, dependencies, team effort, tooling, owner control, and operational constraints.
- **Speed:** expected time to observable leading indicator and/or financial impact.
- **Strategic Fit:** alignment with studio goals, positioning, capacity, and current business stage.
- **Learning Value:** how much the intervention could improve future decision quality where uncertainty is high.

### 7.3 Score outputs

Every opportunity score must retain:

- `score_version`;
- total priority score;
- component scores;
- economic estimate low/base/high;
- currency;
- confidence value;
- evidence IDs;
- assumptions;
- constraints applied;
- calculation timestamp.

### 7.4 Guardrails

- Missing data must reduce confidence rather than be silently replaced with invented values.
- A high percentage uplift on a tiny economic base must not automatically outrank a large absolute opportunity.
- An attractive opportunity that is impossible under current capacity may remain high-impact but low-feasibility.
- Scores are ordering aids, not proof of causal effect.

---

## 8. Growth Playbook contract

The first library will contain 27 structured playbooks: nine per growth lever.

Each playbook must be data, not prose-only documentation.

Required fields:

- stable `playbook_key`;
- version;
- title;
- primary growth lever;
- diagnostic families addressed;
- trigger conditions;
- required metrics;
- minimum evidence/data-quality requirements;
- contraindications;
- expected metric movement;
- expected commercial mechanism;
- implementation steps;
- measurement window;
- leading indicators;
- lagging indicators;
- effort level;
- dependencies;
- owner/team role requirements;
- evidence standard;
- success criteria;
- stop/failure conditions;
- learning questions;
- active/effective dates.

### 8.1 Initial playbook families

**More customers:** response-speed improvement, lead follow-up sequence, enquiry qualification, consultation conversion, lost-lead recovery, referral engine, channel reallocation, local-search conversion, paid-lead follow-up discipline.

**Higher AOV:** pricing review, package architecture, multi-session project packaging, premium-offer positioning, deposit optimization, upsell/cross-sell, retail aftercare attachment, membership/continuity offer, revenue-per-hour mix optimization.

**Higher frequency:** next-session rebooking, post-heal follow-up, dormant-client reactivation, cancellation recovery, repeat-project sequencing, lifecycle reminders, client anniversary/reactivation, membership/continuity, referral-plus-return loop.

Exact operational details are implementation content and may evolve independently under versioning.

---

## 9. Recommendation-to-action workflow

### 9.1 Recommendation states

`proposed` → `accepted | rejected | deferred`

A rejected recommendation must capture a reason. A deferred recommendation should capture a revisit date or condition when possible.

### 9.2 Intervention states

`planned` → `in_progress` → `completed | cancelled | abandoned`

### 9.3 Outcome states

`awaiting_measurement` → `measured` → `attributed`

### 9.4 Required recommendation payload

A recommendation must include:

- studio;
- linked diagnosis/opportunity;
- linked playbook + version;
- rank at time of creation;
- economic estimate;
- priority score;
- confidence;
- rationale;
- supporting evidence;
- expected metric movement;
- measurement window;
- success criteria;
- constraints/risks;
- created-at model/ruleset versions.

---

## 10. Outcome and attribution model

### 10.1 Baseline

Before an intervention starts, store the baseline metric window and the exact metric-definition version used.

### 10.2 Post-intervention measurement

Use the playbook's measurement window to calculate observed KPI movement using the same compatible metric semantics.

### 10.3 Attribution

Supported methods align with the existing intelligence spine:

- before/after;
- control group;
- experiment;
- difference-in-differences;
- modeled;
- manual analyst assessment.

Attribution records must include confidence and limitations.

### 10.4 Learning

Learning may update future:

- playbook expected impact ranges;
- playbook confidence priors;
- feasibility assumptions;
- contraindications;
- diagnostic thresholds;
- recommendation ranking.

V1 learning should update structured evidence/priors through controlled product logic, not unrestricted self-modifying AI.

---

## 11. First real-business proof path

The existing INKCARE Client Zero work is useful operating evidence but is not the final tattoo-studio case study for INKSIGHTS.

The first qualifying proof should use a real UK tattoo studio that ideally meets the current ICP:

- one location;
- 3+ artists;
- owner permission;
- access to sufficient business data;
- willingness to implement at least one recommendation;
- willingness to measure the result over the required post-intervention window.

Required proof chain:

**raw business data → normalized activity → KPI calculation → three-lever diagnosis → quantified opportunities → ranked recommendation → implemented playbook → observed KPI delta → attributed commercial value → recorded learning**

A public case study must not claim a financial result until the post-intervention measurement and attribution steps have occurred.

---

## 12. Tranche 1 implementation scope

The first implementation tranche must establish stable contracts only.

### 12.1 Product Loop v1

Deliverables:

- canonical architecture documentation;
- stage definitions and ownership;
- provenance/evidence rules;
- versioning rules;
- domain state-transition rules.

### 12.2 Business Data Model v1

Deliverables:

- SQL migrations for normalized activity entities;
- RLS/tenant isolation strategy consistent with current studio tenancy;
- indexes and idempotency constraints;
- source/provenance fields;
- minimal import/run lineage contract;
- TypeScript domain types/schemas where the current codebase requires them.

### 12.3 KPI Dictionary v1

Deliverables:

- seed definitions for the canonical KPI set;
- deterministic formulas;
- source requirements;
- directionality and null behavior;
- tests for representative metric calculations;
- deprecation/classification decision for ambiguous legacy metrics.

No scoring/playbook/recommendation implementation should be built before these contracts are stable enough to support them.

---

## 13. Subsequent implementation sequence

After Tranche 1 is verified:

1. Three-growth-lever diagnostic engine.
2. Opportunity Scoring Engine v1.
3. First 27 structured playbooks.
4. Recommendation-to-action workflow.
5. Automated baseline/outcome/attribution/learning path.
6. One verified real-business end-to-end run.
7. First measurable case study.
8. Only then broaden integrations and acquisition.

This sequence is intentionally strict to prevent integration breadth, marketing, or UI work from outrunning the intelligence model.

---

## 14. Non-goals for this phase

The following are explicitly out of scope until the canonical loop is working end-to-end:

- broad marketplace/integration expansion;
- generalized multi-industry support;
- autonomous AI that creates unsupported business claims;
- opaque ML opportunity scoring;
- major rebrand/rename of stable production tables solely for naming purity;
- replacing the existing production app stack;
- using Stripe or HubSpot object models as the core domain model;
- publishing a case study before a measured post-intervention result exists.

---

## 15. Security and hardening boundary

Known production security-advisor findings are a separate workstream from product semantics. They should be resolved intentionally after reviewing required access patterns and policies.

This design does **not** authorize blanket RLS or grant changes simply to clear advisor warnings. Any change to RLS, `SECURITY DEFINER` functions, anonymous execution, extension placement, or registry-table policies requires a dedicated security decision and verification path.

New Tranche 1 tables must nevertheless be created with explicit tenancy/RLS intent from the outset.

---

## 16. Acceptance criteria for the design

This specification is ready for implementation planning when the following statements are accepted:

- INKSIGHTS is a growth operating system, not merely a reporting/intelligence product.
- The three growth levers are the canonical top-level diagnostic model.
- Capacity and cancellations/no-shows are constraints/leakage, not separate growth levers.
- `visibility_studios` remains the studio identity anchor for v1.
- `intelligence_*` remains the canonical intelligence/execution spine.
- A normalized business-activity layer is added rather than forcing source schemas directly into intelligence tables.
- The KPI dictionary is versioned and deterministic.
- Economic opportunity and priority score remain separate outputs.
- Playbooks are structured, versioned product IP.
- Recommendations must flow into measurable interventions and attributed outcomes.
- The first true case study requires a real studio, an implemented recommendation, and a valid post-intervention measurement window.
- Integrations and acquisition expansion remain subordinate to proving the canonical loop.

---

## 17. Open implementation decisions to resolve in the plan, not by changing the architecture

These are implementation choices within the approved design:

1. Exact table names for normalized activity entities (`business_*` is the preferred namespace unless it conflicts with existing conventions).
2. Whether a dedicated `data_import_runs` / `business_source_records` lineage layer is required in Tranche 1 or can be represented by source fields plus existing pipeline-run records.
3. Exact RLS helper functions/policy reuse for new activity tables.
4. Exact benchmark strategy for tattoo-industry comparisons when sufficiently reliable external evidence exists.
5. Whether metric calculations run primarily as SQL/materialized computation, application services, or a hybrid. The formulas and semantic outputs must remain identical regardless of execution path.
6. Which real tattoo studio will serve as the first qualifying proof once the system is ready for Step 9.

These decisions must be resolved in the implementation plan with preference for the simplest design that preserves auditability, tenant isolation, and future extensibility.
