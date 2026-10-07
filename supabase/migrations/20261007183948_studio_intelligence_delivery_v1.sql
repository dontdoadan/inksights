-- Reuse audit/report stores; isolate the v1 delivery contract from legacy manifests.
begin;
create table public.si_report_access (
 report_id uuid not null references public.report_versions(id) on delete cascade,
 user_id uuid not null references auth.users(id) on delete cascade,
 granted_by uuid references auth.users(id) on delete set null,
 created_at timestamptz not null default now(), primary key(report_id,user_id)
);
create index si_access_user_idx on public.si_report_access(user_id,report_id);
create table public.si_events (
 id uuid primary key default gen_random_uuid(), report_id uuid not null references public.report_versions(id) on delete cascade,
 actor_id uuid references auth.users(id) on delete set null, action text not null, note text not null default '',
 manifest_hash text, created_at timestamptz not null default now()
);
create index si_events_report_idx on public.si_events(report_id,created_at);
create table public.si_progress (
 report_id uuid not null references public.report_versions(id) on delete cascade, recommendation_id text not null,
 status text not null check(status in ('not_started','in_progress','completed','blocked')),
 intervention text not null default '', outcome text not null default '', attribution text not null default '', learning text not null default '',
 updated_by uuid references auth.users(id) on delete set null, updated_at timestamptz not null default now(), primary key(report_id,recommendation_id)
);
alter table public.si_report_access enable row level security;
alter table public.si_events enable row level security;
alter table public.si_progress enable row level security;
revoke all on public.si_report_access,public.si_events,public.si_progress from anon,authenticated;
grant select on public.si_report_access,public.si_events,public.si_progress to authenticated;
grant all on public.si_report_access,public.si_events,public.si_progress to service_role;
create function app_private.si_admin() returns boolean language sql stable security definer set search_path='' as $$
select auth.uid() is not null and exists(select 1 from public.platform_admins where user_id=auth.uid() and active and role in ('owner','admin'));
$$;
revoke all on function app_private.si_admin() from public,anon;
grant execute on function app_private.si_admin() to authenticated;
create policy si_access_read on public.si_report_access for select to authenticated using(user_id=(select auth.uid()) or (select app_private.si_admin()));
create policy si_events_admin_read on public.si_events for select to authenticated using((select app_private.si_admin()));
create policy si_progress_read on public.si_progress for select to authenticated using(exists(select 1 from public.report_versions r where r.id=report_id));
-- Preserve legacy report behaviour, but new-contract drafts never become visible through a studio-wide membership.
drop policy "golden audit report versions tenant read" on public.report_versions;
create policy "golden audit report versions tenant read" on public.report_versions for select to authenticated using (
 case when manifest->>'schemaVersion'='studio-intelligence/1.0' then
 (select app_private.si_admin()) or (status='published' and exists(select 1 from public.si_report_access g where g.report_id=id and g.user_id=(select auth.uid())))
 else exists(select 1 from public.audits a where a.id=audit_id and app_private.can_read_studio(a.studio_id)) end
);
-- Defence in depth: even privileged legacy paths cannot rewrite an approved v1 snapshot.
create function app_private.si_guard_report() returns trigger language plpgsql security definer set search_path='' as $$
begin
 if TG_OP='UPDATE' and old.manifest->>'schemaVersion'='studio-intelligence/1.0' then
  if new.audit_id<>old.audit_id or new.version<>old.version or new.id<>old.id then raise exception 'Report identity is immutable'; end if;
  if old.status<>'draft' and (new.manifest is distinct from old.manifest or new.manifest_hash is distinct from old.manifest_hash) then raise exception 'Approved/reviewed content is immutable; return review to draft or create a new version'; end if;
  if new.status<>old.status and not ((old.status='draft' and new.status='qa') or (old.status='qa' and new.status in ('draft','client_ready')) or (old.status='client_ready' and new.status='published')) then raise exception 'Invalid report transition'; end if;
 end if;
 return new;
