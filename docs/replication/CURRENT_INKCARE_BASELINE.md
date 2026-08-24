# Current INKCARE Baseline

Status date: 26 July 2026

## Executive position

The existing INKCARE implementation now has a repeatable technical validation path and isolated sample evidence. It is not yet proven with a real external studio and must not be represented as producing verified client results.

## Verified working

### Supabase

- Project is active in `eu-west-1`.
- Canonical operating tables exist.
- Command Centre metrics, connector health, sync runs, mappings and alerts exist.
- Six social tables have RLS enabled.
- Six matching service-role policies exist.
- Edge Functions are active.
- Validation suite is installed.

### Stripe and Supabase reconciliation

Latest verified reconciliation:

- Status: `success`
- Events evaluated: 6
- Customers represented: 2
- Subscriptions represented: 2
- Active customer/subscription mappings: 4
- Mismatches: 0
- Processing errors: 0

Resolved alerts:

- `stripe-orphaned-mappings`
- `stripe-reconciliation-missing`

Remaining Stripe limitation:

- Redundant price archival still requires a supported Stripe write action and confirmation that the price is unused.

### Isolated sample journey

The synthetic test journey has been completed without a real studio:

1. Synthetic Stripe checkout event exists in the test ledger.
2. A test-active sample client exists.
3. A fresh time-limited onboarding link returned HTTP 200.
4. Sample form submission returned HTTP 200 and a test-mode success response.
5. The isolated client changed to `onboarding_status=completed`.
6. A ready test delivery artifact exists.

No real payment or external studio data was used.

### Social migration

- Two connected social-account records exist.
- Five queue items exist.
- All remain `awaiting_approval`.
- `DRY_RUN=true`.
- n8n remains enabled.
- Ten dry-run publication validations exist: five Instagram and five Facebook.
- Zero live publication attempts exist.
- No external post IDs exist.

### Command Centre

Edge Function `inkcare-command-centre` version 3 now returns:

- studios and revenue records;
- tasks and approvals;
- integrations and audit activity;
- connector health;
- metrics;
- sync runs;
- entity mappings;
- active/resolved alerts;
- isolated test evidence;
- social migration state;
- clear sample/unverified data classification.

It also supports an authorised `run_validation` action.

### GitHub

- Private repository is connected.
- Main branch is active.
- CI performs dependency installation, linting and production build.
- Replication and implementation manuals now exist under `docs/replication/`.

## Latest validation result

Run ID: `6ca48020-cf17-4f82-a4ee-d941e171e743`

- Passed: 11
- Failed: 0
- Pass rate: 100%
- Connector warnings/limitations: 6

Checks passed:

1. Social RLS
2. Social service-role policies
3. Stripe reconciliation
4. Stripe entity mappings
5. Isolated Stripe/onboarding sample
6. Test delivery artifact
7. Social migration safety
8. Social approval gate
9. Social dry-run evidence
10. Command Centre sample data
11. Connector registry

## Working with limitations

### HubSpot

- Account and credentials work.
- Correct Meta Pixel is recorded.
- CRM operating data remains limited.
- Custom pipeline/property configuration and a full sample lead/deal workflow still require completion and validation.

### Meta

- Facebook and Instagram account records are connected.
- Pixel ID matches the website source configuration.
- Asset ownership/portfolio structure remains fragmented.
- Live browser event receipt and conversion-event verification remain incomplete.
- Live social publishing is deliberately not authorised.

### n8n

- Connected and used during migration.
- Stored telemetry reports 13 successful and 2 failed executions from the previous snapshot.
- Exact failed executions still need inspection through the n8n plugin.

### SE Ranking

- Project is connected and monitored.
- This does not replace Google Search Console data.

## Not working or blocked

### Google Search Console

- No connected property is available to the current connector.
- Search clicks, impressions, indexed-page evidence and query data are unavailable to the Command Centre.

### Ads Manager connector

- No ad account is accessible through the connected Ads Manager tool.
- HubSpot showing a Meta ad-account association does not provide operational access through this connector.

### Live deployment verification

- Repository changes and live-domain deployment must be reconciled after every release.
- Recent SEO work previously identified live/source mismatch and 404 URLs. Production deployment and smoke testing remain required.

## Data warning

Current studio, revenue and task records include sample or internal QA information. There are zero verified external client studios in the Command Centre baseline.

These records may be used to:

- demonstrate the interface;
- test calculations;
- test approvals and tasks;
- test reports and workflows.

They may not be used as:

- testimonials;
- case studies;
- verified revenue uplift;
- evidence of external customer adoption.

## Next completion sequence

1. Verify the updated Command Centre through its authenticated UI.
2. Reconcile the live website deployment with the latest main-branch commit.
3. Complete a labelled sample contact/company/deal flow in HubSpot, then remove or archive the test records.
4. Inspect the two n8n failure executions and document the cause and correction.
5. Complete Meta browser-event verification without creating duplicate pixels or datasets.
6. Connect Google Search Console through the user-managed plugin flow.
7. Add media assets to one social queue item while keeping it unapproved and dry-run.
8. Run a controlled single-item live social test only after explicit approval.
9. Re-run the validation suite and record the new run ID.
10. Produce a release/acceptance report listing completed, limited and blocked items.

## Definition of safe pre-client readiness

INKCARE is safe for a controlled real-studio pilot when:

- the technical validation suite still passes;
- the live deployment matches the repository;
- the exact in-scope customer journey has passed with sample data;
- all client-facing communications and actions have approval gates;
- limitations are written into the scope and handover;
- rollback and support ownership are known;
- no sample data is presented as proof.