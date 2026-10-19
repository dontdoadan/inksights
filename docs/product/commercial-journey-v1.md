# INKSIGHTS Commercial Journey — implementation contract v1

**Effective proposal:** 20 October 2026  
**Authority:** [commercial-source-of-truth.md](../commercial-source-of-truth.md) + SPEC-001  
**Implementation branch:** `feat/commercial-journey-2026-10-20`  
**Status:** Build/QA candidate. Not commercial acceptance until the checks below pass.

## Intent

One studio identity and evidence record moves through **Detect → Prove (conditional) → Diagnose → Improve → Monitor**. Each stage must produce: (a) an honest result, (b) a remaining evidence-backed opportunity or explicit no-action recommendation, and (c) the most appropriate next service. Never force sequential upsells. Where evidence is insufficient, recommend measurement or no purchase.

## Offer register

| Offer key | Customer-facing offer | Price | Activation / sale rule | Scope |
|---|---|---:|---|---|
| `studio-growth-check` | Studio Growth Check | Free | Active | Form-led modelled first-pass commercial diagnostic; store consent and input provenance |
| `72-hour-visibility-fix` | 72-Hour Studio Visibility Fix | £249 once | **Scope-confirmed enquiry; checkout gated** | Up to three approved public-facing corrections under studio-controlled access |
| `studio-intelligence-audit` | Studio Intelligence Audit | £395 once (founding-validation rate) | Existing verified Stripe audit checkout | Evidence-based commercial diagnosis, top opportunities and 90-day plan |
| `primary-constraint-programme` | Primary Constraint Programme | Scoped quote | Sales-assisted after approved diagnosis | One measurable intervention, baseline, milestones and Outcome Review |
| `visibility-watch` | Visibility Watch pilot | £99/month **indicative** | **Deferred / pilot enquiry only** | Visibility snapshots, material change alerts and prioritised next actions |
| `inksights-watch` | Broader Commercial Watch | TBC | Deferred | Wider commercial monitoring with first-party booking/economic inputs |

Legacy revenue audit, Booking & Retention Engine and older founding package pages are not independent currently-approved open-checkout products. Retain their historical routes for safe transition and customer history; do not treat legacy prices as new commercial authority. Outcome Review is a component of scoped implementation, not a separate checkout.

## Offer 1 — Detect: Studio Growth Check

**Inputs:** studio + decision maker, location, size (3+), website, monthly revenue, enquiries, bookings, transaction value, available/booked hours, repeat/cancellation/no-show rates; mandatory service consent, separate optional marketing consent.  
**Outputs:** source-backed diagnostic reference IDs, four explicitly **modelled** scenarios, one leading first-pass estimate (not the sum of overlapping scenarios), uncertainty notice and a recommended next route.  
**Routing:** a previously completed *self-reported* Visibility Scorecard with a relevant low-scoring public-facing dimension may be invited to qualify for the limited Fix. Without that context, recommend full Intelligence Audit (or no further purchase when unqualified). The free economic model alone must **never** declare a verified local visibility problem.  
**Acceptance:** records created once per submit in Supabase; HubSpot sync matched to the same studio/contact; contact enquiries carry original IDs; consent captured; duplicate and retry paths tested; fake/test fixtures never sync to live CRM.

## Offer 2 — Prove: 72-Hour Studio Visibility Fix

**Promise:** a completed, agreed *work package* within three working days **after** payment, complete intake, site/profile permissions and named approval. It does not promise improved rankings, booked appointments, enquiries or revenue in 72 hours.

**Eligibility gate (must pass):**
1. A public-facing visibility, trust, or booking-route defect is demonstrated by a dated observation, not a model alone.
2. Corrective authority and required access are available; no irreversible external change proceeds without approval.
3. At most three corrections fit the time budget and do not require a site rebuild, domain transfer, advertising campaign or CRM migration.
4. Before/after evidence can be captured, with an accountable owner and approved completion checklist.

**Fixed deliverables:** (i) baseline screenshots/links and defect register, (ii) one-page agreed scope and exclusions, (iii) up to three corrections, (iv) change log with evidence and remaining issues, (v) a 14–30 day follow-up observation where the signal is measurable, and (vi) stop/monitor/audit recommendation. If blocked by a third party, record blocked state rather than misrepresent completion; handle change order/refund under approved terms.

**Time budget to validate:** target no more than 3 total operator hours before fixed public checkout is considered. Track gross delivery hours, external costs, rework, approval lead time, and support requests per order. £249 is **not** financially validated yet.

## Offer 3 — Diagnose: Studio Intelligence Audit

