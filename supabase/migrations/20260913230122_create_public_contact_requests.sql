create table public.public_contact_requests (
  id uuid primary key default gen_random_uuid(),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  name text not null,
  email text not null,
  studio_name text,
  topic text not null,
  message text not null,
  source text not null default 'website_contact',
  status text not null default 'new',
  consent_at timestamptz not null,
  data_classification text not null default 'external_unverified',
  business_key text not null default 'inksights_b2b',
  platform_key text not null default 'inksights_b2b',
  metadata jsonb not null default '{}'::jsonb,
  constraint public_contact_requests_status_check check (status in ('new','reviewing','responded','closed','spam')),
  constraint public_contact_requests_data_classification_check check (data_classification in ('external_unverified','verified_client','internal_test','sample'))
);

create index public_contact_requests_created_at_idx on public.public_contact_requests (created_at desc);
create index public_contact_requests_status_created_at_idx on public.public_contact_requests (status, created_at desc);

comment on table public.public_contact_requests is 'Canonical INKSIGHTS public contact enquiries. Writes occur only through the rate-limited public-contact-intake Edge Function using service-role credentials.';

alter table public.public_contact_requests enable row level security;
revoke all on table public.public_contact_requests from anon, authenticated, service_role;
grant select, insert, update, delete on table public.public_contact_requests to service_role;