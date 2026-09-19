-- Phase 1: generic replay-safe integration event store.
-- Service/internal only. No anon/authenticated access.

create table if not exists public.integration_events (
  event_id uuid primary key default gen_random_uuid(),
  event_type text not null,
  occurred_at timestamptz not null,
  received_at timestamptz not null default now(),
  source_system text not null,
  source_event_id text,
  idempotency_key text not null,
  correlation_id uuid not null,
  studio_id uuid references public.studios(id) on delete set null,
  contact_ref text,
  opportunity_ref text,
  intervention_id uuid references public.intelligence_interventions(id) on delete set null,
  processing_status text not null default 'received',
  attempt_count integer not null default 0,
  payload jsonb not null default '{}'::jsonb,
  error_code text,
  error_detail text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint integration_events_idempotency_key_key unique (idempotency_key),
  constraint integration_events_processing_status_check
    check (processing_status in ('received','processed','failed','ignored')),
  constraint integration_events_attempt_count_check check (attempt_count >= 0),
  constraint integration_events_event_type_check check (
    event_type in (
      'lead.created','lead.updated','lead.qualified','lead.disqualified',
      'message.sent','message.delivered','message.failed','message.replied',
      'consultation.booked','consultation.completed',
      'deposit.requested','deposit.paid','deposit.failed',
      'booking.created','booking.cancelled','appointment.completed',
      'intervention.started','intervention.paused','intervention.completed',
      'outcome.recorded','attribution.calculated',
      'workflow.failed','workflow.retried','workflow.escalated'
    )
  )
);

create index if not exists integration_events_correlation_occurred_idx
  on public.integration_events (correlation_id, occurred_at, event_id);
create index if not exists integration_events_studio_occurred_idx
  on public.integration_events (studio_id, occurred_at desc)
  where studio_id is not null;
create index if not exists integration_events_status_received_idx
  on public.integration_events (processing_status, received_at)
  where processing_status in ('received','failed');
create index if not exists integration_events_source_event_idx
  on public.integration_events (source_system, source_event_id)
  where source_event_id is not null;
create index if not exists integration_events_intervention_idx
  on public.integration_events (intervention_id, occurred_at)
  where intervention_id is not null;

alter table public.integration_events enable row level security;
revoke all on table public.integration_events from public, anon, authenticated;
grant select, insert, update, delete on table public.integration_events to service_role;

comment on table public.integration_events is
  'Service-only immutable business/provider event envelope for INKSIGHTS intervention workflows. Idempotency key prevents replay duplication.';

create or replace function public.touch_integration_event_updated_at()
returns trigger
language plpgsql
set search_path = public
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

revoke all on function public.touch_integration_event_updated_at() from public, anon, authenticated;
grant execute on function public.touch_integration_event_updated_at() to service_role;

drop trigger if exists integration_events_touch_updated_at on public.integration_events;
create trigger integration_events_touch_updated_at
before update on public.integration_events
for each row execute function public.touch_integration_event_updated_at();

create or replace function public.record_integration_event(
  p_event_type text,
  p_occurred_at timestamptz,
  p_source_system text,
  p_idempotency_key text,
  p_correlation_id uuid,
  p_source_event_id text default null,
  p_studio_id uuid default null,
  p_contact_ref text default null,
  p_opportunity_ref text default null,
  p_intervention_id uuid default null,
  p_payload jsonb default '{}'::jsonb
)
returns public.integration_events
language plpgsql
security definer
set search_path = public
as $$
declare
  v_event public.integration_events;
begin
  insert into public.integration_events (
    event_type, occurred_at, source_system, source_event_id,
    idempotency_key, correlation_id, studio_id, contact_ref,
    opportunity_ref, intervention_id, payload
  ) values (
    p_event_type, p_occurred_at, p_source_system, p_source_event_id,
    p_idempotency_key, p_correlation_id, p_studio_id, p_contact_ref,
    p_opportunity_ref, p_intervention_id, coalesce(p_payload, '{}'::jsonb)
  )
  on conflict (idempotency_key) do update
    set idempotency_key = excluded.idempotency_key
  returning * into v_event;
  return v_event;
end;
$$;

revoke all on function public.record_integration_event(
  text,timestamptz,text,text,uuid,text,uuid,text,text,uuid,jsonb
) from public, anon, authenticated;
grant execute on function public.record_integration_event(
  text,timestamptz,text,text,uuid,text,uuid,text,text,uuid,jsonb
) to service_role;
