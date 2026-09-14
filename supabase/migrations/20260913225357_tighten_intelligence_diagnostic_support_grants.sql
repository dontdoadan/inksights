revoke all on table public.intelligence_taxonomy from service_role;
revoke all on table public.intelligence_source_registry from service_role;
revoke all on table public.intelligence_diagnostic_templates from service_role;
revoke all on table public.intelligence_diagnostic_questions from service_role;

grant select, insert, update, delete on table public.intelligence_taxonomy to service_role;
grant select, insert, update, delete on table public.intelligence_source_registry to service_role;
grant select, insert, update, delete on table public.intelligence_diagnostic_templates to service_role;
grant select, insert, update, delete on table public.intelligence_diagnostic_questions to service_role;