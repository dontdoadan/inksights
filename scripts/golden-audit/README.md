# Golden Audit internal validation harness

`seed-daniel-hughes.mjs` creates or reuses the **Daniel Hughes Tattoos** internal-validation studio and a **Studio Intelligence Audit v1.1 / Mode B** audit, uploads a private transaction ledger to the `audit-sources` bucket, invokes canonical ingestion, and triggers the canonical Golden Audit orchestrator.

The script deliberately does **not** calculate metrics, generate findings, diagnose constraints, or write a report itself. Those operations belong to the Golden Audit system.

## Runtime requirements

Set these outside git:

- `SUPABASE_URL`
- `SUPABASE_SERVICE_ROLE_KEY` or `SUPABASE_SECRET_KEY`
- `DANIEL_LEDGER_PATH` — local path to the private ledger
- optional `DANIEL_WEBSITE_URL`

Run:

```bash
node scripts/golden-audit/seed-daniel-hughes.mjs
```

## Privacy rules

- Never commit the ledger.
- Never add client names or raw transaction values to this directory.
- Keep personal reasons for capacity constraints out of the audit context; the product needs only the operational fact that a material availability constraint exists.
- Public/client report surfaces must use aggregated intelligence only.

## Acceptance checks

After orchestration, verify source/transaction reconciliation, conservative identity handling, duplicate flags, partial-year labelling, `not_measurable` funnel metrics, website/search provenance, evidence-linked findings/diagnoses/opportunities/recommendations, QA-gated report publication, and idempotent rerun behaviour.
