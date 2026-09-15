# INKSIGHTS documentation index

This directory contains current product documentation, operating evidence and historical records. Not every document is a current source of truth.

## Current sources of truth

- `../README.md` — canonical application architecture, development workflow and repository boundaries.
- `commercial-source-of-truth.md` — current commercial positioning and offer assumptions.
- `search-intelligence.md` — search-intelligence design and operating notes.

When documents conflict, prefer the repository `README.md`, current production code and the newest explicitly canonical document.

## Evidence and operating records

- `operations/` — dated production/operational proof.
- `releases/` — release-specific records.
- `PRODUCTION_AUDIT_2026-08-27.md` — historical production audit; useful as evidence, not as a statement of current state.

Dated audits and release notes are snapshots. Do not treat them as current architecture without verifying the code and production environment.

## Specifications and plans

- `pilot-studio-landing-page-spec.md` — historical/specific implementation specification.
- `superpowers/` — implementation plans and agentic execution records.

## Archive

- `archive/` — retired systems or material intentionally removed from the active product surface but retained for traceability.
- `archive/inkcare/` — historical INKCARE replication manuals and Client Zero records. These are learning/audit records only and are **not** INKSIGHTS architecture, product scope, operating instructions or current evidence.

## Documentation hygiene rules

1. Keep one canonical document for each current decision or system boundary.
2. Date evidence, audits and release records rather than silently overwriting them.
3. Move retired concepts to `archive/` or remove them from the active tree with a recovery note.
4. Do not mix INKCARE, personal tattoo-business or other brand material into canonical INKSIGHTS operating code.
5. Applied database migrations are historical evidence and should not be deleted simply because the feature that created them is retired.
6. Prefer links to canonical documents over duplicating the same architecture or business rules in multiple files.
7. Treat anything under `archive/` as historical context only unless it is explicitly promoted back into a current source-of-truth document.
