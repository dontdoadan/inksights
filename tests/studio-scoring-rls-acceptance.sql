-- Simulate Supabase PostgREST's authenticated PostgreSQL role with JWT claims.
-- Executed ONLY inside a disposable PostgreSQL CI service. Rolls back all fixtures.
-- This tests the actual database RLS expressions; it does not create live users.
begin;

insert into public.visibility_studios (id,studio_name)
values ('11111111-1111-4111-8111-111111111111','Tenant QA A'),
       ('22222222-2222-4222-8222-222222222222','Tenant QA B');

insert into public.studio_members(studio_id,user_id,role,active)
values
  ('11111111-1111-4111-8111-111111111111','aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa','member',true),
  ('22222222-2222-4222-8222-222222222222','bbbbbbbb-bbbb-4bbb-8bbb-bbbbbbbbbbbb','owner',true),
  ('11111111-1111-4111-8111-111111111111','cccccccc-cccc-4ccc-8ccc-cccccccccccc','viewer',true),
  ('11111111-1111-4111-8111-111111111111','dddddddd-dddd-4ddd-8ddd-dddddddddddd','admin',false);

insert into public.studio_profile_answers
  (studio_id,field_key,value_json,source_type,verification_status,
   measurement_start,measurement_end,data_notice_version,notice_acknowledged_at)
values
  ('22222222-2222-4222-8222-222222222222','monthly_tattoo_revenue_gbp','9000'::jsonb,
   'studio_reported','unverified','2026-09-01','2026-09-30','2026-11-profile-v1',now());

insert into public.public_tool_submissions
  (id,tool_key,tool_version,submission_key,normalized_inputs,
   result_snapshot,consent_version,canonical_studio_id)
values
  ('eeeeeeee-eeee-4eee-8eee-eeeeeeeeeeee','pricing_benchmark','1',
   'ffffffff-ffff-4fff-8fff-ffffffffffff','{}'::jsonb,'{}'::jsonb,
   '2026-10-tool-v1','22222222-2222-4222-8222-222222222222');

set local role authenticated;
set local request.jwt.claim.sub = 'aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa';

do $$
declare v_rejected boolean := false;
begin
  if (select count(*) from public.visibility_studios) <> 1
    or (select count(*) from public.studio_members) <> 1
    or (select count(*) from public.studio_profile_answers) <> 0
    or (select count(*) from public.public_tool_submissions) <> 0 then
    raise exception 'A studio member can read another studio tenant';
  end if;
  if (select count(*) from public.studio_scoring_models where status='active') <> 2 then
    raise exception 'The scoring model metadata is not visible to authorised users';
  end if;

  insert into public.studio_profile_answers
    (studio_id,field_key,value_json,source_type,verification_status,
     measurement_start,measurement_end,data_notice_version,notice_acknowledged_at)
  values ('11111111-1111-4111-8111-111111111111','monthly_qualified_enquiries','42'::jsonb,
    'studio_reported','unverified','2026-09-01','2026-09-30','2026-11-profile-v1',now());

  if (select count(*) from public.studio_profile_answers) <> 1
    or (select count(*) from public.studio_profile_answer_history) <> 1 then
    raise exception 'Authorised current and historical profile reads failed';
  end if;

  -- A member cannot forge verified financial values.
  begin
    insert into public.studio_profile_answers
      (studio_id,field_key,value_json,source_type,verification_status,
       measurement_start,measurement_end,data_notice_version,notice_acknowledged_at)
    values ('11111111-1111-4111-8111-111111111111','monthly_tattoo_revenue_gbp',
            '900000'::jsonb,'studio_reported','verified',
            '2026-09-01','2026-09-30','2026-11-profile-v1',now());
  exception when others then v_rejected := true;
  end;
  if not v_rejected then raise exception 'Authenticated member forged verified metric'; end if;

  -- A member cannot insert records into another tenant.
  v_rejected := false;
  begin
    insert into public.studio_profile_answers
      (studio_id,field_key,value_json,source_type,verification_status,
       measurement_start,measurement_end,data_notice_version,notice_acknowledged_at)
    values ('22222222-2222-4222-8222-222222222222','monthly_qualified_enquiries',
            '30'::jsonb,'studio_reported','unverified',
            '2026-09-01','2026-09-30','2026-11-profile-v1',now());
  exception when others then v_rejected := true;
  end;
  if not v_rejected then raise exception 'Authenticated member inserted cross-tenant metric'; end if;

  -- A member cannot directly execute service-only receipt claims or scoring.
  if has_function_privilege(current_user,
      'public.claim_public_tool_submission_v1(uuid,uuid,uuid,uuid)','EXECUTE') then
    raise exception 'Client can invoke privileged receipt claim RPC directly';
  end if;
  raise notice 'PASS: authorised member may write unverified own data, not cross-tenant data';
end;
$$;

set local request.jwt.claim.sub = 'cccccccc-cccc-4ccc-8ccc-cccccccccccc';
do $$
declare v_rejected boolean := false;
begin
  if (select count(*) from public.studio_profile_answers) <> 1 then
    raise exception 'Viewer cannot read own studio figures';
  end if;
  begin
    insert into public.studio_profile_answers
      (studio_id,field_key,value_json,source_type,verification_status,
       measurement_start,measurement_end,data_notice_version,notice_acknowledged_at)
    values ('11111111-1111-4111-8111-111111111111','monthly_tattoo_revenue_gbp',
     '42'::jsonb,'studio_reported','unverified','2026-09-01','2026-09-30',
     '2026-11-profile-v1',now());
  exception when others then v_rejected := true;
  end;
  if not v_rejected then raise exception 'Viewer-only member was allowed to write financial data'; end if;
  raise notice 'PASS: viewer may read but cannot edit';
end;
$$;

set local request.jwt.claim.sub = 'dddddddd-dddd-4ddd-8ddd-dddddddddddd';
do $$
begin
  if (select count(*) from public.studio_members) <> 1 then
    raise exception 'Inactive memberships not correctly scoped for self-read';
  end if;
  if (select count(*) from public.visibility_studios) <> 0
    or (select count(*) from public.studio_profile_answers) <> 0 then
    raise exception 'Inactive studio member can access private studio data';
  end if;
  raise notice 'PASS: inactive studio membership denies tenant data access';
end;
$$;

set local request.jwt.claim.sub = 'bbbbbbbb-bbbb-4bbb-8bbb-bbbbbbbbbbbb';
do $$
begin
  if (select count(*) from public.visibility_studios) <> 1
    or (select count(*) from public.studio_profile_answers) <> 1
    or (select count(*) from public.public_tool_submissions) <> 1 then
    raise exception 'Second tenant cannot read its own data or read scope is incorrect';
  end if;
  raise notice 'PASS: second tenant sees only own private rows';
end;
$$;

rollback;
