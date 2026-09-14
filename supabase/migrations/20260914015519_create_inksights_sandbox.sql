create schema if not exists sandbox;
revoke all on schema sandbox from public, anon, authenticated;
grant usage on schema sandbox to service_role;

create table if not exists sandbox.business_fixtures (
  fixture_key text primary key, name text not null, description text, inputs jsonb not null, expected jsonb not null,
  active boolean not null default true, created_at timestamptz not null default now(), updated_at timestamptz not null default now()
);
create table if not exists sandbox.validation_runs (
  id uuid primary key default gen_random_uuid(), engine_version text not null default 'three-lever-v1', status text not null default 'running' check (status in ('running','success','failed')),
  fixture_count integer not null default 0, passed_checks integer not null default 0, failed_checks integer not null default 0,
  public_counts_before jsonb not null default '{}'::jsonb, public_counts_after jsonb not null default '{}'::jsonb,
  started_at timestamptz not null default now(), completed_at timestamptz, details jsonb not null default '{}'::jsonb
);
create table if not exists sandbox.validation_results (
  id bigint generated always as identity primary key, run_id uuid not null references sandbox.validation_runs(id) on delete cascade,
  fixture_key text, check_name text not null, passed boolean not null, expected jsonb, actual jsonb, message text, created_at timestamptz not null default now()
);
create table if not exists sandbox.simulations (
  fixture_key text primary key references sandbox.business_fixtures(fixture_key) on delete cascade,
  scenario jsonb not null, diagnostic jsonb not null, opportunity jsonb not null, recommendation jsonb not null,
  decision jsonb not null, intervention jsonb not null, outcome jsonb not null, attribution jsonb not null, learning jsonb not null,
  executed_at timestamptz not null default now()
);
create index if not exists idx_sandbox_validation_results_run on sandbox.validation_results(run_id, passed);
revoke all on all tables in schema sandbox from public, anon, authenticated;
revoke all on all sequences in schema sandbox from public, anon, authenticated;
grant select, insert, update, delete on all tables in schema sandbox to service_role;
grant usage, select on all sequences in schema sandbox to service_role;
alter default privileges in schema sandbox revoke all on tables from public, anon, authenticated;
alter default privileges in schema sandbox revoke all on sequences from public, anon, authenticated;

create or replace function sandbox.calculate_growth_scenario(p_input jsonb) returns jsonb language plpgsql stable set search_path = sandbox, public as $$
declare
  v_customers numeric; v_customer_source text; v_leads numeric := nullif(p_input->>'annual_leads','')::numeric;
  v_conversion numeric := coalesce(nullif(p_input->>'lead_to_customer_conversion_rate','')::numeric, 0);
  v_frequency numeric := coalesce(nullif(p_input->>'purchase_frequency','')::numeric, 0); v_atv numeric := coalesce(nullif(p_input->>'average_transaction_value','')::numeric, 0);
  v_capacity numeric := nullif(p_input->>'annual_capacity_transactions','')::numeric; v_cancel numeric := coalesce(nullif(p_input->>'cancellation_rate','')::numeric, 0);
  v_no_show numeric := coalesce(nullif(p_input->>'no_show_rate','')::numeric, 0); v_margin numeric := coalesce(nullif(p_input->>'gross_margin_rate','')::numeric, 1);
  v_customer_growth numeric := coalesce(nullif(p_input->>'customer_growth_pct','')::numeric, 0); v_frequency_growth numeric := coalesce(nullif(p_input->>'frequency_growth_pct','')::numeric, 0);
  v_atv_growth numeric := coalesce(nullif(p_input->>'atv_growth_pct','')::numeric, 0); v_baseline_transactions numeric; v_baseline_completed numeric;
  v_baseline_capacity_transactions numeric; v_baseline_revenue numeric; v_baseline_gp numeric; v_model_customers numeric; v_model_frequency numeric; v_model_atv numeric;
  v_model_transactions numeric; v_model_completed numeric; v_model_capacity_transactions numeric; v_model_revenue numeric; v_model_gp numeric;
  v_customer_only_revenue numeric; v_frequency_only_revenue numeric; v_atv_only_revenue numeric; v_customer_uplift numeric; v_frequency_uplift numeric; v_atv_uplift numeric;
  v_primary_lever text; v_constraints jsonb := '[]'::jsonb;
