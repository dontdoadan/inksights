alter table public.intelligence_calculation_runs
  add constraint intelligence_calculation_runs_id_studio_key unique (id, studio_id);

alter table public.intelligence_economic_opportunities
  drop constraint intelligence_economic_opportunities_calculation_run_id_fkey;

alter table public.intelligence_economic_opportunities
  add constraint intelligence_economic_opportunities_run_studio_fkey
  foreign key (calculation_run_id, studio_id)
  references public.intelligence_calculation_runs(id, studio_id)
  on delete cascade;
