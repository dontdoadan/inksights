# INKSIGHTS — Companies House Discovery v1

**Project:** INKSIGHTS-API-INTELLIGENCE-V1 · **Scope:** research-only source adapter · **Release:** isolated PR, no production credentials or data writes.

## Outcome

A repeatable, bounded tool for retrieving UK **legal-company candidate records** from the Companies House Public Data API. It deliberately does **not** claim these records are trading tattoo studios, that registered-office addresses are operating locations, or that results meet the INKSIGHTS ICP.

## Use

1. Obtain a read-only Companies House API key from [Companies House Developer Hub](https://developer.company-information.service.gov.uk/get-started). Set it as the `COMPANIES_HOUSE_API_KEY` **environment variable in the local/server process** (never in the browser, Git repository, issue or logs).
2. Exercise without a key:

   ```bash
   node scripts/companies-house/discover.mjs --query tattoo --limit 20 --dry-run
   ```

3. Run a live, bounded export (with the environment variable present):

   ```bash
   node scripts/companies-house/discover.mjs --query tattoo --query tattoos --limit 20 --max-pages 2 --format json --out companies-house-candidates.json
   ```

4. For a **registered-office address text filter only**, add `--registered-address Croydon`. This is **not** a trading location filter, and many relevant studios have company addresses elsewhere.

5. The output file is created with mode `0600` and will **not** overwrite an existing file. CSV export is also available via `--format csv`. The tool does not write to Supabase, HubSpot or Stripe.

## Contract

- Fixed Companies House host; GET `/search/companies`, optionally `/company/{companyNumber}` available within adapter; Basic API key auth server-side.
- Inputs: 1–4 bounded search terms (3–80 characters), 1–100 result cap, at most five pages/term; fixed maximum request budget; 10-second request timeout; up to two limited retries for transient network/rate-limit/server errors.
- Outputs: schema version, UTC observation timestamp, request parameters, execution summary and uniquely keyed `companies_house:{company_number}` candidates.
- Candidate records: legal company number, name, status where reported, registration details where present, query match, registry citation and explicit *studio unverified / no CRM approval* flags.
- CSV output neutralises leading formula characters before spreadsheet import.
- Privacy/data: keep public company information no longer than required under the applicable rights/retention and privacy policy; registered addresses can also be residential. Avoid distributing bulk personal details.
- Commercial data: Company searches are incomplete for tattoo studios. Sole traders and studios with non-tattoo legal names may not appear. Never infer artist count, revenue, ratings or owner identity from the results.

## Operational limitations and follow-up

- **Live integration not activated by this PR:** obtaining and storing the API key server-side is a separate credential-management gate. No claim of live API success before an authenticated read is witnessed.
- **No public UI/API endpoint yet:** first release is a server/CLI adapter because the current site's route guard is browser-side, which is not adequate to protect API quotas/credentials. A later internal interface needs verified server-side admin authorisation and rate limiting.
- **No automatic persistence:** match to existing `studio_candidates` and `studio_source_observations` through a separately reviewed mapping. Avoid schema changes, duplicate canonical `studios`, and blanket HubSpot writes.
- **Pilot gate:** research 20 existing staged businesses; annotate identity match `exact / possible / unrelated`, competing official source URLs and a human verification decision before any CRM promotion.
- **Unit tests:** `node --test tests/companies-house-discovery.test.mjs`.

## Provider specifications and source rights

- [Authentication](https://developer.company-information.service.gov.uk/authentication) — HTTP Basic with the key as the username.
- [Search companies](https://developer-specs.company-information.service.gov.uk/companies-house-public-data-api/reference/search/search-companies) — `/search/companies`, `q`, `items_per_page`, `start_index`.
- [Rate limits](https://developer.company-information.service.gov.uk/developer-guidelines/) — maximum 600 calls per five minutes per application; this tool enforces a much smaller per-run ceiling, **not** a cross-worker global quota.

## Merge and release gates

Before merging into main or enabling a live user-facing workflow: pass unit tests and repository CI; security review the server key handling; validate provider rights; verify 20 real-world evidence mappings; enforce operational access controls and rate limits; obtain explicit approval for production promotion. This PR leaves current production systems unchanged.
