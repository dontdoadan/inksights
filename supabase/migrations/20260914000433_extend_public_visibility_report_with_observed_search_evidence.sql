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
  ssu jsonb;
  comps jsonb;
  studio_serps jsonb;
begin
  select * into r
  from public.visibility_report_runs
  where id = p_report_id
    and public_token = p_public_token
    and status = 'published';
  if not found then raise exception 'report_not_found'; end if;
  select * into s from public.visibility_studios where id = r.studio_id;

  select coalesce(jsonb_agg(jsonb_build_object(
    'observation_type',o.observation_type,'entity_name',o.entity_name,'source_provider',o.source_provider,
    'source_reference',o.source_reference,'raw_data',o.raw_data,'observed_at',o.observed_at
  ) order by o.observed_at desc),'[]'::jsonb)
  into obs from public.visibility_observations o where o.studio_id = r.studio_id;

  select coalesce(jsonb_agg(jsonb_build_object(
    'keyword',k.keyword,'search_volume',k.search_volume,'current_rank',k.current_rank,
    'target_url',k.target_url,'keyword_difficulty',k.keyword_difficulty
  ) order by k.search_volume desc),'[]'::jsonb)
  into kws from public.visibility_keywords k where k.studio_id = r.studio_id;

  select coalesce(jsonb_agg(jsonb_build_object(
    'query',u.query,'category',u.category,'service',u.service,'style',u.style,'location',u.location,'intent',u.intent,
    'demand_score',u.demand,'demand_measured',coalesce((u.dimension_values->>'demand_measured')::boolean,false),
    'demand_kind',u.dimension_values->>'demand_kind','demand_signal',u.dimension_values->'demand_signal',
    'provider_position',u.dimension_values->'provider_position','provider',u.dimension_values->>'serp_provider',
    'database',u.dimension_values->>'serp_database','lsos',u.lsos,'status',u.status,'serp_features',u.serp_features
  ) order by u.query),'[]'::jsonb)
  into ssu from public.visibility_search_universe u where u.report_run_id = p_report_id;

  select coalesce(jsonb_agg(jsonb_build_object(
    'domain',c.domain,'competitor_name',c.competitor_name,'query_overlap',c.keyword_overlap,
    'best_observed_position',c.rank,'visibility_share',c.visibility_share,'source_provider',c.source_provider,'observed_at',c.observed_at
  ) order by c.keyword_overlap desc nulls last,c.rank asc nulls last),'[]'::jsonb)
  into comps from public.visibility_competitor_observations c where c.report_run_id = p_report_id;

  select coalesce(jsonb_agg(jsonb_build_object(
    'query',so.query,'provider_position',so.result_position,'url',so.url,'domain',so.domain,'title',so.title,
    'database',so.database,'source_provider',so.source_provider,'observed_at',so.observed_at
  ) order by so.query,so.result_position),'[]'::jsonb)
  into studio_serps from public.visibility_serp_observations so
  where so.report_run_id = p_report_id and so.is_studio = true;

  select coalesce(jsonb_agg(jsonb_build_object(
    'title',o.title,'description',o.description,'lsos_score',o.lsos_score,'priority',o.priority,
    'evidence',o.evidence,'recommended_action',o.recommended_action
  ) order by o.priority,o.created_at),'[]'::jsonb)
  into opps from public.visibility_opportunities o
  where o.studio_id = r.studio_id and o.status <> 'dismissed' and o.evidence->>'report_run_id' = p_report_id::text;

  return jsonb_build_object(
    'report',jsonb_build_object(
      'id',r.id,'report_version',r.report_version,'status',r.status,'visibility_score',r.visibility_score,
      'score_components',r.score_components,'executive_summary',r.executive_summary,'search_demand',r.search_demand,
      'current_visibility',r.current_visibility,'competitor_intelligence',r.competitor_intelligence,
      'opportunity_summary',r.opportunity_summary,'commercial_opportunity',r.commercial_opportunity,
      'action_plan',r.action_plan,'methodology',r.methodology,'qa_checks',r.qa_checks,
      'data_classification',r.data_classification,'published_at',r.published_at,'created_at',r.created_at
    ),
    'studio',jsonb_build_object('studio_name',s.studio_name,'website_url',s.website_url,'town',s.town,'artist_count',s.artist_count),
    'observations',obs,'keywords',kws,'search_universe',ssu,'competitors',comps,
    'studio_search_observations',studio_serps,'opportunities',opps
  );
end;
$$;

revoke all on function public.publish_visibility_report(uuid,text) from public, authenticated;
grant execute on function public.publish_visibility_report(uuid,text) to anon, service_role;
