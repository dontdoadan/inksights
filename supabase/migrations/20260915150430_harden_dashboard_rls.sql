do $$
declare
  r record;
  dashboard_tables text[] := array[
    'intelligence_attributions','intelligence_business_profiles','intelligence_decisions','intelligence_diagnoses','intelligence_evidence','intelligence_findings','intelligence_growth_diagnostics','intelligence_interventions','intelligence_learning','intelligence_metric_values','intelligence_opportunity_scores','intelligence_outcomes','intelligence_recommendations','visibility_competitor_observations','visibility_competitors','visibility_keywords','visibility_observations','visibility_opportunities','visibility_pipeline_runs','visibility_provider_observations','visibility_report_runs','visibility_report_snapshots','visibility_search_universe','visibility_serp_observations','visibility_studio_capabilities','visibility_studios'
  ];
  t text;
begin
  for r in
    select schemaname, tablename, policyname, qual
    from pg_policies
    where schemaname='public'
      and cmd='ALL'
      and tablename=any(dashboard_tables)
  loop
    execute format('drop policy %I on %I.%I', r.policyname, r.schemaname, r.tablename);
    execute format(
      'create policy %I on %I.%I for select to authenticated using (%s)',
      r.policyname,
      r.schemaname,
      r.tablename,
      r.qual
    );
  end loop;

  foreach t in array dashboard_tables
  loop
    execute format('revoke all on table public.%I from anon, authenticated', t);
    execute format('grant select on table public.%I to authenticated', t);
  end loop;
end
$$;
