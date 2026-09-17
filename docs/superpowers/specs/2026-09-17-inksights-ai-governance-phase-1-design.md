# INKSIGHTS AI Governance Phase 1 Design

> **Implementation record, not business authority.** The canonical AI-governance authority is the Google Drive Control Centre asset `A-021`, **INKSIGHTS - AI Governance & Operating Standard - CANONICAL - v1.0**. This repository document exists only to guide and review the technical binding.

## Objective

Bind ChatGPT/Codex operation to the approved INKSIGHTS federated source-of-truth architecture without creating a parallel authority, weakening security, changing production runtime, or rewriting Lovable-synced published Git history.

## Existing authorities preserved

- Google Drive `01 INKSIGHTS` remains canonical for business governance, strategy, commercial material, research, brand, sales, client delivery and reusable business assets.
- `dontdoadan/inksights` remains canonical for application source, migrations, Edge Function source, tests, engineering documentation, version-controlled technical specifications and repository-level agent instructions.
- Supabase remains authoritative for live database/operational/security state.
- Vercel remains authoritative for deployment/runtime metadata.
- HubSpot remains authoritative for CRM records.
- Gmail remains authoritative for original correspondence.
- Google Calendar remains authoritative for schedule state.
- ChatGPT and Codex are control planes only; neither conversation history nor model memory is a source of truth.

## Control-plane split

### ChatGPT

Business command centre. Owns cross-system business orchestration, research synthesis, commercial work, CRM/communication workflows, governance, prioritisation, documentation and executive reporting. It routes repository-heavy engineering execution to Codex while preserving business outcome and constraints.

### Codex

Engineering command centre. Owns repository inspection, implementation planning, code/test/migration changes, technical documentation, pull requests, deployment diagnostics and engineering verification. It must obey `AGENTS.md` and may not invent business-policy authority.

## Required execution protocol

Every material AI-assisted task follows:

`INTAKE → CLASSIFY → GROUND → DECIDE → EXECUTE → VERIFY → RECORD → NEXT`

The protocol requires the operator to identify the target authority before writing, use the smallest coherent change, verify by readback/tests/live evidence, record material changes in the owning audit surface, and distinguish configured/pending/blocked/next at closure.

## Repository implementation

Phase 1 makes one repository-level configuration change: append a concise **AI operating governance** section to root `AGENTS.md`.

That section must:

1. Point to Drive asset `A-021` as the canonical business AI-governance authority.
2. State that ChatGPT is the business command centre and Codex is the engineering command centre, while neither is independently authoritative.
3. Require the eight-stage execution protocol.
4. Preserve the existing Drive/GitHub source-of-truth boundary.
5. Require explicit human approval before merge to `main`, production deployment, destructive/bulk mutation, canonical-ownership change, database schema/RLS/auth/security change, permission/access change, secret/key handling, material financial commitment or irreversible customer-impacting action.
6. Require verification before completion and recording of material changes.
7. Preserve the existing Lovable history warning verbatim and prohibit force-push/history rewriting of published commits.

No separate `docs/ai-governance.md` is created because it would duplicate the Drive authority.

## Approval gates

The approved architecture and the user’s Phase 1 implementation request authorize creation of the Drive governance asset, Registry updates and an isolated GitHub implementation branch.

A separate explicit human gate remains before:

- merging the Phase 1 pull request to `main`;
- changing repository protection settings;
- changing Supabase schema, RLS, auth, extensions, functions or security controls;
- changing Vercel production/deployment protection;
- any destructive or irreversible production/customer action.

## Verification

Phase 1 is verifiable when:

- Drive asset `A-021` is present in `01 INKSIGHTS/00 - Control Centre` and readable.
- Master Asset Registry records the asset, connected systems/control planes and Phase 1 change log.
- unresolved GitHub-protection and Supabase-security findings are recorded rather than silently changed.
- the feature branch changes only the intended governance/process files.
- `AGENTS.md` retains the Lovable warning and existing Repository vs Drive boundary.
- the new AI-governance section matches the canonical Drive standard without becoming a competing business authority.
- a pull request provides the human review/merge gate.

## Out of scope

- production application changes;
- database migrations or security remediation;
- Vercel deployment/configuration changes;
- HubSpot pipeline/data restructuring;
- Gmail/Calendar writes;
- broad repository refactoring;
- git-history rewriting;
- creating new top-level Drive folders or parallel governance stores.
