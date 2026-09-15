-- INKSIGHTS Golden Audit canonical data model.
-- Service role owns writes. Authenticated studio members receive read-only tenant access.

create extension if not exists pgcrypto;

create table if not exists public.studios (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  slug text not null unique,
  website_url text,
  primary_location text,
  internal_validation boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.audits (
  id uuid primary key default gen_random_uuid(),
  studio_id uuid not null references public.studios(id) on delete cascade,
  audit_type text not null default 'studio_intelligence',
  audit_version text not null,
  mode text not null check (mode in ('A','B','C')),
  status text not null default 'draft' check (status in ('draft','collecting','normalising','analysing','diagnosing','reporting','qa','completed','failed')),
  period_start date,
  period_end date,
  context jsonb not null default '{}'::jsonb,
  qa_status text not null default 'pending',
  report_status text not null default 'draft',
  created_by uuid references auth.users(id) on delete set null,
  started_at timestamptz,
  completed_at timestamptz,
  created_at timestamptz not null default now()
);

create table if not exists public.audit_sources (
  id uuid primary key default gen_random_uuid(),
  audit_id uuid not null references public.audits(id) on delete cascade,
  source_type text not null,
  source_name text not null,
  source_uri text,
  storage_path text,
  source_hash text,
  observed_at timestamptz,
  ingested_at timestamptz not null default now(),
  metadata jsonb not null default '{}'::jsonb,
  unique (audit_id, source_hash, source_type)
);

create table if not exists public.audit_raw_records (
  id bigint generated always as identity primary key,
  audit_id uuid not null references public.audits(id) on delete cascade,
  source_id uuid not null references public.audit_sources(id) on delete cascade,
  source_row integer,
  source_row_key text,
  raw_payload jsonb not null,
  parse_status text not null default 'parsed' check (parse_status in ('parsed','rejected','review_required')),
  parse_error text,
  created_at timestamptz not null default now(),
  unique (source_id, source_row_key)
);

create table if not exists public.clients (
  id uuid primary key default gen_random_uuid(),
  studio_id uuid not null references public.studios(id) on delete cascade,
  canonical_label text not null,
  verification_status text not null default 'normalised' check (verification_status in ('normalised','verified','review_required')),
  confidence text not null default 'MEDIUM' check (confidence in ('HIGH','MEDIUM','LOW')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (studio_id, canonical_label)
);

create table if not exists public.client_aliases (
  id uuid primary key default gen_random_uuid(),
  studio_id uuid not null references public.studios(id) on delete cascade,
  client_id uuid references public.clients(id) on delete set null,
  raw_label text not null,
  normalised_label text not null,
  match_status text not null default 'normalised' check (match_status in ('normalised','verified','review_required','unresolved')),
  confidence text not null default 'MEDIUM' check (confidence in ('HIGH','MEDIUM','LOW')),
  created_at timestamptz not null default now(),
  unique (studio_id, raw_label)
);

create table if not exists public.transactions (
  id uuid primary key default gen_random_uuid(),
  studio_id uuid not null references public.studios(id) on delete cascade,
  audit_source_id uuid not null references public.audit_sources(id) on delete cascade,
  client_id uuid references public.clients(id) on delete set null,
  client_alias_id uuid references public.client_aliases(id) on delete set null,
  transaction_date date not null,
  amount_pence bigint not null,
  currency text not null default 'GBP' check (currency = 'GBP'),
  raw_reference text,
  duplicate_status text not null default 'clear' check (duplicate_status in ('clear','potential_duplicate','confirmed_duplicate','confirmed_distinct')),
  source_row_key text not null,
  created_at timestamptz not null default now(),
  unique (audit_source_id, source_row_key)
);

create table if not exists public.audit_metrics (
  id uuid primary key default gen_random_uuid(),
  audit_id uuid not null references public.audits(id) on delete cascade,
  metric_key text not null,
  value_numeric numeric,
  value_text text,
  unit text,
  period_start date,
  period_end date,
  evidence_classification text not null check (evidence_classification in ('VERIFIED','OBSERVED','CALCULATED','MODELLED','HYPOTHESIS')),
  confidence text not null check (confidence in ('HIGH','MEDIUM','LOW')),
  measurement_status text not null check (measurement_status in ('measured','estimated','not_measurable','not_applicable')),
  not_measurable_reason text,
  required_source text,
  calculation_version text not null default 'v1',
  provenance jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now()
);

create table if not exists public.audit_evidence (
  id uuid primary key default gen_random_uuid(),
  audit_id uuid not null references public.audits(id) on delete cascade,
  source_id uuid references public.audit_sources(id) on delete set null,
  evidence_type text not null,
  title text not null,
  summary text not null,
  classification text not null check (classification in ('VERIFIED','OBSERVED','CALCULATED','MODELLED','HYPOTHESIS')),
  confidence text not null check (confidence in ('HIGH','MEDIUM','LOW')),
  provenance jsonb not null default '{}'::jsonb,
  observed_at timestamptz,
  created_at timestamptz not null default now()
);

create table if not exists public.audit_findings (
  id uuid primary key default gen_random_uuid(),
  audit_id uuid not null references public.audits(id) on delete cascade,
  finding_key text not null,
  title text not null,
  statement text not null,
  category text not null,
  classification text not null check (classification in ('VERIFIED','OBSERVED','CALCULATED','MODELLED','HYPOTHESIS')),
  confidence text not null check (confidence in ('HIGH','MEDIUM','LOW')),
  materiality text not null default 'medium' check (materiality in ('low','medium','high','critical')),
  status text not null default 'active' check (status in ('active','validated','superseded','dismissed')),
  created_at timestamptz not null default now(),
  unique (audit_id, finding_key)
);

create table if not exists public.audit_finding_evidence (
  finding_id uuid not null references public.audit_findings(id) on delete cascade,
  evidence_id uuid not null references public.audit_evidence(id) on delete cascade,
  primary key (finding_id, evidence_id)
);

create table if not exists public.audit_diagnoses (
  id uuid primary key default gen_random_uuid(),
  audit_id uuid not null references public.audits(id) on delete cascade,
  title text not null,
  statement text not null,
  constraint_type text not null,
  confidence text not null check (confidence in ('HIGH','MEDIUM','LOW')),
  rank integer not null check (rank > 0),
  created_at timestamptz not null default now()
);

create table if not exists public.audit_opportunities (
  id uuid primary key default gen_random_uuid(),
  audit_id uuid not null references public.audits(id) on delete cascade,
  diagnosis_id uuid references public.audit_diagnoses(id) on delete set null,
  title text not null,
  mechanism text not null,
  impact_score numeric(6,2) not null check (impact_score between 0 and 100),
  confidence_score numeric(6,2) not null check (confidence_score between 0 and 100),
  ease_score numeric(6,2) not null check (ease_score between 0 and 100),
  speed_score numeric(6,2) not null check (speed_score between 0 and 100),
  cost_score numeric(6,2) not null check (cost_score between 0 and 100),
  overall_score numeric(6,2) not null check (overall_score between 0 and 100),
  impact_low numeric,
  impact_high numeric,
  impact_unit text,
  evidence_classification text not null check (evidence_classification in ('VERIFIED','OBSERVED','CALCULATED','MODELLED','HYPOTHESIS')),
  confidence text not null check (confidence in ('HIGH','MEDIUM','LOW')),
  assumptions jsonb not null default '[]'::jsonb,
  created_at timestamptz not null default now()
);

create table if not exists public.audit_recommendations (
  id uuid primary key default gen_random_uuid(),
  audit_id uuid not null references public.audits(id) on delete cascade,
  opportunity_id uuid references public.audit_opportunities(id) on delete set null,
  title text not null,
  rationale text not null,
  action text not null,
  owner_role text,
  target_metric_key text,
  priority integer not null check (priority > 0),
  sequence integer not null check (sequence > 0),
  created_at timestamptz not null default now()
);

create table if not exists public.audit_interventions (
  id uuid primary key default gen_random_uuid(),
  audit_id uuid not null references public.audits(id) on delete cascade,
  recommendation_id uuid references public.audit_recommendations(id) on delete set null,
  title text not null,
  description text not null,
  target_metric_key text,
  status text not null default 'selected' check (status in ('selected','planned','in_progress','completed','cancelled')),
  baseline jsonb not null default '{}'::jsonb,
  measurement_plan jsonb not null default '{}'::jsonb,
  selected_at timestamptz not null default now(),
  started_at timestamptz,
  completed_at timestamptz
);

create table if not exists public.audit_runs (
  id uuid primary key default gen_random_uuid(),
  audit_id uuid not null references public.audits(id) on delete cascade,
  engine_key text not null,
  status text not null default 'started' check (status in ('started','success','partial','failed','blocked','skipped')),
  started_at timestamptz not null default now(),
  completed_at timestamptz,
  input_summary jsonb not null default '{}'::jsonb,
  output_summary jsonb not null default '{}'::jsonb,
  error_code text,
  error_message text,
  retry_count integer not null default 0 check (retry_count >= 0)
);

create table if not exists public.report_versions (
  id uuid primary key default gen_random_uuid(),
  audit_id uuid not null references public.audits(id) on delete cascade,
  version integer not null check (version > 0),
  status text not null default 'draft' check (status in ('draft','qa','client_ready','published','superseded','failed')),
  generated_at timestamptz not null default now(),
  qa_status text not null default 'pending',
  secure_token_hash text,
  web_slug text,
  pdf_storage_path text,
  manifest jsonb not null default '{}'::jsonb,
  manifest_hash text,
  unique (audit_id, version)
);

create table if not exists public.qa_checks (
  id uuid primary key default gen_random_uuid(),
  audit_id uuid references public.audits(id) on delete cascade,
  report_version_id uuid references public.report_versions(id) on delete cascade,
  check_key text not null,
  status text not null check (status in ('pass','fail','warning','not_applicable')),
  severity text not null default 'error' check (severity in ('info','warning','error','critical')),
  message text not null,
  evidence jsonb not null default '{}'::jsonb,
  checked_at timestamptz not null default now(),
  check (audit_id is not null or report_version_id is not null)
);

create index if not exists idx_audits_studio_status on public.audits(studio_id, status, created_at desc);
create index if not exists idx_audit_sources_audit on public.audit_sources(audit_id, ingested_at desc);
create index if not exists idx_audit_raw_records_audit on public.audit_raw_records(audit_id, source_id);
create index if not exists idx_clients_studio on public.clients(studio_id, canonical_label);
create index if not exists idx_client_aliases_studio on public.client_aliases(studio_id, normalised_label);
create index if not exists idx_transactions_studio_date on public.transactions(studio_id, transaction_date desc);
create index if not exists idx_transactions_client_date on public.transactions(client_id, transaction_date desc);
create index if not exists idx_audit_metrics_key on public.audit_metrics(audit_id, metric_key, period_end desc);
create index if not exists idx_audit_evidence_audit_observed on public.audit_evidence(audit_id, observed_at desc);
create index if not exists idx_audit_findings_audit on public.audit_findings(audit_id, status, materiality);
create index if not exists idx_audit_diagnoses_rank on public.audit_diagnoses(audit_id, rank);
create index if not exists idx_audit_opportunities_score on public.audit_opportunities(audit_id, overall_score desc);
create index if not exists idx_audit_recommendations_sequence on public.audit_recommendations(audit_id, sequence);
create index if not exists idx_audit_runs_status on public.audit_runs(audit_id, status, started_at desc);
create index if not exists idx_report_versions_audit on public.report_versions(audit_id, version desc);
create index if not exists idx_qa_checks_audit on public.qa_checks(audit_id, status, checked_at desc);

-- All Golden Audit tables are deny-by-default to browser roles except tenant reads.
do $$
declare
  t text;
  tables text[] := array[
    'studios','audits','audit_sources','audit_raw_records','clients','client_aliases','transactions',
    'audit_metrics','audit_evidence','audit_findings','audit_finding_evidence','audit_diagnoses',
    'audit_opportunities','audit_recommendations','audit_interventions','audit_runs','report_versions','qa_checks'
  ];
begin
  foreach t in array tables loop
    execute format('alter table public.%I enable row level security', t);
    execute format('revoke all on table public.%I from anon, authenticated', t);
    execute format('grant select on table public.%I to authenticated', t);
  end loop;
end $$;

-- Tenant read helper. It deliberately reuses the hardened studio_members model already in production.
create or replace function public.can_read_studio(p_studio_id uuid)
returns boolean
language sql
stable
security definer
set search_path = public, pg_temp
as $$
  select exists (
    select 1
    from public.studio_members m
    where m.studio_id = p_studio_id
      and m.user_id = (select auth.uid())
      and m.active
  );
$$;

revoke all on function public.can_read_studio(uuid) from public, anon;
grant execute on function public.can_read_studio(uuid) to authenticated, service_role;

create policy "golden audit studios tenant read" on public.studios
for select to authenticated using (public.can_read_studio(id));

create policy "golden audits tenant read" on public.audits
for select to authenticated using (public.can_read_studio(studio_id));

create policy "golden audit sources tenant read" on public.audit_sources
for select to authenticated using (
  exists (select 1 from public.audits a where a.id = audit_sources.audit_id and public.can_read_studio(a.studio_id))
);

create policy "golden audit raw records tenant read" on public.audit_raw_records
for select to authenticated using (
  exists (select 1 from public.audits a where a.id = audit_raw_records.audit_id and public.can_read_studio(a.studio_id))
);

create policy "golden audit clients tenant read" on public.clients
for select to authenticated using (public.can_read_studio(studio_id));

create policy "golden audit aliases tenant read" on public.client_aliases
for select to authenticated using (public.can_read_studio(studio_id));

create policy "golden audit transactions tenant read" on public.transactions
for select to authenticated using (public.can_read_studio(studio_id));

create policy "golden audit metrics tenant read" on public.audit_metrics
for select to authenticated using (
  exists (select 1 from public.audits a where a.id = audit_metrics.audit_id and public.can_read_studio(a.studio_id))
);

create policy "golden audit evidence tenant read" on public.audit_evidence
for select to authenticated using (
  exists (select 1 from public.audits a where a.id = audit_evidence.audit_id and public.can_read_studio(a.studio_id))
);

create policy "golden audit findings tenant read" on public.audit_findings
for select to authenticated using (
  exists (select 1 from public.audits a where a.id = audit_findings.audit_id and public.can_read_studio(a.studio_id))
);

create policy "golden audit finding evidence tenant read" on public.audit_finding_evidence
for select to authenticated using (
  exists (
    select 1 from public.audit_findings f
    join public.audits a on a.id = f.audit_id
    where f.id = audit_finding_evidence.finding_id and public.can_read_studio(a.studio_id)
  )
);

create policy "golden audit diagnoses tenant read" on public.audit_diagnoses
for select to authenticated using (
  exists (select 1 from public.audits a where a.id = audit_diagnoses.audit_id and public.can_read_studio(a.studio_id))
);

create policy "golden audit opportunities tenant read" on public.audit_opportunities
for select to authenticated using (
  exists (select 1 from public.audits a where a.id = audit_opportunities.audit_id and public.can_read_studio(a.studio_id))
);

create policy "golden audit recommendations tenant read" on public.audit_recommendations
for select to authenticated using (
  exists (select 1 from public.audits a where a.id = audit_recommendations.audit_id and public.can_read_studio(a.studio_id))
);

create policy "golden audit interventions tenant read" on public.audit_interventions
for select to authenticated using (
  exists (select 1 from public.audits a where a.id = audit_interventions.audit_id and public.can_read_studio(a.studio_id))
);

create policy "golden audit runs tenant read" on public.audit_runs
for select to authenticated using (
  exists (select 1 from public.audits a where a.id = audit_runs.audit_id and public.can_read_studio(a.studio_id))
);

create policy "golden audit report versions tenant read" on public.report_versions
for select to authenticated using (
  exists (select 1 from public.audits a where a.id = report_versions.audit_id and public.can_read_studio(a.studio_id))
);

create policy "golden audit qa tenant read" on public.qa_checks
for select to authenticated using (
  exists (
    select 1 from public.audits a
    where a.id = coalesce(qa_checks.audit_id, (select rv.audit_id from public.report_versions rv where rv.id = qa_checks.report_version_id))
      and public.can_read_studio(a.studio_id)
  )
);

-- Explicit service-role grants. Service role bypasses RLS, while browser roles remain read-only.
do $$
declare
  t text;
  tables text[] := array[
    'studios','audits','audit_sources','audit_raw_records','clients','client_aliases','transactions',
    'audit_metrics','audit_evidence','audit_findings','audit_finding_evidence','audit_diagnoses',
    'audit_opportunities','audit_recommendations','audit_interventions','audit_runs','report_versions','qa_checks'
  ];
begin
  foreach t in array tables loop
    execute format('grant select, insert, update, delete on table public.%I to service_role', t);
  end loop;
end $$;

grant usage, select on sequence public.audit_raw_records_id_seq to service_role;
