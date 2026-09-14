insert into public.intelligence_taxonomy (taxonomy_type, taxonomy_key, display_name, description, is_active, metadata)
values
('audience','solo_artist','Solo Artist','Independent tattoo artist operating alone',true,'{"legacy_brand":"INKCARE","migration_source":"cpnkxfgxdoswyigjzvyh"}'::jsonb),
('audience','studio_manager','Studio Manager','Operational manager of a tattoo studio',true,'{"legacy_brand":"INKCARE","migration_source":"cpnkxfgxdoswyigjzvyh"}'::jsonb),
('audience','studio_owner','Studio Owner','Owner or director of a tattoo studio',true,'{"legacy_brand":"INKCARE","migration_source":"cpnkxfgxdoswyigjzvyh"}'::jsonb),
('business_function','acquisition','Acquisition','Demand generation and lead capture',true,'{"legacy_brand":"INKCARE","migration_source":"cpnkxfgxdoswyigjzvyh"}'::jsonb),
('business_function','booking_and_deposits','Booking and Deposits','Booking control, deposits and scheduling',true,'{"legacy_brand":"INKCARE","migration_source":"cpnkxfgxdoswyigjzvyh"}'::jsonb),
('business_function','cancellations_and_no_shows','Cancellations and No-Shows','Prevention and recovery of lost appointments',true,'{"legacy_brand":"INKCARE","migration_source":"cpnkxfgxdoswyigjzvyh"}'::jsonb),
('business_function','capacity_utilisation','Capacity Utilisation','Productive use of artist and chair capacity',true,'{"legacy_brand":"INKCARE","migration_source":"cpnkxfgxdoswyigjzvyh"}'::jsonb),
('business_function','client_experience','Client Experience','Experience from enquiry through post-session care',true,'{"legacy_brand":"INKCARE","migration_source":"cpnkxfgxdoswyigjzvyh"}'::jsonb),
('business_function','data_reporting_and_automation','Data Reporting and Automation','Measurement, dashboards and automated operations',true,'{"legacy_brand":"INKCARE","migration_source":"cpnkxfgxdoswyigjzvyh"}'::jsonb),
('business_function','enquiry_conversion','Enquiry Conversion','Conversion from enquiry to consultation or booking',true,'{"legacy_brand":"INKCARE","migration_source":"cpnkxfgxdoswyigjzvyh"}'::jsonb),
('business_function','pricing_and_margin','Pricing and Margin','Pricing, average booking value and profitability',true,'{"legacy_brand":"INKCARE","migration_source":"cpnkxfgxdoswyigjzvyh"}'::jsonb),
('business_function','rebooking_and_retention','Rebooking and Retention','Repeat bookings, lifecycle and client value',true,'{"legacy_brand":"INKCARE","migration_source":"cpnkxfgxdoswyigjzvyh"}'::jsonb),
('business_function','retail_and_aftercare','Retail and Aftercare','Retail sales and tattoo aftercare systems',true,'{"legacy_brand":"INKCARE","migration_source":"cpnkxfgxdoswyigjzvyh"}'::jsonb),
('framework_stage','audit','Audit','Establish the current state and collect evidence',true,'{"legacy_brand":"INKCARE","migration_source":"cpnkxfgxdoswyigjzvyh"}'::jsonb),
('framework_stage','deploy','Deploy','Implement the system, assets and workflows',true,'{"legacy_brand":"INKCARE","migration_source":"cpnkxfgxdoswyigjzvyh"}'::jsonb),
('framework_stage','design','Design','Specify the target system and implementation plan',true,'{"legacy_brand":"INKCARE","migration_source":"cpnkxfgxdoswyigjzvyh"}'::jsonb),
('framework_stage','diagnose','Diagnose','Identify root causes, constraints and opportunity',true,'{"legacy_brand":"INKCARE","migration_source":"cpnkxfgxdoswyigjzvyh"}'::jsonb),
('framework_stage','measure','Measure','Track leading and lagging performance indicators',true,'{"legacy_brand":"INKCARE","migration_source":"cpnkxfgxdoswyigjzvyh"}'::jsonb),
('framework_stage','optimise','Optimise','Improve the deployed system using measured evidence',true,'{"legacy_brand":"INKCARE","migration_source":"cpnkxfgxdoswyigjzvyh"}'::jsonb),
('framework_stage','scale','Scale','Standardise, automate, delegate or productise the result',true,'{"legacy_brand":"INKCARE","migration_source":"cpnkxfgxdoswyigjzvyh"}'::jsonb)
on conflict (taxonomy_type, taxonomy_key) do update set
  display_name = excluded.display_name,
  description = excluded.description,
  is_active = excluded.is_active,
  metadata = public.intelligence_taxonomy.metadata || excluded.metadata,
  updated_at = now();

