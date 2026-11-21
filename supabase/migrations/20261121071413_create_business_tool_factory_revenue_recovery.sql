-- Shared AI Business Tool Factory foundation + Studio Revenue Recovery MVP
-- Tenant-owned records use workspace_id and RLS.
-- No client contact details, payment credentials, or outbound execution are stored.

create table public.bt_workspaces (
  id uuid primary key default gen_random_uuid(),
  display_name text not null check (length(trim(display_name)) between 1 and 160),
  business_type text not null default 'tattoo_studio',
  source_studio_id uuid,
  timezone text not null default 'Europe/London',
  currency_code text not null default 'GBP' check (currency_code ~ '^[A-Z]{3}$'),
  status text not null default 'active' check (status in ('active','suspended','closed')),
  created_by uuid references auth.users(id) on delete set null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (id)
);
comment on table public.bt_workspaces is 'Shared Business Tool Factory tenant/workspace boundary. source_studio_id is an optional link to the existing INKSIGHTS studio identity; no automatic identity merge is performed.';

create table public.bt_workspace_members (
  id uuid primary key default gen_random_uuid(),
  workspace_id uuid not null references public.bt_workspaces(id) on delete cascade,
  user_id uuid not null references auth.users(id) on delete cascade,
  role text not null check (role in ('owner','admin','manager','analyst')),
  active boolean not null default true,
  created_at timestamptz not null default now(),
  unique (workspace_id,user_id),
  unique (workspace_id,id)
);

create table public.bt_workspace_products (
  workspace_id uuid not null references public.bt_workspaces(id) on delete cascade,
  product_key text not null,
  product_version text not null,
  status text not null default 'enabled' check (status in ('enabled','disabled','trial')),
  settings jsonb not null default '{}'::jsonb check (jsonb_typeof(settings) = 'object'),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  primary key (workspace_id,product_key)
);

create table public.bt_import_jobs (
  id uuid primary key default gen_random_uuid(),
  workspace_id uuid not null references public.bt_workspaces(id) on delete cascade,
  product_key text not null,
  source_system text not null,
  source_filename text,
  content_sha256 text not null check (content_sha256 ~ '^[a-f0-9]{64}$'),
  mapping_version text not null,
  status text not null default 'staged' check (status in ('staged','validating','validated','imported','failed','cancelled')),
  rows_total integer not null default 0 check (rows_total >= 0),
  rows_valid integer not null default 0 check (rows_valid >= 0),
  rows_invalid integer not null default 0 check (rows_invalid >= 0),
  rows_duplicate integer not null default 0 check (rows_duplicate >= 0),
  created_by uuid references auth.users(id) on delete set null,
  completed_at timestamptz,
  created_at timestamptz not null default now(),
  unique (workspace_id,product_key,content_sha256),
  unique (workspace_id,id)
);

create table public.bt_import_rows (
  id uuid primary key default gen_random_uuid(),
  workspace_id uuid not null references public.bt_workspaces(id) on delete cascade,
  import_job_id uuid not null,
  row_number integer not null check (row_number > 0),
  mapped_payload jsonb not null check (jsonb_typeof(mapped_payload) = 'object'),
  row_status text not null default 'pending' check (row_status in ('pending','valid','invalid','duplicate','imported','skipped')),
  validation_errors jsonb not null default '[]'::jsonb check (jsonb_typeof(validation_errors) = 'array'),
  source_record_id text,
  row_hash text not null,
  created_at timestamptz not null default now(),
  unique (import_job_id,row_number),
  foreign key (workspace_id,import_job_id) references public.bt_import_jobs(workspace_id,id) on delete cascade
);

create table public.bt_workflow_runs (
  id uuid primary key default gen_random_uuid(),
  workspace_id uuid not null references public.bt_workspaces(id) on delete cascade,
  product_key text not null,
  workflow_key text not null,
  workflow_version text not null,
  idempotency_key text not null,
  status text not null default 'queued' check (status in ('queued','running','succeeded','failed','cancelled')),
  input_ref jsonb not null default '{}'::jsonb check (jsonb_typeof(input_ref) = 'object'),
  result_summary jsonb not null default '{}'::jsonb check (jsonb_typeof(result_summary) = 'object'),
  started_at timestamptz,
  completed_at timestamptz,
  created_at timestamptz not null default now(),
  unique (workspace_id,product_key,idempotency_key),
  unique (workspace_id,id)
);

