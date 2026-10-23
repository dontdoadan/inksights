# INKSIGHTS directory claim pilot — Release QA

Status: DRAFT / NOT LIVE. Parent calculator release PR #138.

## Geodata and release surface
- Five studios: first-party advertised address, postcode.io postcode centroid (not rooftop/door coordinates), updated 2026-10-23.
- Dataset resides in existing studio_candidates, not Companies House registered-address imports.
- API filters on directory_publication_status=public_observed_location_reviewed and exposes only id/name/address/town/postcode/lat/lon/website/review date and observed status. No raw payload, contact notes, studio financial data or CRM IDs.
- Map uses pinned MapLibre CDN module and OpenFreeMap Liberty vector tiles; commercial-use terms checked 2026-10-23, provider has no SLA. Preserve attribution and a usable text list if map fails.
- Prevent original page from implying owner verification. Profiles are labelled unclaimed and location approximate.

## Claim and profiles
- Approval remains free and evidence-based. Account email confirmation only authorises submitting a claim, not claiming the studio.
- Signed-in request must be verified via Supabase auth.getUser(token) on server, not client user_metadata.
- Claims schema and profile schema require explicit production migration approval, database policy/security review, and end-to-end test before enabling claims publicly.
- Service-only tables; no grants to anon/authenticated and no RLS policies. API handles all authorisation on each read/write.
- Second verified owner claim for the same studio must not silently replace the current owner. Ownership transfers require manual review.
- Claims submitted with proven source documents/website evidence need a human confirmation. Only then can a reviewer set verified + reviewed_by + verified_at + verification_method.
- Profile editor is out-of-scope until verified membership, strict field whitelist, proof revocation, moderation, and tenant isolation are complete.

## Minimum real acceptance tests
1. Published map only returns five tagged sources, no PII, no unresolved companies.
2. Attempt query of public Supabase raw candidates/claims/profiles as anon gets no protected data.
3. A non-authenticated claim returns HTTP 401; mismatched origin 403; missing consent 400; unapproved candidate 404.
4. Authenticated unverified-email user denied; verified-email user creates pending claim without edit/report rights.
5. Duplicate claim request produces same pending state, not two records.
6. Two accounts claiming same candidate cannot independently become verified.
7. Revoked owner/tenant cannot edit another studio; private audits only available through existing scoped tenancy.
8. Bad URLs and malicious input rejected server-side.
9. Build, generated route tree, TypeScript, desktop/mobile a11y and functional map / list fallback.
10. Calculator standalone PR #138 must pass production readiness before map PR is merged.

## Commercial stage plan
A) release revenue scenario; B) read-only five studio map; C) claim review and owned public profiles; D) secure tenancy crosswalk between directory IDs and operational studios; E) attach saved auditable results and paid entitlements; F) privacy-safe booking enquiry attribution and aggregated benchmarks.
