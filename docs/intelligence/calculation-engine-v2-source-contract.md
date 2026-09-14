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
- sample adequacy (0–1)
- freshness half-life appropriate to the source
- transformation lineage for derived values

Missing quality metadata does not change the pound-value calculation. It reduces how much confidence INKSIGHTS can place in the result and should remain visible.

## Capacity normalisation

Capacity cannot be applied unless the adapter can supply all of:

1. available capacity units;
2. booked capacity units in the same unit;
3. capacity units consumed by one incremental transaction.

Examples:

- Session-based studio: 120 available sessions, 100 booked sessions, 1 session per transaction.
- Hour-based studio: 800 available hours, 680 booked hours, 5.5 average booked hours per incremental transaction.

The engine must not assume that one hour, one chair, one day and one transaction are equivalent.

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
- the engine should surface reconciliation variance rather than silently forcing inputs to agree.
