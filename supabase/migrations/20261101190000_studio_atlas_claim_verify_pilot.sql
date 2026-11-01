-- Studio Atlas pilot: additive, isolated, no candidate is automatically public.
-- Publication and claims approval must be performed by an authorised reviewer.
create table if not exists public.atlas_profiles (
  id uuid primary key default gen_random_uuid(),
  studio_id uuid not null unique references public.studios(id) on delete restrict,
  slug text not null unique check (slug ~ '^[a-z0-9]+(-[a-z0-9]+)*$'),
  name text not null check (char_length(name) between 2 and 140),
  town text not null check (char_length(town) between 2 and 100),
  public_address text,
  postcode text,
  latitude double precision check (latitude between 49 and 61),
  longitude double precision check (longitude between -9 and 3),
  website_url text,
  instagram_url text,
  about text check (char_length(about) <= 2400),
  styles text[] not null default '{}',
  cover_url text,
  listing_status text not null default 'draft'
    check (listing_status in ('draft','published','suspended')),
  premises_verified_at timestamptz,
  published_at timestamptz,
  reviewed_by uuid,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint atlas_publication_requires_evidence check (
    listing_status <> 'published'
    or (premises_verified_at is not null and published_at is not null
        and latitude is not null and longitude is not null)
  )
);
create index if not exists atlas_profiles_search on public.atlas_profiles (town, listing_status);

create table if not exists public.atlas_claim_requests (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  studio_id uuid references public.studios(id) on delete set null,
  candidate_id uuid references public.studio_candidates(id) on delete set null,
  proposed_studio_name text not null check (char_length(proposed_studio_name) between 2 and 140),
  proposed_town text not null check (char_length(proposed_town) between 2 and 100),
  proposed_website text,
  authority_role text not null check (authority_role in ('owner','director','manager','authorised_representative')),
  verification_method text not null check (verification_method in ('business_email','public_business_phone','licence','documents','other')),
  evidence_note text not null check (char_length(evidence_note) between 20 and 2000),
  status text not null default 'pending' check (status in ('pending','needs_evidence','approved','rejected','withdrawn')),
  reviewer_id uuid references auth.users(id),
  reviewed_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create unique index if not exists atlas_claim_one_pending_studio
  on public.atlas_claim_requests (user_id, studio_id)
  where studio_id is not null and status = 'pending';
create index if not exists atlas_claim_review_queue on public.atlas_claim_requests(status,created_at);

create table if not exists public.atlas_profile_drafts (
  id uuid primary key default gen_random_uuid(),
  studio_id uuid not null references public.studios(id) on delete cascade,
  user_id uuid not null references auth.users(id) on delete cascade,
  about text check (char_length(about) <= 2400),
  website_url text,
  instagram_url text,
  styles text[] not null default '{}',
  proposed_public_address text,
  status text not null default 'pending_review' check (status in ('pending_review','published','rejected')),
  created_at timestamptz not null default now(),
  reviewed_at timestamptz
);
create index if not exists atlas_draft_review_queue on public.atlas_profile_drafts(status, created_at);

create table if not exists public.atlas_customer_enquiries (
  id uuid primary key default gen_random_uuid(),
  studio_id uuid not null references public.studios(id) on delete restrict,
  profile_id uuid not null references public.atlas_profiles(id) on delete restrict,
  customer_name text not null check (char_length(customer_name) between 2 and 120),
  customer_email text not null check (char_length(customer_email) between 5 and 254),
  tattoo_brief text not null check (char_length(tattoo_brief) between 20 and 3000),
  consent_version text not null,
  privacy_notice_accepted_at timestamptz not null,
  marketing_opt_in boolean not null default false,
  status text not null default 'received' check (status in ('received','notified','opened','replied','closed','spam')),
  recipient_notified_at timestamptz,
  is_test boolean not null default false,
  created_at timestamptz not null default now()
);
create index if not exists atlas_enquiries_dispatch on public.atlas_customer_enquiries(status,created_at);
create index if not exists atlas_enquiries_studio on public.atlas_customer_enquiries(studio_id,created_at);

alter table public.atlas_profiles enable row level security;
alter table public.atlas_claim_requests enable row level security;
alter table public.atlas_profile_drafts enable row level security;
alter table public.atlas_customer_enquiries enable row level security;

-- Profile has only public-facing fields; unknown, unverified and suspended profiles are never readable.
create policy "atlas_public_published_profiles" on public.atlas_profiles
  for select to anon,authenticated
  using (listing_status = 'published' and premises_verified_at is not null and published_at is not null);
grant select on public.atlas_profiles to anon,authenticated;

-- Claim evidence and enquiries are never publicly visible, and no claimant can self-approve.
create policy "atlas_claimant_reads_own" on public.atlas_claim_requests
  for select to authenticated using (user_id = (select auth.uid()));
create policy "atlas_claimant_submits_pending" on public.atlas_claim_requests
  for insert to authenticated with check (
    user_id = (select auth.uid()) and status = 'pending'
    and reviewer_id is null and reviewed_at is null
  );
grant select,insert on public.atlas_claim_requests to authenticated;

-- Draft edits are created only by existing, active members.
create policy "atlas_member_reads_own_draft" on public.atlas_profile_drafts
  for select to authenticated using (user_id = (select auth.uid()));
create policy "atlas_member_submits_draft" on public.atlas_profile_drafts
  for insert to authenticated with check (
    user_id = (select auth.uid()) and status = 'pending_review'
    and exists (
      select 1 from public.studio_members sm
      where sm.studio_id = atlas_profile_drafts.studio_id
        and sm.user_id = (select auth.uid()) and sm.active = true
        and sm.role in ('owner','admin','manager')
    )
  );
grant select,insert on public.atlas_profile_drafts to authenticated;

-- No direct anon/authenticated access to customer enquiry records.
revoke all on public.atlas_customer_enquiries from anon, authenticated;
-- No authenticated write path to published profiles (service-side review only).
revoke insert,update,delete on public.atlas_profiles from anon,authenticated;
revoke update,delete on public.atlas_claim_requests from anon,authenticated;
revoke update,delete on public.atlas_profile_drafts from anon,authenticated;
