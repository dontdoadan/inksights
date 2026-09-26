-- Reconciliation migration.
-- Production commercial configuration was first written through governed operator tooling on 2026-09-26.
-- This idempotent migration brings repository migration history into line with that live configuration.
-- No destructive schema changes are performed.

begin;

insert into public.intelligence_playbooks
(key, version, name, lever, category, hypothesis, trigger_description, required_metric_keys, action_steps, primary_metric_key, guardrail_metric_keys, expected_time_to_signal_days, effort_score, risk_score, status)
values
(
  'artist_utilisation_balancing', 1, 'Artist Utilisation Balancing', 'customers', 'capacity_recovery',
  'Balancing qualified demand and sellable availability across artists can improve realised utilisation without increasing total lead volume.',
  'Measured artist-level capacity is uneven and at least one artist has recoverable unused sellable capacity.',
  '["capacity_units","booked_capacity_units","capacity_utilisation_rate","qualified_leads","transactions","average_transaction_value"]'::jsonb,
  '["Measure available and booked capacity by artist","Compare enquiry routing and booking conversion by artist","Identify mismatches between demand, style fit and availability","Test routing, waitlist or merchandising changes","Measure utilisation and realised revenue per available capacity unit"]'::jsonb,
  'capacity_utilisation_rate',
  '["average_transaction_value","lead_to_customer_conversion_rate"]'::jsonb,
  45, 4, 2, 'active'
)
on conflict (key, version) do update set
  name = excluded.name,
  lever = excluded.lever,
  category = excluded.category,
  hypothesis = excluded.hypothesis,
  trigger_description = excluded.trigger_description,
  required_metric_keys = excluded.required_metric_keys,
  action_steps = excluded.action_steps,
  primary_metric_key = excluded.primary_metric_key,
  guardrail_metric_keys = excluded.guardrail_metric_keys,
  expected_time_to_signal_days = excluded.expected_time_to_signal_days,
  effort_score = excluded.effort_score,
  risk_score = excluded.risk_score,
  status = excluded.status,
  updated_at = now();

insert into public.intelligence_playbooks
(key, version, name, lever, category, hypothesis, trigger_description, required_metric_keys, action_steps, primary_metric_key, guardrail_metric_keys, expected_time_to_signal_days, effort_score, risk_score, status)
values
(
  'enquiry_to_deposit_conversion', 1, 'Enquiry-to-Deposit Conversion', 'customers', 'conversion',
  'Reducing friction between qualified enquiry and paid commitment can increase booked work without increasing enquiry volume.',
  'Qualified enquiries materially exceed paid bookings or deposit-backed commitments and the conversion path is measurable.',
  '["leads","qualified_leads","lead_to_customer_conversion_rate","average_transaction_value"]'::jsonb,
  '["Map enquiry to consultation/quote/deposit steps","Measure drop-off and response delays","Remove avoidable friction and clarify next action","Test structured follow-up or deposit request","Measure qualified-enquiry to paid-booking conversion"]'::jsonb,
  'lead_to_customer_conversion_rate',
  '["average_transaction_value","customer_acquisition_cost"]'::jsonb,
  30, 3, 2, 'active'
)
on conflict (key, version) do update set
  name = excluded.name,
  lever = excluded.lever,
  category = excluded.category,
  hypothesis = excluded.hypothesis,
  trigger_description = excluded.trigger_description,
  required_metric_keys = excluded.required_metric_keys,
  action_steps = excluded.action_steps,
  primary_metric_key = excluded.primary_metric_key,
  guardrail_metric_keys = excluded.guardrail_metric_keys,
  expected_time_to_signal_days = excluded.expected_time_to_signal_days,
  effort_score = excluded.effort_score,
  risk_score = excluded.risk_score,
  status = excluded.status,
  updated_at = now();