create table public.bt_approvals (
  id uuid primary key default gen_random_uuid(),
  workspace_id uuid not null references public.bt_workspaces(id) on delete cascade,
  product_key text not null,
  target_type text not null,
  target_id uuid not null,
  draft_digest text not null,
  decision text not null check (decision in ('approved','rejected','revoked')),
  actor_id uuid not null references auth.users(id),
  rationale text,
  created_at timestamptz not null default now()
);
comment on table public.bt_approvals is 'Append-only human approval records. Approval is bound to a content digest; any draft edit requires a new approval.';

create table public.bt_audit_events (
  id uuid primary key default gen_random_uuid(),
  workspace_id uuid not null references public.bt_workspaces(id) on delete cascade,
  product_key text not null,
  actor_id uuid references auth.users(id) on delete set null,
  actor_type text not null default 'user' check (actor_type in ('user','system','service')),
  event_key text not null,
  target_type text,
  target_id uuid,
  event_data jsonb not null default '{}'::jsonb check (jsonb_typeof(event_data) = 'object'),
  created_at timestamptz not null default now()
);

create table public.bt_usage_events (
  id uuid primary key default gen_random_uuid(),
  workspace_id uuid not null references public.bt_workspaces(id) on delete cascade,
  product_key text not null,
  event_key text not null,
  units numeric(14,4) not null default 1 check (units >= 0),
  unit_type text not null default 'operation',
  source_ref text,
  created_at timestamptz not null default now()
);

-- Revenue Recovery product domain. Monetary amounts are integer minor units (GBP pence by default).
create table public.rr_clients (
  id uuid primary key default gen_random_uuid(),
  workspace_id uuid not null references public.bt_workspaces(id) on delete cascade,
  source_system text not null,
  source_record_id text not null,
  display_name text,
  last_completed_booking_at timestamptz,
  completed_sessions integer not null default 0 check (completed_sessions >= 0),
  future_booking_at timestamptz,
  marketing_permission_state text not null default 'unknown' check (marketing_permission_state in ('unknown','permitted','not_permitted','suppressed')),
  has_contact_route boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (workspace_id,source_system,source_record_id),
  unique (workspace_id,id)
);

create table public.rr_enquiries (
  id uuid primary key default gen_random_uuid(),
  workspace_id uuid not null references public.bt_workspaces(id) on delete cascade,
  source_system text not null,
  source_record_id text not null,
  client_id uuid,
  created_at_source timestamptz not null,
  status text not null default 'unknown' check (status in ('new','replied','quoted','booked','declined','closed','unknown')),
  quoted_value_minor bigint check (quoted_value_minor is null or quoted_value_minor >= 0),
  has_contact_route boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (workspace_id,source_system,source_record_id),
  unique (workspace_id,id),
  foreign key (workspace_id,client_id) references public.rr_clients(workspace_id,id) on delete restrict
);

create table public.rr_projects (
  id uuid primary key default gen_random_uuid(),
  workspace_id uuid not null references public.bt_workspaces(id) on delete cascade,
  source_system text not null,
  source_record_id text not null,
  client_id uuid,
  status text not null default 'unknown' check (status in ('active','paused','completed','cancelled','unknown')),
  agreed_value_minor bigint check (agreed_value_minor is null or agreed_value_minor >= 0),
  paid_value_minor bigint check (paid_value_minor is null or paid_value_minor >= 0),
  sessions_planned integer check (sessions_planned is null or sessions_planned >= 0),
  sessions_completed integer check (sessions_completed is null or sessions_completed >= 0),
  last_activity_at timestamptz,
  next_session_at timestamptz,
  has_contact_route boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (workspace_id,source_system,source_record_id),
  unique (workspace_id,id),
  foreign key (workspace_id,client_id) references public.rr_clients(workspace_id,id) on delete restrict
);

