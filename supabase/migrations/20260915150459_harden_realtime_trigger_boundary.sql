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

revoke all on function private.broadcast_studio_dashboard_changes()
  from public, anon, authenticated;

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
