# INKSIGHTS Prospect Intelligence — Project Control Record

**Status:** ACTIVE — BUILDING  
**Project key:** PROSPECT-INTELLIGENCE-V1  
**Started:** 2026-10-08  
**Owner:** INKSIGHTS founder  
**Engineering authority:** `dontdoadan/inksights`  
**Canonical production path:** GitHub `main` → Vercel `inksight-main` → `getinksights.co.uk` → Supabase `ukaxsqwnkoqbbsufpzga`  
**Commercial authority:** `docs/commercial-source-of-truth.md`  
**Product principle:** Detect → Diagnose → Improve → Monitor → Scale

## 1. Objective

Build a repeatable internal Prospect Intelligence workflow that allows INKSIGHTS to enter a studio identifier (name, website URL, Google Business Profile URL and/or address), collect defensible public evidence, run the existing intelligence pipeline, prioritise the prospect, and produce a branded acquisition snapshot that can be used to initiate a sales conversation.

This is an acquisition layer over the existing intelligence architecture. It must not create a duplicate studio, report, search-intelligence or opportunity system.

## 2. Customer and business outcome

The workflow must create value before contact while also creating proprietary INKSIGHTS data.

For each prospect it should:

1. identify or match the studio;
2. preserve source provenance and confidence;
3. collect public website/search/business evidence;
4. generate a studio-specific Search Universe where evidence permits;
5. observe search-result competition without misrepresenting provider scope;
6. surface evidence-backed findings and opportunities;
7. calculate a prospect acquisition-priority score from explicit factors;
8. create an internal intelligence dossier;
9. create an external acquisition snapshot that reveals useful evidence without giving away the full paid audit;
10. hand qualified prospects into the canonical CRM pathway;
11. retain evidence/outcomes for future benchmarking, acquisition learning and product improvement.

## 3. Non-negotiable constraints

- Preserve GitHub source → migrations/source → Supabase → deployed runtime as the technical source-of-truth hierarchy.
- Do not rebuild working systems from scratch.
- Reuse canonical tables/functions where they fulfil the requirement.
- Do not modify or delete critical production data to make tests pass.
- No unsupported Google-ranking, search-volume, revenue, retention, ROI or industry-benchmark claims.
- Preserve evidence classes: VERIFIED, OBSERVED, CALCULATED, MODELLED, HYPOTHESIS.
- Unknown evidence remains unknown.
- Commercial naming and pricing must follow `docs/commercial-source-of-truth.md`.
- Visual output must follow the production brand authority in `docs/brand/CURRENT.md` and `docs/brand/brand-manifest.json`.
- Merge, production deployment, schema/RLS/auth changes and other approval-gated writes require explicit human approval immediately before execution, per `AGENTS.md`.

## 4. Reuse targets already present

Primary canonical assets expected to be reused:

- `studio_candidates`
- `studio_sources`
- `studio_source_observations`
- `studio_identity_matches`
- `visibility_studios`
- `visibility_studio_capabilities`
- `visibility_report_runs`
- `visibility_report_snapshots`
- `visibility_search_universe`
- `visibility_provider_observations`
- `visibility_serp_observations`
- `visibility_competitor_observations`
- `visibility_opportunities`
- canonical intelligence evidence/findings/diagnoses/recommendations tables
- Golden Audit functions/tables where their contracts fit
- Founder Workspace / Founder Operating System surfaces
- HubSpot sync for qualified CRM handoff

## 5. End-to-end target

```text
Prospect input
  → identity/candidate resolution
  → public enrichment
  → website observation
  → Search Universe
  → search observations
  → competitor evidence
  → findings/opportunities
  → prospect acquisition score
  → internal dossier
  → external Acquisition Snapshot
  → founder QA
  → CRM handoff
  → outreach / response / conversion outcome
```

## 6. Acceptance criteria

Work is not complete until a controlled prospect can complete the following without manual raw-Supabase edits:

- [ ] Enter at least one strong identifier in an authenticated INKSIGHTS operator surface.
- [ ] Resolve/create a candidate without duplicating an existing canonical studio.
- [ ] Collect website/public evidence with source, timestamp and confidence/provenance.
- [ ] Generate/reuse studio-specific search intelligence.
- [ ] Store search-result and competing-domain evidence truthfully.
- [ ] Produce at least one evidence-backed finding or explicit insufficient-evidence result.
- [ ] Produce a deterministic, versioned prospect acquisition score with factor breakdown.
- [ ] Generate an internal dossier.
- [ ] Generate a branded external Acquisition Snapshot.
- [ ] Snapshot contains no unsupported claims and exposes evidence class/source context.
- [ ] Founder can review status and output without opening Supabase.
- [ ] Qualified prospect can be handed to the current HubSpot pathway idempotently.
- [ ] E2E controlled run passes.
- [ ] CI passes.
- [ ] Relevant security/performance checks reviewed.
- [ ] SOP, playbook, operating guide and troubleshooting guidance updated.
- [ ] Final evidence and residual risks logged here.

