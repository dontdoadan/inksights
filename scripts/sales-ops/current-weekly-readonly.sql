-- INKSIGHTS Sales OS: current production-safe WEEKLY SNAPSHOT
-- Read-only, no schema additions or writes. Times are Europe/London inclusive start,
-- exclusive end. Counts are diagnostics, NOT conversion or paid-revenue proof.
WITH bounds AS (
 SELECT
  (date_trunc('week', now() AT TIME ZONE 'Europe/London') AT TIME ZONE 'Europe/London') AS since_utc,
  ((date_trunc('week', now() AT TIME ZONE 'Europe/London') + interval '7 day') AT TIME ZONE 'Europe/London') AS until_utc
)
SELECT
 (since_utc AT TIME ZONE 'Europe/London')::date AS week_start_uk,
 (SELECT count(*) FROM public.studio_candidates c
   WHERE c.observed_at >= b.since_utc AND c.observed_at < b.until_utc) AS observed_candidate_rows,
 (SELECT count(*) FROM public.visibility_studios s
   WHERE s.created_at >= b.since_utc AND s.created_at < b.until_utc) AS created_verified_registry_rows_not_qualified,
 (SELECT count(*) FROM public.public_contact_requests r
   WHERE r.created_at >= b.since_utc AND r.created_at < b.until_utc AND r.is_test=false) AS live_contact_submissions,
 (SELECT count(*) FROM public.website_events e
   WHERE e.created_at >= b.since_utc AND e.created_at < b.until_utc AND e.event_name='checkout_started') AS checkout_started_events_not_unique_sessions,
 (SELECT count(*) FROM public.website_events e
   WHERE e.created_at >= b.since_utc AND e.created_at < b.until_utc AND e.event_name='checkout_error') AS checkout_error_events,
 (SELECT count(*) FROM public.orders o
   WHERE o.created_at >= b.since_utc AND o.created_at < b.until_utc
     AND o.offer_slug='studio-intelligence-audit' AND o.status='paid') AS orders_marked_audit_paid_unreconciled,
 NULL::bigint AS stripe_verified_audit_revenue_pence,
 NULL::numeric AS positive_qualified_engagement_rate,
 NULL::numeric AS acquisition_cost_per_paying_studio,
 'Weekly payment revenue and conversion rates require Stripe-verified orders, approved studio links and CRM event reconciliation'::text AS integrity_note
FROM bounds b;