
-- INKSIGHTS private-to-Edge mail ledger; no client-role table access.
create table if not exists public.inksights_mail_outbox (
 id uuid primary key default gen_random_uuid(),
 studio_id uuid references public.visibility_studios(id) on delete set null,
 hubspot_contact_id text,
 recipient text not null check (recipient ~* '^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$' and length(recipient) <= 254),
 subject text not null check (length(btrim(subject)) between 1 and 250),
 body text not null check (length(btrim(body)) between 1 and 25000),
 purpose text not null default 'outreach' check (purpose in ('outreach','reply','test')),
 is_test boolean not null default true,
 status text not null default 'pending' check (status in ('pending','drafted','approved','sending','sent','unknown','failed','cancelled')),
 eligibility text not null default 'unverified' check (eligibility in ('unverified','verified_corporate','consent_verified')),
 eligibility_evidence text,
 suppression_checked_at timestamptz,
 approved_by uuid references auth.users(id) on delete set null,
 approved_at timestamptz,
 approved_digest text,
 zoho_draft_id text,
 zoho_message_id text,
 sent_at timestamptz,
 attempt_count integer not null default 0 check(attempt_count >= 0),
 last_error text,
 idempotency_key text unique check (idempotency_key is null or length(idempotency_key) between 10 and 160),
 created_at timestamptz not null default now(),
 updated_at timestamptz not null default now(),
 constraint approved_send_requires_reviewer check (status not in ('approved','sending','sent') or (approved_by is not null and approved_at is not null and approved_digest is not null)),
 constraint sent_requires_timestamp check (status <> 'sent' or sent_at is not null)
);
create index if not exists idx_inksights_mail_outbox_recipient on public.inksights_mail_outbox(lower(recipient));
create index if not exists idx_inksights_mail_outbox_status on public.inksights_mail_outbox(status,created_at desc);
create index if not exists idx_inksights_mail_outbox_studio on public.inksights_mail_outbox(studio_id,created_at desc);

create table if not exists public.inksights_mail_inbox (
 id uuid primary key default gen_random_uuid(),
 zoho_message_id text not null unique,
 zoho_thread_id text,
 folder_id text,
 sender text not null,
 recipient text,
 subject text,
 preview text,
 received_at timestamptz,
 matched_outbox_id uuid references public.inksights_mail_outbox(id) on delete set null,
 outcome text not null default 'unreviewed' check(outcome in ('unreviewed','interested','not_interested','opt_out','bounce','other')),
 is_test boolean not null default false,
 created_at timestamptz not null default now(),
 updated_at timestamptz not null default now()
);
create index if not exists idx_inksights_mail_inbox_received on public.inksights_mail_inbox(received_at desc);
create index if not exists idx_inksights_mail_inbox_sender on public.inksights_mail_inbox(lower(sender));

create table if not exists public.inksights_mail_suppressions (
 email text primary key check(email = lower(btrim(email)) and email ~* '^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$'),
 reason text not null check(reason in ('opt_out','bounce','manual','legal_hold')),
 source text not null,
 created_at timestamptz not null default now()
);
create table if not exists public.inksights_mail_events (
 id bigint generated always as identity primary key,
 outbox_id uuid references public.inksights_mail_outbox(id) on delete set null,
 event_type text not null,
 actor_id uuid,
 details jsonb not null default '{}'::jsonb,
 happened_at timestamptz not null default now()
);
create index if not exists idx_inksights_mail_events_outbox on public.inksights_mail_events(outbox_id,happened_at desc);
create table if not exists public.inksights_mail_sync_state (
 mailbox text primary key,
 last_polled_at timestamptz,
 initialized boolean not null default false,
 updated_at timestamptz not null default now()
);
insert into public.inksights_mail_sync_state(mailbox) values('daniel@getinksights.co.uk') on conflict do nothing;
alter table public.inksights_mail_outbox enable row level security;
alter table public.inksights_mail_inbox enable row level security;
alter table public.inksights_mail_suppressions enable row level security;
alter table public.inksights_mail_events enable row level security;
alter table public.inksights_mail_sync_state enable row level security;
revoke all on public.inksights_mail_outbox,public.inksights_mail_inbox,public.inksights_mail_suppressions,public.inksights_mail_events,public.inksights_mail_sync_state from anon,authenticated,public;
grant select,insert,update,delete on public.inksights_mail_outbox,public.inksights_mail_inbox,public.inksights_mail_suppressions,public.inksights_mail_events,public.inksights_mail_sync_state to service_role;
grant usage,select on sequence public.inksights_mail_events_id_seq to service_role;
