create schema if not exists integration;
create schema if not exists commercial;

revoke all on schema integration from public, anon, authenticated;
revoke all on schema commercial from public, anon, authenticated;
grant usage on schema integration to service_role;
grant usage on schema commercial to service_role;

create table integration.providers (
  id uuid primary key default gen_random_uuid(),
  business_key text not null default 'inksights_b2b',
  platform_key text not null default 'inksights_b2b',
  provider_key text not null,
  environment text not null check (environment in ('production','preview','sandbox','development')),
  authority_scope jsonb not null default '[]'::jsonb,
  status text not null default 'active' check (status in ('active','approval_gated','degraded','disabled')),
  external_account_ref text,
  config jsonb not null default '{}'::jsonb,
  last_reconciled_at timestamptz,
  last_success_at timestamptz,
  last_error_at timestamptz,
  last_error_message text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (business_key, provider_key, environment)
);

create table integration.external_object_links (
  id uuid primary key default gen_random_uuid(),
  business_key text not null default 'inksights_b2b',
  provider_key text not null,
  environment text not null check (environment in ('production','preview','sandbox','development')),
  canonical_entity_type text not null,
  canonical_entity_id uuid not null,
  external_object_type text not null,
  external_object_id text not null,
  link_status text not null default 'verified' check (link_status in ('candidate','verified','conflict','retired')),
  metadata jsonb not null default '{}'::jsonb,
  first_seen_at timestamptz not null default now(),
  last_verified_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (business_key, provider_key, environment, external_object_type, external_object_id),
  unique (business_key, provider_key, environment, canonical_entity_type, canonical_entity_id, external_object_type)
);

create table integration.inbox (
  id uuid primary key default gen_random_uuid(),
  business_key text not null default 'inksights_b2b',
  provider_key text not null,
  environment text not null check (environment in ('production','preview','sandbox','development')),
  external_event_id text not null,
  event_type text not null,
  payload jsonb not null default '{}'::jsonb,
  status text not null default 'received' check (status in ('received','processing','succeeded','ignored','failed','dead')),
  receive_count integer not null default 1 check (receive_count > 0),
  attempt_count integer not null default 0 check (attempt_count >= 0),
  first_received_at timestamptz not null default now(),
  last_received_at timestamptz not null default now(),
  processed_at timestamptz,
  last_error text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (business_key, provider_key, environment, external_event_id)
);

create table integration.outbox (
  id uuid primary key default gen_random_uuid(),
  business_key text not null default 'inksights_b2b',
  destination_provider text not null,
  environment text not null check (environment in ('production','preview','sandbox','development')),
  event_type text not null,
  aggregate_type text not null,
  aggregate_id uuid not null,
  payload jsonb not null default '{}'::jsonb,
  idempotency_key text not null,
  status text not null default 'queued' check (status in ('queued','processing','succeeded','ignored','blocked','failed','dead')),
  attempt_count integer not null default 0 check (attempt_count >= 0),
  available_at timestamptz not null default now(),
  claimed_at timestamptz,
  last_attempt_at timestamptz,
  completed_at timestamptz,
  last_error text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (business_key, destination_provider, environment, idempotency_key)
);

create table integration.failures (
  id uuid primary key default gen_random_uuid(),
  business_key text not null default 'inksights_b2b',
  provider_key text not null,
  environment text not null check (environment in ('production','preview','sandbox','development')),
  operation text not null,
  source_type text,
  source_id uuid,
  classification text not null default 'integration_error' check (classification in ('integration_error','configuration','authentication','rate_limit','validation','provider_error','data_conflict','approval_gate')),
  retryable boolean not null default true,
  error_code text,
  error_message text not null,
  metadata jsonb not null default '{}'::jsonb,
  occurred_at timestamptz not null default now(),
  resolved_at timestamptz,
  resolution text
);

create table integration.reconciliation_runs (
  id uuid primary key default gen_random_uuid(),
  business_key text not null default 'inksights_b2b',
  provider_key text not null,
  environment text not null check (environment in ('production','preview','sandbox','development')),
  reconciliation_type text not null,
  status text not null default 'running' check (status in ('running','succeeded','degraded','failed')),
  summary jsonb not null default '{}'::jsonb,
  differences jsonb not null default '[]'::jsonb,
  started_at timestamptz not null default now(),
  completed_at timestamptz,
  created_at timestamptz not null default now()
);

