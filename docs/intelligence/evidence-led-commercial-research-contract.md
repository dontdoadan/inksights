# Evidence-led commercial research contract

Status: proposed technical specification
Date: 2026-09-26

## Purpose

Define how external research and market observations become governed INKSIGHTS evidence that can be reused by diagnostics, content generation, sales enablement and future benchmark products without turning assumptions into facts.

## Canonical boundaries

- Google Drive owns human-facing business research and commercial playbooks.
- Supabase owns structured source, evidence, playbook, asset and outcome records.
- GitHub owns this technical contract and implementation specifications.
- HubSpot owns live lead/opportunity lifecycle state.

## Evidence classes

Allowed classifications: `verified`, `observed`, `calculated`, `modelled`, `hypothesis`.

Every reusable claim must preserve:
- evidence/source reference;
- observed/published date;
- geography / population where applicable;
- confidence;
- classification;
- limitations;
- review status.

## Research-to-market pipeline

`source → evidence → insight → ICP/pain → loss mechanism → value mechanism → offer → asset → funnel event → outcome → learning`

Automation must not skip the evidence or claim-QA stages.

## Claim rules

1. Never convert a modelled scenario into a market average.
2. Never convert qualitative practitioner discussion into prevalence.
3. Vendor survey claims must retain vendor provenance and methodology limitations.
4. No guaranteed revenue outcome may be generated from a diagnostic claim.
5. Derived content must retain the original evidence IDs in metadata.
6. Any numeric claim must be reproducible from the stored source or calculation inputs.

## Initial commercial pain taxonomy

- demand_instability
- channel_dependency
- enquiry_conversion_leakage
- cancellation_capacity_loss
- artist_utilisation_variance
- local_visibility_gap
- reputation_risk
- retention_leakage
- operational_fragmentation
- prioritisation_uncertainty

## Offer mapping

- free_growth_check: probable-constraint discovery
- studio_intelligence_audit: verified diagnosis / prioritisation
- measured_intervention: scoped test against baseline
- watch: recurring monitoring of a live management question
- benchmark_intelligence: future permissioned cohort comparisons

## Content-generation metadata

Minimum asset metadata:
`evidence_refs, source_confidence, icp_segment, persona, pain_key, loss_mechanism, value_driver, funnel_stage, offer_key, channel, format, cta, claim_type, review_status`.

Start by carrying this in `ops_assets.metadata`; create a dedicated content schema only when observed workflow volume justifies it.

## Measurement

Downstream content learning should connect assets to diagnostic starts, qualified opportunities, paid audits, interventions and recurring Watch conversion rather than optimising only for engagement.

## Security / privacy

Benchmark data must be permissioned and appropriately anonymised. Do not publish cohort averages without sample transparency and a defensible comparability definition.
