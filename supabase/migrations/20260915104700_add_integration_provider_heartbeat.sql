create or replace function public.integration_provider_heartbeat(
  p_provider_key text,
  p_environment text,
  p_status text,
  p_error_message text default null
)
returns void
language plpgsql
security invoker
set search_path = pg_catalog, public, integration
as $$
begin
  if p_status not in ('active','approval_gated','degraded','disabled') then
    raise exception 'invalid_integration_provider_status';
  end if;

  update integration.providers
  set status = p_status,
      last_reconciled_at = now(),
      last_success_at = case when p_status = 'active' then now() else last_success_at end,
      last_error_at = case when p_error_message is not null then now() else last_error_at end,
      last_error_message = p_error_message,
      updated_at = now()
  where business_key = 'inksights_b2b'
    and provider_key = lower(trim(p_provider_key))
    and environment = lower(trim(p_environment));
end;
$$;

revoke all on function public.integration_provider_heartbeat(text,text,text,text) from public, anon, authenticated;
grant execute on function public.integration_provider_heartbeat(text,text,text,text) to service_role;
