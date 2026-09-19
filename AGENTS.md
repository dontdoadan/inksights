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

Treat the Google Drive folder `INKSIGHTS` as the canonical business-document workspace for INKSIGHTS. The pre-reset `LEGACY — 01 INKSIGHTS` tree lives in the separate legacy archive and is reference-only unless an item is deliberately revalidated and promoted.

### Canonical top-level structure

```text
INKSIGHTS/
├── 00 Start Here
├── 01 Strategy
├── 02 Products & Services
├── 03 Research
├── 04 Leads & Sales
├── 05 Clients
├── 06 Marketing & Brand
├── 07 Data & Reports
├── 08 Operations
├── 09 Finance
├── 10 Legal
├── 11 Templates
├── 12 Projects
├── 20 Shared
├── 30 Public
└── 90 Archive
```

Do not create additional top-level folders casually. Use the existing business-purpose folders first. A new top-level category requires a deliberate architecture decision.

### Current Drive governance authorities

- `00 Start Here/START HERE — INKSIGHTS Drive Guide` — current filing, naming, authority and system-boundary rules.
- `08 Operations/File Management/File Creation, Storage & Logging — SOP — ACTIVE` — lifecycle rule for durable files.
- `08 Operations/File Management/Master File Register — ACTIVE` — durable-file index/control layer.
- `12 Projects` — execution workspaces only; authoritative project outputs must be promoted to the correct 01–11 business folder when they become durable authorities.

The previous Drive asset `A-021 / INKSIGHTS - AI Governance & Operating Standard - CANONICAL - v1.0` is currently located in the legacy archive. Treat it as historical reference until an updated authority is deliberately promoted into the clean `INKSIGHTS` structure.

### Storage rules

1. **No loose INKSIGHTS assets.** New durable business assets must be stored in the correct canonical folder.
2. **Classify by business purpose.** Strategy → `01 Strategy`; offers/product definitions → `02 Products & Services`; research → `03 Research`; sales/CRM support material → `04 Leads & Sales`; client delivery → `05 Clients`; brand/marketing → `06 Marketing & Brand`; human-readable data/reports → `07 Data & Reports`; SOPs/workflows → `08 Operations`; finance → `09 Finance`; legal → `10 Legal`; reusable blank assets → `11 Templates`.
3. **Project workspaces are temporary execution layers.** Working material can remain in `12 Projects/[project]/02 Working`; durable outputs move to their canonical business folder and the project keeps a reference/shortcut.
4. **Preserve machine contracts.** Do not rename machine-readable files when code, schemas, imports or automations may reference their names. Prefer stable snake_case names for machine assets.
5. **Human-facing naming convention.** Use plain English and `[Subject] — [Document Type] — [Status] — YYYY-MM-DD` where the date materially identifies the asset.
6. **Use the approved statuses.** `DRAFT`, `ACTIVE`, `FINAL`, `ARCHIVED`.
7. **One authoritative copy.** Do not create parallel “latest”, “final 2”, or duplicate active authorities.
8. **Archive instead of destructive cleanup when uncertain.** Use `90 Archive`; do not revive legacy material without validating it.
9. **Do not mix brands.** Keep INKSIGHTS separate from Daniel Hughes Tattoos, INKCARE and unrelated businesses except where they are explicitly cited as external evidence/case-study material.
10. **Repository vs Drive boundary.** GitHub owns code, migrations, tests, version-controlled technical specifications and engineering documentation. Drive owns business documents, evidence, reports, commercial assets, client deliverables and reusable business templates unless the product requires an asset to be version controlled.
11. **External systems remain authoritative for live operational truth.** HubSpot owns CRM state; Stripe owns payment/transaction truth; Supabase owns application and operational product data; Vercel owns deployment/runtime state.
12. **Durable-file completion rule.** Follow `CLASSIFY → NAME → CREATE/SAVE → LOG → LINK → VERIFY → REPORT`. A Drive artifact is incomplete until it is logged in the Master File Register and its location/permissions are verified.

## AI operating governance

### Control-plane responsibilities

- **ChatGPT is the business command centre.** It coordinates business operations, cross-system research and analysis, commercial/CRM/communication workflows, governance, prioritisation and business-document control.
- **Codex is the engineering command centre.** It owns repository inspection and technical execution: plans, code, tests, migrations, technical documentation, pull requests, deployment diagnostics and engineering verification.
- **Neither ChatGPT nor Codex is independently authoritative.** Conversation state and model memory are working context only. Resolve facts to the system that owns them.

### Required execution protocol

For every material task:

`INTAKE → CLASSIFY → GROUND → DECIDE → EXECUTE → VERIFY → RECORD → NEXT`

1. **INTAKE** — define the outcome, constraints, target system and exclusions.
2. **CLASSIFY** — identify domain, canonical owner, read/write class and risk.
3. **GROUND** — read the current canonical source/live state before deciding or writing.
4. **DECIDE** — choose the smallest authoritative path and identify approval gates.
5. **EXECUTE** — make the minimum coherent change in the correct system.
6. **VERIFY** — read back the result and run applicable tests/status/evidence checks. A write without verification is incomplete.
7. **RECORD** — record durable business changes in the Master File Register and relevant project Control Register; record technical changes in Git history/PRs or the owning operational system.
8. **NEXT** — state configured, pending, blocked, residual risk and the next approval/action.

### Read/write and approval boundaries

Routine reversible writes may proceed when the user has clearly requested the outcome, the authority is unambiguous, permissions allow it and the result can be verified.

Obtain explicit human approval immediately before:

- merge to `main`;
- production deployment or production-impacting runtime change;
- destructive deletion or broad bulk mutation;
- source-of-truth/ownership change;
- database schema, RLS, auth or security-control change;
- permission/access-control change;
- secret/key handling or exposure-sensitive action;
- material financial commitment;
- irreversible customer-impacting action.

Never weaken security to make a workflow pass. Do not bypass deployment protection. Do not promote REVIEW, LEGACY or REFERENCE material into canonical truth without validation. The Lovable history rules at the top of this file remain absolute.

### Verification and escalation

Before calling work complete, verify the exact changed system, relevant tests/checks, security/access side effects where applicable, and the required audit/record surface. For cross-system changes, verify both sides of the interface.

Stop before a risky write and escalate when authorities conflict without an existing rule, an approval gate is reached, security impact is uncertain, production/live state cannot be verified, authority would move, or verification repeatedly fails. Read-only investigation may continue when it does not increase risk.
