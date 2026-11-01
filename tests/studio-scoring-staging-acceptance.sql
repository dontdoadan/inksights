-- Run on a non-production database only, AFTER migration 20261101060000.
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

  raise notice 'PASS: weights, role permissions, null scores and evidence isolation';
end;
$$;

rollback;
