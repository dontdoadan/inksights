-- INKSIGHT Studio Visibility Intelligence V2
-- Source-of-truth migration. Applied to the current INKSIGHTS Supabase project.
-- The production migration contains the same schema, indexes, RLS policies and report functions.

create extension if not exists pgcrypto;

create table if not exists public.visibility_studios (
  id uuid primary key default gen_random_uuid(), studio_name text not null, website_url text,
  trading_address text, postcode text, town text, region text default 'UK',
  artist_count integer not null default 0 check (artist_count >= 0),
  location_count integer not null default 1 check (location_count >= 0),
  average_booking_value_pence bigint not null default 0 check (average_booking_value_pence >= 0),
  monthly_search_to_booking_rate numeric(8,5) not null default 0.03 check (monthly_search_to_booking_rate between 0 and 1),
  status text not null default 'draft' check (status in ('draft','collecting','ready','published','archived')),
  created_at timestamptz not null default now(), updated_at timestamptz not null default now()
);

create table if not exists public.visibility_keywords (
  id uuid primary key default gen_random_uuid(), studio_id uuid not null references public.visibility_studios(id) on delete cascade,
  keyword text not null, normalized_keyword text generated always as (lower(btrim(keyword))) stored,
  keyword_group text not null default 'other' check (keyword_group in ('core','service','style','area','brand','competitor','other')),
  search_intent text not null default 'mixed' check (search_intent in ('transactional','commercial','local','informational','navigational','mixed','unknown')),
  search_volume integer not null default 0 check (search_volume >= 0), cpc_pence integer not null default 0 check (cpc_pence >= 0),
  keyword_difficulty numeric(6,2), current_rank integer check (current_rank is null or current_rank between 1 and 1000),
  previous_rank integer check (previous_rank is null or previous_rank between 1 and 1000), local_pack_present boolean, target_url text,
  observed_at timestamptz not null default now(), source_provider text not null default 'manual', raw_data jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(), unique(studio_id, normalized_keyword, observed_at)
);

create table if not exists public.visibility_competitors (
  id uuid primary key default gen_random_uuid(), studio_id uuid not null references public.visibility_studios(id) on delete cascade,
  competitor_name text not null, domain text, local_area text, authority_score numeric(6,2), estimated_traffic numeric(14,2), notes text,
  source_provider text not null default 'manual', raw_data jsonb not null default '{}'::jsonb, observed_at timestamptz not null default now(), created_at timestamptz not null default now()
);

create table if not exists public.visibility_observations (
  id bigint generated always as identity primary key, studio_id uuid not null references public.visibility_studios(id) on delete cascade,
  keyword_id uuid references public.visibility_keywords(id) on delete set null,
  observation_type text not null check (observation_type in ('ranking','serp','website','gbp','technical','competitor','manual')),
  entity_name text, metric_name text, metric_value numeric, metric_text text, source_provider text not null, source_reference text,
  observed_at timestamptz not null default now(), raw_data jsonb not null default '{}'::jsonb
);

create table if not exists public.visibility_opportunities (
  id uuid primary key default gen_random_uuid(), studio_id uuid not null references public.visibility_studios(id) on delete cascade,
  keyword_id uuid references public.visibility_keywords(id) on delete set null,
  opportunity_type text not null check (opportunity_type in ('striking_distance','content_gap','local_gap','competitor_gap','low_ctr','indexing','technical','authority','manual')),
  title text not null, description text not null,
  demand_score numeric(6,2) not null default 0 check (demand_score between 0 and 100), commercial_intent_score numeric(6,2) not null default 0 check (commercial_intent_score between 0 and 100),
  local_relevance_score numeric(6,2) not null default 0 check (local_relevance_score between 0 and 100), position_opportunity_score numeric(6,2) not null default 0 check (position_opportunity_score between 0 and 100),
  conversion_potential_score numeric(6,2) not null default 0 check (conversion_potential_score between 0 and 100), lsos_score numeric(8,2) not null default 0 check (lsos_score between 0 and 100),
  estimated_monthly_clicks numeric(14,2) not null default 0, estimated_monthly_enquiries numeric(14,2) not null default 0, estimated_monthly_revenue_pence bigint not null default 0,
  priority integer not null default 5 check (priority between 1 and 5), recommended_action text,
  status text not null default 'open' check (status in ('open','accepted','in_progress','resolved','dismissed')),
  evidence jsonb not null default '{}'::jsonb, created_at timestamptz not null default now(), updated_at timestamptz not null default now()
);

