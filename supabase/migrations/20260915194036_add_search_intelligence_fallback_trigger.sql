create or replace function public.trigger_search_intelligence_fallback()
returns trigger
language plpgsql
set search_path = public, net, pg_catalog
as $$
declare
  v_public_token text;
  v_url text := 'https://ukaxsqwnkoqbbsufpzga.supabase.co/functions/v1/search-intelligence-fallback-v1';
begin
  if new.stage = 'search_intelligence'
     and new.status = 'blocked'
     and coalesce(new.provider, '') = 'none'
     and (old.status is distinct from new.status or old.error_message is distinct from new.error_message)
     and not exists (
       select 1
       from public.visibility_pipeline_runs existing
       where existing.report_run_id = new.report_run_id
         and existing.provider = 'duckduckgo_html'
         and existing.status in ('started', 'partial', 'success')
     )
  then
    select report.public_token
      into v_public_token
    from public.visibility_report_runs report
    where report.id = new.report_run_id
      and report.status = 'analysing';

    if v_public_token is not null then
      perform net.http_post(
        url := v_url,
        headers := '{"Content-Type":"application/json"}'::jsonb,
        body := jsonb_build_object(
          'report_run_id', new.report_run_id,
          'public_token', v_public_token
        ),
        timeout_milliseconds := 60000
      );
    end if;
  end if;

  return new;
end;
$$;

drop trigger if exists visibility_search_intelligence_fallback on public.visibility_pipeline_runs;

create trigger visibility_search_intelligence_fallback
after update of status, error_message on public.visibility_pipeline_runs
for each row
execute function public.trigger_search_intelligence_fallback();