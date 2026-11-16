-- Published-studio location evidence and approved public sharing.
alter table public.atlas_profiles add column if not exists premises_verified_until timestamptz;
alter table public.atlas_profiles add column if not exists premises_reviewed_by uuid references auth.users(id);
alter table public.atlas_profiles add column if not exists owner_public_location_confirmed boolean not null default false;
create table if not exists public.atlas_publication_reviews (
 id uuid primary key default gen_random_uuid(), profile_id uuid not null references public.atlas_profiles(id) on delete restrict,
 reviewer_id uuid not null references auth.users(id),decision text not null check (decision in ('publish','suspend','approve_draft','reject_draft')),
 source_url text,evidence_note text not null check(length(evidence_note) between 40 and 2000),
 profile_draft_id uuid references public.atlas_profile_drafts(id),reviewed_at timestamptz not null default now()
);
alter table public.atlas_publication_reviews enable row level security;
revoke all on public.atlas_publication_reviews from PUBLIC,anon,authenticated;
CREATE OR REPLACE FUNCTION private.atlas_review_publication(p_actor_id uuid, p_profile_id uuid, p_action text, p_evidence_note text, p_source_url text DEFAULT NULL::text, p_latitude double precision DEFAULT NULL::double precision, p_longitude double precision DEFAULT NULL::double precision, p_public_address text DEFAULT NULL::text, p_owner_public_location_confirmed boolean DEFAULT false, p_draft_id uuid DEFAULT NULL::uuid)
 RETURNS jsonb
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO ''
AS $function$
declare
  p public.atlas_profiles%rowtype;
  d public.atlas_profile_drafts%rowtype;
begin
 if not exists(select 1 from public.platform_admins where user_id=p_actor_id and active=true and role in ('owner','admin'))
 then raise exception 'Reviewer not authorised'; end if;
 if p_action not in ('publish','suspend','approve_draft','reject_draft')
 then raise exception 'Invalid publication action'; end if;
 if length(trim(coalesce(p_evidence_note,''))) < 40 then raise exception 'Independent review notes required'; end if;
 select * into p from public.atlas_profiles where id=p_profile_id for update;
 if not found then raise exception 'Unknown studio profile'; end if;
 if p_action='publish' then
   if p_latitude is null or p_longitude is null or p_latitude not between 49 and 61 or p_longitude not between -9 and 3
   then raise exception 'Verified UK coordinates required'; end if;
   if p_owner_public_location_confirmed is distinct from true
   then raise exception 'Confirmed public location permission required'; end if;
   if p_source_url is null or p_source_url not like 'https://%'
   then raise exception 'Independent HTTPS evidence URL required'; end if;
   if length(trim(coalesce(p_public_address,''))) < 6
   then raise exception 'Public trading address required'; end if;
   update public.atlas_profiles
   set latitude=p_latitude,longitude=p_longitude,public_address=trim(p_public_address),
       premises_verified_at=now(),premises_verified_until=now()+interval '12 months',
       premises_reviewed_by=p_actor_id,owner_public_location_confirmed=true,
       listing_status='published',published_at=now(),reviewed_by=p_actor_id,updated_at=now()
   where id=p.id;
 elsif p_action='suspend' then
   update public.atlas_profiles set listing_status='suspended',updated_at=now(),reviewed_by=p_actor_id where id=p.id;
 else
   if p_draft_id is null then raise exception 'Missing profile draft'; end if;
   select * into d from public.atlas_profile_drafts where id=p_draft_id and studio_id=p.studio_id for update;
   if not found or d.status<>'pending_review' then raise exception 'Draft unavailable for review'; end if;
   if p_action='approve_draft' then
     update public.atlas_profiles set about=d.about,website_url=d.website_url,
       instagram_url=d.instagram_url, styles=d.styles,updated_at=now(),reviewed_by=p_actor_id
     where id=p.id;
     update public.atlas_profile_drafts set status='published',reviewed_at=now() where id=d.id;
   else
     update public.atlas_profile_drafts set status='rejected',reviewed_at=now() where id=d.id;
   end if;
 end if;
 insert into public.atlas_publication_reviews(profile_id,reviewer_id,decision,source_url,evidence_note,profile_draft_id)
 values(p.id,p_actor_id,p_action,p_source_url,trim(p_evidence_note),p_draft_id);
 return jsonb_build_object('ok',true,'action',p_action,'profile_id',p.id);
end;$function$
;

CREATE OR REPLACE FUNCTION public.atlas_admin_review_publication(p_actor_id uuid, p_profile_id uuid, p_action text, p_evidence_note text, p_source_url text DEFAULT NULL::text, p_latitude double precision DEFAULT NULL::double precision, p_longitude double precision DEFAULT NULL::double precision, p_public_address text DEFAULT NULL::text, p_owner_public_location_confirmed boolean DEFAULT false, p_draft_id uuid DEFAULT NULL::uuid)
 RETURNS jsonb
 LANGUAGE sql
 SET search_path TO ''
AS $function$ select private.atlas_review_publication(
 p_actor_id,p_profile_id,p_action,p_evidence_note,p_source_url,p_latitude,p_longitude,p_public_address,p_owner_public_location_confirmed,p_draft_id
); $function$
;

revoke all on function private.atlas_review_publication(uuid,uuid,text,text,text,double precision,double precision,text,boolean,uuid) from PUBLIC,anon,authenticated;
grant execute on function private.atlas_review_publication(uuid,uuid,text,text,text,double precision,double precision,text,boolean,uuid) to service_role;
revoke all on function public.atlas_admin_review_publication(uuid,uuid,text,text,text,double precision,double precision,text,boolean,uuid) from PUBLIC,anon,authenticated;
grant execute on function public.atlas_admin_review_publication(uuid,uuid,text,text,text,double precision,double precision,text,boolean,uuid) to service_role;
drop policy if exists "atlas_public_published_profiles" on public.atlas_profiles;
create policy "atlas_public_published_profiles" on public.atlas_profiles
 for select to anon,authenticated using (
 listing_status='published' and premises_verified_at is not null and published_at is not null
 and premises_verified_until>now() and owner_public_location_confirmed=true
);
