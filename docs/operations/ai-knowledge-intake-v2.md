# AI Knowledge Intake & Learning Pipeline v2

Status: Active technical contract
Business scope: shared, inksights, amazon, tattoos_by_daniel_hughes, personal
Canonical inbox: Google Drive folder `00 - AI INBOX`
Folder ID: `1gpJJ3Q9CLqscEwzpschhiAiHNCqG1FX2`
Supabase workflow key: `ai_drive_intake_v1`

## Purpose

Convert durable inputs into governed business assets without allowing unreviewed content to become canonical intelligence.

## Canonical ownership

- Google Drive: human-readable business assets and approved documents.
- Supabase: asset registry, routing, provenance, relationships and operational state.
- GitHub: code, migrations, tests and technical contracts only.
- HubSpot: CRM truth.
- Stripe: payment truth.
- Vercel: runtime/deployment truth.

## Processing flow

`INTAKE -> DETECT -> CLASSIFY -> EXTRACT -> DEDUPLICATE -> ROUTE -> REGISTER -> RELATE -> VALIDATE -> VERIFY`

## Evidence classes

- VERIFIED
- OBSERVED
- CALCULATED
- MODELLED
- HYPOTHESIS

Unverified adjacent-market research must not be promoted directly into canonical INKSIGHTS intelligence.

## Knowledge packet

Each processed item should capture:

- source
- source_ref
- title
- original_name
- business_key
- asset_type
- category
- sensitivity
- summary
- content_hash
- version
- classification_confidence
- evidence_classification
- factual_claims
- observations
- calculations
- models
- hypotheses
- decisions
- reusable_ip
- product_opportunities
- commercial_implications
- actions
- dependencies
- related_asset_keys
- inksights_relevance
- recommended_destination
- approval_required
- review_status

## Confidence rules

- >= 0.90: eligible for automatic filing if route is unambiguous and no approval gate applies.
- 0.70–0.89: review required.
- < 0.70: needs review; do not infer purpose.

## Approval gates

Always require explicit approval for:

- deletion
- production schema changes
- RLS/auth/security changes
- commercial calculation changes
- external publication
- payment configuration
- credential/access changes
- production infrastructure changes
- legal/contract changes
- source-of-truth ownership changes

## Failure handling

- Preserve source.
- Record error.
- Create/reuse an exception record.
- Never discard or rewrite the source merely to complete a run.

## Current routes added 2026-09-23

- `amazon_product_research`
- `inksights_adjacent_market_research`

## First live assets

- `amazon_tattoo_apprentice_product_opportunity_v1`
- `inksights_tattoo_education_amazon_crossover_2026_09_23`
- `shared_ai_knowledge_intake_learning_pipeline_v2`

## Brand boundary

The tattoo education/KDP line remains a separate customer-facing product brand. INKSIGHTS may reuse only validated B2B-relevant frameworks, with provenance and evidence status retained.
