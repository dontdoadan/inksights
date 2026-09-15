-- Persist the lineage needed to trace client-facing claims back to metrics, context and findings.
alter table public.audit_findings
  add column if not exists metric_keys text[] not null default '{}'::text[],
  add column if not exists context_keys text[] not null default '{}'::text[];

alter table public.audit_diagnoses
  add column if not exists finding_keys text[] not null default '{}'::text[];

comment on column public.audit_findings.metric_keys is 'Canonical audit metric keys used to generate this finding.';
comment on column public.audit_findings.context_keys is 'Audit context keys used to generate this finding.';
comment on column public.audit_diagnoses.finding_keys is 'Canonical finding keys used to generate this diagnosis.';

-- Lineage is enforced at the persistence boundary so every writer, not only the current
-- orchestrator adapter, records the same v1.1 dependency chain.
create or replace function public.populate_golden_audit_finding_lineage()
returns trigger
language plpgsql
set search_path = ''
as $$
declare
  v_first_metric text;
  v_latest_metric text;
begin
  if new.finding_key = 'dormant_client_asset' then
    new.metric_keys := array['dormant_historical_clients']::text[];
  elsif new.finding_key = 'capacity_context_gate' then
    select metric_key into v_first_metric
    from public.audit_metrics
    where audit_id = new.audit_id
      and metric_key ~ '^recorded_payment_value_[0-9]{4}$'
      and measurement_status = 'measured'
    order by period_start asc nulls last
    limit 1;

    select metric_key into v_latest_metric
    from public.audit_metrics
    where audit_id = new.audit_id
      and metric_key ~ '^recorded_payment_value_[0-9]{4}$'
      and measurement_status = 'measured'
    order by period_start desc nulls last
    limit 1;

    new.metric_keys := array_remove(array[v_first_metric, v_latest_metric]::text[], null);
    new.context_keys := array['material_owner_availability_constraint']::text[];
  end if;
  return new;
end;
$$;

drop trigger if exists trg_golden_audit_finding_lineage on public.audit_findings;
create trigger trg_golden_audit_finding_lineage
before insert or update of finding_key on public.audit_findings
for each row execute function public.populate_golden_audit_finding_lineage();

create or replace function public.populate_golden_audit_diagnosis_lineage()
returns trigger
language plpgsql
set search_path = ''
as $$
begin
  new.finding_keys := case new.constraint_type
    when 'capacity_context' then array['capacity_context_gate']::text[]
    when 'client_reactivation' then array['dormant_client_asset']::text[]
    when 'digital_acquisition_readiness' then array['digital_acquisition_readiness']::text[]
    else '{}'::text[]
  end;
  return new;
end;
$$;

drop trigger if exists trg_golden_audit_diagnosis_lineage on public.audit_diagnoses;
create trigger trg_golden_audit_diagnosis_lineage
before insert or update of constraint_type on public.audit_diagnoses
for each row execute function public.populate_golden_audit_diagnosis_lineage();
