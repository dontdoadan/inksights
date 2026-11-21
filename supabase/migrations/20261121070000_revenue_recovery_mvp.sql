-- INKSIGHTS Revenue Recovery MVP
-- Additive-only schema. All tenant data is isolated through existing studio_members memberships.

create table if not exists public.recovery_imports (
  id uuid primary key default gen_random_uuid(),
  studio_id uuid not null references public.studios(id) on delete cascade,
  uploaded_by uuid not null references auth.users(id) on delete restrict,
  file_name text not null check (char_length(file_name) between 1 and 255),
  record_type text not null check (record_type in ('clients','projects','enquiries')),
  import_hash text not null check (char_length(import_hash) = 64),
  row_count integer not null default 0 check (row_count >= 0),
  inserted_count integer not null default 0 check (inserted_count >= 0),
  duplicate_count integer not null default 0 check (duplicate_count >= 0),
  created_at timestamptz not null default now(),
  unique (studio_id, import_hash)
);

create table if not exists public.recovery_records (
  id uuid primary key default gen_random_uuid(),
  studio_id uuid not null references public.studios(id) on delete cascade,
  import_id uuid not null references public.recovery_imports(id) on delete cascade,
  record_type text not null check (record_type in ('clients','projects','enquiries')),
  dedupe_key text not null check (char_length(dedupe_key) = 64),
  client_name text,
  client_email text,
  client_phone text,
  occurred_at date,
  amount_pence bigint check (amount_pence is null or amount_pence >= 0),
  data jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  unique (studio_id, record_type, dedupe_key)
);

create index if not exists recovery_records_studio_type_date_idx
  on public.recovery_records (studio_id, record_type, occurred_at desc);
create index if not exists recovery_records_studio_email_idx
  on public.recovery_records (studio_id, lower(client_email));

create table if not exists public.recovery_opportunities (
  id uuid primary key default gen_random_uuid(),
  studio_id uuid not null references public.studios(id) on delete cascade,
  record_id uuid not null references public.recovery_records(id) on delete cascade,
  category text not null check (category in ('inactive_project','unconverted_enquiry','inactive_client')),
  priority text not null default 'medium' check (priority in ('high','medium','low')),
  status text not null default 'identified' check (status in ('identified','reviewed','approved','contacted','booked','paid','dismissed')),
  estimated_value_pence bigint not null default 0 check (estimated_value_pence >= 0),
  confidence_score numeric(4,3) not null default 0.5 check (confidence_score >= 0 and confidence_score <= 1),
  evidence jsonb not null default '{}'::jsonb,
  recommendation text not null,
  draft_subject text,
  draft_message text,
  approved_by uuid references auth.users(id) on delete set null,
  approved_at timestamptz,
  contacted_at timestamptz,
  booked_at timestamptz,
  recovered_amount_pence bigint not null default 0 check (recovered_amount_pence >= 0),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (studio_id, category, record_id)
);

create index if not exists recovery_opportunities_studio_status_idx
  on public.recovery_opportunities (studio_id, status, priority);
create index if not exists recovery_opportunities_studio_value_idx
  on public.recovery_opportunities (studio_id, estimated_value_pence desc);

create table if not exists public.recovery_activities (
  id uuid primary key default gen_random_uuid(),
  studio_id uuid not null references public.studios(id) on delete cascade,
  opportunity_id uuid references public.recovery_opportunities(id) on delete set null,
  import_id uuid references public.recovery_imports(id) on delete set null,
  actor_user_id uuid references auth.users(id) on delete set null,
  action text not null check (char_length(action) between 1 and 80),
  details jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now()
);

create index if not exists recovery_activities_studio_created_idx
  on public.recovery_activities (studio_id, created_at desc);

alter table public.recovery_imports enable row level security;
alter table public.recovery_records enable row level security;
alter table public.recovery_opportunities enable row level security;
alter table public.recovery_activities enable row level security;

-- SELECT is available to active studio members; mutations are limited to non-viewer members.
drop policy if exists recovery_imports_member_select on public.recovery_imports;
create policy recovery_imports_member_select on public.recovery_imports
  for select to authenticated
  using (exists (
    select 1 from public.studio_members sm
    where sm.studio_id = recovery_imports.studio_id
      and sm.user_id = (select auth.uid()) and sm.active = true
  ));
drop policy if exists recovery_imports_member_insert on public.recovery_imports;
create policy recovery_imports_member_insert on public.recovery_imports
  for insert to authenticated
  with check (uploaded_by = (select auth.uid()) and exists (
    select 1 from public.studio_members sm
    where sm.studio_id = recovery_imports.studio_id
      and sm.user_id = (select auth.uid()) and sm.active = true
      and sm.role in ('owner','admin','member')
  ));
drop policy if exists recovery_imports_member_update on public.recovery_imports;
create policy recovery_imports_member_update on public.recovery_imports
  for update to authenticated
  using (exists (
    select 1 from public.studio_members sm
    where sm.studio_id = recovery_imports.studio_id
      and sm.user_id = (select auth.uid()) and sm.active = true
      and sm.role in ('owner','admin','member')
  ))
  with check (exists (
    select 1 from public.studio_members sm
    where sm.studio_id = recovery_imports.studio_id
      and sm.user_id = (select auth.uid()) and sm.active = true
      and sm.role in ('owner','admin','member')
  ));
