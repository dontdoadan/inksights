create extension if not exists pgcrypto;

create table if not exists public.visibility_studio_capabilities (
  id uuid primary key default gen_random_uuid(),
  studio_id uuid not null references public.visibility_studios(id) on delete cascade,
  dimension text not null check (dimension in ('service','style','subject','body_area','problem_need','customer_type','geographic','commercial','informational','competitor','temporal')),
  value text not null,
  normalized_value text not null,
  source_type text not null default 'studio_submitted' check (source_type in ('studio_submitted','website_verified','portfolio_verified','provider_verified','inferred')),
  evidence jsonb not null default '{}'::jsonb,
  confidence numeric(5,2) not null default 1.00 check (confidence >= 0 and confidence <= 1),
  active boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (studio_id, dimension, normalized_value)
);

create table if not exists public.visibility_search_universe (
  id uuid primary key default gen_random_uuid(),
  studio_id uuid not null references public.visibility_studios(id) on delete cascade,
  report_run_id uuid references public.visibility_report_runs(id) on delete set null,
  search_id text not null,
  query text not null,
  canonical_query text not null,
  category text not null,
  service text,
  style text,
  subject text,
  body_area text,
  problem_need text,
  customer_type text,
  location text,
  location_level text,
  intent text not null,
  commercial_intent numeric(5,2) not null default 0 check (commercial_intent between 0 and 100),
  local_relevance numeric(5,2) not null default 0 check (local_relevance between 0 and 100),
  demand numeric(5,2) not null default 0 check (demand between 0 and 100),
  ranking_opportunity numeric(5,2) not null default 0 check (ranking_opportunity between 0 and 100),
  conversion_potential numeric(5,2) not null default 0 check (conversion_potential between 0 and 100),
  studio_relevance numeric(5,2) not null default 0 check (studio_relevance between 0 and 100),
  capability numeric(5,2) not null default 0 check (capability between 0 and 100),
  lsos numeric(7,2) not null default 0 check (lsos between 0 and 100),
  current_position integer,
  competitor_position integer,
  serp_features jsonb not null default '[]'::jsonb,
  content_exists boolean,
  landing_page text,
  portfolio_relevance numeric(5,2),
  business_relevance numeric(5,2),
  semantic_valid boolean not null default true,
  semantic_reason text,
  status text not null default 'candidate' check (status in ('candidate','validated','opportunity','defend','improve','create','expand','ignore')),
  source_type text not null default 'inksights_generated' check (source_type in ('inksights_generated','semrush_verified','studio_submitted','manual')),
  dimension_values jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (studio_id, canonical_query)
);

create table if not exists public.visibility_provider_observations (
  id uuid primary key default gen_random_uuid(),
  pipeline_run_id uuid references public.visibility_pipeline_runs(id) on delete set null,
  report_run_id uuid references public.visibility_report_runs(id) on delete set null,
  studio_id uuid references public.visibility_studios(id) on delete set null,
  provider text not null,
  endpoint text not null,
  request_payload jsonb not null default '{}'::jsonb,
  response_payload jsonb not null default '{}'::jsonb,
  response_status integer,
  units_consumed numeric,
  observed_at timestamptz not null default now(),
  created_at timestamptz not null default now()
);

create table if not exists public.visibility_serp_observations (
  id uuid primary key default gen_random_uuid(),
  studio_id uuid not null references public.visibility_studios(id) on delete cascade,
  report_run_id uuid references public.visibility_report_runs(id) on delete set null,
  search_universe_id uuid references public.visibility_search_universe(id) on delete set null,
  query text not null,
  database text,
  result_position integer,
  result_type text,
  domain text,
  url text,
  title text,
  is_studio boolean not null default false,
  is_competitor boolean not null default false,
  raw_data jsonb not null default '{}'::jsonb,
  source_provider text not null,
  observed_at timestamptz not null default now()
);

