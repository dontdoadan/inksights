# INKCARE Replication and Implementation Manual

Last verified: 26 July 2026

## Purpose

This folder documents the INKCARE system that already exists. It is not a roadmap for a different product and must not be used to imply that unfinished or unverified functionality is complete.

The package has four purposes:

1. Rebuild the existing INKCARE setup consistently.
2. Validate it with isolated sample data before any studio is exposed to it.
3. Operate and troubleshoot it without relying on undocumented knowledge.
4. Package the implementation as a repeatable, supportable studio service.

## System boundary

INKCARE currently consists of:

- Website and application code in GitHub.
- Supabase database, Row Level Security, Edge Functions and scheduled operations.
- Stripe payment and subscription event handling.
- HubSpot CRM and advertising-pixel connection.
- Meta social accounts, approval-gated publishing migration and dry-run evidence.
- n8n legacy orchestration during controlled migration.
- SEO monitoring and search-data connectors.
- Private Command Centre for health, tasks, approvals, mappings, alerts and evidence.

The studio does not need to understand this stack. The studio receives the agreed service, outputs, reports and handover material. INKCARE operates and monitors the technical layer.

## Data classification

Every record must be classified as one of:

- **Sample** — synthetic data created solely for demonstrations and tests.
- **Internal unverified** — operational or pilot data that is not an approved client result.
- **Verified client data** — evidence linked to a real studio and approved for the stated use.

Sample or internal data must never be presented as client proof, revenue uplift or a case study.

## Manuals

- [System Architecture](SYSTEM_ARCHITECTURE.md)
- [Validation Runbook](VALIDATION_RUNBOOK.md)
- [Implementation Checklist](IMPLEMENTATION_CHECKLIST.md)
- [Current INKCARE Baseline](CURRENT_INKCARE_BASELINE.md)

## Release rule

No client-facing implementation should be described as ready until:

- the validation suite passes;
- the relevant connector is healthy or its limitation is explicitly accepted;
- the studio-specific test scenario succeeds;
- the delivery checklist is complete;
- rollback and support ownership are documented.

## Safety controls

- Social publishing remains `DRY_RUN=true`.
- Queue items remain `awaiting_approval` until explicitly approved.
- n8n remains enabled during the parallel migration.
- No real payment card data is stored in Supabase.
- Secrets are stored only in approved secret stores and never in manuals, screenshots, commits or workflow exports.
- Test records remain isolated from verified production reporting.