insert into public.intelligence_source_registry (source_key, source_name, source_type, source_url, domain, reliability_score, geographic_relevance, approved, notes, metadata)
values
('google_trends_uk_rss','Google Trends UK Trending RSS','search_trend_signal','https://trends.google.com/trending/rss?geo=GB','trends.google.com',85,'United Kingdom',true,'Permitted for topic discovery and timing signals; not proof of commercial demand on its own.','{"legacy_brand":"INKCARE","migration_source":"cpnkxfgxdoswyigjzvyh"}'::jsonb),
('gov_uk','GOV.UK','government_primary','https://www.gov.uk/','gov.uk',95,'United Kingdom',true,'Use for regulatory and government verification. Retrieve the specific primary page and date.','{"legacy_brand":"INKCARE","migration_source":"cpnkxfgxdoswyigjzvyh"}'::jsonb),
('hubspot_voice_of_customer','HubSpot CRM Voice of Customer','internal_crm','hubspot://connected','hubspot.com',90,'INKSIGHTS market',true,'Permitted for objection mining and repeated audience questions using authorised fields only.','{"legacy_brand":"INKCARE","migration_source":"cpnkxfgxdoswyigjzvyh"}'::jsonb),
('inksights_legacy_product_library','INKSIGHTS Legacy Product Library','internal_drive','https://drive.google.com/drive/folders/1t0oCc-uTBL5oZfjG-Fl8RR-J5v8ZwUXM','drive.google.com',90,'UK / Global',true,'Primary authorised legacy internal knowledge base. Generated assets are not independent proof of external claims.','{"legacy_brand":"INKCARE","legacy_name":"INKCARE Product Library","migration_source":"cpnkxfgxdoswyigjzvyh"}'::jsonb)
on conflict (source_key) do update set
  source_name = excluded.source_name,
  source_type = excluded.source_type,
  source_url = excluded.source_url,
  domain = excluded.domain,
  reliability_score = excluded.reliability_score,
  geographic_relevance = excluded.geographic_relevance,
  approved = excluded.approved,
  notes = excluded.notes,
  metadata = public.intelligence_source_registry.metadata || excluded.metadata,
  updated_at = now();

