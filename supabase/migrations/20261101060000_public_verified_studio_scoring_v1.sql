-- INKSIGHTS Public Presence and Verified Commercial Scoring v1
-- Additive migration. No existing studio, lead, submission or intelligence rows are rewritten.
-- Canonical entity: public.visibility_studios(id). public.studios remains a legacy compatibility entity.

create table if not exists public.studio_legacy_identity_links (
  legacy_studio_id uuid primary key references public.studios(id) on delete restrict,
  canonical_studio_id uuid not null references public.visibility_studios(id) on delete restrict,
  match_method text not null check (match_method in ('manually_reviewed','verified_website_postcode','authenticated_claim')),
  reviewed_by uuid,
  review_evidence jsonb not null default '{}'::jsonb,
  reviewed_at timestamptz not null default now(),
  unique (legacy_studio_id, canonical_studio_id)
);
create index if not exists studio_legacy_identity_links_canonical_idx
  on public.studio_legacy_identity_links(canonical_studio_id);

-- Existing public tools point studio_id to *legacy* public.studios. Preserve it.
alter table public.public_tool_submissions
  add column if not exists canonical_studio_id uuid references public.visibility_studios(id) on delete set null;
create index if not exists public_tool_submissions_canonical_idx
  on public.public_tool_submissions(canonical_studio_id, submitted_at desc);

create table if not exists public.studio_profile_answers (
  studio_id uuid not null references public.visibility_studios(id) on delete cascade,
  field_key text not null check (field_key ~ '^[a-z][a-z0-9_]{2,79}$'),
  value_json jsonb not null,
  source_type text not null check (source_type in ('public_observation','studio_reported','integration','staff_review')),
  verification_status text not null default 'unverified'
    check (verification_status in ('unverified','verified','disputed')),
  confidence numeric check (confidence between 0 and 1),
  source_ref text,
  source_submission_id uuid references public.public_tool_submissions(id) on delete set null,
  measurement_start date,
  measurement_end date,
  answered_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  primary key (studio_id, field_key),
  check (measurement_end is null or measurement_start is not null),
  check (measurement_end is null or measurement_end >= measurement_start),
  check (jsonb_typeof(value_json) in ('string','number','boolean','object','array')),
  check (octet_length(value_json::text) <= 8192)
);
comment on table public.studio_profile_answers is
  'Current canonical answers. Server-side authorised upserts enable progressive prefill; never infer authenticated ownership from a submitted studio name.';

create table if not exists public.studio_profile_answer_history (
  id bigint generated always as identity primary key,
  studio_id uuid not null references public.visibility_studios(id) on delete cascade,
  field_key text not null,
  previous_value jsonb,
  previous_period_start date,
  previous_period_end date,
  new_value jsonb not null,
  measurement_start date,
  measurement_end date,
  source_type text not null,
  verification_status text not null,
  source_ref text,
  source_submission_id uuid,
  recorded_at timestamptz not null default now()
);
create index if not exists studio_profile_answer_history_studio_idx
  on public.studio_profile_answer_history(studio_id,field_key,recorded_at desc);

-- Private trigger executes with owner privileges only to preserve tamper-resistant change history.
create schema if not exists inksights_internal;
revoke all on schema inksights_internal from public, anon, authenticated;
create or replace function inksights_internal.audit_studio_profile_answer_v1()
returns trigger language plpgsql security definer set search_path = ''
as $$
begin
  insert into public.studio_profile_answer_history
    (studio_id, field_key, previous_value, previous_period_start, previous_period_end,
     new_value, measurement_start, measurement_end, source_type,
     verification_status, source_ref, source_submission_id)
  values
    (new.studio_id, new.field_key,
     case when tg_op = 'UPDATE' then old.value_json else null end,
     case when tg_op = 'UPDATE' then old.measurement_start else null end,
     case when tg_op = 'UPDATE' then old.measurement_end else null end,
     new.value_json, new.measurement_start, new.measurement_end,
     new.source_type, new.verification_status, new.source_ref, new.source_submission_id);
  return new;
