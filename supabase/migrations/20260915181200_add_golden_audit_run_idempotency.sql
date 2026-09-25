alter table public.audit_runs
  add column if not exists input_hash text;

create index if not exists idx_audit_runs_idempotency
  on public.audit_runs(audit_id, engine_key, input_hash, status);

-- Atomic lock: only a non-active audit may transition into analysing.
create or replace function public.lock_golden_audit_run(p_audit_id uuid)
returns boolean
language plpgsql
security definer
set search_path = public, pg_temp
as $$
declare
  v_updated integer;
begin
  if auth.role() <> 'service_role' then raise exception 'service_role_required'; end if;
  update public.audits
  set status='analysing', started_at=coalesce(started_at,now())
  where id=p_audit_id
    and status not in ('normalising','analysing','diagnosing','reporting','qa');
  get diagnostics v_updated = row_count;
  return v_updated = 1;
end;
$$;

revoke all on function public.lock_golden_audit_run(uuid) from public, anon, authenticated;
grant execute on function public.lock_golden_audit_run(uuid) to service_role;
