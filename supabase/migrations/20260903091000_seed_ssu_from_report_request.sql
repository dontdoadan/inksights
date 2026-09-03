create or replace function public.seed_visibility_capabilities_from_report()
returns trigger
language plpgsql
security definer
set search_path = public, pg_catalog
as $$
declare
  v_item text;
  v_normalized text;
  v_style text[] := array['fine line','blackwork','black and grey','realism','realistic','japanese','neo traditional','traditional','illustrative','geometric','portrait','ornamental','lettering','colour','color','watercolour','watercolor','dotwork','tribal','micro realism'];
begin
  if new.input_summary ? 'services' then
    for v_item in select jsonb_array_elements_text(coalesce(new.input_summary->'services','[]'::jsonb)) loop
      v_normalized := lower(trim(regexp_replace(v_item,'\s+',' ','g')));
      if v_normalized = '' then continue; end if;
      insert into public.visibility_studio_capabilities(studio_id,dimension,value,normalized_value,source_type,evidence)
      values(new.studio_id,'service',trim(v_item),v_normalized,'studio_submitted',jsonb_build_object('report_run_id',new.id))
      on conflict (studio_id,dimension,normalized_value) do update set updated_at=now();
      if v_normalized = any(v_style) then
        insert into public.visibility_studio_capabilities(studio_id,dimension,value,normalized_value,source_type,evidence)
        values(new.studio_id,'style',trim(v_item),v_normalized,'studio_submitted',jsonb_build_object('report_run_id',new.id,'classification','known_style'))
        on conflict (studio_id,dimension,normalized_value) do update set updated_at=now();
      end if;
    end loop;
  end if;

  insert into public.visibility_studio_capabilities(studio_id,dimension,value,normalized_value,source_type,evidence)
  values(new.studio_id,'geographic',coalesce((select town from public.visibility_studios where id=new.studio_id),'local area'),lower(coalesce((select town from public.visibility_studios where id=new.studio_id),'local area')),'studio_submitted',jsonb_build_object('report_run_id',new.id))
  on conflict (studio_id,dimension,normalized_value) do update set updated_at=now();

  perform public.generate_studio_search_universe(new.studio_id,new.id);
  return new;
end;
$$;

create or replace trigger trg_seed_ssu_from_report_request
after insert on public.visibility_report_runs
for each row execute function public.seed_visibility_capabilities_from_report();

revoke all on function public.seed_visibility_capabilities_from_report() from public;