end;
$$;
revoke all on function inksights_internal.audit_studio_profile_answer_v1() from public, anon, authenticated;
drop trigger if exists trg_audit_studio_profile_answer_v1 on public.studio_profile_answers;
create trigger trg_audit_studio_profile_answer_v1
  after insert or update on public.studio_profile_answers
  for each row execute function inksights_internal.audit_studio_profile_answer_v1();

create table if not exists public.studio_scoring_models (
  id uuid primary key default gen_random_uuid(),
  model_key text not null check (model_key in ('public_presence','verified_commercial')),
  version integer not null check (version > 0),
  tier text not null check (tier in ('public','verified')),
  name text not null,
  description text,
  min_coverage numeric not null check (min_coverage between 0 and 1),
  status text not null default 'draft' check (status in ('draft','active','retired')),
  created_at timestamptz not null default now(),
  unique(model_key, version),
  unique(id, tier)
);
create table if not exists public.studio_scoring_dimensions (
  model_id uuid not null references public.studio_scoring_models(id) on delete cascade,
  dimension_key text not null,
  label text not null,
  dimension_weight numeric not null check (dimension_weight > 0 and dimension_weight <= 100),
  primary key(model_id, dimension_key)
);
create table if not exists public.studio_scoring_metric_rules (
  id uuid primary key default gen_random_uuid(),
  model_id uuid not null,
  dimension_key text not null,
  metric_key text not null,
  metric_weight numeric not null default 1 check (metric_weight > 0),
  scoring_method text not null default 'empirical'
    check (scoring_method in ('empirical','published_rubric')),
  active boolean not null default true,
  foreign key(model_id, dimension_key)
    references public.studio_scoring_dimensions(model_id, dimension_key) on delete cascade,
  unique(model_id, metric_key)
);
create index if not exists studio_scoring_rules_model_idx
  on public.studio_scoring_metric_rules(model_id, dimension_key);

-- Metric assessments are immutable evidence-linked, benchmark-normalised inputs.
-- Raw commercial metrics remain in intelligence_metric_values, not in score records.
create table if not exists public.studio_scoring_metric_assessments (
  id uuid primary key default gen_random_uuid(),
  studio_id uuid not null references public.visibility_studios(id) on delete cascade,
  rule_id uuid not null references public.studio_scoring_metric_rules(id) on delete restrict,
  normalised_score numeric not null check (normalised_score between 0 and 100),
  source_tier text not null check (source_tier in ('public','verified')),
  review_status text not null default 'pending' check (review_status in ('pending','accepted','rejected')),
  benchmark_state text not null check (benchmark_state in ('EMPIRICAL','DIRECTIONAL','UNCALIBRATED','INSUFFICIENT_DATA','PUBLISHED_RUBRIC')),
  benchmark_ref text,
  scoring_basis jsonb not null default '{}'::jsonb,
  metric_value_id uuid references public.intelligence_metric_values(id) on delete set null,
  evidence_id uuid references public.intelligence_evidence(id) on delete set null,
  source_ref text,
  confidence numeric check (confidence between 0 and 1),
  observed_at timestamptz not null default now(),
  created_at timestamptz not null default now(),
  check (metric_value_id is not null or evidence_id is not null or nullif(source_ref,'') is not null),
  check (review_status <> 'accepted' or benchmark_state in ('EMPIRICAL','PUBLISHED_RUBRIC')),
  check (review_status <> 'accepted' or nullif(benchmark_ref,'') is not null)
);
-- Enforce evidence and score-rule ownership inside the database, not only in API code.
create or replace function public.validate_studio_scoring_assessment_v1()
returns trigger language plpgsql security invoker set search_path = ''
as $
declare
  v_tier text;