begin
  if p_input ? 'customers' then v_customers := nullif(p_input->>'customers','')::numeric; v_customer_source := 'observed';
  elsif v_leads is not null and p_input ? 'lead_to_customer_conversion_rate' then v_customers := v_leads * v_conversion; v_customer_source := 'modelled_from_leads';
  else raise exception 'customers or annual_leads + lead_to_customer_conversion_rate is required'; end if;
  if v_customers < 0 or v_frequency < 0 or v_atv < 0 or coalesce(v_capacity,0) < 0 or v_customer_growth < 0 or v_frequency_growth < 0 or v_atv_growth < 0 then raise exception 'growth inputs must be non-negative'; end if;
  if v_conversion not between 0 and 1 or v_cancel not between 0 and 1 or v_no_show not between 0 and 1 or v_margin not between 0 and 1 then raise exception 'rates must be between 0 and 1'; end if;
  v_baseline_transactions := v_customers * v_frequency; v_baseline_completed := v_baseline_transactions * (1-v_cancel) * (1-v_no_show);
  v_baseline_capacity_transactions := case when v_capacity is null then v_baseline_completed else least(v_baseline_completed,v_capacity) end;
  v_baseline_revenue := v_baseline_capacity_transactions * v_atv; v_baseline_gp := v_baseline_revenue * v_margin;
  v_model_customers := v_customers * (1+v_customer_growth); v_model_frequency := v_frequency * (1+v_frequency_growth); v_model_atv := v_atv * (1+v_atv_growth);
  v_model_transactions := v_model_customers * v_model_frequency; v_model_completed := v_model_transactions * (1-v_cancel) * (1-v_no_show);
  v_model_capacity_transactions := case when v_capacity is null then v_model_completed else least(v_model_completed,v_capacity) end;
  v_model_revenue := v_model_capacity_transactions * v_model_atv; v_model_gp := v_model_revenue * v_margin;
  v_customer_only_revenue := (case when v_capacity is null then v_customers*(1+v_customer_growth)*v_frequency*(1-v_cancel)*(1-v_no_show) else least(v_customers*(1+v_customer_growth)*v_frequency*(1-v_cancel)*(1-v_no_show),v_capacity) end)*v_atv;
  v_frequency_only_revenue := (case when v_capacity is null then v_customers*v_frequency*(1+v_frequency_growth)*(1-v_cancel)*(1-v_no_show) else least(v_customers*v_frequency*(1+v_frequency_growth)*(1-v_cancel)*(1-v_no_show),v_capacity) end)*v_atv;
  v_atv_only_revenue := v_baseline_capacity_transactions*v_atv*(1+v_atv_growth);
  v_customer_uplift := greatest(0,v_customer_only_revenue-v_baseline_revenue); v_frequency_uplift := greatest(0,v_frequency_only_revenue-v_baseline_revenue); v_atv_uplift := greatest(0,v_atv_only_revenue-v_baseline_revenue);
  if greatest(v_customer_uplift,v_frequency_uplift,v_atv_uplift)<=0 then v_primary_lever:=null;
  elsif v_customer_uplift>=v_frequency_uplift and v_customer_uplift>=v_atv_uplift then v_primary_lever:='customers';
  elsif v_frequency_uplift>=v_atv_uplift then v_primary_lever:='frequency'; else v_primary_lever:='average_transaction_value'; end if;
  if v_capacity is not null and (v_baseline_completed>v_capacity or v_model_completed>v_capacity) then v_constraints:=v_constraints||jsonb_build_array('capacity'); end if;
  return jsonb_build_object('customer_source',v_customer_source,
    'baseline',jsonb_build_object('customers',v_customers,'transactions',v_baseline_transactions,'completed_transactions',v_baseline_completed,'capacity_constrained_transactions',v_baseline_capacity_transactions,'purchase_frequency',v_frequency,'average_transaction_value',v_atv,'revenue',v_baseline_revenue,'gross_profit',v_baseline_gp),
    'modelled',jsonb_build_object('customers',v_model_customers,'transactions',v_model_transactions,'completed_transactions',v_model_completed,'capacity_constrained_transactions',v_model_capacity_transactions,'purchase_frequency',v_model_frequency,'average_transaction_value',v_model_atv,'revenue',v_model_revenue,'gross_profit',v_model_gp),
    'lever_revenue_uplift',jsonb_build_object('customers',v_customer_uplift,'frequency',v_frequency_uplift,'average_transaction_value',v_atv_uplift),
    'combined_revenue_uplift',greatest(0,v_model_revenue-v_baseline_revenue),'combined_gross_profit_uplift',greatest(0,v_model_gp-v_baseline_gp),'primary_lever',v_primary_lever,'constraints',v_constraints);