create table if not exists public.visibility_competitor_observations (
  id uuid primary key default gen_random_uuid(),
  studio_id uuid not null references public.visibility_studios(id) on delete cascade,
  report_run_id uuid references public.visibility_report_runs(id) on delete set null,
  competitor_name text not null,
  domain text,
  query text,
  rank integer,
  visibility_share numeric,
  keyword_overlap integer,
  raw_data jsonb not null default '{}'::jsonb,
  source_provider text not null,
  observed_at timestamptz not null default now()
);

create index if not exists idx_visibility_capabilities_studio on public.visibility_studio_capabilities(studio_id, dimension, active);
create index if not exists idx_visibility_ssu_studio_status on public.visibility_search_universe(studio_id, status, lsos desc);
create index if not exists idx_visibility_ssu_report on public.visibility_search_universe(report_run_id, lsos desc);
create index if not exists idx_visibility_provider_report on public.visibility_provider_observations(report_run_id, provider, observed_at desc);
create index if not exists idx_visibility_serp_report on public.visibility_serp_observations(report_run_id, query, result_position);
create index if not exists idx_visibility_competitor_report on public.visibility_competitor_observations(report_run_id, competitor_name);

alter table public.visibility_studio_capabilities enable row level security;
alter table public.visibility_search_universe enable row level security;
alter table public.visibility_provider_observations enable row level security;
alter table public.visibility_serp_observations enable row level security;
alter table public.visibility_competitor_observations enable row level security;

create policy "visibility capabilities authenticated management" on public.visibility_studio_capabilities for all to authenticated using (true) with check (true);
create policy "visibility ssu authenticated management" on public.visibility_search_universe for all to authenticated using (true) with check (true);
create policy "visibility provider observations authenticated management" on public.visibility_provider_observations for all to authenticated using (true) with check (true);
create policy "visibility serp authenticated management" on public.visibility_serp_observations for all to authenticated using (true) with check (true);
create policy "visibility competitor authenticated management" on public.visibility_competitor_observations for all to authenticated using (true) with check (true);

create or replace function public.generate_studio_search_universe(p_studio_id uuid, p_report_run_id uuid default null)
returns integer
language plpgsql
security invoker
set search_path = public, pg_catalog
as $$
declare
  v_studio public.visibility_studios%rowtype;
  v_count integer := 0;
  v_area text;
  v_location text;
  v_service text;
  v_style text;
  v_body text;
  v_query text;
  v_canonical text;
  v_intent text;
  v_commercial numeric;
  v_local numeric;
  v_studio_rel numeric;
  v_capability numeric;
  v_position numeric := 100;
  v_demand numeric := 0;
  v_conversion numeric;
  v_lsos numeric;
