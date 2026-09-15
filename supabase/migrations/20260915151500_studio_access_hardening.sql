-- INKSIGHTS studio access hardening
-- Preserves the canonical data model while tightening browser-role privileges.

-- 1) Dashboard data is client-readable for active studio members, but canonical
-- intelligence remains backend-owned. Existing tenant predicates are preserved.
do $$
declare
  r record;
  dashboard_tables text[] := array[
    'intelligence_attributions',
    'intelligence_business_profiles',
    'intelligence_decisions',
    'intelligence_diagnoses',
    'intelligence_evidence',
    'intelligence_findings',
    'intelligence_growth_diagnostics',
    'intelligence_interventions',
    'intelligence_learning',
    'intelligence_metric_values',
    'intelligence_opportunity_scores',
    'intelligence_outcomes',
    'intelligence_recommendations',
    'visibility_competitor_observations',
    'visibility_competitors',
    'visibility_keywords',
    'visibility_observations',
    'visibility_opportunities',
    'visibility_pipeline_runs',
    'visibility_provider_observations',
    'visibility_report_runs',
    'visibility_report_snapshots',
    'visibility_search_universe',
    'visibility_serp_observations',
    'visibility_studio_capabilities',
    'visibility_studios'
  ];
  t text;
begin
  -- Convert the existing broad FOR ALL tenant policies into SELECT policies
  -- using the exact existing tenant predicate.
  for r in
    select schemaname, tablename, policyname, qual
    from pg_policies
    where schemaname = 'public'
      and cmd = 'ALL'
      and tablename = any(dashboard_tables)
  loop
    execute format('drop policy %I on %I.%I', r.policyname, r.schemaname, r.tablename);
    execute format(
      'create policy %I on %I.%I for select to authenticated using (%s)',
      r.policyname,
      r.schemaname,
      r.tablename,
      r.qual
    );
  end loop;

  -- Enforce table-level least privilege for browser roles.
  foreach t in array dashboard_tables
  loop
    execute format('revoke all on table public.%I from anon, authenticated', t);
    execute format('grant select on table public.%I to authenticated', t);
  end loop;
end
$$;

-- Decisions and interventions are the two client-contribution surfaces.
-- owner/admin/member may contribute; viewer stays read-only.
grant insert, update on table public.intelligence_decisions to authenticated;
grant insert, update on table public.intelligence_interventions to authenticated;

drop policy if exists "decisions studio contributors insert" on public.intelligence_decisions;
create policy "decisions studio contributors insert"
on public.intelligence_decisions
for insert
to authenticated
with check (
  exists (
    select 1
    from public.studio_members m
    where m.studio_id = intelligence_decisions.studio_id
      and m.user_id = (select auth.uid())
      and m.active
      and m.role in ('owner', 'admin', 'member')
  )
);

drop policy if exists "decisions studio contributors update" on public.intelligence_decisions;
create policy "decisions studio contributors update"
on public.intelligence_decisions
for update
to authenticated
using (
  exists (
    select 1
    from public.studio_members m
    where m.studio_id = intelligence_decisions.studio_id
      and m.user_id = (select auth.uid())
      and m.active
      and m.role in ('owner', 'admin', 'member')
  )
)
with check (
  exists (
    select 1
    from public.studio_members m
    where m.studio_id = intelligence_decisions.studio_id
      and m.user_id = (select auth.uid())
      and m.active
      and m.role in ('owner', 'admin', 'member')
  )
);

drop policy if exists "interventions studio contributors insert" on public.intelligence_interventions;
create policy "interventions studio contributors insert"
on public.intelligence_interventions
for insert
to authenticated
with check (
  exists (
    select 1
    from public.studio_members m
    where m.studio_id = intelligence_interventions.studio_id
      and m.user_id = (select auth.uid())
      and m.active
      and m.role in ('owner', 'admin', 'member')
  )
);

drop policy if exists "interventions studio contributors update" on public.intelligence_interventions;
create policy "interventions studio contributors update"
on public.intelligence_interventions
for update
to authenticated
using (
  exists (
    select 1
    from public.studio_members m
    where m.studio_id = intelligence_interventions.studio_id
      and m.user_id = (select auth.uid())
      and m.active
      and m.role in ('owner', 'admin', 'member')
  )
)
with check (
  exists (
    select 1
    from public.studio_members m
    where m.studio_id = intelligence_interventions.studio_id
      and m.user_id = (select auth.uid())
      and m.active
      and m.role in ('owner', 'admin', 'member')
  )
);

