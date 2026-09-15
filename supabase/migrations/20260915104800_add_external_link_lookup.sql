create or replace function public.integration_get_external_link(
  p_provider_key text,
  p_environment text,
  p_canonical_entity_type text,
  p_canonical_entity_id uuid,
  p_external_object_type text
)
returns jsonb
language sql
security invoker
set search_path = pg_catalog, public, integration
as $$
  select jsonb_build_object(
    'id', l.id,
    'external_object_id', l.external_object_id,
    'link_status', l.link_status,
    'metadata', l.metadata,
    'last_verified_at', l.last_verified_at
  )
  from integration.external_object_links l
  where l.business_key = 'inksights_b2b'
    and l.provider_key = lower(trim(p_provider_key))
    and l.environment = lower(trim(p_environment))
    and l.canonical_entity_type = p_canonical_entity_type
    and l.canonical_entity_id = p_canonical_entity_id
    and l.external_object_type = p_external_object_type
  limit 1;
$$;

revoke all on function public.integration_get_external_link(text,text,text,uuid,text) from public, anon, authenticated;
grant execute on function public.integration_get_external_link(text,text,text,uuid,text) to service_role;
