-- Canonical INKSIGHTS intelligence layer.
-- Additive only. Existing Emergent-derived visibility/revenue infrastructure remains intact.
-- This source file mirrors the migration already applied to canonical Supabase at version 20260907040244.

create table if not exists public.intelligence_metric_definitions (
  id uuid primary key default gen_random_uuid(), key text not null, name text not null, description text, unit text,
  classification text not null default 'derived' check (classification in ('observed','derived','modelled','inferred','evidence_backed')),
  version integer not null default 1 check (version > 0), formula text,
  status text not null default 'active' check (status in ('draft','active','deprecated')),
  created_at timestamptz not null default now(), updated_at timestamptz not null default now(), unique (key, version)
);
create table if not exists public.intelligence_metric_values (
  id uuid primary key default gen_random_uuid(), studio_id uuid not null references public.visibility_studios(id) on delete cascade,
  metric_definition_id uuid not null references public.intelligence_metric_definitions(id) on delete restrict,
  value_numeric numeric, value_text text, unit text,
  classification text not null check (classification in ('observed','derived','modelled','inferred','evidence_backed')),
  confidence numeric check (confidence is null or confidence between 0 and 1), observed_at timestamptz,
  source_type text, source_ref text, lineage jsonb not null default '[]'::jsonb, created_at timestamptz not null default now(),
  check (value_numeric is not null or value_text is not null)
);
create table if not exists public.intelligence_evidence (
  id uuid primary key default gen_random_uuid(), studio_id uuid not null references public.visibility_studios(id) on delete cascade,
  evidence_type text not null, classification text not null check (classification in ('observed','derived','modelled','inferred','evidence_backed')),
  source_type text not null, source_ref text, metric_value_id uuid references public.intelligence_metric_values(id) on delete set null,
  claim text, payload jsonb not null default '{}'::jsonb, confidence numeric check (confidence is null or confidence between 0 and 1),
  observed_at timestamptz, created_at timestamptz not null default now()
);
create table if not exists public.intelligence_findings (
  id uuid primary key default gen_random_uuid(), studio_id uuid not null references public.visibility_studios(id) on delete cascade,
  finding_type text not null, statement text not null, severity text not null default 'medium' check (severity in ('low','medium','high','critical')),
  confidence numeric check (confidence is null or confidence between 0 and 1), status text not null default 'open' check (status in ('draft','open','validated','dismissed','resolved')),
  evidence_ids uuid[] not null default '{}', created_at timestamptz not null default now(), updated_at timestamptz not null default now()
);
create table if not exists public.intelligence_diagnoses (
  id uuid primary key default gen_random_uuid(), studio_id uuid not null references public.visibility_studios(id) on delete cascade,
  finding_id uuid not null references public.intelligence_findings(id) on delete cascade, primary_hypothesis text not null,
  competing_explanations jsonb not null default '[]'::jsonb, supporting_evidence_ids uuid[] not null default '{}',
  missing_evidence jsonb not null default '[]'::jsonb, confidence numeric check (confidence is null or confidence between 0 and 1),
  status text not null default 'active' check (status in ('draft','active','rejected','resolved')), created_at timestamptz not null default now(), updated_at timestamptz not null default now()
);
create table if not exists public.intelligence_recommendations (
  id uuid primary key default gen_random_uuid(), studio_id uuid not null references public.visibility_studios(id) on delete cascade,
  diagnosis_id uuid not null references public.intelligence_diagnoses(id) on delete cascade, opportunity_id uuid references public.visibility_opportunities(id) on delete set null,
  title text not null, recommendation text not null, rationale text, expected_effect jsonb not null default '{}'::jsonb,
  implementation_effort text, confidence numeric check (confidence is null or confidence between 0 and 1), evidence_ids uuid[] not null default '{}',
  status text not null default 'proposed' check (status in ('draft','proposed','accepted','rejected','superseded','completed')), created_at timestamptz not null default now(), updated_at timestamptz not null default now()
);
create table if not exists public.intelligence_decisions (
  id uuid primary key default gen_random_uuid(), studio_id uuid not null references public.visibility_studios(id) on delete cascade,
  recommendation_id uuid not null references public.intelligence_recommendations(id) on delete cascade,
  decision_type text not null default 'implementation' check (decision_type in ('implementation','rejection','deferral','modification','cancellation')),
  decision text not null, rationale text, expected_outcome jsonb not null default '{}'::jsonb, owner text,
  status text not null default 'proposed' check (status in ('proposed','approved','rejected','modified','deferred','cancelled')),
  decided_at timestamptz, created_at timestamptz not null default now(), updated_at timestamptz not null default now()
);
create table if not exists public.intelligence_interventions (
  id uuid primary key default gen_random_uuid(), studio_id uuid not null references public.visibility_studios(id) on delete cascade,
  decision_id uuid not null references public.intelligence_decisions(id) on delete cascade, intervention_type text not null, description text not null, target text,
  baseline_period_start date, baseline_period_end date, start_at timestamptz, end_at timestamptz, owner text,
  status text not null default 'planned' check (status in ('planned','in_progress','completed','cancelled')),
  implementation_evidence jsonb not null default '[]'::jsonb, created_at timestamptz not null default now(), updated_at timestamptz not null default now()
);
create table if not exists public.intelligence_outcomes (
  id uuid primary key default gen_random_uuid(), studio_id uuid not null references public.visibility_studios(id) on delete cascade,
  intervention_id uuid not null references public.intelligence_interventions(id) on delete cascade, metric_definition_id uuid references public.intelligence_metric_definitions(id) on delete set null,
  baseline_value numeric, observed_value numeric, delta numeric, measurement_period_start date not null, measurement_period_end date not null,
  source_type text not null, source_ref text, classification text not null default 'observed' check (classification in ('observed','derived','modelled','inferred','evidence_backed')),
  confidence numeric check (confidence is null or confidence between 0 and 1), observed_at timestamptz not null default now(), payload jsonb not null default '{}'::jsonb, created_at timestamptz not null default now()
);
create table if not exists public.intelligence_attributions (
  id uuid primary key default gen_random_uuid(), studio_id uuid not null references public.visibility_studios(id) on delete cascade,
  intervention_id uuid not null references public.intelligence_interventions(id) on delete cascade, outcome_id uuid not null references public.intelligence_outcomes(id) on delete cascade,
  attribution_method text not null check (attribution_method in ('before_after','control_group','experiment','difference_in_differences','modelled','manual_analyst_assessment')),
  attribution_confidence numeric check (attribution_confidence is null or attribution_confidence between 0 and 1), attributed_value numeric, attributed_value_pence bigint,
  confounders jsonb not null default '[]'::jsonb, evidence_ids uuid[] not null default '{}', rationale text, created_at timestamptz not null default now()
);
create table if not exists public.intelligence_learning (
  id uuid primary key default gen_random_uuid(), studio_id uuid not null references public.visibility_studios(id) on delete cascade,
  intervention_id uuid references public.intelligence_interventions(id) on delete set null, outcome_id uuid references public.intelligence_outcomes(id) on delete set null,
  attribution_id uuid references public.intelligence_attributions(id) on delete set null, hypothesis text not null, result text not null, learning_type text not null,
  confidence numeric check (confidence is null or confidence between 0 and 1), applies_to jsonb not null default '{}'::jsonb, recommendation_adjustment jsonb not null default '{}'::jsonb, created_at timestamptz not null default now()
);
create index if not exists idx_intel_metric_values_studio on public.intelligence_metric_values(studio_id, metric_definition_id, created_at desc);
create index if not exists idx_intel_evidence_studio on public.intelligence_evidence(studio_id, created_at desc);
create index if not exists idx_intel_findings_studio on public.intelligence_findings(studio_id, status);
create index if not exists idx_intel_diagnoses_studio on public.intelligence_diagnoses(studio_id, finding_id);
create index if not exists idx_intel_recommendations_studio on public.intelligence_recommendations(studio_id, status);
create index if not exists idx_intel_decisions_studio on public.intelligence_decisions(studio_id, status);
create index if not exists idx_intel_interventions_studio on public.intelligence_interventions(studio_id, status);
create index if not exists idx_intel_outcomes_studio on public.intelligence_outcomes(studio_id, measurement_period_end desc);
create index if not exists idx_intel_attributions_studio on public.intelligence_attributions(studio_id, created_at desc);
create index if not exists idx_intel_learning_studio on public.intelligence_learning(studio_id, created_at desc);
alter table public.intelligence_metric_definitions enable row level security;
alter table public.intelligence_metric_values enable row level security;
alter table public.intelligence_evidence enable row level security;
alter table public.intelligence_findings enable row level security;
alter table public.intelligence_diagnoses enable row level security;
alter table public.intelligence_recommendations enable row level security;
alter table public.intelligence_decisions enable row level security;
alter table public.intelligence_interventions enable row level security;
alter table public.intelligence_outcomes enable row level security;
alter table public.intelligence_attributions enable row level security;
alter table public.intelligence_learning enable row level security;
create policy "metric definitions authenticated read" on public.intelligence_metric_definitions for select to authenticated using (status <> 'deprecated');
create policy "metric values tenant access" on public.intelligence_metric_values for all to authenticated using (exists (select 1 from public.studio_members m where m.studio_id = intelligence_metric_values.studio_id and m.user_id = auth.uid() and m.active)) with check (exists (select 1 from public.studio_members m where m.studio_id = intelligence_metric_values.studio_id and m.user_id = auth.uid() and m.active));
create policy "evidence tenant access" on public.intelligence_evidence for all to authenticated using (exists (select 1 from public.studio_members m where m.studio_id = intelligence_evidence.studio_id and m.user_id = auth.uid() and m.active)) with check (exists (select 1 from public.studio_members m where m.studio_id = intelligence_evidence.studio_id and m.user_id = auth.uid() and m.active));
create policy "findings tenant access" on public.intelligence_findings for all to authenticated using (exists (select 1 from public.studio_members m where m.studio_id = intelligence_findings.studio_id and m.user_id = auth.uid() and m.active)) with check (exists (select 1 from public.studio_members m where m.studio_id = intelligence_findings.studio_id and m.user_id = auth.uid() and m.active));
create policy "diagnoses tenant access" on public.intelligence_diagnoses for all to authenticated using (exists (select 1 from public.studio_members m where m.studio_id = intelligence_diagnoses.studio_id and m.user_id = auth.uid() and m.active)) with check (exists (select 1 from public.studio_members m where m.studio_id = intelligence_diagnoses.studio_id and m.user_id = auth.uid() and m.active));
create policy "recommendations tenant access" on public.intelligence_recommendations for all to authenticated using (exists (select 1 from public.studio_members m where m.studio_id = intelligence_recommendations.studio_id and m.user_id = auth.uid() and m.active)) with check (exists (select 1 from public.studio_members m where m.studio_id = intelligence_recommendations.studio_id and m.user_id = auth.uid() and m.active));
create policy "decisions tenant access" on public.intelligence_decisions for all to authenticated using (exists (select 1 from public.studio_members m where m.studio_id = intelligence_decisions.studio_id and m.user_id = auth.uid() and m.active)) with check (exists (select 1 from public.studio_members m where m.studio_id = intelligence_decisions.studio_id and m.user_id = auth.uid() and m.active));
create policy "interventions tenant access" on public.intelligence_interventions for all to authenticated using (exists (select 1 from public.studio_members m where m.studio_id = intelligence_interventions.studio_id and m.user_id = auth.uid() and m.active)) with check (exists (select 1 from public.studio_members m where m.studio_id = intelligence_interventions.studio_id and m.user_id = auth.uid() and m.active));
create policy "outcomes tenant access" on public.intelligence_outcomes for all to authenticated using (exists (select 1 from public.studio_members m where m.studio_id = intelligence_outcomes.studio_id and m.user_id = auth.uid() and m.active)) with check (exists (select 1 from public.studio_members m where m.studio_id = intelligence_outcomes.studio_id and m.user_id = auth.uid() and m.active));
create policy "attributions tenant access" on public.intelligence_attributions for all to authenticated using (exists (select 1 from public.studio_members m where m.studio_id = intelligence_attributions.studio_id and m.user_id = auth.uid() and m.active)) with check (exists (select 1 from public.studio_members m where m.studio_id = intelligence_attributions.studio_id and m.user_id = auth.uid() and m.active));
create policy "learning tenant access" on public.intelligence_learning for all to authenticated using (exists (select 1 from public.studio_members m where m.studio_id = intelligence_learning.studio_id and m.user_id = auth.uid() and m.active)) with check (exists (select 1 from public.studio_members m where m.studio_id = intelligence_learning.studio_id and m.user_id = auth.uid() and m.active));
revoke all on public.intelligence_metric_definitions, public.intelligence_metric_values, public.intelligence_evidence, public.intelligence_findings, public.intelligence_diagnoses, public.intelligence_recommendations, public.intelligence_decisions, public.intelligence_interventions, public.intelligence_outcomes, public.intelligence_attributions, public.intelligence_learning from anon;
insert into public.intelligence_metric_definitions (key,name,description,unit,classification,version,formula) values
('demand','Demand','Observed provider demand before scoring transformation.','searches/month','observed',1,null),
('local_search_opportunity_score','Local Search Opportunity Score','Versioned composite opportunity score.','0-100','derived',1,'Versioned composite; weights require calibration.'),
('conversion_potential','Conversion Potential','Modelled conversion propensity until first-party outcomes exist.','0-100','modelled',1,'Modelled prior; never present as observed conversion.'),
('revenue_opportunity','Revenue Opportunity','Modelled economic scenario based on explicit assumptions.','GBP/month','modelled',1,'Scenario model; not observed revenue.')
on conflict (key, version) do nothing;
