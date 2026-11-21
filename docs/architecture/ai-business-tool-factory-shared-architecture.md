# AI Business Tool Factory — Shared Architecture

**Status:** DRAFT — engineering baseline  
**Date:** 2026-11-21  
**Owner:** INKSIGHTS  
**First product:** Studio Revenue Recovery

## 1. Objective

Create a reusable product platform for small, focused business tools. Each tool has its own product identity, workflows, entitlement and user experience, while sharing tenancy, identity, data ingestion, workflow execution, AI orchestration, approvals, audit, billing, observability and integration adapters.

The platform must keep domain logic independent of ChatGPT. ChatGPT skills/plugins and MCP actions are interfaces to the platform, not the system of record or the only place business rules exist.

## 2. Existing infrastructure baseline

| Concern | Canonical system | Reuse decision |
|---|---|---|
| Application source | `dontdoadan/inksights` GitHub repository | Extend through feature branches and PRs |
| Web runtime | Vercel project `inksight-main` | Add an authenticated product area to the existing app |
| Database/auth | Supabase project `INKSIGHTS` (`ukaxsqwnkoqbbsufpzga`) | Reuse; add namespaced Factory tables only after schema/security approval |
| Studio identity | `public.studios`, `public.visibility_studios` | Reuse canonical studio IDs where a workspace represents a tattoo studio |
| Studio membership | `public.studio_members` | Reuse for existing studio access where its policy semantics fit; do not assume it is a universal workspace membership model |
| Commercial CRM | HubSpot | Reuse for INKSIGHTS sales pipeline; do not mirror operational recovery records into CRM |
| Payments | Stripe | Reuse account and customer/payment infrastructure; product-specific prices and webhook entitlement mapping remain to be configured |
| Email | Zoho and existing mail approval ledger | Draft-first adapter; no sending in MVP |
| AI | OpenAI API | Use server-side structured generation for explanations and message drafts; deterministic code owns calculations and state transitions |

Do not create a second Supabase project, Vercel project, CRM or email system for the MVP.

## 3. Logical architecture

```text
                    ChatGPT / Web App / Future API
                               |
                         Product Interface
                               |
                    Authentication + Entitlements
                               |
                    Shared Tool Application API
             +-----------------+------------------+
             |                 |                  |
        Product Registry   Workflow Engine   Approval Engine
             |                 |                  |
             +---------- Shared Domain Services--+
                               |
                 +-------------+--------------+
                 |             |              |
             Data Import   AI Orchestrator  Integration Adapters
                 |             |              |
                 +-------------+--------------+
                               |
                     Supabase (system of record)
          Workspaces / Members / Imports / Events / Audit / Usage
                               |
             Product-owned domain tables (e.g. revenue recovery)
                               |
             Stripe billing | HubSpot CRM | Zoho email (later)
```

### Shared platform responsibilities

1. **Identity and tenancy:** user identity, business workspace, workspace membership, role and product access.
2. **Product registry:** product key, version, status, capabilities, supported connectors and feature flags.
3. **Entitlements:** subscription state, plan limits, feature access and usage limits.
4. **Data ingestion:** upload jobs, source provenance, field mapping, validation, deduplication and import summaries.
5. **Workflow runtime:** versioned workflows, deterministic rule execution, idempotency and retry boundaries.
6. **AI orchestration:** server-side prompt templates, structured outputs, model selection, cost accounting and refusal/fallback behaviour.
7. **Approval engine:** explicit human approval for external communication and consequential actions.
8. **Audit and observability:** actor, workspace, product, action, source, timestamp, before/after references, outcome and error.
9. **Integration adapters:** narrow interfaces to Stripe, HubSpot, Zoho and future booking systems.
10. **Reporting:** operational metrics and product usage, separate from estimated opportunity value.

### Product-owned responsibilities

Each product owns its domain entities, calculations, workflow rules, user interface and product-specific outcomes. Revenue Recovery owns booking/client/project/enquiry/capacity opportunity logic. A future Acquisition product must not inherit those concepts simply because the platform is shared.

## 4. Tenancy model

Introduce a generic Factory workspace abstraction so future tools can support businesses that are not tattoo studios.

- `bt_workspaces`: business tenant, display name, business type, timezone, currency, status.
- `bt_workspace_members`: user-to-workspace membership and role.
- `bt_workspace_products`: enabled products and configuration.
- `bt_product_entitlements`: subscription-derived capabilities and limits.

Where a workspace is a tattoo studio, store the existing canonical `studio_id` as an optional unique link to `public.studios`. Do not duplicate studio name, website or location as authoritative fields; use a snapshot only when historical reporting requires it.

All new tenant-owned rows carry `workspace_id`. RLS must validate active membership and role, not just authentication. No user-editable JWT metadata is an authorization source. Server-side service credentials must never be exposed to browser code.

## 5. Product contract

Each product exposes the same lifecycle contract:

- `register()`: product key, version, required capabilities and configuration schema.
- `ingest()`: accept validated source records and return an import report.
- `analyse()`: run deterministic rules and create evidence-backed findings/opportunities.
- `recommend()`: generate prioritised action recommendations.
- `prepare_action()`: create a draft action without executing it.
- `approve_action()`: bind approval to the exact draft digest and approving actor.
- `execute_action()`: execute only permitted, approved actions through a typed adapter.
- `record_outcome()`: store observed result and evidence.

The MVP implements ingest, analyse, recommend, draft and outcome recording. It does not implement external message sending.

## 6. Shared data model (proposed)

All names are provisional and require migration review.

