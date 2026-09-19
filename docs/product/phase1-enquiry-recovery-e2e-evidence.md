# Phase 1 Enquiry Recovery — E2E Evidence Pack

Status: **IN REVIEW — provider payment proven; sandbox webhook delivery remains unconfigured**

Correlation ID: `234ce5af-12af-4e3e-a450-c568d51dea8b`

## Synthetic fixture

- Studio: `73ca584c-475d-4b79-b328-c452dd2ca8ee`
- HubSpot Contact: `871354447076`
- HubSpot Company: `448307851478`
- HubSpot Deal: `521994014909`
- Intervention: `2488ddc6-c873-428d-b3f9-1dc8d9318d6b`
- Stripe Payment Link: `plink_1UHRff2SPedeqLYGf0NmaPJ1`
- Stripe Checkout Session: `cs_test_a1wkKZt0SEks26Z37lHIb7rf8nUuuwT1aDBetigkDqn0fuzipUvkGx3IKy`
- Stripe PaymentIntent: `pi_3UHS5l2SPedeqLYG0AVp2xCC`
- Stripe Charge: `ch_3UHS5l2SPedeqLYG0jzU6dRX`
- Supabase Order: `8cef5172-dea9-483d-8f8f-cfb3247acdf6`
- Deposit paid event: `d47c0cb0-e58b-4770-84c7-4d57277d5c2b`
- Outcome: `ac07fc14-6f3b-4a76-8071-ef190c27c451`
- Attribution: `def4e321-a6fc-4931-a2d2-f6b9ce1a529c`

## Provider proof

Stripe sandbox reports the Checkout Session as `complete` and `paid`, amount `100 GBP pence`.
The PaymentIntent reports `succeeded` and amount received `100`.
The Charge reports `paid=true`, `captured=true`, `status=succeeded`.

The sandbox payment email differed from the HubSpot contact email. The journey remained correctly associated because correlation uses provider metadata and canonical external IDs, not fuzzy email matching.

## E2E acceptance matrix

| # | Proof point | Status | Evidence |
|---|---|---|---|
| 1 | enquiry ingested once | VERIFIED | `lead.created` event |
| 2 | CRM identity once | VERIFIED | HubSpot Contact `871354447076` |
| 3 | source recorded | VERIFIED | HubSpot source on `lead.created` |
| 4 | event persisted | VERIFIED | integration event store |
| 5 | classification | VERIFIED | `lead.qualified` |
| 6 | acknowledgement in approved test channel | VERIFIED | record-only `message.sent`; no external message |
| 7 | follow-up starts | VERIFIED | record-only follow-up event |
| 8 | reply stops follow-up | VERIFIED | `message.replied` with stop condition |
| 9 | consultation | VERIFIED | booked + completed synthetic provider events |
| 10 | sandbox deposit route | VERIFIED | £1 Stripe sandbox Payment Link |
| 11 | sandbox payment succeeds | VERIFIED | Stripe Session/PaymentIntent/Charge |
| 12 | payment correlated to Deal/intervention | VERIFIED | Stripe metadata + correlation ID |
| 13 | HubSpot updated after payment | PENDING | synthetic Deal consequence requires approved HubSpot mutation |
| 14 | Supabase updated | VERIFIED | Order + `deposit.paid` |
| 15 | conversion | VERIFIED | synthetic `booking.created` + intervention completion |
| 16 | outcome | VERIFIED | `ac07fc14-6f3b-4a76-8071-ef190c27c451` |
| 17 | attribution | VERIFIED | `def4e321-a6fc-4931-a2d2-f6b9ce1a529c` |
| 18 | operator view | IN REVIEW | preview-only proof endpoint implemented; preview verification pending |
| 19 | failure/retry/replay no duplicates | VERIFIED | controlled failure/retry; payment replay retained one `deposit.paid` |
| 20 | test data tagged and removed/archived | PENDING | cleanup is a separately gated destructive action |

## Idempotency

Paid-deposit side effects are now keyed to the Stripe Checkout Session rather than the webhook delivery ID. Replaying the paid transition returned the same event ID and the event count remained one. This protects against Stripe retries and alternate delivery/reconciliation paths.

## Measurement integrity

The £1 sandbox payment is an observed TEST outcome only. It is explicitly excluded from commercial revenue:
- outcome payload: `commercial_value_excluded=true`
- attribution value: `0`
- attribution confounders include `sandbox_transaction`

No sandbox value may be reported as captured commercial revenue.

## Known delivery gap

The Stripe sandbox account did not have a webhook endpoint configured when the payment was made. Provider payment state was therefore reconciled from Stripe's canonical Checkout Session / PaymentIntent / Charge records into the same session-idempotent data path.

This proves provider payment, identity correlation, order projection, event idempotency, outcome and attribution. It does **not** prove network webhook delivery for this payment. A future sandbox webhook delivery test remains required before claiming the webhook transport itself verified.

## Release gates still closed

No:
- live Stripe charge
- real customer message
- merge to `main`
- production deployment
- destructive TEST CLIENT cleanup

has been authorised or performed.