create index integration_outbox_claim_idx
  on integration.outbox(destination_provider, environment, status, available_at, created_at);
create index integration_inbox_status_idx
  on integration.inbox(provider_key, environment, status, last_received_at desc);
create index integration_external_links_canonical_idx
  on integration.external_object_links(canonical_entity_type, canonical_entity_id);
create index integration_failures_unresolved_idx
  on integration.failures(provider_key, environment, occurred_at desc)
  where resolved_at is null;

create table commercial.offers (
  id uuid primary key default gen_random_uuid(),
  business_key text not null default 'inksights_b2b',
  offer_key text not null,
  canonical_name text not null,
  owner_system text not null default 'supabase' check (owner_system = 'supabase'),
  lifecycle_state text not null default 'draft' check (lifecycle_state in ('draft','active','retired')),
  approval_required boolean not null default true,
  current_version_id uuid,
  metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (business_key, offer_key)
);

create table commercial.offer_versions (
  id uuid primary key default gen_random_uuid(),
  offer_id uuid not null references commercial.offers(id) on delete cascade,
  version integer not null check (version > 0),
  display_name text not null,
  billing_model text not null check (billing_model in ('free','one_time','subscription','scoped','application_only','composite')),
  currency text check (currency is null or currency ~ '^[A-Z]{3}$'),
  unit_amount_minor bigint check (unit_amount_minor is null or unit_amount_minor >= 0),
  billing_interval text check (billing_interval is null or billing_interval in ('day','week','month','year')),
  pricing_components jsonb not null default '[]'::jsonb,
  commercial_status text not null default 'proposal' check (commercial_status in ('proposal','approved','superseded','retired')),
  approval_state text not null default 'requires_approval' check (approval_state in ('requires_approval','approved','rejected','superseded')),
  approved_at timestamptz,
  approved_by text,
  effective_at timestamptz,
  ended_at timestamptz,
  source_ref text,
  source_observation jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (offer_id, version),
  check ((approval_state = 'approved' and approved_at is not null) or approval_state <> 'approved')
);

alter table commercial.offers
  add constraint commercial_offers_current_version_fkey
  foreign key (current_version_id) references commercial.offer_versions(id) on delete set null;

create table commercial.external_mappings (
  id uuid primary key default gen_random_uuid(),
  offer_version_id uuid not null references commercial.offer_versions(id) on delete cascade,
  provider_key text not null check (provider_key in ('stripe','hubspot')),
  environment text not null check (environment in ('production','preview','sandbox','development')),
  external_product_id text,
  external_price_id text,
  external_object_id text,
  mapping_status text not null default 'approval_gated' check (mapping_status in ('approval_gated','verified','inactive','drifted')),
  verified_at timestamptz,
  metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (offer_version_id, provider_key, environment),
  check (provider_key <> 'stripe' or external_object_id is null)
);

revoke all on all tables in schema integration from public, anon, authenticated;
revoke all on all tables in schema commercial from public, anon, authenticated;
grant select, insert, update, delete on all tables in schema integration to service_role;
grant select, insert, update, delete on all tables in schema commercial to service_role;

create or replace function integration.touch_updated_at()
returns trigger
language plpgsql
set search_path = pg_catalog
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

create trigger providers_touch_updated_at before update on integration.providers
for each row execute function integration.touch_updated_at();
create trigger external_object_links_touch_updated_at before update on integration.external_object_links
for each row execute function integration.touch_updated_at();
create trigger inbox_touch_updated_at before update on integration.inbox
for each row execute function integration.touch_updated_at();
create trigger outbox_touch_updated_at before update on integration.outbox
for each row execute function integration.touch_updated_at();
create trigger offers_touch_updated_at before update on commercial.offers
for each row execute function integration.touch_updated_at();
create trigger offer_versions_touch_updated_at before update on commercial.offer_versions
for each row execute function integration.touch_updated_at();
create trigger external_mappings_touch_updated_at before update on commercial.external_mappings
for each row execute function integration.touch_updated_at();

create or replace function public.integration_receive_event(
  p_provider_key text,
  p_environment text,
  p_external_event_id text,
  p_event_type text,
  p_payload jsonb default '{}'::jsonb
)
returns jsonb
language plpgsql
security invoker
set search_path = pg_catalog, public, integration
as $$
declare
  v_row integration.inbox;