with template as (
  insert into public.intelligence_diagnostic_templates
  (diagnostic_key, version, name, description, growth_levers, universal_dimensions, scoring_model, opportunity_formula, mapped_playbook_keys, status, provenance)
  values (
    'studio_commercial_health',
    1,
    'Studio Commercial Health Diagnosis',
    'Evidence-led diagnostic for identifying the primary commercial constraint across demand, enquiry conversion, artist capacity, cancellation leakage, retention, pricing and management visibility.',
    '["customers","frequency","average_transaction_value"]'::jsonb,
    '["Demand and visibility","Enquiry and response","Qualification and deposit conversion","Artist capacity and utilisation","Cancellation and no-show leakage","Retention and reactivation","Pricing and transaction value","Measurement and ownership"]'::jsonb,
    '{"method":"constraint_first","weights":{"demand_visibility":0.15,"enquiry_conversion":0.20,"capacity_utilisation":0.20,"cancellation_leakage":0.15,"retention":0.15,"pricing_value":0.05,"measurement_quality":0.10},"evidence_quality_required":true,"rule":"Do not add overlapping modelled opportunities; rank constraints by evidence-backed value at stake, confidence and actionability."}'::jsonb,
    '{"capacity":"capacity_headroom_units * explicit_value_per_capacity_unit","conversion":"qualified_leads * conversion_gap * average_transaction_value","cancellation":"recoverable_leakage_value","retention":"eligible_customers * repeat_rate_gap * average_repeat_value","rule":"Return ranges when assumptions are modelled; do not present modelled opportunity as observed loss."}'::jsonb,
    '["artist_utilisation_balancing","enquiry_to_deposit_conversion","cancellation_backfill","no_show_prevention","local_visibility_capture","lead_response_speed","lead_followup_sequence","client_recall","dormant_customer_reactivation","price_floor_review","scope_based_pricing"]'::jsonb,
    'active',
    '{"source":"tattoo_studio_research_2026-09-26","evidence_standard":["verified","observed","calculated","modelled","hypothesis"],"pre_customer":true}'::jsonb
  )
  on conflict (diagnostic_key, version) do update set
    name = excluded.name,
    description = excluded.description,
    growth_levers = excluded.growth_levers,
    universal_dimensions = excluded.universal_dimensions,
    scoring_model = excluded.scoring_model,
    opportunity_formula = excluded.opportunity_formula,
    mapped_playbook_keys = excluded.mapped_playbook_keys,
    status = excluded.status,
    provenance = excluded.provenance,
    updated_at = now()
  returning id
)
insert into public.intelligence_diagnostic_questions
(diagnostic_template_id, sort_order, category, question, question_type, calculation_rule, scoring_rule, recommendation_rule, evidence_requirement, required, metadata)
select template.id, q.sort_order, q.category, q.question, q.question_type, q.calculation_rule, q.scoring_rule, q.recommendation_rule, q.evidence_requirement, q.required, q.metadata
from template
cross join (
values
(1,'Demand and visibility','How many new enquiries entered the studio in the last complete month?','integer','{}'::jsonb,'{"dimension":"demand_visibility"}'::jsonb,'{"use_for":"demand_baseline"}'::jsonb,'CRM, inbox, booking-form or enquiry ledger',true,'{"metric":"leads"}'::jsonb),
(2,'Enquiry and response','What is the typical first-response time to a new enquiry?','duration','{}'::jsonb,'{"dimension":"enquiry_conversion"}'::jsonb,'{"mapped_playbook_key":"lead_response_speed"}'::jsonb,'Timestamped enquiry and first-response evidence',true,'{}'::jsonb),
(3,'Qualification and deposit conversion','How many enquiries were genuinely qualified for the studio in the same period?','integer','{}'::jsonb,'{"dimension":"enquiry_conversion"}'::jsonb,'{"use_for":"qualification_baseline"}'::jsonb,'CRM or documented qualification rule',true,'{"metric":"qualified_leads"}'::jsonb),
(4,'Qualification and deposit conversion','How many qualified enquiries became deposit-backed or otherwise paid bookings?','integer','{}'::jsonb,'{"dimension":"enquiry_conversion"}'::jsonb,'{"mapped_playbook_key":"enquiry_to_deposit_conversion"}'::jsonb,'Booking plus payment/deposit records',true,'{"metric":"lead_to_customer_conversion_rate"}'::jsonb),
(5,'Artist capacity and utilisation','How many sellable artist hours or equivalent capacity units were available in the same period?','numeric','{}'::jsonb,'{"dimension":"capacity_utilisation"}'::jsonb,'{"use_for":"capacity_baseline"}'::jsonb,'Artist rota/calendar with declared sellable hours or equivalent units',true,'{"metric":"capacity_units"}'::jsonb),
(6,'Artist capacity and utilisation','How many of those sellable capacity units were booked?','numeric','{}'::jsonb,'{"dimension":"capacity_utilisation"}'::jsonb,'{"mapped_playbook_key":"artist_utilisation_balancing"}'::jsonb,'Artist calendar/booking records',true,'{"metric":"booked_capacity_units"}'::jsonb),
(7,'Cancellation and no-show leakage','How many booked capacity units were lost to late cancellation or no-show?','numeric','{}'::jsonb,'{"dimension":"cancellation_leakage"}'::jsonb,'{"mapped_playbook_key":"cancellation_backfill"}'::jsonb,'Booking event history with cancellation/no-show timestamps',true,'{"metrics":["cancellation_rate","no_show_rate"]}'::jsonb),
(8,'Cancellation and no-show leakage','How much of the released late-cancellation capacity was successfully refilled?','numeric','{}'::jsonb,'{"dimension":"cancellation_leakage"}'::jsonb,'{"mapped_playbook_key":"cancellation_backfill"}'::jsonb,'Waitlist/calendar evidence',true,'{"metric":"recoverable_leakage_value"}'::jsonb),
(9,'Pricing and transaction value','What realised revenue was generated in the measurement period?','currency','{}'::jsonb,'{"dimension":"pricing_value"}'::jsonb,'{"use_for":"revenue_baseline"}'::jsonb,'Payment/transaction ledger',true,'{"metric":"revenue"}'::jsonb),
(10,'Pricing and transaction value','How many completed revenue-generating transactions occurred?','integer','{}'::jsonb,'{"dimension":"pricing_value"}'::jsonb,'{"use_for":"average_transaction_value"}'::jsonb,'Transaction ledger',true,'{"metric":"transactions"}'::jsonb),
(11,'Retention and reactivation','How many unique paying customers were served in the period?','integer','{}'::jsonb,'{"dimension":"retention"}'::jsonb,'{"use_for":"retention_baseline"}'::jsonb,'Transaction/client ledger',true,'{"metric":"unique_customers"}'::jsonb),
(12,'Retention and reactivation','How many customers met the agreed repeat-customer rule in the measurement window?','integer','{}'::jsonb,'{"dimension":"retention"}'::jsonb,'{"mapped_playbook_key":"client_recall"}'::jsonb,'Client transaction history with defined repeat window',true,'{"metric":"repeat_customers"}'::jsonb),
(13,'Demand and visibility','Which channels produced the enquiries that became paid bookings?','structured_text','{}'::jsonb,'{"dimension":"demand_visibility"}'::jsonb,'{"mapped_playbook_key":"local_visibility_capture"}'::jsonb,'Attribution evidence where available; otherwise label as unknown',false,'{"rule":"unknown_is_not_zero"}'::jsonb),
(14,'Artist capacity and utilisation','Is utilisation measured separately for each artist rather than only for the studio as a whole?','yes_no','{}'::jsonb,'{"dimension":"capacity_utilisation"}'::jsonb,'{"mapped_playbook_key":"artist_utilisation_balancing"}'::jsonb,'Artist-level capacity/booking report or dashboard',true,'{}'::jsonb),
(15,'Measurement and ownership','Are enquiry conversion, capacity utilisation, cancellations/no-shows and repeat-client KPIs reviewed on a defined cadence?','maturity_scale','{}'::jsonb,'{"dimension":"measurement_quality"}'::jsonb,'{"use_for":"management_visibility"}'::jsonb,'Dashboard, scorecard or recurring review record',true,'{}'::jsonb),
(16,'Measurement and ownership','Which single commercial constraint does the owner currently believe is limiting growth, and what evidence supports that belief?','structured_text','{}'::jsonb,'{"dimension":"measurement_quality"}'::jsonb,'{"use_for":"hypothesis_comparison"}'::jsonb,'Owner hypothesis plus supporting evidence or explicit absence of evidence',true,'{"classification":"hypothesis_until_verified"}'::jsonb)
) as q(sort_order, category, question, question_type, calculation_rule, scoring_rule, recommendation_rule, evidence_requirement, required, metadata)
on conflict (diagnostic_template_id, sort_order) do update set
  category = excluded.category,
  question = excluded.question,
  question_type = excluded.question_type,
  calculation_rule = excluded.calculation_rule,
  scoring_rule = excluded.scoring_rule,
  recommendation_rule = excluded.recommendation_rule,
  evidence_requirement = excluded.evidence_requirement,
  required = excluded.required,
  metadata = excluded.metadata,
  updated_at = now();

