alter table public.visibility_studios alter column average_booking_value_pence drop not null;
alter table public.visibility_studios alter column monthly_search_to_booking_rate drop not null;
alter table public.visibility_opportunities alter column estimated_monthly_clicks drop not null;
alter table public.visibility_opportunities alter column estimated_monthly_enquiries drop not null;
alter table public.visibility_opportunities alter column estimated_monthly_revenue_pence drop not null;
alter table public.visibility_report_runs add column if not exists public_token text;
alter table public.visibility_report_runs add column if not exists contact_name text;
alter table public.visibility_report_runs add column if not exists contact_email text;
alter table public.visibility_report_runs add column if not exists input_summary jsonb not null default '{}'::jsonb;
create unique index if not exists visibility_report_runs_public_token_uidx on public.visibility_report_runs(public_token) where public_token is not null;

create or replace function public.publish_visibility_report(p_report_id uuid, p_public_token text)
returns jsonb language plpgsql security definer set search_path = public, pg_catalog as $$
declare r public.visibility_report_runs; s public.visibility_studios; obs jsonb; kws jsonb; opps jsonb;
begin
  select * into r from public.visibility_report_runs where id=p_report_id and public_token=p_public_token and status='published';
  if not found then raise exception 'report_not_found'; end if;
  select * into s from public.visibility_studios where id=r.studio_id;
  select coalesce(jsonb_agg(to_jsonb(o) order by o.observed_at desc),'[]'::jsonb) into obs from public.visibility_observations o where o.studio_id=r.studio_id;
  select coalesce(jsonb_agg(to_jsonb(k) order by k.search_volume desc),'[]'::jsonb) into kws from public.visibility_keywords k where k.studio_id=r.studio_id;
  select coalesce(jsonb_agg(to_jsonb(o) order by o.priority),'[]'::jsonb) into opps from public.visibility_opportunities o where o.studio_id=r.studio_id;
  return jsonb_build_object('report',to_jsonb(r),'studio',to_jsonb(s),'observations',obs,'keywords',kws,'opportunities',opps);
end; $$;
revoke all on function public.publish_visibility_report(uuid,text) from public, authenticated;
grant execute on function public.publish_visibility_report(uuid,text) to anon;