end; $$;

create or replace function sandbox.diagnose_three_levers(p_input jsonb) returns jsonb language plpgsql stable set search_path = sandbox, public as $$
declare v_scenario jsonb:=sandbox.calculate_growth_scenario(p_input); v_constraints jsonb:=coalesce(v_scenario->'constraints','[]'::jsonb);
  v_cancel numeric:=coalesce(nullif(p_input->>'cancellation_rate','')::numeric,0); v_no_show numeric:=coalesce(nullif(p_input->>'no_show_rate','')::numeric,0); v_margin numeric:=coalesce(nullif(p_input->>'gross_margin_rate','')::numeric,1);
begin
  if v_cancel>=0.15 then v_constraints:=v_constraints||jsonb_build_array('high_cancellations'); end if; if v_no_show>=0.10 then v_constraints:=v_constraints||jsonb_build_array('high_no_shows'); end if; if v_margin<0.40 then v_constraints:=v_constraints||jsonb_build_array('low_margin'); end if;
  return jsonb_build_object('diagnostic_version','three-lever-v1','classification','synthetic_test','confidence',1.0,'primary_lever',v_scenario->>'primary_lever','constraints',v_constraints,'baseline_revenue',v_scenario->'baseline'->'revenue','customer_opportunity',v_scenario->'lever_revenue_uplift'->'customers','frequency_opportunity',v_scenario->'lever_revenue_uplift'->'frequency','atv_opportunity',v_scenario->'lever_revenue_uplift'->'average_transaction_value');
end; $$;

create or replace function sandbox.select_playbook(p_input jsonb,p_diagnostic jsonb) returns text language plpgsql stable set search_path=sandbox,public as $$
declare v_primary text:=p_diagnostic->>'primary_lever'; v_cancel numeric:=coalesce(nullif(p_input->>'cancellation_rate','')::numeric,0); v_no_show numeric:=coalesce(nullif(p_input->>'no_show_rate','')::numeric,0); v_margin numeric:=coalesce(nullif(p_input->>'gross_margin_rate','')::numeric,1); v_conversion numeric:=nullif(p_input->>'lead_to_customer_conversion_rate','')::numeric; v_repeat numeric:=nullif(p_input->>'repeat_customer_rate','')::numeric; v_constraints jsonb:=coalesce(p_diagnostic->'constraints','[]'::jsonb);
begin
  if v_no_show>=0.10 then return 'no_show_prevention'; end if; if v_cancel>=0.15 then return 'cancellation_backfill'; end if;
  if v_primary='customers' and coalesce(v_repeat,0)>=0.50 then return 'referral_engine'; end if; if v_primary='customers' and v_conversion is not null and v_conversion<0.25 then return 'lead_followup_sequence'; end if;
  if v_primary='customers' then return 'local_visibility_capture'; end if; if v_primary='frequency' then return 'next_booking_at_checkout'; end if;
  if v_primary='average_transaction_value' and v_constraints ? 'capacity' then return 'minimum_booking_value'; end if; if v_primary='average_transaction_value' and v_margin<0.40 then return 'price_floor_review'; end if;
  if v_primary='average_transaction_value' then return 'package_bundling'; end if; return null;
end; $$;