insert into public.intelligence_calculation_versions
(key, name, description, config, calibration_status, status)
values
(
  'revenue-leakage-calculator-v1.0.0',
  'Revenue Leakage Calculator V1.0.0',
  'Pre-customer diagnostic calculator that separates capacity, conversion, cancellation and retention opportunity without summing overlapping scenarios.',
  '{
    "evidence_standard":["verified","observed","calculated","modelled","hypothesis"],
    "inputs":{
      "capacity":["capacity_units","booked_capacity_units","value_per_capacity_unit"],
      "conversion":["qualified_leads","current_conversion_rate","target_conversion_rate","average_transaction_value"],
      "cancellation":["late_cancelled_capacity_units","recovered_cancelled_capacity_units","value_per_capacity_unit","retained_deposit_value"],
      "retention":["eligible_previous_customers","current_repeat_rate","target_repeat_rate","average_repeat_value"]
    },
    "formulas":{
      "unused_capacity_value":"max(0, capacity_units - booked_capacity_units) * value_per_capacity_unit",
      "conversion_opportunity":"qualified_leads * max(0, target_conversion_rate - current_conversion_rate) * average_transaction_value",
      "cancellation_unrecovered_value":"max(0, (late_cancelled_capacity_units - recovered_cancelled_capacity_units) * value_per_capacity_unit - retained_deposit_value)",
      "retention_opportunity":"eligible_previous_customers * max(0, target_repeat_rate - current_repeat_rate) * average_repeat_value"
    },
    "portfolio_rule":"Do not sum isolated opportunities unless event populations are proven mutually exclusive. Present separate levers and rank the strongest evidence-backed constraint.",
    "classification_rule":"If any target, benchmark or value-per-unit input is assumed rather than observed, classify the related output as MODELLED.",
    "validation":["all counts and values >= 0","rates between 0 and 1","booked_capacity_units <= capacity_units when units share the same period","recovered_cancelled_capacity_units <= late_cancelled_capacity_units","target rates must be sourced or explicitly labelled as scenario assumptions"],
    "public_copy_rule":"Use value-at-stake language, not guaranteed recovery or proven loss unless event-level evidence exists.",
    "cta_handoff":{"primary":"Studio Growth Check","paid":"£395 Studio Intelligence Audit","rule":"Use calculator output to expose a question worth diagnosing; do not present the calculator as a substitute for the audit."}
  }'::jsonb,
  'pre_calibration',
  'active'
)
on conflict (key) do update set
  name = excluded.name,
  description = excluded.description,
  config = excluded.config,
  calibration_status = excluded.calibration_status,
  status = excluded.status;

