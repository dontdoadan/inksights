# INKSIGHTS — Emergent Reconciliation Implementation

**Date:** 7 September 2026  
**Status:** Implemented baseline

## Decision

Emergent is a reference implementation, not a dependency. The canonical INKSIGHTS stack remains GitHub → Vercel → Supabase. Existing visibility/search/revenue infrastructure is preserved; the intelligence semantics are being made canonical in our own codebase.

## What is preserved

- Studio and capability model
- Studio Search Universe concept
- provider observations
- SERP observations
- competitor observations
- pipeline/report runs and snapshots
- Revenue Audit V1
- DataForSEO as the first provider adapter
- tenant/RLS controls and rate limiting
- evidence/provenance concepts

## What is being corrected

- metric definitions are versioned
- metric values carry classification, confidence, source and lineage
- modelled conversion and revenue remain explicitly modelled
- LSOS is treated as a versioned derived metric requiring calibration
- reports are consumers of canonical intelligence, not a second calculation engine

## New canonical domain layer

The database now contains additive first-class domains for:

`Metric Definition → Metric Value → Evidence → Finding → Diagnosis → Recommendation → Decision → Intervention → Outcome → Attribution → Learning`

All tenant-scoped records use the existing `studio_members` boundary. Anonymous access is revoked for the new intelligence tables.

The TypeScript contract lives in `src/lib/intelligence-domain.ts` and defines the shared epistemic vocabulary used by the application layer.

## What is deliberately not done yet

- Existing LSOS formulas have not been silently replaced.
- Existing report behaviour has not been destructively rewritten.
- Legacy visibility tables have not been deleted.
- Autonomous AI recommendations have not been enabled.
- Attribution is not claimed until first-party outcome evidence exists.

## Next implementation stage

1. Wire existing SSU/provider observations into the canonical metric/evidence layer.
2. Convert report findings into first-class Finding/Diagnosis/Recommendation records.
3. Add authenticated decision/intervention workflow to the product.
4. Capture first-party commercial outcomes.
5. Implement attribution and learning from measured interventions.
6. Deprecate duplicated legacy calculations only after dependency and E2E validation.