end;$$;
revoke all on function app_private.si_guard_report() from public,anon,authenticated;
create trigger si_report_guard before update on public.report_versions for each row execute function app_private.si_guard_report();
create function app_private.si_command(p_action text,p_report uuid,p_payload jsonb) returns uuid language plpgsql security definer set search_path='' as $$
declare r public.report_versions; new_id uuid; studio_id uuid; audit_id uuid; target_user uuid; m jsonb; note text:=coalesce(p_payload->>'note',''); next_status text; rec text;
begin
 if not app_private.si_admin() then raise exception 'Analyst access required' using errcode='42501'; end if;
 if octet_length(p_payload::text)>400000 then raise exception 'Payload too large'; end if;
 if length(note)>1000 then raise exception 'Note too long'; end if;
 if p_action in ('create','save') then
  m:=p_payload->'manifest';
  if m is null or m->>'schemaVersion' is distinct from 'studio-intelligence/1.0' or m->>'calculationVersion' is distinct from '1.0.0' or jsonb_typeof(m->'input')<>'object' or coalesce(jsonb_array_length(m->'input'->'findings'),0)=0 or coalesce(jsonb_array_length(m->'input'->'evidence'),0)=0 or coalesce(jsonb_array_length(m->'input'->'recommendations'),0)=0 then raise exception 'Invalid manifest'; end if;
 end if;
 if p_action='create' then
  if nullif(p_payload->>'studioId','') is not null then
   studio_id:=(p_payload->>'studioId')::uuid;
   if not exists(select 1 from public.studios s where s.id=studio_id and s.name=m->'input'->'studio'->>'name') then raise exception 'Studio name must match the selected existing identity'; end if;
  else
   insert into public.visibility_studios(studio_name,town) values(m->'input'->'studio'->>'name',m->'input'->'studio'->>'location') returning id into studio_id;
   insert into public.studios(id,name,slug,primary_location,internal_validation) values(studio_id,m->'input'->'studio'->>'name','si-'||studio_id::text,m->'input'->'studio'->>'location',(m->'input'->>'representative')::boolean);
  end if;
  insert into public.audits(studio_id,audit_version,mode,period_start,period_end,created_by,context) values(studio_id,'studio-intelligence/1.0','A',(m->'input'->'period'->>'start')::date,(m->'input'->'period'->>'end')::date,auth.uid(),jsonb_build_object('delivery','studio-intelligence/1.0')) returning id into audit_id;
  insert into public.report_versions(audit_id,version,manifest,manifest_hash) values(audit_id,1,m,encode(sha256(convert_to(m::text,'UTF8')),'hex')) returning id into new_id;
 else
  select * into r from public.report_versions where id=p_report for update;
  if r.id is null or r.manifest->>'schemaVersion' is distinct from 'studio-intelligence/1.0' then raise exception 'Report unavailable'; end if;
  new_id:=r.id;
  if p_action in ('save','review','approve','publish') and p_payload->>'expectedHash' is distinct from r.manifest_hash then raise exception 'This report changed. Reload before continuing.'; end if;
  if p_action='save' then
   if r.status<>'draft' then raise exception 'Only drafts can be edited'; end if;
   if m->'input'->'studio' is distinct from r.manifest->'input'->'studio' or m->'input'->'period' is distinct from r.manifest->'input'->'period' or m->'input'->'representative' is distinct from r.manifest->'input'->'representative' then raise exception 'Studio, period and fictional status are fixed for this engagement; create a new report'; end if;
   update public.report_versions set manifest=m,manifest_hash=encode(sha256(convert_to(m::text,'UTF8')),'hex'),generated_at=now() where id=r.id;
  elsif p_action in ('review','approve','publish','return') then
   if length(trim(note))<10 then raise exception 'A review note of at least 10 characters is required'; end if;
   next_status:=case p_action when 'review' then 'qa' when 'approve' then 'client_ready' when 'publish' then 'published' when 'return' then 'draft' end;
   if not ((p_action='review' and r.status='draft') or (p_action in ('approve','return') and r.status='qa') or (p_action='publish' and r.status='client_ready')) then raise exception 'Invalid report transition'; end if;
   update public.report_versions set status=next_status,qa_status=case when next_status in ('client_ready','published') then 'passed' else 'pending' end where id=r.id;
  elsif p_action='clone' then
   perform 1 from public.audits where id=r.audit_id for update;
   if exists(select 1 from public.report_versions where report_versions.audit_id=r.audit_id and status='draft') then raise exception 'An editable draft already exists for this engagement'; end if;
   insert into public.report_versions(audit_id,version,manifest,manifest_hash) select r.audit_id,coalesce(max(version),0)+1,r.manifest,r.manifest_hash from public.report_versions where report_versions.audit_id=r.audit_id returning id into new_id;
  elsif p_action in ('grant','revoke') then
   if r.status<>'published' then raise exception 'Publish before changing client access'; end if;
   select id into target_user from auth.users where lower(email)=lower(trim(p_payload->>'email')) and email_confirmed_at is not null and deleted_at is null;
   if target_user is null then raise exception 'No confirmed INKSIGHTS account found for this email'; end if;
   if p_action='grant' then insert into public.si_report_access(report_id,user_id,granted_by) values(r.id,target_user,auth.uid()) on conflict(report_id,user_id) do nothing;
   else delete from public.si_report_access where report_id=r.id and user_id=target_user; end if;
   note:='Account '||target_user::text;
  elsif p_action='progress' then
   if r.status<>'published' then raise exception 'Progress requires a published report'; end if;
   rec:=p_payload->>'recommendationId';
   if not exists(select 1 from jsonb_array_elements(r.manifest->'input'->'recommendations') x where x->>'id'=rec) then raise exception 'Unknown recommendation'; end if;
   if greatest(length(p_payload->>'intervention'),length(p_payload->>'outcome'),length(p_payload->>'attribution'),length(p_payload->>'learning'))>2000 then raise exception 'Progress note too long'; end if;
   insert into public.si_progress(report_id,recommendation_id,status,intervention,outcome,attribution,learning,updated_by) values(r.id,rec,p_payload->>'status',coalesce(p_payload->>'intervention',''),coalesce(p_payload->>'outcome',''),coalesce(p_payload->>'attribution',''),coalesce(p_payload->>'learning',''),auth.uid()) on conflict(report_id,recommendation_id) do update set status=excluded.status,intervention=excluded.intervention,outcome=excluded.outcome,attribution=excluded.attribution,learning=excluded.learning,updated_by=auth.uid(),updated_at=now();
   note:=rec||': '||(p_payload->>'status');
  else raise exception 'Unsupported action'; end if;
 end if;
 insert into public.si_events(report_id,actor_id,action,note,manifest_hash) select new_id,auth.uid(),p_action,note,manifest_hash from public.report_versions where id=new_id;
 return new_id;
end;$$;
revoke all on function app_private.si_command(text,uuid,jsonb) from public,anon;
grant usage on schema app_private to authenticated;
grant execute on function app_private.si_command(text,uuid,jsonb) to authenticated;
create function public.si_command(p_action text,p_report uuid default null,p_payload jsonb default '{}'::jsonb) returns uuid language sql security invoker set search_path='' as $$ select app_private.si_command(p_action,p_report,p_payload); $$;
revoke all on function public.si_command(text,uuid,jsonb) from public,anon;
grant execute on function public.si_command(text,uuid,jsonb) to authenticated;
comment on function public.si_command(text,uuid,jsonb) is 'Narrow admin-only Studio Intelligence authoring API; checks live platform role, immutable lifecycle and explicit client grants.';
commit;
