begin;

-- Structural security invariants.
do $$
declare
  broad_policy_count integer;
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

  if has_table_privilege('anon', 'public.spatial_ref_sys', 'SELECT')
     or has_table_privilege('authenticated', 'public.spatial_ref_sys', 'SELECT') then
    raise exception 'spatial_ref_sys remains readable by browser roles';
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
      and indexdef ~ '\\(run_id, studio_id\\)'
  ) then
    raise exception 'Composite run_id, studio_id index is missing';
  end if;
end
$$;

-- Capture one existing active membership for transactional role tests.
do $$
begin
  if not exists (select 1 from public.studio_members where active) then
    raise exception 'Role regression test requires one active studio_members row';
  end if;
end
$$;

select set_config('inksights.test_user_id', user_id::text, true),
       set_config('inksights.test_studio_id', studio_id::text, true),
       set_config('inksights.test_original_role', role, true)
from public.studio_members
where active
limit 1;

-- OWNER: tenant read + action writes, no direct canonical studio mutation.
update public.studio_members
set role = 'owner'
where user_id = current_setting('inksights.test_user_id')::uuid
  and studio_id = current_setting('inksights.test_studio_id')::uuid;
set local role authenticated;
select set_config('request.jwt.claim.sub', current_setting('inksights.test_user_id'), true);
do $$
declare
  visible_count integer;
  canonical_updates integer;
  action_updates integer;
begin
  select count(*) into visible_count
  from public.visibility_studios
  where id = current_setting('inksights.test_studio_id')::uuid;
  if visible_count <> 1 then raise exception 'owner cannot read own studio'; end if;

  with changed as (
    update public.visibility_studios
    set studio_name = studio_name
    where id = current_setting('inksights.test_studio_id')::uuid
    returning 1
  ) select count(*) into canonical_updates from changed;
  if canonical_updates <> 0 then raise exception 'owner can directly mutate canonical studio data'; end if;

  with changed as (
    update public.intelligence_decisions
    set status = status
    where studio_id = current_setting('inksights.test_studio_id')::uuid
    returning 1
  ) select count(*) into action_updates from changed;
  if action_updates < 1 then raise exception 'owner cannot update studio decisions'; end if;
end
$$;
reset role;

-- ADMIN: same operational contribution scope as owner, without direct membership mutation.
update public.studio_members
set role = 'admin'
where user_id = current_setting('inksights.test_user_id')::uuid
  and studio_id = current_setting('inksights.test_studio_id')::uuid;
set local role authenticated;
select set_config('request.jwt.claim.sub', current_setting('inksights.test_user_id'), true);
do $$
declare
  visible_count integer;
  action_updates integer;
begin
  select count(*) into visible_count
  from public.visibility_studios
  where id = current_setting('inksights.test_studio_id')::uuid;
  if visible_count <> 1 then raise exception 'admin cannot read own studio'; end if;

  with changed as (
    update public.intelligence_interventions
    set status = status
    where studio_id = current_setting('inksights.test_studio_id')::uuid
    returning 1
  ) select count(*) into action_updates from changed;
  if action_updates < 1 then raise exception 'admin cannot update studio interventions'; end if;
end
$$;
reset role;

-- MEMBER: read + contribute to decisions/interventions.
update public.studio_members
set role = 'member'
where user_id = current_setting('inksights.test_user_id')::uuid
  and studio_id = current_setting('inksights.test_studio_id')::uuid;
set local role authenticated;
select set_config('request.jwt.claim.sub', current_setting('inksights.test_user_id'), true);
do $$
declare
  visible_count integer;
  action_updates integer;
begin
  select count(*) into visible_count
  from public.visibility_studios
  where id = current_setting('inksights.test_studio_id')::uuid;
  if visible_count <> 1 then raise exception 'member cannot read own studio'; end if;

  with changed as (
    update public.intelligence_decisions
    set status = status
    where studio_id = current_setting('inksights.test_studio_id')::uuid
    returning 1
  ) select count(*) into action_updates from changed;
  if action_updates < 1 then raise exception 'member cannot update studio decisions'; end if;
end
$$;
reset role;

-- VIEWER: read-only.
update public.studio_members
set role = 'viewer'
where user_id = current_setting('inksights.test_user_id')::uuid
  and studio_id = current_setting('inksights.test_studio_id')::uuid;
set local role authenticated;
select set_config('request.jwt.claim.sub', current_setting('inksights.test_user_id'), true);
do $$
declare
  visible_count integer;
  action_updates integer;
begin
  select count(*) into visible_count
  from public.visibility_studios
  where id = current_setting('inksights.test_studio_id')::uuid;
  if visible_count <> 1 then raise exception 'viewer cannot read own studio'; end if;

  with changed as (
    update public.intelligence_decisions
    set status = status
    where studio_id = current_setting('inksights.test_studio_id')::uuid
    returning 1
  ) select count(*) into action_updates from changed;
  if action_updates <> 0 then raise exception 'viewer can mutate studio decisions'; end if;
end
$$;
reset role;

-- UNAUTHENTICATED: no tenant visibility or action writes.
select set_config('request.jwt.claim.sub', '', true);
set local role anon;
do $$
declare
  visible_count integer;
  action_updates integer;
begin
  select count(*) into visible_count
  from public.visibility_studios
  where id = current_setting('inksights.test_studio_id')::uuid;
  if visible_count <> 0 then raise exception 'anonymous role can read tenant studio data'; end if;

  with changed as (
    update public.intelligence_decisions
    set status = status
    where studio_id = current_setting('inksights.test_studio_id')::uuid
    returning 1
  ) select count(*) into action_updates from changed;
  if action_updates <> 0 then raise exception 'anonymous role can mutate decisions'; end if;
end
$$;
reset role;

-- SERVICE ROLE: retains backend access.
set local role service_role;
do $$
declare
  visible_count integer;
  canonical_updates integer;
begin
  select count(*) into visible_count
  from public.visibility_studios
  where id = current_setting('inksights.test_studio_id')::uuid;
  if visible_count <> 1 then raise exception 'service role cannot read tenant studio data'; end if;

  with changed as (
    update public.visibility_studios
    set studio_name = studio_name
    where id = current_setting('inksights.test_studio_id')::uuid
    returning 1
  ) select count(*) into canonical_updates from changed;
  if canonical_updates <> 1 then raise exception 'service role cannot mutate canonical studio data'; end if;
end
$$;
reset role;

rollback;
