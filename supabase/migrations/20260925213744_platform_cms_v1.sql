create table if not exists public.platform_admins (
  user_id uuid primary key references auth.users(id) on delete cascade,
  role text not null default 'editor' check (role in ('owner','admin','editor')),
  active boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.cms_pages (
  id uuid primary key default gen_random_uuid(),
  slug text not null unique,
  title text not null,
  page_type text not null default 'page' check (page_type in ('page','landing','legal','resource')),
  status text not null default 'draft' check (status in ('draft','published','archived')),
  excerpt text,
  seo_title text,
  seo_description text,
  canonical_path text,
  content jsonb not null default '{}'::jsonb,
  published_at timestamptz,
  created_by uuid references auth.users(id) on delete set null,
  updated_by uuid references auth.users(id) on delete set null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.cms_articles (
  id uuid primary key default gen_random_uuid(),
  slug text not null unique,
  title text not null,
  status text not null default 'draft' check (status in ('draft','published','archived')),
  category text,
  excerpt text,
  body jsonb not null default '{}'::jsonb,
  seo_title text,
  seo_description text,
  published_at timestamptz,
  created_by uuid references auth.users(id) on delete set null,
  updated_by uuid references auth.users(id) on delete set null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.cms_navigation (
  id uuid primary key default gen_random_uuid(),
  area text not null check (area in ('header','footer','utility')),
  label text not null,
  href text not null,
  sort_order integer not null default 0,
  visible boolean not null default true,
  open_in_new_tab boolean not null default false,
  created_by uuid references auth.users(id) on delete set null,
  updated_by uuid references auth.users(id) on delete set null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.cms_faqs (
  id uuid primary key default gen_random_uuid(),
  scope text not null default 'general',
  question text not null,
  answer text not null,
  sort_order integer not null default 0,
  status text not null default 'draft' check (status in ('draft','published','archived')),
  created_by uuid references auth.users(id) on delete set null,
  updated_by uuid references auth.users(id) on delete set null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.cms_site_settings (
  key text primary key,
  value jsonb not null default '{}'::jsonb,
  description text,
  is_public boolean not null default false,
  updated_by uuid references auth.users(id) on delete set null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table public.platform_admins enable row level security;
alter table public.cms_pages enable row level security;
alter table public.cms_articles enable row level security;
alter table public.cms_navigation enable row level security;
alter table public.cms_faqs enable row level security;
alter table public.cms_site_settings enable row level security;

create or replace function private.is_platform_admin(required_roles text[] default array['owner','admin','editor']::text[])
returns boolean
language sql
stable
security definer
set search_path = ''
as $$
  select exists (
    select 1
    from public.platform_admins a
    where a.user_id = (select auth.uid())
      and a.active
      and a.role = any(required_roles)
  );
$$;

revoke all on function private.is_platform_admin(text[]) from public;
grant execute on function private.is_platform_admin(text[]) to authenticated;

grant select on public.platform_admins to authenticated;
grant insert, update, delete on public.platform_admins to authenticated;
grant select on public.cms_pages, public.cms_articles, public.cms_navigation, public.cms_faqs, public.cms_site_settings to anon, authenticated;
grant insert, update, delete on public.cms_pages, public.cms_articles, public.cms_navigation, public.cms_faqs, public.cms_site_settings to authenticated;

drop policy if exists "platform admins read self or admins" on public.platform_admins;
create policy "platform admins read self or admins" on public.platform_admins for select to authenticated
using (user_id = (select auth.uid()) or (select private.is_platform_admin(array['owner','admin']::text[])));

drop policy if exists "platform owners manage admins" on public.platform_admins;
create policy "platform owners manage admins" on public.platform_admins for all to authenticated
using ((select private.is_platform_admin(array['owner']::text[])))
with check ((select private.is_platform_admin(array['owner']::text[])));

drop policy if exists "public read published cms pages" on public.cms_pages;
create policy "public read published cms pages" on public.cms_pages for select to anon, authenticated
using (status = 'published' or (select private.is_platform_admin()));

drop policy if exists "admins manage cms pages" on public.cms_pages;
create policy "admins manage cms pages" on public.cms_pages for all to authenticated
using ((select private.is_platform_admin())) with check ((select private.is_platform_admin()));

drop policy if exists "public read published cms articles" on public.cms_articles;
create policy "public read published cms articles" on public.cms_articles for select to anon, authenticated
using (status = 'published' or (select private.is_platform_admin()));

drop policy if exists "admins manage cms articles" on public.cms_articles;
create policy "admins manage cms articles" on public.cms_articles for all to authenticated
using ((select private.is_platform_admin())) with check ((select private.is_platform_admin()));

drop policy if exists "public read visible cms navigation" on public.cms_navigation;
create policy "public read visible cms navigation" on public.cms_navigation for select to anon, authenticated
using (visible or (select private.is_platform_admin()));

drop policy if exists "admins manage cms navigation" on public.cms_navigation;
create policy "admins manage cms navigation" on public.cms_navigation for all to authenticated
using ((select private.is_platform_admin())) with check ((select private.is_platform_admin()));

drop policy if exists "public read published cms faqs" on public.cms_faqs;
create policy "public read published cms faqs" on public.cms_faqs for select to anon, authenticated
using (status = 'published' or (select private.is_platform_admin()));

drop policy if exists "admins manage cms faqs" on public.cms_faqs;
create policy "admins manage cms faqs" on public.cms_faqs for all to authenticated
using ((select private.is_platform_admin())) with check ((select private.is_platform_admin()));

drop policy if exists "public read public cms settings" on public.cms_site_settings;
create policy "public read public cms settings" on public.cms_site_settings for select to anon, authenticated
using (is_public or (select private.is_platform_admin()));

drop policy if exists "admins manage cms settings" on public.cms_site_settings;
create policy "admins manage cms settings" on public.cms_site_settings for all to authenticated
using ((select private.is_platform_admin())) with check ((select private.is_platform_admin()));

insert into public.platform_admins (user_id, role, active)
select id, 'owner', true from auth.users order by created_at asc limit 1
on conflict (user_id) do update set role = excluded.role, active = true, updated_at = now();

insert into public.cms_site_settings (key, value, description, is_public)
values
  ('site.identity', jsonb_build_object('name','INKSIGHTS','canonical_url','https://getinksights.co.uk'), 'Public site identity and canonical origin.', true),
  ('site.contact', jsonb_build_object('form_first',true,'fallback_email','dontdoadan@icloud.com'), 'Public contact fallback configuration.', false),
  ('site.commercial', jsonb_build_object('primary_free_offer','revenue-audit-v1','paid_audit_slug','studio-intelligence-audit'), 'Core commercial funnel defaults.', false)
on conflict (key) do nothing;
