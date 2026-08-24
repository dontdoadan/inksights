# INKCARE social automation replacement

Private, approval-gated replacement for the active n8n social publishing workflows.

## Safety state

- `DRY_RUN=true` is the default in code, GitHub Actions and Supabase.
- The five imported posts remain `awaiting_approval`.
- Live queue claiming is blocked in PostgreSQL until `dry_run=false` and the migration phase is explicitly moved to `controlled_live_test` or later.
- n8n remains enabled during parallel validation.
- Do not retire n8n until one controlled item has produced both an Instagram post ID and a Facebook post ID.

## Components

- `queue_runner.py`: validates queue items, records dry-run plans, and contains isolated Instagram/Facebook publishing paths for the later controlled test.
- `prepare_week.py`: creates a deterministic Monday–Friday draft batch from the campaign library.
- `content/campaign-library.json`: canonical campaign and offer sequence.
- `seed/exported-queue.json`: the five-post export recovered from n8n execution 21 and used for fallback validation.
- `supabase/migrations/20260725213000_create_social_automation_replacement.sql.gz.b64`: compressed exact snapshot of the applied schema migration.
- `supabase/migrations/20260725220500_index_social_automation_controlled_test_queue.sql`: applied covering index migration.
- `supabase/migrations/README.md`: decoding instructions and live migration-state notes.

The queue seed was applied idempotently to Supabase from `seed/exported-queue.json`; the live database remains the source of truth for applied migration history.

## Local dry run

```bash
cd automation/social
DRY_RUN=true python queue_runner.py --seed-file seed/exported-queue.json --include-awaiting-approval
python -m unittest discover -s tests -p "test_*.py"
```

## Database dry run

Set `SUPABASE_URL` and `SUPABASE_SERVICE_ROLE_KEY`, leave `DRY_RUN=true`, then run:

```bash
python automation/social/queue_runner.py --include-awaiting-approval
```

Database mode checks that the environment and `social_automation_settings.dry_run` agree. A mismatch aborts execution.

## Controlled live test prerequisites

1. Approve exactly one queue item and attach a publicly reachable image URL.
2. Add repository secrets: `SUPABASE_URL`, `SUPABASE_SERVICE_ROLE_KEY`, `META_ACCESS_TOKEN`, `META_PAGE_ID`, and `META_IG_USER_ID`.
3. Change the database migration phase to `controlled_live_test` and set `dry_run=false` only for the controlled run.
4. Run the workflow manually with `dry_run=false` and `limit=1`.
5. Confirm both platform IDs in `social_content_queue` and `publication_log`.
6. Only then disable the corresponding n8n social workflows and set the migration phase to `n8n_retired`.