create or replace function sandbox.score_opportunity(p_scenario jsonb,p_playbook_key text) returns jsonb language plpgsql stable set search_path=sandbox,public as $$
declare v_effort integer:=3; v_risk integer:=2; v_days integer:=90; v_primary text:=p_scenario->>'primary_lever'; v_baseline numeric:=coalesce((p_scenario->'baseline'->>'revenue')::numeric,0); v_uplift numeric:=coalesce((p_scenario->'lever_revenue_uplift'->>v_primary)::numeric,0); v_impact numeric; v_ease numeric; v_speed numeric; v_feasibility numeric; v_total numeric;
begin
  select effort_score,risk_score,coalesce(expected_time_to_signal_days,90) into v_effort,v_risk,v_days from public.intelligence_playbooks where key=p_playbook_key and status='active' order by version desc limit 1;
  v_impact:=case when v_baseline<=0 then case when v_uplift>0 then 100 else 0 end else least(100,(v_uplift/v_baseline)*200) end; v_ease:=greatest(20,120-v_effort*20); v_feasibility:=greatest(20,120-v_risk*20);
  v_speed:=case when v_days<=30 then 100 when v_days<=60 then 80 when v_days<=90 then 60 when v_days<=120 then 40 else 20 end;
  v_total:=v_impact*0.30+100*0.10+100*0.10+v_ease*0.15+v_speed*0.10+100*0.10+v_feasibility*0.10+80*0.05;
  return jsonb_build_object('scoring_version','growth-opportunity-v1','lever',v_primary,'opportunity_value',v_uplift,'impact_score',round(v_impact,2),'evidence_strength_score',100,'confidence_score',100,'ease_score',v_ease,'speed_score',v_speed,'strategic_fit_score',100,'feasibility_score',v_feasibility,'learning_value_score',80,'total_score',round(v_total,2));
end; $$;

create or replace function sandbox.public_intelligence_counts() returns jsonb language sql stable set search_path=sandbox,public as $$ select jsonb_build_object('business_profiles',(select count(*) from public.intelligence_business_profiles),'metric_values',(select count(*) from public.intelligence_metric_values),'growth_diagnostics',(select count(*) from public.intelligence_growth_diagnostics),'opportunity_scores',(select count(*) from public.intelligence_opportunity_scores),'recommendations',(select count(*) from public.intelligence_recommendations),'decisions',(select count(*) from public.intelligence_decisions),'interventions',(select count(*) from public.intelligence_interventions),'outcomes',(select count(*) from public.intelligence_outcomes),'attributions',(select count(*) from public.intelligence_attributions),'learning',(select count(*) from public.intelligence_learning)); $$;

create or replace function sandbox.run_fixture(p_fixture_key text) returns jsonb language plpgsql volatile set search_path=sandbox,public as $$
declare v_fixture sandbox.business_fixtures%rowtype; v_scenario jsonb; v_diagnostic jsonb; v_playbook_key text; v_playbook_name text; v_primary_metric text; v_opportunity jsonb; v_recommendation jsonb; v_decision jsonb; v_intervention jsonb; v_outcome jsonb; v_attribution jsonb; v_learning jsonb; v_delta numeric;
begin
  select * into strict v_fixture from sandbox.business_fixtures where fixture_key=p_fixture_key and active; v_scenario:=sandbox.calculate_growth_scenario(v_fixture.inputs); v_diagnostic:=sandbox.diagnose_three_levers(v_fixture.inputs); v_playbook_key:=sandbox.select_playbook(v_fixture.inputs,v_diagnostic);
  if v_playbook_key is null then raise exception 'No playbook selected for fixture %',p_fixture_key; end if;
  select name,primary_metric_key into v_playbook_name,v_primary_metric from public.intelligence_playbooks where key=v_playbook_key and status='active' order by version desc limit 1; if v_playbook_name is null then raise exception 'Playbook % is missing from canonical catalog',v_playbook_key; end if;
  v_opportunity:=sandbox.score_opportunity(v_scenario,v_playbook_key)||jsonb_build_object('playbook_key',v_playbook_key,'playbook_name',v_playbook_name);
  v_recommendation:=jsonb_build_object('status','proposed','classification','modelled','playbook_key',v_playbook_key,'title',v_playbook_name,'primary_metric_key',v_primary_metric);
  v_decision:=jsonb_build_object('status','approved','decision','simulate_playbook','rationale','Deterministic sandbox acceptance'); v_intervention:=jsonb_build_object('status','completed','playbook_key',v_playbook_key,'implementation_evidence',jsonb_build_array('synthetic_execution'));
  v_delta:=(v_scenario->'modelled'->>'revenue')::numeric-(v_scenario->'baseline'->>'revenue')::numeric; v_outcome:=jsonb_build_object('classification','modelled','baseline_value',v_scenario->'baseline'->'revenue','observed_value',v_scenario->'modelled'->'revenue','delta',v_delta);
  v_attribution:=jsonb_build_object('method','modelled','confidence',1.0,'attributed_value',v_delta,'confounders','[]'::jsonb); v_learning:=jsonb_build_object('type','synthetic_validation','confidence',1.0,'hypothesis',concat(v_playbook_name,' should improve the primary constrained metric.'),'result',case when v_delta>0 then 'supported_in_model' else 'no_modelled_uplift' end);
  insert into sandbox.simulations(fixture_key,scenario,diagnostic,opportunity,recommendation,decision,intervention,outcome,attribution,learning,executed_at) values (p_fixture_key,v_scenario,v_diagnostic,v_opportunity,v_recommendation,v_decision,v_intervention,v_outcome,v_attribution,v_learning,now()) on conflict(fixture_key) do update set scenario=excluded.scenario,diagnostic=excluded.diagnostic,opportunity=excluded.opportunity,recommendation=excluded.recommendation,decision=excluded.decision,intervention=excluded.intervention,outcome=excluded.outcome,attribution=excluded.attribution,learning=excluded.learning,executed_at=now();
  return jsonb_build_object('fixture_key',p_fixture_key,'scenario',v_scenario,'diagnostic',v_diagnostic,'opportunity',v_opportunity,'recommendation',v_recommendation,'decision',v_decision,'intervention',v_intervention,'outcome',v_outcome,'attribution',v_attribution,'learning',v_learning);