| Table | Purpose |
|---|---|
| `bt_workspaces` | Generic business tenant and optional canonical studio link |
| `bt_workspace_members` | Workspace membership, role and active state |
| `bt_workspace_products` | Product activation/configuration |
| `bt_import_jobs` | File/source ingestion lifecycle and aggregate validation counts |
| `bt_import_rows` | Staged source rows, row-level validation and mapping state |
| `bt_workflow_runs` | Workflow execution version, status, idempotency and summary |
| `bt_approvals` | Immutable approval record bound to action digest |
| `bt_audit_events` | Append-only security and operational event log |
| `bt_usage_events` | Metered product usage and billing reconciliation |

Product-specific Revenue Recovery tables use `rr_` prefix and also include `workspace_id`.

## 7. Security and data governance

- Enable RLS on every exposed Factory and Revenue Recovery table.
- Policies must check both `auth.uid()` and membership in the row's workspace.
- Separate read, write, approve and admin roles; do not give every member identical permissions.
- Do not use `raw_user_meta_data` for roles or authorization.
- Keep service-role/secret keys server-side only.
- Keep imported personal data in private storage and database tables; never put raw client datasets into prompts by default.
- Minimise imported fields. Do not ingest tattoo design references, medical/health notes, identity documents or unrelated sensitive data.
- Store source filename, source system, import time, mapping version and row hash for provenance.
- Support data export, deletion requests and configurable retention. Legal basis, controller/processor terms, privacy notices and PECR controls require review before commercial launch.
- All outbound communications remain draft-only until the recipient, purpose, eligibility, suppression and approval checks are implemented and tested.
- Audit approvals against the exact draft content hash; any content edit invalidates the approval.

## 8. AI boundary

AI is an assistive layer, not the financial ledger or policy engine.

**Deterministic:** duplicate resolution, dates, inactivity windows, balances, remaining project value, capacity arithmetic, priority score, idempotency and outcome attribution.

**AI-assisted:** explain a finding in plain English, produce a suggested recovery plan, draft a personalised message from approved fields, classify ambiguous text for human review.

AI output must be schema-validated. If the model fails, show the deterministic finding and a non-AI fallback. Never invent a client history, balance, availability, consent or recovered amount.

## 9. API boundary

Use authenticated server-side application functions in the existing TanStack Start application initially. Keep domain logic in pure TypeScript modules so it can later be exposed through REST/MCP without rewriting the rules.

Initial internal service contracts:

- `POST /api/tool-factory/imports`
- `GET /api/tool-factory/imports/:id`
- `POST /api/revenue-recovery/analyses`
- `GET /api/revenue-recovery/opportunities`
- `POST /api/revenue-recovery/opportunities/:id/drafts`
- `POST /api/revenue-recovery/actions/:id/approve`
- `POST /api/revenue-recovery/actions/:id/outcome`

These are target contracts, not claims that routes currently exist. Every request must derive workspace access from the authenticated session and enforce ownership server-side.

## 10. Billing and commercial model

Stripe remains the billing system of record. Product entitlements are projected into Factory tables from verified Stripe customer/subscription/webhook state. Do not trust a client-supplied plan or subscription status.

Initial pricing hypotheses for validation, not approved live prices:
- Solo: £49/month
- Studio: £99/month
- Multi-location: £199/month

Plan limits should be based on active clients/records, monthly analysis runs and connected integrations—not arbitrary feature gates. Do not create Stripe prices until product packaging and trial economics are validated.

## 11. Non-functional requirements

- UK/EU region alignment for data residency where available.
- Tenant isolation tested at database and API layers.
- Import idempotency and duplicate-safe retries.
- Clear source-to-finding provenance.
- Financial calculations in integer minor units (GBP pence).
- UTC timestamps with workspace timezone used for local date windows.
- No production writes from demo/test fixtures.
- Structured logs without unnecessary PII.
- Accessible, responsive UI and clear distinction between observed, calculated, modelled and unknown values.

## 12. Architecture decision records

- **ADR-001:** Shared platform, separate product modules; accepted.
- **ADR-002:** Extend existing INKSIGHTS Supabase/Vercel/GitHub; accepted.
- **ADR-003:** Generic Factory workspace with optional studio identity link; accepted and applied in Supabase migration `20261121071600`.
- **ADR-004:** Deterministic revenue calculations; AI for explanation and drafting only; accepted.
- **ADR-005:** Draft-first communications with explicit approval; accepted.
- **ADR-006:** New namespaced tables rather than overloading public revenue-audit lead tables; accepted and applied.


## 13. Implementation baseline — 2026-11-21

The first shared database foundation is now applied to the existing INKSIGHTS Supabase project.

- 18 new tables: 9 shared Factory tables and 9 Revenue Recovery tables.
- RLS enabled on all 18 tables.
- 39 workspace-aware policies across 16 tables. Two append-only service tables (`bt_audit_events`, `bt_usage_events`) intentionally have no client policies or client grants.
- No anonymous table privileges. Client-side deletes are not granted.
- Workspace membership is provisioned by trusted server-side code; authenticated users can read only their own active membership row.
- RLS predicates use that caller-visible membership row; no new SECURITY DEFINER helper was introduced.
- Import row updates are revoked from authenticated clients; trusted server-side normalisation owns row-state transitions.
- Foreign-key indexes were added following the first performance-advisor pass.
- A transactional two-workspace isolation test passed; test fixtures were rolled back.
- No workspace records, customer records, CSVs or live integrations have been created/configured yet.
- Private import-file storage, retention automation, workspace provisioning endpoint and billing entitlements remain future implementation work.

The live database migration versions are recorded in `supabase_migrations.schema_migrations`; matching migration files are checked into the feature branch. The remote schema has not yet been recreated from a local Supabase CLI reset in this environment.
