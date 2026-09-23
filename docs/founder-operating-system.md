# INKSIGHTS Founder Operating System

## Purpose

The Founder Operating System is the Chief-of-Staff layer for INKSIGHTS. It converts canonical commercial, operational and technical state into one company outcome, three weekly priorities, a constrained execution queue, explicit risks and evidence-backed decisions.

It does not replace any underlying system of record.

## Canonical system boundaries

| System | Responsibility |
| --- | --- |
| Supabase | Machine-readable operating state, product data and intelligence registries. |
| HubSpot | Companies, contacts, qualified opportunities, customers and sales activity. |
| Stripe | Payment, billing and settled revenue truth. |
| GitHub | Source code, migrations, technical specifications and change history. |
| Google Drive | Approved SOPs, reports, templates, evidence assets and packaged business knowledge. |
| Notion | Founder-facing operating interface and planning projection only. |
| ChatGPT / AI agents | Reasoning, synthesis, classification, QA and controlled orchestration. |
| Slack | Optional future notification surface; never canonical storage. |

## Operating cadence

### Daily

Choose one company-level outcome. Pull only the actions required to achieve it.

### Weekly

Review in this order:

1. Cash
2. Revenue
3. Pipeline
4. Customers
5. Delivery
6. Product
7. Systems
8. Risks
9. New ideas

Select exactly three active priorities. Each priority must have an owner, deadline, success criteria, risk summary and next action.

## Execution contract

Every executable item resolves to:

`Outcome → Owner → Deadline → Next Action → Evidence of Completion`

Work is complete only when the defined evidence exists in the correct canonical system.

## Operating schema

The founder layer extends the existing `ops_*` registry with:

- `ops_operating_cycles` — daily/weekly/monthly/quarterly operating cycles.
- `ops_priorities` — ranked execution priorities.
- `ops_risks` — likelihood × impact risk register.
- `ops_metric_definitions` — canonical founder KPI dictionary.
- `ops_metric_snapshots` — evidence-classified KPI observations.
- `ops_evidence` — company evidence registry.
- `ops_actions` — owner/deadline execution queue.
- `ops_ideas` — deliberately parked ideas.
- `ops_current_founder_brief` — service-role-only projection of the active weekly founder brief.

The existing `ops_decisions` table remains the canonical decision log.

All founder operating tables are RLS-enabled and restricted to service-role access. They are not public application tables.

## Evidence classes

- **VERIFIED** — confirmed against the authoritative source.
- **OBSERVED** — directly observed source state.
- **CALCULATED** — deterministic result from defined inputs.
- **MODELLED** — result based on explicit model assumptions.
- **HYPOTHESIS** — proposition requiring validation.

Unknown or dirty metrics remain unmeasured. They must not be coerced to zero.

## Founder command workflows

The command names are agent-facing operating triggers registered in `ops_workflows`. They are not application UI slash commands unless a future interface explicitly implements a parser.

| Command | Workflow |
| --- | --- |
| `/weekly` | Refresh evidence and generate the founder brief with exactly three priorities. |
| `/validate` | Pressure-test an idea and design the fastest evidence-producing validation test. |
| `/model` | Review customer segments, value proposition, channels, economics, moat and risk. |
| `/customer` | Extract pains, exact customer language, buying triggers and objections. |
| `/position` | Produce specific, differentiated, outcome-focused positioning. |
| `/metrics` | Refresh/inspect KPI snapshots, anomalies and interventions. |
| `/cash` | Review collected cash, runway inputs, scenarios and spending flags. |
| `/prepare` | Prepare a meeting brief, likely questions, objections and questions to ask. |
| `/prioritise` | Score work by customer impact, revenue, strategy, confidence, effort and urgency. |
| `/decide` | Create a decision memo and register the approved decision. |
| `/pipeline` | Inspect INKSIGHTS CRM pipeline, stalled opportunities and follow-ups. |
| `/evidence` | Classify evidence and expose unsupported claims or gaps. |
| `/system` | Audit architecture, integrations, manual handoffs and automation opportunities. |
| `/launch` | Compare current state with the next commercial milestone and produce the critical path. |

## Primary founder KPIs

The current primary KPI dictionary is:

- Cash collected.
- Qualified pipeline.
- Sales win rate.
- Repeat / ongoing client rate.
- Runway.

New paying studios is tracked as a supporting growth metric.

Each KPI must have one definition, one source-system boundary and one calculation rule. A KPI with missing or invalid inputs is reported as unmeasured.

## Current implementation notes

The initial operating cycle was seeded from live source observations, not estimates. At implementation time:

- Stripe had no settled live INKSIGHTS PaymentIntents.
- The visible £395 checkout sessions were unpaid; one was explicitly QA-only.
- HubSpot exposed only the existing tattoo-style Sales Pipeline stages, so qualified-pipeline and win-rate metrics were intentionally left unmeasured.
- Runway was left unmeasured because canonical business cash-balance and net-burn inputs were not connected.
- Supabase security advisor continued to flag `public.spatial_ref_sys` with RLS disabled; this is tracked as SEC-002 and must be remediated only after the intended PostGIS access model is confirmed.

## Change governance

Database changes use the normal repository flow:

```text
feature branch
  ↓
review / QA
  ↓
pull request
  ↓
merge to main
  ↓
production remains reproducible from repository history
```

Production-only schema changes create drift and must be reconciled into GitHub immediately.

Security changes must not be auto-fixed when the required access model is unclear. Record the risk, define the intended access, make the change through a reviewable migration and verify it after application.
