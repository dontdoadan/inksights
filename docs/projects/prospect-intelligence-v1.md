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

### D-004 — Acquisition score is internal IP
**Decision:** the Prospect Acquisition Score and A/B/C/HOLD priority are visible only in the founder/operator dossier and are excluded from the external Studio Intelligence Snapshot.  
**Reason:** the score exists to allocate INKSIGHTS acquisition effort; it is not a client performance score or an industry benchmark.

### D-005 — Reuse Golden Audit for evidence acquisition
**Decision:** run the canonical Golden Audit for website/search evidence and add only prospect-specific interpretation/scoring. Use a truthfully labelled DuckDuckGo fallback only when canonical search evidence is unavailable.  
**Reason:** avoids a duplicate audit engine while preserving continuity when a configured primary search provider is unavailable.

### D-006 — Reuse the HubSpot sync contract
**Decision:** qualified outbound prospects use the existing `hubspot-sync-v1` path with `source_type=prospect_audit`; idempotency/auditability is stored in `integration_events` using the existing `lead.created` vocabulary.  
**Reason:** HubSpot remains CRM authority and outbound prospects are not misrepresented as inbound contact requests.

### D-007 — Unknown artist count must remain NULL
**Decision:** the review migration changes `visibility_studios.artist_count` from mandatory default zero to nullable/no default.  
**Reason:** a cold prospect's unobserved team size is unknown, not zero.

## 9. Evidence log

| Date | Evidence | Classification | Result |
| --- | --- | --- | --- |
| 2026-10-08 | GitHub repository metadata | VERIFIED | `dontdoadan/inksights`, default `main` |
| 2026-10-08 | Latest GitHub commit inspection | VERIFIED | `4fee8fa…`, paid audit CRM hardening |
| 2026-10-08 | Supabase migration inventory | VERIFIED | live `studio_intelligence_delivery_v1` migration detected |
| 2026-10-08 | GitHub migration-directory inspection | VERIFIED | no matching delivery migration in `main`; drift exists |
| 2026-10-08 | Supabase Edge Function inventory | VERIFIED | visibility/search, Golden Audit, HubSpot and founder-control functions active |
| 2026-10-08 | Authenticated route inventory | VERIFIED | workspace and audit operator surfaces already exist |
| 2026-10-08 | Historical branch `codex/studio-intelligence-v1` | VERIFIED | contains the source corresponding to the live paid-delivery migration; standalone app is not being merged wholesale |
| 2026-10-08 | Golden Audit deployed source | VERIFIED | deployed wrappers pin historical commit `4955ce7846170aa3215d1210cb6e7fba3c560126`; exact orchestrator/evidence contracts recovered from Git history |
| 2026-10-08 | Audit RLS helper `app_private.can_read_studio` | VERIFIED | active platform owner/admin may read canonical audit data; existing audit dossier can be reused |
| 2026-10-08 | Live constraint vocabulary | VERIFIED | diagnosis state/family constraints inspected and implementation corrected before deployment |
| 2026-10-08 | CI lint diagnostics | VERIFIED | first branch validation stopped on six new lint errors; all six remediated and recheck pending |

## 10. Change log

| Date | Change | Surface | Verification |
| --- | --- | --- | --- |
| 2026-10-08 | Created project control record and dedicated feature branch | GitHub | verified by branch/file read-back |
| 2026-10-08 | Added deterministic Prospect Intelligence findings, scoring and acquisition-snapshot model | Application | unit test added; CI pending |
| 2026-10-08 | Added review-only prospect provenance/data-quality migration | Supabase migration source | not applied to production |
| 2026-10-08 | Added founder-only Prospect Intelligence orchestration service | Application server | CI/runtime verification pending |
| 2026-10-08 | Added authenticated prospect queue and dossier routes | Application UI | route/build verification pending |
| 2026-10-08 | Added token-scoped external Studio Intelligence Snapshot route | Application public surface | route/build/runtime verification pending |
| 2026-10-08 | Extended existing HubSpot sync source contract with `prospect_audit` and idempotent `integration_events` ledger | Edge Function source | not deployed; CI pending |
| 2026-10-08 | Added Workspace navigation to Prospect Intelligence | Application UI | route/build verification pending |
| 2026-10-08 | Removed internal acquisition-priority score from public snapshot | Product/evidence boundary | source review verified |

## 11. Test log

| Date | Test / gate | Result | Evidence / remediation |
| --- | --- | --- | --- |
| 2026-10-08 | Live schema contract review | PASS WITH FIX | Found prospect diagnosis vocabulary mismatch before deployment; corrected `resolution_state=open` → `supported` and `constraint_family=demand` → `demand_visibility`. |
| 2026-10-08 | PR #97 CI run 37704945542 — lint | FAIL | Six Prospect Intelligence lint errors: untyped queue rows, untyped admin client, control-character regex, untyped public snapshot lookup. Build/typecheck correctly did not proceed. |
| 2026-10-08 | Lint remediation commit set | FIXED IN SOURCE / RECHECK PENDING | Added generated DB row types, typed admin client, character-code sanitizer and typed JSON output narrowing. CI run 37705246753 pending. |

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