begin
  select m.tier into v_tier
  from public.studio_scoring_metric_rules r
  join public.studio_scoring_models m on m.id = r.model_id
  where r.id = new.rule_id and r.active;
  if v_tier is null or v_tier <> new.source_tier then
    raise exception 'scoring model tier mismatch or inactive rule';
  end if;
  if new.metric_value_id is not null
     and not exists(select 1 from public.intelligence_metric_values v
                    where v.id = new.metric_value_id and v.studio_id = new.studio_id) then
    raise exception 'metric evidence must belong to the canonical studio';
  end if;
  if new.evidence_id is not null
     and not exists(select 1 from public.intelligence_evidence e
                    where e.id = new.evidence_id and e.studio_id = new.studio_id) then
    raise exception 'source evidence must belong to the canonical studio';
  end if;
  return new;
end;
$;
revoke all on function public.validate_studio_scoring_assessment_v1()
  from public, anon, authenticated;
create trigger trg_validate_studio_scoring_assessment_v1
  before insert or update on public.studio_scoring_metric_assessments
  for each row execute function public.validate_studio_scoring_assessment_v1();

create index if not exists studio_scoring_assessments_latest_idx
  on public.studio_scoring_metric_assessments(studio_id, rule_id, observed_at desc, created_at desc);

create table if not exists public.studio_scoring_snapshots (
  id uuid primary key default gen_random_uuid(),
  studio_id uuid not null references public.visibility_studios(id) on delete cascade,
  model_id uuid not null references public.studio_scoring_models(id) on delete restrict,
  score numeric check (score between 0 and 100),
  coverage numeric not null check (coverage between 0 and 1),
  evidence_quality numeric check (evidence_quality between 0 and 1),
  status text not null check (status in ('scored','insufficient_data')),
  dimension_scores jsonb not null default '{}'::jsonb,
  assessment_ids uuid[] not null default '{}'::uuid[],
  period_start date,
  period_end date,
  engine_version text not null default 'studio-scoring-v1',
  scored_at timestamptz not null default now(),
  check ((status = 'scored' and score is not null) or (status = 'insufficient_data' and score is null)),
  check (period_end is null or period_start is not null),
  check (period_end is null or period_end >= period_start)
);
create index if not exists studio_scoring_snapshots_latest_idx
  on public.studio_scoring_snapshots(studio_id, model_id, scored_at desc);

-- Public inputs must never be silently promoted to verified performance.
-- This function is executed by trusted server code (service_role), not by browsers.
create or replace function public.calculate_studio_score_v1(
  p_studio_id uuid,
  p_model_key text,
  p_period_start date default null,
  p_period_end date default null
) returns uuid
language plpgsql
security invoker
set search_path = ''
as $$
declare
  v_model public.studio_scoring_models%rowtype;
  v_result jsonb;
  v_coverage numeric;
  v_score numeric;
  v_evidence_quality numeric;
  v_missing_dimensions integer;
  v_assessments uuid[];
  v_snapshot_id uuid;
