-- Staging-only verification of reconciled direct vs assisted weekly reporting.
SET ROLE service_role;
DO $x$
DECLARE a uuid;b uuid; aid uuid; wk date; metrics record;
BEGIN
 SELECT studio_id INTO a FROM public.sales_order_links LIMIT 1;
 SELECT id INTO b FROM public.visibility_studios WHERE id<>a LIMIT 1;
 SELECT id INTO aid FROM public.orders WHERE stripe_session_id='cs_live_AAAA1';
 IF a IS NULL OR b IS NULL OR aid IS NULL THEN RAISE EXCEPTION 'identity fixtures unavailable'; END IF;
 PERFORM public.record_stripe_checkout_state_v1(
   'evt_second_paid','checkout.session.completed','cs_live_BBBB2',
   'plink_1UG09jCX6YhLOssgBDzdEF5X','complete','paid',39500,'gbp');
 INSERT INTO public.sales_order_links(order_id,studio_id,source_verified,provider_event_id,
   resolution_status,resolved_by,resolved_at,acquisition_path)
 SELECT id,b,true,'evt_second_paid','verified','test-reviewer',now(),'direct'
 FROM public.orders WHERE stripe_session_id='cs_live_BBBB2';
 INSERT INTO public.sales_journey_events(source_ref,event_kind,source_system,idempotency_key,occurred_at)
 VALUES ('stripe_session:cs_live_AAAA1','order_paid_verified','stripe','fixture-paid-order-a',now()),
        ('stripe_session:cs_live_BBBB2','order_paid_verified','stripe','fixture-paid-order-b',now());
 INSERT INTO public.sales_journey_events(studio_id,event_kind,source_system,idempotency_key,occurred_at)
 VALUES (a,'outreach_sent','hubspot','outbound-a',now()),
        (a,'positive_qualified_engagement','hubspot','engaged-a',now()),
        (a,'qualified_conversation','hubspot','qualified-call-a',now()),
        (b,'discovery_completed','hubspot','discovery-b',now());
 INSERT INTO public.sales_acquisition_costs(source,channel,incurred_on,cost_pence,evidence_ref)
 VALUES ('test_fixture','outreach',current_date,2000,'fixture-spend-1');
 INSERT INTO public.sales_delivery_work(studio_id,order_id,milestone,hours_spent,hourly_cost_pence,cash_cost_pence,evidence_ref)
 VALUES(a,aid,'accepted',4,3000,1000,'fixture-delivery-1');

 SELECT * INTO metrics FROM public.sales_weekly_scorecard_v1 LIMIT 1;
 IF metrics.verified_audit_purchases<>2 OR metrics.verified_audit_revenue_pence<>79000
    OR metrics.direct_purchases<>1 OR metrics.assisted_purchases<>1
    OR metrics.direct_revenue_pence<>39500 OR metrics.assisted_revenue_pence<>39500
 THEN RAISE EXCEPTION 'path-aware verified revenue incorrectly aggregated'; END IF;
 IF metrics.accounts_approached<>1 OR metrics.positive_qualified_engagements<>1
    OR metrics.positive_engagement_rate_period<>1 THEN
   RAISE EXCEPTION 'qualified engagement ratio incorrect'; END IF;
 IF metrics.acquisition_cost_per_paying_studio_pence<>1000
    OR metrics.measured_delivery_hours<>4 OR metrics.delivery_cost_pence<>13000
 THEN RAISE EXCEPTION 'acquisition/delivery economics incorrect'; END IF;
 IF metrics.monitoring_cohort_retention_rate IS NOT NULL
 THEN RAISE EXCEPTION 'retention must be unknown without cohort evidence'; END IF;
 IF has_table_privilege('authenticated','public.sales_weekly_scorecard_v1','SELECT')
 THEN RAISE EXCEPTION 'dashboard exposure to studio users'; END IF;
 RAISE NOTICE 'scorecard direct/assisted verification PASS';
END
$x$;
RESET ROLE;
