-- Import rows are immutable to authenticated clients after staging.
-- Trusted server-side normalisation owns row-status and payload transitions.
revoke update on public.bt_import_rows from authenticated;
grant select,insert on public.bt_import_rows to authenticated;
