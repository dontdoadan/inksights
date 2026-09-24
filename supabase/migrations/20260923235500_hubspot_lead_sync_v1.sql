alter table public.public_contact_requests
  add column if not exists website text,
  add column if not exists hubspot_sync_attempts integer not null default 0,
  add column if not exists hubspot_last_attempt_at timestamptz,
  add column if not exists hubspot_sync_error text;

alter table public.revenue_audit_leads
  add column if not exists hubspot_sync_attempts integer not null default 0,
  add column if not exists hubspot_last_attempt_at timestamptz,
  add column if not exists hubspot_sync_error text;

create table if not exists public.integration_runtime_config (
  config_key text primary key,
  config_value text not null,
  updated_at timestamptz not null default now()
);

alter table public.integration_runtime_config enable row level security;

comment on table public.integration_runtime_config is
  'Server-only runtime integration configuration. No anon/authenticated RLS policies are defined; access is via service-role server code only.';