## 7. Initial current-state audit — 2026-10-08

### VERIFIED

- Canonical repository: `dontdoadan/inksights`; default branch `main`.
- Repository currently permits push/admin access through the connected GitHub integration.
- Latest observed `main` commit at audit start: `4fee8fa2ac6577d6d5d893ca8e859d2c1b2c9ec7` — “Harden paid audit CRM handoff”.
- Canonical Supabase project: `ukaxsqwnkoqbbsufpzga`.
- Production database contains historical intelligence, studio registry, Golden Audit, Founder Operating System, CRM/integration and visibility/search migrations.
- Live Edge Functions include visibility/search functions, Golden Audit functions, HubSpot sync, Founder Ops/Command Center functions and payment/integration functions.
- Authenticated application routes already include `/workspace`, `/audits` and audit-detail surfaces.
- Commercial authority fixes the pathway as Studio Growth Check → Studio Intelligence Audit (£395 founding validation price) → Primary Constraint Programme → Outcome Review → selective INKSIGHTS Watch.

### CONTROL ISSUE — SOURCE/PRODUCTION DRIFT

Supabase reports an applied migration named `studio_intelligence_delivery_v1` with version `20261007184125`, but no matching migration file was found in GitHub `main` during the initial audit.

**Rule:** do not overwrite or duplicate this live state. Reverse-engineer its schema/contracts and reconcile it into repository history before adding dependent production schema.

### NOT YET VERIFIED

- Exact schema/contracts introduced by `studio_intelligence_delivery_v1`.
- Whether Golden Audit can already provide most prospect-scanning orchestration.
- Whether current Founder Workspace has an extensible prospect/operator module.
- Existing report-snapshot generation semantics and whether they support acquisition previews.
- Whether current HubSpot contract can accept a prospect before paid conversion without creating duplicate records.
- Current production Vercel deployment commit parity with GitHub `main`.

## 8. Architecture decision log

### D-001 — Reuse before extension
**Decision:** Prospect Intelligence will extend the canonical studio/intelligence stack rather than create a second prospect database or report engine.  
**Reason:** protects data integrity, reduces technical debt and increases the value of existing proprietary data.

### D-002 — Snapshot is a product surface, not a second audit
**Decision:** the Acquisition Snapshot will be derived from canonical evidence/audit state and will deliberately disclose only a curated subset.  
**Reason:** acquisition value without giving away the paid Studio Intelligence Audit.

### D-003 — Truthful incomplete state
**Decision:** insufficient public evidence may produce an “insufficient evidence” finding rather than an invented score/opportunity.  
**Reason:** evidence discipline is part of the INKSIGHTS brand and commercial moat.

## 9. Evidence log

| Date | Evidence | Classification | Result |
| --- | --- | --- | --- |
| 2026-10-08 | GitHub repository metadata | VERIFIED | `dontdoadan/inksights`, default `main` |
| 2026-10-08 | Latest GitHub commit inspection | VERIFIED | `4fee8fa…`, paid audit CRM hardening |
| 2026-10-08 | Supabase migration inventory | VERIFIED | live `studio_intelligence_delivery_v1` migration detected |
| 2026-10-08 | GitHub migration-directory inspection | VERIFIED | no matching delivery migration in `main`; drift exists |
| 2026-10-08 | Supabase Edge Function inventory | VERIFIED | visibility/search, Golden Audit, HubSpot and founder-control functions active |
| 2026-10-08 | Authenticated route inventory | VERIFIED | workspace and audit operator surfaces already exist |

## 10. Change log

| Date | Change | Surface | Verification |
| --- | --- | --- | --- |
| 2026-10-08 | Created project control record and dedicated feature branch | GitHub | pending read-back |

## 11. Test log

No implementation tests run yet. Audit phase in progress.

## 12. Documentation / IP outputs required

Before completion, review and update/create as warranted:

- Prospect Intelligence operator SOP.
- Prospect qualification/scoring playbook.
- Acquisition Snapshot content/evidence rules.
- Public-data acquisition and provenance guide.
- Entity-resolution rules.
- Founder QA checklist.
- CRM handoff SOP.
- Outreach usage playbook.
- Troubleshooting/runbook for failed scans.
- Metric/data dictionary for acquisition scoring.
- Product/service/offer documentation where Prospect Intelligence affects packaging.
- Knowledge-base index references.
- Reusable snapshot/template specification.

## 13. Current next actions

1. Reverse-engineer live `studio_intelligence_delivery_v1` schema and reconcile drift.
2. Inspect Golden Audit contracts and current Workspace implementation.
3. Inspect brand manifest/current brand source before UI/snapshot work.
4. Define minimal canonical prospect data additions only after reuse analysis.
5. Implement on this branch.
6. Open PR and run CI.
7. Run controlled E2E against non-production or safe synthetic data.
8. Request approval immediately before any production schema/deployment/merge gate.
