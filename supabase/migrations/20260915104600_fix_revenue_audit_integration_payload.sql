create or replace function integration.enqueue_revenue_audit_lead()
returns trigger
language plpgsql
set search_path = pg_catalog, public, integration
as $$
begin
  insert into integration.outbox (
    destination_provider, environment, event_type, aggregate_type, aggregate_id, payload, idempotency_key
  ) values (
    'hubspot', 'production', 'hubspot.crm_upsert', 'revenue_audit_lead', new.id,
    jsonb_build_object(
      'revenue_audit_lead_id', new.id,
      'name', new.name,
      'email', new.email,
      'studio_name', new.studio_name,
      'website', new.website,
      'area', new.area,
      'team_size', new.team_size,
      'primary_problem', new.primary_problem,
      'source', new.source,
      'status', new.status,
      'marketing_consent', new.marketing_consent,
      'consent_at', new.consent_at
    ),
    'revenue_audit_lead:' || new.id::text || ':created'
  ) on conflict do nothing;
  return new;
end;
$$;