begin
  if p_studio_id is null or p_model_key is null then
    raise exception 'studio_id and model_key required';
  end if;
  if p_period_end is not null and (p_period_start is null or p_period_end < p_period_start) then
    raise exception 'invalid measurement period';
  end if;
  if not exists (select 1 from public.visibility_studios where id = p_studio_id) then
    raise exception 'unknown canonical studio';
  end if;
  select * into v_model from public.studio_scoring_models
  where model_key = p_model_key and status = 'active'
  order by version desc limit 1;
  if not found then raise exception 'no active scoring model %',p_model_key; end if;
  if (select sum(dimension_weight) from public.studio_scoring_dimensions where model_id = v_model.id) <> 100 then
    raise exception 'scoring dimension weights must total 100';
  end if;

  with rules as (
    select r.id, r.metric_weight, r.dimension_key, r.scoring_method,
           d.dimension_weight, d.label
    from public.studio_scoring_metric_rules r
    join public.studio_scoring_dimensions d
      on d.model_id = r.model_id and d.dimension_key = r.dimension_key
    where r.model_id = v_model.id and r.active
  ),
  eligible as (
    select rules.*, chosen.id as assessment_id,chosen.normalised_score,
           chosen.confidence
    from rules
    left join lateral (
      select a.* from public.studio_scoring_metric_assessments a
      where a.rule_id = rules.id and a.studio_id = p_studio_id
        and a.source_tier = v_model.tier and a.review_status = 'accepted'
        and ((rules.scoring_method = 'empirical' and a.benchmark_state = 'EMPIRICAL')
             or (rules.scoring_method = 'published_rubric' and a.benchmark_state = 'PUBLISHED_RUBRIC'))
        and (p_period_start is null or a.observed_at::date >= p_period_start)
        and (p_period_end is null or a.observed_at::date <= p_period_end)
      order by a.observed_at desc,a.created_at desc,a.id desc limit 1
    ) chosen on true
  ),
  dimensions as (
    select d.dimension_key,d.label,d.dimension_weight,
      coalesce(sum(e.metric_weight) filter(where e.assessment_id is not null)
         / nullif(sum(e.metric_weight),0),0) as coverage,
      sum(e.normalised_score * e.metric_weight) filter(where e.assessment_id is not null)
       / nullif(sum(e.metric_weight) filter(where e.assessment_id is not null),0) as score
    from public.studio_scoring_dimensions d
    left join eligible e on e.dimension_key = d.dimension_key
    where d.model_id = v_model.id
    group by d.dimension_key,d.label,d.dimension_weight
  ),
  totals as (
    select
      coalesce(sum(dimension_weight * coverage)/nullif(sum(dimension_weight),0),0) as coverage,
      sum(dimension_weight * score) filter(where score is not null)
       / nullif(sum(dimension_weight) filter(where score is not null),0) as score,
      count(*) filter(where score is null) as missing_dims,
      coalesce(jsonb_object_agg(dimension_key,
        jsonb_build_object('label',label,'score',round(score,2),'coverage',round(coverage,4),
                           'weight',dimension_weight)), '{}'::jsonb) as breakdown
    from dimensions
  ),
  observations as (
    select coalesce(array_agg(assessment_id) filter(where assessment_id is not null),'{}'::uuid[]) ids,
      sum(confidence*metric_weight) filter(where assessment_id is not null and confidence is not null)
       / nullif(sum(metric_weight) filter(where assessment_id is not null and confidence is not null),0) as quality
    from eligible
  )
  select t.coverage,t.score,t.missing_dims,t.breakdown,o.ids,o.quality
    into v_coverage,v_score,v_missing_dimensions,v_result,v_assessments,v_evidence_quality
  from totals t cross join observations o;

  insert into public.studio_scoring_snapshots
    (studio_id, model_id, score, coverage, evidence_quality, status, dimension_scores,
     assessment_ids, period_start, period_end)
  values
    (p_studio_id, v_model.id,
      case when v_coverage >= v_model.min_coverage and v_missing_dimensions = 0
        then round(v_score,2) else null end,
     v_coverage,v_evidence_quality,
      case when v_coverage >= v_model.min_coverage and v_missing_dimensions = 0
        then 'scored' else 'insufficient_data' end,
     v_result, v_assessments,p_period_start,p_period_end)
  returning id into v_snapshot_id;

  return v_snapshot_id;
end;
$$;
revoke all on function public.calculate_studio_score_v1(uuid,text,date,date)
  from public,anon,authenticated;
grant execute on function public.calculate_studio_score_v1(uuid,text,date,date) to service_role;

-- Every newly exposed table has RLS; browsers get read access only where authorised.
alter table public.studio_legacy_identity_links enable row level security;
alter table public.studio_profile_answers enable row level security;
alter table public.studio_profile_answer_history enable row level security;
alter table public.studio_scoring_models enable row level security;
alter table public.studio_scoring_dimensions enable row level security;
alter table public.studio_scoring_metric_rules enable row level security;
alter table public.studio_scoring_metric_assessments enable row level security;
alter table public.studio_scoring_snapshots enable row level security;

grant all on public.studio_legacy_identity_links,public.studio_profile_answers,
  public.studio_profile_answer_history,public.studio_scoring_models,
  public.studio_scoring_dimensions,public.studio_scoring_metric_rules,
  public.studio_scoring_metric_assessments,public.studio_scoring_snapshots to service_role;