begin
  insert into integration.inbox (
    provider_key, environment, external_event_id, event_type, payload
  ) values (
    lower(trim(p_provider_key)), lower(trim(p_environment)), trim(p_external_event_id), p_event_type, coalesce(p_payload, '{}'::jsonb)
  )
  on conflict (business_key, provider_key, environment, external_event_id)
  do update set
    receive_count = integration.inbox.receive_count + 1,
    last_received_at = now(),
    payload = excluded.payload,
    updated_at = now()
  returning * into v_row;

  return jsonb_build_object(
    'id', v_row.id,
    'status', v_row.status,
    'receive_count', v_row.receive_count,
    'attempt_count', v_row.attempt_count
  );
end;
$$;

create or replace function public.integration_mark_event(
  p_event_id uuid,
  p_status text,
  p_error text default null
)
returns void
language plpgsql
security invoker
set search_path = pg_catalog, public, integration
as $$
begin
  if p_status not in ('processing','succeeded','ignored','failed','dead') then
    raise exception 'invalid_integration_event_status';
  end if;

  update integration.inbox
  set status = p_status,
      attempt_count = case when p_status in ('processing','failed','dead') then attempt_count + 1 else attempt_count end,
      processed_at = case when p_status in ('succeeded','ignored','dead') then now() else processed_at end,
      last_error = p_error,
      updated_at = now()
  where id = p_event_id;
end;
$$;

create or replace function public.integration_claim_outbox(
  p_provider_key text,
  p_environment text default 'production',
  p_limit integer default 25
)
returns jsonb
language plpgsql
security invoker
set search_path = pg_catalog, public, integration
as $$
declare
  v_rows jsonb;
begin
  with claimable as (
    select id
    from integration.outbox
    where destination_provider = lower(trim(p_provider_key))
      and environment = lower(trim(p_environment))
      and status in ('queued','failed')
      and available_at <= now()
    order by created_at
    for update skip locked
    limit greatest(1, least(coalesce(p_limit,25),100))
  ), claimed as (
    update integration.outbox o
    set status = 'processing',
        claimed_at = now(),
        last_attempt_at = now(),
        attempt_count = o.attempt_count + 1,
        updated_at = now()
    from claimable c
    where o.id = c.id
    returning o.*
  )
  select coalesce(jsonb_agg(to_jsonb(claimed) order by claimed.created_at), '[]'::jsonb)
  into v_rows
  from claimed;

  return v_rows;
end;
$$;

create or replace function public.integration_finish_outbox(
  p_outbox_id uuid,
  p_status text,
  p_error text default null,
  p_retry_at timestamptz default null
)
returns void
language plpgsql
security invoker
set search_path = pg_catalog, public, integration
as $$
begin
  if p_status not in ('succeeded','ignored','blocked','failed','dead') then
    raise exception 'invalid_integration_outbox_status';
  end if;

  update integration.outbox
  set status = p_status,
      last_error = p_error,
      available_at = coalesce(p_retry_at, available_at),
      completed_at = case when p_status in ('succeeded','ignored','blocked','dead') then now() else null end,
      updated_at = now()
  where id = p_outbox_id;
end;
$$;

create or replace function public.integration_upsert_external_link(
  p_provider_key text,
  p_environment text,
  p_canonical_entity_type text,
  p_canonical_entity_id uuid,
  p_external_object_type text,
  p_external_object_id text,
  p_metadata jsonb default '{}'::jsonb
)
returns uuid
language plpgsql
security invoker
set search_path = pg_catalog, public, integration
as $$
declare
  v_id uuid;
begin
  insert into integration.external_object_links (
    provider_key, environment, canonical_entity_type, canonical_entity_id,
    external_object_type, external_object_id, link_status, metadata, last_verified_at
  ) values (
    lower(trim(p_provider_key)), lower(trim(p_environment)), p_canonical_entity_type, p_canonical_entity_id,
    p_external_object_type, p_external_object_id, 'verified', coalesce(p_metadata,'{}'::jsonb), now()
  )
  on conflict (business_key, provider_key, environment, canonical_entity_type, canonical_entity_id, external_object_type)
  do update set
    external_object_id = excluded.external_object_id,
    link_status = 'verified',
    metadata = integration.external_object_links.metadata || excluded.metadata,
    last_verified_at = now(),
    updated_at = now()
  returning id into v_id;

  return v_id;
end;
$$;