insert into public.intelligence_diagnostic_templates (
  diagnostic_key, version, name, description, growth_levers, universal_dimensions,
  scoring_model, opportunity_formula, mapped_playbook_keys, status, provenance
)
values (
  'studio_appointment_leakage',
  1,
  'Studio Appointment Leakage Diagnosis',
  'Diagnoses appointment leakage across cancellations, no-shows, deposit coverage, reminder maturity, waitlist recovery and measurement before recommending atomic INKSIGHTS interventions.',
  '["customers","frequency"]'::jsonb,
  '["Baseline data quality","Deposit coverage","Confirmation and reminder maturity","Policy clarity and consistency","Cancellation-reason visibility","No-show prevention","Waitlist and refill capability","Recovery communication","Staff ownership and compliance","Measurement and optimisation"]'::jsonb,
  '{"bands":{"critical":[85,100],"material":[50,69],"moderate":[25,49],"controlled":[0,24],"high_priority":[70,84]},"gap_weight":0.35,"ease_weight":0.10,"impact_weight":0.30,"frequency_weight":0.15,"confidence_weight":0.10}'::jsonb,
  '{"scenarios":{"upper_capture":[0.55,0.70],"expected_capture":[0.35,0.50],"conservative_capture":[0.20,0.30]},"recoverable":"measured_leakage * capture_rate * readiness_adjustment","base_leakage":"late_cancellation_value + no_show_value + unfilled_cancellation_value"}'::jsonb,
  '["cancellation_backfill"]'::jsonb,
  'active',
  '{"legacy_brand":"INKCARE","legacy_version":"0.1","legacy_asset":"PB-001","migration_source":"cpnkxfgxdoswyigjzvyh","transformation":"composite diagnostic preserved; interventions mapped to atomic INKSIGHTS playbooks","unmapped_capabilities":["deposit_coverage","appointment_reminders","no_show_prevention","waitlist_recovery","policy_compliance"]}'::jsonb
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
  provenance = public.intelligence_diagnostic_templates.provenance || excluded.provenance,
  updated_at = now();

with template as (
  select id from public.intelligence_diagnostic_templates where diagnostic_key='studio_appointment_leakage' and version=1
), questions(sort_order, category, question, question_type, calculation_rule, scoring_rule, recommendation_rule, evidence_requirement) as (
  values
  (1,'Baseline data quality','How many appointments were booked in the last complete month?','integer','{}'::jsonb,'{"normalise_to":100}'::jsonb,'{"legacy_module":"Module 1"}'::jsonb,'Booking-system export or appointment ledger'),
  (2,'Baseline data quality','How many appointments were completed in the same period?','integer','{}'::jsonb,'{"normalise_to":100}'::jsonb,'{"legacy_module":"Module 1"}'::jsonb,'Booking-system export or appointment ledger'),
  (3,'Cancellation-reason visibility','How many appointments were cancelled, split by notice period?','structured_numeric','{}'::jsonb,'{"normalise_to":100}'::jsonb,'{"legacy_module":"Module 2"}'::jsonb,'Cancellation log with timestamps'),
  (4,'No-show prevention','How many no-shows occurred in the same period?','integer','{}'::jsonb,'{"normalise_to":100}'::jsonb,'{"legacy_module":"Module 2"}'::jsonb,'Booking-system event history'),
  (5,'Financial impact','What was the average booked appointment value?','currency','{}'::jsonb,'{"normalise_to":100}'::jsonb,'{"legacy_module":"Opportunity Calculator"}'::jsonb,'Revenue or booking ledger'),
  (6,'Deposit coverage','What percentage of bookings had a deposit attached?','percentage','{}'::jsonb,'{"normalise_to":100}'::jsonb,'{"legacy_module":"Module 3"}'::jsonb,'Payment and booking records'),
  (7,'Deposit coverage','What was the average deposit value?','currency','{}'::jsonb,'{"normalise_to":100}'::jsonb,'{"legacy_module":"Module 3"}'::jsonb,'Payment records'),
  (8,'Waitlist and refill capability','How many cancelled appointments were successfully refilled?','integer','{}'::jsonb,'{"normalise_to":100}'::jsonb,'{"legacy_module":"Module 5","mapped_playbook_key":"cancellation_backfill"}'::jsonb,'Waitlist and calendar evidence'),
  (9,'Confirmation and reminder maturity','How many confirmation or reminder contacts are sent before an appointment?','integer','{}'::jsonb,'{"normalise_to":100}'::jsonb,'{"legacy_module":"Module 4"}'::jsonb,'Current workflow evidence'),
  (10,'Policy clarity and consistency','Is the cancellation and deposit policy documented and applied consistently?','maturity_scale','{}'::jsonb,'{"normalise_to":100}'::jsonb,'{"legacy_module":"Module 3"}'::jsonb,'Published policy and staff process'),
  (11,'Staff ownership and compliance','Is a named role responsible for monitoring and recovering vacant slots?','yes_no','{}'::jsonb,'{"normalise_to":100}'::jsonb,'{"legacy_module":"Module 6"}'::jsonb,'Role or SOP evidence'),
  (12,'Measurement and optimisation','Are cancellation, no-show, refill and recovered-value KPIs reviewed weekly?','maturity_scale','{}'::jsonb,'{"normalise_to":100}'::jsonb,'{"legacy_module":"Module 7"}'::jsonb,'Dashboard or meeting record')
)
insert into public.intelligence_diagnostic_questions (
  diagnostic_template_id, sort_order, category, question, question_type,
  calculation_rule, scoring_rule, recommendation_rule, evidence_requirement, required, metadata
)
select template.id, q.sort_order, q.category, q.question, q.question_type,
       q.calculation_rule, q.scoring_rule, q.recommendation_rule, q.evidence_requirement, true,
       '{"legacy_brand":"INKCARE","legacy_diagnostic":"Studio Appointment Leakage Diagnosis","migration_source":"cpnkxfgxdoswyigjzvyh"}'::jsonb
from template cross join questions q
on conflict (diagnostic_template_id, sort_order) do update set
  category = excluded.category,
  question = excluded.question,
  question_type = excluded.question_type,
  calculation_rule = excluded.calculation_rule,
  scoring_rule = excluded.scoring_rule,
  recommendation_rule = excluded.recommendation_rule,
  evidence_requirement = excluded.evidence_requirement,
  required = excluded.required,
  metadata = public.intelligence_diagnostic_questions.metadata || excluded.metadata,
  updated_at = now();