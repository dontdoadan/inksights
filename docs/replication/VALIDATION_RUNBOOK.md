# INKCARE Validation Runbook

Last verified: 26 July 2026

## Objective

Prove the current INKCARE implementation with isolated sample data before exposing a real studio to any workflow.

## Current verified baseline

Validation run ID: `6ca48020-cf17-4f82-a4ee-d941e171e743`

Result:

- 11 checks passed.
- 0 checks failed.
- 100% technical validation pass rate.
- 6 connectors still carry warnings or external limitations.

This result proves the tested technical controls. It does not represent a real studio result.

## Preconditions

- Supabase project is active.
- Service-role access is available to the operator process.
- Social automation setting remains `dry_run=true`.
- n8n remains enabled during the parallel migration.
- Test functions and test tables remain separate from live client reporting.
- No real customer email address or payment details are used.

## Prepare a fresh sample onboarding cycle

Run the service-role-only helper:

```sql
select public.prepare_inkcare_sample_onboarding();
```

The helper:

- upserts one synthetic Stripe checkout event;
- resets the isolated sample client to `onboarding_status=invited`;
- generates a new random token and stores only its SHA-256 hash;
- sets a seven-day expiry;
- replaces the previous sample delivery artifact;
- returns the one-time test onboarding URL;
- writes an audit entry.

Use the returned URL only for the isolated test cycle. Do not send it to a studio and do not copy the plaintext token into GitHub, manuals, screenshots or support messages.

## Standard validation command

After completing the sample onboarding submission, run:

```sql
select public.run_inkcare_validation_suite(null);
```

The function writes a durable record to `command_centre_sync_runs` using:

- provider: `INKCARE QA`
- run type: `system_validation`

## Checks performed

### 1. Social-table RLS

Expected:

- Six private social tables have RLS enabled.

Failure action:

- Stop social automation.
- Inspect migrations and table policies.
- Do not disable RLS to restore convenience access.

### 2. Service-role social policies

Expected:

- Six `service_role_full_access` policies exist.

Failure action:

- Restore the missing backend policy.
- Confirm browser roles remain restricted.

### 3. Stripe reconciliation

Expected:

- Latest `subscription_reconcile` run is `success`.
- Mismatch count is zero.
- Error count is zero.

Failure action:

- Do not treat webhook ingestion as proof of consistency.
- Inspect event, customer, subscription and client mappings.

### 4. Stripe entity mappings

Expected:

- At least four active Stripe mappings covering customer and subscription identities in the current ledger.

Failure action:

- Resolve by verified identifier or normalised customer email.
- Never guess a client mapping.

### 5. Isolated Stripe/onboarding sample

Expected:

- At least one synthetic Stripe test event.
- At least one `test_active` sample client with completed onboarding.

Verified sample journey:

1. Synthetic checkout event exists.
2. Test client exists.
3. Fresh tokenised onboarding page returns HTTP 200.
4. Sample form submission returns `{"ok":true,"environment":"test"}`.
5. Test client changes to `onboarding_status=completed`.

### 6. Test delivery evidence

Expected:

- At least one ready delivery artifact linked to the completed sample client.

The stored test URL may expire. Run `prepare_inkcare_sample_onboarding()` for a fresh test cycle rather than weakening expiry controls.

### 7. Social migration safety

Expected:

- `dry_run=true`
- `n8n_enabled=true`
- `migration_phase=parallel_dry_run`

Failure action:

- Restore safe settings before any worker runs.

### 8. Social approval gate

Expected:

- No queue row has an approval state other than `awaiting_approval` during the current pre-live phase.
- No Instagram/Facebook post IDs exist.
- No published timestamp exists.

### 9. Dry-run publication evidence

Expected:

- Zero live publication attempts.
- At least ten validated dry-run attempts, covering five queue records across Instagram and Facebook.

### 10. Command Centre sample data

Expected:

- Exactly one explicit `demo-studio` record.
- Sample/internal revenue events are available for UI and calculation testing.
- The API labels data as sample or internal unverified.

### 11. Connector registry

Expected:

- At least nine connector-health records.

## Command Centre API verification

The API is deployed as Supabase Edge Function `inkcare-command-centre`.

Expected unauthorised behaviour:

- A request without `x-inkcare-control-token` returns HTTP 401.

Expected authorised behaviour:

- Returns tasks, approvals, studios, integration records, connector health, metrics, sync runs, mappings, alerts, test evidence and social migration state.
- Includes a data notice stating that sample/internal records are not client proof.
- Supports the authorised `run_validation` action.

## Acceptance result

A validation cycle is accepted when:

- run status is `success`;
- failed checks equal zero;
- the sample onboarding journey returns HTTP 200 and updates only test tables;
- social live attempts equal zero;
- unresolved warnings are documented with an owner and next action.

## Rollback

If a validation-related change causes a regression:

1. Stop the affected worker or scheduled job.
2. Keep `dry_run=true`.
3. Restore the prior Edge Function version or database migration.
4. Re-run the suite.
5. Record the failure and rollback in `inkcare_audit_log`.

## Evidence retention

Retain:

- validation run ID;
- check results;
- relevant HTTP status and non-sensitive response;
- sample row identifiers;
- migration/Edge Function version;
- date, operator and remediation notes.

Do not retain plaintext onboarding tokens after the test cycle is complete.