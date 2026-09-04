create index if not exists idx_studio_members_user_active on public.studio_members(user_id, active);

-- Wrap auth.uid() as a statement-stable subquery so PostgreSQL does not re-evaluate it per row.
drop policy if exists "studio members can read own memberships" on public.studio_members;
create policy "studio members can read own memberships" on public.studio_members for select to authenticated using (user_id = (select auth.uid()));

drop policy if exists "visibility studios tenant access" on public.visibility_studios;
create policy "visibility studios tenant access" on public.visibility_studios for all to authenticated using (exists (select 1 from public.studio_members m where m.studio_id = visibility_studios.id and m.user_id = (select auth.uid()) and m.active)) with check (exists (select 1 from public.studio_members m where m.studio_id = visibility_studios.id and m.user_id = (select auth.uid()) and m.active));

drop policy if exists "visibility keywords tenant access" on public.visibility_keywords;
create policy "visibility keywords tenant access" on public.visibility_keywords for all to authenticated using (exists (select 1 from public.studio_members m where m.studio_id = visibility_keywords.studio_id and m.user_id = (select auth.uid()) and m.active)) with check (exists (select 1 from public.studio_members m where m.studio_id = visibility_keywords.studio_id and m.user_id = (select auth.uid()) and m.active));

drop policy if exists "visibility competitors tenant access" on public.visibility_competitors;
create policy "visibility competitors tenant access" on public.visibility_competitors for all to authenticated using (exists (select 1 from public.studio_members m where m.studio_id = visibility_competitors.studio_id and m.user_id = (select auth.uid()) and m.active)) with check (exists (select 1 from public.studio_members m where m.studio_id = visibility_competitors.studio_id and m.user_id = (select auth.uid()) and m.active));

drop policy if exists "visibility observations tenant access" on public.visibility_observations;
create policy "visibility observations tenant access" on public.visibility_observations for all to authenticated using (exists (select 1 from public.studio_members m where m.studio_id = visibility_observations.studio_id and m.user_id = (select auth.uid()) and m.active)) with check (exists (select 1 from public.studio_members m where m.studio_id = visibility_observations.studio_id and m.user_id = (select auth.uid()) and m.active));

drop policy if exists "visibility opportunities tenant access" on public.visibility_opportunities;
create policy "visibility opportunities tenant access" on public.visibility_opportunities for all to authenticated using (exists (select 1 from public.studio_members m where m.studio_id = visibility_opportunities.studio_id and m.user_id = (select auth.uid()) and m.active)) with check (exists (select 1 from public.studio_members m where m.studio_id = visibility_opportunities.studio_id and m.user_id = (select auth.uid()) and m.active));

drop policy if exists "visibility report runs tenant access" on public.visibility_report_runs;
create policy "visibility report runs tenant access" on public.visibility_report_runs for all to authenticated using (exists (select 1 from public.studio_members m where m.studio_id = visibility_report_runs.studio_id and m.user_id = (select auth.uid()) and m.active)) with check (exists (select 1 from public.studio_members m where m.studio_id = visibility_report_runs.studio_id and m.user_id = (select auth.uid()) and m.active));

drop policy if exists "visibility pipeline runs tenant access" on public.visibility_pipeline_runs;
create policy "visibility pipeline runs tenant access" on public.visibility_pipeline_runs for all to authenticated using (exists (select 1 from public.studio_members m where m.studio_id = visibility_pipeline_runs.studio_id and m.user_id = (select auth.uid()) and m.active)) with check (exists (select 1 from public.studio_members m where m.studio_id = visibility_pipeline_runs.studio_id and m.user_id = (select auth.uid()) and m.active));

drop policy if exists "visibility report snapshots tenant access" on public.visibility_report_snapshots;
create policy "visibility report snapshots tenant access" on public.visibility_report_snapshots for all to authenticated using (exists (select 1 from public.visibility_report_runs r join public.studio_members m on m.studio_id = r.studio_id where r.id = visibility_report_snapshots.report_run_id and m.user_id = (select auth.uid()) and m.active)) with check (exists (select 1 from public.visibility_report_runs r join public.studio_members m on m.studio_id = r.studio_id where r.id = visibility_report_snapshots.report_run_id and m.user_id = (select auth.uid()) and m.active));

drop policy if exists "visibility capabilities tenant access" on public.visibility_studio_capabilities;
create policy "visibility capabilities tenant access" on public.visibility_studio_capabilities for all to authenticated using (exists (select 1 from public.studio_members m where m.studio_id = visibility_studio_capabilities.studio_id and m.user_id = (select auth.uid()) and m.active)) with check (exists (select 1 from public.studio_members m where m.studio_id = visibility_studio_capabilities.studio_id and m.user_id = (select auth.uid()) and m.active));

drop policy if exists "visibility search universe tenant access" on public.visibility_search_universe;
create policy "visibility search universe tenant access" on public.visibility_search_universe for all to authenticated using (exists (select 1 from public.studio_members m where m.studio_id = visibility_search_universe.studio_id and m.user_id = (select auth.uid()) and m.active)) with check (exists (select 1 from public.studio_members m where m.studio_id = visibility_search_universe.studio_id and m.user_id = (select auth.uid()) and m.active));

drop policy if exists "visibility provider observations tenant access" on public.visibility_provider_observations;
create policy "visibility provider observations tenant access" on public.visibility_provider_observations for all to authenticated using (exists (select 1 from public.studio_members m where m.studio_id = visibility_provider_observations.studio_id and m.user_id = (select auth.uid()) and m.active)) with check (exists (select 1 from public.studio_members m where m.studio_id = visibility_provider_observations.studio_id and m.user_id = (select auth.uid()) and m.active));

drop policy if exists "visibility serp tenant access" on public.visibility_serp_observations;
create policy "visibility serp tenant access" on public.visibility_serp_observations for all to authenticated using (exists (select 1 from public.studio_members m where m.studio_id = visibility_serp_observations.studio_id and m.user_id = (select auth.uid()) and m.active)) with check (exists (select 1 from public.studio_members m where m.studio_id = visibility_serp_observations.studio_id and m.user_id = (select auth.uid()) and m.active));

drop policy if exists "visibility competitor observations tenant access" on public.visibility_competitor_observations;
create policy "visibility competitor observations tenant access" on public.visibility_competitor_observations for all to authenticated using (exists (select 1 from public.studio_members m where m.studio_id = visibility_competitor_observations.studio_id and m.user_id = (select auth.uid()) and m.active)) with check (exists (select 1 from public.studio_members m where m.studio_id = visibility_competitor_observations.studio_id and m.user_id = (select auth.uid()) and m.active));
