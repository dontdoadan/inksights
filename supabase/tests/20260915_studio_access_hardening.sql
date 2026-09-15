begin;

-- Structural invariants: no broad tenant write policies remain; Realtime is
-- topic-scoped; the broadcast helper is private; reports are private; the only
-- advisor-reported FK has a covering composite index.
do $$
declare
  broad_policy_count integer;
  service_leaks integer;
begin
  select count(*) into broad_policy_count
  from pg_policies
  where schemaname = 'public'
    and cmd = 'ALL'
    and roles::text like '%authenticated%'
    and (qual ilike '%studio_members%' or with_check ilike '%studio_members%');
  if broad_policy_count <> 0 then
    raise exception 'Expected zero broad authenticated tenant FOR ALL policies, found %', broad_policy_count;
  end if;

  if to_regprocedure('public.broadcast_studio_dashboard_changes()') is not null then
    raise exception 'Public browser-addressable Realtime trigger helper still exists';
  end if;
  if to_regprocedure('private.broadcast_studio_dashboard_changes()') is null then
    raise exception 'Private Realtime trigger helper is missing';
  end if;

  if not exists (
    select 1 from pg_policies
    where schemaname = 'realtime'
      and tablename = 'messages'
      and policyname = 'studio_members_can_receive_dashboard_broadcasts'
      and cmd = 'SELECT'
      and roles::text like '%authenticated%'
      and qual ilike '%realtime.topic()%'
      and qual ilike '%studio_members%'
      and qual ilike '%active%'
  ) then
    raise exception 'Realtime receive policy is missing the active studio/topic boundary';
  end if;

  if not exists (
    select 1 from pg_policies
    where schemaname = 'realtime'
      and tablename = 'messages'
      and policyname = 'studio_members_can_send_presence'
      and cmd = 'INSERT'
      and roles::text like '%authenticated%'
      and with_check ilike '%realtime.topic()%'
      and with_check ilike '%studio_members%'
      and with_check ilike '%active%'
  ) then
    raise exception 'Realtime presence policy is missing the active studio/topic boundary';
  end if;

  if not exists (
    select 1 from storage.buckets
    where id = 'studio-reports' and public = false
  ) then
    raise exception 'Private studio-reports bucket is missing';
  end if;

  if not exists (
    select 1 from pg_indexes
    where schemaname = 'public'
      and tablename = 'intelligence_economic_opportunities'
      and indexdef ~ '\(calculation_run_id, studio_id\)'
  ) then
    raise exception 'Composite calculation_run_id, studio_id index is missing';
  end if;

  select count(*) into service_leaks
  from (values
    ('intelligence_diagnostic_questions'),
    ('intelligence_diagnostic_templates'),
    ('intelligence_source_registry'),
    ('intelligence_taxonomy'),
    ('orders'),
    ('public_contact_requests'),
    ('public_endpoint_rate_limits'),
    ('revenue_audits'),
    ('studio_aliases'),
    ('studio_candidates'),
    ('studio_change_events'),
    ('studio_identity_matches'),
    ('studio_source_observations'),
    ('studio_sources'),
    ('studio_verification_events'),
    ('visibility_provider_configs')
  ) as service_table(name)
  where has_table_privilege('anon', format('public.%I', name), 'SELECT')
     or has_table_privilege('authenticated', format('public.%I', name), 'SELECT')
     or has_table_privilege('authenticated', format('public.%I', name), 'INSERT')
     or has_table_privilege('authenticated', format('public.%I', name), 'UPDATE')
     or has_table_privilege('authenticated', format('public.%I', name), 'DELETE');
  if service_leaks <> 0 then
    raise exception 'One or more service-only tables remain exposed to browser roles';
  end if;
end
$$;

-- Use one real active membership transactionally. All role changes and no-op
-- writes are rolled back at the end; no production business data is altered.
do $$
begin
  if not exists (select 1 from public.studio_members where active) then
    raise exception 'Role regression test requires one active studio_members row';
  end if;
end
$$;

select set_config('inksights.test_user_id', user_id::text, true),
       set_config('inksights.test_studio_id', studio_id::text, true)
from public.studio_members
where active
limit 1;

-- OWNER: read own tenant, contribute to decisions, canonical writes denied.
update public.studio_members set role = 'owner'
where user_id = current_setting('inksights.test_user_id')::uuid
  and studio_id = current_setting('inksights.test_studio_id')::uuid;
