update public.intelligence_calculation_versions
set config = (config - 'reconciliation_warning_rate') || jsonb_build_object(
  'contribution_margin_rule',
  'contribution opportunity is emitted only when an evidence-backed contribution margin rate is supplied; gross margin is not substituted'
)
where key = 'calculation-engine-v2.0.0';

update public.intelligence_metric_definitions
set
  description = 'Constrained incremental contribution generated only when an evidence-backed contribution margin rate is supplied.',
  formula = 'constrained_economic_opportunity * contribution_margin_rate; null when contribution margin is unavailable.'
where key = 'contribution_opportunity_constrained' and version = 1;

update public.intelligence_metric_definitions
set
  status = 'deprecated',
  description = 'Deprecated in Calculation Engine V2: when purchase frequency and average transaction value are derived from the same revenue, transaction and customer inputs, this variance is an algebraic identity rather than an independent reconciliation signal.'
where key = 'revenue_identity_variance_rate' and version = 1;
