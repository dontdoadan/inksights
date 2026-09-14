create table public.intelligence_taxonomy (
  id uuid primary key default gen_random_uuid(),
  taxonomy_type text not null,
  taxonomy_key text not null,
  display_name text not null,
  description text,
  parent_id uuid references public.intelligence_taxonomy(id) on delete restrict,
  is_active boolean not null default true,
  metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint intelligence_taxonomy_type_key_unique unique (taxonomy_type, taxonomy_key)
);

create table public.intelligence_source_registry (
  id uuid primary key default gen_random_uuid(),
  source_key text not null unique,
  source_name text not null,
  source_type text not null,
  source_url text,
  domain text,
  reliability_score numeric,
  geographic_relevance text,
  approved boolean not null default false,
  notes text,
  metadata jsonb not null default '{}'::jsonb,
  last_reviewed_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint intelligence_source_registry_reliability_check check (reliability_score is null or (reliability_score >= 0 and reliability_score <= 100))
);

create table public.intelligence_diagnostic_templates (
  id uuid primary key default gen_random_uuid(),
  diagnostic_key text not null,
  version integer not null default 1,
  name text not null,
  description text,
  growth_levers jsonb not null default '[]'::jsonb,
  universal_dimensions jsonb not null default '[]'::jsonb,
  scoring_model jsonb not null default '{}'::jsonb,
  opportunity_formula jsonb not null default '{}'::jsonb,
  mapped_playbook_keys jsonb not null default '[]'::jsonb,
  status text not null default 'draft',
  provenance jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint intelligence_diagnostic_templates_key_version_unique unique (diagnostic_key, version),
  constraint intelligence_diagnostic_templates_version_check check (version > 0),
  constraint intelligence_diagnostic_templates_status_check check (status in ('draft','active','deprecated','archived'))
);

create table public.intelligence_diagnostic_questions (
  id uuid primary key default gen_random_uuid(),
  diagnostic_template_id uuid not null references public.intelligence_diagnostic_templates(id) on delete cascade,
  sort_order integer not null,
  category text not null,
  question text not null,
  question_type text not null,
  calculation_rule jsonb not null default '{}'::jsonb,
  scoring_rule jsonb not null default '{}'::jsonb,
  recommendation_rule jsonb not null default '{}'::jsonb,
  evidence_requirement text,
  required boolean not null default true,
  metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint intelligence_diagnostic_questions_template_sort_unique unique (diagnostic_template_id, sort_order),
  constraint intelligence_diagnostic_questions_sort_order_check check (sort_order > 0)
);

comment on table public.intelligence_taxonomy is 'Service-role-only INKSIGHTS taxonomy supporting diagnostics, playbooks and evidence classification.';
comment on table public.intelligence_source_registry is 'Service-role-only INKSIGHTS source-governance registry for evidence and intelligence inputs.';
comment on table public.intelligence_diagnostic_templates is 'Service-role-only versioned INKSIGHTS diagnostic templates. Composite diagnostics map to atomic canonical growth playbooks.';
comment on table public.intelligence_diagnostic_questions is 'Service-role-only evidence-backed diagnostic question library.';

alter table public.intelligence_taxonomy enable row level security;
alter table public.intelligence_source_registry enable row level security;
alter table public.intelligence_diagnostic_templates enable row level security;
alter table public.intelligence_diagnostic_questions enable row level security;

revoke all on table public.intelligence_taxonomy from anon, authenticated;
revoke all on table public.intelligence_source_registry from anon, authenticated;
revoke all on table public.intelligence_diagnostic_templates from anon, authenticated;
revoke all on table public.intelligence_diagnostic_questions from anon, authenticated;

grant select, insert, update, delete on table public.intelligence_taxonomy to service_role;
grant select, insert, update, delete on table public.intelligence_source_registry to service_role;
grant select, insert, update, delete on table public.intelligence_diagnostic_templates to service_role;
grant select, insert, update, delete on table public.intelligence_diagnostic_questions to service_role;