begin
  select * into v_studio from public.visibility_studios where id = p_studio_id;
  if not found then raise exception 'studio_not_found'; end if;
  v_area := coalesce(nullif(trim(v_studio.town), ''), 'local area');
  v_location := v_area;

  for v_service in select value from public.visibility_studio_capabilities where studio_id=p_studio_id and dimension='service' and active order by value limit 12 loop
    v_query := lower(trim(v_service || ' tattoo ' || v_area));
    v_canonical := regexp_replace(v_query, '\\s+', ' ', 'g');
    v_intent := 'commercial'; v_commercial := 90; v_local := 100; v_studio_rel := 100; v_capability := 100; v_conversion := 75;
    v_lsos := round((v_demand*0.20 + v_commercial*0.20 + v_local*0.15 + v_position*0.20 + v_conversion*0.10 + v_studio_rel*0.10 + v_capability*0.05)::numeric, 2);
    insert into public.visibility_search_universe(studio_id,report_run_id,search_id,query,canonical_query,category,service,location,location_level,intent,commercial_intent,local_relevance,demand,ranking_opportunity,conversion_potential,studio_relevance,capability,lsos,status,source_type,dimension_values)
    values(p_studio_id,p_report_run_id,'SSU-'||substr(replace(gen_random_uuid()::text,'-',''),1,12),v_query,v_canonical,'Service',v_service,v_location,'Local',v_intent,v_commercial,v_local,v_demand,v_position,v_conversion,v_studio_rel,v_capability,v_lsos,'candidate','inksights_generated',jsonb_build_object('service',v_service,'location',v_location))
    on conflict (studio_id, canonical_query) do update set report_run_id=excluded.report_run_id, updated_at=now();
    v_count := v_count + 1;
  end loop;

  for v_style in select value from public.visibility_studio_capabilities where studio_id=p_studio_id and dimension='style' and active order by value limit 12 loop
    v_query := lower(trim(v_style || ' tattoo ' || v_area));
    v_canonical := regexp_replace(v_query, '\\s+', ' ', 'g');
    v_intent := 'commercial'; v_commercial := 92; v_local := 100; v_studio_rel := 100; v_capability := 100; v_conversion := 80;
    v_lsos := round((v_demand*0.20 + v_commercial*0.20 + v_local*0.15 + v_position*0.20 + v_conversion*0.10 + v_studio_rel*0.10 + v_capability*0.05)::numeric, 2);
    insert into public.visibility_search_universe(studio_id,report_run_id,search_id,query,canonical_query,category,style,location,location_level,intent,commercial_intent,local_relevance,demand,ranking_opportunity,conversion_potential,studio_relevance,capability,lsos,status,source_type,dimension_values)
    values(p_studio_id,p_report_run_id,'SSU-'||substr(replace(gen_random_uuid()::text,'-',''),1,12),v_query,v_canonical,'Style',v_style,v_location,'Local',v_intent,v_commercial,v_local,v_demand,v_position,v_conversion,v_studio_rel,v_capability,v_lsos,'candidate','inksights_generated',jsonb_build_object('style',v_style,'location',v_location))
    on conflict (studio_id, canonical_query) do update set report_run_id=excluded.report_run_id, updated_at=now();
    v_count := v_count + 1;
  end loop;

  for v_style in select value from public.visibility_studio_capabilities where studio_id=p_studio_id and dimension='style' and active order by value limit 6 loop
    for v_body in select value from public.visibility_studio_capabilities where studio_id=p_studio_id and dimension='body_area' and active order by value limit 6 loop
      v_query := lower(trim(v_style || ' ' || v_body || ' tattoo ' || v_area));
      v_canonical := regexp_replace(v_query, '\\s+', ' ', 'g');
      v_intent := 'commercial'; v_commercial := 94; v_local := 100; v_studio_rel := 100; v_capability := 100; v_conversion := 85;
      v_lsos := round((v_demand*0.20 + v_commercial*0.20 + v_local*0.15 + v_position*0.20 + v_conversion*0.10 + v_studio_rel*0.10 + v_capability*0.05)::numeric, 2);
      insert into public.visibility_search_universe(studio_id,report_run_id,search_id,query,canonical_query,category,style,body_area,location,location_level,intent,commercial_intent,local_relevance,demand,ranking_opportunity,conversion_potential,studio_relevance,capability,lsos,status,source_type,dimension_values)
      values(p_studio_id,p_report_run_id,'SSU-'||substr(replace(gen_random_uuid()::text,'-',''),1,12),v_query,v_canonical,'Style × Body Area',v_style,v_body,v_location,'Local',v_intent,v_commercial,v_local,v_demand,v_position,v_conversion,v_studio_rel,v_capability,v_lsos,'candidate','inksights_generated',jsonb_build_object('style',v_style,'body_area',v_body,'location',v_location))
      on conflict (studio_id, canonical_query) do update set report_run_id=excluded.report_run_id, updated_at=now();
      v_count := v_count + 1;
    end loop;
  end loop;

  return v_count;
end;
$$;

revoke all on function public.generate_studio_search_universe(uuid,uuid) from public;
grant execute on function public.generate_studio_search_universe(uuid,uuid) to authenticated;
