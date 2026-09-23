-- Website Conversion Integrity v1
-- Additive, rollback-safe fields for structured lead routing and first-party analytics.

alter table public.public_contact_requests
  add column if not exists location text,
  add column if not exists phone text,
  add column if not exists hubspot_contact_id text,
  add column if not exists hubspot_company_id text,
  add column if not exists hubspot_deal_id text,
  add column if not exists hubspot_synced_at timestamptz,
  add column if not exists internal_notified_at timestamptz;

alter table public.revenue_audit_leads
  add column if not exists source_context jsonb not null default '{}'::jsonb,
  add column if not exists hubspot_contact_id text,
  add column if not exists hubspot_company_id text,
  add column if not exists hubspot_deal_id text,
  add column if not exists hubspot_synced_at timestamptz,
  add column if not exists internal_notified_at timestamptz;

create table if not exists public.website_events (
  id uuid primary key default gen_random_uuid(),
  created_at timestamptz not null default now(),
  event_name text not null,
  page_path text not null,
  referrer text,
  session_id text,
  properties jsonb not null default '{}'::jsonb,
  consent_type text not null default 'analytics',
  business_key text not null default 'inksights_b2b'
);

alter table public.website_events enable row level security;

comment on table public.website_events is
  'First-party INKSIGHTS website analytics. Public writes are accepted only through the rate-limited public-web-event Edge Function; no direct anon policies are defined.';

create index if not exists website_events_created_at_idx
  on public.website_events (created_at desc);
create index if not exists website_events_event_name_created_at_idx
  on public.website_events (event_name, created_at desc);
create index if not exists public_contact_requests_hubspot_sync_idx
  on public.public_contact_requests (hubspot_synced_at, created_at desc);
create index if not exists revenue_audit_leads_hubspot_sync_idx
  on public.revenue_audit_leads (hubspot_synced_at, created_at desc);