create or replace function public.integration_record_failure(
  p_provider_key text,
  p_environment text,
  p_operation text,
  p_error_message text,
  p_source_type text default null,
  p_source_id uuid default null,
  p_classification text default 'integration_error',
  p_retryable boolean default true,
  p_error_code text default null,
  p_metadata jsonb default '{}'::jsonb
)
returns uuid
language plpgsql
security invoker
set search_path = pg_catalog, public, integration
as $$
declare
  v_id uuid;
begin
  insert into integration.failures (
    provider_key, environment, operation, source_type, source_id, classification,
    retryable, error_code, error_message, metadata
  ) values (
    lower(trim(p_provider_key)), lower(trim(p_environment)), p_operation, p_source_type, p_source_id,
    p_classification, p_retryable, p_error_code, p_error_message, coalesce(p_metadata,'{}'::jsonb)
  ) returning id into v_id;

  update integration.providers
  set status = case when status = 'disabled' then status else 'degraded' end,
      last_error_at = now(),
      last_error_message = p_error_message,
      updated_at = now()
  where provider_key = lower(trim(p_provider_key))
    and environment = lower(trim(p_environment));

  return v_id;
end;
$$;

create or replace function public.integration_health_snapshot()
returns jsonb
language sql
security invoker
set search_path = pg_catalog, public, integration, commercial
as $$
  select jsonb_build_object(
    'generated_at', now(),
    'providers', coalesce((
      select jsonb_agg(jsonb_build_object(
        'provider_key', p.provider_key,
        'environment', p.environment,
        'status', p.status,
        'authority_scope', p.authority_scope,
        'external_account_ref', p.external_account_ref,
        'last_reconciled_at', p.last_reconciled_at,
        'last_success_at', p.last_success_at,
        'last_error_at', p.last_error_at,
        'last_error_message', p.last_error_message,
        'queued', (select count(*) from integration.outbox o where o.destination_provider=p.provider_key and o.environment=p.environment and o.status in ('queued','failed')),
        'blocked', (select count(*) from integration.outbox o where o.destination_provider=p.provider_key and o.environment=p.environment and o.status='blocked'),
        'unresolved_failures', (select count(*) from integration.failures f where f.provider_key=p.provider_key and f.environment=p.environment and f.resolved_at is null)
      ) order by p.provider_key, p.environment)
      from integration.providers p
    ), '[]'::jsonb),
    'offers', jsonb_build_object(
      'total', (select count(*) from commercial.offers),
      'active', (select count(*) from commercial.offers where lifecycle_state='active'),
      'approval_gated_versions', (select count(*) from commercial.offer_versions where approval_state='requires_approval'),
      'verified_stripe_mappings', (select count(*) from commercial.external_mappings where provider_key='stripe' and environment='production' and mapping_status='verified')
    )
  );
$$;

create or replace function public.resolve_commercial_offer(
  p_offer_key text,
  p_provider_key text default 'stripe',
  p_environment text default 'production'
)
returns jsonb
language sql
security invoker
set search_path = pg_catalog, public, commercial
as $$
  select jsonb_build_object(
    'offer_id', o.id,
    'offer_key', o.offer_key,
    'canonical_name', o.canonical_name,
    'lifecycle_state', o.lifecycle_state,
    'offer_version_id', v.id,
    'version', v.version,
    'display_name', v.display_name,
    'billing_model', v.billing_model,
    'currency', v.currency,
    'unit_amount_minor', v.unit_amount_minor,
    'billing_interval', v.billing_interval,
    'pricing_components', v.pricing_components,
    'approval_state', v.approval_state,
    'mapping_status', m.mapping_status,
    'external_product_id', m.external_product_id,
    'external_price_id', m.external_price_id
  )
  from commercial.offers o
  join commercial.offer_versions v on v.id = o.current_version_id and v.offer_id = o.id
  join commercial.external_mappings m on m.offer_version_id = v.id
    and m.provider_key = lower(trim(p_provider_key))
    and m.environment = lower(trim(p_environment))
  where o.business_key = 'inksights_b2b'
    and o.offer_key = p_offer_key
    and o.lifecycle_state = 'active'
    and v.approval_state = 'approved'
    and v.commercial_status = 'approved'
    and m.mapping_status = 'verified'
  limit 1;
$$;

