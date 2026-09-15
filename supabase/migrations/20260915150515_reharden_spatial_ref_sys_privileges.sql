-- PostGIS owns public.spatial_ref_sys in this project. Revoke browser-role
-- privileges where permitted. Supabase may retain or restore extension-owned
-- grants; the Security Advisor residual is documented rather than forcing RLS
-- or a destructive PostGIS relocation.
revoke all on table public.spatial_ref_sys from anon, authenticated;
revoke select on table public.spatial_ref_sys from public;
