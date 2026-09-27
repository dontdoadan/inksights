-- INKSIGHTS Knowledge & Control Plane v1
-- Prepared on a feature branch. Do not apply to production without the normal schema/RLS approval gate.
--
-- Purpose:
--   * Create one founder-only, queryable knowledge index over existing INKSIGHTS operating state.
--   * Keep canonical ownership in the existing systems of record.
--   * Treat ChatGPT/chat history as working context, never as the authority.
--   * Seed the index from the existing ops_* control plane so it is useful immediately.
--
-- This migration intentionally starts with PostgreSQL full-text search. It does not
-- require an embedding provider or introduce a vector-model dependency in v1.

create table if not exists public.knowledge_items (
  id uuid primary key default gen_random_uuid(),
  knowledge_key text not null unique,
  business_key text not null default 'inksights',
  asset_id uuid references public.ops_assets(id) on delete set null,
  title text not null,
  knowledge_type text not null,
  domain text,
  truth_state text not null default 'current'
    check (truth_state in ('current','intended','proposed','historical','unknown')),
  authority_level text not null default 'supporting'
    check (authority_level in ('canonical','active','supporting','reference')),
  status text not null default 'active'
    check (status in ('active','superseded','archived','conflict')),
  sensitivity text not null default 'internal'
    check (sensitivity in ('public','internal','restricted','client')),
  scope_type text not null default 'global'
    check (scope_type in ('global','system','project','studio','client')),
  scope_key text,
  summary text,
  body text not null default '',
  canonical_uri text,
  source_system_key text,
  source_version text,
  source_hash text,
  tags text[] not null default '{}'::text[],
  provenance jsonb not null default '{}'::jsonb,
  metadata jsonb not null default '{}'::jsonb,
  valid_from timestamptz,
  valid_to timestamptz,
  last_verified_at timestamptz,
  created_by uuid references auth.users(id) on delete set null,
  updated_by uuid references auth.users(id) on delete set null,
  search_vector tsvector generated always as (
    setweight(to_tsvector('english'::regconfig, coalesce(title, '')), 'A') ||
    setweight(to_tsvector('english'::regconfig, coalesce(summary, '')), 'B') ||
    setweight(to_tsvector('english'::regconfig, coalesce(body, '')), 'C')
  ) stored,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

comment on table public.knowledge_items is
  'Founder-only normalized INKSIGHTS knowledge index. Records point back to canonical systems and never make chat memory authoritative.';

create index if not exists knowledge_items_search_vector_idx
  on public.knowledge_items using gin (search_vector);
create index if not exists knowledge_items_domain_idx
  on public.knowledge_items (domain);
create index if not exists knowledge_items_truth_state_idx
  on public.knowledge_items (truth_state);
create index if not exists knowledge_items_scope_idx
  on public.knowledge_items (scope_type, scope_key);
create index if not exists knowledge_items_asset_idx
  on public.knowledge_items (asset_id);

create table if not exists public.knowledge_links (
  id uuid primary key default gen_random_uuid(),
  source_item_id uuid not null references public.knowledge_items(id) on delete cascade,
  target_item_id uuid not null references public.knowledge_items(id) on delete cascade,
  relationship_type text not null,
  metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  unique (source_item_id, target_item_id, relationship_type)
);

comment on table public.knowledge_links is
  'Graph edges between normalized knowledge items, including derived_from, supersedes, depends_on and conflicts_with relationships.';

create table if not exists public.knowledge_query_log (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users(id) on delete set null,
  query_text text not null,
  intent text,
  filters jsonb not null default '{}'::jsonb,
  result_keys text[] not null default '{}'::text[],
  result_count integer not null default 0,
  source text not null default 'internal',
  created_at timestamptz not null default now()
);

comment on table public.knowledge_query_log is
  'Founder knowledge-retrieval telemetry used to improve routing and identify recurring information gaps.';

alter table public.knowledge_items enable row level security;
alter table public.knowledge_links enable row level security;
alter table public.knowledge_query_log enable row level security;

revoke all privileges on table
  public.knowledge_items,
  public.knowledge_links,
  public.knowledge_query_log
from anon, authenticated;

grant select, insert, update, delete on table
  public.knowledge_items,
  public.knowledge_links
to authenticated;

grant select, insert on table public.knowledge_query_log to authenticated;

drop policy if exists "platform admins read knowledge" on public.knowledge_items;
create policy "platform admins read knowledge"
on public.knowledge_items
for select to authenticated
using ((select private.is_platform_admin(array['owner','admin']::text[])));

drop policy if exists "platform admins manage knowledge" on public.knowledge_items;
create policy "platform admins manage knowledge"
on public.knowledge_items
for all to authenticated
using ((select private.is_platform_admin(array['owner','admin']::text[])))
with check ((select private.is_platform_admin(array['owner','admin']::text[])));

drop policy if exists "platform admins read knowledge links" on public.knowledge_links;
create policy "platform admins read knowledge links"
on public.knowledge_links
for select to authenticated
using ((select private.is_platform_admin(array['owner','admin']::text[])));

drop policy if exists "platform admins manage knowledge links" on public.knowledge_links;
create policy "platform admins manage knowledge links"
on public.knowledge_links
for all to authenticated
using ((select private.is_platform_admin(array['owner','admin']::text[])))
with check ((select private.is_platform_admin(array['owner','admin']::text[])));

drop policy if exists "platform admins read knowledge queries" on public.knowledge_query_log;
create policy "platform admins read knowledge queries"
on public.knowledge_query_log
for select to authenticated
using ((select private.is_platform_admin(array['owner','admin']::text[])));

drop policy if exists "platform admins log knowledge queries" on public.knowledge_query_log;
create policy "platform admins log knowledge queries"
on public.knowledge_query_log
for insert to authenticated
with check (
  user_id = (select auth.uid())
  and (select private.is_platform_admin(array['owner','admin']::text[]))
);

create or replace function public.search_knowledge(
  p_query text,
  p_domain text default null,
  p_truth_states text[] default array['current','intended','proposed']::text[],
  p_limit integer default 12
)
returns table (
  id uuid,
  knowledge_key text,
  title text,
  knowledge_type text,
  domain text,
  truth_state text,
  authority_level text,
  status text,
  summary text,
  canonical_uri text,
  source_system_key text,
  source_version text,
  last_verified_at timestamptz,
  score double precision,
  metadata jsonb
)
language sql
stable
security invoker
set search_path = ''
as $function$
  with input as (
    select
      trim(coalesce(p_query, '')) as query_text,
      websearch_to_tsquery('english'::regconfig, trim(coalesce(p_query, ''))) as query_terms
  ),
  ranked as (
    select
      k.id,
      k.knowledge_key,
      k.title,
      k.knowledge_type,
      k.domain,
      k.truth_state,
      k.authority_level,
      k.status,
      k.summary,
      k.canonical_uri,
      k.source_system_key,
      k.source_version,
      k.last_verified_at,
      (
        (ts_rank_cd(k.search_vector, input.query_terms) * 10.0)
        + case k.authority_level
            when 'canonical' then 3.0
            when 'active' then 2.0
            when 'supporting' then 1.0
            else 0.0
          end
        + case k.truth_state
            when 'current' then 2.0
            when 'intended' then 1.0
            when 'proposed' then 0.25
            else 0.0
          end
        + case
            when lower(k.title) = lower(input.query_text) then 2.0
            when lower(k.title) like '%' || lower(input.query_text) || '%' then 0.75
            else 0.0
          end
        + case
            when k.last_verified_at >= now() - interval '90 days' then 0.5
            else 0.0
          end
      )::double precision as score,
      k.metadata
    from public.knowledge_items k
    cross join input
    where k.status = 'active'
      and (p_domain is null or k.domain = p_domain)
      and (p_truth_states is null or k.truth_state = any(p_truth_states))
      and (
        k.search_vector @@ input.query_terms
        or lower(k.title) like '%' || lower(input.query_text) || '%'
        or lower(coalesce(k.summary, '')) like '%' || lower(input.query_text) || '%'
      )
  )
  select *
  from ranked
  order by score desc, last_verified_at desc nulls last, title asc
  limit least(greatest(coalesce(p_limit, 12), 1), 50);
$function$;

revoke all on function public.search_knowledge(text,text,text[],integer) from public, anon;
grant execute on function public.search_knowledge(text,text,text[],integer) to authenticated;

-- Seed the normalized index from the existing control plane.
-- These are searchable mirrors/pointers. Canonical ownership remains unchanged.

insert into public.knowledge_items (
  knowledge_key, business_key, asset_id, title, knowledge_type, domain,
  truth_state, authority_level, status, sensitivity, scope_type,
  summary, body, canonical_uri, source_system_key, source_version, source_hash,
  provenance, metadata, last_verified_at
)
select
  'asset:' || a.asset_key,
  a.business_key,
  a.id,
  a.title,
  a.asset_type,
  a.category,
  case
    when a.status = 'superseded' then 'historical'
    when a.status = 'active' then 'current'
    else 'proposed'
  end,
  case
    when a.status = 'active' and a.review_status = 'verified' then 'active'
    when a.status = 'active' then 'supporting'
    else 'reference'
  end,
  case
    when a.status = 'superseded' then 'superseded'
    when a.status = 'archived' then 'archived'
    else 'active'
  end,
  case when a.sensitivity in ('public','internal','restricted','client') then a.sensitivity else 'internal' end,
  'global',
  concat_ws(' · ', nullif(a.asset_type,''), nullif(a.category,''), nullif(a.review_status,'')),
  concat_ws(E'\n',
    'Asset key: ' || a.asset_key,
    case when a.canonical_uri is not null then 'Canonical URI: ' || a.canonical_uri end,
    case when a.github_repo is not null then 'GitHub: ' || a.github_repo || coalesce('/' || a.github_path, '') end,
    case when a.supabase_reference is not null then 'Supabase: ' || a.supabase_reference end,
    case when a.provenance <> '{}'::jsonb then 'Provenance: ' || a.provenance::text end,
    case when a.metadata <> '{}'::jsonb then 'Metadata: ' || a.metadata::text end
  ),
  a.canonical_uri,
  s.system_key,
  a.version,
  a.content_hash,
  a.provenance,
  a.metadata || jsonb_build_object('mirror_kind','ops_asset'),
  a.last_verified_at
from public.ops_assets a
left join public.ops_systems s on s.id = a.canonical_system_id
where a.business_key = 'inksights'
on conflict (knowledge_key) do update set
  title = excluded.title,
  knowledge_type = excluded.knowledge_type,
  domain = excluded.domain,
  truth_state = excluded.truth_state,
  authority_level = excluded.authority_level,
  status = excluded.status,
  summary = excluded.summary,
  body = excluded.body,
  canonical_uri = excluded.canonical_uri,
  source_system_key = excluded.source_system_key,
  source_version = excluded.source_version,
  source_hash = excluded.source_hash,
  provenance = excluded.provenance,
  metadata = excluded.metadata,
  last_verified_at = excluded.last_verified_at,
  updated_at = now();

insert into public.knowledge_items (
  knowledge_key, business_key, title, knowledge_type, domain,
  truth_state, authority_level, status, sensitivity, scope_type, scope_key,
  summary, body, canonical_uri, source_system_key, provenance, metadata, last_verified_at
)
select
  'system:' || s.system_key,
  'inksights',
  s.name,
  'system',
  s.category,
  case when s.status = 'active' then 'current' else 'historical' end,
  'canonical',
  case when s.status = 'active' then 'active' else 'archived' end,
  'internal',
  'system',
  s.system_key,
  s.canonical_role,
  concat_ws(E'\n',
    'System key: ' || s.system_key,
    'Canonical role: ' || s.canonical_role,
    'Environment: ' || coalesce(s.environment, 'n/a'),
    'Status: ' || s.status,
    'Agent access: ' || coalesce(s.agent_access, 'n/a'),
    case when s.metadata <> '{}'::jsonb then 'Metadata: ' || s.metadata::text end
  ),
  s.base_url,
  s.system_key,
  jsonb_build_object('source','ops_systems'),
  s.metadata || jsonb_build_object('mirror_kind','ops_system'),
  s.verified_at
from public.ops_systems s
where 'inksights' = any(s.business_scope) or s.system_key in ('github','supabase','google_drive','hubspot','stripe','vercel','chatgpt')
on conflict (knowledge_key) do update set
  title = excluded.title,
  domain = excluded.domain,
  truth_state = excluded.truth_state,
  authority_level = excluded.authority_level,
  status = excluded.status,
  summary = excluded.summary,
  body = excluded.body,
  canonical_uri = excluded.canonical_uri,
  metadata = excluded.metadata,
  last_verified_at = excluded.last_verified_at,
  updated_at = now();

insert into public.knowledge_items (
  knowledge_key, business_key, title, knowledge_type, domain,
  truth_state, authority_level, status, sensitivity, scope_type,
  summary, body, source_system_key, source_version, provenance, metadata
)
select
  'workflow:' || w.workflow_key,
  w.business_key,
  w.name,
  'workflow',
  'operations',
  case when w.status = 'active' then 'current' else 'historical' end,
  'active',
  case when w.status = 'active' then 'active' else 'archived' end,
  'internal',
  'global',
  w.purpose,
  concat_ws(E'\n',
    'Workflow key: ' || w.workflow_key,
    'Purpose: ' || w.purpose,
    'Trigger: ' || coalesce(w.trigger_event, 'n/a'),
    'Automation: ' || w.automation_level,
    'Input contract: ' || w.input_contract::text,
    'Steps: ' || w.steps::text,
    'Output contract: ' || w.output_contract::text,
    'Approval rules: ' || w.approval_rules::text
  ),
  'supabase',
  w.version,
  jsonb_build_object('source','ops_workflows'),
  w.metadata || jsonb_build_object('mirror_kind','ops_workflow')
from public.ops_workflows w
where w.business_key = 'inksights'
on conflict (knowledge_key) do update set
  title = excluded.title,
  truth_state = excluded.truth_state,
  status = excluded.status,
  summary = excluded.summary,
  body = excluded.body,
  source_version = excluded.source_version,
  metadata = excluded.metadata,
  updated_at = now();

insert into public.knowledge_items (
  knowledge_key, business_key, title, knowledge_type, domain,
  truth_state, authority_level, status, sensitivity, scope_type,
  summary, body, canonical_uri, source_system_key, provenance, metadata, last_verified_at
)
select
  'decision:' || d.decision_key,
  d.business_key,
  d.title,
  'decision',
  d.decision_type,
  case when d.status = 'approved' then 'current' else 'proposed' end,
  case when d.status = 'approved' then 'canonical' else 'supporting' end,
  'active',
  'internal',
  'global',
  d.decision,
  concat_ws(E'\n',
    'Context: ' || coalesce(d.context, ''),
    'Decision: ' || d.decision,
    'Rationale: ' || coalesce(d.rationale, ''),
    'Impacts: ' || coalesce(d.impacts::text, '{}')
  ),
  'supabase://ops_decisions/' || d.decision_key,
  'supabase',
  jsonb_build_object('source','ops_decisions','approver',d.approver),
  d.metadata || jsonb_build_object('mirror_kind','ops_decision'),
  d.decided_at
from public.ops_decisions d
where d.business_key = 'inksights'
on conflict (knowledge_key) do update set
  title = excluded.title,
  truth_state = excluded.truth_state,
  authority_level = excluded.authority_level,
  summary = excluded.summary,
  body = excluded.body,
  metadata = excluded.metadata,
  last_verified_at = excluded.last_verified_at,
  updated_at = now();

insert into public.knowledge_links (
  source_item_id, target_item_id, relationship_type, metadata
)
select
  source_k.id,
  target_k.id,
  r.relationship_type,
  r.metadata
from public.ops_asset_relationships r
join public.ops_assets source_a on source_a.id = r.source_asset_id
join public.ops_assets target_a on target_a.id = r.target_asset_id
join public.knowledge_items source_k on source_k.knowledge_key = 'asset:' || source_a.asset_key
join public.knowledge_items target_k on target_k.knowledge_key = 'asset:' || target_a.asset_key
on conflict (source_item_id, target_item_id, relationship_type) do nothing;
