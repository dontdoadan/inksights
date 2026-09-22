-- INKSIGHTS Operating System v2 control-plane registries.
-- Mirrors production migration 20260922215805_create_operating_system_registries.

create table public.ops_businesses (
  business_key text primary key,
  name text not null,
  status text not null default 'active' check (status in ('active','inactive','planned','archived')),
  drive_folder_id text,
  canonical_domain text,
  metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.ops_systems (
  id uuid primary key default gen_random_uuid(),
  system_key text not null unique,
  name text not null,
  category text not null,
  canonical_role text not null,
  business_scope text[] not null default '{}'::text[],
  environment text,
  status text not null default 'active' check (status in ('active','limited','inactive','planned','deprecated')),
  base_url text,
  external_id text,
  cost_model text,
  data_classification text not null default 'internal' check (data_classification in ('public','internal','confidential','restricted')),
  owner text,
  failure_impact text,
  backup_strategy text,
  agent_access text,
  metadata jsonb not null default '{}'::jsonb,
  verified_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.ops_integrations (
  id uuid primary key default gen_random_uuid(),
  integration_key text not null unique,
  name text not null,
  source_system_id uuid references public.ops_systems(id) on delete restrict,
  target_system_id uuid references public.ops_systems(id) on delete restrict,
  purpose text not null,
  direction text not null default 'one_way' check (direction in ('one_way','two_way','event_only')),
  trigger_type text,
  auth_method text,
  data_objects text[] not null default '{}'::text[],
  status text not null default 'active' check (status in ('active','limited','inactive','planned','deprecated')),
  owner text,
  failure_mode text,
  retry_policy jsonb not null default '{}'::jsonb,
  monitoring jsonb not null default '{}'::jsonb,
  last_verified_at timestamptz,
  metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  check (source_system_id is null or target_system_id is null or source_system_id <> target_system_id)
);

create table public.ops_assets (
  id uuid primary key default gen_random_uuid(),
  asset_key text not null unique,
  business_key text not null references public.ops_businesses(business_key) on delete restrict,
  title text not null,
  asset_type text not null,
  category text,
  status text not null default 'draft' check (status in ('draft','in_review','approved','active','superseded','archived','blocked','deprecated')),
  sensitivity text not null default 'internal' check (sensitivity in ('public','internal','confidential','restricted')),
  canonical_system_id uuid references public.ops_systems(id) on delete restrict,
  canonical_uri text,
  drive_file_id text,
  github_repo text,
  github_path text,
  supabase_reference text,
  version text,
  content_hash text,
  supersedes_asset_id uuid references public.ops_assets(id) on delete set null,
  review_status text not null default 'not_reviewed' check (review_status in ('not_reviewed','pending','verified','rejected')),
  classification_confidence numeric(5,4) check (classification_confidence is null or (classification_confidence >= 0 and classification_confidence <= 1)),
  provenance jsonb not null default '{}'::jsonb,
  metadata jsonb not null default '{}'::jsonb,
  last_verified_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create unique index ops_assets_drive_file_id_uniq
  on public.ops_assets(drive_file_id)
  where drive_file_id is not null;

create unique index ops_assets_github_path_uniq
  on public.ops_assets(github_repo, github_path)
  where github_repo is not null and github_path is not null;

create table public.ops_asset_relationships (
  id uuid primary key default gen_random_uuid(),
  source_asset_id uuid not null references public.ops_assets(id) on delete cascade,
  target_asset_id uuid not null references public.ops_assets(id) on delete cascade,
  relationship_type text not null,
  metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  unique (source_asset_id, target_asset_id, relationship_type),
  check (source_asset_id <> target_asset_id)
);

create table public.ops_workflows (
  id uuid primary key default gen_random_uuid(),
  workflow_key text not null unique,
  name text not null,
  business_key text not null references public.ops_businesses(business_key) on delete restrict,
  purpose text not null,
  trigger_event text,
  status text not null default 'draft' check (status in ('draft','active','paused','blocked','deprecated','archived')),
  owner text,
  automation_level text not null default 'assisted' check (automation_level in ('manual','assisted','automated')),
  input_contract jsonb not null default '{}'::jsonb,
  steps jsonb not null default '[]'::jsonb,
  output_contract jsonb not null default '{}'::jsonb,
  approval_rules jsonb not null default '{}'::jsonb,
  failure_handling jsonb not null default '{}'::jsonb,
  service_level jsonb not null default '{}'::jsonb,
  version text not null default 'v1',
  metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.ops_decisions (
  id uuid primary key default gen_random_uuid(),
  decision_key text not null unique,
  business_key text not null references public.ops_businesses(business_key) on delete restrict,
  title text not null,
  decision_type text,
  status text not null default 'proposed' check (status in ('proposed','approved','rejected','superseded','review_due')),
  context text,
  decision text,
  rationale text,
  alternatives jsonb not null default '[]'::jsonb,
  impacts jsonb not null default '{}'::jsonb,
  approver text,
  decided_at timestamptz,
  review_at timestamptz,
  related_workflow_id uuid references public.ops_workflows(id) on delete set null,
  related_asset_id uuid references public.ops_assets(id) on delete set null,
  metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.ops_changes (
  id uuid primary key default gen_random_uuid(),
  change_key text not null unique,
  business_key text not null references public.ops_businesses(business_key) on delete restrict,
  change_type text not null,
  status text not null default 'planned' check (status in ('planned','approved','in_progress','verified','failed','rolled_back','cancelled')),
  title text not null,
  summary text,
  canonical_system_id uuid references public.ops_systems(id) on delete set null,
  source_ref text,
  requested_by text,
  approved_by text,
  started_at timestamptz,
  completed_at timestamptz,
  risk_level text not null default 'low' check (risk_level in ('low','medium','high','critical')),
  rollback_plan text,
  verification jsonb not null default '{}'::jsonb,
  metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.ops_routes (
  id uuid primary key default gen_random_uuid(),
  route_key text not null unique,
  business_key text not null references public.ops_businesses(business_key) on delete restrict,
  asset_type text not null,
  category text,
  canonical_system_id uuid references public.ops_systems(id) on delete restrict,
  destination_folder_id text,
  destination_path text,
  naming_pattern text,
  sensitivity text not null default 'internal' check (sensitivity in ('public','internal','confidential','restricted')),
  auto_file_threshold numeric(5,4) not null default 0.9000 check (auto_file_threshold >= 0 and auto_file_threshold <= 1),
  review_threshold numeric(5,4) not null default 0.7000 check (review_threshold >= 0 and review_threshold <= 1),
  active boolean not null default true,
  metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  check (review_threshold <= auto_file_threshold)
);

create table public.ops_intake_items (
  id uuid primary key default gen_random_uuid(),
  drive_file_id text not null unique,
  original_name text not null,
  mime_type text,
  detected_business_key text references public.ops_businesses(business_key) on delete set null,
  detected_asset_type text,
  detected_category text,
  classification_confidence numeric(5,4) check (classification_confidence is null or (classification_confidence >= 0 and classification_confidence <= 1)),
  canonical_system_id uuid references public.ops_systems(id) on delete set null,
  destination_folder_id text,
  proposed_name text,
  processing_status text not null default 'queued' check (processing_status in ('queued','processing','filed','needs_review','failed','ignored')),
  duplicate_of_asset_id uuid references public.ops_assets(id) on delete set null,
  result_asset_id uuid references public.ops_assets(id) on delete set null,
  content_hash text,
  extracted_summary text,
  error_detail text,
  first_seen_at timestamptz not null default now(),
  processed_at timestamptz,
  metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.ops_exceptions (
  id uuid primary key default gen_random_uuid(),
  exception_key text not null unique,
  intake_item_id uuid references public.ops_intake_items(id) on delete cascade,
  workflow_id uuid references public.ops_workflows(id) on delete set null,
  severity text not null default 'medium' check (severity in ('low','medium','high','critical')),
  exception_type text not null,
  title text not null,
  description text,
  status text not null default 'open' check (status in ('open','triaged','resolved','ignored')),
  requires_human boolean not null default true,
  resolution text,
  resolved_by text,
  resolved_at timestamptz,
  metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create or replace function public.ops_set_updated_at()
returns trigger
language plpgsql
security invoker
set search_path = public
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

do $$
declare
  t text;
begin
  foreach t in array array[
    'ops_businesses','ops_systems','ops_integrations','ops_assets','ops_workflows',
    'ops_decisions','ops_changes','ops_routes','ops_intake_items','ops_exceptions'
  ]
  loop
    execute format(
      'create trigger %I before update on public.%I for each row execute function public.ops_set_updated_at()',
      t || '_set_updated_at', t
    );
  end loop;
end $$;

alter table public.ops_businesses enable row level security;
alter table public.ops_systems enable row level security;
alter table public.ops_integrations enable row level security;
alter table public.ops_assets enable row level security;
alter table public.ops_asset_relationships enable row level security;
alter table public.ops_workflows enable row level security;
alter table public.ops_decisions enable row level security;
alter table public.ops_changes enable row level security;
alter table public.ops_routes enable row level security;
alter table public.ops_intake_items enable row level security;
alter table public.ops_exceptions enable row level security;

revoke all on table public.ops_businesses from anon, authenticated;
revoke all on table public.ops_systems from anon, authenticated;
revoke all on table public.ops_integrations from anon, authenticated;
revoke all on table public.ops_assets from anon, authenticated;
revoke all on table public.ops_asset_relationships from anon, authenticated;
revoke all on table public.ops_workflows from anon, authenticated;
revoke all on table public.ops_decisions from anon, authenticated;
revoke all on table public.ops_changes from anon, authenticated;
revoke all on table public.ops_routes from anon, authenticated;
revoke all on table public.ops_intake_items from anon, authenticated;
revoke all on table public.ops_exceptions from anon, authenticated;

grant select, insert, update, delete on table public.ops_businesses to service_role;
grant select, insert, update, delete on table public.ops_systems to service_role;
grant select, insert, update, delete on table public.ops_integrations to service_role;
grant select, insert, update, delete on table public.ops_assets to service_role;
grant select, insert, update, delete on table public.ops_asset_relationships to service_role;
grant select, insert, update, delete on table public.ops_workflows to service_role;
grant select, insert, update, delete on table public.ops_decisions to service_role;
grant select, insert, update, delete on table public.ops_changes to service_role;
grant select, insert, update, delete on table public.ops_routes to service_role;
grant select, insert, update, delete on table public.ops_intake_items to service_role;
grant select, insert, update, delete on table public.ops_exceptions to service_role;

revoke all on function public.ops_set_updated_at() from public, anon, authenticated;
grant execute on function public.ops_set_updated_at() to service_role;

insert into public.ops_businesses (business_key,name,drive_folder_id,canonical_domain,metadata) values
('shared','Shared / Cross-business',null,null,'{}'),
('inksights','INKSIGHTS','1_vLLMvF7Ulxjyx1AmWf6msB5HmUPMULo','https://getinksights.co.uk','{}'),
('tattoos_by_daniel_hughes','Tattoos by Daniel Hughes','1wIlZ6F_MjCHWUzbiGp5skiH02kqaA3Lj','https://danhughestattoos.co.uk','{}'),
('amazon','Amazon','1gA7uBlx8IzZ1AbVkfhXfz2An_ePCcMMq',null,'{}'),
('personal','Personal','1tCgSnS-FpvP_2YBv9SE8Be_inpuSgjn4',null,'{}');

insert into public.ops_systems
(system_key,name,category,canonical_role,business_scope,environment,status,base_url,external_id,cost_model,data_classification,owner,failure_impact,backup_strategy,agent_access,metadata,verified_at)
values
('google_drive','Google Drive','knowledge','Canonical business knowledge, approved documents, templates, packaged system exports and AI intake',array['shared','inksights','tattoos_by_daniel_hughes','amazon','personal'],'production','active','https://drive.google.com',null,'Google account','confidential','Daniel Hughes','Loss of operating knowledge and packaged business assets','Drive version history plus generated/exported copies where required','Connected ChatGPT Google Drive plugin',
 jsonb_build_object('ai_inbox_folder_id','1gpJJ3Q9CLqscEwzpschhiAiHNCqG1FX2','operating_system_folder_id','1FWuxiXo_S1eY7c9BGqamk56ATnHwKj1i','system_exports_folder_id','1LOW6UAojhQhAIdK0kyfargB5DeC6MX6v'), now()),
('github','GitHub','code','Canonical source code, migrations, CI, executable logic and version-controlled technical specifications',array['inksights','tattoos_by_daniel_hughes'],'multi','active','https://github.com','dontdoadan','Free tier','confidential','Daniel Hughes','Loss of source control, release history and reproducibility','Git distributed history and repository copies','Connected ChatGPT GitHub plugin',
 jsonb_build_object('canonical_inksights_repo','dontdoadan/inksights','canonical_inksights_repo_visibility','public','default_branch','main'), now()),
('supabase','Supabase','database','Canonical operational product and intelligence datastore and machine-readable operating registries',array['inksights'],'production','active','https://supabase.com','ukaxsqwnkoqbbsufpzga','Current Supabase plan','restricted','Daniel Hughes','Loss of operational data, intelligence records and backend services','Database migrations, source-controlled schema and platform backups where available','Connected ChatGPT Supabase plugin and server-side credentials',
 jsonb_build_object('project_name','INKSIGHTS','region','eu-west-2'), now()),
('vercel','Vercel','runtime','Canonical deployment, hosting and runtime state',array['inksights','tattoos_by_daniel_hughes'],'multi','active','https://vercel.com','team_UBx36k2d9Y7xn7SxCjOjXymD','Current Vercel plan','confidential','Daniel Hughes','Public applications and runtime workflows become unavailable','GitHub source plus reproducible project configuration','Connected ChatGPT Vercel plugin',
 jsonb_build_object('inksights_project','inksight-main','inksights_project_id','prj_eiuxaOEwD3imsDxsnWnmofP9RAZ7','tattoo_project','dan-hughes-tattoos'), now()),
('hubspot','HubSpot','crm','Canonical CRM for companies, contacts, opportunities, customers and sales activity',array['inksights'],'production','active','https://app-eu1.hubspot.com','146863001','Free/standard portal unless upgraded','confidential','Daniel Hughes','Sales pipeline and relationship history become unavailable','Periodic CRM export and cross-system identifiers in Supabase','Connected ChatGPT HubSpot plugin',
 jsonb_build_object('portal_name','INKSIGHTS','currency','GBP','timezone','Europe/London'), now()),
('stripe','Stripe','payments','Canonical payment and billing processor state',array['inksights'],'multi','active','https://dashboard.stripe.com',null,'Transaction/payment platform','restricted','Daniel Hughes','Payment collection, reconciliation and billing evidence become unavailable','Stripe records plus controlled financial exports','Connected ChatGPT Stripe plugin',
 jsonb_build_object('sandbox_context','acct_1U7HkX2SPedeqLYG','live_context','acct_1U7H9ACX6YhLOssg'), now()),
('notion','Notion','planning','Temporary planning, task coordination and historical engineering workspace; not canonical system truth',array['inksights'],'production','limited','https://www.notion.so',null,'Current Notion plan','internal','Daniel Hughes','Task context and historical notes may be unavailable; live systems remain authoritative','Important approved knowledge should be promoted to Drive/GitHub/Supabase','Connected ChatGPT Notion plugin',
 jsonb_build_object('target_role','planning_only'), now()),
('chatgpt','ChatGPT / AI Agents','ai','Reasoning, orchestration, classification, transformation, QA and controlled execution; conversation history is not canonical storage',array['shared','inksights','tattoos_by_daniel_hughes','amazon'],'multi','active','https://chatgpt.com',null,'Current ChatGPT plan','confidential','Daniel Hughes','Automation and orchestration degrade to manual workflows','SOPs, prompts, registries and system specifications remain outside chat','Native connected plugins and scheduled automations',
 jsonb_build_object('control_principle','agents operate against canonical systems and log material actions'), now());

insert into public.ops_workflows
(workflow_key,name,business_key,purpose,trigger_event,status,owner,automation_level,input_contract,steps,output_contract,approval_rules,failure_handling,version,metadata)
values
('ai_drive_intake_v1','AI Drive Intake','shared','Classify, register, rename and route files placed into the AI Inbox while preserving canonical ownership and escalating ambiguity.','DRIVE_FILE_ADDED','active','ChatGPT / AI Agent','assisted',
 jsonb_build_object('source_folder_id','1gpJJ3Q9CLqscEwzpschhiAiHNCqG1FX2'),
 jsonb_build_array('detect','identify_business','identify_asset_type','extract_metadata','search_registry','detect_duplicate_or_version','determine_canonical_owner','assess_sensitivity','propose_name','route_or_exception','register_asset','extract_reusable_knowledge','qa'),
 jsonb_build_object('registered',true,'routed',true,'auditable',true),
 jsonb_build_object('auto_file_confidence',0.90,'review_confidence',0.70,'always_require_human',jsonb_build_array('delete','production_schema_change','commercial_calculation_change','external_publish','payment_configuration','credential_change','access_permission_change','production_infrastructure_change','legal_contract_change')),
 jsonb_build_object('on_ambiguous','create_exception','on_failure','leave_file_in_inbox_and_record_error'),
 'v1',
 jsonb_build_object('legacy_import','never_automatic'));

insert into public.ops_routes
(route_key,business_key,asset_type,category,canonical_system_id,destination_folder_id,destination_path,naming_pattern,sensitivity,auto_file_threshold,review_threshold,metadata)
select v.route_key, v.business_key, v.asset_type, v.category, s.id, v.folder_id, v.destination_path, v.naming_pattern, v.sensitivity, v.auto_threshold, v.review_threshold, '{}'::jsonb
from (
 values
 ('shared_policy','shared','policy',null,'1HY9aqkpoLl7W0PTWH4psHUA4GbeWnXv9','02 - OPERATING SYSTEM / 01 - GOVERNANCE','{Subject} - Policy - {Version}','internal',0.90,0.70),
 ('shared_sop','shared','sop',null,'16IP2VAmJnf9MvuSJJYRO0CLiqLCPAnTw','02 - OPERATING SYSTEM / 03 - SOPs','{Subject} - SOP - {Version}','internal',0.90,0.70),
 ('shared_playbook','shared','playbook',null,'18RA7fitUI0VPWQTZ6OkONbKvTfwd8Pt1','02 - OPERATING SYSTEM / 04 - PLAYBOOKS','{Subject} - Playbook - {Version}','internal',0.90,0.70),
 ('shared_guide','shared','guide',null,'14TbvfYH3j-m9myBVvPqGBycIHrjxk17k','02 - OPERATING SYSTEM / 05 - MANUALS & GUIDES','{Subject} - Guide - {Version}','internal',0.90,0.70),
 ('shared_manual','shared','manual',null,'14TbvfYH3j-m9myBVvPqGBycIHrjxk17k','02 - OPERATING SYSTEM / 05 - MANUALS & GUIDES','{Subject} - Manual - {Version}','internal',0.90,0.70),
 ('shared_template','shared','template',null,'1BjAgTLtG8Krj2ZgugwoGa11ObvqzzzII','02 - OPERATING SYSTEM / 06 - TEMPLATES','{Subject} - Template - {Version}','internal',0.90,0.70),
 ('inksights_research','inksights','research_evidence',null,'1IZs4TorLjep-9uK6K9BSi9pCBhEzjQ1N','01 - BUSINESSES / 01 - INKSIGHTS / 08 - RESEARCH & EVIDENCE','INKSIGHTS - {Subject} - Research - {Date}','internal',0.90,0.70),
 ('inksights_template','inksights','template',null,'1FX2lxRE5S-b2YfbMf0seoXO97t0T42Bn','01 - BUSINESSES / 01 - INKSIGHTS / 12 - TEMPLATES','INKSIGHTS - {Subject} - Template - {Version}','internal',0.90,0.70),
 ('inksights_client_deliverable','inksights','client_deliverable',null,'1bkUore4Z10UjtWLrScpIENhl8BF41NHn','01 - BUSINESSES / 01 - INKSIGHTS / 07 - SERVICE DELIVERY','INKSIGHTS - {Client} - {Subject} - {Version}','confidential',0.95,0.80)
) as v(route_key,business_key,asset_type,category,folder_id,destination_path,naming_pattern,sensitivity,auto_threshold,review_threshold)
cross join public.ops_systems s
where s.system_key='google_drive';
