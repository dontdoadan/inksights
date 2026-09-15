-- SECURITY CUTOVER ORDER
-- 1. Deploy the same-origin /api/public/visibility-report route.
-- 2. Verify public report links still resolve through the application.
-- 3. Apply this migration to production.
--
-- Production cutover completed on 2026-09-15 after the same-origin route
-- returned a real published report successfully. This filename matches the
-- migration version recorded by Supabase production migration history.

revoke execute on function public.publish_visibility_report(uuid, text) from public;
revoke execute on function public.publish_visibility_report(uuid, text) from anon;
revoke execute on function public.publish_visibility_report(uuid, text) from authenticated;
grant execute on function public.publish_visibility_report(uuid, text) to service_role;
