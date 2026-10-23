-- INKSIGHTS UK directory owner claims / public profile extension.
-- Private, service-only tables. This migration does NOT grant ownership based on self-report or domain email alone.
create table if not exists public.studio_directory_claims (
  id uuid primary key default gen_random_uuid(),
  candidate_id uuid not null references public.studio_candidates(id) on delete restrict,
  user_id uuid not null references auth.users(id) on delete restrict,
  email text not null,
  claimant_name text not null check (char_length(claimant_name) between 2 and 160),
  claimant_role text not null check (claimant_role in ('owner','authorised_manager')),
  evidence_url text,
  evidence_summary text not null check (char_length(evidence_summary) between 15 and 1600),
  status text not null default 'pending_review'
    check (status in ('pending_review','proof_required','verified','rejected','withdrawn')),
  verification_method text,
  verified_at timestamptz,
  reviewed_at timestamptz,
  reviewed_by uuid references auth.users(id),
  review_notes text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint studio_directory_claims_unique_claimant unique (candidate_id,user_id),
  constraint directory_verified_provenance check (
    status <> 'verified' or (verified_at is not null and verification_method is not null and reviewed_by is not null)
  )
);
create unique index if not exists studio_directory_one_verified_owner
 on public.studio_directory_claims(candidate_id) where status='verified';
create index if not exists studio_directory_claims_queue
 on public.studio_directory_claims(status,created_at desc);

create table if not exists public.studio_directory_profiles (
  candidate_id uuid primary key references public.studio_candidates(id) on delete restrict,
  summary text not null default '' check (char_length(summary) <= 1200),
  specialisms text[] not null default '{}'::text[],
  booking_url text,
  owner_editor_id uuid references auth.users(id),
  updated_at timestamptz not null default now(),
  constraint directory_specialisms_limit check (cardinality(specialisms)<=12)
);
-- Do not expose privileged source/claim/profile rows through PostgREST.
alter table public.studio_directory_claims enable row level security;
alter table public.studio_directory_profiles enable row level security;
revoke all on public.studio_directory_claims from public, anon, authenticated;
revoke all on public.studio_directory_profiles from public, anon, authenticated;
grant select,insert,update on public.studio_directory_claims to service_role;
grant select,insert,update on public.studio_directory_profiles to service_role;
-- No public or authenticated RLS policies: only server-side JWT checks with canonical reviewed claim status.
comment on table public.studio_directory_claims is 'Owner claims are reviewed individually; free proof of control; verified is a service-only audited decision.';
comment on table public.studio_directory_profiles is 'Owner-editable non-identity fields behind reviewed verified claim and server-side authorization.';
