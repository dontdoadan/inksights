-- Operational integration hardening v1
-- Separates explicit QA/test traffic from genuine commercial lead records so
-- production CRM and notification workflows can safely ignore synthetic tests.

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

-- Historical records below were produced by founder/QA validation runs and are
-- deliberately classified by immutable record id rather than broad email rules.
update public.revenue_audit_leads
set is_test = true,
    test_reason = coalesce(test_reason, 'historical_qa_backfill_2026_09_27')
where id in (
  'ae9b4102-f906-4304-9835-c51dfe31bc08',
  '7301179d-131a-4378-aeda-649e8179f465',
  '2641aafd-17f1-460d-a85b-0c68acc4d82d',
  '6a4c5863-bc1c-4e02-9d33-379602115c79',
  '4f65477d-4668-4ed1-99bd-26f751255f40',
  '0e67f715-5c94-4a1e-865f-5b163c2d405a',
  '69db16c1-7654-4f01-9faf-11a57e8417ed',
  'dcb8987d-bd69-4a21-a9a8-b87a4184d8ce',
  'f4b0b02e-9c89-49f6-b75e-cc89a20cad72',
  'd7ad6920-3adb-470c-ac89-ae920b13ca5f'
);

update public.public_contact_requests
set is_test = true,
    test_reason = coalesce(test_reason, 'e2e_qa_2026_09_27')
where id = '77ade1c0-ae5c-406f-9893-31b1f999e41d';
