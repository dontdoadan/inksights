# INKCARE Search Intelligence

INKCARE Search Intelligence replaces the SE Ranking dependency with an internal system built on the existing INKCARE Supabase project and private GitHub repository.

## Deployed state

- Production Supabase project: `cpnkxfgxdoswyigjzvyh` (`INKCARE`, eu-west-1)
- Google Search Console property: `sc-domain:getinkcare.co.uk`
- Edge Function: `search-console-sync`
- Edge Function gateway authentication: JWT required
- Default mode: `DRY_RUN`
- Internal maintenance job: `inkcare-search-intelligence-maintenance` at `05:30 UTC` daily
- Keyword catalogue: 100 migrated B2B keywords in 8 groups
- AI prompt register: 10 controlled prompts
- Command Centre metrics: clicks, impressions, average position, tracked keywords and open opportunities

The database, history, opportunity scoring and reporting remain in INKCARE-owned infrastructure. Google is only the upstream source for Google Search data.

## Data model

- `seo_properties`: connected search properties and synchronisation state
- `seo_keyword_groups`: controlled taxonomy
- `seo_keywords`: internal keyword registry and target-page mapping
- `seo_query_daily`: query/page/country/device daily GSC performance
- `seo_page_daily`: page/country/device daily GSC performance
- `seo_opportunities`: striking-distance, low-CTR and declining-query queue
- `seo_url_inspections`: URL inspection history
- `seo_technical_checks`: Lighthouse/PageSpeed history
- `seo_ai_prompts`: approved AI visibility prompt register
- `seo_ai_visibility_checks`: controlled AI visibility observations

Read access is restricted to authenticated users. Anonymous access is revoked. Writes are reserved for the service role.

## Direct Google authorisation

The deployed function accepts either of these credential models.

### Preferred: service account

Set the Edge Function secret:

- `GOOGLE_SERVICE_ACCOUNT_JSON`

Then add the service-account email to the Search Console property with read access.

### Alternative: OAuth refresh token

Set all three Edge Function secrets:

- `GOOGLE_GSC_CLIENT_ID`
- `GOOGLE_GSC_CLIENT_SECRET`
- `GOOGLE_GSC_REFRESH_TOKEN`

The OAuth grant must include the read-only Search Console scope.

For either model, set:

- `INKCARE_SEARCH_DRY_RUN=false`

No Google secret belongs in GitHub, a migration, a browser bundle or a public table.

## Function requests

The function requires an authorised Supabase JWT.

Health check body:

```json
{"action":"health"}
```

Manual synchronisation body:

```json
{"action":"sync","siteUrl":"sc-domain:getinkcare.co.uk","days":10}
```

The function deliberately re-requests recent settled dates and upserts them, allowing Google to finalise delayed data without creating duplicates.

## Opportunity engine

The daily database job generates or refreshes:

- `striking_distance`: average position 4–20 with sufficient impressions
- `low_ctr`: page-one visibility with weak click-through rate
- `declining_query`: material click decline against the preceding 28-day window

Results are written to `seo_opportunities` and summarised into existing Command Centre metric tables.

## Current activation blocker

Search data ingestion remains intentionally disabled until Google credentials are authorised. The current Command Centre state is:

- property: `awaiting_authorization`
- connector: `disconnected`
- credential state: `required`
- alert: `gsc_authorization_required`

Once valid credentials are present and DRY_RUN is disabled, a successful sync changes the property and connector to active/healthy and resolves the alert.

## Repository project reference warning

The existing `supabase/config.toml` currently references `ydljgomreydoaihgaugo`, while the active INKCARE production project used for this module is `cpnkxfgxdoswyigjzvyh`.

This change does not modify `config.toml` because relinking it could redirect unrelated existing deployment workflows. Reconcile that project reference deliberately before using repository-wide Supabase CLI deployment commands.