insert into public.intelligence_calculation_versions
(key, name, description, config, calibration_status, status)
values
(
  'cancellation-cost-calculator-v1.0.0',
  'Cancellation Cost Calculator V1.0.0',
  'Pre-customer calculator for estimating the economic value of late-cancelled tattoo capacity after refill and retained-deposit offsets.',
  '{
    "evidence_standard":["verified","observed","calculated","modelled","hypothesis"],
    "inputs":["late_cancelled_capacity_units","recovered_cancelled_capacity_units","value_per_capacity_unit","retained_deposit_value","measurement_period"],
    "formulas":{
      "gross_cancelled_capacity_value":"late_cancelled_capacity_units * value_per_capacity_unit",
      "recovered_capacity_value":"recovered_cancelled_capacity_units * value_per_capacity_unit",
      "unrecovered_capacity_value":"max(0, (late_cancelled_capacity_units - recovered_cancelled_capacity_units) * value_per_capacity_unit - retained_deposit_value)",
      "recovery_rate":"if late_cancelled_capacity_units > 0 then recovered_cancelled_capacity_units / late_cancelled_capacity_units else null"
    },
    "classification_rule":"Observed cancelled/recovered units with modelled value-per-unit produce MODELLED value outputs. Event-level booking and payment evidence can support CALCULATED unrecovered value.",
    "validation":["all counts and values >= 0","recovered_cancelled_capacity_units <= late_cancelled_capacity_units","retained_deposit_value cannot exceed gross cancelled capacity value for the same events without a warning"],
    "public_copy_rule":"Describe as estimated value at stake unless linked to event-level booking/payment evidence.",
    "cta_handoff":{"primary":"Studio Growth Check","paid":"£395 Studio Intelligence Audit","rule":"Use calculator output to expose a question worth diagnosing; do not present the calculator as a substitute for the audit."}
  }'::jsonb,
  'pre_calibration',
  'active'
)
on conflict (key) do update set
  name = excluded.name,
  description = excluded.description,
  config = excluded.config,
  calibration_status = excluded.calibration_status,
  status = excluded.status;

commit;
