# System Sync Contract Template

## Contract identity
- Contract ID:
- Version:
- Owner:
- Status:
- Source system:
- Target system:
- Canonical owner of each field group:

## Trigger
- event/condition:
- source object:
- provider event ID:
- expected frequency:

## Identity and correlation
- source record ID:
- target record ID:
- correlation ID:
- idempotency key:
- studio ID:
- contact/person ID:
- opportunity ID:
- intervention ID:

## Field mapping
| Source field | Target field | Type | Required | Transform | Canonical owner | Conflict rule |
|---|---|---|---|---|---|---|

## Write semantics
- create/update/upsert:
- allowed side effects:
- forbidden writes:
- stop conditions:
- ordering guarantees:

## Retry and recovery
- max attempts:
- backoff:
- dead-letter/manual-review path:
- operator alert:
- replay procedure:

## Security/privacy
- auth mechanism:
- secrets:
- consent requirement:
- suppression logic:
- sensitive fields:
- log redaction:

## Verification
- read-back action:
- cross-system assertions:
- evidence artifact:
- monitoring:
- acceptance test:
