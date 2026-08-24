# INKCARE Implementation Checklist

Last verified: 26 July 2026

Use this checklist to reproduce the existing INKCARE implementation for another studio without changing the product scope.

## A. Engagement control

- [ ] Confirm the agreed INKCARE offer, scope, exclusions, timeline and price.
- [ ] Record the studio's legal/trading name and approved contacts.
- [ ] Confirm which systems the studio already uses.
- [ ] Obtain written authority for each account connection or change.
- [ ] Create a client implementation record and internal task list.
- [ ] Mark all pre-client demonstrations as sample data.

## B. Access and security

- [ ] Create a client-specific access inventory.
- [ ] Use role-based access rather than shared personal passwords where possible.
- [ ] Store secrets only in approved secret stores.
- [ ] Confirm no secret appears in GitHub, manuals, screenshots or workflow exports.
- [ ] Confirm Supabase RLS and backend service-role policies.
- [ ] Confirm public endpoints use signature, token or rate-limit controls.
- [ ] Record access owner, purpose, date granted and revocation procedure.

## C. GitHub and deployment

- [ ] Create or identify the correct repository and production branch.
- [ ] Configure required environment variables through the deployment platform.
- [ ] Confirm the CI workflow installs dependencies, lints and builds.
- [ ] Confirm canonical domain, redirects, robots and sitemap behaviour.
- [ ] Deploy the latest approved commit.
- [ ] Record the production commit SHA.
- [ ] Complete a live smoke test without submitting real customer data.

## D. Supabase

- [ ] Apply the approved migrations in order.
- [ ] Confirm required tables, indexes, functions and views exist.
- [ ] Confirm Edge Functions are deployed with the expected JWT/custom-auth setting.
- [ ] Confirm RLS is enabled on private tables.
- [ ] Confirm service-role access is available to backend workers only.
- [ ] Confirm test tables are isolated from production metrics.
- [ ] Run `run_inkcare_validation_suite(null)` and retain the run ID.

## E. Stripe

- [ ] Verify the correct Stripe account and currency.
- [ ] Confirm the approved products, prices and payment links.
- [ ] Confirm webhook destinations and signing secrets.
- [ ] Run a synthetic/test-mode checkout and webhook cycle.
- [ ] Confirm minimal event evidence enters the test ledger.
- [ ] Confirm the test client and onboarding artifact are created.
- [ ] Confirm the reconciliation run reports zero mismatches and errors.
- [ ] Archive redundant prices only after confirming they are unused.

## F. Onboarding and delivery

- [ ] Generate a time-limited onboarding token.
- [ ] Confirm the onboarding page loads with HTTP 200.
- [ ] Submit sample studio details.
- [ ] Confirm only the isolated sample record is updated.
- [ ] Confirm the delivery log contains the expected artifact state.
- [ ] Expire or rotate the sample token after validation.
- [ ] Repeat using studio-specific test data before launch.

## G. HubSpot

- [ ] Verify the correct HubSpot account and owner.
- [ ] Confirm contact, company and deal permissions.
- [ ] Confirm the agreed fields and pipeline stages.
- [ ] Create sample records labelled clearly as tests.
- [ ] Confirm deduplication and identifier mapping.
- [ ] Confirm lead capture and follow-up behaviour.
- [ ] Remove sample CRM records before production handover where appropriate.
- [ ] Document any HubSpot actions that require manual configuration.

## H. Meta and tracking

- [ ] Inventory the correct business portfolio, Page, Instagram account, dataset/pixel and ad account.
- [ ] Confirm ownership and administrator access.
- [ ] Confirm the website pixel ID matches the selected Meta dataset.
- [ ] Confirm the live website loads the approved tracking code.
- [ ] Test page-view and agreed conversion events.
- [ ] Record any fragmented or duplicate assets for manual consolidation.
- [ ] Do not add another pixel to bypass a verification problem.

## I. Social publishing migration

- [ ] Confirm social accounts are recorded in Supabase.
- [ ] Confirm queue records are `awaiting_approval`.
- [ ] Confirm `DRY_RUN=true`.
- [ ] Confirm n8n remains enabled during parallel validation.
- [ ] Confirm dry-run evidence covers both platforms.
- [ ] Add public media URLs only to the single controlled test item.
- [ ] Approve one controlled test item explicitly.
- [ ] Run with `dry_run=false` and limit one only after approval.
- [ ] Capture both Instagram and Facebook post IDs.
- [ ] Reconcile results before disabling n8n.
- [ ] Keep a tested rollback route.

## J. SEO

- [ ] Confirm canonical domain and sitemap.
- [ ] Confirm search-monitoring project and target keywords.
- [ ] Connect the correct Google Search Console property.
- [ ] Verify indexing and query data availability.
- [ ] Separate sample reporting from measured studio results.

## K. Command Centre

- [ ] Confirm the private control token is active.
- [ ] Confirm an unauthorised request returns HTTP 401.
- [ ] Confirm authorised data includes connector health, metrics, syncs, mappings and alerts.
- [ ] Confirm sample data is labelled.
- [ ] Confirm resolved alerts no longer appear as active failures.
- [ ] Trigger and inspect a validation run.
- [ ] Confirm task and approval mutations create audit entries.

## L. Acceptance and handover

- [ ] Run the full validation suite.
- [ ] Complete the studio-specific smoke test.
- [ ] Record known limitations and manual dependencies.
- [ ] Produce an operator runbook.
- [ ] Produce a studio-owner guide using non-technical language.
- [ ] Produce a staff walkthrough for any process they must perform.
- [ ] Record support owner and response route.
- [ ] Record backup, rollback and access-revocation steps.
- [ ] Obtain client acceptance of the agreed scope.

## Completion rule

The implementation is complete only when every in-scope checklist item is either:

- completed and evidenced;
- explicitly not applicable; or
- accepted as a documented limitation by the authorised owner.

A connected account, empty dashboard or successful login alone does not count as implementation completion.