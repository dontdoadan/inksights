# Repository Cleanup Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Reduce repository ambiguity and legacy-brand contamination without changing INKSIGHTS production behaviour or deleting database history.

**Architecture:** Keep the TanStack Start application, Supabase backend, Lovable integration metadata and production deployment path intact. Remove an obsolete INKCARE-specific social-automation subsystem and simplify CI accordingly, then add documentation that distinguishes current sources of truth from historical evidence.

**Tech Stack:** TypeScript, React, TanStack Start, Vite, Supabase, GitHub Actions, Deno, Node.js 22.

**Spec:** User-requested repository cleanse and tidy-up on 2026-09-15.

## Global Constraints

- Do not rewrite published Git history because the repository is connected to Lovable.
- Do not modify `main` directly; use a review branch and Pull Request.
- Do not delete applied Supabase migrations.
- Do not relabel INKCARE material as INKSIGHTS when the underlying implementation is legacy.
- Preserve production application behaviour.

---

### Task 1: Isolate cleanup work

**Files:**
- No production files changed.

**Interfaces:**
- Consumes: `main` at commit `a3bd9c2ced2902ef84bb39050ab63c2b6c1f8b14`.
- Produces: branch `chore/repository-cleanup-2026-09-15`.

- [x] Create the cleanup branch from `main`.
- [x] Read `AGENTS.md` and preserve Lovable history constraints.
- [x] Inspect root structure, CI, documentation and automation directories before deleting files.

### Task 2: Remove obsolete legacy-brand automation

**Files:**
- Delete: `.github/workflows/weekly-content.yml`
- Delete: `automation/social/.env.example`
- Delete: `automation/social/README.md`
- Delete: `automation/social/content/campaign-library.json`
- Delete: `automation/social/prepare_week.py`
- Delete: `automation/social/queue_runner.py`
- Delete: `automation/social/requirements.txt`
- Delete: `automation/social/seed/exported-queue.json`
- Delete: `automation/social/tests/test_dry_run.py`
- Create: `docs/archive/legacy-inkcare-social-automation.md`

**Interfaces:**
- Consumes: legacy INKCARE social content and migration tooling.
- Produces: active repository with no executable INKCARE social publishing subsystem; Git history remains the recovery mechanism.

- [x] Verify the campaign library and README are explicitly INKCARE-branded.
- [x] Verify the scheduled workflow targets `automation/social/`.
- [x] Delete the scheduled workflow.
- [x] Delete the legacy automation package.
- [x] Preserve Supabase migration history.
- [x] Add an archive note documenting removal and recovery.

### Task 3: Simplify CI permissions and checks

**Files:**
- Modify: `.github/workflows/ci.yml`

**Interfaces:**
- Consumes: current Node/Deno validation pipeline.
- Produces: read-only CI that validates active INKSIGHTS code only.

- [x] Change repository content permission from `write` to `read`.
- [x] Remove the branch-specific `fix/public-report-security-source-parity` lockfile-repair step.
- [x] Remove Python setup and the legacy social-migration test.
- [x] Keep lint, build, generated-route-tree enforcement, typecheck, Supabase configuration test and Edge Function security test.

### Task 4: Clarify repository and documentation boundaries

**Files:**
- Modify: `README.md`
- Create: `docs/README.md`

**Interfaces:**
- Consumes: existing canonical architecture README and accumulated documentation.
- Produces: explicit repository map and documentation hierarchy.

- [ ] Add a repository map to the root README.
- [ ] State that npm is the canonical local/CI package-manager workflow while Lovable metadata remains integration-managed.
- [x] Add a documentation index distinguishing canonical documents, evidence, plans and archive material.
- [x] Document the rule preventing other brand material from entering canonical INKSIGHTS operating code.

### Task 5: Verify and review

**Files:**
- No additional application files expected.

**Interfaces:**
- Consumes: completed cleanup branch.
- Produces: reviewable Pull Request with CI evidence.

- [ ] Compare cleanup branch against `main` and confirm only intended files changed.
- [ ] Open a Pull Request to `main`.
- [ ] Verify GitHub Actions lint, build, generated route-tree check, typecheck and tests pass.
- [ ] Merge only after CI is green and the diff contains no unrelated production behaviour changes.
