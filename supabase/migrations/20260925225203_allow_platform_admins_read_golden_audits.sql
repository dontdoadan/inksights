-- Internal product reconciliation: allow platform owner/admin users to read Golden Audit records.
-- Studio members remain tenant-scoped. This changes read authorization only; browser writes remain service-only.

create or replace function app_private.can_read_studio(p_studio_id uuid)
returns boolean
language sql
stable
security definer
set search_path = ''
as $function$
  select
    exists (
      select 1
      from public.studio_members m
      where m.studio_id = p_studio_id
        and m.user_id = (select auth.uid())
        and m.active
    )
    or exists (
      select 1
      from public.platform_admins a
      where a.user_id = (select auth.uid())
        and a.active
        and a.role in ('owner','admin')
    );
$function$;

revoke all on function app_private.can_read_studio(uuid) from public, anon;
grant execute on function app_private.can_read_studio(uuid) to authenticated, service_role;