-- Membership rows remain service-managed to prevent privilege escalation and
-- owner lockout. Browser users can read only through the existing own-row policy.
revoke all on table public.studio_members from anon, authenticated;
grant select on table public.studio_members to authenticated;

-- 2) Explicit service-only registry, ingestion, payment and configuration tables.
do $$
declare
  service_tables text[] := array[
    'intelligence_diagnostic_questions',
    'intelligence_diagnostic_templates',
    'intelligence_source_registry',
    'intelligence_taxonomy',
    'orders',
    'public_contact_requests',
    'public_endpoint_rate_limits',
    'revenue_audits',
    'studio_aliases',
    'studio_candidates',
    'studio_change_events',
    'studio_identity_matches',
    'studio_source_observations',
    'studio_sources',
    'studio_verification_events',
    'visibility_provider_configs'
  ];
  t text;
begin
  foreach t in array service_tables
  loop
    execute format('revoke all on table public.%I from public, anon, authenticated', t);
    execute format('grant select, insert, update, delete on table public.%I to service_role', t);
  end loop;
end
$$;

-- 3) Realtime: move the SECURITY DEFINER trigger helper out of the exposed
-- public schema. The managed realtime.messages policies are preserved because
-- they are already correct and owned by Supabase's Realtime service role.
create schema if not exists private;
revoke all on schema private from public, anon, authenticated;

drop trigger if exists studio_dashboard_opportunities_broadcast on public.visibility_opportunities;
drop trigger if exists studio_dashboard_pipeline_runs_broadcast on public.visibility_pipeline_runs;
drop trigger if exists studio_dashboard_report_runs_broadcast on public.visibility_report_runs;

create or replace function private.broadcast_studio_dashboard_changes()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
declare
  studio_uuid uuid;
begin
  studio_uuid := coalesce(new.studio_id, old.studio_id);

  perform realtime.broadcast_changes(
    'studio:' || studio_uuid::text,
    tg_op,
    tg_op,
    tg_table_name,
    tg_table_schema,
    new,
    old
  );

  return null;
end;
$$;

revoke all on function private.broadcast_studio_dashboard_changes() from public, anon, authenticated;

drop function if exists public.broadcast_studio_dashboard_changes();

create trigger studio_dashboard_opportunities_broadcast
after insert or update or delete on public.visibility_opportunities
for each row execute function private.broadcast_studio_dashboard_changes();

create trigger studio_dashboard_pipeline_runs_broadcast
after insert or update or delete on public.visibility_pipeline_runs
for each row execute function private.broadcast_studio_dashboard_changes();

create trigger studio_dashboard_report_runs_broadcast
after insert or update or delete on public.visibility_report_runs
for each row execute function private.broadcast_studio_dashboard_changes();

-- 4) Private report storage. Reports are written by the backend/service role;
-- authenticated studio members can only read objects under their own studio id.
insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values (
  'studio-reports',
  'studio-reports',
  false,
  26214400,
  array['application/pdf', 'application/json']::text[]
)
on conflict (id) do update
set public = false,
    file_size_limit = excluded.file_size_limit,
    allowed_mime_types = excluded.allowed_mime_types;

drop policy if exists "studio report members can read" on storage.objects;
create policy "studio report members can read"
on storage.objects
for select
to authenticated
using (
  bucket_id = 'studio-reports'
  and exists (
    select 1
    from public.studio_members sm
    where sm.user_id = (select auth.uid())
      and sm.active
      and (storage.foldername(name))[1] = sm.studio_id::text
  )
);

-- 5) Re-harden the extension-managed spatial reference table at the privilege
-- layer. RLS is deliberately not enabled because PostGIS may query this table
-- internally; direct browser access is unnecessary.
revoke all on table public.spatial_ref_sys from anon, authenticated;
revoke select on table public.spatial_ref_sys from public;

-- 6) Cover the only foreign key currently reported by the Performance Advisor.
create index if not exists idx_intelligence_economic_opportunities_run_studio
  on public.intelligence_economic_opportunities (run_id, studio_id);
