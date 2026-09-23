create index if not exists ops_risks_cycle_id_idx on public.ops_risks (cycle_id);
create index if not exists ops_metric_definitions_business_key_idx on public.ops_metric_definitions (business_key);
create index if not exists ops_metric_snapshots_business_key_idx on public.ops_metric_snapshots (business_key);
create index if not exists ops_evidence_related_decision_id_idx on public.ops_evidence (related_decision_id);
create index if not exists ops_evidence_related_priority_id_idx on public.ops_evidence (related_priority_id);
create index if not exists ops_actions_cycle_id_idx on public.ops_actions (cycle_id);
create index if not exists ops_actions_priority_id_idx on public.ops_actions (priority_id);
