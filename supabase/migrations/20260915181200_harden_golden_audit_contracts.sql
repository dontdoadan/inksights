-- Harden Golden Audit runtime contracts before first deployment.
-- Adds orchestration cache/locking fields, persists 90-day phases, and hardens service RPCs.

alter table public.audit_runs
  add column if not exists input_hash text;

create index if not exists idx_audit_runs_engine_input
  on public.audit_runs(audit_id, engine_key, input_hash, status, completed_at desc);

alter table public.audit_recommendations
  add column if not exists phase text;

alter table public.audit_recommendations
  drop constraint if exists audit_recommendations_phase_check;

alter table public.audit_recommendations
  add constraint audit_recommendations_phase_check
  check (phase is null or phase in ('0-30','31-60','61-90'));

-- The tenant-read helper already fully qualifies application objects, so use an empty search path.
alter function public.can_read_studio(uuid) set search_path = '';

-- Atomic audit-run lock. service_role is the only caller; no SECURITY DEFINER privilege is needed.
create or replace function public.lock_golden_audit_run(p_audit_id uuid)
returns boolean
language plpgsql
set search_path = ''
as $$
declare
  v_locked boolean := false;
begin
  update public.audits
  set status = 'analysing',
      started_at = coalesce(started_at, pg_catalog.now()),
      completed_at = null
  where id = p_audit_id
    and status not in ('analysing','diagnosing','reporting','qa')
  returning true into v_locked;

  return coalesce(v_locked, false);
end;
$$;

revoke all on function public.lock_golden_audit_run(uuid) from public, anon, authenticated;
grant execute on function public.lock_golden_audit_run(uuid) to service_role;

-- Recreate ledger persistence with an empty search path and no role introspection.
-- EXECUTE privilege, not auth.role(), is the service-only boundary.
create or replace function public.persist_golden_audit_ledger(
  p_audit_id uuid,
  p_source_type text,
  p_source_name text,
  p_storage_path text,
  p_source_hash text,
  p_rows jsonb,
  p_rejected jsonb,
  p_total_pence bigint,
  p_potential_duplicate_rows integer
)
returns jsonb
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_studio_id uuid;
  v_source_id uuid;
  v_source_rows integer := pg_catalog.coalesce(pg_catalog.jsonb_array_length(p_rows),0) + pg_catalog.coalesce(pg_catalog.jsonb_array_length(p_rejected),0);
  v_alias_count integer := 0;
begin
  select studio_id into v_studio_id from public.audits where id = p_audit_id for update;
  if v_studio_id is null then raise exception 'audit_not_found'; end if;

  update public.audits set status='normalising', started_at=pg_catalog.coalesce(started_at,pg_catalog.now()) where id=p_audit_id;

  select id into v_source_id from public.audit_sources
  where audit_id=p_audit_id and source_hash=p_source_hash and source_type=p_source_type;
  if v_source_id is not null then
    return pg_catalog.jsonb_build_object('source_id',v_source_id,'idempotent',true,'client_aliases_created_or_updated',0);
  end if;

  insert into public.audit_sources(audit_id,source_type,source_name,storage_path,source_hash,metadata)
  values (p_audit_id,p_source_type,p_source_name,p_storage_path,p_source_hash,pg_catalog.jsonb_build_object('source_rows',v_source_rows))
  returning id into v_source_id;

  insert into public.clients(studio_id,canonical_label,verification_status,confidence)
  select distinct v_studio_id,row_data->>'normalisedClient','normalised','MEDIUM'
  from pg_catalog.jsonb_array_elements(p_rows) row_data
  where pg_catalog.coalesce(row_data->>'normalisedClient','')<>''
  on conflict (studio_id,canonical_label) do nothing;

  insert into public.client_aliases(studio_id,client_id,raw_label,normalised_label,match_status,confidence)
  select distinct v_studio_id,c.id,row_data->>'rawClient',row_data->>'normalisedClient','normalised','MEDIUM'
  from pg_catalog.jsonb_array_elements(p_rows) row_data
  join public.clients c on c.studio_id=v_studio_id and c.canonical_label=row_data->>'normalisedClient'
  where pg_catalog.coalesce(row_data->>'rawClient','')<>''
  on conflict (studio_id,raw_label) do update set normalised_label=excluded.normalised_label,client_id=excluded.client_id;
  get diagnostics v_alias_count = row_count;

  insert into public.audit_raw_records(audit_id,source_id,source_row,source_row_key,raw_payload,parse_status)
  select p_audit_id,v_source_id,(row_data->>'sourceRow')::integer,row_data->>'sourceRowKey',row_data,'parsed'
  from pg_catalog.jsonb_array_elements(p_rows) row_data
  on conflict (source_id,source_row_key) do nothing;

  insert into public.audit_raw_records(audit_id,source_id,source_row,source_row_key,raw_payload,parse_status,parse_error)
  select p_audit_id,v_source_id,(row_data->>'sourceRow')::integer,
         pg_catalog.encode(extensions.digest(pg_catalog.concat('rejected|',row_data->>'sourceRow','|',row_data->>'raw'),'sha256'),'hex'),
         row_data,'rejected',row_data->>'reason'
  from pg_catalog.jsonb_array_elements(p_rejected) row_data
  on conflict (source_id,source_row_key) do nothing;

  insert into public.transactions(studio_id,audit_source_id,client_id,client_alias_id,transaction_date,amount_pence,currency,raw_reference,duplicate_status,source_row_key)
  select v_studio_id,v_source_id,c.id,ca.id,(row_data->>'date')::date,(row_data->>'amountPence')::bigint,'GBP',row_data->>'rawClient',
         case when pg_catalog.coalesce((row_data->>'potentialDuplicate')::boolean,false) then 'potential_duplicate' else 'clear' end,
         row_data->>'sourceRowKey'
  from pg_catalog.jsonb_array_elements(p_rows) row_data
  join public.clients c on c.studio_id=v_studio_id and c.canonical_label=row_data->>'normalisedClient'
  left join public.client_aliases ca on ca.studio_id=v_studio_id and ca.raw_label=row_data->>'rawClient'
  on conflict (audit_source_id,source_row_key) do nothing;

  return pg_catalog.jsonb_build_object(
    'source_id',v_source_id,'idempotent',false,'source_rows',v_source_rows,
    'parsed_rows',pg_catalog.coalesce(pg_catalog.jsonb_array_length(p_rows),0),'rejected_rows',pg_catalog.coalesce(pg_catalog.jsonb_array_length(p_rejected),0),
    'potential_duplicate_rows',p_potential_duplicate_rows,'total_pence',p_total_pence,
    'client_aliases_created_or_updated',v_alias_count
  );
end;
$$;

revoke all on function public.persist_golden_audit_ledger(uuid,text,text,text,text,jsonb,jsonb,bigint,integer) from public, anon, authenticated;
grant execute on function public.persist_golden_audit_ledger(uuid,text,text,text,text,jsonb,jsonb,bigint,integer) to service_role;
