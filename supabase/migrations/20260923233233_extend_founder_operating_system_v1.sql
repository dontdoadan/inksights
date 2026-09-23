create table if not exists public.ops_operating_cycles (
  id uuid primary key default gen_random_uuid(),
  cycle_key text not null unique,
  business_key text not null references public.ops_businesses(business_key),
  cycle_type text not null check (cycle_type in ('daily','weekly','monthly','quarterly')),
  period_start date not null,
  period_end date not null,
  status text not null default 'planned' check (status in ('planned','active','closed','cancelled')),
  company_outcome text,
  success_measure text,
  owner text,
  opened_at timestamptz not null default now(),
  closed_at timestamptz,
  review_summary text,
  metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (business_key, cycle_type, period_start)
);

create table if not exists public.ops_priorities (
  id uuid primary key default gen_random_uuid(),
  priority_key text not null unique,
  business_key text not null references public.ops_businesses(business_key),
  cycle_id uuid references public.ops_operating_cycles(id) on delete set null,
  rank integer not null default 1 check (rank between 1 and 10),
  title text not null,
  outcome text,
  owner text,
  deadline date,
  status text not null default 'proposed' check (status in ('proposed','active','blocked','done','cancelled')),
  success_criteria text,
  risk_summary text,
  next_action text,
  source_ref text,
  scoring jsonb not null default '{}'::jsonb,
  metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.ops_risks (
  id uuid primary key default gen_random_uuid(),
  risk_key text not null unique,
  business_key text not null references public.ops_businesses(business_key),
  cycle_id uuid references public.ops_operating_cycles(id) on delete set null,
  title text not null,
  category text,
  status text not null default 'open' check (status in ('open','mitigating','accepted','resolved','closed')),
  likelihood integer not null default 3 check (likelihood between 1 and 5),
  impact integer not null default 3 check (impact between 1 and 5),
  risk_score integer generated always as (likelihood * impact) stored,
  owner text,
  mitigation text,
  next_action text,
  due_at date,
  source_ref text,
  metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.ops_metric_definitions (
  id uuid primary key default gen_random_uuid(),
  metric_key text not null unique,
  business_key text not null references public.ops_businesses(business_key),
  name text not null,
  domain text not null check (domain in ('growth','retention','cash','product_market_fit','pipeline','delivery','operations')),
  description text,
  unit text not null,
  source_system_key text,
  source_object text,
  calculation_definition text,
  target_direction text check (target_direction is null or target_direction in ('higher','lower','range','neutral')),
  cadence text not null default 'weekly' check (cadence in ('daily','weekly','monthly','quarterly')),
  is_primary boolean not null default false,
  active boolean not null default true,
  metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.ops_metric_snapshots (
  id uuid primary key default gen_random_uuid(),
  metric_key text not null references public.ops_metric_definitions(metric_key),
  business_key text not null references public.ops_businesses(business_key),
  measured_at timestamptz not null default now(),
  period_start date,
  period_end date,
  value numeric,
  numerator numeric,
  denominator numeric,
  evidence_classification text not null default 'observed'
    check (evidence_classification in ('verified','observed','calculated','modelled','hypothesis')),
  source_ref text,
  metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now()
);

create table if not exists public.ops_evidence (
  id uuid primary key default gen_random_uuid(),
  evidence_key text not null unique,
  business_key text not null references public.ops_businesses(business_key),
  evidence_type text not null,
  classification text not null
    check (classification in ('verified','observed','calculated','modelled','hypothesis')),
  title text not null,
  statement text not null,
  source_system_key text,
  source_ref text,
  observed_at timestamptz,
  confidence numeric check (confidence is null or (confidence >= 0 and confidence <= 1)),
  status text not null default 'active' check (status in ('active','superseded','invalid','archived')),
  related_priority_id uuid references public.ops_priorities(id) on delete set null,
  related_decision_id uuid references public.ops_decisions(id) on delete set null,
  metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.ops_actions (
  id uuid primary key default gen_random_uuid(),
  action_key text not null unique,
  business_key text not null references public.ops_businesses(business_key),
  cycle_id uuid references public.ops_operating_cycles(id) on delete set null,
  priority_id uuid references public.ops_priorities(id) on delete set null,
  title text not null,
  owner text,
  deadline timestamptz,
  status text not null default 'open' check (status in ('open','in_progress','blocked','done','cancelled')),
  source_type text not null default 'manual'
    check (source_type in ('manual','meeting','decision','risk','workflow','automation')),
  source_ref text,
  completion_evidence text,
  completed_at timestamptz,
  metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.ops_ideas (
  id uuid primary key default gen_random_uuid(),
  idea_key text not null unique,
  business_key text not null references public.ops_businesses(business_key),
  title text not null,
  description text,
  status text not null default 'parked' check (status in ('parked','review','validated','promoted','rejected','archived')),
  revisit_at date,
  source_ref text,
  scoring jsonb not null default '{}'::jsonb,
  metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists ops_priorities_cycle_rank_idx on public.ops_priorities (cycle_id, rank);
create index if not exists ops_priorities_status_idx on public.ops_priorities (business_key, status, deadline);
create index if not exists ops_risks_status_score_idx on public.ops_risks (business_key, status, risk_score desc);
create index if not exists ops_metric_snapshots_metric_time_idx on public.ops_metric_snapshots (metric_key, measured_at desc);
create index if not exists ops_evidence_classification_idx on public.ops_evidence (business_key, classification, status);
create index if not exists ops_actions_status_deadline_idx on public.ops_actions (business_key, status, deadline);
create index if not exists ops_ideas_status_revisit_idx on public.ops_ideas (business_key, status, revisit_at);

alter table public.ops_operating_cycles enable row level security;
alter table public.ops_priorities enable row level security;
alter table public.ops_risks enable row level security;
alter table public.ops_metric_definitions enable row level security;
alter table public.ops_metric_snapshots enable row level security;
alter table public.ops_evidence enable row level security;
alter table public.ops_actions enable row level security;
alter table public.ops_ideas enable row level security;

revoke all on table public.ops_operating_cycles from anon, authenticated;
revoke all on table public.ops_priorities from anon, authenticated;
revoke all on table public.ops_risks from anon, authenticated;
revoke all on table public.ops_metric_definitions from anon, authenticated;
revoke all on table public.ops_metric_snapshots from anon, authenticated;
revoke all on table public.ops_evidence from anon, authenticated;
revoke all on table public.ops_actions from anon, authenticated;
revoke all on table public.ops_ideas from anon, authenticated;

grant all on table public.ops_operating_cycles to service_role;
grant all on table public.ops_priorities to service_role;
grant all on table public.ops_risks to service_role;
grant all on table public.ops_metric_definitions to service_role;
grant all on table public.ops_metric_snapshots to service_role;
grant all on table public.ops_evidence to service_role;
grant all on table public.ops_actions to service_role;
grant all on table public.ops_ideas to service_role;

drop trigger if exists ops_operating_cycles_set_updated_at on public.ops_operating_cycles;
create trigger ops_operating_cycles_set_updated_at before update on public.ops_operating_cycles
for each row execute function public.ops_set_updated_at();

drop trigger if exists ops_priorities_set_updated_at on public.ops_priorities;
create trigger ops_priorities_set_updated_at before update on public.ops_priorities
for each row execute function public.ops_set_updated_at();

drop trigger if exists ops_risks_set_updated_at on public.ops_risks;
create trigger ops_risks_set_updated_at before update on public.ops_risks
for each row execute function public.ops_set_updated_at();

drop trigger if exists ops_metric_definitions_set_updated_at on public.ops_metric_definitions;
create trigger ops_metric_definitions_set_updated_at before update on public.ops_metric_definitions
for each row execute function public.ops_set_updated_at();

drop trigger if exists ops_evidence_set_updated_at on public.ops_evidence;
create trigger ops_evidence_set_updated_at before update on public.ops_evidence
for each row execute function public.ops_set_updated_at();

drop trigger if exists ops_actions_set_updated_at on public.ops_actions;
create trigger ops_actions_set_updated_at before update on public.ops_actions
for each row execute function public.ops_set_updated_at();

drop trigger if exists ops_ideas_set_updated_at on public.ops_ideas;
create trigger ops_ideas_set_updated_at before update on public.ops_ideas
for each row execute function public.ops_set_updated_at();

create or replace view public.ops_current_founder_brief
with (security_invoker = true)
as
select
  c.id as cycle_id,
  c.business_key,
  c.cycle_key,
  c.period_start,
  c.period_end,
  c.company_outcome,
  c.success_measure,
  coalesce((
    select jsonb_agg(jsonb_build_object(
      'priority_key', p.priority_key,
      'rank', p.rank,
      'title', p.title,
      'outcome', p.outcome,
      'owner', p.owner,
      'deadline', p.deadline,
      'status', p.status,
      'success_criteria', p.success_criteria,
      'risk_summary', p.risk_summary,
      'next_action', p.next_action
    ) order by p.rank)
    from public.ops_priorities p
    where p.cycle_id = c.id and p.status in ('proposed','active','blocked')
  ), '[]'::jsonb) as priorities,
  coalesce((
    select jsonb_agg(jsonb_build_object(
      'risk_key', r.risk_key,
      'title', r.title,
      'category', r.category,
      'risk_score', r.risk_score,
      'owner', r.owner,
      'status', r.status,
      'mitigation', r.mitigation,
      'next_action', r.next_action
    ) order by r.risk_score desc, r.created_at)
    from public.ops_risks r
    where r.business_key = c.business_key and r.status in ('open','mitigating','accepted')
  ), '[]'::jsonb) as risks,
  coalesce((
    select jsonb_agg(jsonb_build_object(
      'metric_key', d.metric_key,
      'name', d.name,
      'domain', d.domain,
      'unit', d.unit,
      'value', s.value,
      'measured_at', s.measured_at,
      'classification', s.evidence_classification,
      'source_ref', s.source_ref
    ) order by d.domain, d.name)
    from public.ops_metric_definitions d
    left join lateral (
      select ms.*
      from public.ops_metric_snapshots ms
      where ms.metric_key = d.metric_key
      order by ms.measured_at desc
      limit 1
    ) s on true
    where d.business_key = c.business_key and d.active and d.is_primary
  ), '[]'::jsonb) as commercial_health,
  coalesce((
    select jsonb_agg(jsonb_build_object(
      'decision_key', d.decision_key,
      'title', d.title,
      'status', d.status,
      'context', d.context,
      'review_at', d.review_at
    ) order by d.created_at)
    from public.ops_decisions d
    where d.business_key = c.business_key and d.status in ('proposed','review_due')
  ), '[]'::jsonb) as decisions_required,
  coalesce((
    select jsonb_agg(jsonb_build_object(
      'action_key', a.action_key,
      'title', a.title,
      'owner', a.owner,
      'deadline', a.deadline,
      'status', a.status,
      'source_type', a.source_type,
      'source_ref', a.source_ref
    ) order by a.deadline nulls last, a.created_at)
    from public.ops_actions a
    where a.business_key = c.business_key and a.status in ('open','in_progress','blocked')
  ), '[]'::jsonb) as execution_queue,
  coalesce((
    select jsonb_agg(jsonb_build_object(
      'evidence_key', e.evidence_key,
      'title', e.title,
      'classification', e.classification,
      'statement', e.statement,
      'confidence', e.confidence,
      'source_ref', e.source_ref
    ) order by e.created_at)
    from public.ops_evidence e
    where e.business_key = c.business_key and e.status='active'
      and e.classification in ('modelled','hypothesis')
  ), '[]'::jsonb) as evidence_gaps,
  coalesce((
    select jsonb_agg(jsonb_build_object(
      'idea_key', i.idea_key,
      'title', i.title,
      'description', i.description,
      'revisit_at', i.revisit_at,
      'scoring', i.scoring
    ) order by i.revisit_at nulls last, i.created_at)
    from public.ops_ideas i
    where i.business_key = c.business_key and i.status='parked'
  ), '[]'::jsonb) as parked_ideas
from public.ops_operating_cycles c
where c.status='active' and c.cycle_type='weekly';

revoke all on table public.ops_current_founder_brief from anon, authenticated;
grant select on table public.ops_current_founder_brief to service_role;

comment on table public.ops_operating_cycles is 'Founder operating cadence. One daily/weekly/monthly/quarterly cycle records the company outcome and review.';
comment on table public.ops_priorities is 'Ruthlessly limited execution priorities linked to an operating cycle.';
comment on table public.ops_risks is 'Company operating risk register with likelihood x impact scoring.';
comment on table public.ops_metric_definitions is 'Canonical company KPI dictionary; values remain in source systems until snapshotted.';
comment on table public.ops_metric_snapshots is 'Point-in-time KPI observations with evidence classification and source references.';
comment on table public.ops_evidence is 'Company-level evidence registry using VERIFIED/OBSERVED/CALCULATED/MODELLED/HYPOTHESIS classifications.';
comment on table public.ops_actions is 'Owner/deadline/action execution queue sourced from meetings, decisions, risks, workflows or manual work.';
comment on table public.ops_ideas is 'Deliberately parked ideas kept outside active execution.';
comment on view public.ops_current_founder_brief is 'Service-role-only projection of the active weekly founder operating brief.';
