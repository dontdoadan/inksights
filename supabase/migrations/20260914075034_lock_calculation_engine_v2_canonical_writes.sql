drop policy if exists "calculation runs tenant access" on public.intelligence_calculation_runs;
drop policy if exists "economic opportunities tenant access" on public.intelligence_economic_opportunities;

create policy "calculation runs tenant read"
  on public.intelligence_calculation_runs
  for select
  to authenticated
  using (
    exists (
      select 1
      from public.studio_members m
      where m.studio_id = intelligence_calculation_runs.studio_id
        and m.user_id = (select auth.uid())
        and m.active
    )
  );

create policy "economic opportunities tenant read"
  on public.intelligence_economic_opportunities
  for select
  to authenticated
  using (
    exists (
      select 1
      from public.studio_members m
      where m.studio_id = intelligence_economic_opportunities.studio_id
        and m.user_id = (select auth.uid())
        and m.active
    )
  );

revoke insert, update, delete on public.intelligence_calculation_runs from authenticated;
revoke insert, update, delete on public.intelligence_economic_opportunities from authenticated;
grant select on public.intelligence_calculation_runs to authenticated;
grant select on public.intelligence_economic_opportunities to authenticated;
