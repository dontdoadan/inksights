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

  if new.input_summary ? 'styles' then
    for v_item in select jsonb_array_elements_text(coalesce(new.input_summary->'styles','[]'::jsonb)) loop
      v_normalized := lower(trim(regexp_replace(v_item,'\s+',' ','g')));
      if v_normalized = '' then continue; end if;
      insert into public.visibility_studio_capabilities(studio_id,dimension,value,normalized_value,source_type,evidence)
      values(new.studio_id,'style',trim(v_item),v_normalized,'studio_submitted',jsonb_build_object('report_run_id',new.id))
      on conflict (studio_id,dimension,normalized_value) do update set updated_at=now();
    end loop;
  end if;

  if new.input_summary ? 'subjects' then
    for v_item in select jsonb_array_elements_text(coalesce(new.input_summary->'subjects','[]'::jsonb)) loop
      v_normalized := lower(trim(regexp_replace(v_item,'\s+',' ','g')));
      if v_normalized = '' then continue; end if;
      insert into public.visibility_studio_capabilities(studio_id,dimension,value,normalized_value,source_type,evidence)
      values(new.studio_id,'subject',trim(v_item),v_normalized,'studio_submitted',jsonb_build_object('report_run_id',new.id))
      on conflict (studio_id,dimension,normalized_value) do update set updated_at=now();
    end loop;
  end if;

  if new.input_summary ? 'body_areas' then
    for v_item in select jsonb_array_elements_text(coalesce(new.input_summary->'body_areas','[]'::jsonb)) loop
      v_normalized := lower(trim(regexp_replace(v_item,'\s+',' ','g')));
      if v_normalized = '' then continue; end if;
      insert into public.visibility_studio_capabilities(studio_id,dimension,value,normalized_value,source_type,evidence)
      values(new.studio_id,'body_area',trim(v_item),v_normalized,'studio_submitted',jsonb_build_object('report_run_id',new.id))
      on conflict (studio_id,dimension,normalized_value) do update set updated_at=now();
    end loop;
  end if;

  if new.input_summary ? 'problem_needs' then
    for v_item in select jsonb_array_elements_text(coalesce(new.input_summary->'problem_needs','[]'::jsonb)) loop
      v_normalized := lower(trim(regexp_replace(v_item,'\s+',' ','g')));
      if v_normalized = '' then continue; end if;
      insert into public.visibility_studio_capabilities(studio_id,dimension,value,normalized_value,source_type,evidence)
      values(new.studio_id,'problem_need',trim(v_item),v_normalized,'studio_submitted',jsonb_build_object('report_run_id',new.id))
      on conflict (studio_id,dimension,normalized_value) do update set updated_at=now();
    end loop;
  end if;

  if new.input_summary ? 'customer_types' then
    for v_item in select jsonb_array_elements_text(coalesce(new.input_summary->'customer_types','[]'::jsonb)) loop
      v_normalized := lower(trim(regexp_replace(v_item,'\s+',' ','g')));
      if v_normalized = '' then continue; end if;
      insert into public.visibility_studio_capabilities(studio_id,dimension,value,normalized_value,source_type,evidence)
      values(new.studio_id,'customer_type',trim(v_item),v_normalized,'studio_submitted',jsonb_build_object('report_run_id',new.id))
      on conflict (studio_id,dimension,normalized_value) do update set updated_at=now();
    end loop;
  end if;

  insert into public.visibility_studio_capabilities(studio_id,dimension,value,normalized_value,source_type,evidence)
  values(new.studio_id,'geographic',coalesce((select town from public.visibility_studios where id=new.studio_id),'local area'),lower(coalesce((select town from public.visibility_studios where id=new.studio_id),'local area')),'studio_submitted',jsonb_build_object('report_run_id',new.id))
  on conflict (studio_id,dimension,normalized_value) do update set updated_at=now();

  perform public.generate_studio_search_universe(new.studio_id,new.id);

  update public.visibility_search_universe
  set lsos = 0,
      ranking_opportunity = 0,
      status = 'candidate',
      dimension_values = coalesce(dimension_values,'{}'::jsonb) || jsonb_build_object(
        'demand_measured', false,
        'rank_measured', false,
        'score_state', 'unscored_pending_observation'
      ),
      updated_at = now()
  where report_run_id = new.id
    and source_type = 'inksights_generated';

  return new;
end;
$$;

revoke all on function public.seed_visibility_capabilities_from_report() from public;