grant usage,select on sequence public.studio_profile_answer_history_id_seq to service_role;
grant select, insert, update on public.studio_profile_answers to authenticated;
grant select on public.studio_profile_answer_history,
  public.studio_scoring_metric_assessments,public.studio_scoring_snapshots,
  public.studio_scoring_models,public.studio_scoring_dimensions,
  public.studio_scoring_metric_rules to authenticated;

create policy "studio profile answers read by active studio member"
on public.studio_profile_answers for select to authenticated
using (exists(select 1 from public.studio_members m
              where m.studio_id=studio_profile_answers.studio_id
                and m.user_id=(select auth.uid()) and m.active));
-- Client writes are self-reports only. They cannot change verified/staff-reviewed rows,
-- attach someone else's public submission or promote their own evidence to verified.
create policy "active member inserts own unverified answers"
on public.studio_profile_answers for insert to authenticated
with check (source_type = 'studio_reported' and verification_status = 'unverified'
  and source_ref is null and source_submission_id is null and confidence is null
  and exists(select 1 from public.studio_members m
    where m.studio_id=studio_profile_answers.studio_id
      and m.user_id=(select auth.uid()) and m.active));
create policy "active member updates own unverified answers"
on public.studio_profile_answers for update to authenticated
using (source_type = 'studio_reported' and verification_status = 'unverified'
  and exists(select 1 from public.studio_members m
    where m.studio_id=studio_profile_answers.studio_id
      and m.user_id=(select auth.uid()) and m.active))
with check (source_type = 'studio_reported' and verification_status = 'unverified'
  and source_ref is null and source_submission_id is null and confidence is null
  and exists(select 1 from public.studio_members m
    where m.studio_id=studio_profile_answers.studio_id
      and m.user_id=(select auth.uid()) and m.active));

create policy "studio profile answer history read by active studio member"
on public.studio_profile_answer_history for select to authenticated
using (exists(select 1 from public.studio_members m
              where m.studio_id=studio_profile_answer_history.studio_id
                and m.user_id=(select auth.uid()) and m.active));
create policy "studio metric assessments read by active studio member"
on public.studio_scoring_metric_assessments for select to authenticated
using (exists(select 1 from public.studio_members m
              where m.studio_id=studio_scoring_metric_assessments.studio_id
                and m.user_id=(select auth.uid()) and m.active));
create policy "studio scoring snapshots read by active studio member"
on public.studio_scoring_snapshots for select to authenticated
using (exists(select 1 from public.studio_members m
              where m.studio_id=studio_scoring_snapshots.studio_id
                and m.user_id=(select auth.uid()) and m.active));
create policy "studio scoring models authenticated read"
on public.studio_scoring_models for select to authenticated using (true);
create policy "studio scoring dimensions authenticated read"
on public.studio_scoring_dimensions for select to authenticated using (true);
create policy "studio scoring metric rules authenticated read"
on public.studio_scoring_metric_rules for select to authenticated using (true);

-- First launch uses uncalibrated benchmark rules: scoring is gated until actual
-- empirical cohort/rubric evidence has been approved and assessed.
insert into public.studio_scoring_models
  (model_key,version,tier,name,description,min_coverage,status)
values
  ('public_presence',1,'public','Public Presence Score',
   'Only sourceable public observations; no internal economics or guessed performance.',0.70,'active'),
  ('verified_commercial',1,'verified','Verified Commercial Performance Score',
   'Requires validated first-party metrics; never upgrades self-reports automatically.',0.75,'active')
on conflict(model_key,version) do nothing;

