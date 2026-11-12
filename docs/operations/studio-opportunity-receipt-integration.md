# Studio Opportunity Receipt - integration and release contract

Status: **Proposed / preview only**. Owner: INKSIGHTS. Date: 2026-11-01.

## Purpose

Use one evidence-sourced, personalised receipt to start an informed commercial conversation with a studio owner and direct qualified interest to the existing £395 Studio Intelligence Audit. Do not expose individual receipt PDFs in public unauthenticated routes.

## Canonical ownership (existing systems only)

- **Supabase**: persistent studio/prospect identity and evidence; `studio_candidates` are discovery records, not yet canonical `studios`. Existing `studio_source_observations` and `intelligence_evidence` must keep primary-source URL, UTC observation time, capture and classification. No new public write policy.
- **HubSpot**: existing COMPANY/CONTACT/DEAL and lifecycle; lookup by domain and identity before writes. Preserve duplicate/test suppression. Proposed receipt metadata should be associated with the existing COMPANY; do not create one deal per speculative observation.
- **Stripe**: existing audit checkout is the sole payment authority. Sale and WON status follow server-side webhook verification, never a click or thank-you URL.
- **GitHub/Vercel**: website code in main and protected PR preview; no receipt evidence or private contact data in the repository.
- **Drive**: canonical owner for approved business PDFs and prospect source captures under the existing Leads & Sales / research structure, not another top-level library.

## Proposed record contract (requires reviewed migration before adoption)

Receipt lifecycle values: `researched`, `source_verified`, `visual_qa_passed`, `contact_permitted`, `approved_for_send`, `sent`, `engaged`, `audit_purchased`, `withdrawn`.

Record fields: `receipt_id` unique, `candidate_id` nullable, `studio_id` nullable, `hubspot_company_id` nullable, `classification`, `observed_claim`, `source_urls`, `observed_at`, `snapshot_object_key` optional/private, `commercial_hypothesis`, `model_inputs`, `model_output`, `recommended_test`, `status`, `reviewer_id`, `last_verified_at`, `sent_at`, `stripe_checkout_session_id` nullable. Only server-side service credentials may write protected evidence. All access requires tenant authorisation and least privilege; service role never reaches the browser.

## Identity gate

1. Search the existing candidate registry by domain, URL, location and name; exact name matching alone is insufficient.
2. Inspect `studio_identity_matches` and canonical `studios`. Do not auto-promote a candidate on the basis of one website.
3. Search HubSpot companies by domain; preserve existing Unit Two, Moth & Flame and Six Bullets records, and exclude all marked TEST, LEGACY or DUPLICATE.
4. Store external CRM IDs as associations, not interchangeable primary keys.
5. Use an idempotent event envelope (receipt ID + state transition + version) in existing `integration_events` patterns. Retry with bounded backoff and reconciliation. Never overwrite user-entered CRM context.

## Evidentiary gate

Public web text is only `OBSERVED`; visible functionality/visual QA has to be checked separately. Commercial consequences are `HYPOTHESIS` and arithmetic from synthetic inputs is `MODELLED`. Financial outputs must read 'hypothetical gross booking value', never 'lost income' or ROI. A stale or corrected source invalidates or withdraws the receipt.

## Release and acceptance gates

1. Run route-tree generation, TypeScript, lint and build on PR preview; verify mobile/desktop visual output, accessibility and reduced motion.
2. Validate existing form/checkout/login flows, no changes to RLS, auth, Stripe or reporting application.
3. Review specific HubSpot company field changes with their IDs, current and proposed values before writing.
4. Review Supabase schema/RLS changes and approved migration separately. Verify service-only access and anon/authenticated denial.
5. Complete manual source capture, permission assessment under PECR/UK GDPR and content sign-off for every outbound receipt.
6. Obtain release approval before merge and production deployment; use Vercel protected preview for signoff. After deployment verify 200 + canonical + metadata, functioning audit CTA and no individual prospect data exposure.

## Current test cohort

First ten internal source-researched draft PDFs live outside GitHub. Candidate IDs and known HubSpot company IDs are available in the private receipt register. No sending, live CRM mutations or user-facing personalised pages are implied by this PR.

## Rollback

Revert this PR's route (or the deployment). Preserve research evidence and historical receipt IDs; never delete or reclassify real correspondence. No production migrations are part of this branch.
