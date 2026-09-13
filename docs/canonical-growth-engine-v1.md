# INKSIGHTS Canonical Growth Engine V1

Status: canonical V1 specification

## 1. Product loop

INKSIGHTS is not a dashboard. It is a closed-loop growth operating system:

**Connect / ingest → normalise → measure → evidence → find → diagnose → quantify → prioritise → recommend → decide → act → measure outcome → attribute → learn → update playbooks.**

The existing intelligence tables already implement the evidentiary half of this loop:

`intelligence_metric_values → intelligence_evidence → intelligence_findings → intelligence_diagnoses → intelligence_recommendations → intelligence_decisions → intelligence_interventions → intelligence_outcomes → intelligence_attributions → intelligence_learning`.

V1 adds the missing economic decision layer between diagnosis and recommendation:

`growth diagnostic → opportunity score → playbook selection → recommendation`.

### Truth boundary

Every datum must retain one of the existing classifications: `observed`, `derived`, `modelled`, `inferred`, or `evidence_backed`. Modelled opportunity is never represented as realised revenue. A case study cannot claim uplift until an observed outcome exists and attribution is recorded.

## 2. Canonical business-data model

The canonical logical entity is **Business**. `visibility_studios` remains the physical business registry in V1 for backward compatibility with the tattoo vertical; new intelligence code should treat `studio_id` as the current physical foreign key for a business ID and avoid adding more tattoo-specific semantics to the intelligence layer.

### Entity graph

1. **Business** — identity, industry, geography, operating profile.
2. **Data Source** — CRM, payments, booking, website, file import, manual input, provider.
3. **Metric Definition** — versioned semantic definition, formula, unit and classification.
4. **Metric Value** — business + metric + time + value + source + lineage + confidence.
5. **Evidence** — source-backed support for a claim or metric.
6. **Finding** — material pattern or anomaly supported by evidence.
7. **Diagnosis** — causal hypothesis, competing explanations, missing evidence and confidence.
8. **Growth Diagnostic** — maps business economics to the three canonical growth levers.
9. **Opportunity Score** — deterministic prioritisation of a lever/playbook opportunity.
10. **Growth Playbook** — reusable intervention pattern with triggers, actions, success metric and guardrails.
11. **Recommendation** — business-specific application of a playbook/diagnosis.
12. **Decision** — approve, reject, modify, defer or cancel.
13. **Intervention** — the actual action taken, owner, dates and implementation evidence.
14. **Outcome** — before/after observed metric values.
15. **Attribution** — confidence that an intervention contributed to an outcome.
16. **Learning** — reusable knowledge that changes future recommendation/scoring behaviour.

### Canonical economic identity

For a consistent measurement period:

`Revenue = Unique paying customers × Transactions per customer × Average transaction value`

Equivalently:

`Revenue = Customers × Purchase frequency × ATV`.

This identity is the core of the three-growth-lever diagnostic. Capacity, conversion rate, cancellations, no-shows, retention, lead volume, price mix and similar measures are **drivers, constraints or leakages** that explain why one of the three levers is weak; they are not additional top-level growth levers.

## 3. KPI / metric dictionary

### North-star economic metrics

| Key | Definition | Unit | Default classification |
|---|---|---:|---|
| `revenue` | Realised revenue during the period | GBP | observed |
| `unique_customers` | Distinct paying customers during the period | customers | observed |
| `transactions` | Completed revenue-generating transactions | transactions | observed |
| `average_transaction_value` | Revenue / transactions | GBP/transaction | derived |
| `purchase_frequency` | Transactions / unique customers | transactions/customer | derived |

### Customer / acquisition drivers

| Key | Definition |
|---|---|
| `leads` | Distinct prospective customers entering the measurable funnel |
| `qualified_leads` | Leads satisfying the business qualification rule |
| `new_customers` | First-time paying customers |
| `lead_to_customer_conversion_rate` | New customers / qualified leads |
| `customer_acquisition_cost` | Attributable acquisition spend / new customers |

### Frequency / retention drivers

