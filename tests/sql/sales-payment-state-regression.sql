-- Fail the CI job immediately on any failed assertion.
SET ROLE service_role;
DO $t$
DECLARE r jsonb; v public.orders%ROWTYPE; count_receipts int;
BEGIN
 r := public.record_stripe_checkout_state_v1(
   'evt_pending_a','checkout.session.completed','cs_live_AAAA1',
   'plink_1UG09jCX6YhLOssgBDzdEF5X','complete','unpaid',39500,'gbp');
 IF r->>'status' <> 'pending' THEN RAISE EXCEPTION 'pending not recorded'; END IF;

 r := public.record_stripe_checkout_state_v1(
   'evt_paid_b','checkout.session.async_payment_succeeded','cs_live_AAAA1',
   'plink_1UG09jCX6YhLOssgBDzdEF5X','complete','paid',39500,'gbp');
 IF r->>'status' <> 'paid' OR (r->>'transitioned_to_paid')::boolean IS NOT TRUE
 THEN RAISE EXCEPTION 'paid transition invalid: %', r; END IF;

 r := public.record_stripe_checkout_state_v1(
   'evt_oldpending_c','checkout.session.completed','cs_live_AAAA1',
   'plink_1UG09jCX6YhLOssgBDzdEF5X','complete','unpaid',39500,'gbp');
 SELECT * INTO v FROM public.orders WHERE stripe_session_id='cs_live_AAAA1';
 IF v.status <> 'paid' OR v.amount_collected_minor <> 39500 OR v.amount_total <> 39500
 THEN RAISE EXCEPTION 'late pending webhook regressed verified payment'; END IF;

 r := public.record_stripe_checkout_state_v1(
   'evt_paid_b','checkout.session.async_payment_succeeded','cs_live_AAAA1',
   'plink_1UG09jCX6YhLOssgBDzdEF5X','complete','paid',39500,'gbp');
 IF (r->>'duplicate_event')::boolean IS NOT TRUE THEN RAISE EXCEPTION 'event replay not idempotent'; END IF;
 SELECT count(*) INTO count_receipts FROM public.sales_stripe_event_receipts WHERE stripe_session_id='cs_live_AAAA1';
 IF count_receipts<>3 THEN RAISE EXCEPTION 'event receipts missing/doubled: %',count_receipts; END IF;
 IF (SELECT count(*) FROM public.orders WHERE stripe_session_id='cs_live_AAAA1')<>1
 THEN RAISE EXCEPTION 'duplicate order created'; END IF;

 BEGIN
   PERFORM public.record_stripe_checkout_state_v1(
    'evt_bad_a','checkout.session.completed','cs_live_BAD1',
    'plink_wrong','complete','paid',39500,'gbp');
   RAISE EXCEPTION 'wrong link accepted';
 EXCEPTION WHEN SQLSTATE '22023' THEN NULL; END;

 BEGIN
   PERFORM public.record_stripe_checkout_state_v1(
    'evt_bad_b','checkout.session.async_payment_succeeded','cs_live_BAD2',
    'plink_1UG09jCX6YhLOssgBDzdEF5X','complete','unpaid',39500,'gbp');
   RAISE EXCEPTION 'async unpaid accepted';
 EXCEPTION WHEN SQLSTATE '22023' THEN NULL; END;

 BEGIN
   PERFORM public.record_stripe_checkout_state_v1(
    'evt_bad_c','checkout.session.completed','cs_test_BAD3',
    'plink_1UG09jCX6YhLOssgBDzdEF5X','complete','paid',39500,'gbp');
   RAISE EXCEPTION 'test checkout accepted';
 EXCEPTION WHEN SQLSTATE '22023' THEN NULL; END;

 r := public.record_stripe_checkout_state_v1(
   'evt_waiver_d','checkout.session.completed','cs_live_ZZZZ2',
   'plink_1UG09jCX6YhLOssgBDzdEF5X','complete','paid',0,'gbp');
 SELECT * INTO v FROM public.orders WHERE stripe_session_id='cs_live_ZZZZ2';
 IF v.amount_collected_minor <> 0 OR v.access_type <> 'waived'
 THEN RAISE EXCEPTION 'zero collected incorrectly recognised'; END IF;
 IF has_function_privilege('anon','public.record_stripe_checkout_state_v1(text,text,text,text,text,text,bigint,text,text,text,text)','EXECUTE')
 THEN RAISE EXCEPTION 'anon can execute payment RPC'; END IF;
 IF has_function_privilege('authenticated','public.record_stripe_checkout_state_v1(text,text,text,text,text,text,bigint,text,text,text,text)','EXECUTE')
 THEN RAISE EXCEPTION 'authenticated can execute payment RPC'; END IF;
 RAISE NOTICE 'payment invariants PASS';
END
$t$;
RESET ROLE;
