# INKSIGHTS AI Governance Phase 1 Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Establish the approved Phase 1 AI-governance layer while preserving existing INKSIGHTS source-of-truth boundaries, security controls and Lovable-synced Git history.

**Architecture:** Google Drive asset `A-021` is the single canonical business AI-governance standard. GitHub receives only the minimum technical binding in `AGENTS.md`, plus this Superpowers spec/plan as implementation records. Runtime and security systems are audited and recorded but not modified in Phase 1.

**Tech Stack:** Google Drive/Docs/Sheets, GitHub, ChatGPT, Codex, Supabase, Vercel, HubSpot, Gmail, Google Calendar

**Spec:** `docs/superpowers/specs/2026-09-17-inksights-ai-governance-phase-1-design.md`

## Global Constraints

- Preserve the existing `01 INKSIGHTS` numbered information architecture and Master Asset Registry.
- Preserve the existing Repository vs Drive boundary in root `AGENTS.md`.
- Do not create a second business AI-governance authority in GitHub.
- Do not weaken Supabase, Vercel, GitHub or other security controls.
- Do not force-push, rebase, amend or squash already-published Lovable-synced commits.
- Do not change production runtime in Phase 1.
- Keep repository work isolated from `main` until the human merge gate is explicitly approved.

---

### Task 1: Canonical Drive governance and registry

**Files:**
- Create: Google Drive `01 INKSIGHTS/00 - Control Centre/INKSIGHTS - AI Governance & Operating Standard - CANONICAL - v1.0`
- Modify: Google Sheet `INKSIGHTS - Master Asset Registry` tabs `Assets`, `Systems`, `Changes`, `Review Queue`

**Interfaces:**
- Consumes: approved AI operating architecture; existing Drive IA; live connected-system reads.
- Produces: asset `A-021`; system records `SYS-010` through `SYS-014`; Phase 1 audit/change records.

- [x] **Step 1: Ground the existing IA and Registry.**

  Verify `01 INKSIGHTS`, `00 - Control Centre`, the filing standard and Registry before writing.

- [x] **Step 2: Audit connected operating systems.**

  Verify current GitHub, Supabase, Vercel, HubSpot, Gmail and Google Calendar identities/state relevant to ownership. Record uncertainties instead of mutating security settings.

- [x] **Step 3: Create the single canonical AI Governance & Operating Standard.**

  Include source-of-truth ownership, ChatGPT/Codex split, authority/escalation rules, `INTAKE → CLASSIFY → GROUND → DECIDE → EXECUTE → VERIFY → RECORD → NEXT`, agent roles, read/write boundaries, verification and definition of done.

- [x] **Step 4: Register and verify the governance layer.**

  Add `A-021`, `SYS-010..SYS-014`, `CHG-007..CHG-008`, and open review items for unresolved GitHub-protection and Supabase-security findings. Read back the exact written ranges.

### Task 2: Bind Codex to the canonical governance standard

**Files:**
- Modify: `AGENTS.md`
- Create: `docs/superpowers/specs/2026-09-17-inksights-ai-governance-phase-1-design.md`
- Create: `docs/superpowers/plans/2026-09-17-inksights-ai-governance-phase-1.md`

**Interfaces:**
- Consumes: Drive asset `A-021` and the existing root `AGENTS.md` constraints.
- Produces: a thin repository-level instruction binding; no duplicate business authority.

- [ ] **Step 1: Verify the isolated branch and current `AGENTS.md`.**

  Confirm branch `chore/ai-governance-phase-1` is based on `main`; fetch `AGENTS.md`; preserve the entire Lovable warning and existing Drive/GitHub boundary.

- [ ] **Step 2: Append the minimal AI operating governance section.**

  Add only repository-relevant operating instructions: control-plane split, canonical Drive reference by asset ID/name, execution protocol, write gates, verification and record rules.

- [ ] **Step 3: Read back and compare the branch.**

  Fetch `AGENTS.md` from the branch and compare `main...chore/ai-governance-phase-1`. Confirm no existing constraint was removed or rewritten and only intended documentation/process files changed.

### Task 3: Verification and approval gate

**Files:**
- No production/runtime files.
- Review: feature-branch diff and pull request.

**Interfaces:**
- Consumes: verified Drive state and verified repository diff.
- Produces: a reviewable pull request and configured/pending report.

- [ ] **Step 1: Verify live systems were not modified.**

  Confirm Phase 1 made no Supabase schema/security, Vercel deployment/config, HubSpot CRM-data, Gmail or Calendar writes.

- [ ] **Step 2: Open a pull request to `main`.**

  The PR must state that Drive `A-021` is canonical, list verification evidence, and explicitly leave merge to the human approval gate.

- [ ] **Step 3: Record repository binding only after it is actually merged.**

  Do not log the `AGENTS.md` binding as complete in the Master Asset Registry `Changes` tab while the PR is merely open. If merged after explicit approval, add the corresponding change record then verify it.

- [ ] **Step 4: Report Phase 1 state.**

  Distinguish configured, pending approval, open security/protection findings and the next safe action. Do not call the GitHub binding complete until merge is approved and performed.
