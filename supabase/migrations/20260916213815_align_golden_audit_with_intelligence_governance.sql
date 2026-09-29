alter table public.audit_diagnoses
  add column if not exists resolution_state text,
  add column if not exists constraint_family text;

alter table public.audit_diagnoses
  drop constraint if exists audit_diagnoses_resolution_state_check;
alter table public.audit_diagnoses
  add constraint audit_diagnoses_resolution_state_check
  check (resolution_state is null or resolution_state in ('supported','not_supported','insufficient_data'));

alter table public.audit_diagnoses
  drop constraint if exists audit_diagnoses_constraint_family_check;
alter table public.audit_diagnoses
  add constraint audit_diagnoses_constraint_family_check
  check (constraint_family is null or constraint_family in ('demand_visibility','conversion','appointment_leakage','capacity_utilisation','pricing_monetisation','frequency_retention','measurement_readiness'));

alter table public.audit_opportunities
  add column if not exists value_classification text;

alter table public.audit_opportunities
  drop constraint if exists audit_opportunities_value_classification_check;
alter table public.audit_opportunities
  add constraint audit_opportunities_value_classification_check
  check (value_classification is null or value_classification in ('recoverable_leakage','modelled_opportunity','captured_upside'));

update public.audit_opportunities
set value_classification = 'modelled_opportunity'
where value_classification is null;

alter table public.audit_opportunities
  alter column value_classification set default 'modelled_opportunity';

alter table public.audit_evidence
  drop constraint if exists audit_evidence_classification_check;
alter table public.audit_evidence
  add constraint audit_evidence_classification_check
  check (classification in ('VERIFIED','OBSERVED','CALCULATED','MODELLED','HYPOTHESIS','MISSING'));

alter table public.audit_metrics
  drop constraint if exists audit_metrics_evidence_classification_check;
alter table public.audit_metrics
  add constraint audit_metrics_evidence_classification_check
  check (evidence_classification in ('VERIFIED','OBSERVED','CALCULATED','MODELLED','HYPOTHESIS','MISSING'));

alter table public.audit_opportunities
  drop constraint if exists audit_opportunities_evidence_classification_check;
alter table public.audit_opportunities
  add constraint audit_opportunities_evidence_classification_check
  check (evidence_classification in ('VERIFIED','OBSERVED','CALCULATED','MODELLED','HYPOTHESIS','MISSING'));