revoke all on function public.integration_receive_event(text,text,text,text,jsonb) from public, anon, authenticated;
revoke all on function public.integration_mark_event(uuid,text,text) from public, anon, authenticated;
revoke all on function public.integration_claim_outbox(text,text,integer) from public, anon, authenticated;
revoke all on function public.integration_finish_outbox(uuid,text,text,timestamptz) from public, anon, authenticated;
revoke all on function public.integration_upsert_external_link(text,text,text,uuid,text,text,jsonb) from public, anon, authenticated;
revoke all on function public.integration_record_failure(text,text,text,text,text,uuid,text,boolean,text,jsonb) from public, anon, authenticated;
revoke all on function public.integration_health_snapshot() from public, anon, authenticated;
revoke all on function public.resolve_commercial_offer(text,text,text) from public, anon, authenticated;

grant execute on function public.integration_receive_event(text,text,text,text,jsonb) to service_role;
grant execute on function public.integration_mark_event(uuid,text,text) to service_role;
grant execute on function public.integration_claim_outbox(text,text,integer) to service_role;
grant execute on function public.integration_finish_outbox(uuid,text,text,timestamptz) to service_role;
grant execute on function public.integration_upsert_external_link(text,text,text,uuid,text,text,jsonb) to service_role;
grant execute on function public.integration_record_failure(text,text,text,text,text,uuid,text,boolean,text,jsonb) to service_role;
grant execute on function public.integration_health_snapshot() to service_role;
grant execute on function public.resolve_commercial_offer(text,text,text) to service_role;

create or replace function integration.enqueue_public_contact_request()
returns trigger
language plpgsql
set search_path = pg_catalog, public, integration
as $$
begin
  insert into integration.outbox (
    destination_provider, environment, event_type, aggregate_type, aggregate_id, payload, idempotency_key
  ) values (
    'hubspot', 'production', 'hubspot.crm_upsert', 'public_contact_request', new.id,
    jsonb_build_object(
      'contact_request_id', new.id,
      'name', new.name,
      'email', new.email,
      'studio_name', new.studio_name,
      'topic', new.topic,
      'source', new.source,
      'status', new.status,
      'metadata', new.metadata
    ),
    'public_contact_request:' || new.id::text || ':created'
  ) on conflict do nothing;
  return new;
end;
$$;

create trigger enqueue_public_contact_request_hubspot
after insert on public.public_contact_requests
for each row execute function integration.enqueue_public_contact_request();

create or replace function integration.enqueue_revenue_audit_lead()
returns trigger
language plpgsql
set search_path = pg_catalog, public, integration
as $$
begin
  insert into integration.outbox (
    destination_provider, environment, event_type, aggregate_type, aggregate_id, payload, idempotency_key
  ) values (
    'hubspot', 'production', 'hubspot.crm_upsert', 'revenue_audit_lead', new.id,
    jsonb_build_object(
      'revenue_audit_lead_id', new.id,
      'contact_name', new.contact_name,
      'email', new.email,
      'phone', new.phone,
      'studio_name', new.studio_name,
      'postcode', new.postcode,
      'source', new.source,
      'status', new.status,
      'consent_at', new.consent_at
    ),
    'revenue_audit_lead:' || new.id::text || ':created'
  ) on conflict do nothing;
  return new;
end;
$$;

create trigger enqueue_revenue_audit_lead_hubspot
after insert on public.revenue_audit_leads
for each row execute function integration.enqueue_revenue_audit_lead();

create or replace function integration.enqueue_order_reconciliation()
returns trigger
language plpgsql
set search_path = pg_catalog, public, integration
as $$
begin
  if tg_op = 'INSERT' or old.status is distinct from new.status then
    insert into integration.outbox (
      destination_provider, environment, event_type, aggregate_type, aggregate_id, payload, idempotency_key
    ) values (
      'hubspot', 'production', 'hubspot.payment_reconcile', 'order', new.id,
      jsonb_build_object(
        'order_id', new.id,
        'offer_slug', new.offer_slug,
        'status', new.status,
        'amount_total', new.amount_total,
        'currency', new.currency,
        'customer_email', new.customer_email,
        'stripe_customer_id', new.stripe_customer_id,
        'stripe_session_id', new.stripe_session_id,
        'stripe_payment_intent_id', new.stripe_payment_intent_id,
        'stripe_subscription_id', new.stripe_subscription_id,
        'stripe_product_id', new.stripe_product_id,
        'stripe_price_id', new.stripe_price_id
      ),
      'order:' || new.id::text || ':status:' || coalesce(new.status,'unknown')
    ) on conflict do nothing;
  end if;
  return new;
end;
$$;

