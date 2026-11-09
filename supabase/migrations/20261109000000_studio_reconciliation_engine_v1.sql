-- Studio Identity Reconciliation Engine v1 (REVIEW-ONLY MIGRATION)
-- No automatic publication, prospect creation, CRM writes, or studio member grants.
-- Data remains in existing INKSIGHTS Supabase; these are private administrative projections.
create table if not exists public.studio_reconciliation_cases (
  candidate_id uuid primary key references public.studio_candidates(id) on delete restrict,
  suggested_visibility_id uuid references public.visibility_studios(id) on delete set null,
  suggested_audit_id uuid references public.studios(id) on delete set null,
  visibility_rule text not null default 'no_supported_match',
  audit_rule text not null default 'no_supported_match',
  signal_strength integer not null default 0 check(signal_strength between 0 and 100),
  alternative_visibility_matches integer not null default 0 check(alternative_visibility_matches >= 0),
  quality_flags text[] not null default '{}',
  review_status text not null default 'unreviewed' check(review_status in ('unreviewed','needs_evidence','approved','rejected')),
  reviewer_id uuid references auth.users(id),
  reviewed_at timestamptz,
  review_note text,
  review_evidence_url text,
  algorithm_version text not null default 'studio-reconcile-v1',
  first_queued_at timestamptz not null default now(),
  refreshed_at timestamptz not null default now()
);
create index if not exists studio_reconcile_review_queue_idx
 on public.studio_reconciliation_cases(review_status,signal_strength desc,refreshed_at desc);

create table if not exists public.studio_reconciliation_decisions (
 id uuid primary key default gen_random_uuid(),
 candidate_id uuid not null references public.studio_candidates(id) on delete restrict,
 visibility_studio_id uuid references public.visibility_studios(id) on delete restrict,
 audit_studio_id uuid references public.studios(id) on delete restrict,
 action text not null check(action in ('approve_visibility_match','reject_suggestion','needs_evidence','reopen')),
 reviewer_id uuid not null references auth.users(id),
 reason text not null check(char_length(reason) between 40 and 2000),
 evidence_url text,
 created_at timestamptz not null default now()
);
create index if not exists studio_reconcile_decisions_candidate_idx
 on public.studio_reconciliation_decisions(candidate_id,created_at desc);

alter table public.studio_reconciliation_cases enable row level security;
alter table public.studio_reconciliation_decisions enable row level security;
revoke all on public.studio_reconciliation_cases from PUBLIC, anon, authenticated;
revoke all on public.studio_reconciliation_decisions from PUBLIC, anon, authenticated;
grant select,insert,update on public.studio_reconciliation_cases to service_role;
grant select,insert on public.studio_reconciliation_decisions to service_role;
-- Deliberately no anon/authenticated policy. The admin gateway authenticates each request.

