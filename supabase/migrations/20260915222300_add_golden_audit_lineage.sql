-- Persist the lineage needed to trace client-facing claims back to metrics, context and findings.
alter table public.audit_findings
  add column if not exists metric_keys text[] not null default '{}'::text[],
  add column if not exists context_keys text[] not null default '{}'::text[];

alter table public.audit_diagnoses
  add column if not exists finding_keys text[] not null default '{}'::text[];

comment on column public.audit_findings.metric_keys is 'Canonical audit metric keys used to generate this finding.';
comment on column public.audit_findings.context_keys is 'Audit context keys used to generate this finding.';
comment on column public.audit_diagnoses.finding_keys is 'Canonical finding keys used to generate this diagnosis.';
