# INKSIGHTS Information Architecture Consolidation Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Consolidate INKSIGHTS information governance across Google Drive, GitHub, Supabase, Vercel, and local/iCloud ingestion sources so each material asset has one authoritative home, one lifecycle status, one predictable name, and one registry entry.

**Architecture:** Use the approved federated source-of-truth design. Google Drive owns human-facing business assets and the Control Centre; GitHub owns version-controlled technical assets; Supabase owns runtime data/state; Vercel owns deployment/runtime metadata. Local/iCloud is treated as an ingestion source rather than a permanent authority.

**Tech Stack:** Google Drive/Docs/Sheets, GitHub, Supabase/PostgreSQL, Vercel.

**Spec:** `docs/superpowers/specs/2026-09-16-inksights-information-architecture-consolidation-design.md`

## Global Constraints

- Preserve the existing `01 INKSIGHTS` top-level Google Drive structure.
- Preserve Drive file IDs and sharing by moving/renaming existing items in place where possible.
- Do not delete uncertain material; classify it `REVIEW` and retain it.
- Do not bulk-rename INKCARE material to INKSIGHTS.
- Do not cosmetically rename Supabase tables, functions, migrations, Edge Function slugs, Vercel projects, or domains.
- Do not rewrite Git history or delete applied migrations.
- Canonical production repository: `dontdoadan/inksights`, branch `main`.
- Canonical Supabase project: `ukaxsqwnkoqbbsufpzga`.
- Canonical Vercel project: `inksight-main`.
- Default deletion policy: archive rather than delete.
- Existing Supabase `public.spatial_ref_sys` RLS advisory is recorded but not remediated by this project.

---

### Task 1: Establish Control Centre governance assets

**Files / resources:**
- Create Drive folder: `01 INKSIGHTS/00 - Control Centre/00 - Inbox & Triage`
- Create Drive spreadsheet: `INKSIGHTS - Master Asset Registry`
- Create Drive document: `INKSIGHTS - Information Architecture & Filing Standard - CANONICAL - v1.0`

**Interfaces:**
- Consumes: approved design spec and initial cross-platform inventory.
- Produces: canonical registry, system map, naming rules, archive rules, review queue, and change log.

- [ ] Create `00 - Inbox & Triage` if absent.
- [ ] Create the Master Asset Registry with tabs `Assets`, `Systems`, `Changes`, `Review Queue`.
- [ ] Seed lifecycle-status validation values and initial platform/system records.
- [ ] Create the canonical information-architecture/filling-standard document in Control Centre.
- [ ] Verify both governance assets are located inside `00 - Control Centre`.

### Task 2: Complete Drive inventory and archive structure

**Files / resources:**
- Existing `01 INKSIGHTS` tree.
- Create archive subfolders under `90 - Archive` only when absent.

**Interfaces:**
- Consumes: existing Drive folder hierarchy and loose INKSIGHTS/INKCARE assets.
- Produces: classified asset inventory and canonical archive destinations.

- [ ] Create archive folders `01 - Duplicates`, `02 - Superseded INKSIGHTS`, `03 - Legacy INKCARE Crossover`, `04 - Rejected or Wrong Versions`, `05 - Historical Snapshots` if absent.
- [ ] Inventory material INKSIGHTS assets inside and outside `01 INKSIGHTS`.
- [ ] Record current parent, name, MIME type, URL/ID, and classification before moving any item.
- [ ] Identify canonical-conflict groups, especially Brand Standard and Product v1 families.

### Task 3: Reconcile canonical Drive conflicts

**Interfaces:**
- Consumes: conflict groups from Task 2.
- Produces: one active authority per subject, with predecessors archived and cross-referenced.

- [ ] Reconcile the two brand documents that currently claim canonical authority.
- [ ] Treat the retained brand authority as the only `CANONICAL` brand standard; mark/archive the other as `SUPERSEDED` rather than deleting it.
- [ ] Classify the Product Definition / SPEC-001 / blueprint family and preserve distinct content while preventing competing authorities.
- [ ] Mark explicitly wrong-version assets as `REJECTED` and move them to the rejected archive area.
- [ ] Keep ambiguous items in `REVIEW`.

### Task 4: Rename and move Drive assets

**Interfaces:**
- Consumes: classifications and target folders.
- Produces: normalized names and canonical locations without changing file IDs.

- [ ] Rename/move high-confidence INKSIGHTS assets into the approved functional structure.
- [ ] Consolidate brand media folders under `06 - Brand & Marketing` without deleting source IDs.
- [ ] Move research/evidence into `03 - Research & Market Intelligence` and keep validated product IP in `02 - Product & Methodology`.
- [ ] Move current sales/prospecting assets into `04 - Sales & CRM`.
- [ ] Archive legacy INKCARE crossover material without converting its provenance.
- [ ] Record every rename/move in the registry change log.

### Task 5: Register and repair technical authority documentation

**Files:**
- Modify: `README.md`
- Modify: `AGENTS.md` only if required to match the approved architecture.
- Create or update a concise source-of-truth reference under `docs/` if needed.

**Interfaces:**
- Consumes: live GitHub, Supabase, and Vercel state.
- Produces: repository documentation that does not contradict live runtime state.

- [ ] Remove/replace stale README statements that imply the live Supabase schema is intentionally limited to `public.enquiries`.
- [ ] State the GitHub ↔ Supabase authority/drift rule explicitly.
- [ ] Keep `dontdoadan/inksights` as the only production source repository.
- [ ] Register `inksights-archive`, `INKGIT-A`, and `inksight-uk` as archive/legacy/reference in the Master Asset Registry rather than promoting them.
- [ ] Register canonical Supabase and Vercel identities in the Systems tab.

### Task 6: Cross-platform verification

**Interfaces:**
- Consumes: final Drive structure and technical documentation changes.
- Produces: evidence that consolidation did not alter runtime contracts.

- [ ] Verify Drive Control Centre assets exist and registry links resolve.
- [ ] Verify canonical business subjects have at most one `CANONICAL` authority.
- [ ] Verify GitHub production branch/source remains intact.
- [ ] Verify Supabase project/table/function names were not changed by this project.
- [ ] Verify Vercel project/domain bindings were not renamed by this project.
- [ ] Verify unresolved items exist only in `REVIEW` and are not deleted.
- [ ] Record the iCloud/local limitation explicitly: ingestion remains outstanding until files are surfaced to the connected environment.

### Task 7: Final review and merge-ready handoff

**Interfaces:**
- Consumes: all prior task outputs.
- Produces: reviewed branch, pull request, and completion report.

- [ ] Compare consolidation branch against `main` and review all repository changes.
- [ ] Verify no application code, migrations, schema, or deployment configuration changed unintentionally.
- [ ] Open a pull request describing the information-governance changes.
- [ ] Report completed work, unresolved REVIEW items, the iCloud ingestion boundary, and the separate Supabase RLS advisory.