set local role authenticated;
select set_config('request.jwt.claim.sub', current_setting('inksights.test_user_id'), true);
do $$
declare r integer; w integer; denied boolean := false;
begin
  select count(*) into r from public.visibility_studios
  where id = current_setting('inksights.test_studio_id')::uuid;
  if r <> 1 then raise exception 'owner cannot read own studio'; end if;

  begin
    update public.visibility_studios set studio_name = studio_name
    where id = current_setting('inksights.test_studio_id')::uuid;
  exception when insufficient_privilege then denied := true;
  end;
  if not denied then raise exception 'owner can directly mutate canonical studio data'; end if;

  with changed as (
    update public.intelligence_decisions set status = status
    where studio_id = current_setting('inksights.test_studio_id')::uuid returning 1
  ) select count(*) into w from changed;
  if w < 1 then raise exception 'owner cannot update studio decisions'; end if;
end
$$;
reset role;

-- ADMIN: read own tenant and contribute to interventions.
update public.studio_members set role = 'admin'
where user_id = current_setting('inksights.test_user_id')::uuid
  and studio_id = current_setting('inksights.test_studio_id')::uuid;
set local role authenticated;
select set_config('request.jwt.claim.sub', current_setting('inksights.test_user_id'), true);
do $$
declare r integer; w integer;
begin
  select count(*) into r from public.visibility_studios
  where id = current_setting('inksights.test_studio_id')::uuid;
  if r <> 1 then raise exception 'admin cannot read own studio'; end if;

  with changed as (
    update public.intelligence_interventions set status = status
    where studio_id = current_setting('inksights.test_studio_id')::uuid returning 1
  ) select count(*) into w from changed;
  if w < 1 then raise exception 'admin cannot update studio interventions'; end if;
end
$$;
reset role;

-- MEMBER: read own tenant and contribute to decisions/interventions.
update public.studio_members set role = 'member'
where user_id = current_setting('inksights.test_user_id')::uuid
  and studio_id = current_setting('inksights.test_studio_id')::uuid;
set local role authenticated;
select set_config('request.jwt.claim.sub', current_setting('inksights.test_user_id'), true);
do $$
declare r integer; w integer;
begin
  select count(*) into r from public.visibility_studios
  where id = current_setting('inksights.test_studio_id')::uuid;
  if r <> 1 then raise exception 'member cannot read own studio'; end if;

  with changed as (
    update public.intelligence_decisions set status = status
    where studio_id = current_setting('inksights.test_studio_id')::uuid returning 1
  ) select count(*) into w from changed;
  if w < 1 then raise exception 'member cannot update studio decisions'; end if;
end
$$;
reset role;

-- VIEWER: read-only tenant access.
update public.studio_members set role = 'viewer'
where user_id = current_setting('inksights.test_user_id')::uuid
  and studio_id = current_setting('inksights.test_studio_id')::uuid;
set local role authenticated;
select set_config('request.jwt.claim.sub', current_setting('inksights.test_user_id'), true);
do $$
declare r integer; w integer;
begin
  select count(*) into r from public.visibility_studios
  where id = current_setting('inksights.test_studio_id')::uuid;
  if r <> 1 then raise exception 'viewer cannot read own studio'; end if;

  with changed as (
    update public.intelligence_decisions set status = status
    where studio_id = current_setting('inksights.test_studio_id')::uuid returning 1
  ) select count(*) into w from changed;
  if w <> 0 then raise exception 'viewer can mutate studio decisions'; end if;
end
$$;
reset role;

-- UNAUTHENTICATED: no tenant data access.
select set_config('request.jwt.claim.sub', '', true);
set local role anon;
do $$
declare r integer; denied boolean := false;
begin
  begin
    select count(*) into r from public.visibility_studios
    where id = current_setting('inksights.test_studio_id')::uuid;
  exception when insufficient_privilege then denied := true;
  end;
  if not denied and coalesce(r, 0) <> 0 then
    raise exception 'anonymous role can read tenant studio data';
  end if;
end
$$;
reset role;

-- SERVICE ROLE: backend access remains intact.
set local role service_role;
do $$
declare r integer; w integer;
begin
  select count(*) into r from public.visibility_studios
  where id = current_setting('inksights.test_studio_id')::uuid;
  if r <> 1 then raise exception 'service role cannot read tenant studio data'; end if;

  with changed as (
    update public.visibility_studios set studio_name = studio_name
    where id = current_setting('inksights.test_studio_id')::uuid returning 1
  ) select count(*) into w from changed;
  if w <> 1 then raise exception 'service role cannot mutate canonical studio data'; end if;
end
$$;
reset role;

rollback;