create table public.rr_bookings (
  id uuid primary key default gen_random_uuid(),
  workspace_id uuid not null references public.bt_workspaces(id) on delete cascade,
  source_system text not null,
  source_record_id text not null,
  client_id uuid,
  project_id uuid,
  scheduled_at timestamptz,
  status text not null default 'unknown' check (status in ('enquiry','provisional','confirmed','completed','cancelled','no_show','unknown')),
  booking_value_minor bigint check (booking_value_minor is null or booking_value_minor >= 0),
  deposit_due_minor bigint check (deposit_due_minor is null or deposit_due_minor >= 0),
  deposit_paid_minor bigint check (deposit_paid_minor is null or deposit_paid_minor >= 0),
  balance_due_minor bigint check (balance_due_minor is null or balance_due_minor >= 0),
  balance_paid_minor bigint check (balance_paid_minor is null or balance_paid_minor >= 0),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (workspace_id,source_system,source_record_id),
  unique (workspace_id,id),
  foreign key (workspace_id,client_id) references public.rr_clients(workspace_id,id) on delete restrict,
  foreign key (workspace_id,project_id) references public.rr_projects(workspace_id,id) on delete restrict
);

create table public.rr_payments (
  id uuid primary key default gen_random_uuid(),
  workspace_id uuid not null references public.bt_workspaces(id) on delete cascade,
  source_system text not null,
  source_record_id text not null,
  booking_id uuid,
  project_id uuid,
  amount_minor bigint not null check (amount_minor >= 0),
  currency_code text not null default 'GBP' check (currency_code ~ '^[A-Z]{3}$'),
  payment_type text not null default 'other' check (payment_type in ('deposit','balance','refund','other')),
  status text not null default 'unknown' check (status in ('pending','paid','failed','refunded','disputed','unknown')),
  paid_at timestamptz,
  created_at timestamptz not null default now(),
  unique (workspace_id,source_system,source_record_id),
  foreign key (workspace_id,booking_id) references public.rr_bookings(workspace_id,id) on delete restrict,
  foreign key (workspace_id,project_id) references public.rr_projects(workspace_id,id) on delete restrict
);

create table public.rr_capacity_periods (
  id uuid primary key default gen_random_uuid(),
  workspace_id uuid not null references public.bt_workspaces(id) on delete cascade,
  source_system text not null,
  source_record_id text not null,
  period_start timestamptz not null,
  period_end timestamptz not null,
  available_hours numeric(10,2) not null default 0 check (available_hours >= 0),
  booked_hours numeric(10,2) not null default 0 check (booked_hours >= 0),
  realised_hourly_value_minor bigint check (realised_hourly_value_minor is null or realised_hourly_value_minor >= 0),
  created_at timestamptz not null default now(),
  check (period_end >= period_start),
  unique (workspace_id,source_system,source_record_id)
);

create table public.rr_opportunities (
  id uuid primary key default gen_random_uuid(),
  workspace_id uuid not null references public.bt_workspaces(id) on delete cascade,
  product_key text not null default 'revenue_recovery',
  rule_version text not null,
  opportunity_key text not null,
  opportunity_type text not null check (opportunity_type in ('unconverted_enquiry','inactive_project','lapsed_client','outstanding_balance','unfilled_capacity')),
  source_system text not null,
  source_record_id text not null,
  source_group_key text not null,
  title text not null,
  explanation text not null,
  recommended_action text not null,
  value_low_minor bigint check (value_low_minor is null or value_low_minor >= 0),
  value_base_minor bigint check (value_base_minor is null or value_base_minor >= 0),
  value_high_minor bigint check (value_high_minor is null or value_high_minor >= 0),
  value_classification text not null check (value_classification in ('observed','calculated','modelled','hypothesis','unknown')),
  confidence numeric(4,3) not null check (confidence between 0 and 1),
  priority_score smallint not null check (priority_score between 0 and 100),
  evidence jsonb not null default '[]'::jsonb check (jsonb_typeof(evidence) = 'array'),
  actionability text not null default 'review_required' check (actionability in ('actionable','review_required','not_actionable')),
  status text not null default 'open' check (status in ('open','in_review','actioned','dismissed','recovered','expired')),
  detected_at timestamptz not null default now(),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (workspace_id,rule_version,opportunity_key),
  unique (workspace_id,id)
);

