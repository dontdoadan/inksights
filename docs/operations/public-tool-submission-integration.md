# INKSIGHTS public-tool submission integration

**Status:** Proposed release (feature branch, not production)  
**Scope:** Pricing Benchmark v1 only  
**Source of truth:** Website → server API → Supabase Edge Function → `public_tool_submissions`

## Implemented in this feature branch

- The pricing benchmark no longer displays its visitor-specific results before a successful server acknowledgement.
- The visitor must submit at least one valid GBP price, choose a market, supply booking lead time and acknowledge the data notice.
- The browser posts through `/api/public/pricing-benchmark-submit` using the same origin.
- The server forwards to the existing `public-pricing-benchmark-submit` Supabase Edge Function using the public publishable key only; service credentials remain server-side.
- The Edge Function normalises values and stores the submitted inputs and result snapshot in `public_tool_submissions`.
- A v4 UUID submission key is reused on retried submissions so the database unique constraint avoids duplicate records.
- Any input change hides the previously displayed result and requires another submission.
- The Privacy Notice explains self-reported data use; these submissions are **unverified** and must not be passed off as independently observed pricing evidence.

## Canonical field contract

```json
{
  "region": "uk",
  "prices": [100, null, 650, 120, 70],
  "leadTimeWeeks": 4,
  "submissionKey": "<UUID v4>",
  "consentVersion": "2026-10-tool-v1",
  "dataNoticeAccepted": true
}
```

Response: `{ submissionId: string, result: { positions, below, above, lead_time_signal, reference_bands, dataset_version } }`.

The source of the **currently deployed** `public-pricing-benchmark-submit` Edge Function has been committed without functional changes in `supabase/functions/public-pricing-benchmark-submit/index.ts` to prevent source-code drift.

## Mandatory release checks

1. Run CI lint, build and typecheck. Generated route tree must exactly match the Vite generator output.
2. Preview the page with empty, valid, over-limit, malformed and partial price inputs.
3. Confirm no result is shown before a successful submission and no result is shown on validation/storage error.
4. Confirm the Supabase row contains the normalised inputs, dataset version, consent version and result snapshot.
5. Retry an identical request with the same UUID; it must not insert a second row.
6. Confirm changes to any field invalidate the previously shown result.
7. Confirm nothing is added to HubSpot from a *pricing-only* anonymous entry, and that submitting the tool does not silently subscribe the visitor to marketing.
8. Confirm the UI works on mobile, desktop, the production domain and a protected Vercel preview.
9. Check production and Supabase error logs, then decide separately whether to merge and deploy.

## Known limitations / next integration steps

- The **currently deployed** Edge Function lacks explicit per-visitor rate limiting and bot defences. Harden this before scaling paid traffic; frontend and backend validation are not substitutes.
- Retry responses should return the original database row ID, rather than falling back to the submission UUID. This does not affect data uniqueness but impacts support and auditability.
- A standalone pricing submission is **not a qualified CRM lead**. Do not equate submissions with leads. Studio identity, verified email, explicit contact request and consent/pre-contract basis need a separately designed conversion step.
- `/growth-model` is an illustrative revenue model, not part of this release. It requires its own versioned input schema and intake function before it can follow the same submit-to-reveal policy.
- The model's September reference bands are **initial reference values**, not a statistically verified market sample; include dataset provenance and sample size before using them for stronger commercial positioning.
- Make's INKSIGHTS CRM-sync scenario is currently paused despite valid HubSpot connection status; do not assume new incoming leads are being synced until a genuine end-to-end test passes.

**Do not merge or change production runtime settings without the required release approval.**
