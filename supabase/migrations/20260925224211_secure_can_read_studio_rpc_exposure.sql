create schema if not exists app_private;

revoke all on schema app_private from public;
revoke all on schema app_private from anon;
grant usage on schema app_private to authenticated, service_role;

alter function public.can_read_studio(uuid) set schema app_private;

revoke all on function app_private.can_read_studio(uuid) from public;
revoke all on function app_private.can_read_studio(uuid) from anon;
grant execute on function app_private.can_read_studio(uuid) to authenticated, service_role;
