# INKSIGHTS Sandbox v1

A separate, zero-cost, local-first test environment for INKSIGHTS.

It exists to test the INKSIGHTS operating model end-to-end without touching real studios, production payments, production CRM, production email, the canonical INKSIGHTS Supabase project, or any other live system.

## Safe default

- App environment: sandbox only
- Studios: synthetic fixtures only
- Database: Node.js built-in SQLite
- Payments: simulator only
- CRM: simulator only
- Email: captured local outbox only
- Reports: local HTML with a synthetic watermark
- Connectors: off by default
- External side effects: none

No npm packages, paid services, API keys or cloud accounts are required.

## Core INKSIGHTS workflow

Provider Observation → Normalised Data → Metric → Evidence → Finding → Diagnosis → Opportunity → Recommendation → Intervention → Outcome → Attribution → Learning

The sandbox supports:

- Studio discovery and qualification simulation
- 100-point ICP scoring
- Studio Growth Check
- Studio Intelligence Audit
- KPI calculations
- Evidence lineage
- Findings and diagnosis
- Opportunity and recommendation generation
- Intervention and outcome simulation
- Attribution and learning
- Synthetic report generation
- CRM handoff simulation
- Connector readiness
- Failure scenarios
- Idempotency testing
- Local email outbox
- Safety test panel

## Run locally

Requires Node.js 24 or later.

~~~bash
cd sandbox/inksights-sandbox
npm test
npm run check
npm start
~~~

Open http://127.0.0.1:4173

## Useful commands

~~~bash
npm test
npm run check
npm run check:phase2
npm run cycle -- happy_path
npm run cycle -- incomplete_evidence
npm run cycle -- low_icp_fit
npm run cycle -- failed_payment
npm run cycle -- connector_unavailable
npm run cycle -- duplicate_event
npm run cycle -- report_generation_failure
npm run cycle -- cancelled_at_renewal
npm run cycle -- attribution_inconclusive
npm run sample
npm run reset
npm start
~~~

## Synthetic fixture studios

- Northstar Tattoo Studio — Manchester — 5 artists
- Blackline Collective — Bristol — 4 artists
- Lantern Tattoo Rooms — Birmingham — 7 artists
- Example Studio London — London — 6 artists

All contact addresses use reserved example domains. No real studios are included.

## Safety boundary

The application refuses to start unless APP_ENV=sandbox.

It also blocks:

- Stripe live keys and live-mode events
- The canonical INKSIGHTS production Supabase project ID ukaxsqwnkoqbbsufpzga
- Hosted supabase.co database endpoints
- Non-test HubSpot connector modes
- Non-reserved contact email domains
- Connector actions when synthetic validation fails

Email is never delivered. It is captured in the local email_outbox table.

Reports are watermarked:

SYNTHETIC SANDBOX — NOT FOR CLIENT USE

## Optional Phase 2 test configuration

Copy .env.example to .env.sandbox and enable only explicitly isolated test connectors.

This package does not currently send external requests. Phase 2 values are readiness-checked only.

The intended future connector boundary is:

- Stripe: test mode only
- HubSpot: developer test portal only
- Supabase: local CLI only
- n8n: local instance only
- Email: captured outbox only

## Production promotion rule

This package must never be promoted by changing APP_ENV.

Production adapters belong in separately reviewed code with explicit approval for credentials, consent, data retention, legal requirements, monitoring, rollback and the first real studio.

The canonical production application remains the repository root. This sandbox lives on an isolated feature branch until reviewed and intentionally moved to a separate sandbox repository or approved location.