create table public.rr_actions (
  id uuid primary key default gen_random_uuid(),
  workspace_id uuid not null references public.bt_workspaces(id) on delete cascade,
  opportunity_id uuid not null,
  action_type text not null check (action_type in ('review','client_follow_up_draft','booking_review','payment_reconciliation','capacity_review','other')),
  draft_subject text,
  draft_body text,
  draft_digest text,
  status text not null default 'draft' check (status in ('draft','approved','rejected','revoked','completed','cancelled')),
  created_by uuid references auth.users(id) on delete set null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (workspace_id,id),
  foreign key (workspace_id,opportunity_id) references public.rr_opportunities(workspace_id,id) on delete cascade
);

create table public.rr_outcomes (
  id uuid primary key default gen_random_uuid(),
  workspace_id uuid not null references public.bt_workspaces(id) on delete cascade,
  opportunity_id uuid not null,
  action_id uuid,
  outcome_type text not null check (outcome_type in ('contacted','rebooked','balance_collected','capacity_filled','not_recovered','other')),
  amount_minor bigint check (amount_minor is null or amount_minor >= 0),
  currency_code text not null default 'GBP' check (currency_code ~ '^[A-Z]{3}$'),
  classification text not null default 'reported' check (classification in ('reported','verified')),
  evidence_ref text,
  notes text,
  recorded_by uuid references auth.users(id) on delete set null,
  recorded_at timestamptz not null default now(),
  foreign key (workspace_id,opportunity_id) references public.rr_opportunities(workspace_id,id) on delete restrict,
  foreign key (workspace_id,action_id) references public.rr_actions(workspace_id,id) on delete restrict
);

-- Index workspace predicates and common product retrieval paths.
create index bt_workspace_members_user_active_idx on public.bt_workspace_members(user_id,active,workspace_id);
create index bt_import_jobs_workspace_created_idx on public.bt_import_jobs(workspace_id,created_at desc);
create index bt_import_rows_workspace_job_idx on public.bt_import_rows(workspace_id,import_job_id);
create index bt_workflow_runs_workspace_created_idx on public.bt_workflow_runs(workspace_id,created_at desc);
create index bt_approvals_workspace_target_idx on public.bt_approvals(workspace_id,target_type,target_id,created_at desc);
create index bt_audit_events_workspace_created_idx on public.bt_audit_events(workspace_id,created_at desc);
create index bt_usage_events_workspace_product_created_idx on public.bt_usage_events(workspace_id,product_key,created_at desc);
create index rr_clients_workspace_last_booking_idx on public.rr_clients(workspace_id,last_completed_booking_at);
create index rr_enquiries_workspace_status_created_idx on public.rr_enquiries(workspace_id,status,created_at_source);
create index rr_projects_workspace_status_activity_idx on public.rr_projects(workspace_id,status,last_activity_at);
create index rr_bookings_workspace_scheduled_idx on public.rr_bookings(workspace_id,scheduled_at);
create index rr_payments_workspace_status_idx on public.rr_payments(workspace_id,status);
create index rr_capacity_workspace_period_idx on public.rr_capacity_periods(workspace_id,period_start,period_end);
create index rr_opportunities_workspace_priority_idx on public.rr_opportunities(workspace_id,status,priority_score desc);
create index rr_actions_workspace_status_idx on public.rr_actions(workspace_id,status,created_at desc);
create index rr_outcomes_workspace_opportunity_idx on public.rr_outcomes(workspace_id,opportunity_id,recorded_at desc);