-- Deterministic, idempotent suggestion refresh. Comparison signals are leads for REVIEW,
-- not assertions of verified trading premises, company identity or ownership.
create or replace function public.studio_reconciliation_refresh(
  p_reviewer_id uuid
) returns jsonb language plpgsql security invoker set search_path = ''
as $$
declare v_processed integer;
begin
  if not exists(select 1 from public.platform_admins
                where user_id=p_reviewer_id and active=true and role in ('owner','admin'))
  then raise exception 'Platform reviewer role required'; end if;

  with c as (
    select c.*,
      regexp_replace(lower(coalesce(nullif(trim(c.normalized_name),''),c.name)), '[^a-z0-9]','','g') cname,
      regexp_replace(upper(coalesce(nullif(trim(c.normalized_postcode),''),coalesce(c.postcode,''))), '[^A-Z0-9]','','g') cpostcode,
      lower(split_part(regexp_replace(coalesce(c.website_url,''),'^https?://(www\.)?','','i'),'/',1)) chost
    from public.studio_candidates c
  ), v as (
    select v.*,
      regexp_replace(lower(coalesce(nullif(trim(v.normalized_name),''),v.studio_name)), '[^a-z0-9]','','g') vname,
      regexp_replace(upper(coalesce(nullif(trim(v.normalized_postcode),''),coalesce(v.postcode,''))), '[^A-Z0-9]','','g') vpostcode,
      lower(split_part(regexp_replace(coalesce(v.website_url,''),'^https?://(www\.)?','','i'),'/',1)) vhost
    from public.visibility_studios v
  ), a as (
    select s.*,
      regexp_replace(lower(coalesce(s.name,'')), '[^a-z0-9]','','g') aname,
      lower(split_part(regexp_replace(coalesce(s.website_url,''),'^https?://(www\.)?','','i'),'/',1)) ahost
    from public.studios s
  ), suggestions as (
    select c.id as candidate_id,
      vis.id as suggested_visibility_id,
      audit.id as suggested_audit_id,
      coalesce(vis.rule,'no_supported_match') visibility_rule,
      coalesce(audit.rule,'no_supported_match') audit_rule,
      greatest(coalesce(vis.strength,0),coalesce(audit.strength,0)) signal_strength,
      coalesce(vis.alternatives,0) alternative_visibility_matches,
      array_remove(array[
        case when coalesce(c.chost,'')='' then 'website_missing' end,
        case when coalesce(c.cpostcode,'')='' then 'postcode_missing' end,
        case when coalesce(c.cname,'')='' then 'name_missing' end,
        case when src.source_key='companies_house' then 'registry_is_not_trading_premises' end,
        case when c.observed_at < now() - interval '180 days' then 'source_older_than_180_days' end,
        case when coalesce(vis.alternatives,0)>1 then 'multiple_visibility_candidates' end
      ],null)::text[] quality_flags
    from c
    left join public.studio_sources src on src.id=c.source_id
    left join lateral (
      select b.id,b.rule,b.strength,b.alternatives from (
        select v.id,
        case
          when nullif(c.companies_house_number,'') is not null
             and regexp_replace(upper(c.companies_house_number),'[^A-Z0-9]','','g')=
               regexp_replace(upper(coalesce(v.companies_house_number,'')),'[^A-Z0-9]','','g')
            then 'exact_company_number'
          when c.chost<>'' and v.vhost<>'' and c.chost=v.vhost then 'same_website_host'
          when c.cname<>'' and c.cname=v.vname and c.cpostcode<>'' and c.cpostcode=v.vpostcode
            then 'same_name_postcode'
          when c.cname<>'' and c.cname=v.vname and coalesce(lower(trim(c.town)),'')<>''
               and lower(trim(c.town))=lower(trim(coalesce(v.town,'')))
            then 'same_name_town'
          else 'no_supported_match' end as rule,
        case
          when nullif(c.companies_house_number,'') is not null
             and regexp_replace(upper(c.companies_house_number),'[^A-Z0-9]','','g')=
               regexp_replace(upper(coalesce(v.companies_house_number,'')),'[^A-Z0-9]','','g')
            then 95
          when c.chost<>'' and v.vhost<>'' and c.chost=v.vhost then 90
          when c.cname<>'' and c.cname=v.vname and c.cpostcode<>'' and c.cpostcode=v.vpostcode then 80
          when c.cname<>'' and c.cname=v.vname and coalesce(lower(trim(c.town)),'')<>''
               and lower(trim(c.town))=lower(trim(coalesce(v.town,''))) then 60
          else 0 end as strength,
        count(*) over()::integer alternatives
        from v
        where (
          (nullif(c.companies_house_number,'') is not null and
             regexp_replace(upper(c.companies_house_number),'[^A-Z0-9]','','g')=
             regexp_replace(upper(coalesce(v.companies_house_number,'')),'[^A-Z0-9]','','g'))
          or (c.chost<>'' and v.vhost<>'' and c.chost=v.vhost)
          or (c.cname<>'' and c.cname=v.vname and c.cpostcode<>'' and c.cpostcode=v.vpostcode)
          or (c.cname<>'' and c.cname=v.vname and c.town is not null and trim(c.town)<>''
             and lower(trim(c.town))=lower(trim(coalesce(v.town,''))))
        )
      ) b order by b.strength desc,b.id asc limit 1
    ) vis on true
    left join lateral (
      select a.id,
        case when c.chost<>'' and a.ahost<>'' and c.chost=a.ahost then 'same_website_host'
             when c.cname<>'' and c.cname=a.aname and c.town is not null and trim(c.town)<>''
                  and lower(trim(c.town))=lower(trim(coalesce(a.primary_location,''))) then 'same_name_location'
             else 'no_supported_match' end rule,
        case when c.chost<>'' and a.ahost<>'' and c.chost=a.ahost then 90
             when c.cname<>'' and c.cname=a.aname and c.town is not null and trim(c.town)<>''
                  and lower(trim(c.town))=lower(trim(coalesce(a.primary_location,''))) then 65
             else 0 end strength
      from a
      where (c.chost<>'' and a.ahost<>'' and c.chost=a.ahost)
         or (c.cname<>'' and c.cname=a.aname and c.town is not null and trim(c.town)<>''
             and lower(trim(c.town))=lower(trim(coalesce(a.primary_location,''))))
      order by strength desc,id limit 1
    ) audit on true
  )
  insert into public.studio_reconciliation_cases (
    candidate_id,suggested_visibility_id,suggested_audit_id,visibility_rule,
    audit_rule,signal_strength,alternative_visibility_matches,quality_flags,refreshed_at
  )
  select candidate_id,suggested_visibility_id,suggested_audit_id,visibility_rule,
    audit_rule,signal_strength,alternative_visibility_matches,quality_flags,now()
  from suggestions
  on conflict (candidate_id) do update set
    suggested_visibility_id=excluded.suggested_visibility_id,
    suggested_audit_id=excluded.suggested_audit_id,
    visibility_rule=excluded.visibility_rule,
    audit_rule=excluded.audit_rule,
    signal_strength=excluded.signal_strength,
    alternative_visibility_matches=excluded.alternative_visibility_matches,
    quality_flags=excluded.quality_flags,
    refreshed_at=now()
  where studio_reconciliation_cases.review_status = 'unreviewed';

  get diagnostics v_processed = row_count;
  return jsonb_build_object('refreshed',v_processed,'version','studio-reconcile-v1',
     'approval_performed',false,'publications_performed',false,'crm_writes_performed',false);
