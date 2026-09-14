# INKSIGHTS Sandbox

## Purpose

The INKSIGHTS sandbox is the deterministic validation environment for the growth-intelligence IP. It proves the canonical loop with synthetic businesses before equivalent logic is trusted with real studio data.

Canonical loop:

`Inputs -> KPIs -> Three-Lever Diagnostic -> Opportunity -> Score -> Growth Playbook -> Recommendation -> Decision -> Intervention -> Outcome -> Attribution -> Learning`

The three commercial levers are:

1. customers;
2. purchase frequency;
3. average transaction value.

## Isolation model

A separate billable Supabase branch was deliberately not created because the project is operating under a free-tier constraint. The canonical Supabase branch price observed during implementation was `$0.01344/hour`.

Instead, validation state is isolated in a dedicated PostgreSQL `sandbox` schema inside the existing project.

Safety properties:

- `anon` has no access to the schema, tables, sequences or functions;
- `authenticated` has no access to the schema, tables, sequences or functions;
- only `service_role`/operator execution may access sandbox objects;
- synthetic execution writes only to `sandbox.*` tables;
- validation functions may read the canonical public Growth Playbook catalog but do not write synthetic rows to public intelligence tables;
- every validation run snapshots production intelligence row counts before and after execution and fails the isolation check if those counts change;
- fixtures contain no real client names, contact details, payment details or external identifiers.

The sandbox schema is not included in the application browser client and should not be added to Supabase exposed schemas.

## Core objects

- `sandbox.business_fixtures`: deterministic synthetic business inputs and expected outputs.
- `sandbox.simulations`: isolated recommendation-to-learning execution evidence.
- `sandbox.validation_runs`: durable validation-run summary records.
- `sandbox.validation_results`: per-fixture/per-check pass/fail evidence.
- `sandbox.calculate_growth_scenario(jsonb)`: canonical Customers x Frequency x ATV scenario model with capacity, cancellation, no-show and margin constraints.
- `sandbox.diagnose_three_levers(jsonb)`: three-lever diagnostic.
- `sandbox.select_playbook(jsonb, jsonb)`: deterministic playbook mapping.
- `sandbox.score_opportunity(jsonb, text)`: versioned opportunity scoring compatible with `growth-opportunity-v1`.
- `sandbox.run_fixture(text)`: executes the complete isolated lifecycle for one fixture.
- `sandbox.run_validation_suite()`: executes all active fixtures and writes durable evidence.

## Deterministic fixtures

The first suite contains ten synthetic archetypes:

| Fixture | Primary condition | Expected playbook |
| --- | --- | --- |
| `healthy_control` | healthy economics with modest customer upside | `referral_engine` |
| `low_conversion` | high lead volume, weak conversion | `lead_followup_sequence` |
| `low_customers` | customer volume constraint | `local_visibility_capture` |
| `low_frequency` | weak repeat/purchase frequency | `next_booking_at_checkout` |
| `low_atv` | low average transaction value | `package_bundling` |
| `capacity_constrained` | demand growth blocked by capacity | `minimum_booking_value` |
| `high_cancellations` | cancellation leakage | `cancellation_backfill` |
| `high_no_shows` | no-show leakage | `no_show_prevention` |
| `low_margin` | weak margin/pricing economics | `price_floor_review` |
| `compound_growth` | balanced three-lever improvement | `local_visibility_capture` |

## Current verified baseline

Validation run:

`3da0e123-bc77-47f4-b0a4-b131bf0f7b41`

Result at the time of implementation:

- fixtures: 10;
- checks passed: 42;
- checks failed: 0;
- status: `success`;
- production intelligence row counts before and after: identical.

This validation proves deterministic technical behavior and isolation. It does **not** prove client outcomes, market adoption or realised revenue uplift.

## Evidence classification

Sandbox results are `synthetic_test` / `modelled` evidence only. They may be used to:

- regression-test formulas;
- validate playbook mapping;
- demonstrate workflow mechanics internally;
- QA recommendation/result tracking;
- document the INKSIGHTS methodology and IP.

They may not be represented as:

- verified client results;
- case-study revenue;
- testimonials;
- real market benchmarks;
- evidence that a recommendation will produce the same result for an external studio.
