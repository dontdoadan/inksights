-- SALES-OS PAYMENT STATE v1: proposed service-only RPC; staging validation required.
-- Not installed in production. Pure SQL transaction is atomic, including Stripe event receipt.
BEGIN;
CREATE TABLE IF NOT EXISTS public.sales_stripe_event_receipts (
 event_id text PRIMARY KEY CHECK (event_id ~ '^evt_[A-Za-z0-9_]+$'),
 stripe_session_id text NOT NULL CHECK (stripe_session_id ~ '^cs_'),
 event_type text NOT NULL CHECK (event_type IN ('checkout.session.completed','checkout.session.async_payment_succeeded')),
 is_paid boolean NOT NULL,
 received_at timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX IF NOT EXISTS sales_stripe_receipt_session_idx ON public.sales_stripe_event_receipts (stripe_session_id, received_at DESC);
ALTER TABLE public.sales_stripe_event_receipts ENABLE ROW LEVEL SECURITY;
REVOKE ALL ON public.sales_stripe_event_receipts FROM PUBLIC, anon, authenticated;
GRANT SELECT, INSERT ON public.sales_stripe_event_receipts TO service_role;

-- SECURITY INVOKER, callable only by service_role. Caller must validate the raw
-- Stripe-Signature, checkout session, approved Payment Link and account mode.
-- One transaction + per-session advisory lock + unique receipt makes retries safe.
CREATE OR REPLACE FUNCTION public.record_stripe_checkout_state_v1(
 p_event_id text,
 p_event_type text,
 p_session_id text,
 p_payment_link_id text,
 p_session_status text,
 p_payment_status text,
 p_amount_total bigint,
 p_currency text,
 p_customer_id text DEFAULT NULL,
 p_payment_intent_id text DEFAULT NULL,
 p_customer_email text DEFAULT NULL
) RETURNS jsonb
LANGUAGE plpgsql
SECURITY INVOKER
SET search_path = ''
AS $fn$
DECLARE
 v_order_id uuid;
 v_final_status text;
 v_previously_paid boolean;
 v_duplicate boolean;
 v_paid boolean;
 v_receipt_session text;
 v_expected_link constant text := 'plink_1UG09jCX6YhLOssgBDzdEF5X';
 v_approved_price constant text := 'price_1UG09NCX6YhLOssgi93xsGnH';
BEGIN
 IF p_event_id IS NULL OR p_event_id !~ '^evt_[A-Za-z0-9_]+$'
    OR p_session_id IS NULL OR p_session_id !~ '^cs_(live|test)_[A-Za-z0-9]+$'
    OR p_event_type NOT IN ('checkout.session.completed','checkout.session.async_payment_succeeded')
    OR p_payment_link_id IS DISTINCT FROM v_expected_link
    OR p_currency IS DISTINCT FROM 'gbp'
    OR p_amount_total IS NULL OR p_amount_total < 0
 THEN RAISE EXCEPTION 'Invalid Stripe Checkout event arguments' USING ERRCODE='22023';
 END IF;
 -- For the live Payment Link, never let a test-mode checkout enter live orders.
 IF p_session_id !~ '^cs_live_' THEN
   RAISE EXCEPTION 'Only live Checkout sessions are accepted' USING ERRCODE='22023';
 END IF;
 IF p_event_type = 'checkout.session.async_payment_succeeded'
    AND p_payment_status IS DISTINCT FROM 'paid' THEN
   RAISE EXCEPTION 'Asynchronous success without provider-paid status' USING ERRCODE='22023';
 END IF;
 v_paid := p_session_status = 'complete' AND p_payment_status = 'paid';

 -- No rows can race on a single provider session, even under different event IDs.
 PERFORM pg_catalog.pg_advisory_xact_lock(pg_catalog.hashtextextended(p_session_id, 15773));

 SELECT r.stripe_session_id INTO v_receipt_session
   FROM public.sales_stripe_event_receipts r WHERE r.event_id=p_event_id;
 IF FOUND THEN
   IF v_receipt_session IS DISTINCT FROM p_session_id THEN
     RAISE EXCEPTION 'Stripe event ID reused for another session' USING ERRCODE='23505';
   END IF;
   SELECT o.id, o.status INTO v_order_id,v_final_status
     FROM public.orders o WHERE o.stripe_session_id=p_session_id;
   RETURN pg_catalog.jsonb_build_object('order_id',v_order_id,'status',v_final_status,
      'transitioned_to_paid',false,'duplicate_event',true);
 END IF;

 SELECT (o.status='paid') INTO v_previously_paid
   FROM public.orders o WHERE o.stripe_session_id=p_session_id FOR UPDATE;
 v_previously_paid := coalesce(v_previously_paid,false);

 INSERT INTO public.orders AS o (
   stripe_session_id, stripe_customer_id, stripe_payment_intent_id,
   stripe_price_id,offer_slug, amount_total,currency,status,customer_email,
   amount_collected_minor,list_value_minor,waiver_amount_minor,access_type,
   metadata,updated_at
 ) VALUES (
   p_session_id,nullif(p_customer_id,''),nullif(p_payment_intent_id,''),
   v_approved_price,'studio-intelligence-audit',
   p_amount_total,'gbp',CASE WHEN v_paid THEN 'paid' ELSE 'pending' END,
   nullif(lower(btrim(p_customer_email)),''),
   CASE WHEN v_paid THEN p_amount_total ELSE 0 END,
   39500, CASE WHEN v_paid THEN greatest(39500-p_amount_total,0) ELSE 0 END,
   CASE WHEN v_paid AND p_amount_total = 0 THEN 'waived' ELSE 'paid' END,
   pg_catalog.jsonb_build_object('source','stripe_webhook','payment_link',p_payment_link_id,
     'payment_status',p_payment_status,'checkout_status',p_session_status),
   now()
 ) ON CONFLICT (stripe_session_id) DO UPDATE
 SET status = CASE WHEN o.status='paid' OR excluded.status='paid'
                    THEN 'paid' ELSE 'pending' END,
     amount_collected_minor = CASE WHEN o.status='paid' THEN o.amount_collected_minor
           WHEN excluded.status='paid' THEN excluded.amount_collected_minor
           ELSE 0 END,
     amount_total= CASE WHEN o.status='paid' THEN o.amount_total ELSE excluded.amount_total END,
     currency= CASE WHEN o.status='paid' THEN o.currency ELSE excluded.currency END,
     stripe_customer_id=coalesce(o.stripe_customer_id,excluded.stripe_customer_id),
     stripe_payment_intent_id=coalesce(o.stripe_payment_intent_id,excluded.stripe_payment_intent_id),
     stripe_price_id=coalesce(o.stripe_price_id,excluded.stripe_price_id),
     customer_email=coalesce(o.customer_email,excluded.customer_email),
     list_value_minor=coalesce(o.list_value_minor,excluded.list_value_minor),
     waiver_amount_minor=CASE WHEN o.status='paid' THEN o.waiver_amount_minor
       ELSE excluded.waiver_amount_minor END,
     access_type=CASE WHEN o.status='paid' THEN o.access_type ELSE excluded.access_type END,
     metadata=CASE WHEN o.status='paid' THEN o.metadata ELSE excluded.metadata END,
     updated_at=now()
 RETURNING o.id,o.status INTO v_order_id,v_final_status;

 INSERT INTO public.sales_stripe_event_receipts(event_id,stripe_session_id,event_type,is_paid)
 VALUES (p_event_id,p_session_id,p_event_type,v_paid);
 RETURN pg_catalog.jsonb_build_object('order_id',v_order_id,'status',v_final_status,
   'transitioned_to_paid',(v_paid AND NOT v_previously_paid),'duplicate_event',false);
END;
$fn$;
REVOKE ALL ON FUNCTION public.record_stripe_checkout_state_v1(
 text,text,text,text,text,text,bigint,text,text,text,text) FROM PUBLIC,anon,authenticated;
GRANT EXECUTE ON FUNCTION public.record_stripe_checkout_state_v1(
 text,text,text,text,text,text,bigint,text,text,text,text) TO service_role;
COMMIT;