-- RLS on every Factory and Revenue Recovery table in exposed public schema.
alter table public.bt_workspaces enable row level security;
alter table public.bt_workspace_members enable row level security;
alter table public.bt_workspace_products enable row level security;
alter table public.bt_import_jobs enable row level security;
alter table public.bt_import_rows enable row level security;
alter table public.bt_workflow_runs enable row level security;
alter table public.bt_approvals enable row level security;
alter table public.bt_audit_events enable row level security;
alter table public.bt_usage_events enable row level security;
alter table public.rr_clients enable row level security;
alter table public.rr_enquiries enable row level security;
alter table public.rr_projects enable row level security;
alter table public.rr_bookings enable row level security;
alter table public.rr_payments enable row level security;
alter table public.rr_capacity_periods enable row level security;
alter table public.rr_opportunities enable row level security;
alter table public.rr_actions enable row level security;
alter table public.rr_outcomes enable row level security;

-- Membership is provisioned only by trusted server-side code. Members can read their own membership row.
create policy bt_members_read_self on public.bt_workspace_members
for select to authenticated
using (user_id = (select auth.uid()) and active = true);

create policy bt_workspaces_read_member on public.bt_workspaces
for select to authenticated
using (exists (
  select 1 from public.bt_workspace_members m
  where m.workspace_id = bt_workspaces.id
    and m.user_id = (select auth.uid()) and m.active
));

create policy bt_products_read_member on public.bt_workspace_products
for select to authenticated
using (exists (
  select 1 from public.bt_workspace_members m
  where m.workspace_id = bt_workspace_products.workspace_id
    and m.user_id = (select auth.uid()) and m.active
));

-- Workspace manager predicate is expressed against the caller's own visible membership row.
create policy bt_import_jobs_read_member on public.bt_import_jobs
for select to authenticated
using (exists (select 1 from public.bt_workspace_members m where m.workspace_id = bt_import_jobs.workspace_id and m.user_id = (select auth.uid()) and m.active));
create policy bt_import_jobs_insert_manager on public.bt_import_jobs
for insert to authenticated
with check (exists (select 1 from public.bt_workspace_members m where m.workspace_id = bt_import_jobs.workspace_id and m.user_id = (select auth.uid()) and m.active and m.role in ('owner','admin','manager')));
create policy bt_import_jobs_update_manager on public.bt_import_jobs
for update to authenticated
using (exists (select 1 from public.bt_workspace_members m where m.workspace_id = bt_import_jobs.workspace_id and m.user_id = (select auth.uid()) and m.active and m.role in ('owner','admin','manager')))
with check (exists (select 1 from public.bt_workspace_members m where m.workspace_id = bt_import_jobs.workspace_id and m.user_id = (select auth.uid()) and m.active and m.role in ('owner','admin','manager')));

create policy bt_import_rows_read_member on public.bt_import_rows
for select to authenticated
using (exists (select 1 from public.bt_workspace_members m where m.workspace_id = bt_import_rows.workspace_id and m.user_id = (select auth.uid()) and m.active));
create policy bt_import_rows_insert_manager on public.bt_import_rows
for insert to authenticated
with check (exists (select 1 from public.bt_workspace_members m where m.workspace_id = bt_import_rows.workspace_id and m.user_id = (select auth.uid()) and m.active and m.role in ('owner','admin','manager')));

create policy bt_workflow_runs_read_member on public.bt_workflow_runs
for select to authenticated
using (exists (select 1 from public.bt_workspace_members m where m.workspace_id = bt_workflow_runs.workspace_id and m.user_id = (select auth.uid()) and m.active));
create policy bt_workflow_runs_insert_manager on public.bt_workflow_runs
for insert to authenticated
with check (exists (select 1 from public.bt_workspace_members m where m.workspace_id = bt_workflow_runs.workspace_id and m.user_id = (select auth.uid()) and m.active and m.role in ('owner','admin','manager')));
create policy bt_workflow_runs_update_manager on public.bt_workflow_runs
for update to authenticated
using (exists (select 1 from public.bt_workspace_members m where m.workspace_id = bt_workflow_runs.workspace_id and m.user_id = (select auth.uid()) and m.active and m.role in ('owner','admin','manager')))
with check (exists (select 1 from public.bt_workspace_members m where m.workspace_id = bt_workflow_runs.workspace_id and m.user_id = (select auth.uid()) and m.active and m.role in ('owner','admin','manager')));