end; $$;

create or replace function sandbox.run_validation_suite() returns jsonb language plpgsql volatile set search_path=sandbox,public as $$
declare v_run_id uuid; v_fixture record; v_result jsonb; v_expected jsonb; v_actual_lever text; v_actual_playbook text; v_actual_baseline numeric; v_expected_baseline numeric; v_before jsonb; v_after jsonb; v_fixture_count integer; v_passed integer; v_failed integer; v_ok boolean;
begin
  v_before:=sandbox.public_intelligence_counts(); select count(*) into v_fixture_count from sandbox.business_fixtures where active; insert into sandbox.validation_runs(fixture_count,public_counts_before) values(v_fixture_count,v_before) returning id into v_run_id;
  for v_fixture in select fixture_key,expected from sandbox.business_fixtures where active order by fixture_key loop
    v_expected:=v_fixture.expected;
    begin
      v_result:=sandbox.run_fixture(v_fixture.fixture_key); v_actual_lever:=v_result->'diagnostic'->>'primary_lever'; v_actual_playbook:=v_result->'opportunity'->>'playbook_key'; v_actual_baseline:=(v_result->'scenario'->'baseline'->>'revenue')::numeric; v_expected_baseline:=(v_expected->>'baseline_revenue')::numeric;
      v_ok:=v_actual_lever is not distinct from (v_expected->>'primary_lever'); insert into sandbox.validation_results(run_id,fixture_key,check_name,passed,expected,actual,message) values(v_run_id,v_fixture.fixture_key,'primary_lever',v_ok,to_jsonb(v_expected->>'primary_lever'),to_jsonb(v_actual_lever),case when v_ok then 'Primary lever matched' else 'Primary lever mismatch' end);
      v_ok:=v_actual_playbook is not distinct from (v_expected->>'playbook_key'); insert into sandbox.validation_results(run_id,fixture_key,check_name,passed,expected,actual,message) values(v_run_id,v_fixture.fixture_key,'playbook_mapping',v_ok,to_jsonb(v_expected->>'playbook_key'),to_jsonb(v_actual_playbook),case when v_ok then 'Playbook matched' else 'Playbook mismatch' end);
      v_ok:=abs(v_actual_baseline-v_expected_baseline)<=0.01; insert into sandbox.validation_results(run_id,fixture_key,check_name,passed,expected,actual,message) values(v_run_id,v_fixture.fixture_key,'baseline_revenue',v_ok,to_jsonb(v_expected_baseline),to_jsonb(v_actual_baseline),case when v_ok then 'Baseline revenue matched' else 'Baseline revenue mismatch' end);
      v_ok:=(v_result->'opportunity'->>'total_score')::numeric between 0 and 100 and v_result->'recommendation'->>'status'='proposed' and v_result->'decision'->>'status'='approved' and v_result->'intervention'->>'status'='completed' and v_result->'outcome'->>'classification'='modelled' and v_result->'attribution'->>'method'='modelled' and v_result->'learning'->>'type'='synthetic_validation';
      insert into sandbox.validation_results(run_id,fixture_key,check_name,passed,expected,actual,message) values(v_run_id,v_fixture.fixture_key,'closed_loop',v_ok,'true'::jsonb,to_jsonb(v_ok),case when v_ok then 'Closed loop complete' else 'Closed loop incomplete' end);
    exception when others then insert into sandbox.validation_results(run_id,fixture_key,check_name,passed,message) values(v_run_id,v_fixture.fixture_key,'fixture_execution',false,sqlerrm); end;
  end loop;
  v_after:=sandbox.public_intelligence_counts(); v_ok:=v_before=v_after; insert into sandbox.validation_results(run_id,check_name,passed,expected,actual,message) values(v_run_id,'production_write_isolation',v_ok,v_before,v_after,case when v_ok then 'No production intelligence rows changed' else 'Sandbox changed production intelligence row counts' end);
  v_ok:=v_fixture_count>=10; insert into sandbox.validation_results(run_id,check_name,passed,expected,actual,message) values(v_run_id,'fixture_coverage',v_ok,'10'::jsonb,to_jsonb(v_fixture_count),case when v_ok then 'Fixture coverage met' else 'Fixture coverage below minimum' end);
  select count(*) filter(where passed),count(*) filter(where not passed) into v_passed,v_failed from sandbox.validation_results where run_id=v_run_id;
  update sandbox.validation_runs set status=case when v_failed=0 then 'success' else 'failed' end,passed_checks=v_passed,failed_checks=v_failed,public_counts_after=v_after,completed_at=now(),details=jsonb_build_object('isolation_verified',v_before=v_after,'minimum_fixture_count',10) where id=v_run_id;
  return jsonb_build_object('run_id',v_run_id,'status',case when v_failed=0 then 'success' else 'failed' end,'fixture_count',v_fixture_count,'passed',v_passed,'failed',v_failed,'public_counts_before',v_before,'public_counts_after',v_after);