create table if not exists public.visibility_report_runs (
  id uuid primary key default gen_random_uuid(), studio_id uuid not null references public.visibility_studios(id) on delete cascade,
  report_version text not null default 'visibility-report-v2', reporting_period_start date, reporting_period_end date,
  status text not null default 'draft' check (status in ('draft','collecting','analysing','qa','approved','published','failed','cancelled')),
  visibility_score integer check (visibility_score is null or visibility_score between 0 and 100), score_components jsonb not null default '{}'::jsonb,
  executive_summary text, search_demand jsonb not null default '{}'::jsonb, current_visibility jsonb not null default '{}'::jsonb,
  competitor_intelligence jsonb not null default '{}'::jsonb, opportunity_summary jsonb not null default '{}'::jsonb, commercial_opportunity jsonb not null default '{}'::jsonb,
  action_plan jsonb not null default '[]'::jsonb, methodology jsonb not null default '{}'::jsonb, qa_checks jsonb not null default '{}'::jsonb,
  data_classification text not null default 'internal_unverified' check (data_classification in ('sample','internal_test','internal_unverified','external_unverified','verified_client')),
  approval_required boolean not null default true, approved_at timestamptz, published_at timestamptz, created_at timestamptz not null default now(), updated_at timestamptz not null default now()
);

create table if not exists public.visibility_report_snapshots (
  id uuid primary key default gen_random_uuid(), report_run_id uuid not null references public.visibility_report_runs(id) on delete cascade,
  snapshot_type text not null check (snapshot_type in ('keyword','competitor','score','technical','gbp','revenue','full')),
  snapshot jsonb not null default '{}'::jsonb, captured_at timestamptz not null default now()
);

create table if not exists public.visibility_pipeline_runs (
  id uuid primary key default gen_random_uuid(), studio_id uuid references public.visibility_studios(id) on delete cascade, report_run_id uuid references public.visibility_report_runs(id) on delete cascade,
  provider text not null, stage text not null, status text not null default 'started' check (status in ('started','success','partial','failed','blocked')),
  records_read integer not null default 0, records_written integer not null default 0, error_message text, input_payload jsonb not null default '{}'::jsonb, output_payload jsonb not null default '{}'::jsonb,
  started_at timestamptz not null default now(), completed_at timestamptz
);

create index if not exists idx_visibility_keywords_studio on public.visibility_keywords(studio_id);
create index if not exists idx_visibility_keywords_rank on public.visibility_keywords(studio_id,current_rank);
create index if not exists idx_visibility_keywords_volume on public.visibility_keywords(studio_id,search_volume desc);
create index if not exists idx_visibility_opportunities_studio_lso on public.visibility_opportunities(studio_id,lsos_score desc);
create index if not exists idx_visibility_reports_studio_created on public.visibility_report_runs(studio_id,created_at desc);
create index if not exists idx_visibility_observations_studio_time on public.visibility_observations(studio_id,observed_at desc);

alter table public.visibility_studios enable row level security;
alter table public.visibility_keywords enable row level security;
alter table public.visibility_competitors enable row level security;
alter table public.visibility_observations enable row level security;
alter table public.visibility_opportunities enable row level security;
alter table public.visibility_report_runs enable row level security;
alter table public.visibility_report_snapshots enable row level security;
alter table public.visibility_pipeline_runs enable row level security;

