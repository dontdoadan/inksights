# UK Studio Directory, owner claims and saved intelligence — implementation contract

Status: DESIGN / NOT DEPLOYED · 21 October 2026
Owner: INKSIGHTS · Canonical implementation: GitHub / Supabase / Vercel

## Product boundaries

- Public directory is a discovery surface, not proof of business ownership, safety or studio performance.
- Sources of studio identities: `studio_sources`, `studio_candidates`, `studio_source_observations`, `studio_identity_matches`, `studio_verification_events`. Never promote unresolved records merely because an owner submits a form.
- A source-confirmed listing is **observed**, not **owner-verified**. The owner badge requires a successful, dated verification event with an auditable method.
- A location is mapped only if latitude/longitude comes from a traceable, lawfully reusable source or a reviewed geocoding process. A repeated address on two businesses is a conflict, not two valid pins.
- Existing `visibility_studios` owns verified operational studio identity, `studios` existing audit tenant identities, and `studio_members` grants access. Do not cross-wire these two UUID spaces through unreviewed joins.
- Never mix private reports/audits/tool submissions into public listings.
- Contact/owner emails collected for claim verification remain private. No public owner contact information unless explicitly permitted and confirmed.

## Public UK map MVP

1. Search by town, postcode district, art specialism, appointment/walk-in and profile status.
2. Render location clusters, with an accessible list alternative; clicking a marker opens the corresponding canonical profile.
3. Clearly label `Observed listing`, `Owner verified`, and `Needs review`; exclude archived, rejected, duplicate or stale listings from public pins.
4. Display listing freshness and source policy; allow reporting corrections.
5. Include prominent actions: **Enquire with studio**, **Claim this studio**, **Run Studio Growth Check**.
6. Keep view/click/lead attribution in INKSIGHTS website events, aggregated by studio and channel without leaking customer PII.
7. Start in Croydon/South London, validate identity and coordinates, expand by region only after QA.

## Claim and verification journey

`Public listing → Claim → Sign in / create account → Proof challenge → Manual/automated review → Owner-verified event → Membership grant → Editable profile`.

- Self-reported claim alone does not grant access. Pending claims are private and expire after a defined window.
- Primary proof: challenge to a verified studio-domain mailbox, verified with single-use expiring token; alternatives require manual review of business identity or proof of control. Email ownership alone is not absolute proof of legal ownership.
- Explicitly protect against impersonation, takeovers, domain aliases, domain recycling, duplicate claims, multiple locations, and previous-owner transitions.
- One organisation may manage multiple verified locations; memberships are per tenant/location with explicit `owner`, `admin`, `editor` authorisations.
- Admin approval produces a `studio_verification_events` record including method, reviewer, time, sources, expiry/refresh date.
- Changes to core identity (name/address/ownership) go into review; changes to non-sensitive approved fields can publish immediately.
- Every profile change is auditable and can be rolled back. Expired verification removes the badge pending review, not necessarily the record.

## Account workspace

- Public profile management: styles, artists, opening hours, accessibility, portfolio and booking channel, independently vetted claims only.
- Saved tool results and source/version snapshots: `public_tool_submissions` remains unverified until linked after claim and authorization. Never infer access to existing user-submitted data purely from name matching.
- Private paid reports, diagnoses, interventions and outcomes: read using tenant/RLS membership, explicit entitlement, and paid audit permissions.
- Financial/booking inputs protected by RLS; aggregated benchmarking only if explicit consent, minimum cohorts and appropriate anonymisation.
- Every submission records calculator version, assumptions, input provenance, consent version, created timestamp, studio claim state and audit ID if applicable.
- Owner marketing preferences separate from data storage terms; double opt-in for optional marketing where appropriate.

## Geodata/licence and operational rules

- OpenStreetMap map data carries ODbL conditions: visible attribution and review of share-alike/derived-database implications.
- The OpenStreetMap Foundation tile server has limited capacity, is not a general free commercial map hosting SLA; switch to a permitted provider or self-host for scale.
- The public Nominatim API forbids systematic extraction of places/postcodes as a business directory, and has strict request limits; do not use it for UK-wide harvesting.
- Do **not** bulk-extract/republish Google Maps Places content without reviewing platform licensing; Google listings can be used as an observation and discovery hint under permitted terms.
- Use openly licensed/reviewed provider data, reputable first-party studio websites, Companies House for legal identity checks where relevant, and voluntary owner submissions. Audit `studio_sources.permitted_for_commercial_use` before persistent ingestion.
- Coordinate precision should respect studio wishes for appointment-only/private locations.

## Status, releases and approvals

Current release: revenue-scenario calculator staged as a source-controlled feature only; no map/claim schema deployed.

Next feature releases, in order:
1. Proposal and reviewed migration for private owner-claim records, token lifecycle, tenancy crosswalk and profile/version history; **requires explicit database/auth/security approval before applying**.
2. Provenance-filtered read-only directory endpoint, static search and interactive map with approved geodata/tile provider; whitelist public fields.
3. Authenticated claim submission and server-only token validation, admin queue, audit, ownership transfer and re-verification.
4. Owner profile dashboard and upload moderation.
5. Saved calculators and paid report entitlements, complete tenant-level RLS and regression tests.
6. Enquiry attribution and privacy-safe analytics; commercial onboarding and subscription experiments.

## Acceptance tests

- Cannot view or edit any studio's private data before owner verification.
- Cannot claim a different studio via guessed ID, email spoof, reused token or replayed link.
- Cannot modify protected identity, owner, coordinates or licence status by changing public form payload.
- Cannot access paid reports solely through a public map/profile link.
- Map never exposes research annotations, private contact PII or financial data.
- Suppressed/archived/stale/ambiguous businesses are absent from the directory.
- Search and map have current attributions and can switch data/tile providers without losing the studio ledger.
- Every metric and economic benefit shown is clearly tagged OBSERVED / MODELLED / VERIFIED with source, time and baseline.
