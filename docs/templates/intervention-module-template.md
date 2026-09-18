# Intervention Module Template

Duplicate this file for each technical intervention implementation. Business-facing reusable template authority remains in Google Drive.

## Identity
- Module name:
- Module key:
- Version:
- Owner:
- Status:
- Target ICP:

## Problem and baseline
- Problem:
- Baseline metric key:
- Baseline period:
- Baseline value:
- Evidence IDs:
- Evidence classification:
- Limitations:

## Target
- Primary metric:
- Target value/direction:
- Measurement window:
- Minimum meaningful change:
- Guardrails:

## Trigger and eligibility
- Trigger event:
- Required fields:
- Eligibility:
- Exclusions:
- Consent/suppression checks:
- Required integrations:

## State machine
| State | Entry condition | Action | Exit condition | Timeout | Retry | Failure/escalation |
|---|---|---|---|---|---|---|

## Side effects
For every external write:
- provider:
- operation:
- idempotency key:
- correlation fields:
- retry policy:
- verification read:
- compensation/manual recovery:

## Human-control matrix
- AUTO:
- APPROVAL:
- ESCALATE:
- STOP:

## Events emitted
| Event | When | Required payload | Idempotency source |
|---|---|---|---|

## Metrics
| Metric key | Formula | Source | Classification | Version |
|---|---|---|---|---|

## Security
- data processed:
- secrets:
- role/access:
- RLS/access assumptions:
- logging:
- retention:
- approval gate:

## Acceptance
- happy path:
- replay:
- invalid input:
- suppression:
- reply/stop:
- provider failure:
- retry:
- payment failure:
- cross-system mismatch:
- cleanup:

## Definition of Done
- [ ] Built
- [ ] Connected
- [ ] Protected
- [ ] Tested
- [ ] Measured
- [ ] Attributed
- [ ] Documented
- [ ] Repeatable
- [ ] Verified
