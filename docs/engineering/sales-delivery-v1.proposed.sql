-- Delivery state is derived from payment, canonical studio identity, report QA,
-- report publication, access grant and explicit customer acceptance evidence.
-- Publishing alone is NEVER a completed customer delivery.
BEGIN;
CREATE OR REPLACE VIEW public.sales_customer_delivery_status_v1
WITH (security_invoker=true) AS
SELECT
 a.id AS audit_id,
 a.studio_id,
 o.id AS order_id,
 r.id AS report_version_id,
 r.status AS report_status,
 r.qa_status AS report_qa_status,
 EXISTS (
   SELECT 1 FROM public.sales_delivery_work w
   WHERE w.studio_id=a.studio_id AND w.order_id=o.id AND w.audit_id=a.id
     AND w.milestone='intake_started' AND NOT w.is_test
 ) AS intake_started,
 EXISTS (
   SELECT 1 FROM public.si_report_access access_record
   WHERE access_record.report_id=r.id
 ) AS has_client_access,
 EXISTS (
   SELECT 1 FROM public.sales_delivery_work accepted
   WHERE accepted.studio_id=a.studio_id AND accepted.order_id=o.id AND accepted.audit_id=a.id
     AND accepted.milestone='accepted' AND NOT accepted.is_test
     AND accepted.evidence_ref IS NOT NULL
 ) AS acceptance_recorded,
 CASE
   WHEN r.status='published' AND r.qa_status='passed'
     AND EXISTS(SELECT 1 FROM public.si_report_access access_record WHERE access_record.report_id=r.id)
     AND EXISTS (
       SELECT 1 FROM public.sales_delivery_work accepted
       WHERE accepted.studio_id=a.studio_id AND accepted.order_id=o.id AND accepted.audit_id=a.id
         AND accepted.milestone='accepted' AND NOT accepted.is_test
         AND accepted.evidence_ref IS NOT NULL
     ) THEN 'delivered'
   WHEN r.status='published' AND r.qa_status='passed' THEN 'awaiting_access_and_acceptance'
   ELSE 'in_delivery'
 END AS derived_delivery_status
FROM public.sales_order_links link
JOIN public.orders o ON o.id=link.order_id
JOIN public.audits a ON a.studio_id=link.studio_id
JOIN public.report_versions r ON r.audit_id=a.id
WHERE link.resolution_status='verified' AND link.source_verified=true
 AND o.status='paid' AND o.offer_slug='studio-intelligence-audit';
REVOKE ALL ON public.sales_customer_delivery_status_v1 FROM PUBLIC,anon,authenticated;
GRANT SELECT ON public.sales_customer_delivery_status_v1 TO service_role;
COMMIT;
