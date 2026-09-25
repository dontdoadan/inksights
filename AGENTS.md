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
├── 00 - START HERE
├── 01 - BUSINESS
├── 02 - PRODUCT
├── 03 - SYSTEM & TECHNOLOGY
├── 04 - DATA & INTELLIGENCE
├── 05 - SALES & CRM
├── 06 - MARKETING & BRAND
├── 07 - SERVICE DELIVERY
├── 08 - RESEARCH & EVIDENCE
├── 09 - FINANCE & COMMERCIAL
├── 10 - GOVERNANCE & SECURITY
├── 11 - SOPs & PLAYBOOKS
└── 12 - TEMPLATES
```

Do not create additional top-level folders casually. Use the existing business-purpose folders first. A new top-level category requires a deliberate architecture decision.

### Current Drive governance authorities

- `00 - START HERE` — entry point, navigation and current workspace guidance.
- `10 - GOVERNANCE & SECURITY` — information architecture, governance, security and control standards.
- `11 - SOPs & PLAYBOOKS` — current operating procedures and repeatable execution playbooks.
- `Master File Register — ACTIVE` — durable-file index/control layer; use its live registered location rather than assuming a historic folder path.

The pre-reset Drive hierarchy and its documents are historical reference only. Do not use legacy paths as filing targets unless a current authority explicitly promotes them.

### Storage rules

1. **No loose INKSIGHTS assets.** New durable business assets must be stored in the correct canonical folder.
2. **Classify by business purpose.** Company/strategy → `01 - BUSINESS`; product/offers → `02 - PRODUCT`; architecture/system exports → `03 - SYSTEM & TECHNOLOGY`; analysis/data intelligence → `04 - DATA & INTELLIGENCE`; sales/CRM → `05 - SALES & CRM`; brand/marketing → `06 - MARKETING & BRAND`; client delivery → `07 - SERVICE DELIVERY`; research/evidence → `08 - RESEARCH & EVIDENCE`; finance/commercial → `09 - FINANCE & COMMERCIAL`; governance/security → `10 - GOVERNANCE & SECURITY`; SOPs/playbooks → `11 - SOPs & PLAYBOOKS`; reusable blank assets → `12 - TEMPLATES`.
3. **Do not recreate the old project-folder hierarchy.** Temporary execution material belongs inside the relevant canonical business domain (or a planning tool such as Notion); durable outputs remain in their owning domain.
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

## INKSIGHTS visual-brand authority

For visual-brand work, the production website at `https://getinksights.co.uk` and its production implementation are the canonical source of truth. Read `docs/brand/CURRENT.md` and `docs/brand/brand-manifest.json` before creating or modifying brand collateral. Brand guides, Figma files, PDFs, decks, templates and historical boards are derived/reference materials and must not override production when they conflict. If production appears wrong, record the suspected defect and obtain approval before changing production merely to reconcile a document.
