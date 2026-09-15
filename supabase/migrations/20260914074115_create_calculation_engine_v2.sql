create table public.intelligence_calculation_versions (
  key text primary key,
  name text not null,
  description text,
  config jsonb not null default '{}'::jsonb,
  calibration_status text not null default 'pre_calibration' check (calibration_status in ('pre_calibration','calibrating','calibrated','deprecated')),
  status text not null default 'active' check (status in ('draft','active','deprecated')),
  created_at timestamptz not null default now()
);

create table public.intelligence_calculation_runs (
  id uuid primary key default gen_random_uuid(),
  studio_id uuid not null references public.visibility_studios(id) on delete cascade,
  engine_version text not null references public.intelligence_calculation_versions(key) on delete restrict,
  period_start date,
  period_end date,
  input_snapshot jsonb not null,
  output_snapshot jsonb not null,
  assumptions jsonb not null default '{}'::jsonb,
  warnings jsonb not null default '[]'::jsonb,
  evidence_ids uuid[] not null default '{}',
  evidence_quality_score numeric check (evidence_quality_score is null or evidence_quality_score between 0 and 100),
  status text not null default 'computed' check (status in ('draft','computed','reviewed','superseded')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  check (
    (period_start is null and period_end is null)
    or (period_start is not null and period_end is not null and period_start <= period_end)
  )
);

create table public.intelligence_economic_opportunities (
  id uuid primary key default gen_random_uuid(),
  studio_id uuid not null references public.visibility_studios(id) on delete cascade,
  calculation_run_id uuid not null references public.intelligence_calculation_runs(id) on delete cascade,
  lever text not null default 'portfolio' check (lever in ('portfolio','customers','average_transaction_value','purchase_frequency')),
  title text not null,
  unconstrained_low_pence bigint not null check (unconstrained_low_pence >= 0),
  unconstrained_base_pence bigint not null check (unconstrained_base_pence >= 0),
  unconstrained_high_pence bigint not null check (unconstrained_high_pence >= 0),
  constrained_low_pence bigint not null check (constrained_low_pence >= 0),
  constrained_base_pence bigint not null check (constrained_base_pence >= 0),
  constrained_high_pence bigint not null check (constrained_high_pence >= 0),
  constrained_contribution_low_pence bigint check (constrained_contribution_low_pence is null or constrained_contribution_low_pence >= 0),
  constrained_contribution_base_pence bigint check (constrained_contribution_base_pence is null or constrained_contribution_base_pence >= 0),
  constrained_contribution_high_pence bigint check (constrained_contribution_high_pence is null or constrained_contribution_high_pence >= 0),
  capacity_scale_low numeric not null default 1 check (capacity_scale_low between 0 and 1),
  capacity_scale_base numeric not null default 1 check (capacity_scale_base between 0 and 1),
  capacity_scale_high numeric not null default 1 check (capacity_scale_high between 0 and 1),
  evidence_quality_score numeric check (evidence_quality_score is null or evidence_quality_score between 0 and 100),
  classification text not null default 'modelled' check (classification in ('modelled','evidence_backed')),
  assumptions jsonb not null default '{}'::jsonb,
  constraints jsonb not null default '{}'::jsonb,
  evidence_ids uuid[] not null default '{}',
  status text not null default 'modelled' check (status in ('modelled','reviewed','accepted','rejected','superseded')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  check (unconstrained_low_pence <= unconstrained_base_pence and unconstrained_base_pence <= unconstrained_high_pence),
  check (constrained_low_pence <= constrained_base_pence and constrained_base_pence <= constrained_high_pence),
  check (
    (constrained_contribution_low_pence is null and constrained_contribution_base_pence is null and constrained_contribution_high_pence is null)
    or (
      constrained_contribution_low_pence is not null
      and constrained_contribution_base_pence is not null
      and constrained_contribution_high_pence is not null
      and constrained_contribution_low_pence <= constrained_contribution_base_pence
      and constrained_contribution_base_pence <= constrained_contribution_high_pence
    )
  )
);

create index idx_intelligence_calculation_runs_studio_created
  on public.intelligence_calculation_runs(studio_id, created_at desc);
create index idx_intelligence_calculation_runs_version
  on public.intelligence_calculation_runs(engine_version, created_at desc);
create index idx_intelligence_economic_opportunities_studio_created
  on public.intelligence_economic_opportunities(studio_id, created_at desc);
create index idx_intelligence_economic_opportunities_run
  on public.intelligence_economic_opportunities(calculation_run_id);

alter table public.intelligence_calculation_versions enable row level security;
alter table public.intelligence_calculation_runs enable row level security;
alter table public.intelligence_economic_opportunities enable row level security;

create policy "calculation versions authenticated read"
  on public.intelligence_calculation_versions
  for select
  to authenticated
  using (status <> 'deprecated');

create policy "calculation runs tenant access"
  on public.intelligence_calculation_runs
  for all
  to authenticated
  using (
    exists (
      select 1
      from public.studio_members m
      where m.studio_id = intelligence_calculation_runs.studio_id
        and m.user_id = (select auth.uid())
        and m.active
    )
  )
  with check (
    exists (
      select 1
      from public.studio_members m
      where m.studio_id = intelligence_calculation_runs.studio_id
        and m.user_id = (select auth.uid())
        and m.active
    )
  );

create policy "economic opportunities tenant access"
  on public.intelligence_economic_opportunities
  for all
  to authenticated
  using (
    exists (
      select 1
      from public.studio_members m
      where m.studio_id = intelligence_economic_opportunities.studio_id
        and m.user_id = (select auth.uid())
        and m.active
    )
  )
  with check (
    exists (
      select 1
      from public.studio_members m
      where m.studio_id = intelligence_economic_opportunities.studio_id
        and m.user_id = (select auth.uid())
        and m.active
    )
  );

revoke all on public.intelligence_calculation_versions from anon, authenticated;
revoke all on public.intelligence_calculation_runs from anon, authenticated;
revoke all on public.intelligence_economic_opportunities from anon, authenticated;

grant select on public.intelligence_calculation_versions to authenticated;
grant select, insert, update, delete on public.intelligence_calculation_runs to authenticated;
grant select, insert, update, delete on public.intelligence_economic_opportunities to authenticated;
grant all on public.intelligence_calculation_versions to service_role;
grant all on public.intelligence_calculation_runs to service_role;
grant all on public.intelligence_economic_opportunities to service_role;

insert into public.intelligence_calculation_versions (
  key, name, description, config, calibration_status, status
) values (
  'calculation-engine-v2.0.0',
  'Calculation Engine V2.0.0',
  'Deterministic three-lever economic opportunity model with explicit capacity constraints and separate evidence quality.',
  jsonb_build_object(
    'economic_model', 'customers * average_transaction_value * purchase_frequency',
    'scenario_bands', jsonb_build_array('low','base','high'),
    'customer_frequency_combination', 'multiplicative',
    'capacity_rule', 'apply only when capacity_units, booked_capacity_units and capacity_units_per_transaction are all supplied',
    'evidence_quality_aggregation', 'equal-weight harmonic mean of supplied quality dimensions',
    'freshness_formula', '2^(-age_days/freshness_half_life_days)',
    'confidence_scales_economic_value', false,
    'reconciliation_warning_rate', 0.02,
    'portfolio_rule', 'calculate combined state once; do not sum isolated lever opportunities'
  ),
  'pre_calibration',
  'active'
);

insert into public.intelligence_metric_definitions (key, name, description, unit, classification, version, formula, status) values
  ('purchase_frequency','Purchase Frequency','Transactions per unique customer for one declared measurement period.','transactions/customer','derived',2,'transactions / unique_customers; numerator and denominator must share the same period and population.','active'),
  ('average_transaction_value','Average Transaction Value','Observed revenue per completed transaction for one declared measurement period.','GBP/transaction','derived',2,'revenue / transactions; revenue and transactions must share the same period, currency and transaction definition.','active'),
  ('customer_growth_opportunity','Customer Growth Opportunity','Isolated ceteris-paribus customer-lever opportunity. Do not add to other isolated lever opportunities.','GBP/period','modelled',2,'baseline_revenue * customer_uplift; diagnostic only, before portfolio compounding and constraints.','active'),
  ('frequency_growth_opportunity','Frequency Growth Opportunity','Isolated ceteris-paribus frequency-lever opportunity. Do not add to other isolated lever opportunities.','GBP/period','modelled',2,'baseline_revenue * frequency_uplift; diagnostic only, before portfolio compounding and constraints.','active'),
  ('atv_growth_opportunity','ATV Growth Opportunity','Isolated ceteris-paribus average-transaction-value opportunity. Do not add to other isolated lever opportunities.','GBP/period','modelled',2,'baseline_revenue * atv_uplift; diagnostic only, before portfolio compounding and constraints.','active'),
  ('revenue_opportunity','Revenue Opportunity','Combined V2 economic opportunity after three-lever compounding and measurable capacity constraints.','GBP/period','modelled',2,'((transactions + constrained_incremental_transactions) * average_transaction_value * (1 + atv_uplift)) - observed_revenue; customer and frequency uplift compound multiplicatively; capacity applies only when fully measurable.','active'),
  ('revenue_identity_variance_rate','Revenue Identity Variance Rate','Difference between observed revenue and the reconstructed three-lever identity, expressed relative to observed revenue.','ratio','derived',1,'((unique_customers * purchase_frequency * average_transaction_value) - observed_revenue) / observed_revenue.','active'),
  ('capacity_headroom_units','Capacity Headroom Units','Available capacity remaining in the declared capacity unit.','units','derived',1,'max(0, capacity_units - booked_capacity_units).','active'),
  ('capacity_headroom_transactions','Capacity Headroom Transactions','Maximum incremental transactions supported by measured capacity headroom.','transactions','derived',1,'capacity_headroom_units / capacity_units_per_transaction; only valid when the unit conversion is explicit.','active'),
  ('evidence_quality_score','Evidence Quality Score','Separate 0-100 quality signal for the evidence supporting a calculation; it does not scale the economic value.','0-100','derived',1,'100 * harmonic_mean(supplied source reliability, completeness, confidence, sample adequacy, freshness); freshness uses source-specific half-life.','active'),
  ('economic_opportunity_unconstrained','Unconstrained Economic Opportunity','Low/base/high scenario value before operating capacity constraints.','GBP/period','modelled',1,'((transactions * (1 + customer_uplift) * (1 + frequency_uplift)) * average_transaction_value * (1 + atv_uplift)) - observed_revenue.','active'),
  ('economic_opportunity_constrained','Constrained Economic Opportunity','Low/base/high scenario value after measurable operating constraints are applied.','GBP/period','modelled',1,'((transactions + min(requested_incremental_transactions, capacity_headroom_transactions)) * average_transaction_value * (1 + atv_uplift)) - observed_revenue; if capacity is unmeasured, return unconstrained value and flag capacity_unmeasured.','active'),
  ('contribution_opportunity_constrained','Constrained Contribution Opportunity','Constrained incremental contribution generated only when gross-margin evidence is supplied.','GBP/period','modelled',1,'constrained_economic_opportunity * gross_margin_rate; null when gross margin is unavailable.','active')
on conflict (key, version) do nothing;
