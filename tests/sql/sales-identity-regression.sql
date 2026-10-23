SET ROLE service_role;
DO $t$
DECLARE a uuid; b uuid; oid uuid; n int; raised boolean;
BEGIN
 INSERT INTO public.visibility_studios(studio_name) VALUES('Fixture Site A') RETURNING id INTO a;
 INSERT INTO public.visibility_studios(studio_name) VALUES('Fixture Site B') RETURNING id INTO b;
 INSERT INTO public.sales_identity_links(studio_id,provider,object_type,external_id,match_method,resolution_status,verified_by,verified_at)
 VALUES
 (a,'hubspot','company','hubspot-parent-1','manual_review','verified','test-reviewer',now()),
 (b,'hubspot','company','hubspot-parent-1','manual_review','verified','test-reviewer',now());
 -- A legal company can cover two studios; do not merge them.
 IF (SELECT count(*) FROM public.sales_identity_links WHERE external_id='hubspot-parent-1')<>2
 THEN RAISE EXCEPTION 'multi-site company identity rejected'; END IF;
 BEGIN
   INSERT INTO public.sales_identity_links(studio_id,provider,object_type,external_id,match_method,resolution_status,verified_by,verified_at)
   VALUES(a,'hubspot','company','hubspot-parent-2','manual_review','verified','test-reviewer',now());
   RAISE EXCEPTION 'duplicate verified HubSpot company accepted for same studio';
 EXCEPTION WHEN unique_violation THEN NULL; END;
 BEGIN
   INSERT INTO public.sales_identity_links(studio_id,provider,object_type,external_id,match_method,resolution_status,verified_by,verified_at)
   VALUES(a,'stripe','session','shared-session','checkout_metadata','verified','test-reviewer',now()),
         (b,'stripe','session','shared-session','checkout_metadata','verified','test-reviewer',now());
   RAISE EXCEPTION 'one transaction assigned to two studios';
 EXCEPTION WHEN unique_violation THEN NULL; END;
 BEGIN
   INSERT INTO public.sales_identity_links(studio_id,provider,object_type,external_id,match_method,resolution_status)
   VALUES(a,'hubspot','contact','no-evidence','manual_review','verified');
   RAISE EXCEPTION 'verified identity without evidence';
 EXCEPTION WHEN check_violation THEN NULL; END;
 INSERT INTO public.sales_journey_events(studio_id,event_kind,source_system,idempotency_key,occurred_at)
 VALUES(a,'qualified','human_review','fixture-qualified-a',now());
 BEGIN
   INSERT INTO public.sales_journey_events(studio_id,event_kind,source_system,idempotency_key,occurred_at)
   VALUES(a,'qualified','human_review','fixture-qualified-a',now());
   RAISE EXCEPTION 'event idempotency not enforced';
 EXCEPTION WHEN unique_violation THEN NULL; END;
 SELECT id INTO oid FROM public.orders WHERE stripe_session_id='cs_live_AAAA1';
 IF oid IS NULL THEN
   PERFORM public.record_stripe_checkout_state_v1(
     'evt_fixture-paid','checkout.session.completed','cs_live_AAAA1',
     'plink_1UG09jCX6YhLOssgBDzdEF5X','complete','paid',39500,'gbp');
   SELECT id INTO oid FROM public.orders WHERE stripe_session_id='cs_live_AAAA1';
 END IF;
 INSERT INTO public.sales_order_links(order_id,studio_id,source_verified,
   provider_event_id,resolution_status,resolved_by,resolved_at,acquisition_path)
 VALUES(oid,a,true,'evt_fixture-paid','verified','test-reviewer',now(),'assisted');
 SELECT count(*) INTO n FROM public.sales_verified_audit_purchases
  WHERE studio_id=a AND collected_pence=39500 AND acquisition_path='assisted';
 IF n<>1 THEN RAISE EXCEPTION 'verified revenue view count incorrect: %',n; END IF;
 BEGIN
   INSERT INTO public.sales_order_links(order_id,studio_id,source_verified,
     provider_event_id,resolution_status,resolved_at)
   VALUES(oid,b,true,'evt_fixture-paid','verified',now());
   RAISE EXCEPTION 'order assigned to two studio IDs';
 EXCEPTION WHEN unique_violation THEN NULL; END;
 IF has_table_privilege('anon','public.sales_contact_permissions','SELECT')
 THEN RAISE EXCEPTION 'anon can read permissions'; END IF;
 IF has_table_privilege('authenticated','public.sales_identity_links','SELECT')
 THEN RAISE EXCEPTION 'customer can read identity map'; END IF;
 IF has_table_privilege('anon','public.sales_verified_audit_purchases','SELECT')
 THEN RAISE EXCEPTION 'anon can read paid revenue'; END IF;
 RAISE NOTICE 'identity/consent/report schema invariants PASS';
END
$t$;
RESET ROLE;