end;$$;

-- Every human decision is immutable and requires a review note and independent source evidence
-- for any accepted cross-record link. Only a verified reviewer can alter canonical matching.
create or replace function public.studio_reconciliation_record_review(
  p_reviewer_id uuid,p_candidate_id uuid,p_action text,
  p_visibility_id uuid,p_audit_id uuid,p_reason text,p_evidence_url text
) returns jsonb language plpgsql security invoker set search_path = ''
as $$
declare v_case public.studio_reconciliation_cases%rowtype;
begin
  if not exists(select 1 from public.platform_admins
                 where user_id=p_reviewer_id and active and role in ('owner','admin'))
  then raise exception 'Platform reviewer role required'; end if;
  if p_action not in ('approve_visibility_match','reject_suggestion','needs_evidence','reopen')
  then raise exception 'Unknown review action'; end if;
  if char_length(trim(coalesce(p_reason,''))) < 40 then raise exception 'Review evidence note too short'; end if;

  select * into v_case from public.studio_reconciliation_cases
    where candidate_id=p_candidate_id for update;
  if not found then raise exception 'Candidate is not in the review queue'; end if;
  if p_action='reopen' then
    if v_case.review_status not in ('approved','rejected','needs_evidence') then raise exception 'Not a reviewed case'; end if;
  elsif v_case.review_status in ('approved','rejected') then
    raise exception 'Already decided; reopen separately with evidence'; end if;

  if p_action='approve_visibility_match' then
    if p_visibility_id is null then raise exception 'A specific verified visibility target is required'; end if;
    if p_evidence_url is null or p_evidence_url !~ '^https://[^[:space:]]+$'
    then raise exception 'Independent HTTPS evidence URL required'; end if;
    if exists(select 1 from public.studio_identity_matches m
              where m.candidate_id=p_candidate_id and m.status='accepted' and m.studio_id<>p_visibility_id)
    then raise exception 'Conflicting accepted studio match'; end if;
    -- A manual registry match does NOT imply a verified physical studio, owner or public listing.
    if not exists(select 1 from public.studio_identity_matches m
                  where m.candidate_id=p_candidate_id and m.studio_id=p_visibility_id and m.status='accepted') then
      insert into public.studio_identity_matches(
        candidate_id,studio_id,match_method,match_score,evidence,status,reviewed_by,reviewed_at
      ) values (
        p_candidate_id,p_visibility_id,'manual_review',null,
        jsonb_build_object('review_note',trim(p_reason),'evidence_url',p_evidence_url,
                           'classification','human_approved_identity_not_verified_premises'),
        'accepted',p_reviewer_id,now()
      );
    end if;
    update public.studio_candidates set
       identity_status='matched',matched_studio_id=p_visibility_id,reviewed_at=now(),
       updated_at=now()
    where id=p_candidate_id;
  end if;

  insert into public.studio_reconciliation_decisions(
    candidate_id,visibility_studio_id,audit_studio_id,action,reviewer_id,reason,evidence_url
  ) values(p_candidate_id,p_visibility_id,p_audit_id,p_action,p_reviewer_id,trim(p_reason),p_evidence_url);

  update public.studio_reconciliation_cases set
    review_status=case p_action when 'approve_visibility_match' then 'approved'
                                when 'reject_suggestion' then 'rejected'
                                when 'needs_evidence' then 'needs_evidence'
                                when 'reopen' then 'unreviewed' end,
    reviewer_id=p_reviewer_id,reviewed_at=now(),review_note=trim(p_reason),
    review_evidence_url=p_evidence_url,refreshed_at=now()
  where candidate_id=p_candidate_id;
  return jsonb_build_object('ok',true,'candidate_id',p_candidate_id,'action',p_action,
       'studio_location_verified',false,'owner_verified',false,'atlas_published',false);
end;$$;

-- No client-exposed functions. Gateway uses existing service role and platform_admins.
revoke all on function public.studio_reconciliation_refresh(uuid) from PUBLIC,anon,authenticated;
revoke all on function public.studio_reconciliation_record_review(uuid,uuid,text,uuid,uuid,text,text)
  from PUBLIC,anon,authenticated;
grant execute on function public.studio_reconciliation_refresh(uuid) to service_role;
grant execute on function public.studio_reconciliation_record_review(uuid,uuid,text,uuid,uuid,text,text) to service_role;
