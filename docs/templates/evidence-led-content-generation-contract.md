# Evidence-led content generation contract

Status: proposed technical specification
Date: 2026-09-26

## Input contract

The generator receives:
- one or more governed evidence records;
- target ICP segment and buyer persona;
- pain key;
- funnel stage;
- approved offer;
- target channel/format;
- current brand constraints.

## Required transform

`evidence → insight → felt pain → economic/operational loss → INKSIGHTS value mechanism → offer → CTA → channel rendering`

The underlying claim must remain semantically stable across every derivative asset.

## Required output

Every generation must return:
1. channel-ready copy/structure;
2. claim-to-evidence mapping;
3. classification for each material claim;
4. explicit model assumptions;
5. CTA and funnel stage;
6. QA result covering evidence, brand and conversion;
7. asset metadata suitable for `ops_assets.metadata`.

## Blocking QA conditions

Reject or rewrite when:
- evidence is missing for a factual claim;
- source population/time/geography is materially different and not disclosed;
- a vendor/community signal is written as representative market incidence;
- a modelled value is written as a guaranteed or average outcome;
- the official INKSIGHTS identity is replaced or reinterpreted;
- the CTA does not match the funnel stage;
- the asset has no measurable commercial objective.

## Repurposing rule

One evidence object may produce multiple assets (report, article, social post, video outline, ad, email, poll, calculator, sales brief, diagnostic question, Watch signal) but every derivative retains the same evidence references.

## Learning loop

Performance is not just impressions. Record downstream events where possible:
`asset → diagnostic_start → diagnostic_complete → qualified_lead → audit_sale → intervention → watch`.

Repeated objections and high-converting pain/message pairs should update the commercial playbook, not silently change evidence.
