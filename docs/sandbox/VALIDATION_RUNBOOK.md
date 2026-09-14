# INKSIGHTS Sandbox Validation Runbook

## Objective

Prove the current INKSIGHTS growth-intelligence implementation against isolated synthetic businesses before using equivalent logic as evidence for a real studio.

## Preconditions

- The canonical Supabase project is healthy.
- The `sandbox` schema exists.
- Execution uses operator/service-role access.
- `anon` and `authenticated` roles have no privileges on `sandbox`.
- Synthetic fixtures contain no real customer/contact/payment data.
- The public Growth Playbook catalog is available for read-only matching.

## Standard validation command

Run as an authorised database operator:

```sql
select sandbox.run_validation_suite();
```

The function:

1. snapshots counts in the production intelligence lifecycle tables;
2. executes every active synthetic fixture;
3. derives baseline/modelled revenue and growth-lever opportunities;
4. diagnoses the primary lever;
5. maps the fixture to an active canonical Growth Playbook;
6. calculates a versioned opportunity score;
7. creates an isolated recommendation, approved decision and completed intervention;
8. records a modelled outcome, attribution and learning object;
9. validates known expected outputs;
10. snapshots production intelligence counts again;
11. fails the isolation check if production counts changed;
12. stores durable validation-run and validation-result evidence.

## Required checks

For every fixture:

- baseline revenue matches the deterministic expected value;
- primary lever matches the fixture contract;
- selected playbook matches the fixture contract;
- opportunity score is bounded from 0 to 100;
- recommendation status is `proposed`;
- decision status is `approved`;
- intervention status is `completed`;
- outcome classification is `modelled`;
- attribution method is `modelled`;
- learning classification is `synthetic_validation`.

Global checks:

- at least ten active fixtures exist;
- production intelligence row counts are unchanged by the suite.

## Acceptance criteria

A validation cycle is accepted only when:

- `status = success`;
- `failed = 0`;
- all fixtures execute;
- production-write isolation passes;
- the run ID is retained with the release/PR evidence.

Current verified baseline at creation:

```text
run_id: 3da0e123-bc77-47f4-b0a4-b131bf0f7b41
fixtures: 10
passed: 42
failed: 0
status: success
```

## Inspect a failed run

```sql
select *
from sandbox.validation_results
where run_id = '<run-id>'
  and passed = false
order by fixture_key, check_name;
```

Do not weaken expected fixture outputs simply to restore green status. A failure indicates one of:

- intentional engine behavior changed and the contract needs an explicit version change;
- a regression was introduced;
- the Growth Playbook catalog no longer satisfies a deterministic mapping;
- isolation was broken.

## Inspect one fixture

```sql
select sandbox.run_fixture('low_conversion');
```

Use this to inspect the scenario, diagnostic, opportunity score, playbook, recommendation, decision, intervention, outcome, attribution and learning payload for a single archetype.

## Adding a fixture

A new fixture must include:

- a synthetic `fixture_key`;
- a descriptive synthetic name;
- canonical input JSON;
- expected `primary_lever`;
- expected `playbook_key`;
- deterministic expected baseline revenue.

After inserting it, rerun the complete suite. Do not accept the new fixture if it relies on real customer identifiers or changes production intelligence row counts.

## Rollback

If a sandbox migration causes a regression:

1. stop using the failing validation result as release evidence;
2. preserve the run and failure records for diagnosis;
3. revert the application/database change that altered behavior;
4. rerun the suite;
5. accept the rollback only when failures return to zero and production-write isolation passes.

Do not solve a sandbox failure by granting browser roles access to the sandbox or by writing synthetic rows into public production intelligence tables.

## Evidence retention

For each promoted release retain:

- validation run ID;
- pass/fail totals;
- fixture count;
- production row-count isolation result;
- Git commit / PR reference;
- CI result;
- any deliberately unresolved platform-managed security advisory.

Sandbox/modelled evidence must always remain distinct from verified external client evidence.