**Entry:** directly from Growth Check or from a completed Fix; do not force the Fix.  
**Ingestion:** reuse Growth Check `lead_id` and `audit_id` plus recorded site/visibility observations; avoid a second copy of studio identity.  
**Deliverable:** approved evidence-linked commercial report, differentiated baseline, primary constraint, prioritised opportunities and 90-day implementation/measurement plan.  
**Billing:** payment must resolve to the purchased Stripe price; the signed webhook and authoritative order state—not a browser redirect—determine fulfilment. Existing founding-studio waiver is a separate authorised path.  
**Margin constraint:** measure delivery minutes; £395 remains a founding-validation rate, not a permanent anchor.

## Offer 4 — Improve: Primary Constraint Programme

**Entry gate:** approved diagnosis, measurable baseline, right to implement, agreed capacity and financially sensible scope.  
**Statement of work:** one primary intervention, implementation owner, dependencies, delivery milestones, success metric, guardrails, measurement window, fee, excluded work, approval and escalation.  
**End state:** operational change verified, Outcome Review records observed metric movement vs baseline, evidence quality, confounders and attributable contribution if defensible. Otherwise explicitly state 'insufficient evidence'; no invented ROI or guaranteed growth.  
**Reusable modules:** the 27 `intelligence_playbooks` remain a **capability library**, not 27 product SKUs. Select the least disruptive eligible playbook for the verified constraint.

## Offer 5 — Monitor: Watch

**Pilot only until validated:** baseline snapshot, weekly or agreed periodic data collection, materiality thresholds with sources/timestamps, alert triage, monthly concise decision report and clear stop/maintain/next-intervention recommendation.  
**Visibility Watch** covers public search/profile/website/reputation observations; no broad revenue attribution without first-party data. **Commercial Watch** would require consented revenue/booking inputs and independent economic pricing.  
**Service boundaries:** no automatic GBP edits, review manipulation, live customer messaging, public ranking guarantees or unlimited implementation.  
**Release gate:** prove at least two real scheduled snapshots, a no-change silent run, a material-change action, permission and isolation checks, delivery time budget, cancellation terms, billing/webhook renewal lifecycle and small-pilot retention evidence. Do **not** switch on live recurring billing solely because a £99 legacy HubSpot item exists.

## Canonical data and automation

- **Supabase:** canonical `studios` identity and source observations; `revenue_audit_leads` + `revenue_audits` free assessment; `intelligence_*` findings, decisions, interventions, outcomes; `orders` Stripe projection; `integration_events` event/trace; `website_events` anonymous funnel attribution.
- **HubSpot:** person/company → qualified opportunity → paying client lifecycle. No parallel CRM in Supabase.
- **Stripe:** billing and payment truth; order creation only from signed webhooks; browser-side success is visual acknowledgement after server verification, not a fulfilment trigger.
- **Vercel/GitHub:** site code, QA, protected preview, reviewed deployment.
- **Google Drive:** client-approved SOPs, offer terms, scope template and operator checklists.

### Commercial funnel instrumentation

Use durable event keys `growth_check_started`, `diagnostic_completed`, `cta_clicked`, `contact_submitted`, `checkout_started`, `payment_completed`, `fix_completed`, `audit_delivered`, `programme_started`, `programme_reviewed`, `watch_activated`, `watch_cancelled`. An event must contain offer key, stage, opaque correlation IDs and timestamp; never include names, email addresses, revenue inputs or sensitive profile content in anonymous telemetry.

Operator report: cohort-based conversion rates (completed checks → accepted fixes → paid audits → implemented programmes → paying Watch), mean gross margin by offer, handoff latency, manual hours, 30/90-day retention, churn, sources and reasons for not qualified. Distinguish raw attribution from causal uplift.

## Release controls and tests

1. **Build:** site lint, build, generated route tree unchanged, TypeScript and tests.
2. **Public routes:** free check; scorecard→check context; modelled-only result; direct audit; qualified Fix enquiry; direct Watch enquiry; legacy URLs safe.
3. **CRM/data:** no lost reference; no duplicate on retries; no consent confusion; sensitive data stored only in authorised locations.
4. **Stripe:** test completed/failed/refunded/cancelled, correct-price, wrong-price, mismatched session, webhook retry and idempotency in sandbox or isolated safe fixture; reconcile with HubSpot and Supabase. **No live customer charge for QA.**
5. **Reporting:** accepted audit → immutable reviewed report → correct named client permissions, cross-studio denial, PDF same facts.
6. **Intervention:** verified baseline → approved corrective action → completion proof → Outcome Review/attribution caveats.
7. **Watch:** permissioned pilot with two observation windows, alerts, no-change silence, statement/consent/cancellation and unit-economics proof.
8. **Production:** source, Vercel READY, successful real route smoke tests, no leaks, monitored errors and rollback runbook.

**Do not mark stages 2–5 live or end-to-end accepted based only on passing frontend build and preview.**
