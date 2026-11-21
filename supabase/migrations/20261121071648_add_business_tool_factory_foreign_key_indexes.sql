-- Cover foreign keys flagged by the first post-migration performance advisor run.
create index bt_workspaces_created_by_idx on public.bt_workspaces(created_by) where created_by is not null;
create index bt_import_jobs_created_by_idx on public.bt_import_jobs(created_by) where created_by is not null;
create index bt_approvals_actor_id_idx on public.bt_approvals(actor_id);
create index bt_audit_events_actor_id_idx on public.bt_audit_events(actor_id) where actor_id is not null;
create index rr_actions_created_by_idx on public.rr_actions(created_by) where created_by is not null;
create index rr_actions_workspace_opportunity_idx on public.rr_actions(workspace_id,opportunity_id);
create index rr_bookings_workspace_client_idx on public.rr_bookings(workspace_id,client_id) where client_id is not null;
create index rr_bookings_workspace_project_idx on public.rr_bookings(workspace_id,project_id) where project_id is not null;
create index rr_enquiries_workspace_client_idx on public.rr_enquiries(workspace_id,client_id) where client_id is not null;
create index rr_outcomes_recorded_by_idx on public.rr_outcomes(recorded_by) where recorded_by is not null;
create index rr_outcomes_workspace_action_idx on public.rr_outcomes(workspace_id,action_id) where action_id is not null;
create index rr_payments_workspace_booking_idx on public.rr_payments(workspace_id,booking_id) where booking_id is not null;
create index rr_payments_workspace_project_idx on public.rr_payments(workspace_id,project_id) where project_id is not null;
create index rr_projects_workspace_client_idx on public.rr_projects(workspace_id,client_id) where client_id is not null;
