-- Run on a non-production database only, AFTER migration 20261109000000.
-- This self-contained test rolls back its synthetic studio and evidence records.
-- Do NOT run on production. No Stripe/HubSpot calls are made.
begin;

do $$
declare
  v_a uuid;
  v_b uuid;
  v_snapshot_id uuid;
  v_score numeric;
  v_coverage numeric;
  v_status text;
  v_rule_id uuid;
  v_evidence_id uuid;
  v_rejected boolean := false;
  v_member uuid := gen_random_uuid();
  v_submission uuid;
  v_submission_key uuid := gen_random_uuid();
  v_claim jsonb;
  v_link_count integer;
  v_legacy uuid;
  v_legacy_submission uuid;
  v_reconciled integer;
  v_other_member uuid := gen_random_uuid();
  v_wrong_receipt uuid;
  v_wrong_key uuid := gen_random_uuid();
  v_verified_rule uuid;
  v_unverified_metric uuid;
  v_verified_metric uuid;
  v_definition uuid;
  v_tool_evidence uuid;
begin
  if to_regclass('public.studio_scoring_models') is null then
    raise exception 'Scoring migration has not been applied';
  end if;

  insert into public.visibility_studios(studio_name, website_url)
  values ('INKSIGHTS STAGING SCORING QA A','https://qa-a.example.invalid') returning id into v_a;
  insert into public.visibility_studios(studio_name, website_url)
  values ('INKSIGHTS STAGING SCORING QA B','https://qa-b.example.invalid') returning id into v_b;

  if (select sum(dimension_weight) from public.studio_scoring_dimensions
      where model_id=(select id from public.studio_scoring_models
                       where model_key='public_presence' and version=1)) <> 100 then
    raise exception 'Public model weights do not sum to 100';
  end if;
  if (select sum(dimension_weight) from public.studio_scoring_dimensions
      where model_id=(select id from public.studio_scoring_models
                       where model_key='verified_commercial' and version=1)) <> 100 then
    raise exception 'Verified model weights do not sum to 100';
  end if;

  if has_function_privilege('anon','public.calculate_studio_score_v1(uuid,text,date,date)','EXECUTE')
     or has_function_privilege('authenticated','public.calculate_studio_score_v1(uuid,text,date,date)','EXECUTE')
     or has_function_privilege('anon','public.claim_public_tool_submission_v1(uuid,uuid,uuid,uuid)','EXECUTE')
     or has_function_privilege('authenticated','public.claim_public_tool_submission_v1(uuid,uuid,uuid,uuid)','EXECUTE') then
    raise exception 'Privileged scoring or tool-claim RPC is publicly executable';
  end if;

  v_snapshot_id := public.calculate_studio_score_v1(v_a,'public_presence',null,null);
  select status,score,coverage into v_status,v_score,v_coverage
  from public.studio_scoring_snapshots where id=v_snapshot_id;
  if v_status <> 'insufficient_data' or v_score is not null or v_coverage <> 0 then
    raise exception 'Missing public evidence was not rejected';
  end if;

  v_snapshot_id := public.calculate_studio_score_v1(v_a,'verified_commercial',null,null);
  select status,score into v_status,v_score
  from public.studio_scoring_snapshots where id=v_snapshot_id;
  if v_status <> 'insufficient_data' or v_score is not null then
    raise exception 'Missing verified evidence was not rejected';
  end if;

  select r.id into v_rule_id from public.studio_scoring_metric_rules r
  join public.studio_scoring_models m on m.id=r.model_id
  where m.model_key='public_presence' and r.scoring_method='published_rubric'
  limit 1;

  insert into public.intelligence_evidence
    (studio_id,evidence_type,classification,source_type,source_ref,claim,payload,observed_at)
  values(v_a,'staging_qa','observed','manual_qa','qa-source',
         'Staging fixture only','{}'::jsonb,now()) returning id into v_evidence_id;

  begin
    insert into public.studio_scoring_metric_assessments
      (studio_id,rule_id,normalised_score,source_tier,review_status,
       benchmark_state,benchmark_ref,evidence_id)
    values(v_b,v_rule_id,50,'public','pending','PUBLISHED_RUBRIC','staging-rubric',v_evidence_id);
  exception when others then
    v_rejected := true;
  end;
  if not v_rejected then raise exception 'Cross-studio evidence reference accepted'; end if;

  -- Realistic studio-member receipt claim, idempotent replay and invalid proof.
  insert into public.studio_members(studio_id,user_id,active)
  values (v_a,v_member,true);

  insert into public.public_tool_submissions
    (tool_key,tool_version,submission_key,normalized_inputs,result_snapshot,consent_version)
  values ('pricing_benchmark','1',v_submission_key,
          '{"region":"uk","prices":[100,null,null,null,null]}'::jsonb,
          '{"positions":["within",null,null,null,null]}'::jsonb,
          '2026-10-tool-v1')
  returning id into v_submission;

  v_claim := public.claim_public_tool_submission_v1(v_a,v_member,v_submission,v_submission_key);
  if v_claim->>'verification_status' <> 'unverified' then
    raise exception 'Claim returned a false verification status';
  end if;
  if (select canonical_studio_id from public.public_tool_submissions where id=v_submission) <> v_a then
    raise exception 'Claim did not attach to the canonical studio';
  end if;
  perform public.claim_public_tool_submission_v1(v_a,v_member,v_submission,v_submission_key);
  select count(*) into v_link_count from public.intelligence_evidence
  where studio_id=v_a and source_type='public_tool_submission'
    and source_ref=v_submission::text;
  if v_link_count <> 1 then
    raise exception 'Receipt claim replay duplicated evidence';
  end if;

  v_rejected := false;
  begin
    perform public.claim_public_tool_submission_v1(v_a,v_member,v_submission,gen_random_uuid());
  exception when others then v_rejected := true;
  end;
  if not v_rejected then raise exception 'Incorrect receipt proof was accepted'; end if;

  v_rejected := false;
  begin
    perform public.claim_public_tool_submission_v1(v_b,v_member,v_submission,v_submission_key);
  exception when others then v_rejected := true;
  end;
  if not v_rejected then raise exception 'Cross-studio membership claim was accepted'; end if;

  -- Preserve Atlas as the sole reviewed legacy -> canonical mapping.
  insert into public.studios(name) values ('Review QA legacy studio') returning id into v_legacy;
  insert into public.public_tool_submissions
    (tool_key,tool_version,submission_key,studio_id,normalized_inputs,result_snapshot,consent_version)
  values ('pricing_benchmark','1',gen_random_uuid(),v_legacy,'{}'::jsonb,'{}'::jsonb,'2026-10-tool-v1')
  returning id into v_legacy_submission;

  v_rejected := false;
  begin
    perform public.reconcile_reviewed_studio_submissions_v1(v_legacy);
  exception when others then v_rejected := true;
  end;
  if not v_rejected then raise exception 'Legacy row reconciled without approved Atlas identity'; end if;

  insert into public.atlas_studio_links
    (studio_id,visibility_studio_id,evidence,reviewer_id)
  values (v_legacy,v_a,'{}'::jsonb,v_member);
  v_rejected := false;
  begin
    perform public.reconcile_reviewed_studio_submissions_v1(v_legacy);
  exception when others then v_rejected := true;
  end;
  if not v_rejected then raise exception 'Empty Atlas evidence was treated as reviewed'; end if;

  update public.atlas_studio_links
  set evidence='{"reviewed":true,"kind":"staging_qa"}'::jsonb
  where studio_id=v_legacy;
  v_reconciled := public.reconcile_reviewed_studio_submissions_v1(v_legacy);
  if v_reconciled <> 1 then raise exception 'Approved Atlas reconciliation was not applied'; end if;
  if (select canonical_studio_id from public.public_tool_submissions
      where id=v_legacy_submission) <> v_a then
    raise exception 'Legacy submission attached to wrong canonical studio';
  end if;
  if public.reconcile_reviewed_studio_submissions_v1(v_legacy) <> 0 then
    raise exception 'Reviewed legacy reconciliation is not idempotent';
  end if;

  -- A valid random receipt must not contradict a previously reviewed Atlas ID.
  insert into public.studio_members(studio_id,user_id,role,active)
  values(v_b,v_other_member,'owner',true);
  insert into public.public_tool_submissions
    (tool_key,tool_version,submission_key,studio_id,normalized_inputs,result_snapshot,consent_version)
  values ('visibility_scorecard','1',v_wrong_key,v_legacy,'{}'::jsonb,'{}'::jsonb,'2026-10-tool-v1')
  returning id into v_wrong_receipt;
  v_rejected := false;
  begin
    perform public.claim_public_tool_submission_v1(v_b,v_other_member,v_wrong_receipt,v_wrong_key);
  exception when others then v_rejected := true;
  end;
  if not v_rejected then
    raise exception 'Public receipt claim overrode a reviewed Atlas canonical identity';
  end if;
  if exists (select 1 from public.public_tool_submissions
      where id=v_wrong_receipt and canonical_studio_id is not null) then
    raise exception 'Rejected identity conflict was nevertheless saved';
  end if;

  -- Existing profile, history and first-party metric tables must move together.
  insert into public.studio_profile_answers
    (studio_id,field_key,value_json,source_type,verification_status,
     measurement_start,measurement_end,data_notice_version,notice_acknowledged_at)
  values (v_a,'monthly_tattoo_revenue_gbp','12000'::jsonb,
          'studio_reported','unverified','2026-09-01','2026-09-30',
          '2026-11-profile-v1','2000-01-01'::timestamptz);
  if exists (
    select 1 from public.studio_profile_answers
    where studio_id=v_a and field_key='monthly_tattoo_revenue_gbp'
      and (answered_at < now()-interval '5 minutes'
        or notice_acknowledged_at < now()-interval '5 minutes')
  ) then raise exception 'Browser-forged profile/notice timestamps survived server stamping'; end if;

  v_rejected := false;
  begin
    insert into public.studio_profile_answers
      (studio_id,field_key,value_json,source_type,verification_status,
       measurement_start,measurement_end,data_notice_version,notice_acknowledged_at)
    values(v_b,'monthly_qualified_enquiries','20'::jsonb,'studio_reported','unverified',
           '2026-09-15','2026-09-30','2026-11-profile-v1',now());
  exception when others then v_rejected := true;
  end;
  if not v_rejected then raise exception 'A partial month was accepted as a full monthly measure'; end if;
  update public.studio_profile_answers
  set value_json='13000'::jsonb,
      measurement_start='2026-10-01',measurement_end='2026-10-31',
      updated_at=now()
  where studio_id=v_a and field_key='monthly_tattoo_revenue_gbp';

  select count(*) into v_link_count from public.studio_profile_answer_history
  where studio_id=v_a and field_key='monthly_tattoo_revenue_gbp';
  if v_link_count <> 2 then raise exception 'First-party metric history does not retain both periods'; end if;
  select count(*) into v_link_count from public.intelligence_metric_values
  where studio_id=v_a and source_type='studio_reported_profile';
  if v_link_count <> 2 then raise exception 'First-party metric events were not appended'; end if;
  if exists(select 1 from public.intelligence_metric_values
            where studio_id=v_a and source_type='studio_reported_profile'
              and (lineage->>'verification_status') <> 'unverified') then
    raise exception 'Self-reported data incorrectly promoted to verified';
  end if;

  -- Public score cannot promote the owner's self-assessed scorecard directly.
  select id into v_tool_evidence from public.intelligence_evidence
  where studio_id=v_a and source_type='public_tool_submission'
    and source_ref=v_submission::text;
  if v_tool_evidence is null then raise exception 'Required claimed tool fixture missing'; end if;
  v_rejected := false;
  begin
    insert into public.studio_scoring_metric_assessments
      (studio_id,rule_id,normalised_score,source_tier,review_status,
       benchmark_state,benchmark_ref,evidence_id)
    values(v_a,v_rule_id,90,'public','accepted','PUBLISHED_RUBRIC',
           'staging-public-rubric',v_tool_evidence);
  exception when others then v_rejected := true;
  end;
  if not v_rejected then
    raise exception 'Accepted public score was derived from unverified self-report';
  end if;

  -- Verified commercial tier must not accept a merely reported monthly metric.
  select r.id into v_verified_rule from public.studio_scoring_metric_rules r
  join public.studio_scoring_models m on m.id=r.model_id
  where m.model_key='verified_commercial' and r.scoring_method='empirical' limit 1;
  if v_verified_rule is null then raise exception 'Verified scoring model lacks empirical rules'; end if;
  select id,metric_definition_id into v_unverified_metric,v_definition
  from public.intelligence_metric_values
  where studio_id=v_a and source_type='studio_reported_profile'
  order by created_at desc limit 1;
  if v_unverified_metric is null then raise exception 'Expected unverified first-party metric not found'; end if;
  v_rejected := false;
  begin
    insert into public.studio_scoring_metric_assessments
      (studio_id,rule_id,normalised_score,source_tier,review_status,
       benchmark_state,benchmark_ref,metric_value_id)
    values(v_a,v_verified_rule,70,'verified','accepted','EMPIRICAL',
           'staging-verified-cohort',v_unverified_metric);
  exception when others then v_rejected := true;
  end;
  if not v_rejected then
    raise exception 'Accepted verified score was derived from unverified owner figures';
  end if;

  -- Independently reviewed source provenance can be assessed, but a single
  -- qualifying metric still cannot generate a complete commercial score.
  insert into public.intelligence_metric_values
    (studio_id,metric_definition_id,value_numeric,unit,classification,
     source_type,source_ref,lineage,observed_at)
  values(v_a,v_definition,13200,'GBP','observed',
    'reviewed_integration','staging-fixture',
    '{"verification_status":"verified","reviewed_by":"staging-qa"}'::jsonb,now())
  returning id into v_verified_metric;
  insert into public.studio_scoring_metric_assessments
    (studio_id,rule_id,normalised_score,source_tier,review_status,
     benchmark_state,benchmark_ref,metric_value_id)
  values(v_a,v_verified_rule,70,'verified','accepted','EMPIRICAL',
         'staging-verified-cohort',v_verified_metric);

  v_snapshot_id := public.calculate_studio_score_v1(v_a,'verified_commercial',null,null);
  select status,score into v_status,v_score
  from public.studio_scoring_snapshots where id=v_snapshot_id;
  if v_status <> 'insufficient_data' or v_score is not null then
    raise exception 'Partial verified evidence improperly produced a commercial score';
  end if;

  raise notice 'PASS: identity, monthly history, RLS, reviewer provenance and low-coverage score suppression';
end;
$$;

rollback;
