# End-to-End Acceptance Test Template

## Fixture
- Test ID:
- Scenario:
- Synthetic identity:
- Environment:
- Systems:
- Preconditions:
- Required seeded data:

## Test steps
| Step | Action | Expected event | Expected source state | Expected target state | Evidence |
|---|---|---|---|---|---|

## Mandatory variants
- [ ] Happy path
- [ ] Duplicate/replay
- [ ] Invalid input
- [ ] Opt-out/suppression
- [ ] Human escalation
- [ ] Message delivery failure
- [ ] Provider timeout
- [ ] Payment failure
- [ ] Cross-system sync mismatch
- [ ] Retry succeeds
- [ ] Retry exhausts
- [ ] Manual recovery
- [ ] Cleanup

## Assertions
- no duplicate business records:
- no duplicate side effects:
- correlation IDs preserved:
- canonical owner respected:
- metrics updated:
- evidence recorded:
- errors observable:
- secrets absent from logs:

## Result
- PASS / FAIL / BLOCKED:
- Run timestamp:
- Commit/deployment:
- Database migration state:
- Evidence links:
- Residual risk:
- Follow-up:
