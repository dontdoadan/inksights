<!-- LOVABLE:BEGIN -->
> [!IMPORTANT]
> This project is connected to [Lovable](https://lovable.dev). Avoid rewriting
> published git history — force pushing, or rebasing/amending/squashing commits
> that are already pushed — as it rewrites history on Lovable's side and the
> user will likely lose their project history.
>
> Commits you push to the connected branch sync back to Lovable and show up in
> the editor, so keep the branch in a working state.
<!-- LOVABLE:END -->

## INKSIGHTS information architecture — core rule

Treat the Google Drive folder `01 INKSIGHTS` as the canonical business-asset workspace for INKSIGHTS. Keep it clean, predictable, and separated from Daniel Hughes Tattoos, INKCARE, and unrelated projects.

### Canonical top-level structure

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

Do not create additional top-level folders casually. Extend the appropriate functional area with a clearly named subfolder instead. A new top-level category requires a deliberate architecture decision.

### Storage rules

1. **No loose INKSIGHTS assets.** New business assets must be stored in the correct canonical folder when they are created or imported.
2. **Separate by function, not file type alone.** Strategy belongs in Strategy, prospect data in Sales & CRM, product IP in Product & Methodology, operational datasets in Data & Intelligence, brand assets in Brand & Marketing, and client-specific delivery material in Client Delivery.
3. **Keep research separate from canonical IP.** External/Perplexity/source research belongs in `03 - Research & Market Intelligence`; validated product definitions, schemas, constraint logic, KPI definitions, and methodologies belong in `02 - Product & Methodology`.
4. **Preserve machine contracts.** Do not rename machine-readable files if code, imports, automations, schemas, or integrations may reference the filename. Prefer stable `snake_case_vN.ext` names for these assets.
5. **Human-facing naming convention.** Prefer `INKSIGHTS - Subject - Descriptor.ext` for reports, plans, guides, briefs, and other human-readable assets. Use ISO dates (`YYYY-MM-DD`) when a date materially identifies the version or event.
6. **Folder naming convention.** Use numbered functional folders such as `02 - Product & Methodology` and numbered subfolders where ordering matters.
7. **Archive instead of destructive cleanup.** When an item is stale, duplicated, superseded, or its deletion is uncertain, move it to `90 - Archive` and label it clearly. Known duplicates belong in `90 - Archive/01 - Duplicates` unless there is a documented reason to delete them.
8. **One canonical copy.** Avoid keeping multiple active copies of the same schema, methodology, report, or dataset. Identify one canonical copy and archive the others.
9. **Do not mix brands.** INKSIGHTS storage must not contain Daniel Hughes Tattoos, INKCARE, or other business assets unless an INKSIGHTS document explicitly references them as external evidence or case-study material.
10. **Repository vs Drive boundary.** GitHub is canonical for source code, migrations, version-controlled technical specifications, tests, and engineering documentation. Google Drive is canonical for business documents, research, commercial assets, brand material, client-delivery assets, and working datasets unless the asset must be version-controlled for the product to function.
11. **Preserve links and IDs where possible.** Prefer moving/renaming existing Drive items over recreating them so sharing, references, and file IDs remain intact.
12. **Clean as you go.** Any workflow that creates or imports an INKSIGHTS asset is responsible for placing and naming it correctly before the task is considered complete.

This structure is a standing operating constraint. Future agents, scripts, automations, and manual workflows should follow it by default rather than inventing a new filing system.

## AI operating governance

The canonical business AI-governance authority is Google Drive asset `A-021`, `INKSIGHTS - AI Governance & Operating Standard - CANONICAL - v1.0`, stored in `01 INKSIGHTS/00 - Control Centre`. This section is a repository-level technical binding to that standard, not a competing business authority.

### Control-plane responsibilities

- **ChatGPT is the business command centre.** It coordinates business operations, cross-system research and analysis, commercial/CRM/communication workflows, governance, prioritisation and documentation.
- **Codex is the engineering command centre.** It owns repository inspection and technical execution: plans, code, tests, migrations, technical documentation, pull requests, deployment diagnostics and engineering verification.
- **Neither ChatGPT nor Codex is independently authoritative.** Conversations, model memory, scratchpads and generated summaries are working context only. Resolve facts and state to the system that owns them.

The existing Repository vs Drive boundary above remains controlling: GitHub owns version-controlled technical assets; Drive owns business assets unless an asset must be version-controlled for the product to function.

### Required execution protocol

For every material task, follow this sequence:

`INTAKE → CLASSIFY → GROUND → DECIDE → EXECUTE → VERIFY → RECORD → NEXT`

1. **INTAKE** — define the outcome, constraints, target system and exclusions.
2. **CLASSIFY** — identify domain, canonical owner, read/write class and risk.
3. **GROUND** — read the canonical source and current live state before deciding or writing.
4. **DECIDE** — choose the smallest authoritative path and identify approval gates.
5. **EXECUTE** — make the minimum coherent change in the correct system; avoid unrelated refactoring or cleanup.
6. **VERIFY** — read back the result and run applicable tests/status/evidence checks. A write without verification is incomplete.
7. **RECORD** — record material business/authority changes in the Master Asset Registry/Changes and technical changes in Git history/PRs or the owning operational system.
8. **NEXT** — state configured, pending, blocked, residual risk and the next approval gate/action.

### Read/write and approval boundaries

Routine reversible writes may proceed when the user has clearly requested the outcome, the target authority is unambiguous, the action is within granted permissions and verification is available.

Obtain explicit human approval immediately before any of these gated actions:

- merge to `main`;
- production deployment or production-impacting runtime change;
- destructive deletion or broad bulk mutation;
- source-of-truth/ownership change;
- database schema, RLS, auth or security-control change;
- permission/access-control change;
- secret/key handling or exposure-sensitive action;
- material financial commitment;
- irreversible customer-impacting action.

Never weaken security to make a workflow pass. Do not bypass deployment protection. Do not promote REVIEW, LEGACY or REFERENCE material into canonical truth without validation. The Lovable history rules at the top of this file remain absolute for already-published commits: never force-push or otherwise rewrite that history.

### Verification and escalation

Before calling work complete, verify the exact changed system, relevant tests/checks, security/access side effects where applicable, and the required audit/record surface. For cross-system changes, verify both sides of the interface.

Stop before a risky write and escalate to the human approver when authorities conflict without an existing rule, a required approval gate is reached, security impact is uncertain, production/live state cannot be verified, authority would move, or verification repeatedly fails. Read-only investigation may continue when it does not increase risk.

Do not create another active AI-governance authority in this repository. If `A-021` changes materially, update this binding only as needed to keep repository instructions aligned with the canonical Drive standard.
