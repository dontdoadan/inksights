-- Read-only candidate->canonical studio match review (NEVER an UPDATE).
-- Full UK candidate research should not automatically create HubSpot deals.
-- Separate legal entity, trading brand and physical studio location.
WITH counts AS (
 SELECT jsonb_build_object(
  'candidate_rows',(SELECT count(*) FROM public.studio_candidates),
  'candidate_linked',(SELECT count(*) FROM public.studio_candidates WHERE matched_studio_id IS NOT NULL),
  'candidate_linked_verified',(SELECT count(*) FROM public.studio_candidates WHERE matched_studio_id IS NOT NULL AND identity_status='verified'),
  'site_registry_rows',(SELECT count(*) FROM public.visibility_studios),
  'operational_studio_rows',(SELECT count(*) FROM public.studios),
  'orphan_operational_studios',(SELECT count(*) FROM public.studios s
    LEFT JOIN public.visibility_studios v ON s.id=v.id WHERE v.id IS NULL),
  'duplicate_name_postcode_groups',(SELECT count(*) FROM (
    SELECT lower(coalesce(normalized_name,studio_name)),normalized_postcode,count(*) AS n
    FROM public.visibility_studios WHERE normalized_postcode IS NOT NULL
    GROUP BY 1,2 HAVING count(*)>1) d)
 ) AS summary
)
SELECT summary FROM counts;

-- Review-only, candidate records with one exact registry postcode+domain match.
-- A domain is shared by many business locations; MATCH DOES NOT EQUAL MERGE.
WITH candidate_sites AS (
 SELECT c.id AS candidate_id,c.name AS candidate_name,
   upper(regexp_replace(coalesce(c.postcode,''),'\\s','','g')) AS postcode_key,
   lower(regexp_replace(regexp_replace(coalesce(c.website_url,''),'^https?://(www\\.)?','','i'),'/.*$','','')) AS domain_key
 FROM public.studio_candidates c WHERE c.matched_studio_id IS NULL
), studio_sites AS (
 SELECT v.id AS studio_id,v.studio_name,
   upper(regexp_replace(coalesce(v.postcode,''),'\\s','','g')) AS postcode_key,
   lower(regexp_replace(regexp_replace(coalesce(v.website_url,''),'^https?://(www\\.)?','','i'),'/.*$','','')) AS domain_key
 FROM public.visibility_studios v
), scored AS (
 SELECT c.candidate_id,c.candidate_name,v.studio_id,v.studio_name,
  count(*) OVER(PARTITION BY c.candidate_id) AS candidates_for_match
 FROM candidate_sites c JOIN studio_sites v
  ON c.postcode_key=v.postcode_key AND c.domain_key=v.domain_key
 WHERE c.postcode_key<>'' AND c.domain_key<>''
)
SELECT * FROM scored ORDER BY candidates_for_match DESC,candidate_name LIMIT 50;