create policy bt_approvals_read_member on public.bt_approvals
for select to authenticated
using (exists (select 1 from public.bt_workspace_members m where m.workspace_id = bt_approvals.workspace_id and m.user_id = (select auth.uid()) and m.active));
create policy bt_approvals_insert_manager on public.bt_approvals
for insert to authenticated
with check (actor_id = (select auth.uid()) and exists (select 1 from public.bt_workspace_members m where m.workspace_id = bt_approvals.workspace_id and m.user_id = (select auth.uid()) and m.active and m.role in ('owner','admin','manager')));

-- Shared policy pattern: all active members can read; owner/admin/manager can insert and update.
create policy rr_clients_read_member on public.rr_clients for select to authenticated
using (exists (select 1 from public.bt_workspace_members m where m.workspace_id = rr_clients.workspace_id and m.user_id = (select auth.uid()) and m.active));
create policy rr_clients_insert_manager on public.rr_clients for insert to authenticated
with check (exists (select 1 from public.bt_workspace_members m where m.workspace_id = rr_clients.workspace_id and m.user_id = (select auth.uid()) and m.active and m.role in ('owner','admin','manager')));
create policy rr_clients_update_manager on public.rr_clients for update to authenticated
using (exists (select 1 from public.bt_workspace_members m where m.workspace_id = rr_clients.workspace_id and m.user_id = (select auth.uid()) and m.active and m.role in ('owner','admin','manager')))
with check (exists (select 1 from public.bt_workspace_members m where m.workspace_id = rr_clients.workspace_id and m.user_id = (select auth.uid()) and m.active and m.role in ('owner','admin','manager')));

create policy rr_enquiries_read_member on public.rr_enquiries for select to authenticated
using (exists (select 1 from public.bt_workspace_members m where m.workspace_id = rr_enquiries.workspace_id and m.user_id = (select auth.uid()) and m.active));
create policy rr_enquiries_insert_manager on public.rr_enquiries for insert to authenticated
with check (exists (select 1 from public.bt_workspace_members m where m.workspace_id = rr_enquiries.workspace_id and m.user_id = (select auth.uid()) and m.active and m.role in ('owner','admin','manager')));
create policy rr_enquiries_update_manager on public.rr_enquiries for update to authenticated
using (exists (select 1 from public.bt_workspace_members m where m.workspace_id = rr_enquiries.workspace_id and m.user_id = (select auth.uid()) and m.active and m.role in ('owner','admin','manager')))
with check (exists (select 1 from public.bt_workspace_members m where m.workspace_id = rr_enquiries.workspace_id and m.user_id = (select auth.uid()) and m.active and m.role in ('owner','admin','manager')));

create policy rr_projects_read_member on public.rr_projects for select to authenticated
using (exists (select 1 from public.bt_workspace_members m where m.workspace_id = rr_projects.workspace_id and m.user_id = (select auth.uid()) and m.active));
create policy rr_projects_insert_manager on public.rr_projects for insert to authenticated
with check (exists (select 1 from public.bt_workspace_members m where m.workspace_id = rr_projects.workspace_id and m.user_id = (select auth.uid()) and m.active and m.role in ('owner','admin','manager')));
create policy rr_projects_update_manager on public.rr_projects for update to authenticated
using (exists (select 1 from public.bt_workspace_members m where m.workspace_id = rr_projects.workspace_id and m.user_id = (select auth.uid()) and m.active and m.role in ('owner','admin','manager')))
with check (exists (select 1 from public.bt_workspace_members m where m.workspace_id = rr_projects.workspace_id and m.user_id = (select auth.uid()) and m.active and m.role in ('owner','admin','manager')));

