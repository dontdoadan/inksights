SET ROLE service_role;
DO $t$
DECLARE a uuid; b uuid; o1 uuid; o2 uuid; audit1 uuid; audit2 uuid; rep1 uuid; rep2 uuid; state1 text; state2 text;
BEGIN
 SELECT studio_id,order_id INTO a,o1 FROM public.sales_order_links WHERE acquisition_path='assisted' LIMIT 1;
 SELECT studio_id,order_id INTO b,o2 FROM public.sales_order_links WHERE acquisition_path='direct' LIMIT 1;
 IF o1 IS NULL OR o2 IS NULL THEN RAISE EXCEPTION 'missing verified sales fixtures'; END IF;
 INSERT INTO public.audits(studio_id) VALUES (a) RETURNING id INTO audit1;
 INSERT INTO public.audits(studio_id) VALUES (b) RETURNING id INTO audit2;
 INSERT INTO public.report_versions(audit_id,status,qa_status)
 VALUES(audit1,'published','passed') RETURNING id INTO rep1;
 INSERT INTO public.report_versions(audit_id,status,qa_status)
 VALUES(audit2,'published','passed') RETURNING id INTO rep2;
 SELECT derived_delivery_status INTO state1 FROM public.sales_customer_delivery_status_v1 WHERE audit_id=audit1;
 IF state1 <> 'awaiting_access_and_acceptance' THEN RAISE EXCEPTION 'publication treated as delivery: %',state1; END IF;
 INSERT INTO public.si_report_access(report_id,user_id) VALUES(rep1,gen_random_uuid());
 SELECT derived_delivery_status INTO state1 FROM public.sales_customer_delivery_status_v1 WHERE audit_id=audit1;
 IF state1='delivered' THEN RAISE EXCEPTION 'access alone treated as acceptance'; END IF;
 INSERT INTO public.sales_delivery_work(studio_id,order_id,audit_id,milestone,evidence_ref,hours_spent,cash_cost_pence)
 VALUES(a,o1,audit1,'intake_started','intake-fixture',1,0),
       (a,o1,audit1,'accepted','accepted-fixture',1,0);
 SELECT derived_delivery_status INTO state1 FROM public.sales_customer_delivery_status_v1 WHERE audit_id=audit1;
 SELECT derived_delivery_status INTO state2 FROM public.sales_customer_delivery_status_v1 WHERE audit_id=audit2;
 IF state1<>'delivered' OR state2<>'awaiting_access_and_acceptance'
 THEN RAISE EXCEPTION 'paid+published+qa+grant+acceptance gate failed, a % b %',state1,state2; END IF;
 IF has_table_privilege('anon','public.sales_customer_delivery_status_v1','SELECT')
 THEN RAISE EXCEPTION 'public report delivery view exposed'; END IF;
 RAISE NOTICE 'full direct/assisted journey delivery gates PASS';
END
$t$;
RESET ROLE;
