# INKSIGHTS Constraint & Diagnostic Library v1

**Status:** Canonical Product v1 governance  
**Effective date:** 16 September 2026  
**Authority:** SPEC-001 — INKSIGHTS Product v1 Operating Specification

## Purpose

This document defines the reusable constraint taxonomy used to turn evidence into diagnosis. It does not replace the existing Supabase intelligence schema or playbook library; it governs how those structures are interpreted.

A constraint is not a weak metric by itself. A constraint is an evidence-supported operating condition that materially restricts one or more of the three economic levers:

**Customers × Purchase Frequency × Average Transaction Value**.

## Diagnostic resolution states

Every constraint evaluation must resolve to one of:

- `SUPPORTED` — sufficient evidence supports the constraint.
- `NOT_SUPPORTED` — sufficient evidence exists and does not support the constraint.
- `INSUFFICIENT_DATA` — required evidence is absent, stale, incompatible or too weak to decide.

`INSUFFICIENT_DATA` is not equivalent to zero, healthy, pass or fail. It must block unsupported financial claims and benchmark comparisons.

## Constraint families

### 1. Demand / visibility

**Key:** `demand_visibility`  
**Primary lever:** Customers

Typical mechanisms:
- weak high-intent local search visibility;
- incomplete public discovery surface;
- poor local relevance or search-intent match;
- weak review/reputation evidence relative to a valid cohort;
- insufficient qualified demand.

Minimum evidence before support:
- a defined geographic/search universe;
- observed search/GBP/website evidence or equivalent first-party acquisition data;
- dated observations;
- an appropriate comparison basis where a comparative claim is made.

Do not infer lost bookings from search visibility alone. Visibility uplift is normally `MODELLED_OPPORTUNITY` until attributable customer outcomes are observed.

### 2. Conversion

**Key:** `conversion`  
**Primary lever:** Customers

Typical mechanisms:
- slow enquiry response;
- unanswered enquiries;
- weak consultation-to-deposit conversion;
- booking-path friction;
- quote/follow-up failure;
- inconsistent deposit capture.

Minimum evidence:
- measurable funnel population and time window;
- defined stage transitions;
- counts for numerator/denominator or explicit missing-data state;
- workflow observation where the diagnosis concerns process quality.

### 3. Appointment leakage

**Key:** `appointment_leakage`  
**Primary levers:** Customers, Frequency

Typical mechanisms:
- no-shows;
- late cancellations;
- unrecovered cancelled capacity;
- inadequate deposit protection;
- weak reminder/confirmation controls;
- absent cancellation-backfill process.

Minimum evidence for financial leakage:
- scheduled appointment population;
- event status and timing;
- expected booked value or defensible equivalent;
- deposit/refund/retention treatment;
- evidence of whether released capacity was refilled.

Only evidenced transaction/appointment loss qualifies as `RECOVERABLE_LEAKAGE`. General unused capacity does not.

### 4. Capacity utilisation

**Key:** `capacity_utilisation`  
**Primary levers:** Customers, Average Transaction Value

Typical mechanisms:
- material capacity headroom with evidence of sellable demand;
- scheduling fragmentation;
- artist/chair imbalance;
- capacity unavailable to the conversion process.

Minimum evidence:
- explicit available-capacity definition and unit;
- booked capacity in the same unit and period;
- artist/studio scope;
- demand evidence before claiming that headroom is economically capturable.

Unused capacity is `MODELLED_OPPORTUNITY`, not leakage. A utilisation threshold must come from a valid cohort or be labelled an uncalibrated operational hypothesis.

### 5. Pricing / monetisation

**Key:** `pricing_monetisation`  
**Primary lever:** Average Transaction Value

Typical mechanisms:
- weak price realisation;
- minimum booking economics below a defensible floor;
- missing scope-based pricing;
- absent premium tiers/bundles/add-ons where customer relevance is evidenced;
- pricing headroom with sustained demand and margin evidence.

Minimum evidence:
- realised price/booking values;
- transaction or project definitions;
- margin/contribution evidence for profitability claims;
- comparison cohort for market-relative pricing claims.

Do not infer underpricing solely from competitor advertised prices.

### 6. Frequency / retention

**Key:** `frequency_retention`  
**Primary lever:** Purchase Frequency

Typical mechanisms:
- weak next-booking behaviour;
- low repeat rate within a defined window;
- dormant customers not reactivated;
- missing lifecycle follow-up;
- natural project continuation not captured.

Minimum evidence:
- customer-level transaction history;
- explicit observation/lookback window;
- repeat/dormancy definitions;
- cohort eligibility rules.

Repeat/frequency comparisons are invalid when windows or customer populations differ.

### 7. Measurement readiness

**Key:** `measurement_readiness`  
**Primary lever:** none; diagnostic gate

Typical mechanisms:
- missing baseline;
- inconsistent transaction definitions;
- incomplete customer identity resolution;
- no source lineage;
- incompatible periods;
- missing contribution/margin required for performance pricing.

This family takes precedence when evidence quality prevents a defensible commercial diagnosis. The correct recommendation may be to instrument/clean the data before recommending a revenue intervention.

## Evaluation contract

A system-proposed diagnosis must record:

1. constraint family;
2. affected economic lever;
3. supporting evidence IDs;
4. required evidence that is missing;
5. evidence confidence;
6. diagnostic resolution state;
7. commercial-value class, if a financial estimate is presented;
8. eligible playbook keys;
9. operator decision.

The operator may approve, reject or supersede a proposed diagnosis. Automated rules do not bypass operator approval in Product v1.

## Threshold governance

Historical rules such as fixed utilisation, cancellation, no-show or repeat-rate cut-offs are **uncalibrated hypotheses** unless a current benchmark cohort supports them.

A threshold used without empirical cohort support must be stored/documented as:

- source: `operational_hypothesis`;
- classification: `MODELLED` or `HYPOTHESIS` as appropriate;
- calibration status: `uncalibrated`;
- external wording: qualified, never “industry average” or “industry benchmark”.

## Playbook relationship

Constraint families route into existing atomic playbooks. Playbooks remain interventions/hypotheses, not diagnoses. Multiple playbooks may be eligible for one constraint; one playbook may be applicable to more than one diagnostic context.

The system should prefer the lowest-friction measurable intervention that can prove or disprove the primary diagnosis.