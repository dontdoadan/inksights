# Calculation Engine V2 Source Contract

Calculation Engine V2 accepts evidence from Supabase, Supermetrics, direct exports and future provider adapters. The source layer supplies facts and lineage; it does not own the economic formula.

## Metric classes

| Class | Meaning | Examples |
| --- | --- | --- |
| observed | Direct source fact at a defined grain | collected revenue, transactions, unique customers, capacity hours |
| derived | Deterministic calculation from observed inputs | purchase frequency, ATV, utilisation |
| modelled | Scenario output requiring assumptions | incremental revenue opportunity, contribution opportunity |
| inferred | Analyst/model interpretation not directly observed | likely constraint, probable conversion gap |
| evidence_backed | Claim supported by explicit evidence but not a raw source value | validated operating benchmark, reconciled business rule |

Observed and derived inputs should be preferred over modelled or inferred substitutes whenever both exist.

## Minimum lineage for model inputs

Where available, each input should preserve:

- `source_type`
- `source_ref`
- `observed_at`
- classification
- source reliability (0–1)
- completeness (0–1)
- source/analyst confidence (0–1)
- sample adequacy (0–1), where statistically meaningful
- freshness half-life appropriate to the source
- transformation lineage for derived values

Economic value and evidence quality are separate. Missing quality metadata must never silently scale the pound-value estimate.

When INKSIGHTS emits an **evidence quality score**, each scored evidence item must provide source reliability, completeness, confidence and freshness. Freshness may be supplied directly or calculated from `age_days` and a source-specific `freshness_half_life_days`. If the minimum quality metadata is unavailable, evidence quality remains unscored rather than being inferred from one favourable dimension.

## Three-lever identity

For one declared measurement period:

`revenue = unique customers × purchase frequency × average transaction value`

When purchase frequency is derived as `transactions / unique customers` and ATV as `revenue / transactions`, reconstructing revenue from those same values is an **algebraic identity**, not an independent reconciliation test. Calculation Engine V2 therefore exposes the identity decomposition but does not claim that a zero variance validates source quality.

Source reconciliation must happen upstream when independent systems or independently observed measures disagree.

## Capacity normalisation

Capacity cannot be applied unless the adapter can supply all of:

1. available capacity units;
2. booked capacity units in the same unit;
3. capacity units consumed by one incremental transaction.

Examples:

- Session-based studio: 120 available sessions, 100 booked sessions, 1 session per transaction.
- Hour-based studio: 800 available hours, 680 booked hours, 5.5 average booked hours per incremental transaction.

The engine must not assume that one hour, one chair, one day and one transaction are equivalent.

## Contribution economics

Incremental contribution is calculated only when an evidence-backed **contribution margin rate** is supplied. Gross margin is not automatically substituted for contribution margin because the two measures answer different economic questions.

If contribution margin is unavailable, the engine returns revenue opportunity and leaves contribution opportunity null.

## Supermetrics contract

Source discovery on 14 September 2026 identified authenticated HubSpot and Instagram sources. The authenticated HubSpot portal exposes additive measures suitable for observed evidence, including contact counts, customer counts, deal counts, deal amount and closed-won amount.

Supermetrics also explicitly marks several HubSpot measures as non-aggregatable, including examples such as average deal size, win rate and average days to close. These fields may be correct at the requested grain but must not be summed or averaged again across grouped rows.

Rules:

1. Prefer additive numerator/denominator fields when INKSIGHTS needs to recompute a rate across a different grain.
2. If a provider marks a field non-aggregatable, request the desired reporting grain directly.
3. Preserve source currency and timezone before normalisation.
4. Do not use contact emails, phone numbers or other personal identifiers as calculation inputs unless a specific workflow requires row-level entity resolution.
5. Supermetrics fields are evidence inputs only; provider-specific rates do not override the canonical INKSIGHTS metric dictionary.

## Currently optional Supermetrics adapters

Google Search Console, Google Analytics, Google Ads, Google Business Profile and several SEO sources are discoverable but not currently authenticated in the connected Supermetrics team. Calculation Engine V2 therefore does not depend on them. When connected later, they can supply acquisition/search evidence without changing the economic engine contract.

## Data quality checks before economic modelling

At minimum:

- revenue, transactions and unique customers must refer to the same measurement window;
- revenue must use one declared currency;
- transactions and unique customers must be positive for the three-lever identity;
- duplicate transaction/customer grain must be resolved before aggregation;
- capacity units must use one consistent unit within a run;
- recent or partial periods must be explicitly labelled;
- provider-supplied rates must not be re-aggregated contrary to their field contract;
- independently sourced metrics that disagree must be reconciled upstream and their lineage retained.
