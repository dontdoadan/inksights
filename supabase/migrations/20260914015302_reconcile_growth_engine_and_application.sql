-- INKSIGHTS public/application schema reconciliation.
-- Idempotent by design so it safely converges the current canonical project and clean rebuilds.

create extension if not exists pgcrypto;

create table if not exists public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  full_name text,
  studio_name text,
  location text,
  artist_count integer check (artist_count is null or artist_count >= 0),
  onboarding_stage text not null default 'profile',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.scenarios (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  name text not null check (char_length(btrim(name)) between 1 and 120),
  audience text not null default 'studio' check (audience in ('studio','investor')),
  inputs jsonb not null default '{}'::jsonb,
  results jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create index if not exists idx_scenarios_user_updated on public.scenarios(user_id, updated_at desc);
alter table public.profiles enable row level security;
alter table public.scenarios enable row level security;
drop policy if exists "profiles own row" on public.profiles;
create policy "profiles own row" on public.profiles for all to authenticated using (id = (select auth.uid())) with check (id = (select auth.uid()));
drop policy if exists "scenarios own rows" on public.scenarios;
create policy "scenarios own rows" on public.scenarios for all to authenticated using (user_id = (select auth.uid())) with check (user_id = (select auth.uid()));
grant select, insert, update on public.profiles to authenticated;
grant select, insert, update, delete on public.scenarios to authenticated;
revoke all on public.profiles, public.scenarios from anon;

drop policy if exists "revenue audit leads authenticated self read" on public.revenue_audit_leads;
create policy "revenue audit leads authenticated self read" on public.revenue_audit_leads for select to authenticated using (lower(email) = lower(coalesce((select auth.jwt() ->> 'email'), '')));

alter table public.visibility_studios add column if not exists canonical_status text not null default 'candidate';
alter table public.visibility_studios add column if not exists legal_entity_type text;
alter table public.visibility_studios add column if not exists companies_house_number text;
alter table public.visibility_studios add column if not exists normalized_name text;
alter table public.visibility_studios add column if not exists normalized_postcode text;
alter table public.visibility_studios add column if not exists latitude double precision;
alter table public.visibility_studios add column if not exists longitude double precision;
alter table public.visibility_studios add column if not exists identity_confidence numeric not null default 0;
alter table public.visibility_studios add column if not exists first_observed_at timestamptz;
alter table public.visibility_studios add column if not exists last_observed_at timestamptz;
alter table public.visibility_studios add column if not exists last_verified_at timestamptz;
alter table public.visibility_studios add column if not exists next_review_at timestamptz;

create table if not exists public.studio_sources (
  id uuid primary key default gen_random_uuid(), source_key text not null unique, source_name text not null, source_type text not null, access_method text not null,
  terms_url text, permitted_for_commercial_use boolean, notes text, active boolean not null default true, refresh_interval_days integer not null default 90 check (refresh_interval_days > 0),
  created_at timestamptz not null default now(), updated_at timestamptz not null default now()
);
create table if not exists public.studio_candidates (
  id uuid primary key default gen_random_uuid(), source_id uuid not null references public.studio_sources(id) on delete restrict, source_record_key text, source_url text,
  observed_at timestamptz not null default now(), name text, normalized_name text, address text, postcode text, normalized_postcode text, town text, region text, phone text,
  website_url text, instagram_handle text, companies_house_number text, legal_entity_type text, latitude double precision, longitude double precision, payload jsonb not null default '{}'::jsonb,
  identity_status text not null default 'unresolved', matched_studio_id uuid references public.visibility_studios(id) on delete set null,
  match_confidence numeric check (match_confidence is null or match_confidence between 0 and 1), reviewed_at timestamptz, created_at timestamptz not null default now(), updated_at timestamptz not null default now()
);
create table if not exists public.studio_source_observations (
  id uuid primary key default gen_random_uuid(), studio_id uuid references public.visibility_studios(id) on delete cascade, candidate_id uuid references public.studio_candidates(id) on delete cascade,
  source_id uuid not null references public.studio_sources(id) on delete restrict, observed_at timestamptz not null default now(), observation_type text not null, field_name text,
  observed_value jsonb not null default '{}'::jsonb, source_url text, source_record_key text, content_hash text, confidence numeric check (confidence is null or confidence between 0 and 1),
  raw_payload jsonb not null default '{}'::jsonb, created_at timestamptz not null default now()
);
create table if not exists public.studio_identity_matches (
  id uuid primary key default gen_random_uuid(), candidate_id uuid not null references public.studio_candidates(id) on delete cascade, studio_id uuid not null references public.visibility_studios(id) on delete cascade,
  match_method text not null, match_score numeric not null check (match_score between 0 and 1), evidence jsonb not null default '{}'::jsonb, status text not null default 'proposed', reviewed_by uuid, reviewed_at timestamptz, created_at timestamptz not null default now()
);
create table if not exists public.studio_verification_events (
  id uuid primary key default gen_random_uuid(), studio_id uuid not null references public.visibility_studios(id) on delete cascade, verification_type text not null, status text not null,
  source_id uuid references public.studio_sources(id) on delete set null, evidence jsonb not null default '{}'::jsonb, confidence numeric check (confidence is null or confidence between 0 and 1),
  verified_at timestamptz not null default now(), expires_at timestamptz, reviewer_id uuid, created_at timestamptz not null default now()
);
create table if not exists public.studio_aliases (
  id uuid primary key default gen_random_uuid(), studio_id uuid not null references public.visibility_studios(id) on delete cascade, alias_type text not null, alias_value text not null,
  normalized_value text not null, source_id uuid references public.studio_sources(id) on delete set null, first_observed_at timestamptz not null default now(), last_observed_at timestamptz not null default now(), active boolean not null default true
);
create table if not exists public.studio_change_events (
  id uuid primary key default gen_random_uuid(), studio_id uuid not null references public.visibility_studios(id) on delete cascade, source_id uuid references public.studio_sources(id) on delete set null,
  detected_at timestamptz not null default now(), change_type text not null, field_name text, previous_value jsonb, new_value jsonb, evidence jsonb not null default '{}'::jsonb,
  status text not null default 'detected', reviewed_at timestamptz, created_at timestamptz not null default now()
);
alter table public.studio_sources enable row level security;
alter table public.studio_candidates enable row level security;
alter table public.studio_source_observations enable row level security;
alter table public.studio_identity_matches enable row level security;
alter table public.studio_verification_events enable row level security;
alter table public.studio_aliases enable row level security;
alter table public.studio_change_events enable row level security;
revoke all on public.studio_sources, public.studio_candidates, public.studio_source_observations, public.studio_identity_matches, public.studio_verification_events, public.studio_aliases, public.studio_change_events from anon, authenticated;

create table if not exists public.intelligence_source_registry (
  id uuid primary key default gen_random_uuid(), source_key text not null unique, source_name text not null, source_type text not null, source_url text, domain text,
  geographic_relevance text, reliability_score numeric, approved boolean not null default false, notes text, last_reviewed_at timestamptz, metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(), updated_at timestamptz not null default now()
);
create table if not exists public.intelligence_taxonomy (
  id uuid primary key default gen_random_uuid(), taxonomy_type text not null, taxonomy_key text not null, display_name text not null, description text,
  parent_id uuid references public.intelligence_taxonomy(id) on delete set null, is_active boolean not null default true, metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(), updated_at timestamptz not null default now(), unique (taxonomy_type, taxonomy_key)
);
create table if not exists public.intelligence_diagnostic_templates (
  id uuid primary key default gen_random_uuid(), diagnostic_key text not null, version integer not null default 1 check (version > 0), name text not null, description text,
  universal_dimensions jsonb not null default '[]'::jsonb, growth_levers jsonb not null default '[]'::jsonb, scoring_model jsonb not null default '{}'::jsonb,
  opportunity_formula jsonb not null default '{}'::jsonb, mapped_playbook_keys jsonb not null default '[]'::jsonb, provenance jsonb not null default '{}'::jsonb,
  status text not null default 'active', created_at timestamptz not null default now(), updated_at timestamptz not null default now(), unique (diagnostic_key, version)
);
create table if not exists public.intelligence_diagnostic_questions (
  id uuid primary key default gen_random_uuid(), diagnostic_template_id uuid not null references public.intelligence_diagnostic_templates(id) on delete cascade,
  sort_order integer not null, category text not null, question text not null, question_type text not null, required boolean not null default false,
  scoring_rule jsonb not null default '{}'::jsonb, calculation_rule jsonb not null default '{}'::jsonb, recommendation_rule jsonb not null default '{}'::jsonb,
  evidence_requirement text, metadata jsonb not null default '{}'::jsonb, created_at timestamptz not null default now(), updated_at timestamptz not null default now()
);
alter table public.intelligence_source_registry enable row level security;
alter table public.intelligence_taxonomy enable row level security;
alter table public.intelligence_diagnostic_templates enable row level security;
alter table public.intelligence_diagnostic_questions enable row level security;
revoke all on public.intelligence_source_registry, public.intelligence_taxonomy, public.intelligence_diagnostic_templates, public.intelligence_diagnostic_questions from anon;

create table if not exists public.intelligence_business_profiles (
  studio_id uuid primary key references public.visibility_studios(id) on delete cascade, business_type text not null default 'tattoo_studio', industry text, subindustry text, business_model text,
  currency text not null default 'GBP' check (char_length(currency) = 3), timezone text not null default 'Europe/London', metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(), updated_at timestamptz not null default now()
);
create table if not exists public.intelligence_growth_diagnostics (
  id uuid primary key default gen_random_uuid(), studio_id uuid not null references public.visibility_studios(id) on delete cascade, diagnostic_version text not null default 'three-lever-v1',
  period_start date not null, period_end date not null, baseline_revenue_pence bigint, unique_customers numeric, transactions numeric, purchase_frequency numeric, average_transaction_value_pence bigint,
  customer_opportunity_pence bigint, frequency_opportunity_pence bigint, atv_opportunity_pence bigint,
  primary_lever text check (primary_lever is null or primary_lever in ('customers','frequency','average_transaction_value')),
  constraints jsonb not null default '[]'::jsonb, assumptions jsonb not null default '[]'::jsonb, evidence_ids uuid[] not null default '{}',
  confidence numeric check (confidence is null or confidence between 0 and 1), status text not null default 'draft' check (status in ('draft','measured','scored','superseded')),
  created_at timestamptz not null default now(), updated_at timestamptz not null default now()
);
create table if not exists public.intelligence_opportunity_scoring_versions (
  key text primary key, name text not null, description text, weights jsonb not null, status text not null default 'active' check (status in ('draft','active','deprecated')), created_at timestamptz not null default now()
);
create table if not exists public.intelligence_playbooks (
  id uuid primary key default gen_random_uuid(), key text not null, version integer not null default 1 check (version > 0), name text not null,
  lever text not null check (lever in ('customers','frequency','average_transaction_value')), category text not null, hypothesis text not null, trigger_description text not null,
  required_metric_keys jsonb not null default '[]'::jsonb, action_steps jsonb not null default '[]'::jsonb, primary_metric_key text not null, guardrail_metric_keys jsonb not null default '[]'::jsonb,
  expected_time_to_signal_days integer check (expected_time_to_signal_days is null or expected_time_to_signal_days > 0), effort_score integer not null default 3 check (effort_score between 1 and 5),
  risk_score integer not null default 2 check (risk_score between 1 and 5), status text not null default 'active' check (status in ('draft','active','deprecated')),
  created_at timestamptz not null default now(), updated_at timestamptz not null default now()
);
create unique index if not exists uq_intelligence_playbooks_key_version on public.intelligence_playbooks(key,version);
create table if not exists public.intelligence_opportunity_scores (
  id uuid primary key default gen_random_uuid(), studio_id uuid not null references public.visibility_studios(id) on delete cascade,
  diagnostic_id uuid references public.intelligence_growth_diagnostics(id) on delete set null, diagnosis_id uuid references public.intelligence_diagnoses(id) on delete set null,
  playbook_id uuid references public.intelligence_playbooks(id) on delete set null, lever text not null check (lever in ('customers','frequency','average_transaction_value')), title text not null,
  opportunity_value_pence bigint, impact_score numeric not null check (impact_score between 0 and 100), evidence_strength_score numeric not null check (evidence_strength_score between 0 and 100),
  confidence_score numeric not null check (confidence_score between 0 and 100), ease_score numeric not null check (ease_score between 0 and 100), speed_score numeric not null check (speed_score between 0 and 100),
  strategic_fit_score numeric not null check (strategic_fit_score between 0 and 100), feasibility_score numeric not null check (feasibility_score between 0 and 100), learning_value_score numeric not null check (learning_value_score between 0 and 100),
  total_score numeric generated always as (impact_score * 0.30 + evidence_strength_score * 0.10 + confidence_score * 0.10 + ease_score * 0.15 + speed_score * 0.10 + strategic_fit_score * 0.10 + feasibility_score * 0.10 + learning_value_score * 0.05) stored,
  scoring_version text not null default 'growth-opportunity-v1' references public.intelligence_opportunity_scoring_versions(key), rationale text, evidence_ids uuid[] not null default '{}',
  status text not null default 'candidate' check (status in ('candidate','prioritised','recommended','dismissed','completed')), created_at timestamptz not null default now(), updated_at timestamptz not null default now()
);
alter table public.intelligence_recommendations add column if not exists playbook_id uuid;
alter table public.intelligence_recommendations add column if not exists opportunity_score_id uuid;
alter table public.intelligence_recommendations add column if not exists primary_metric_key text;
alter table public.intelligence_recommendations add column if not exists target_value numeric;
alter table public.intelligence_recommendations add column if not exists measurement_window_days integer;
do $$ begin alter table public.intelligence_recommendations add constraint intelligence_recommendations_playbook_id_fkey foreign key (playbook_id) references public.intelligence_playbooks(id) on delete set null; exception when duplicate_object then null; end $$;
do $$ begin alter table public.intelligence_recommendations add constraint intelligence_recommendations_opportunity_score_id_fkey foreign key (opportunity_score_id) references public.intelligence_opportunity_scores(id) on delete set null; exception when duplicate_object then null; end $$;
alter table public.intelligence_business_profiles enable row level security;
alter table public.intelligence_growth_diagnostics enable row level security;
alter table public.intelligence_opportunity_scoring_versions enable row level security;
alter table public.intelligence_playbooks enable row level security;
alter table public.intelligence_opportunity_scores enable row level security;
revoke all on public.intelligence_business_profiles, public.intelligence_growth_diagnostics, public.intelligence_opportunity_scoring_versions, public.intelligence_playbooks, public.intelligence_opportunity_scores from anon;

insert into public.intelligence_opportunity_scoring_versions(key,name,description,weights,status) values ('growth-opportunity-v1','Growth Opportunity v1','Versioned INKSIGHTS opportunity prioritisation model.','{"impact":0.30,"evidence_strength":0.10,"confidence":0.10,"ease":0.15,"speed":0.10,"strategic_fit":0.10,"feasibility":0.10,"learning_value":0.05}'::jsonb,'active') on conflict (key) do update set weights = excluded.weights, name = excluded.name, description = excluded.description;
insert into public.intelligence_metric_definitions(key,name,unit,classification,version,formula) values
('revenue','Revenue','GBP','observed',1,null),('transactions','Transactions','transactions','observed',1,null),('unique_customers','Unique Customers','customers','observed',1,null),('new_customers','New Customers','customers','observed',1,null),('leads','Leads','leads','observed',1,null),('qualified_leads','Qualified Leads','leads','observed',1,null),
('average_transaction_value','Average Transaction Value','GBP/transaction','derived',1,'revenue / transactions'),('purchase_frequency','Purchase Frequency','transactions/customer','derived',1,'transactions / unique_customers'),('lead_to_customer_conversion_rate','Lead-to-Customer Conversion Rate','percent','derived',1,'new_customers / qualified_leads'),
('repeat_customers','Repeat Customers','customers','derived',1,'Count of customers with repeat transactions in the defined lookback.'),('repeat_customer_rate','Repeat Customer Rate','percent','derived',1,'repeat_customers / unique_customers'),('customer_retention_rate','Customer Retention Rate','percent','derived',1,'Versioned cohort retention calculation.'),('days_to_second_purchase','Days to Second Purchase','days','derived',1,'Median(second_transaction_at - first_transaction_at).'),
('capacity_units','Capacity Units','units','observed',1,null),('booked_capacity_units','Booked Capacity Units','units','observed',1,null),('capacity_utilisation_rate','Capacity Utilisation Rate','percent','derived',1,'booked_capacity_units / capacity_units'),('cancellation_rate','Cancellation Rate','percent','derived',1,'cancelled_transactions / scheduled_transactions'),('no_show_rate','No-show Rate','percent','derived',1,'no_show_transactions / scheduled_transactions'),
('gross_profit','Gross Profit','GBP','derived',1,'revenue - direct_cost'),('gross_margin_rate','Gross Margin Rate','percent','derived',1,'gross_profit / revenue'),('refund_rate','Refund Rate','percent','derived',1,'refunded_value / gross_transaction_value'),('price_realisation_rate','Price Realisation Rate','percent','derived',1,'realised_price / reference_price'),('customer_acquisition_cost','Customer Acquisition Cost','GBP/customer','derived',1,'attributable_acquisition_spend / new_customers'),
('customer_lifetime_value','Customer Lifetime Value','GBP/customer','modelled',1,'Must declare realised vs modelled lineage.'),('churn_rate','Churn Rate','percent','derived',1,'Versioned churn calculation.'),('customer_growth_opportunity','Customer Growth Opportunity','GBP','modelled',1,'delta_customers * purchase_frequency * average_transaction_value'),('frequency_growth_opportunity','Frequency Growth Opportunity','GBP','modelled',1,'unique_customers * delta_frequency * average_transaction_value'),('atv_growth_opportunity','ATV Growth Opportunity','GBP','modelled',1,'unique_customers * purchase_frequency * delta_average_transaction_value') on conflict (key,version) do nothing;
insert into public.intelligence_playbooks(key,version,name,lever,category,hypothesis,trigger_description,required_metric_keys,action_steps,primary_metric_key,guardrail_metric_keys,expected_time_to_signal_days,effort_score,risk_score,status) values ('no_show_prevention',1,'No-show Prevention','customers','capacity_recovery','Reducing preventable no-shows protects already-won demand and productive capacity.','Observed no-show rate is material and confirmation or commitment controls are weak.','["no_show_rate","transactions"]'::jsonb,'["Measure no-show patterns","Strengthen confirmation and commitment controls","Define escalation/reminder logic","Measure recovered completed transactions"]'::jsonb,'transactions','["cancellation_rate","lead_to_customer_conversion_rate"]'::jsonb,45,3,2,'active') on conflict (key,version) do nothing;

drop policy if exists "metric values tenant access" on public.intelligence_metric_values;
create policy "metric values tenant access" on public.intelligence_metric_values for all to authenticated using (exists (select 1 from public.studio_members m where m.studio_id = intelligence_metric_values.studio_id and m.user_id = (select auth.uid()) and m.active)) with check (exists (select 1 from public.studio_members m where m.studio_id = intelligence_metric_values.studio_id and m.user_id = (select auth.uid()) and m.active));
drop policy if exists "evidence tenant access" on public.intelligence_evidence;
create policy "evidence tenant access" on public.intelligence_evidence for all to authenticated using (exists (select 1 from public.studio_members m where m.studio_id = intelligence_evidence.studio_id and m.user_id = (select auth.uid()) and m.active)) with check (exists (select 1 from public.studio_members m where m.studio_id = intelligence_evidence.studio_id and m.user_id = (select auth.uid()) and m.active));
drop policy if exists "findings tenant access" on public.intelligence_findings;
create policy "findings tenant access" on public.intelligence_findings for all to authenticated using (exists (select 1 from public.studio_members m where m.studio_id = intelligence_findings.studio_id and m.user_id = (select auth.uid()) and m.active)) with check (exists (select 1 from public.studio_members m where m.studio_id = intelligence_findings.studio_id and m.user_id = (select auth.uid()) and m.active));
drop policy if exists "diagnoses tenant access" on public.intelligence_diagnoses;
create policy "diagnoses tenant access" on public.intelligence_diagnoses for all to authenticated using (exists (select 1 from public.studio_members m where m.studio_id = intelligence_diagnoses.studio_id and m.user_id = (select auth.uid()) and m.active)) with check (exists (select 1 from public.studio_members m where m.studio_id = intelligence_diagnoses.studio_id and m.user_id = (select auth.uid()) and m.active));
drop policy if exists "recommendations tenant access" on public.intelligence_recommendations;
create policy "recommendations tenant access" on public.intelligence_recommendations for all to authenticated using (exists (select 1 from public.studio_members m where m.studio_id = intelligence_recommendations.studio_id and m.user_id = (select auth.uid()) and m.active)) with check (exists (select 1 from public.studio_members m where m.studio_id = intelligence_recommendations.studio_id and m.user_id = (select auth.uid()) and m.active));
drop policy if exists "decisions tenant access" on public.intelligence_decisions;
create policy "decisions tenant access" on public.intelligence_decisions for all to authenticated using (exists (select 1 from public.studio_members m where m.studio_id = intelligence_decisions.studio_id and m.user_id = (select auth.uid()) and m.active)) with check (exists (select 1 from public.studio_members m where m.studio_id = intelligence_decisions.studio_id and m.user_id = (select auth.uid()) and m.active));
drop policy if exists "interventions tenant access" on public.intelligence_interventions;
create policy "interventions tenant access" on public.intelligence_interventions for all to authenticated using (exists (select 1 from public.studio_members m where m.studio_id = intelligence_interventions.studio_id and m.user_id = (select auth.uid()) and m.active)) with check (exists (select 1 from public.studio_members m where m.studio_id = intelligence_interventions.studio_id and m.user_id = (select auth.uid()) and m.active));
drop policy if exists "outcomes tenant access" on public.intelligence_outcomes;
create policy "outcomes tenant access" on public.intelligence_outcomes for all to authenticated using (exists (select 1 from public.studio_members m where m.studio_id = intelligence_outcomes.studio_id and m.user_id = (select auth.uid()) and m.active)) with check (exists (select 1 from public.studio_members m where m.studio_id = intelligence_outcomes.studio_id and m.user_id = (select auth.uid()) and m.active));
drop policy if exists "attributions tenant access" on public.intelligence_attributions;
create policy "attributions tenant access" on public.intelligence_attributions for all to authenticated using (exists (select 1 from public.studio_members m where m.studio_id = intelligence_attributions.studio_id and m.user_id = (select auth.uid()) and m.active)) with check (exists (select 1 from public.studio_members m where m.studio_id = intelligence_attributions.studio_id and m.user_id = (select auth.uid()) and m.active));
drop policy if exists "learning tenant access" on public.intelligence_learning;
create policy "learning tenant access" on public.intelligence_learning for all to authenticated using (exists (select 1 from public.studio_members m where m.studio_id = intelligence_learning.studio_id and m.user_id = (select auth.uid()) and m.active)) with check (exists (select 1 from public.studio_members m where m.studio_id = intelligence_learning.studio_id and m.user_id = (select auth.uid()) and m.active));

create index if not exists idx_intel_attributions_intervention on public.intelligence_attributions(intervention_id);
create index if not exists idx_intel_attributions_outcome on public.intelligence_attributions(outcome_id);
create index if not exists idx_intel_decisions_recommendation on public.intelligence_decisions(recommendation_id);
create index if not exists idx_intel_diagnoses_finding on public.intelligence_diagnoses(finding_id);
create index if not exists idx_intel_evidence_metric_value on public.intelligence_evidence(metric_value_id);
create index if not exists idx_intel_interventions_decision on public.intelligence_interventions(decision_id);
create index if not exists idx_intel_learning_attribution on public.intelligence_learning(attribution_id);
create index if not exists idx_intel_learning_intervention on public.intelligence_learning(intervention_id);
create index if not exists idx_intel_learning_outcome on public.intelligence_learning(outcome_id);
create index if not exists idx_intel_metric_values_definition on public.intelligence_metric_values(metric_definition_id);
create index if not exists idx_intel_outcomes_intervention on public.intelligence_outcomes(intervention_id);
create index if not exists idx_intel_outcomes_metric_definition on public.intelligence_outcomes(metric_definition_id);
create index if not exists idx_intel_recommendations_diagnosis on public.intelligence_recommendations(diagnosis_id);
create index if not exists idx_intel_recommendations_opportunity on public.intelligence_recommendations(opportunity_id);
create index if not exists idx_studio_aliases_source on public.studio_aliases(source_id);
create index if not exists idx_studio_change_events_source on public.studio_change_events(source_id);
create index if not exists idx_studio_verification_events_source on public.studio_verification_events(source_id);
create index if not exists idx_visibility_competitor_obs_studio on public.visibility_competitor_observations(studio_id);
create index if not exists idx_visibility_competitors_studio on public.visibility_competitors(studio_id);
create index if not exists idx_visibility_observations_keyword on public.visibility_observations(keyword_id);
create index if not exists idx_visibility_opportunities_keyword on public.visibility_opportunities(keyword_id);
create index if not exists idx_visibility_pipeline_report on public.visibility_pipeline_runs(report_run_id);
create index if not exists idx_visibility_pipeline_studio on public.visibility_pipeline_runs(studio_id);
create index if not exists idx_visibility_provider_configs_studio on public.visibility_provider_configs(studio_id);
create index if not exists idx_visibility_provider_obs_pipeline on public.visibility_provider_observations(pipeline_run_id);
create index if not exists idx_visibility_provider_obs_studio on public.visibility_provider_observations(studio_id);
create index if not exists idx_visibility_report_snapshots_run on public.visibility_report_snapshots(report_run_id);
create index if not exists idx_visibility_serp_search_universe on public.visibility_serp_observations(search_universe_id);
create index if not exists idx_visibility_serp_studio on public.visibility_serp_observations(studio_id);