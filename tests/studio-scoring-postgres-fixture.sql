-- Minimal PostgreSQL 17 schema fixture matching dependencies of the new
-- INKSIGHTS scoring migration. Synthetic only. Never use in production.
create role anon nologin;
create role authenticated nologin;
create role service_role nologin;
create schema if not exists auth;

create or replace function auth.uid()
returns uuid language sql stable
as $$
  select nullif(current_setting('request.jwt.claim.sub', true), '')::uuid;
$$;

create table public.studios (
  id uuid primary key default gen_random_uuid(),
  name text not null
);
create table public.visibility_studios (
  id uuid primary key default gen_random_uuid(),
  studio_name text not null,
  website_url text,
  artist_count integer not null default 0
);
-- Existing Atlas studio bridge (already live), not a scoring-owned duplicate.
create table public.atlas_studio_links (
  studio_id uuid primary key references public.studios(id) on delete restrict,
  visibility_studio_id uuid not null unique references public.visibility_studios(id) on delete restrict,
  evidence jsonb not null default '{}'::jsonb,
  reviewer_id uuid,
  reviewed_at timestamptz not null default now(),
  created_at timestamptz not null default now()
);
alter table public.atlas_studio_links enable row level security;

create table public.studio_members (
  studio_id uuid not null references public.visibility_studios(id),
  user_id uuid not null,
  active boolean not null default true,
  role text not null default 'owner',
  primary key (studio_id,user_id)
);
create table public.public_tool_submissions (
  id uuid primary key default gen_random_uuid(),
  tool_key text not null,
  tool_version text not null default '1',
  submitted_at timestamptz not null default now(),
  studio_id uuid references public.studios(id),
  normalized_inputs jsonb not null default '{}'::jsonb,
  result_snapshot jsonb not null default '{}'::jsonb,
  submission_key uuid not null unique,
  quality_status text not null default 'unverified_self_report',
  consent_version text
);
alter table public.public_tool_submissions enable row level security;

create table public.intelligence_metric_definitions (
  id uuid primary key default gen_random_uuid(),
  key text not null,
  name text not null,
  description text,
  unit text,
  classification text not null,
  version integer not null,
  formula text,
  status text not null default 'active',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique(key,version)
);
create table public.intelligence_metric_values (
  id uuid primary key default gen_random_uuid(),
  studio_id uuid not null references public.visibility_studios(id),
  metric_definition_id uuid not null references public.intelligence_metric_definitions(id),
  value_numeric numeric,
  value_text text,
  unit text,
  classification text not null,
  confidence numeric,
  observed_at timestamptz,
  source_type text,
  source_ref text,
  lineage jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now()
);
create table public.intelligence_evidence (
  id uuid primary key default gen_random_uuid(),
  studio_id uuid not null references public.visibility_studios(id),
  evidence_type text not null,
  classification text not null,
  source_type text not null,
  source_ref text,
  metric_value_id uuid references public.intelligence_metric_values(id),
  claim text,
  payload jsonb not null default '{}'::jsonb,
  confidence numeric,
  observed_at timestamptz,
  created_at timestamptz not null default now()
);

-- Mirror existing production membership/visibility access controls for JWT/RLS tests.
alter table public.studio_members enable row level security;
create policy "studio members can read own memberships"
on public.studio_members for select to authenticated
using (user_id=(select auth.uid()));
grant usage on schema auth to authenticated;
grant select on public.studio_members to authenticated;

alter table public.visibility_studios enable row level security;
create policy "visibility studios tenant access" on public.visibility_studios
for select to authenticated
using (exists (
 select 1 from public.studio_members sm
 where sm.studio_id=visibility_studios.id and sm.user_id=(select auth.uid()) and sm.active
));
grant select on public.visibility_studios to authenticated;