| Key | Definition |
|---|---|
| `repeat_customers` | Customers with more than one completed transaction in the defined lookback |
| `repeat_customer_rate` | Repeat customers / unique customers |
| `customer_retention_rate` | Customers retained between defined cohorts/periods |
| `churn_rate` | Customers lost / customers eligible to return |
| `days_to_second_purchase` | Median days between first and second completed transaction |
| `customer_lifetime_value` | Versioned realised/modelled customer lifetime value |

### Value / margin drivers

| Key | Definition |
|---|---|
| `gross_profit` | Revenue less direct cost of goods/services |
| `gross_margin_rate` | Gross profit / revenue |
| `price_realisation_rate` | Realised selling price / reference or list price |
| `refund_rate` | Refunded value / gross transaction value |

### Capacity / leakage guardrails

| Key | Definition |
|---|---|
| `capacity_units` | Available productive capacity in the period |
| `booked_capacity_units` | Capacity committed to customer work |
| `capacity_utilisation_rate` | Booked capacity / available capacity |
| `cancellation_rate` | Cancelled committed transactions / scheduled transactions |
| `no_show_rate` | No-show transactions / scheduled transactions |

### Derived opportunity metrics

`customer_growth_opportunity`, `frequency_growth_opportunity`, and `atv_growth_opportunity` are modelled economic scenarios and must carry assumptions, lineage and confidence.

## 4. Three-growth-lever diagnostic

For period P, calculate a reconciled baseline first:

- `C = unique_customers`
- `F = purchase_frequency = transactions / C`
- `V = average_transaction_value = revenue / transactions`
- `R = C × F × V`

The diagnostic must reconcile the multiplicative identity within an accepted tolerance before producing high-confidence recommendations.

### Lever 1 — More customers

Question: **How much profitable demand can the business convert into additional paying customers without violating capacity or economics?**

Primary drivers: qualified lead volume, conversion, missed enquiries, acquisition efficiency, availability/capacity, referral volume and search/discovery.

Independent opportunity value:

`ΔRevenue_customers = ΔCustomers × F × V`.

### Lever 2 — Higher purchase frequency

Question: **How much value is available by increasing the number of completed transactions per customer?**

Primary drivers: rebooking, retention, repeat rate, dormant-client reactivation, membership/continuity, follow-up and cancellation/no-show recovery.

Independent opportunity value:

`ΔRevenue_frequency = C × ΔF × V`.

### Lever 3 — Higher average transaction value

Question: **How much value is available by increasing realised value per completed transaction without damaging conversion, retention or margin?**

Primary drivers: price realisation, packaging, premium tiers, scope, cross-sell/upsell, minimum order/booking value and mix.

Independent opportunity value:

`ΔRevenue_ATV = C × F × ΔV`.

### Double-counting rule

Independent opportunity values are used for **ranking**, not summed as a guaranteed total. When modelling a combined target, use the multiplicative target identity:

`Target Revenue = (C + ΔC) × (F + ΔF) × (V + ΔV)`.

Any claimed realised result must come from observed outcomes, not this model.

## 5. Opportunity Scoring Engine V1

Each candidate opportunity is scored 0–100 using deterministic weights:

| Dimension | Weight |
|---|---:|
| Economic impact | 30% |
| Evidence strength | 10% |
| Confidence | 10% |
| Ease / inverse effort | 15% |
| Speed to signal | 10% |
| Strategic fit | 10% |
| Feasibility / capacity | 10% |
| Learning value | 5% |

`Opportunity Score = Σ(dimension score × weight)`.

### Score semantics

- **80–100 — Execute:** high-priority intervention candidate.
- **65–79 — Validate then execute:** valuable, but one material assumption should be tested.
- **50–64 — Backlog / gather evidence:** plausible opportunity with weaker economics or evidence.
- **<50 — Do not prioritise:** insufficient impact/evidence relative to alternatives.

A high modelled revenue estimate cannot compensate for weak evidence: recommendations still expose evidence and confidence separately.

## 6. Growth Playbook Library V1

The first library contains 24 playbooks, eight per lever.

### More customers