end; $$;

insert into sandbox.business_fixtures(fixture_key,name,description,inputs,expected) values
('healthy_control','Synthetic Healthy Control','Generally healthy studio with modest acquisition upside.','{"customers":120,"purchase_frequency":2,"average_transaction_value":600,"annual_capacity_transactions":300,"cancellation_rate":0.02,"no_show_rate":0.01,"gross_margin_rate":0.65,"repeat_customer_rate":0.60,"customer_growth_pct":0.05,"frequency_growth_pct":0.03,"atv_growth_pct":0.02}'::jsonb,'{"primary_lever":"customers","playbook_key":"referral_engine","baseline_revenue":139708.8}'::jsonb),
('low_conversion','Synthetic Low Conversion','High lead volume with weak lead-to-customer conversion.','{"annual_leads":1000,"lead_to_customer_conversion_rate":0.10,"purchase_frequency":1.5,"average_transaction_value":600,"annual_capacity_transactions":250,"cancellation_rate":0.02,"no_show_rate":0.01,"gross_margin_rate":0.60,"customer_growth_pct":0.50,"frequency_growth_pct":0.05,"atv_growth_pct":0.05}'::jsonb,'{"primary_lever":"customers","playbook_key":"lead_followup_sequence","baseline_revenue":87318}'::jsonb),
('low_customers','Synthetic Low Customers','Demand/customer volume is the dominant growth constraint.','{"customers":80,"purchase_frequency":2,"average_transaction_value":550,"annual_capacity_transactions":250,"cancellation_rate":0.03,"no_show_rate":0.02,"gross_margin_rate":0.60,"customer_growth_pct":0.40,"frequency_growth_pct":0.05,"atv_growth_pct":0.05}'::jsonb,'{"primary_lever":"customers","playbook_key":"local_visibility_capture","baseline_revenue":83652.8}'::jsonb),
('low_frequency','Synthetic Low Frequency','Existing customers transact too infrequently.','{"customers":150,"purchase_frequency":1.2,"average_transaction_value":600,"annual_capacity_transactions":300,"cancellation_rate":0.02,"no_show_rate":0.01,"gross_margin_rate":0.65,"repeat_customer_rate":0.20,"customer_growth_pct":0.05,"frequency_growth_pct":0.50,"atv_growth_pct":0.05}'::jsonb,'{"primary_lever":"frequency","playbook_key":"next_booking_at_checkout","baseline_revenue":104781.6}'::jsonb),
('low_atv','Synthetic Low ATV','Average transaction value is the dominant opportunity.','{"customers":150,"purchase_frequency":2,"average_transaction_value":300,"annual_capacity_transactions":400,"cancellation_rate":0.02,"no_show_rate":0.01,"gross_margin_rate":0.60,"customer_growth_pct":0.05,"frequency_growth_pct":0.05,"atv_growth_pct":0.50}'::jsonb,'{"primary_lever":"average_transaction_value","playbook_key":"package_bundling","baseline_revenue":87318}'::jsonb),
('capacity_constrained','Synthetic Capacity Constrained','Customer/frequency growth is capped by capacity; ATV retains upside.','{"customers":200,"purchase_frequency":2,"average_transaction_value":500,"annual_capacity_transactions":300,"cancellation_rate":0,"no_show_rate":0,"gross_margin_rate":0.65,"customer_growth_pct":0.30,"frequency_growth_pct":0.20,"atv_growth_pct":0.20}'::jsonb,'{"primary_lever":"average_transaction_value","playbook_key":"minimum_booking_value","baseline_revenue":150000}'::jsonb),
('high_cancellations','Synthetic High Cancellations','Material cancellation leakage with recoverable capacity.','{"customers":200,"purchase_frequency":2,"average_transaction_value":500,"annual_capacity_transactions":500,"cancellation_rate":0.20,"no_show_rate":0.02,"gross_margin_rate":0.60,"customer_growth_pct":0.20,"frequency_growth_pct":0.05,"atv_growth_pct":0.05}'::jsonb,'{"primary_lever":"customers","playbook_key":"cancellation_backfill","baseline_revenue":156800}'::jsonb),
('high_no_shows','Synthetic High No-shows','Won demand is leaking through preventable no-shows.','{"customers":200,"purchase_frequency":2,"average_transaction_value":500,"annual_capacity_transactions":500,"cancellation_rate":0.02,"no_show_rate":0.20,"gross_margin_rate":0.60,"customer_growth_pct":0.20,"frequency_growth_pct":0.05,"atv_growth_pct":0.05}'::jsonb,'{"primary_lever":"customers","playbook_key":"no_show_prevention","baseline_revenue":156800}'::jsonb),
('low_margin','Synthetic Low Margin','Weak economics make price/ATV improvement the priority.','{"customers":150,"purchase_frequency":2,"average_transaction_value":400,"annual_capacity_transactions":400,"cancellation_rate":0.02,"no_show_rate":0.01,"gross_margin_rate":0.30,"customer_growth_pct":0.05,"frequency_growth_pct":0.05,"atv_growth_pct":0.25}'::jsonb,'{"primary_lever":"average_transaction_value","playbook_key":"price_floor_review","baseline_revenue":116424}'::jsonb),
('compound_growth','Synthetic Compound Growth','Balanced 20% improvements show compounding across all three levers.','{"customers":100,"purchase_frequency":1.5,"average_transaction_value":450,"annual_capacity_transactions":300,"cancellation_rate":0.05,"no_show_rate":0.03,"gross_margin_rate":0.60,"customer_growth_pct":0.20,"frequency_growth_pct":0.20,"atv_growth_pct":0.20}'::jsonb,'{"primary_lever":"customers","playbook_key":"local_visibility_capture","baseline_revenue":62201.25}'::jsonb)
on conflict(fixture_key) do update set name=excluded.name,description=excluded.description,inputs=excluded.inputs,expected=excluded.expected,active=true,updated_at=now();

revoke all on all functions in schema sandbox from public, anon, authenticated;
grant execute on all functions in schema sandbox to service_role;
alter default privileges in schema sandbox revoke execute on functions from public, anon, authenticated;