insert into public.studio_scoring_dimensions(model_id,dimension_key,label,dimension_weight)
select m.id,x.k,x.label,x.weight
from public.studio_scoring_models m
cross join lateral (values
  ('public_presence','local_visibility','Local visibility',25::numeric),
  ('public_presence','positioning','Market positioning',25::numeric),
  ('public_presence','reputation','Reputation and trust',12.5::numeric),
  ('public_presence','web_booking','Website and booking experience',37.5::numeric),
  ('verified_commercial','local_visibility','Local visibility',10::numeric),
  ('verified_commercial','positioning','Market positioning',10::numeric),
  ('verified_commercial','reputation','Reputation and trust',5::numeric),
  ('verified_commercial','web_booking','Website and booking experience',15::numeric),
  ('verified_commercial','demand','Demand and acquisition',5::numeric),
  ('verified_commercial','conversion','Booking conversion',15::numeric),
  ('verified_commercial','capacity','Capacity and utilisation',10::numeric),
  ('verified_commercial','revenue','Pricing and revenue',15::numeric),
  ('verified_commercial','retention','Retention and referrals',10::numeric),
  ('verified_commercial','operations','Operational intelligence',5::numeric)
) as x(model_key,k,label,weight)
where m.model_key=x.model_key and m.version=1
on conflict(model_id,dimension_key) do nothing;

-- These are measurement slots, NOT claims that scores or benchmarks exist.
-- empirical = comparable validated cohort; published_rubric = documented observable rubric.
with specs(model_key, dimension_key, metric_key, method) as (
values
('public_presence','local_visibility','maps_discoverability','empirical'),
('public_presence','local_visibility','google_business_completeness','published_rubric'),
('public_presence','local_visibility','local_organic_visibility','empirical'),
('public_presence','positioning','positioning_clarity','published_rubric'),
('public_presence','positioning','specialisation_differentiation','published_rubric'),
('public_presence','positioning','advertised_price_transparency','published_rubric'),
('public_presence','reputation','review_volume_percentile','empirical'),
('public_presence','reputation','recent_review_response_rate','published_rubric'),
('public_presence','reputation','recent_review_rating_percentile','empirical'),
('public_presence','web_booking','mobile_website_quality','published_rubric'),
('public_presence','web_booking','booking_cta_clarity','published_rubric'),
('public_presence','web_booking','enquiry_journey_friction','published_rubric'),
('public_presence','web_booking','artist_portfolio_accessibility','published_rubric'),
('verified_commercial','local_visibility','maps_discoverability','empirical'),
('verified_commercial','local_visibility','local_organic_visibility','empirical'),
('verified_commercial','positioning','positioning_clarity','published_rubric'),
('verified_commercial','positioning','advertised_price_transparency','published_rubric'),
('verified_commercial','reputation','review_volume_percentile','empirical'),
('verified_commercial','reputation','recent_review_response_rate','published_rubric'),
('verified_commercial','web_booking','mobile_website_quality','published_rubric'),
('verified_commercial','web_booking','enquiry_journey_friction','published_rubric'),
('verified_commercial','demand','qualified_lead_volume_percentile','empirical'),
('verified_commercial','demand','acquisition_efficiency_percentile','empirical'),
('verified_commercial','conversion','enquiry_to_paid_booking_rate','empirical'),
('verified_commercial','conversion','deposit_completion_rate','empirical'),
('verified_commercial','conversion','median_enquiry_response_time','empirical'),
('verified_commercial','capacity','billable_capacity_utilisation','empirical'),
('verified_commercial','capacity','unfilled_artist_days','empirical'),
('verified_commercial','revenue','realised_hourly_yield','empirical'),
('verified_commercial','revenue','revenue_per_available_artist_day','empirical'),
('verified_commercial','revenue','contribution_margin','empirical'),
('verified_commercial','retention','eligible_client_repeat_rate','empirical'),
('verified_commercial','retention','rebooking_rate','empirical'),
('verified_commercial','operations','crm_data_completeness','published_rubric'),
('verified_commercial','operations','source_attribution_coverage','published_rubric')
)
insert into public.studio_scoring_metric_rules(model_id,dimension_key,metric_key,scoring_method)
select m.id,s.dimension_key,s.metric_key,s.method
from specs s join public.studio_scoring_models m
on m.model_key=s.model_key and m.version=1
on conflict(model_id,metric_key) do nothing;

-- No artificial demo rows, historical scores, or unpublished observations inserted.
