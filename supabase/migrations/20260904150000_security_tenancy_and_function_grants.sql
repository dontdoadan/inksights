-- INKSIGHTS security remediation
-- Establishes the minimum tenant boundary for authenticated studio data.

create table if not exists public.studio_members (
  studio_id uuid not null references public.visibility_studios(id) on delete cascade,
  user_id uuid not null references auth.users(id) on delete cascade,
  role text not null default 'member' check (role in ('owner','admin','member','viewer')),
  active boolean not null default true,
  created_at timestamptz not null default now(),
  primary key (studio_id, user_id)
);

alter table public.studio_members enable row level security;
drop policy if exists "studio members can read own memberships" on public.studio_members;
create policy "studio members can read own memberships" on public.studio_members for select to authenticated using (user_id = auth.uid());

revoke all on function public.generate_studio_search_universe(uuid, uuid) from public, anon, authenticated;
revoke all on function public.generate_visibility_report(uuid) from public, anon, authenticated;
grant execute on function public.generate_studio_search_universe(uuid, uuid) to service_role;
grant execute on function public.generate_visibility_report(uuid) to service_role;
revoke all on function public.seed_visibility_capabilities_from_report() from public, anon, authenticated;
revoke all on function public.publish_visibility_report(uuid, text) from public, authenticated;
grant execute on function public.publish_visibility_report(uuid, text) to anon;

-- Remove legacy blanket authenticated policies before applying tenant-scoped policies.
drop policy if exists "authenticated users can manage visibility studios" on public.visibility_studios;
drop policy if exists "authenticated users can manage visibility keywords" on public.visibility_keywords;
drop policy if exists "authenticated users can manage visibility competitors" on public.visibility_competitors;
drop policy if exists "authenticated users can manage visibility observations" on public.visibility_observations;
drop policy if exists "authenticated users can manage visibility opportunities" on public.visibility_opportunities;
drop policy if exists "authenticated users can manage visibility reports" on public.visibility_report_runs;
drop policy if exists "authenticated users can manage visibility pipeline" on public.visibility_pipeline_runs;
drop policy if exists "authenticated users can manage visibility snapshots" on public.visibility_report_snapshots;

drop policy if exists "visibility studios tenant access" on public.visibility_studios;
create policy "visibility studios tenant access" on public.visibility_studios for all to authenticated using (exists (select 1 from public.studio_members m where m.studio_id = visibility_studios.id and m.user_id = auth.uid() and m.active)) with check (exists (select 1 from public.studio_members m where m.studio_id = visibility_studios.id and m.user_id = auth.uid() and m.active));

drop policy if exists "visibility keywords tenant access" on public.visibility_keywords;
create policy "visibility keywords tenant access" on public.visibility_keywords for all to authenticated using (exists (select 1 from public.studio_members m where m.studio_id = visibility_keywords.studio_id and m.user_id = auth.uid() and m.active)) with check (exists (select 1 from public.studio_members m where m.studio_id = visibility_keywords.studio_id and m.user_id = auth.uid() and m.active));

drop policy if exists "visibility competitors tenant access" on public.visibility_competitors;
create policy "visibility competitors tenant access" on public.visibility_competitors for all to authenticated using (exists (select 1 from public.studio_members m where m.studio_id = visibility_competitors.studio_id and m.user_id = auth.uid() and m.active)) with check (exists (select 1 from public.studio_members m where m.studio_id = visibility_competitors.studio_id and m.user_id = auth.uid() and m.active));

drop policy if exists "visibility observations tenant access" on public.visibility_observations;
create policy "visibility observations tenant access" on public.visibility_observations for all to authenticated using (exists (select 1 from public.studio_members m where m.studio_id = visibility_observations.studio_id and m.user_id = auth.uid() and m.active)) with check (exists (select 1 from public.studio_members m where m.studio_id = visibility_observations.studio_id and m.user_id = auth.uid() and m.active));

drop policy if exists "visibility opportunities tenant access" on public.visibility_opportunities;
create policy "visibility opportunities tenant access" on public.visibility_opportunities for all to authenticated using (exists (select 1 from public.studio_members m where m.studio_id = visibility_opportunities.studio_id and m.user_id = auth.uid() and m.active)) with check (exists (select 1 from public.studio_members m where m.studio_id = visibility_opportunities.studio_id and m.user_id = auth.uid() and m.active));

