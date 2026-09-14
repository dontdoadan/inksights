# INKSIGHTS Calculation Engine V2 — Design

## Goal

Build a defensible, versioned calculation layer that converts business evidence into explicit low/base/high economic opportunities while enforcing real operating constraints and preserving uncertainty separately from value.

## Design principles

1. **Observed facts remain facts.** Revenue, customers, transactions, capacity and source metrics are not altered by confidence scoring.
2. **Derived metrics are deterministic.** Purchase frequency = transactions / unique customers. Average transaction value = revenue / transactions.
3. **Modelled opportunity is not observed revenue.** Every opportunity carries an engine version, assumptions, constraints, evidence lineage and uncertainty range.
4. **Economics and confidence stay separate.** Weak evidence must not silently reduce or inflate the pound-value estimate. The result exposes economic value and evidence quality independently.
5. **Constraints are first-class.** Transaction-generating growth cannot exceed measurable capacity headroom. ATV uplift does not consume capacity unless a later model explicitly says it does.
6. **Three growth levers compound.** Revenue = customers × average transaction value × purchase frequency. Combined uplift is multiplicative, not the sum of percentage changes.
7. **No double-counting by summing isolated lever values.** Isolated customer, ATV and frequency opportunity values are ceteris-paribus diagnostics only. The portfolio result is calculated from the combined state once.
8. **Version everything.** V1 remains reproducible. V2 is additive.

## Canonical V2 economic model

For a measurement period:

- `F = transactions / unique_customers`
- `ATV = revenue / transactions`
- `modelled_revenue = unique_customers × F × ATV`

For each scenario band `b ∈ {low, base, high}`:

- `requested_transactions_b = transactions × (1 + customer_uplift_b) × (1 + frequency_uplift_b)`
- `requested_incremental_transactions_b = requested_transactions_b - transactions`
- `capacity_headroom_units = max(0, capacity_units - booked_capacity_units)`
- `capacity_headroom_transactions = capacity_headroom_units / capacity_units_per_transaction`
- `constrained_incremental_transactions_b = min(requested_incremental_transactions_b, capacity_headroom_transactions)` when capacity is measurable; otherwise the requested value is retained and the result is flagged `capacity_unmeasured`.
- `projected_ATV_b = ATV × (1 + ATV_uplift_b)`
- `constrained_revenue_opportunity_b = ((transactions + constrained_incremental_transactions_b) × projected_ATV_b) - revenue`
- `unconstrained_revenue_opportunity_b = ((transactions + requested_incremental_transactions_b) × projected_ATV_b) - revenue`

When gross-margin evidence exists:

- `constrained_contribution_opportunity_b = constrained_revenue_opportunity_b × gross_margin_rate`

The model never invents a gross margin when none is supplied.

## Evidence quality

Evidence quality is a separate 0–100 diagnostic. V2 uses the equal-weight harmonic mean of the quality dimensions that are actually supplied:

- source reliability
- completeness
- source/analyst confidence
- sample adequacy
- freshness

Freshness is calculated from an explicit source-specific half-life:

`freshness = 2 ^ (-age_days / half_life_days)`

No universal freshness half-life is baked into the engine. A low evidence-quality score does not multiply the economic value; downstream prioritisation may use the two values side-by-side.

## Reconciliation

The engine reports observed revenue, modelled three-lever revenue, absolute reconciliation variance and proportional variance. A variance above the operational 2% warning threshold is flagged for investigation; the observed input is not overwritten.

## Capacity contract

Capacity constraints are applied only when all three values are supplied:

- `capacity_units`
- `booked_capacity_units`
- `capacity_units_per_transaction`

This prevents hours, chairs, sessions or other capacity units from being treated as interchangeable without an explicit conversion factor.

## Persistence

Add two tenant-scoped structures:

### `intelligence_calculation_versions`

Stores version metadata and transparent configuration for every calculation-engine version.

### `intelligence_calculation_runs`

Stores reproducible input/output snapshots, evidence IDs, assumptions, warnings and period boundaries for each run.

### `intelligence_economic_opportunities`

Stores the resulting low/base/high unconstrained and constrained revenue opportunity, optional contribution opportunity, evidence quality, capacity scale and lineage. These rows are modelled outputs, not observed financial results.

All exposed tables use RLS and the existing `studio_members` ownership rule. `anon` receives no access.

## Metric dictionary changes

Add V2 definitions for:

- purchase frequency
- average transaction value
- revenue identity variance
- capacity headroom
- evidence quality score
- unconstrained economic opportunity
- constrained economic opportunity
- constrained contribution opportunity

Existing V1 metric definitions remain unchanged.

## Supermetrics source contract

Supermetrics is an evidence source, not a calculation authority. The current connected HubSpot source exposes usable inputs such as contact counts, customer counts, deal amounts and closed-won counts. Source-provided non-aggregatable metrics such as win rate and average deal size must never be re-summed or averaged across grouped rows; INKSIGHTS should either request the required grain directly or derive the metric from additive numerator/denominator fields.

Search Console, GA4, Google Ads and other currently unauthenticated Supermetrics sources remain optional future evidence adapters; V2 does not depend on them.

## Validation requirements

The V2 core must prove:

1. exact three-lever identity on consistent inputs;
2. 10% improvement in all three levers compounds to 33.1% before constraints;
3. capacity caps customer/frequency transaction growth without suppressing ATV uplift;
4. evidence quality cannot change the economic estimate;
5. freshness halves at one configured half-life;
6. contribution is emitted only when margin evidence exists;
7. invalid scenario bands fail closed;
8. V1 data and tables remain intact.

## Calibration status

`calculation-engine-v2.0.0` is an explainable deterministic model. It is **pre-calibration** until run against real studio outcomes. No machine learning or learned weighting is introduced at this stage.