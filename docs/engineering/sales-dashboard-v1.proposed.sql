-- Read-only operational scorecard v1. Requires proposed identity schema and
-- sales_journey_events ingestion; never deploy before backfill validation.
BEGIN;
CREATE OR REPLACE VIEW public.sales_weekly_scorecard_v1
WITH (security_invoker=true) AS
WITH weeks AS (
 SELECT g::date AS week_start_uk
 FROM pg_catalog.generate_series(
   pg_catalog.date_trunc('week', pg_catalog.now() AT TIME ZONE 'Europe/London') - interval '11 weeks',
   pg_catalog.date_trunc('week', pg_catalog.now() AT TIME ZONE 'Europe/London'),
   interval '1 week'
 ) g
), event_counts AS (
 SELECT pg_catalog.date_trunc('week', occurred_at AT TIME ZONE 'Europe/London')::date AS wk,
  count(DISTINCT coalesce(studio_id::text,candidate_id::text,source_ref))
    FILTER (WHERE event_kind='qualified') AS qualified_studios_added,
  count(DISTINCT coalesce(studio_id::text,candidate_id::text,source_ref))
    FILTER (WHERE event_kind='outreach_sent') AS accounts_approached,
  count(DISTINCT coalesce(studio_id::text,candidate_id::text,source_ref))
    FILTER (WHERE event_kind='positive_qualified_engagement') AS positive_engagements,
  count(DISTINCT idempotency_key) FILTER (WHERE event_kind='discovery_completed') AS discovery_calls_completed,
  count(DISTINCT idempotency_key) FILTER (WHERE event_kind='qualified_conversation') AS qualified_conversations
 FROM public.sales_journey_events WHERE NOT is_test
 GROUP BY 1
), verified_paid AS (
 SELECT pg_catalog.date_trunc('week',e.occurred_at AT TIME ZONE 'Europe/London')::date AS wk,
  v.studio_id,v.order_id,v.acquisition_path,v.collected_pence
 FROM public.sales_verified_audit_purchases v
 JOIN public.sales_journey_events e
   ON e.source_ref=('stripe_session:' || v.stripe_session_id)
  AND e.event_kind='order_paid_verified' AND e.source_system='stripe'
 WHERE NOT e.is_test
), paid_counts AS (
 SELECT wk,count(DISTINCT order_id) AS paid_audits,
  count(DISTINCT studio_id) AS paying_studios,
  coalesce(sum(collected_pence),0)::bigint AS verified_revenue_pence,
  coalesce(sum(collected_pence) FILTER(WHERE acquisition_path='direct'),0)::bigint AS direct_revenue_pence,
  coalesce(sum(collected_pence) FILTER(WHERE acquisition_path='assisted'),0)::bigint AS assisted_revenue_pence,
  coalesce(sum(collected_pence) FILTER(WHERE acquisition_path='unknown'),0)::bigint AS unattributed_revenue_pence,
  count(DISTINCT order_id) FILTER(WHERE acquisition_path='direct') AS direct_purchases,
  count(DISTINCT order_id) FILTER(WHERE acquisition_path='assisted') AS assisted_purchases,
  count(DISTINCT order_id) FILTER(WHERE acquisition_path='unknown') AS unattributed_purchases
 FROM verified_paid GROUP BY 1
), acquisition AS (
 SELECT pg_catalog.date_trunc('week',incurred_on::timestamp)::date AS wk,
   sum(cost_pence)::bigint AS total_acquisition_spend_pence
 FROM public.sales_acquisition_costs
 WHERE NOT is_test AND currency='gbp'
 GROUP BY 1
), delivery AS (
 SELECT pg_catalog.date_trunc('week',occurred_at AT TIME ZONE 'Europe/London')::date AS wk,
  sum(hours_spent) AS measured_delivery_hours,
  sum(cash_cost_pence + coalesce(hours_spent * hourly_cost_pence,0))::bigint AS delivery_cost_pence,
  count(*) FILTER(WHERE hours_spent IS NOT NULL AND hourly_cost_pence IS NOT NULL) AS priced_time_rows
 FROM public.sales_delivery_work WHERE NOT is_test GROUP BY 1
)
SELECT w.week_start_uk,
 coalesce(ev.qualified_studios_added,0)::bigint AS qualified_studios_added,
 coalesce(ev.accounts_approached,0)::bigint AS accounts_approached,
 coalesce(ev.positive_engagements,0)::bigint AS positive_qualified_engagements,
 (ev.positive_engagements::numeric / nullif(ev.accounts_approached,0)) AS positive_engagement_rate_period,
 coalesce(ev.discovery_calls_completed,0)::bigint AS discovery_calls_completed,
 coalesce(ev.qualified_conversations,0)::bigint AS qualified_conversations,
 coalesce(p.paid_audits,0)::bigint AS verified_audit_purchases,
 (p.paid_audits::numeric / nullif(ev.qualified_conversations,0)) AS same_week_purchases_per_conversation,
 coalesce(p.verified_revenue_pence,0)::bigint AS verified_audit_revenue_pence,
 coalesce(p.direct_revenue_pence,0)::bigint AS direct_revenue_pence,
 coalesce(p.assisted_revenue_pence,0)::bigint AS assisted_revenue_pence,
 coalesce(p.unattributed_revenue_pence,0)::bigint AS unattributed_revenue_pence,
 coalesce(p.direct_purchases,0)::bigint AS direct_purchases,
 coalesce(p.assisted_purchases,0)::bigint AS assisted_purchases,
 coalesce(p.unattributed_purchases,0)::bigint AS unattributed_purchases,
 a.total_acquisition_spend_pence,
 (a.total_acquisition_spend_pence::numeric / nullif(p.paying_studios,0)) AS acquisition_cost_per_paying_studio_pence,
 d.measured_delivery_hours,
 d.delivery_cost_pence,
 CASE WHEN d.delivery_cost_pence IS NOT NULL AND d.priced_time_rows > 0
      THEN (coalesce(p.verified_revenue_pence,0)-d.delivery_cost_pence)::bigint
      ELSE NULL END AS provisional_contribution_pence,
 NULL::numeric AS monitoring_cohort_retention_rate
FROM weeks w
LEFT JOIN event_counts ev ON ev.wk=w.week_start_uk
LEFT JOIN paid_counts p ON p.wk=w.week_start_uk
LEFT JOIN acquisition a ON a.wk=w.week_start_uk
LEFT JOIN delivery d ON d.wk=w.week_start_uk
ORDER BY w.week_start_uk DESC;
REVOKE ALL ON public.sales_weekly_scorecard_v1 FROM PUBLIC,anon,authenticated;
GRANT SELECT ON public.sales_weekly_scorecard_v1 TO service_role;
COMMIT;