create trigger enqueue_order_hubspot_reconciliation
after insert or update of status on public.orders
for each row execute function integration.enqueue_order_reconciliation();

insert into integration.providers (
  provider_key, environment, authority_scope, status, external_account_ref, config
) values
  ('supabase','production','["operational_identity","intelligence","integration_control"]'::jsonb,'active','ukaxsqwnkoqbbsufpzga','{"region":"eu-west-2"}'::jsonb),
  ('github','production','["source","migrations","contracts"]'::jsonb,'active','dontdoadan/inksights:main','{}'::jsonb),
  ('vercel','production','["runtime","deployments"]'::jsonb,'active','prj_eiuxaOEwD3imsDxsnWnmofP9RAZ7','{"canonical_domain":"getinksights.co.uk"}'::jsonb),
  ('stripe','production','["payment_state","catalogue"]'::jsonb,'approval_gated','acct_1U7H9ACX6YhLOssg','{"catalogue_state":"empty_observed_2026-09-15","activation_requires_approved_offer_version":true}'::jsonb),
  ('hubspot','production','["crm_lifecycle"]'::jsonb,'degraded','146863001','{"company_match_key":"normalised_domain","deal_sync_enabled":false,"deal_sync_gate":"inksights_pipeline_required","audit_note":"duplicate company records observed for same studio/domain on 2026-09-15"}'::jsonb),
  ('notion','production','["human_docs","sops","task_register"]'::jsonb,'active','233418a1-0ee4-4d9d-8cff-bac5c6c146e6','{"transactional_mirror":false}'::jsonb)
on conflict (business_key, provider_key, environment) do update
set authority_scope = excluded.authority_scope,
    external_account_ref = excluded.external_account_ref,
    config = integration.providers.config || excluded.config,
    updated_at = now();

with offer_seed(offer_key,canonical_name,billing_model,currency,unit_amount_minor,billing_interval,pricing_components,source_ref,source_observation) as (
  values
    ('72-hour-visibility-fix','72-Hour Visibility Fix','one_time','GBP',24900::bigint,null::text,'[]'::jsonb,'src/lib/offer-data.ts','{"observed_runtime_copy":true,"approval_status":"unverified_for_current_live_stripe_account"}'::jsonb),
    ('visibility-watch','Visibility Watch','subscription','GBP',9900::bigint,'month','[]'::jsonb,'src/lib/offer-data.ts','{"observed_runtime_copy":true,"approval_status":"unverified_for_current_live_stripe_account"}'::jsonb),
    ('revenue-audit','Revenue Audit','scoped','GBP',null::bigint,null::text,'[]'::jsonb,'src/lib/offer-data.ts','{"observed_runtime_copy":true,"price_display":"Scoped after qualification"}'::jsonb),
    ('booking-retention-engine','Booking & Retention Engine','scoped','GBP',null::bigint,null::text,'[]'::jsonb,'src/lib/offer-data.ts','{"observed_runtime_copy":true,"price_display":"Scoped after qualification"}'::jsonb),
    ('founding-studio-pilot','Founding Studio Pilot','composite','GBP',null::bigint,null::text,'[{"component":"setup","amount_minor":150000,"currency":"GBP"},{"component":"ongoing","amount_minor":75000,"currency":"GBP","interval":"month"}]'::jsonb,'src/lib/offer-data.ts','{"observed_runtime_copy":true,"approval_status":"unverified_for_current_live_stripe_account"}'::jsonb)
), inserted_offers as (
  insert into commercial.offers (offer_key, canonical_name, lifecycle_state, approval_required, metadata)
  select offer_key, canonical_name, 'draft', true, jsonb_build_object('source_ref',source_ref)
  from offer_seed
  on conflict (business_key,offer_key) do update
  set canonical_name=excluded.canonical_name, updated_at=now()
  returning id,offer_key
)
insert into commercial.offer_versions (
  offer_id,version,display_name,billing_model,currency,unit_amount_minor,billing_interval,
  pricing_components,commercial_status,approval_state,source_ref,source_observation
)
select o.id,1,s.canonical_name,s.billing_model,s.currency,s.unit_amount_minor,s.billing_interval,
       s.pricing_components,'proposal','requires_approval',s.source_ref,s.source_observation
from offer_seed s
join commercial.offers o on o.business_key='inksights_b2b' and o.offer_key=s.offer_key
where not exists (
  select 1 from commercial.offer_versions v where v.offer_id=o.id and v.version=1
);
