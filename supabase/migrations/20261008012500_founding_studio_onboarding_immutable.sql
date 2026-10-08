-- Make the public onboarding handoff idempotent and immutable after first submission.
create or replace function public.submit_founding_studio_onboarding(
  p_session_id text,
  p_location text,
  p_artist_count integer,
  p_booking_process text,
  p_primary_goal text,
  p_data_available text,
  p_instagram_url text default null,
  p_notes text default null
)
returns table (audit_id uuid)
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_inv public.founding_studio_invites%rowtype;
begin
  select * into v_inv
  from public.founding_studio_invites
  where stripe_session_id = p_session_id
    and status = 'completed'
  for update;

  if v_inv.id is null or v_inv.audit_id is null then
    raise exception 'Completed invitation not found';
  end if;

  if v_inv.onboarding_status = 'submitted' then
    return query select v_inv.audit_id;
    return;
  end if;

  if length(trim(coalesce(p_location,''))) < 2
     or p_artist_count is null
     or p_artist_count < 0
     or length(trim(coalesce(p_booking_process,''))) < 5
     or length(trim(coalesce(p_primary_goal,''))) < 5
     or length(trim(coalesce(p_data_available,''))) < 2 then
    raise exception 'Complete all required onboarding fields';
  end if;

  insert into public.founding_studio_onboarding (
    invite_id,
    audit_id,
    stripe_session_id,
    location,
    artist_count,
    booking_process,
    primary_goal,
    data_available,
    instagram_url,
    notes,
    submitted_at,
    updated_at
  )
  values (
    v_inv.id,
    v_inv.audit_id,
    p_session_id,
    trim(p_location),
    p_artist_count,
    trim(p_booking_process),
    trim(p_primary_goal),
    trim(p_data_available),
    nullif(trim(coalesce(p_instagram_url,'')), ''),
    nullif(trim(coalesce(p_notes,'')), ''),
    now(),
    now()
  )
  on conflict (invite_id) do nothing;

  update public.studios
  set primary_location = trim(p_location), updated_at = now()
  where id = v_inv.studio_id;

  update public.visibility_studios
  set artist_count = p_artist_count, updated_at = now()
  where id = v_inv.studio_id;

  update public.audits
  set
    status = case when status = 'draft' then 'collecting' else status end,
    context = context || jsonb_build_object(
      'lifecycle_state','intake_complete',
      'onboarding_submitted_at',now(),
      'primary_goal',trim(p_primary_goal),
      'data_available',trim(p_data_available),
      'booking_process',trim(p_booking_process)
    )
  where id = v_inv.audit_id;

  update public.founding_studio_invites
  set
    onboarding_status = 'submitted',
    onboarding_submitted_at = now(),
    updated_at = now()
  where id = v_inv.id;

  insert into public.integration_events (
    event_type,
    occurred_at,
    source_system,
    source_event_id,
    idempotency_key,
    correlation_id,
    studio_id,
    contact_ref,
    processing_status,
    payload
  )
  values (
    'onboarding.completed',
    now(),
    'inksights',
    p_session_id,
    'founding_onboarding:' || v_inv.id::text,
    v_inv.id,
    v_inv.studio_id,
    v_inv.contact_request_id::text,
    'received',
    jsonb_build_object(
      'invite_id',v_inv.id,
      'audit_id',v_inv.audit_id,
      'access_type','founding_studio'
    )
  )
  on conflict (idempotency_key) do nothing;

  return query select v_inv.audit_id;
end;
$$;

revoke all on function public.submit_founding_studio_onboarding(text,text,integer,text,text,text,text,text) from public;
grant execute on function public.submit_founding_studio_onboarding(text,text,integer,text,text,text,text,text) to anon, authenticated;