create policy rr_bookings_read_member on public.rr_bookings for select to authenticated
using (exists (select 1 from public.bt_workspace_members m where m.workspace_id = rr_bookings.workspace_id and m.user_id = (select auth.uid()) and m.active));
create policy rr_bookings_insert_manager on public.rr_bookings for insert to authenticated
with check (exists (select 1 from public.bt_workspace_members m where m.workspace_id = rr_bookings.workspace_id and m.user_id = (select auth.uid()) and m.active and m.role in ('owner','admin','manager')));
create policy rr_bookings_update_manager on public.rr_bookings for update to authenticated
using (exists (select 1 from public.bt_workspace_members m where m.workspace_id = rr_bookings.workspace_id and m.user_id = (select auth.uid()) and m.active and m.role in ('owner','admin','manager')))
with check (exists (select 1 from public.bt_workspace_members m where m.workspace_id = rr_bookings.workspace_id and m.user_id = (select auth.uid()) and m.active and m.role in ('owner','admin','manager')));

create policy rr_payments_read_member on public.rr_payments for select to authenticated
using (exists (select 1 from public.bt_workspace_members m where m.workspace_id = rr_payments.workspace_id and m.user_id = (select auth.uid()) and m.active));
create policy rr_payments_insert_manager on public.rr_payments for insert to authenticated
with check (exists (select 1 from public.bt_workspace_members m where m.workspace_id = rr_payments.workspace_id and m.user_id = (select auth.uid()) and m.active and m.role in ('owner','admin','manager')));
create policy rr_payments_update_manager on public.rr_payments for update to authenticated
using (exists (select 1 from public.bt_workspace_members m where m.workspace_id = rr_payments.workspace_id and m.user_id = (select auth.uid()) and m.active and m.role in ('owner','admin','manager')))
with check (exists (select 1 from public.bt_workspace_members m where m.workspace_id = rr_payments.workspace_id and m.user_id = (select auth.uid()) and m.active and m.role in ('owner','admin','manager')));

create policy rr_capacity_read_member on public.rr_capacity_periods for select to authenticated
using (exists (select 1 from public.bt_workspace_members m where m.workspace_id = rr_capacity_periods.workspace_id and m.user_id = (select auth.uid()) and m.active));
create policy rr_capacity_insert_manager on public.rr_capacity_periods for insert to authenticated
with check (exists (select 1 from public.bt_workspace_members m where m.workspace_id = rr_capacity_periods.workspace_id and m.user_id = (select auth.uid()) and m.active and m.role in ('owner','admin','manager')));
create policy rr_capacity_update_manager on public.rr_capacity_periods for update to authenticated
using (exists (select 1 from public.bt_workspace_members m where m.workspace_id = rr_capacity_periods.workspace_id and m.user_id = (select auth.uid()) and m.active and m.role in ('owner','admin','manager')))
with check (exists (select 1 from public.bt_workspace_members m where m.workspace_id = rr_capacity_periods.workspace_id and m.user_id = (select auth.uid()) and m.active and m.role in ('owner','admin','manager')));

create policy rr_opportunities_read_member on public.rr_opportunities for select to authenticated
using (exists (select 1 from public.bt_workspace_members m where m.workspace_id = rr_opportunities.workspace_id and m.user_id = (select auth.uid()) and m.active));
create policy rr_opportunities_insert_manager on public.rr_opportunities for insert to authenticated
with check (exists (select 1 from public.bt_workspace_members m where m.workspace_id = rr_opportunities.workspace_id and m.user_id = (select auth.uid()) and m.active and m.role in ('owner','admin','manager')));
create policy rr_opportunities_update_manager on public.rr_opportunities for update to authenticated
using (exists (select 1 from public.bt_workspace_members m where m.workspace_id = rr_opportunities.workspace_id and m.user_id = (select auth.uid()) and m.active and m.role in ('owner','admin','manager')))
with check (exists (select 1 from public.bt_workspace_members m where m.workspace_id = rr_opportunities.workspace_id and m.user_id = (select auth.uid()) and m.active and m.role in ('owner','admin','manager')));

