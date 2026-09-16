# INKSIGHTS Information Architecture Consolidation Design

**Status:** APPROVED DESIGN  
**Date:** 2026-09-16  
**Owner:** INKSIGHTS  
**Scope:** Google Drive, GitHub, Supabase, Vercel, and local/iCloud INKSIGHTS material  

## 1. Objective

Create one unified INKSIGHTS information system in which every important asset has one clearly defined authoritative home, one canonical identity, a predictable name, an explicit lifecycle status, and a discoverable record in a central Control Centre.

The objective is not to force every asset into one physical storage provider. The objective is to eliminate competing sources of truth while retaining each platform as the authority for the asset types it is designed to own.

## 2. Architectural Decision

INKSIGHTS will use a **federated source-of-truth architecture with a single Control Centre**.

```text
INKSIGHTS CONTROL PLANE
        |
        +-- Google Drive
        |   Business knowledge, strategy, research, commercial material,
        |   brand assets, templates, client delivery and working datasets
        |
        +-- GitHub / dontdoadan/inksights
        |   Application source, migrations, Edge Function source,
        |   engineering documentation, tests and technical specifications
        |
        +-- Supabase / INKSIGHTS
        |   Canonical runtime database, operational records and deployed
        |   database/function state
        |
        +-- Vercel / inksight-main
            Deployment/runtime state and production-domain configuration
```

The Google Drive folder `01 INKSIGHTS/00 - Control Centre` is the human-facing entry point to this system. It does not replace the authoritative systems; it registers and links them.

## 3. Authority Hierarchy

When two assets conflict, authority is determined by asset class rather than by whichever file is newest.

### 3.1 Business and commercial knowledge

Authority: **Google Drive**

Includes:
- company strategy and commercial model;
- product definitions and methodology documents that do not need to execute with the product;
- market and competitor research;
- sales playbooks, CRM operating documents and outreach assets;
- brand standards and marketing assets;
- client-delivery documents;
- case studies and proof;
- reusable business templates and playbooks.

### 3.2 Application and technical implementation

Authority: **GitHub `dontdoadan/inksights`, default branch `main`**

Includes:
- application source code;
- repository configuration;
- tests;
- version-controlled technical specifications;
- Supabase migrations;
- Supabase Edge Function source;
- engineering evidence, release notes and technical implementation plans;
- CI/CD configuration.

Git history is evidence and must not be rewritten casually. Applied migrations are historical records and must not be removed merely because a feature is later retired.

### 3.3 Runtime database and operational intelligence state

Authority: **Supabase project `INKSIGHTS` (`ukaxsqwnkoqbbsufpzga`)**

Includes:
- current database schema as actually deployed;
- runtime records;
- operational intelligence datasets;
- deployed database functions and Edge Function runtime state;
- current security/policy state.

GitHub remains authoritative for the intended version-controlled implementation of migrations and Edge Function source. If GitHub and live Supabase disagree, the disagreement must be recorded as drift and reconciled rather than silently choosing one copy.

### 3.4 Deployment state

Authority: **Vercel project `inksight-main`** for deployment/runtime metadata and **GitHub `main`** for application source.

Vercel owns:
- deployment IDs and status;
- deployment/runtime logs;
- connected production domains;
- Vercel-specific project configuration that is not represented in the repository.

GitHub owns the source that should produce those deployments.

### 3.5 Local and iCloud files

Local/iCloud storage is an **ingestion source**, not a permanent canonical source-of-truth for INKSIGHTS business material.

Relevant material found there is classified, deduplicated and migrated to its authoritative destination. Local working files required by active tooling may remain locally, but must be represented in the registry if they materially affect the business or product.

## 4. Canonical Google Drive Structure

Preserve the existing top-level `01 INKSIGHTS` structure:

```text
01 INKSIGHTS/
├── 00 - Control Centre
├── 01 - Strategy & Commercial Model
├── 02 - Product & Methodology
├── 03 - Research & Market Intelligence
├── 04 - Sales & CRM
├── 05 - Data & Intelligence
├── 06 - Brand & Marketing
├── 07 - Client Delivery
├── 08 - Case Studies & Proof
├── 09 - Templates & Playbooks
└── 90 - Archive
```

No additional top-level functional folder is created without a deliberate architecture decision.

### 4.1 `00 - Control Centre`

Must contain or link to:
- `INKSIGHTS - Master Asset Registry`;
- `INKSIGHTS - Source-of-Truth Map`;
- `INKSIGHTS - Naming & Filing Standard`;
- `INKSIGHTS - Consolidation Change Log`;
- `00 - Inbox & Triage` for temporarily unclassified material.

The Control Centre is the discovery and governance layer, not a dumping ground.

### 4.2 Archive structure

`90 - Archive` should contain:

```text
90 - Archive/
├── 01 - Duplicates
├── 02 - Superseded INKSIGHTS
├── 03 - Legacy INKCARE Crossover
├── 04 - Rejected or Wrong Versions
└── 05 - Historical Snapshots
```

Archive items remain searchable and retain provenance. Archive is preferred over deletion unless exact duplication and safe deletion are proven.