create policy "authenticated users can manage visibility studios" on public.visibility_studios for all to authenticated using (true) with check (true);
create policy "authenticated users can manage visibility keywords" on public.visibility_keywords for all to authenticated using (true) with check (true);
create policy "authenticated users can manage visibility competitors" on public.visibility_competitors for all to authenticated using (true) with check (true);
create policy "authenticated users can manage visibility observations" on public.visibility_observations for all to authenticated using (true) with check (true);
create policy "authenticated users can manage visibility opportunities" on public.visibility_opportunities for all to authenticated using (true) with check (true);
create policy "authenticated users can manage visibility reports" on public.visibility_report_runs for all to authenticated using (true) with check (true);
create policy "authenticated users can manage visibility snapshots" on public.visibility_report_snapshots for all to authenticated using (true) with check (true);
create policy "authenticated users can manage visibility pipeline" on public.visibility_pipeline_runs for all to authenticated using (true) with check (true);

create or replace function public.calculate_visibility_lso(p_demand numeric,p_intent numeric,p_local numeric,p_position numeric,p_conversion numeric)
returns numeric language sql immutable as $$ select round(greatest(0,least(100,(greatest(0,least(100,p_demand))*greatest(0,least(100,p_intent))*greatest(0,least(100,p_local))*greatest(0,least(100,p_position))*greatest(0,least(100,p_conversion)))/100000000)),2) $$;

create or replace function public.generate_visibility_report(p_report_run_id uuid)
returns jsonb language plpgsql as $$
declare v_studio public.visibility_studios%rowtype; v_score integer; v_components jsonb; v_opportunities jsonb; v_result jsonb;
begin
 select s.* into v_studio from public.visibility_studios s join public.visibility_report_runs r on r.studio_id=s.id where r.id=p_report_run_id;
 if not found then raise exception 'Report run not found'; end if;
 select coalesce(round(avg(case when current_rank is null then 0 when current_rank<=3 then 100 when current_rank<=10 then 85 when current_rank<=20 then 65 when current_rank<=50 then 35 else 10 end)),0)::integer into v_score from public.visibility_keywords where studio_id=v_studio.id;
 select jsonb_build_object('keyword_visibility',coalesce(round(avg(case when current_rank is null then 0 when current_rank<=10 then 100 when current_rank<=20 then 70 when current_rank<=50 then 40 else 10 end)),0),'top_10_share',coalesce(round(100.0*count(*) filter(where current_rank<=10)/nullif(count(*),0),1),0),'tracked_keywords',count(*),'total_search_volume',coalesce(sum(search_volume),0)) into v_components from public.visibility_keywords where studio_id=v_studio.id;
 select coalesce(jsonb_agg(to_jsonb(x) order by x.lsos_score desc),'[]'::jsonb) into v_opportunities from (select k.keyword,k.search_volume,k.current_rank,public.calculate_visibility_lso((least(100::numeric,20+ln(greatest(k.search_volume,1)+1)*12))::numeric,(case when k.search_intent in ('transactional','commercial','local') then 90 else 55 end)::numeric,(case when k.keyword_group in ('area','service','style','core') then 90 else 55 end)::numeric,(case when k.current_rank is null then 100 when k.current_rank<=3 then 15 when k.current_rank<=10 then 55 when k.current_rank<=20 then 80 else 100 end)::numeric,(case when k.search_intent in ('transactional','commercial','local') then 85 else 45 end)::numeric) as lsos_score from public.visibility_keywords k where k.studio_id=v_studio.id order by lsos_score desc limit 10) x;
 v_result:=jsonb_build_object('studio',jsonb_build_object('id',v_studio.id,'name',v_studio.studio_name,'website',v_studio.website_url),'visibility_score',v_score,'score_components',v_components,'top_opportunities',v_opportunities,'methodology',jsonb_build_object('formula','Demand × Commercial Intent × Local Relevance × Search Position Opportunity × Conversion Potential','classification','modelled opportunity; not verified lost revenue'));
 update public.visibility_report_runs set visibility_score=v_score,score_components=v_components,opportunity_summary=jsonb_build_object('top_opportunities',v_opportunities),methodology=v_result->'methodology',status='qa',updated_at=now() where id=p_report_run_id;
 return v_result;
end; $$;

grant execute on function public.calculate_visibility_lso(numeric,numeric,numeric,numeric,numeric) to authenticated;
grant execute on function public.generate_visibility_report(uuid) to authenticated;
