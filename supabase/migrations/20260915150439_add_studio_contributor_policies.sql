grant insert, update on table public.intelligence_decisions to authenticated;
grant insert, update on table public.intelligence_interventions to authenticated;

drop policy if exists "decisions studio contributors insert" on public.intelligence_decisions;
create policy "decisions studio contributors insert"
on public.intelligence_decisions
for insert
to authenticated
with check (
  exists (
    select 1 from public.studio_members m
    where m.studio_id = intelligence_decisions.studio_id
      and m.user_id = (select auth.uid())
      and m.active
      and m.role in ('owner','admin','member')
  )
);

drop policy if exists "decisions studio contributors update" on public.intelligence_decisions;
create policy "decisions studio contributors update"
on public.intelligence_decisions
for update
to authenticated
using (
  exists (
    select 1 from public.studio_members m
    where m.studio_id = intelligence_decisions.studio_id
      and m.user_id = (select auth.uid())
      and m.active
      and m.role in ('owner','admin','member')
  )
)
with check (
  exists (
    select 1 from public.studio_members m
    where m.studio_id = intelligence_decisions.studio_id
      and m.user_id = (select auth.uid())
      and m.active
      and m.role in ('owner','admin','member')
  )
);

drop policy if exists "interventions studio contributors insert" on public.intelligence_interventions;
create policy "interventions studio contributors insert"
on public.intelligence_interventions
for insert
to authenticated
with check (
  exists (
    select 1 from public.studio_members m
    where m.studio_id = intelligence_interventions.studio_id
      and m.user_id = (select auth.uid())
      and m.active
      and m.role in ('owner','admin','member')
  )
);

drop policy if exists "interventions studio contributors update" on public.intelligence_interventions;
create policy "interventions studio contributors update"
on public.intelligence_interventions
for update
to authenticated
using (
  exists (
    select 1 from public.studio_members m
    where m.studio_id = intelligence_interventions.studio_id
      and m.user_id = (select auth.uid())
      and m.active
      and m.role in ('owner','admin','member')
  )
)
with check (
  exists (
    select 1 from public.studio_members m
    where m.studio_id = intelligence_interventions.studio_id
      and m.user_id = (select auth.uid())
      and m.active
      and m.role in ('owner','admin','member')
  )
);

revoke all on table public.studio_members from anon, authenticated;
grant select on table public.studio_members to authenticated;
