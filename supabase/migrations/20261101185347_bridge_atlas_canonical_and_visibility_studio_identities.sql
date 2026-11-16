-- Explicit audited bridge: public.studios is the audit canonical identity;
-- visibility_studios owns the existing studio_members and verification events.
-- Never link records solely because their names or postcodes look similar.
create table if not exists public.atlas_studio_links (
  studio_id uuid primary key references public.studios(id) on delete restrict,
  visibility_studio_id uuid not null unique references public.visibility_studios(id) on delete restrict,
  evidence jsonb not null default '{}'::jsonb,
  reviewer_id uuid references auth.users(id),
  reviewed_at timestamptz not null default now(),
  created_at timestamptz not null default now()
);
alter table public.atlas_studio_links enable row level security;
revoke all on public.atlas_studio_links from PUBLIC, anon, authenticated;
grant select on public.atlas_studio_links to authenticated;
create policy "atlas_member_reads_own_identity_link" on public.atlas_studio_links
for select to authenticated using (
  exists (
    select 1 from public.studio_members sm
    where sm.studio_id = atlas_studio_links.visibility_studio_id
      and sm.user_id = (select auth.uid()) and sm.active = true
  )
);

drop policy if exists "atlas_member_submits_draft" on public.atlas_profile_drafts;
create policy "atlas_member_submits_draft" on public.atlas_profile_drafts
for insert to authenticated with check (
  user_id = (select auth.uid()) and status = 'pending_review'
  and exists (
    select 1 from public.atlas_studio_links link
    join public.studio_members sm on sm.studio_id = link.visibility_studio_id
    where link.studio_id = atlas_profile_drafts.studio_id
      and sm.user_id = (select auth.uid()) and sm.active = true
      and sm.role in ('owner','admin')
  )
);

drop policy if exists "atlas_member_reads_studio_enquiries" on public.atlas_customer_enquiries;
create policy "atlas_member_reads_studio_enquiries" on public.atlas_customer_enquiries
for select to authenticated using (
  exists (
    select 1 from public.atlas_studio_links link
    join public.studio_members sm on sm.studio_id = link.visibility_studio_id
    where link.studio_id = atlas_customer_enquiries.studio_id
      and sm.user_id = (select auth.uid()) and sm.active = true
      and sm.role in ('owner','admin')
  )
);
