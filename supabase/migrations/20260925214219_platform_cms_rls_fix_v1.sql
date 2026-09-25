grant usage on schema private to authenticated;

drop policy if exists "public read published cms pages" on public.cms_pages;
drop policy if exists "admins read all cms pages" on public.cms_pages;
create policy "public read published cms pages"
on public.cms_pages for select
to anon, authenticated
using (status = 'published');
create policy "admins read all cms pages"
on public.cms_pages for select
to authenticated
using ((select private.is_platform_admin()));

drop policy if exists "public read published cms articles" on public.cms_articles;
drop policy if exists "admins read all cms articles" on public.cms_articles;
create policy "public read published cms articles"
on public.cms_articles for select
to anon, authenticated
using (status = 'published');
create policy "admins read all cms articles"
on public.cms_articles for select
to authenticated
using ((select private.is_platform_admin()));

drop policy if exists "public read visible cms navigation" on public.cms_navigation;
drop policy if exists "admins read all cms navigation" on public.cms_navigation;
create policy "public read visible cms navigation"
on public.cms_navigation for select
to anon, authenticated
using (visible);
create policy "admins read all cms navigation"
on public.cms_navigation for select
to authenticated
using ((select private.is_platform_admin()));

drop policy if exists "public read published cms faqs" on public.cms_faqs;
drop policy if exists "admins read all cms faqs" on public.cms_faqs;
create policy "public read published cms faqs"
on public.cms_faqs for select
to anon, authenticated
using (status = 'published');
create policy "admins read all cms faqs"
on public.cms_faqs for select
to authenticated
using ((select private.is_platform_admin()));

drop policy if exists "public read public cms settings" on public.cms_site_settings;
drop policy if exists "admins read all cms settings" on public.cms_site_settings;
create policy "public read public cms settings"
on public.cms_site_settings for select
to anon, authenticated
using (is_public);
create policy "admins read all cms settings"
on public.cms_site_settings for select
to authenticated
using ((select private.is_platform_admin()));
