# INKCARE System Architecture

Last verified: 26 July 2026

## 1. Purpose of the system

The existing INKCARE system is an operator-managed platform for acquiring, onboarding, servicing, monitoring and reporting studio engagements. It combines client-facing pages with private operational controls.

It is not currently a self-service SaaS product and must not be described as one.

## 2. Components and responsibilities

### Website and application

**System:** GitHub repository `inkcaregroup-cpu/inkcare`

Responsibilities:

- Explain INKCARE offers.
- Capture website and funnel events.
- Provide public intake and onboarding experiences.
- Host the private Command Centre interface.
- Load conversion tracking such as Meta Pixel.

### Supabase

**Role:** Canonical operational system of record.

Responsibilities:

- Store studios, leads, assessments, clients and delivery records.
- Store minimal Stripe event evidence and cross-system mappings.
- Store approvals, tasks, audit events, connector health, metrics, alerts and sync runs.
- Store isolated synthetic test records.
- Enforce Row Level Security.
- Run public, authenticated and webhook Edge Functions.

### Stripe

Responsibilities:

- Hold INKCARE products and prices.
- Collect payments and subscriptions.
- Send signed webhook events.
- Provide customer and subscription identifiers for reconciliation.

Supabase stores only minimal identifiers and status evidence. It does not store card details.

### HubSpot

Responsibilities:

- CRM contacts, companies and opportunities.
- Marketing and advertising integrations.
- Meta Pixel registration and lead-sync capabilities.

The account is connected but the active sales pipeline remains lightly populated. That is a data and operating-state limitation, not a connector failure.

### Meta and social publishing

Responsibilities:

- Facebook Page and Instagram professional-account publishing.
- Meta Pixel and conversion measurement.
- Social campaign execution and analytics.

Current migration state:

- Social accounts are recorded.
- Publishing queue is stored in Supabase.
- Ten platform dry-run validations exist.
- `DRY_RUN=true`.
- Queue items remain `awaiting_approval`.
- n8n remains enabled until a controlled live test returns both platform post IDs.

### n8n

Responsibilities:

- Legacy workflow orchestration during transition.
- Selected intake, persistence and social tasks.

n8n is not the canonical data store. Supabase is authoritative.

### SEO systems

Responsibilities:

- SE Ranking: monitored keywords, competitor and audit data.
- Google Search Console: Google-owned query, indexing and click data when connected.

Search Console is not currently providing a connected property.

### Command Centre

Responsibilities:

- Display studios, tasks, approvals and audit activity.
- Display connector health, sync runs, mappings, alerts and metrics.
- Show sample/test evidence separately from verified client data.
- Trigger authorised operational actions and validation runs.

The API requires the private `x-inkcare-control-token`; Supabase service credentials remain server-side.

## 3. Core data flows

### Payment and onboarding

1. Customer completes Stripe checkout.
2. Stripe sends a signed webhook.
3. Edge Function verifies the signature and event type.
4. Minimal event evidence is written to Supabase.
5. Client and Stripe identifiers are reconciled.
6. Onboarding invitation is created.
7. Onboarding form updates the client record.
8. Delivery activity is written to the delivery log.

### Social publishing

1. Content is placed in `social_content_queue`.
2. Human approval remains required.
3. Dry-run validation checks payloads and idempotency.
4. A controlled live test may publish one approved item only.
5. Both Instagram and Facebook post IDs must be captured.
6. n8n may be retired only after successful reconciliation and rollback review.

### Command Centre

1. Connected systems are audited.
2. Results enter connector health, sync-run, mapping, alert and metric tables.
3. The Command Centre API returns operational and QA evidence.
4. The UI clearly distinguishes sample/internal data from verified client data.

## 4. Environment separation

### Live operational records

Tables such as `growth_clients`, `growth_subscription_events`, `inkcare_studios` and command-centre tables contain operating data. Some current studio and revenue records are sample or internal and are therefore labelled as unverified in the Command Centre response.

### Isolated sample records

The following tables are used for synthetic payment/onboarding tests:

- `growth_test_subscription_events`
- `growth_test_clients`
- `growth_test_delivery_log`

They must never drive verified revenue, client-count or case-study claims.

## 5. Security model

- Service-role access is used for backend operations.
- Browser roles do not receive direct access to private social or Command Centre tables.
- Public Edge Functions apply signature, token, rate-limit or purpose-specific validation.
- Command Centre authentication is implemented using a hashed private control token.
- Audit events record sensitive control actions.

## 6. Definition of technically validated

The system is technically validated when the database validation suite reports:

- social RLS and policies present;
- Stripe reconciliation successful with zero mismatches;
- Stripe customer/subscription mappings present;
- isolated test checkout/onboarding evidence present;
- social migration safety settings preserved;
- zero unapproved or live social queue leakage;
- sufficient dry-run publication evidence;
- Command Centre sample data available and classified;
- connector registry present.

Technical validation does not prove commercial demand, client results or unattended production readiness.