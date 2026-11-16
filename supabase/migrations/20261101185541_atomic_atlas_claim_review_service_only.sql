-- Same function definitions as the applied service-only review migration.
CREATE OR REPLACE FUNCTION private.atlas_review_claim(p_claim_id uuid, p_actor_id uuid, p_decision text, p_authority_confirmed boolean, p_evidence_summary text, p_existing_studio_id uuid DEFAULT NULL::uuid, p_existing_visibility_id uuid DEFAULT NULL::uuid)
 RETURNS jsonb
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO ''
AS $function$
declare
 c public.atlas_claim_requests%rowtype;
 studio_uuid uuid;
 visibility_uuid uuid;
 studio_slug text;
 role_name text;
begin
 if not exists (
   select 1 from public.platform_admins
   where user_id = p_actor_id and active = true and role in ('owner','admin')
 ) then raise exception 'Reviewer is not authorised'; end if;
 if p_decision not in ('approve','reject','needs_evidence') then raise exception 'Invalid decision'; end if;
 if char_length(coalesce(trim(p_evidence_summary),'')) < 30 then raise exception 'A grounded review note is required'; end if;
 select * into c from public.atlas_claim_requests where id = p_claim_id for update;
 if not found then raise exception 'Claim not found'; end if;
 if c.status not in ('pending','needs_evidence') then raise exception 'Claim has already been reviewed'; end if;
 if p_decision in ('reject','needs_evidence') then
   update public.atlas_claim_requests
   set status = case when p_decision = 'reject' then 'rejected' else 'needs_evidence' end,
       reviewer_id = p_actor_id, reviewed_at = now(), updated_at = now()
   where id = p_claim_id;
   return jsonb_build_object('status',case when p_decision='reject' then 'rejected' else 'needs_evidence' end,'claim_id',p_claim_id);
 end if;

 if p_authority_confirmed is distinct from true then raise exception 'Authority confirmation is required'; end if;
 if p_existing_studio_id is not null and c.studio_id is not null and p_existing_studio_id <> c.studio_id
 then raise exception 'Studio identity conflict'; end if;

 studio_uuid := coalesce(p_existing_studio_id,c.studio_id);
 if studio_uuid is null then
   studio_uuid := gen_random_uuid();
   studio_slug := trim(both '-' from regexp_replace(lower(c.proposed_studio_name),'[^a-z0-9]+','-','g'))
     || '-' || substr(replace(studio_uuid::text,'-',''),1,8);
   insert into public.studios(id,name,slug,website_url,primary_location,internal_validation)
   values(studio_uuid,c.proposed_studio_name,studio_slug,c.proposed_website,c.proposed_town,false);
 else
   perform 1 from public.studios where id = studio_uuid;
   if not found then raise exception 'Canonical studio was not found'; end if;
 end if;

 visibility_uuid := p_existing_visibility_id;
 if visibility_uuid is null then
   select l.visibility_studio_id into visibility_uuid
   from public.atlas_studio_links l where l.studio_id = studio_uuid;
 end if;
 if visibility_uuid is null then
   insert into public.visibility_studios(studio_name,website_url,town,status,canonical_status)
   values(c.proposed_studio_name,c.proposed_website,c.proposed_town,'draft','candidate')
   returning id into visibility_uuid;
 else
   perform 1 from public.visibility_studios where id = visibility_uuid;
   if not found then raise exception 'Visibility studio was not found'; end if;
 end if;
 if exists(select 1 from public.atlas_studio_links l
   where (l.studio_id = studio_uuid and l.visibility_studio_id <> visibility_uuid)
      or (l.visibility_studio_id = visibility_uuid and l.studio_id <> studio_uuid))
 then raise exception 'Conflicting canonical/visibility identity link'; end if;

 insert into public.atlas_studio_links(studio_id,visibility_studio_id,evidence,reviewer_id)
 values(studio_uuid,visibility_uuid,jsonb_build_object('claim_id',p_claim_id,'review_note',p_evidence_summary,'classification','verified_authority_not_automatically_verified_premises'),p_actor_id)
 on conflict(studio_id) do nothing;

 role_name := case when c.authority_role in ('owner','director') then 'owner' else 'admin' end;
 insert into public.studio_members(studio_id,user_id,role,active)
 values(visibility_uuid,c.user_id,role_name,true)
 on conflict(studio_id,user_id) do update set role=excluded.role,active=true;

 insert into public.studio_verification_events
 (studio_id,verification_type,status,evidence,confidence,verified_at,expires_at,reviewer_id)
 values (visibility_uuid,'owner_claim','passed',
         jsonb_build_object('claim_id',p_claim_id,'authority_review',p_evidence_summary),
         1.0,now(),now()+interval '12 months',p_actor_id);

 update public.atlas_claim_requests
 set studio_id=studio_uuid,status='approved',reviewer_id=p_actor_id,reviewed_at=now(),updated_at=now()
 where id=p_claim_id;

 insert into public.atlas_profiles(studio_id,slug,name,town,website_url,listing_status)
 values(studio_uuid,trim(both '-' from regexp_replace(lower(c.proposed_studio_name),'[^a-z0-9]+','-','g'))
   || '-' || substr(replace(studio_uuid::text,'-',''),1,8),
   c.proposed_studio_name,c.proposed_town,c.proposed_website,'draft')
 on conflict(studio_id) do nothing;
 return jsonb_build_object('status','approved','claim_id',p_claim_id,'studio_id',studio_uuid,'visibility_studio_id',visibility_uuid);
end;$function$
;

CREATE OR REPLACE FUNCTION public.atlas_admin_review_claim(p_claim_id uuid, p_actor_id uuid, p_decision text, p_authority_confirmed boolean, p_evidence_summary text, p_existing_studio_id uuid DEFAULT NULL::uuid, p_existing_visibility_id uuid DEFAULT NULL::uuid)
 RETURNS jsonb
 LANGUAGE sql
 SET search_path TO ''
AS $function$
  select private.atlas_review_claim(p_claim_id,p_actor_id,p_decision,p_authority_confirmed,p_evidence_summary,p_existing_studio_id,p_existing_visibility_id);
$function$
;

revoke all on function private.atlas_review_claim(uuid,uuid,text,boolean,text,uuid,uuid) from PUBLIC,anon,authenticated;
grant execute on function private.atlas_review_claim(uuid,uuid,text,boolean,text,uuid,uuid) to service_role;
revoke all on function public.atlas_admin_review_claim(uuid,uuid,text,boolean,text,uuid,uuid) from PUBLIC,anon,authenticated;
grant execute on function public.atlas_admin_review_claim(uuid,uuid,text,boolean,text,uuid,uuid) to service_role;
