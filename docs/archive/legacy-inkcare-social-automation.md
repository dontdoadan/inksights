# Legacy INKCARE social automation

Status: **removed from the active INKSIGHTS repository on 2026-09-15**.

The repository previously contained a scheduled social-publishing package under `automation/social/` plus `.github/workflows/weekly-content.yml`. Its campaign library, contact details, copy and operating notes were explicitly branded **INKCARE** and represented a previous migration experiment rather than the current INKSIGHTS product or content system.

It was removed to prevent legacy brand material from being mistaken for canonical INKSIGHTS automation or being reactivated accidentally.

## What was removed

- `.github/workflows/weekly-content.yml`
- `automation/social/.env.example`
- `automation/social/README.md`
- `automation/social/content/campaign-library.json`
- `automation/social/prepare_week.py`
- `automation/social/queue_runner.py`
- `automation/social/requirements.txt`
- `automation/social/seed/exported-queue.json`
- `automation/social/tests/test_dry_run.py`

## What was deliberately retained

Applied Supabase migration history remains in `supabase/migrations/`. Applied migrations are historical evidence and must not be deleted merely because the application code that originally used them is no longer active.

## Recovery

The removed files remain recoverable from Git history. The cleanup branch was created from commit `a3bd9c2ced2902ef84bb39050ab63c2b6c1f8b14`, which still contains the complete legacy package.

Do not restore or rebrand this package in place. Any future INKSIGHTS content automation should be designed against the current INKSIGHTS content strategy, data model and approval workflow.