## 5. Classification Model

Every discovered INKSIGHTS asset receives exactly one lifecycle status:

- **CANONICAL** — authoritative current asset for a defined subject.
- **ACTIVE** — current working material that is useful but does not define truth.
- **REFERENCE** — research, evidence, external material or supporting source.
- **SUPERSEDED** — formerly authoritative/current but replaced by another asset.
- **LEGACY** — belongs to a previous INKCARE or pre-current INKSIGHTS architecture.
- **DUPLICATE** — materially duplicates another retained asset.
- **REJECTED** — explicitly wrong, invalid or intentionally discarded version.
- **REVIEW** — authority or relationship cannot yet be established safely.

No item marked `REVIEW` is deleted.

## 6. Naming Standard

Naming is semantically unified but syntax follows platform constraints.

### 6.1 Human-facing Drive assets

Default pattern:

```text
INKSIGHTS - [Subject] - [Descriptor] - [Status/Version if material]
```

Examples:

```text
INKSIGHTS - Brand Standard - CANONICAL - v1.1
INKSIGHTS - Studio Intelligence - Product Definition - CANONICAL - v1.0
INKSIGHTS - UK Industry & Pricing Research - 2026-09
INKSIGHTS - The Circle London - Intelligence Audit - 2026-10-04
INKSIGHTS - SPEC-001 - Product v1 Operating Specification - v1.0
```

Rules:
- use `INKSIGHTS` consistently in uppercase for human-facing assets;
- use ISO dates `YYYY-MM-DD` when a date identifies an event/evidence snapshot;
- living canonical documents do not require dates in the filename;
- frozen reports, research snapshots and client outputs should normally be dated;
- avoid filenames containing `final`, `final-final`, `copy`, `new`, `latest`, unexplained initials or punctuation-only versioning;
- preserve existing Drive file IDs by renaming/moving the same item rather than recreating it whenever possible.

### 6.2 GitHub paths

Use existing repository conventions, normally lowercase `kebab-case` for documentation and existing codebase conventions for source files.

Do not rename files solely for cosmetic uniformity when paths are referenced by imports, workflows, docs, tests or integration tooling.

### 6.3 Supabase identifiers

Use stable `snake_case` database names and existing Edge Function slug conventions.

Do not cosmetically rename tables, migrations, functions or deployed Edge Function slugs as part of the file consolidation project. Database/API renames require their own compatibility migration.

### 6.4 Vercel resources

Do not rename production projects or domains merely for visual consistency. Vercel resource names are infrastructure identifiers and are changed only for an explicit deployment/infrastructure reason.

## 7. Master Asset Registry

The registry is the authoritative discovery index for the overall system.

Required fields:

| Field | Purpose |
| --- | --- |
| Asset ID | Stable registry identity |
| Current Name | Current canonical/display name |
| Previous Name | Prior filename or resource name when changed |
| Domain | Strategy, Product, Research, Sales, Data, Brand, Client, Proof, Template, Engineering, Runtime, Deployment |
| Asset Type | Document, Sheet, PDF, dataset, repository, migration, function, project, deployment, folder, image, etc. |
| Lifecycle Status | CANONICAL / ACTIVE / REFERENCE / SUPERSEDED / LEGACY / DUPLICATE / REJECTED / REVIEW |
| Canonical Owner | Drive / GitHub / Supabase / Vercel |
| Platform | Exact physical platform |
| Location | Folder path, repository path or resource identifier |
| URL / Resource ID | Stable deep link or platform ID |
| Version | Semantic/document version where applicable |
| Supersedes | Asset ID(s) replaced by this asset |
| Superseded By | Asset ID that replaced this asset |
| Source / Provenance | Where it came from |
| Last Reviewed | Governance review date |
| Notes | Exceptions, dependencies, warnings |

The registry should link to authoritative assets rather than storing duplicate copies.

## 8. Known Current Decisions from Initial Inventory

### 8.1 GitHub

- `dontdoadan/inksights` is the canonical production repository.
- `dontdoadan/inksights-archive` is historical/archive material.
- `dontdoadan/INKGIT-A` is legacy/reference material and contains INKCARE-era product language.
- `dontdoadan/inksight-uk` is legacy/reference material and contains INKCARE-era product language.
- No repository is deleted during this consolidation without a separate explicit decision.

### 8.2 Supabase

- Project `INKSIGHTS` (`ukaxsqwnkoqbbsufpzga`) is the current INKSIGHTS runtime authority.
- Project `INKCARE (archive)` remains a separate historical system and must not be merged into INKSIGHTS merely because some historic intelligence work originated there.
- The live INKSIGHTS schema is materially more developed than sections of the current repository README describe; documentation drift must be corrected.
- A Supabase security advisory currently reports RLS disabled on `public.spatial_ref_sys`. This consolidation records the issue but does not auto-apply an RLS change because security remediation requires a separate access-impact decision.

### 8.3 Vercel

- `inksight-main` is the current INKSIGHTS production project.
- It is linked to GitHub repository `dontdoadan/inksights`.
- The current project name is retained during information-architecture consolidation.

