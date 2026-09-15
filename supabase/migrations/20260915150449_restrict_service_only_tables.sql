do $$
declare
  service_tables text[] := array[
    'intelligence_diagnostic_questions',
    'intelligence_diagnostic_templates',
    'intelligence_source_registry',
    'intelligence_taxonomy',
    'orders',
    'public_contact_requests',
    'public_endpoint_rate_limits',
    'revenue_audits',
    'studio_aliases',
    'studio_candidates',
    'studio_change_events',
    'studio_identity_matches',
    'studio_source_observations',
    'studio_sources',
    'studio_verification_events',
    'visibility_provider_configs'
  ];
  t text;
begin
  foreach t in array service_tables
  loop
    execute format('revoke all on table public.%I from public, anon, authenticated', t);
    execute format('grant select, insert, update, delete on table public.%I to service_role', t);
  end loop;
end
$$;