drop policy if exists "visibility report runs tenant access" on public.visibility_report_runs;
create policy "visibility report runs tenant access" on public.visibility_report_runs for all to authenticated using (exists (select 1 from public.studio_members m where m.studio_id = visibility_report_runs.studio_id and m.user_id = auth.uid() and m.active)) with check (exists (select 1 from public.studio_members m where m.studio_id = visibility_report_runs.studio_id and m.user_id = auth.uid() and m.active));

drop policy if exists "visibility pipeline runs tenant access" on public.visibility_pipeline_runs;
create policy "visibility pipeline runs tenant access" on public.visibility_pipeline_runs for all to authenticated using (exists (select 1 from public.studio_members m where m.studio_id = visibility_pipeline_runs.studio_id and m.user_id = auth.uid() and m.active)) with check (exists (select 1 from public.studio_members m where m.studio_id = visibility_pipeline_runs.studio_id and m.user_id = auth.uid() and m.active));

drop policy if exists "visibility report snapshots tenant access" on public.visibility_report_snapshots;
create policy "visibility report snapshots tenant access" on public.visibility_report_snapshots for all to authenticated using (exists (select 1 from public.visibility_report_runs r join public.studio_members m on m.studio_id = r.studio_id where r.id = visibility_report_snapshots.report_run_id and m.user_id = auth.uid() and m.active)) with check (exists (select 1 from public.visibility_report_runs r join public.studio_members m on m.studio_id = r.studio_id where r.id = visibility_report_snapshots.report_run_id and m.user_id = auth.uid() and m.active));

drop policy if exists "visibility capabilities tenant access" on public.visibility_studio_capabilities;
create policy "visibility capabilities tenant access" on public.visibility_studio_capabilities for all to authenticated using (exists (select 1 from public.studio_members m where m.studio_id = visibility_studio_capabilities.studio_id and m.user_id = auth.uid() and m.active)) with check (exists (select 1 from public.studio_members m where m.studio_id = visibility_studio_capabilities.studio_id and m.user_id = auth.uid() and m.active));

drop policy if exists "visibility search universe tenant access" on public.visibility_search_universe;
create policy "visibility search universe tenant access" on public.visibility_search_universe for all to authenticated using (exists (select 1 from public.studio_members m where m.studio_id = visibility_search_universe.studio_id and m.user_id = auth.uid() and m.active)) with check (exists (select 1 from public.studio_members m where m.studio_id = visibility_search_universe.studio_id and m.user_id = auth.uid() and m.active));

drop policy if exists "visibility provider observations tenant access" on public.visibility_provider_observations;
create policy "visibility provider observations tenant access" on public.visibility_provider_observations for all to authenticated using (exists (select 1 from public.studio_members m where m.studio_id = visibility_provider_observations.studio_id and m.user_id = auth.uid() and m.active)) with check (exists (select 1 from public.studio_members m where m.studio_id = visibility_provider_observations.studio_id and m.user_id = auth.uid() and m.active));

drop policy if exists "visibility serp tenant access" on public.visibility_serp_observations;
create policy "visibility serp tenant access" on public.visibility_serp_observations for all to authenticated using (exists (select 1 from public.studio_members m where m.studio_id = visibility_serp_observations.studio_id and m.user_id = auth.uid() and m.active)) with check (exists (select 1 from public.studio_members m where m.studio_id = visibility_serp_observations.studio_id and m.user_id = auth.uid() and m.active));

drop policy if exists "visibility competitor observations tenant access" on public.visibility_competitor_observations;
create policy "visibility competitor observations tenant access" on public.visibility_competitor_observations for all to authenticated using (exists (select 1 from public.studio_members m where m.studio_id = visibility_competitor_observations.studio_id and m.user_id = auth.uid() and m.active)) with check (exists (select 1 from public.studio_members m where m.studio_id = visibility_competitor_observations.studio_id and m.user_id = auth.uid() and m.active));

-- Server-only tables. service_role bypasses RLS, but explicit policies document intent.
drop policy if exists "revenue audit leads service role only" on public.revenue_audit_leads;
create policy "revenue audit leads service role only" on public.revenue_audit_leads for all to service_role using (true) with check (true);
drop policy if exists "revenue audits service role only" on public.revenue_audits;
create policy "revenue audits service role only" on public.revenue_audits for all to service_role using (true) with check (true);
drop policy if exists "visibility provider configs service role only" on public.visibility_provider_configs;
create policy "visibility provider configs service role only" on public.visibility_provider_configs for all to service_role using (true) with check (true);
