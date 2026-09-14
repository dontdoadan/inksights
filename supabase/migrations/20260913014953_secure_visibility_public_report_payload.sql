-- A report token is a capability for viewing the report, not for obtaining the
-- lead's contact details or exposing internal primary keys and raw provider data.
-- Keep the public contract explicitly allowlisted as the underlying tables evolve.
create or replace function public.publish_visibility_report(p_report_id uuid, p_public_token text)
returns jsonb
language plpgsql
security definer
set search_path = public, pg_catalog
as $$
declare
  r public.visibility_report_runs;
  s public.visibility_studios;
  obs jsonb;
  kws jsonb;
  opps jsonb;
begin
  select * into r
  from public.visibility_report_runs
  where id = p_report_id
    and public_token = p_public_token
    and status = 'published';

  if not found then
    raise exception 'report_not_found';
  end if;

  select * into s
  from public.visibility_studios
  where id = r.studio_id;

  select coalesce(
    jsonb_agg(
      jsonb_build_object(
        'observation_type', o.observation_type,
        'raw_data', o.raw_data,
        'observed_at', o.observed_at
      )
      order by o.observed_at desc
    ),
    '[]'::jsonb
  ) into obs
  from public.visibility_observations o
  where o.studio_id = r.studio_id;

  select coalesce(
    jsonb_agg(
      jsonb_build_object(
        'keyword', k.keyword,
        'search_volume', k.search_volume,
        'current_rank', k.current_rank,
        'target_url', k.target_url,
        'keyword_difficulty', k.keyword_difficulty
      )
      order by k.search_volume desc
    ),
    '[]'::jsonb
  ) into kws
  from public.visibility_keywords k
  where k.studio_id = r.studio_id;

  select coalesce(
    jsonb_agg(
      jsonb_build_object(
        'title', o.title,
        'description', o.description,
        'lsos_score', o.lsos_score,
        'priority', o.priority,
        'evidence', o.evidence,
        'recommended_action', o.recommended_action
      )
      order by o.priority
    ),
    '[]'::jsonb
  ) into opps
  from public.visibility_opportunities o
  where o.studio_id = r.studio_id;

  return jsonb_build_object(
    'report', jsonb_build_object(
      'id', r.id,
      'report_version', r.report_version,
      'status', r.status,
      'visibility_score', r.visibility_score,
      'score_components', r.score_components,
      'executive_summary', r.executive_summary,
      'search_demand', r.search_demand,
      'current_visibility', r.current_visibility,
      'competitor_intelligence', r.competitor_intelligence,
      'opportunity_summary', r.opportunity_summary,
      'commercial_opportunity', r.commercial_opportunity,
      'action_plan', r.action_plan,
      'methodology', r.methodology,
      'qa_checks', r.qa_checks,
      'data_classification', r.data_classification,
      'published_at', r.published_at,
      'created_at', r.created_at
    ),
    'studio', jsonb_build_object(
      'studio_name', s.studio_name,
      'website_url', s.website_url,
      'town', s.town,
      'artist_count', s.artist_count
    ),
    'observations', obs,
    'keywords', kws,
    'opportunities', opps
  );
end;
$$;

revoke all on function public.publish_visibility_report(uuid, text) from public, authenticated;
grant execute on function public.publish_visibility_report(uuid, text) to anon;