drop policy if exists recovery_imports_owner_delete on public.recovery_imports;
create policy recovery_imports_owner_delete on public.recovery_imports
  for delete to authenticated
  using (exists (
    select 1 from public.studio_members sm
    where sm.studio_id = recovery_imports.studio_id
      and sm.user_id = (select auth.uid()) and sm.active = true
      and sm.role in ('owner','admin')
  ));

drop policy if exists recovery_records_member_select on public.recovery_records;
create policy recovery_records_member_select on public.recovery_records
  for select to authenticated
  using (exists (
    select 1 from public.studio_members sm
    where sm.studio_id = recovery_records.studio_id
      and sm.user_id = (select auth.uid()) and sm.active = true
  ));
drop policy if exists recovery_records_member_insert on public.recovery_records;
create policy recovery_records_member_insert on public.recovery_records
  for insert to authenticated
  with check (exists (
    select 1 from public.studio_members sm
    where sm.studio_id = recovery_records.studio_id
      and sm.user_id = (select auth.uid()) and sm.active = true
      and sm.role in ('owner','admin','member')
  ));
drop policy if exists recovery_records_member_update on public.recovery_records;
create policy recovery_records_member_update on public.recovery_records
  for update to authenticated
  using (exists (
    select 1 from public.studio_members sm
    where sm.studio_id = recovery_records.studio_id
      and sm.user_id = (select auth.uid()) and sm.active = true
      and sm.role in ('owner','admin','member')
  ))
  with check (exists (
    select 1 from public.studio_members sm
    where sm.studio_id = recovery_records.studio_id
      and sm.user_id = (select auth.uid()) and sm.active = true
      and sm.role in ('owner','admin','member')
  ));
drop policy if exists recovery_records_owner_delete on public.recovery_records;
create policy recovery_records_owner_delete on public.recovery_records
  for delete to authenticated
  using (exists (
    select 1 from public.studio_members sm
    where sm.studio_id = recovery_records.studio_id
      and sm.user_id = (select auth.uid()) and sm.active = true
      and sm.role in ('owner','admin')
  ));

drop policy if exists recovery_opportunities_member_select on public.recovery_opportunities;
create policy recovery_opportunities_member_select on public.recovery_opportunities
  for select to authenticated
  using (exists (
    select 1 from public.studio_members sm
    where sm.studio_id = recovery_opportunities.studio_id
      and sm.user_id = (select auth.uid()) and sm.active = true
  ));
drop policy if exists recovery_opportunities_member_insert on public.recovery_opportunities;
create policy recovery_opportunities_member_insert on public.recovery_opportunities
  for insert to authenticated
  with check (exists (
    select 1 from public.studio_members sm
    where sm.studio_id = recovery_opportunities.studio_id
      and sm.user_id = (select auth.uid()) and sm.active = true
      and sm.role in ('owner','admin','member')
  ));
drop policy if exists recovery_opportunities_member_update on public.recovery_opportunities;
create policy recovery_opportunities_member_update on public.recovery_opportunities
  for update to authenticated
  using (exists (
    select 1 from public.studio_members sm
    where sm.studio_id = recovery_opportunities.studio_id
      and sm.user_id = (select auth.uid()) and sm.active = true
      and sm.role in ('owner','admin','member')
  ))
  with check (exists (
    select 1 from public.studio_members sm
    where sm.studio_id = recovery_opportunities.studio_id
      and sm.user_id = (select auth.uid()) and sm.active = true
      and sm.role in ('owner','admin','member')
  ));
drop policy if exists recovery_opportunities_owner_delete on public.recovery_opportunities;
create policy recovery_opportunities_owner_delete on public.recovery_opportunities
  for delete to authenticated
  using (exists (
    select 1 from public.studio_members sm
    where sm.studio_id = recovery_opportunities.studio_id
      and sm.user_id = (select auth.uid()) and sm.active = true
      and sm.role in ('owner','admin')
  ));

drop policy if exists recovery_activities_member_select on public.recovery_activities;
create policy recovery_activities_member_select on public.recovery_activities
  for select to authenticated
  using (exists (
    select 1 from public.studio_members sm
    where sm.studio_id = recovery_activities.studio_id
      and sm.user_id = (select auth.uid()) and sm.active = true
  ));
drop policy if exists recovery_activities_member_insert on public.recovery_activities;
create policy recovery_activities_member_insert on public.recovery_activities
  for insert to authenticated
  with check (
    actor_user_id = (select auth.uid()) and exists (
      select 1 from public.studio_members sm
      where sm.studio_id = recovery_activities.studio_id
        and sm.user_id = (select auth.uid()) and sm.active = true
        and sm.role in ('owner','admin','member')
    )
  );

grant select, insert, update, delete on public.recovery_imports to authenticated;
grant select, insert, update, delete on public.recovery_records to authenticated;
grant select, insert, update, delete on public.recovery_opportunities to authenticated;
grant select, insert on public.recovery_activities to authenticated;
revoke all on public.recovery_imports from anon;
revoke all on public.recovery_records from anon;
revoke all on public.recovery_opportunities from anon;
revoke all on public.recovery_activities from anon;