1. `lead_response_speed` — reduce time-to-first-response for qualified enquiries.
2. `missed_enquiry_recovery` — recover unanswered/abandoned enquiries.
3. `lead_followup_sequence` — structured multi-touch follow-up for undecided leads.
4. `quote_followup` — follow up high-intent quotes/proposals that have not converted.
5. `referral_engine` — systematic customer referral ask and tracking.
6. `local_visibility_capture` — improve high-intent local discovery → enquiry paths.
7. `lapsed_lead_reactivation` — reactivate qualified historical leads that never purchased.
8. `cancellation_backfill` — refill newly released capacity from waitlists/qualified leads.

### Higher purchase frequency

9. `next_booking_at_checkout` — secure the next transaction before the current journey ends.
10. `dormant_customer_reactivation` — trigger targeted outreach after an evidence-based dormancy threshold.
11. `maintenance_rebooking` — cadence-based reminder for naturally recurring services/products.
12. `milestone_followup` — follow-up based on customer lifecycle or completion milestone.
13. `membership_frequency` — continuity/membership offer where repeat demand is real.
14. `post_purchase_nurture` — education and next-best-action follow-up after purchase.
15. `seasonal_reactivation` — event/season-triggered repeat purchase campaign.
16. `client_recall` — proactive recall list for customers overdue relative to normal cadence.

### Higher average transaction value

17. `price_floor_review` — identify transactions below sustainable/evidence-based price floor.
18. `package_bundling` — bundle complementary scope into a higher-value offer.
19. `upsell_addon` — add relevant incremental value at purchase/booking.
20. `premium_tier` — create a premium option with materially differentiated value.
21. `minimum_booking_value` — introduce or refine minimum economic transaction threshold.
22. `scope_based_pricing` — align price to complexity/scope instead of flat underpricing.
23. `cross_sell` — offer adjacent relevant services/products to current buyers.
24. `value_based_offer_reframe` — improve value packaging before discounting price.

Each playbook stores its trigger, required metrics, action steps, primary success metric, guardrails, effort, risk and expected time-to-signal. Playbook use creates a recommendation; the playbook itself is never evidence that an outcome will occur.

## 7. Recommendation → action workflow

Canonical lifecycle:

1. **Diagnosis created** — causal hypothesis with evidence and missing evidence.
2. **Opportunity scored** — economic value + deterministic priority score.
3. **Playbook matched** — only if required evidence/metrics are sufficient.
4. **Recommendation proposed** — business-specific action, rationale, target metric and measurement window.
5. **Decision recorded** — approved / modified / rejected / deferred.
6. **Intervention created** — implementation owner, baseline window, start/end and evidence.
7. **Outcome observed** — baseline, observed value, delta and source.
8. **Attribution assessed** — method, confounders, confidence and attributed value.
9. **Learning recorded** — whether the hypothesis held and how scoring/playbooks should change.

No recommendation is considered complete merely because the user clicked “accept”; completion requires the intervention and measurement state to be explicit.

## 8. Recommendation / result tracking

The existing recommendation, decision, intervention, outcome, attribution and learning tables remain the system of record. V1 adds links from a recommendation to its playbook and opportunity score plus the primary metric/target/measurement window.

Minimum case-study evidence:

- business identity and evidence classification;
- baseline measurement period;
- diagnosis and evidence IDs;
- scored opportunity and selected playbook;
- decision and intervention timestamps;
- implementation evidence;
- post-intervention observation period;
- observed metric delta;
- attribution method and confounders;
- economic value only when supported;
- explicit limitations.

## 9. End-to-end validation / Client One rule

Internal/sample records may validate software but may not become a customer case study. The first real-business run must use a named, verifiable business and preserve missing data as missing.

The run is considered technically end-to-end when it reaches a recommendation/decision/intervention with an instrumented baseline. It becomes a **measurable result case study only after a post-intervention outcome window exists**. Until then it is a baseline diagnostic / experiment plan, not an uplift case study.

## 10. Expansion gate

Do not prioritise new integrations or acquisition scale until:

1. one real business has a reconciled baseline;
2. the three-lever diagnostic produces explainable outputs;
3. at least one opportunity is scored and converted to a real intervention;
4. the intervention produces an observed outcome;
5. attribution and confounders are recorded;
6. the learning is fed back into a playbook/scoring decision;
7. the resulting case study can distinguish observed facts from modelled opportunity.

Only then should INKSIGHTS widen integrations or accelerate acquisition.