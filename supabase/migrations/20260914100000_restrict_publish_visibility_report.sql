-- SECURITY CUTOVER ORDER
-- 1. Deploy the same-origin /api/public/visibility-report route.
-- 2. Verify public report links still resolve through the application.
-- 3. Apply this migration to production.
--
-- Keeping this migration on the feature branch prevents the current production
-- public report from being broken before the replacement server route is live.

revoke execute on function public.publish_visibility_report(uuid, text) from public;
revoke execute on function public.publish_visibility_report(uuid, text) from anon;
revoke execute on function public.publish_visibility_report(uuid, text) from authenticated;
grant execute on function public.publish_visibility_report(uuid, text) to service_role;