create policy rr_actions_read_member on public.rr_actions for select to authenticated
using (exists (select 1 from public.bt_workspace_members m where m.workspace_id = rr_actions.workspace_id and m.user_id = (select auth.uid()) and m.active));
create policy rr_actions_insert_manager on public.rr_actions for insert to authenticated
with check (created_by = (select auth.uid()) and exists (select 1 from public.bt_workspace_members m where m.workspace_id = rr_actions.workspace_id and m.user_id = (select auth.uid()) and m.active and m.role in ('owner','admin','manager')));
create policy rr_actions_update_manager on public.rr_actions for update to authenticated
using (exists (select 1 from public.bt_workspace_members m where m.workspace_id = rr_actions.workspace_id and m.user_id = (select auth.uid()) and m.active and m.role in ('owner','admin','manager')))
with check (exists (select 1 from public.bt_workspace_members m where m.workspace_id = rr_actions.workspace_id and m.user_id = (select auth.uid()) and m.active and m.role in ('owner','admin','manager')));

create policy rr_outcomes_read_member on public.rr_outcomes for select to authenticated
using (exists (select 1 from public.bt_workspace_members m where m.workspace_id = rr_outcomes.workspace_id and m.user_id = (select auth.uid()) and m.active));
create policy rr_outcomes_insert_manager on public.rr_outcomes for insert to authenticated
with check (recorded_by = (select auth.uid()) and exists (select 1 from public.bt_workspace_members m where m.workspace_id = rr_outcomes.workspace_id and m.user_id = (select auth.uid()) and m.active and m.role in ('owner','admin','manager')));

-- Remove inherited/default grants from public and client roles on these new tables.
revoke all on public.bt_workspaces, public.bt_workspace_members, public.bt_workspace_products,
  public.bt_import_jobs, public.bt_import_rows, public.bt_workflow_runs, public.bt_approvals,
  public.bt_audit_events, public.bt_usage_events, public.rr_clients, public.rr_enquiries,
  public.rr_projects, public.rr_bookings, public.rr_payments, public.rr_capacity_periods,
  public.rr_opportunities, public.rr_actions, public.rr_outcomes from public, anon, authenticated;

-- Explicit least-privilege grants. No anonymous access and no client-side delete.
grant select on public.bt_workspaces, public.bt_workspace_members, public.bt_workspace_products to authenticated;
grant select,insert,update on public.bt_import_jobs, public.bt_import_rows, public.bt_workflow_runs to authenticated;
grant select,insert on public.bt_approvals to authenticated;
grant select,insert,update on public.rr_clients, public.rr_enquiries, public.rr_projects, public.rr_bookings, public.rr_payments, public.rr_capacity_periods, public.rr_opportunities, public.rr_actions to authenticated;
grant select,insert on public.rr_outcomes to authenticated;
revoke all on public.bt_audit_events, public.bt_usage_events from anon, authenticated;
grant all on public.bt_workspaces, public.bt_workspace_members, public.bt_workspace_products,
  public.bt_import_jobs, public.bt_import_rows, public.bt_workflow_runs, public.bt_approvals,
  public.bt_audit_events, public.bt_usage_events, public.rr_clients, public.rr_enquiries,
  public.rr_projects, public.rr_bookings, public.rr_payments, public.rr_capacity_periods,
  public.rr_opportunities, public.rr_actions, public.rr_outcomes to service_role;

-- Ensure no anon privileges were inherited from permissive default grants.
revoke all on public.bt_workspaces, public.bt_workspace_members, public.bt_workspace_products,
  public.bt_import_jobs, public.bt_import_rows, public.bt_workflow_runs, public.bt_approvals,
  public.bt_audit_events, public.bt_usage_events, public.rr_clients, public.rr_enquiries,
  public.rr_projects, public.rr_bookings, public.rr_payments, public.rr_capacity_periods,
  public.rr_opportunities, public.rr_actions, public.rr_outcomes from anon;
