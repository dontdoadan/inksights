-- INKSIGHTS least-privilege grant reconciliation.
-- 2026-09-27 audit: align Data API grants with existing RLS and server-only access paths.
-- No tables, rows, policies or functions are dropped or modified.

-- Service-only runtime/telemetry tables are accessed from Edge Functions using
-- server credentials. Browser roles do not need direct table privileges.
revoke all privileges on table public.integration_runtime_config from anon, authenticated;
revoke all privileges on table public.website_events from anon, authenticated;

-- Public CMS content is read-only for anonymous visitors. Authenticated platform
-- admins retain the CRUD privileges required by the existing admin RLS policies.
revoke all privileges on table
  public.cms_pages,
  public.cms_articles,
  public.cms_navigation,
  public.cms_faqs,
  public.cms_site_settings
from anon, authenticated;

grant select on table
  public.cms_pages,
  public.cms_articles,
  public.cms_navigation,
  public.cms_faqs,
  public.cms_site_settings
to anon, authenticated;

grant insert, update, delete on table
  public.cms_pages,
  public.cms_articles,
  public.cms_navigation,
  public.cms_faqs,
  public.cms_site_settings
to authenticated;

-- Platform-admin membership is never anonymous. Authenticated owners/admins
-- remain constrained by the existing row-level policies.
revoke all privileges on table public.platform_admins from anon, authenticated;
grant select, insert, update, delete on table public.platform_admins to authenticated;

-- These intelligence configuration tables are reference data for signed-in
-- application users. Existing RLS exposes active rows read-only, so match grants.
revoke all privileges on table
  public.intelligence_metric_definitions,
  public.intelligence_opportunity_scoring_versions,
  public.intelligence_playbooks
from anon, authenticated;

grant select on table
  public.intelligence_metric_definitions,
  public.intelligence_opportunity_scoring_versions,
  public.intelligence_playbooks
to authenticated;
