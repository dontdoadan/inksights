alter table public.intelligence_economic_opportunities
  add column if not exists value_classification text;

alter table public.intelligence_economic_opportunities
  drop constraint if exists intelligence_economic_opportunities_value_classification_check;

alter table public.intelligence_economic_opportunities
  add constraint intelligence_economic_opportunities_value_classification_check
  check (
    value_classification is null
    or value_classification in ('recoverable_leakage','modelled_opportunity','captured_upside')
  );

update public.intelligence_economic_opportunities
set value_classification = 'modelled_opportunity'
where value_classification is null;

alter table public.intelligence_economic_opportunities
  alter column value_classification set default 'modelled_opportunity';

alter table public.intelligence_outcomes
  add column if not exists value_classification text;

alter table public.intelligence_outcomes
  drop constraint if exists intelligence_outcomes_value_classification_check;

alter table public.intelligence_outcomes
  add constraint intelligence_outcomes_value_classification_check
  check (
    value_classification is null
    or value_classification in ('recoverable_leakage','modelled_opportunity','captured_upside')
  );

alter table public.intelligence_diagnoses
  add column if not exists resolution_state text;

alter table public.intelligence_diagnoses
  drop constraint if exists intelligence_diagnoses_resolution_state_check;

alter table public.intelligence_diagnoses
  add constraint intelligence_diagnoses_resolution_state_check
  check (
    resolution_state is null
    or resolution_state in ('supported','not_supported','insufficient_data')
  );

insert into public.intelligence_taxonomy
  (taxonomy_type, taxonomy_key, display_name, description, is_active, metadata)
values
  ('constraint_family','demand_visibility','Demand / Visibility','High-intent demand generation and local/public discovery constraints.',true,'{"economic_levers":["customers"],"governance_version":"constraint-diagnostic-v1"}'::jsonb),
  ('constraint_family','conversion','Conversion','Enquiry, consultation, booking and deposit conversion constraints.',true,'{"economic_levers":["customers"],"governance_version":"constraint-diagnostic-v1"}'::jsonb),
  ('constraint_family','appointment_leakage','Appointment Leakage','No-show, late-cancellation, unfilled cancellation and related recovery constraints.',true,'{"economic_levers":["customers","frequency"],"governance_version":"constraint-diagnostic-v1"}'::jsonb),
  ('constraint_family','capacity_utilisation','Capacity Utilisation','Productive-capacity availability, scheduling and sellable headroom constraints.',true,'{"economic_levers":["customers","average_transaction_value"],"governance_version":"constraint-diagnostic-v1"}'::jsonb),
  ('constraint_family','pricing_monetisation','Pricing / Monetisation','Price realisation, packaging, margin and average-transaction-value constraints.',true,'{"economic_levers":["average_transaction_value"],"governance_version":"constraint-diagnostic-v1"}'::jsonb),
  ('constraint_family','frequency_retention','Frequency / Retention','Repeat purchase, rebooking, lifecycle and reactivation constraints.',true,'{"economic_levers":["frequency"],"governance_version":"constraint-diagnostic-v1"}'::jsonb),
  ('constraint_family','measurement_readiness','Measurement Readiness','Evidence, baseline, identity, period and lineage gaps that block defensible diagnosis.',true,'{"economic_levers":[],"diagnostic_gate":true,"governance_version":"constraint-diagnostic-v1"}'::jsonb),
  ('diagnostic_resolution_state','supported','Supported','Sufficient evidence supports the proposed constraint.',true,'{"governance_version":"constraint-diagnostic-v1"}'::jsonb),
  ('diagnostic_resolution_state','not_supported','Not Supported','Sufficient evidence exists and does not support the proposed constraint.',true,'{"governance_version":"constraint-diagnostic-v1"}'::jsonb),
  ('diagnostic_resolution_state','insufficient_data','Insufficient Data','Required evidence is absent, stale, incompatible or too weak to decide.',true,'{"blocks_financial_claim":true,"governance_version":"constraint-diagnostic-v1"}'::jsonb),
  ('commercial_value_classification','recoverable_leakage','Recoverable Leakage','Evidence-backed value attached to a real commercial commitment or demand event that escaped or was put at risk.',true,'{"governance_version":"commercial-value-v1"}'::jsonb),
  ('commercial_value_classification','modelled_opportunity','Modelled Opportunity','Potential incremental value dependent on explicit assumptions or counterfactual change.',true,'{"governance_version":"commercial-value-v1"}'::jsonb),
  ('commercial_value_classification','captured_upside','Captured Upside','Measured incremental value after intervention, subject to baseline and attribution.',true,'{"governance_version":"commercial-value-v1"}'::jsonb),
  ('benchmark_state','empirical','Empirical','Comparable cohort with known definitions and sufficient evidence for benchmark use.',true,'{"governance_version":"benchmark-cohort-v1"}'::jsonb),
  ('benchmark_state','directional','Directional','Limited or imperfect comparison set usable only with qualification.',true,'{"governance_version":"benchmark-cohort-v1"}'::jsonb),
  ('benchmark_state','uncalibrated','Uncalibrated','Operational hypothesis not supported by a validated benchmark cohort.',true,'{"governance_version":"benchmark-cohort-v1"}'::jsonb),
  ('benchmark_state','insufficient_data','Insufficient Data','No defensible comparison can be produced.',true,'{"governance_version":"benchmark-cohort-v1"}'::jsonb)
on conflict (taxonomy_type, taxonomy_key) do update
set display_name = excluded.display_name,
    description = excluded.description,
    is_active = excluded.is_active,
    metadata = excluded.metadata,
    updated_at = now();

insert into public.intelligence_metric_definitions
  (key, name, description, unit, classification, version, formula, status)
values
  ('recoverable_leakage_value','Recoverable Leakage Value','Evidence-backed value attached to real scheduled/committed commercial events that was not recovered. Unused general capacity is excluded.','GBP/period','derived',1,'Sum mutually exclusive evidenced leakage events net of retained deposits/refunds/recovery; requires event-level lineage.','active'),
  ('captured_upside_value','Captured Upside Value','Measured incremental value after an intervention relative to an explicit baseline or comparison method.','GBP/period','derived',1,'Measured post-intervention value minus valid baseline/comparison value; causal claims require a separate attribution record.','active')
on conflict (key, version) do update
set name = excluded.name,
    description = excluded.description,
    unit = excluded.unit,
    classification = excluded.classification,
    formula = excluded.formula,
    status = excluded.status,
    updated_at = now();