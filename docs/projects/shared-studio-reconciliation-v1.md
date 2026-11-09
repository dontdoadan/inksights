# INKSIGHTS — Shared Studio Identity & Reconciliation Engine v1

Status: DRAFT / review-only implementation
Date: 2026-11-09
Branch: feature/shared-studio-reconciliation-engine
Existing canonical repository: dontdoadan/inksights
Existing canonical database: Supabase project ukaxsqwnkoqbbsufpzga

## Architecture decision

Use one shared studio identity infrastructure, not a second database or another canonical studio table.

- Raw sources: studio_candidates, studio_sources, studio_source_observations.
- Existing visibility identity: visibility_studios, studio_members and verification events.
- Existing audit identity: studios.
- Approved candidate identities: studio_identity_matches.
- Approved Atlas audit-to-visibility crosswalk: atlas_studio_links.
- New administrative review surface: studio_reconciliation_cases and studio_reconciliation_decisions.

The review queue is not itself a verified legal company, active trading premises, validated studio owner or published directory listing.

## Read-only inventory, November 9 2026

| Dataset or indicator | Count |
| --- | ---: |
| Candidate observations | 349 |
| Companies House source candidates | 305 |
| INKSIGHTS internal research candidates | 27 |
| Studio website observations | 15 |
| Public directory candidates | 2 |
| Field/source observations | 106 |
| Existing visibility studio identities | 19 |
| Existing audit studio identities | 9 |
| Accepted candidate-to-visibility links | 0 |
| Approved Atlas identity bridge rows | 0 |
| Public Atlas profiles | 0 |
| Candidates with raw postcodes | 321 |
| Candidates with normalised postcodes | 17 |
| Candidates with normalised names | 44 |
| Candidates with a website | 25 |
| Candidates with Companies House numbers | 305 |
| Distinct Companies House numbers in candidate set | 305 |
| Candidates with coordinates | 5 |

A read-only cross-record comparison found five candidate observations with six possible visibility identity pairings. These are suggestions only, not verified relationships. One domain is shared by a studio-named record and the internal Client Zero record, proving that website equality alone is insufficient. The matching algorithm prioritises a matching business name plus website above a shared website alone, and flags multiple options.

Most Companies House records have a raw name and postcode, but their normalised comparison fields are missing. Matching derives those fields in the query without overwriting original source evidence.

## Intended lineage

Raw sources and observations
  -> standardise comparisons without changing raw records
  -> suggest candidate-to-visibility and candidate-to-audit links
  -> private review cases
  -> authorised reviewer with independent evidence
  -> approved studio_identity_matches (visibility identity only)
  -> separate premises and owner verification if Atlas publication is requested
  -> controlled reuse by Prospect Intelligence only when evidence meets its HOLD rules

## Matching signals: ordinal heuristics, not probabilities

- 95/100: exact legal company number. Legal entity only, not trading premises.
- 92/100: same website host AND studio name.
- 85/100: same studio name and postcode. Could be registered-office address.
- 60/100: same studio name and town.
- 50/100: shared website host without matching name. Flag as potentially ambiguous.
- 0/100: no supported proposed match.

These scores rank review priority and must never be presented as calibrated statistical confidence.

## Implementation staged in this branch

1. SQL migration adds two RLS-enabled tables and service-role-only functions. No direct public or authenticated client table grants.
2. Idempotent suggestion refresh inserts/updates only unreviewed review cases; no candidate identity is changed automatically.
3. A decision operation records append-only reviewer evidence. Approving a real, independently corroborated candidate-to-visibility link updates the existing identity table and candidate pointer, but does not publish a premises or grant account control.
4. A standalone admin Edge Function validates an authenticated user and an active platform administrator role before reading or modifying reconciliation data.
5. An authenticated route provides queue filters, source evidence, comparison rules, proposed targets and human review actions.
6. CI policy tests cover admin authorization, ambiguous website collision, match approval evidence and no automated Atlas/CRM effects.

Important: No Supabase migration has been applied by this branch. The Edge Function has not been deployed. Existing candidate records, CRM, Atlas and commercial site have not been changed. Deployments and schema writes remain separate release gates.

## Standard review procedure

1. Check source provenance, permitted use, observed date, company number, business name, postcode and website.
2. Compare possible targets; do not assume matching domains indicate identical businesses or locations.
3. Independently verify at least one authoritative HTTPS source and record specific evidence and why it supports the intended identity.
4. If uncertain, select Needs evidence. If wrong, reject the suggestion; neither operation invalidates the source candidate.
5. Approve only an existing target visibility identity. A human decision, not the matcher, creates the accepted link.
6. Accepted identity does not imply premises registration, operating status or ownership authority.
7. Do not reverse an accepted match casually; conflicts require a dedicated review and reversal procedure.
8. Atlas and Prospect Intelligence consume only their respective approved and permitted identity outputs. No automatic public publication, advertising rights or HubSpot writes.

## Safety and acceptance gates

- Review SQL and database grants in isolation before applying production schema changes.
- Run security advisors; test anon and non-admin denial; use separate authenticated accounts for cross-tenant checks.
- Verify queue regeneration with all 349 candidates and repeat it to prove idempotency.
- Verify competing-name/website cases, source timestamps and weak-signal handling.
- Approve and reject a controlled identity with immutable evidence and verify original source records remain intact.
- Verify CI-generated route tree, lint, TypeScript and Vercel preview.
- Resolve integration/merge ordering with unmerged Prospect Intelligence PR #97 and Studio Atlas PR #156; don't overwrite either branch.
- Do not affect the existing £395 Audit checkout, HubSpot, reporting or production website.
- Only enable scheduled refresh, bulk candidate processing or public Atlas population after measured pilot quality and human approval processes are sound.

The delivered milestone is a reviewable implementation, not a claim that 349 trading tattoo studios have been verified.