### 8.4 Drive

- Existing numbered functional folders are retained.
- Loose INKSIGHTS material outside the canonical structure is migrated into the correct functional area.
- Conflicting documents that both claim `CANONICAL` authority must be reconciled; both may not remain active authorities for the same decision surface.
- INKCARE material is not bulk-renamed to INKSIGHTS. Reusable learning remains clearly identified as legacy/reference provenance.

## 9. Consolidation Workflow

### Phase 1 — Inventory

1. Enumerate relevant Drive files/folders.
2. Enumerate INKSIGHTS-related GitHub repositories and active technical documentation.
3. Enumerate Supabase projects, migrations, functions, major schema surfaces and security advisories.
4. Enumerate Vercel INKSIGHTS project/deployment/domain relationships.
5. Enumerate local/iCloud material when filesystem access is available.
6. Add every material asset/resource to the registry before destructive changes.

### Phase 2 — Classification

For every item:
1. identify subject/domain;
2. identify provenance;
3. assess whether it is authoritative, active, supporting, duplicate, superseded, legacy, rejected or uncertain;
4. identify dependencies before rename/move;
5. record canonical owner and destination.

### Phase 3 — Canonical reconciliation

Resolve conflicts subject-by-subject before moving large sets of files.

Priority reconciliation targets:
- competing brand-standard documents;
- Product v1 blueprint/specification family;
- current commercial model documents;
- current product-definition/methodology documents;
- technical documentation that conflicts with live Supabase state.

When two overlapping assets both contain unique valid material, consolidate the valid content into one canonical successor and archive the predecessors rather than arbitrarily choosing the newest file.

### Phase 4 — Rename and move

Apply the naming standard and canonical folder mapping.

Safety rules:
- preserve Drive IDs and sharing where possible;
- do not rename machine contracts without dependency analysis;
- do not alter Git history;
- do not delete applied migrations;
- do not change live database identifiers as cosmetic cleanup;
- do not rename Vercel production resources as cosmetic cleanup;
- archive uncertain or historical items rather than delete.

### Phase 5 — Documentation repair

Update canonical repository documentation to describe actual current architecture and remove stale statements that conflict with the deployed Supabase/Vercel state.

Cross-link the Drive Control Centre, canonical repository, Supabase project identity and Vercel project identity.

### Phase 6 — Verification

After consolidation verify:
- no known loose INKSIGHTS Drive assets remain outside the canonical structure unless explicitly excepted;
- each canonical subject has one authoritative asset;
- archive material cannot be mistaken for current instructions;
- GitHub production flow remains intact;
- Supabase deployed assets have not been broken or renamed inadvertently;
- Vercel production still points to the intended GitHub repository and deployment;
- registry links resolve;
- all performed renames/moves are represented in the change log.

## 10. Deletion Policy

Default: **do not delete**.

Deletion is allowed only when all of the following are true:
1. the item is confirmed byte-for-byte or materially duplicate;
2. the retained canonical/source copy is verified;
3. no external links, automations or integrations depend on the item;
4. deletion creates no loss of provenance or audit value;
5. deletion is preferable to archive for a documented reason.

Otherwise move to the appropriate archive category.

## 11. Ongoing Governance

After migration:
- all newly created INKSIGHTS business assets must be filed correctly before a task is complete;
- canonical documents are versioned deliberately and supersession is recorded;
- research is never silently promoted into canonical product truth;
- external/source research remains separate from validated INKSIGHTS IP;
- code changes continue through GitHub branch -> Vercel preview -> QA -> PR -> `main` -> production;
- Supabase runtime drift is reconciled back to version-controlled migrations/functions where appropriate;
- the Master Asset Registry is reviewed whenever a new canonical asset, system or major dataset is introduced;
- duplicate sources of truth are treated as a governance defect, not merely a storage inconvenience.

## 12. Completion Criteria

The consolidation is complete when:
1. `01 INKSIGHTS` contains the approved functional structure and no unexplained loose INKSIGHTS business assets remain elsewhere in Drive;
2. the Control Centre contains a complete registry of material INKSIGHTS assets/resources across all covered platforms;
3. every registered asset has an explicit canonical owner and lifecycle status;
4. each subject has at most one `CANONICAL` authority;
5. legacy INKCARE material is clearly separated from current INKSIGHTS IP;
6. GitHub, Supabase and Vercel production relationships are documented and verified;
7. known documentation drift is repaired;
8. rename/move actions are recorded in the consolidation change log;
9. unresolved items exist only in an explicit `REVIEW` queue;
10. local/iCloud material has been scanned and ingested when local filesystem access is available.

## 13. Out of Scope

This project does not, by itself:
- refactor the INKSIGHTS application;
- redesign the Supabase schema;
- rename database tables/functions for style reasons;
- remediate unrelated security advisories without explicit approval;
- rewrite historical Git commits;
- redesign the brand;
- merge INKCARE and INKSIGHTS business models;
- rename production infrastructure solely for cosmetic consistency.
