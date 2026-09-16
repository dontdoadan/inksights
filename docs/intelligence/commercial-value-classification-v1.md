# INKSIGHTS Commercial Value Classification v1

**Status:** Canonical Product v1 governance  
**Effective date:** 16 September 2026

## Purpose

Every financial impact number presented by INKSIGHTS must declare what kind of value it represents. This prevents modelled upside from being presented as cash already lost or revenue already earned.

## Allowed value classes

### `RECOVERABLE_LEAKAGE`

Value that was attached to a real commercial commitment or demand event and was lost or put at risk through an observable operating failure.

Examples:
- no-show value net of retained deposit;
- late-cancellation value not refilled;
- refundable/avoidable payment leakage where the underlying transaction is evidenced.

Requirements:
- primary or high-quality operational evidence;
- explicit period;
- clear expected-value basis;
- actual recovery/deposit/refund treatment;
- no double counting with subsequently refilled/recovered value.

Permitted external wording: “observed/recoverable leakage” only when the evidence satisfies the above.

### `MODELLED_OPPORTUNITY`

Potential incremental value that depends on one or more explicit assumptions or counterfactual changes.

Examples:
- unused capacity converted into additional paid transactions;
- local-search visibility uplift;
- repeat-rate improvement;
- price/ATV headroom;
- conversion-rate scenario uplift.

Requirements:
- explicit assumptions and scenario range;
- evidence quality/confidence shown separately from the £ estimate;
- operational constraints applied where measurable;
- modelled figures must not be recorded as realised revenue.

Permitted external wording: “modelled opportunity”, “scenario”, “potential upside” or equivalent qualified language.

### `CAPTURED_UPSIDE`

Measured incremental value recorded after an intervention relative to an explicit baseline/comparison method.

Requirements:
- baseline period or valid comparison group;
- intervention start and measurement window;
- measured outcome;
- attribution assessment;
- contribution/margin evidence when claiming profit or using performance-linked pricing.

Permitted external wording must match attribution confidence. A measured change is not automatically caused by the intervention.

## Prohibited conflations

- Unused capacity ≠ cash leakage.
- Search visibility gap ≠ lost bookings unless attributable booking evidence exists.
- Potential repeat-rate improvement ≠ retained revenue already lost.
- Modelled revenue ≠ realised collected revenue.
- Captured gross revenue ≠ incremental contribution.
- Benchmark difference ≠ causal opportunity by itself.

## Reporting contract

Any material financial estimate must display or retain in its record:

- `value_classification`;
- low/base/high value where scenario uncertainty is material;
- measurement period;
- evidence IDs;
- assumptions;
- confidence/evidence-quality signal;
- capacity or other binding constraints applied;
- contribution treatment where relevant.

If those fields cannot be supported, the correct output is `INSUFFICIENT_DATA` or a non-financial finding.

## Aggregation rules

1. Do not add isolated Customers, Frequency and ATV opportunities together if each was calculated ceteris paribus from the same baseline.
2. Combined scenarios must use the versioned compound model and state applied constraints.
3. Recoverable leakage may be aggregated only when underlying events are mutually exclusive or deduplicated.
4. Captured upside must not be added to modelled opportunity for the same intervention and measurement window.

## Evidence labels

Value classification and evidence classification are separate dimensions. For example:

- a `MODELLED_OPPORTUNITY` may be supported by `VERIFIED` baseline inputs plus `MODELLED` uplift assumptions;
- `RECOVERABLE_LEAKAGE` normally requires `VERIFIED`, `OBSERVED` and/or `CALCULATED` lineage;
- `CAPTURED_UPSIDE` requires measured outcome data and a separate attribution record.

## Product v1 rule

The Workspace must prefer accurate uncertainty over a larger number. When evidence is insufficient, suppress the financial claim rather than filling missing inputs with a default industry threshold.