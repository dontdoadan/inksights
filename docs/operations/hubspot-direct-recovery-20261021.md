# INKSIGHTS CRM transport recovery — 21 October 2026

## Verified incident
Make organisation **8929768** (Free) reported `isPaused=true`, monthly allowance `1000`, remaining `0`, next reset **8 November 2026**. The canonical scenario `7570494` reports `paused` even though its active toggle and HubSpot connection are healthy. Repeated scenario activation will not restore processing credits.

At inspection there were **zero non-test unsynchronised rows** across `revenue_audit_leads` and `public_contact_requests`. Exclude `is_test=true` from production recovery. The 12 unconfirmed records were test fixtures, not an established incident of lost customer leads.

## Remediation candidate in this PR
The server-only Supabase `hubspot-sync-v1` function retains its auth, source record lookup, test-record exclusion, CRM recording and existing Make fallback. When the server-only Edge Function secret **`HUBSPOT_PRIVATE_APP_TOKEN`** exists, it instead makes native HubSpot CRM API requests:
1. Fetch contact by exact email; create only when absent (retry on 409).
2. Search for the exact deterministic source-linked deal name; reuse on retries.
3. Create one deal only if none exists; reject ambiguous duplicate matches.
4. Ensure the contact/deal association exists.
5. Persist CRM IDs and sync timestamp to the canonical Supabase lead. On errors, the prior error journal logic is maintained.

**Important limitations:** This is sequential retry safety, not transactionally atomic deduplication across concurrent independent workers. HubSpot direct transport does not automatically create or associate a company. Historic leads already synced with company IDs are not reprocessed. No payment is marked paid on this route; Stripe remains authoritative.

## Required one-time setup (outside source control)
1. In HubSpot, create/reuse a **private app** with minimum CRM scopes `crm.objects.contacts.read`, `crm.objects.contacts.write`, `crm.objects.deals.read`, `crm.objects.deals.write`. The association API may require further scopes depending on the portal.
2. Save the token **directly in Supabase Dashboard → Edge Functions → Secrets** as `HUBSPOT_PRIVATE_APP_TOKEN`. Never paste it into source code, GitHub issues or ChatGPT.
3. Keep Make's existing runtime config for rollback until direct transport is independently verified.
4. Deploy this Edge Function from the reviewed, passing head; do not override `verify_jwt=false` without confirming the custom service credential guard.
5. With a permitted controlled non-production CRM fixture, verify contact/deal creation, exact association, repeated sync, intentional transient-error recovery and no accidental duplicate. Check HubSpot and Supabase IDs against source. Only then enable normal production use.
6. If direct transport fails after setup, remove/disable the server-side token and redeploy the previously known-good `hubspot-sync-v1` revision after checking Make capacity. Never expose secrets or customer PII in logging.

## Make recovery
- Option A: restore the Make organisation's processing credits through its authorised billing UI; when the account is unpaused, verify scenario 7570494 and its webhook queues.
- Option B: use this direct HubSpot transport to remove Make as a hard dependency; the native path still requires HubSpot API credentials and a successful acceptance test.
- Consider disabling unrelated high-credit scenarios **only with explicit owner approval**; reallocating consumption does not replenish an already exhausted cycle.

## Reconciliation guard
```sql
select 'contact' source, count(*) count
from public.public_contact_requests
where coalesce(is_test,false)=false and hubspot_synced_at is null
union all
select 'growth_check', count(*)
from public.revenue_audit_leads
where coalesce(is_test,false)=false and hubspot_synced_at is null;
```
Treat a recorded Supabase submission as the source of truth for a received customer enquiry even if CRM delivery is temporarily delayed. Do not replay test fixtures to production CRM, and do not mark records synced without confirmed HubSpot IDs.

## Acceptance evidence needed before closing #128
- Node transport tests + all existing CI jobs green.
- Native HubSpot live fixture matches Supabase contact/deal IDs and never creates duplicates.
- PII-free error logs and safe retry after 409/429/5xx.
- Production form submission captured and routed successfully (only with explicit permission to create a test lead).
- Rollback and Make billing state documented.
