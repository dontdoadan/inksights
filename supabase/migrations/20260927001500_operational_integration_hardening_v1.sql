-- Operational integration hardening v1
-- Separates explicit QA/test traffic from genuine commercial lead records so
-- production CRM and notification workflows can safely ignore synthetic tests.
-- Environment-specific historical record classification is intentionally
-- handled as a separately logged operational data correction, not in migration DDL.

alter table public.public_contact_requests
  add column if not exists is_test boolean not null default false,
  add column if not exists test_reason text;

alter table public.revenue_audit_leads
  add column if not exists is_test boolean not null default false,
  add column if not exists test_reason text;

comment on column public.public_contact_requests.is_test is
  'True only for explicitly identified QA/test records. Test records must not enter production CRM or lead-notification workflows.';
comment on column public.revenue_audit_leads.is_test is
  'True only for explicitly identified QA/test records. Test records must not enter production CRM or lead-notification workflows.';

create index if not exists public_contact_requests_real_leads_idx
  on public.public_contact_requests (created_at desc)
  where is_test = false;

create index if not exists revenue_audit_leads_real_leads_idx
  on public.revenue_audit_leads (created_at desc)
  where is_test = false;
