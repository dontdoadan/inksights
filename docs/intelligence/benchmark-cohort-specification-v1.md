# INKSIGHTS Benchmark Cohort Specification v1

**Status:** Canonical Product v1 governance  
**Effective date:** 16 September 2026

## Purpose

INKSIGHTS may compare a studio with a market or peer group only when the comparison population is defined and sufficiently similar to support the claim. This document governs benchmark construction and prevents operational defaults from being presented as tattoo-industry facts.

## Cohort dimensions

A benchmark cohort should use the smallest defensible combination of:

1. **Geography** — UK, nation, region, city, local radius or postcode area.
2. **Studio size** — artist/chair count bands; Product v1 ICP centres on 3+ artist studios.
3. **Operating model** — employed/commission, booth/chair rental, hybrid or unknown.
4. **Market position / price tier** — derived from observed realised or advertised pricing with provenance.
5. **Studio maturity** — trading age where available.
6. **Service/style mix** — only where it materially changes the metric being benchmarked.
7. **Measurement window** — all members must use compatible periods and definitions.

Do not over-segment when sample size becomes too small to support a useful comparison.

## Benchmark states

Each benchmark must carry one state:

- `EMPIRICAL` — derived from an adequate comparable cohort with known definitions and provenance.
- `DIRECTIONAL` — based on a limited or imperfect but disclosed comparison set.
- `UNCALIBRATED` — operational assumption/hypothesis not supported by a valid cohort.
- `INSUFFICIENT_DATA` — no defensible comparison can be produced.

Only `EMPIRICAL` should be described as a benchmark without qualification.

## Minimum requirements

Before a cohort statistic is used externally, store or be able to reproduce:

- metric key/version;
- numerator/denominator definition where applicable;
- cohort dimensions and filters;
- sample size;
- observation period;
- source mix/provenance;
- missingness/exclusions;
- median/percentiles or other statistic used;
- benchmark state;
- freshness date.

Averages should not be the default when the distribution is skewed; prefer median and percentile context where possible.

## Sample adequacy

Product v1 does not impose a universal numeric minimum sample size because adequacy depends on metric variance, segmentation and evidence quality. Until calibrated statistically, use the following governance rule:

- if the cohort is too small, heterogeneous or definitionally inconsistent to support the comparison, return `INSUFFICIENT_DATA`;
- if the set is usable only as context, mark `DIRECTIONAL`;
- do not silently broaden the cohort just to obtain a number.

## Historical thresholds

Legacy R&D referenced examples such as utilisation below roughly 50–60%, utilisation above roughly 85–90%, cancellation/no-show rates above roughly 10–15%, and repeat rates below roughly 25–30%.

These values are retained only as historical hypotheses. They are **not** canonical UK tattoo-industry benchmarks and must not be used as such until an empirical cohort is collected and validated.

## Comparison hierarchy

For a studio-level decision, prefer comparisons in this order when the sample supports them:

1. same studio vs prior comparable periods;
2. same artist/service cohort inside the studio;
3. local comparable studios;
4. city/region comparable studios;
5. wider UK segment;
6. uncalibrated operational hypothesis, clearly labelled.

First-party longitudinal evidence can be more decision-useful than a weak external peer benchmark.

## Public market signals

Google/Maps/search/review/photo/ranking observations can form benchmark variables when collection is consistent. They do not reveal competitor internal economics and must not be used to invent competitor utilisation, revenue, conversion or profitability.

## Calibration lifecycle

1. Collect observations with stable definitions.
2. Record provenance and freshness.
3. Validate missingness and comparability.
4. Create candidate cohort.
5. Review distribution/outliers.
6. Mark the cohort `DIRECTIONAL` until sufficient evidence supports `EMPIRICAL` status.
7. Version any threshold derived from the cohort.
8. Recalibrate as the dataset grows.

## Product v1 rule

When a benchmark is unavailable, the Workspace must say so. `INSUFFICIENT_DATA` is preferable to a fabricated “industry average.”