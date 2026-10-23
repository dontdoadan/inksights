#!/usr/bin/env bash
set -euo pipefail
# Runs only against throwaway GitHub Actions PostgreSQL with synthetic sessions.
for round in 1 2 3 4; do
  session="cs_live_RACE${round}"
  psql -X -v ON_ERROR_STOP=1 -qAtc "SET ROLE service_role; SELECT public.record_stripe_checkout_state_v1('evt_race_pending_${round}','checkout.session.completed','${session}','plink_1UG09jCX6YhLOssgBDzdEF5X','complete','unpaid',39500,'gbp');" > /dev/null &
  pending_pid=$!
  psql -X -v ON_ERROR_STOP=1 -qAtc "SET ROLE service_role; SELECT public.record_stripe_checkout_state_v1('evt_race_paid_${round}','checkout.session.async_payment_succeeded','${session}','plink_1UG09jCX6YhLOssgBDzdEF5X','complete','paid',39500,'gbp');" > /dev/null &
  paid_pid=$!
  wait "${pending_pid}"
  wait "${paid_pid}"
  actual="$(psql -X -v ON_ERROR_STOP=1 -qAtc "SELECT status || ':' || amount_collected_minor FROM public.orders WHERE stripe_session_id='${session}';")"
  if [[ "$actual" != "paid:39500" ]]; then echo "Concurrent regression: $actual" >&2; exit 1; fi
  receipts="$(psql -X -v ON_ERROR_STOP=1 -qAtc "SELECT count(*) FROM public.sales_stripe_event_receipts WHERE stripe_session_id='${session}';")"
  if [[ "$receipts" != "2" ]]; then echo "Missing concurrent receipt count $receipts" >&2; exit 1; fi
done
# Same-event parallel delivery must never duplicate a payment or event receipt.
psql -X -v ON_ERROR_STOP=1 -qAtc "SET ROLE service_role; SELECT public.record_stripe_checkout_state_v1('evt_race_duplicate','checkout.session.completed','cs_live_RACEDUP','plink_1UG09jCX6YhLOssgBDzdEF5X','complete','paid',39500,'gbp');" >/dev/null &
a=$!
psql -X -v ON_ERROR_STOP=1 -qAtc "SET ROLE service_role; SELECT public.record_stripe_checkout_state_v1('evt_race_duplicate','checkout.session.completed','cs_live_RACEDUP','plink_1UG09jCX6YhLOssgBDzdEF5X','complete','paid',39500,'gbp');" >/dev/null &
b=$!
wait "$a"; wait "$b"
count="$(psql -X -v ON_ERROR_STOP=1 -qAtc "SELECT count(*) FROM public.sales_stripe_event_receipts WHERE event_id='evt_race_duplicate';")"
[[ "$count" == "1" ]] || { echo "Duplicate event receipt: $count" >&2; exit 1; }
echo "Payment race and duplicate-webhook tests PASS"
