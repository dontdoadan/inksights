# Historical INKCARE records

This directory contains material created for the separate INKCARE project and retained only for auditability and lessons learned.

## Status

**Retired / historical.** Nothing in this directory is a current INKSIGHTS source of truth.

Do not use these documents to infer:

- current INKSIGHTS architecture;
- current product scope or pricing;
- current deployment or integration state;
- current customer evidence;
- current operating procedures.

The material is preserved because previous implementation choices, validation methods and failure modes may still be useful when designing INKSIGHTS. Any idea reused in INKSIGHTS must be re-evaluated against the current INKSIGHTS architecture and explicitly adopted into a current canonical document.

## Contents

- `replication/` — historical INKCARE replication, implementation and validation manuals.
- `client-zero/` — historical INKCARE Client Zero baseline and intervention evidence.

Applied Supabase migrations associated with historical systems remain in `supabase/migrations/` because migration history is part of the database record and should not be rewritten for cosmetic cleanup.
