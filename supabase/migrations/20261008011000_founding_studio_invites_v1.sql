-- Founding Studio complimentary invitation and onboarding flow.
-- Public £395 pricing remains unchanged. These records control private, one-use
-- founding-studio access to pre-created Stripe no-cost checkout slots.

create table if not exists public.founding_checkout_slots (
  slot_code text primary key,
  stripe_payment_link_id text not null unique,
  stripe_payment_link_url text not null unique,
  status text not null default 'available'
    check (status in ('available','assigned','consumed','retired','disabled')),
  assigned_invite_id uuid unique,
  assigned_at timestamptz,
  consumed_at timestamptz,
  retired_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.founding_studio_invites (
  id uuid primary key default gen_random_uuid(),
  studio_name text not null,
  contact_name text not null,
  email text not null,
  website text,
  reason text not null,
  status text not null default 'ready'
    check (status in ('ready','opened','checkout_started','completed','revoked','expired','failed')),
  token_hash text not null unique
    check (token_hash ~ '^[0-9a-f]{64}$'),
  token_hint text not null,
  slot_code text not null unique references public.founding_checkout_slots(slot_code),
  stripe_payment_link_id text not null unique,
  stripe_payment_link_url text not null,
  stripe_session_id text unique,
  stripe_customer_id text,
  list_value_minor bigint not null default 39500 check (list_value_minor >= 0),
  waiver_amount_minor bigint not null default 39500 check (waiver_amount_minor >= 0),
  amount_due_minor bigint not null default 0 check (amount_due_minor >= 0),
  order_id uuid references public.orders(id) on delete set null,
  contact_request_id uuid references public.public_contact_requests(id) on delete set null,
  studio_id uuid references public.visibility_studios(id) on delete set null,
  audit_id uuid references public.audits(id) on delete set null,
  onboarding_status text not null default 'pending'
    check (onboarding_status in ('pending','submitted')),
  failure_reason text,
  expires_at timestamptz not null,
  opened_at timestamptz,
  checkout_started_at timestamptz,
  completed_at timestamptz,
  revoked_at timestamptz,
  onboarding_submitted_at timestamptz,
  created_by uuid references auth.users(id) on delete set null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  check (waiver_amount_minor <= list_value_minor),
  check (amount_due_minor = list_value_minor - waiver_amount_minor)
);

alter table public.founding_checkout_slots
  add constraint founding_checkout_slots_invite_fkey
  foreign key (assigned_invite_id)
  references public.founding_studio_invites(id)
  on delete set null;

create table if not exists public.founding_studio_onboarding (
  invite_id uuid primary key references public.founding_studio_invites(id) on delete cascade,
  audit_id uuid not null references public.audits(id) on delete cascade,
  stripe_session_id text not null unique,
  location text not null,
  artist_count integer not null check (artist_count >= 0),
  booking_process text not null,
  primary_goal text not null,
  data_available text not null,
  instagram_url text,
  notes text,
  submitted_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table public.orders
  add column if not exists list_value_minor bigint,
  add column if not exists waiver_amount_minor bigint,
  add column if not exists amount_collected_minor bigint,
  add column if not exists access_type text,
  add column if not exists founding_invite_id uuid references public.founding_studio_invites(id) on delete set null;

update public.orders
set
  list_value_minor = coalesce(list_value_minor, amount_total),
  waiver_amount_minor = coalesce(waiver_amount_minor, 0),
  amount_collected_minor = coalesce(amount_collected_minor, amount_total),
  access_type = coalesce(access_type, 'paid')
where list_value_minor is null
   or waiver_amount_minor is null
   or amount_collected_minor is null
   or access_type is null;

create index if not exists founding_studio_invites_status_idx
  on public.founding_studio_invites(status, expires_at);
create index if not exists founding_studio_invites_email_idx
  on public.founding_studio_invites(lower(email));
create unique index if not exists founding_studio_invites_active_email_unique
  on public.founding_studio_invites(lower(email))
  where status in ('ready','opened','checkout_started');
create index if not exists founding_studio_invites_session_idx
  on public.founding_studio_invites(stripe_session_id)
  where stripe_session_id is not null;
create index if not exists orders_founding_invite_idx
  on public.orders(founding_invite_id)
  where founding_invite_id is not null;

alter table public.founding_checkout_slots enable row level security;
alter table public.founding_studio_invites enable row level security;
alter table public.founding_studio_onboarding enable row level security;

grant select, insert, update, delete on public.founding_checkout_slots to authenticated;
grant select, insert, update, delete on public.founding_studio_invites to authenticated;
grant select, insert, update, delete on public.founding_studio_onboarding to authenticated;

create policy "platform admins manage founding checkout slots"
on public.founding_checkout_slots for all
to authenticated
using ((select private.is_platform_admin()))
with check ((select private.is_platform_admin()));

create policy "platform admins manage founding studio invites"
on public.founding_studio_invites for all
to authenticated
using ((select private.is_platform_admin()))
with check ((select private.is_platform_admin()));

create policy "platform admins manage founding onboarding"
on public.founding_studio_onboarding for all
to authenticated
using ((select private.is_platform_admin()))
with check ((select private.is_platform_admin()));

create or replace function private.normalise_web_identity(value text)
returns text
language sql
immutable
set search_path = ''
as $$
  select lower(
    trim(
      trailing '/' from
      regexp_replace(
        trim(coalesce(value, '')),
        '^https?://(www\.)?',
        '',
        'i'
      )
    )
  );
$$;

create or replace function private.invite_slug(value text, suffix uuid)
returns text
language sql
immutable
set search_path = ''
as $$
  select trim(both '-' from regexp_replace(lower(coalesce(value, 'studio')), '[^a-z0-9]+', '-', 'g'))
         || '-' || left(suffix::text, 8);
$$;

create or replace function public.create_founding_studio_invite(
  p_studio_name text,
  p_contact_name text,
  p_email text,
  p_website text,
  p_reason text,
  p_token_hash text,
  p_token_hint text,
  p_expires_at timestamptz default (now() + interval '14 days')
)
returns table (
  invite_id uuid,
  slot_code text,
  expires_at timestamptz
)
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_slot public.founding_checkout_slots%rowtype;
  v_invite_id uuid;
begin
  if not private.is_platform_admin(array['owner','admin','editor']::text[]) then
    raise exception 'Platform admin access required';
  end if;

  if length(trim(coalesce(p_studio_name,''))) < 2
     or length(trim(coalesce(p_contact_name,''))) < 2 then
    raise exception 'Studio and contact names are required';
  end if;

  if position('@' in lower(trim(coalesce(p_email,'')))) <= 1 then
    raise exception 'A valid email address is required';
  end if;

  if p_token_hash !~ '^[0-9a-f]{64}$' then
    raise exception 'Invalid invitation token hash';
  end if;

  if p_expires_at <= now() or p_expires_at > now() + interval '90 days' then
    raise exception 'Invitation expiry must be between now and 90 days';
  end if;

  update public.founding_studio_invites
  set status = 'expired', updated_at = now()
  where status in ('ready','opened','checkout_started')
    and expires_at <= now();

  update public.founding_checkout_slots s
  set status = 'retired', retired_at = coalesce(retired_at, now()), updated_at = now()
  from public.founding_studio_invites i
  where s.assigned_invite_id = i.id
    and i.status = 'expired'
    and s.status = 'assigned';

  select *
  into v_slot
  from public.founding_checkout_slots
  where status = 'available'
  order by slot_code
  for update skip locked
  limit 1;

  if v_slot.slot_code is null then
    raise exception 'No complimentary checkout slots are available';
  end if;

  insert into public.founding_studio_invites (
    studio_name,
    contact_name,
    email,
    website,
    reason,
    token_hash,
    token_hint,
    slot_code,
    stripe_payment_link_id,
    stripe_payment_link_url,
    expires_at,
    created_by
  )
  values (
    trim(p_studio_name),
    trim(p_contact_name),
    lower(trim(p_email)),
    nullif(trim(coalesce(p_website,'')), ''),
    trim(p_reason),
    p_token_hash,
    left(trim(p_token_hint), 12),
    v_slot.slot_code,
    v_slot.stripe_payment_link_id,
    v_slot.stripe_payment_link_url,
    p_expires_at,
    auth.uid()
  )
  returning id into v_invite_id;

  update public.founding_checkout_slots
  set
    status = 'assigned',
    assigned_invite_id = v_invite_id,
    assigned_at = now(),
    updated_at = now()
  where slot_code = v_slot.slot_code;

  return query
  select v_invite_id, v_slot.slot_code, p_expires_at;
end;
$$;

revoke all on function public.create_founding_studio_invite(text,text,text,text,text,text,text,timestamptz) from public;
grant execute on function public.create_founding_studio_invite(text,text,text,text,text,text,text,timestamptz) to authenticated;

create or replace function public.revoke_founding_studio_invite(p_invite_id uuid)
returns void
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_slot text;
begin
  if not private.is_platform_admin(array['owner','admin','editor']::text[]) then
    raise exception 'Platform admin access required';
  end if;

  select slot_code into v_slot
  from public.founding_studio_invites
  where id = p_invite_id
    and status in ('ready','opened','checkout_started')
  for update;

  if v_slot is null then
    raise exception 'Invitation cannot be revoked';
  end if;

  update public.founding_studio_invites
  set status = 'revoked', revoked_at = now(), updated_at = now()
  where id = p_invite_id;

  update public.founding_checkout_slots
  set status = 'retired', retired_at = now(), updated_at = now()
  where slot_code = v_slot and status = 'assigned';
end;
$$;

revoke all on function public.revoke_founding_studio_invite(uuid) from public;
grant execute on function public.revoke_founding_studio_invite(uuid) to authenticated;

create or replace function public.resolve_founding_studio_invite(p_token_hash text)
returns table (
  studio_name text,
  contact_name text,
  email_hint text,
  invite_status text,
  list_value_minor bigint,
  waiver_amount_minor bigint,
  amount_due_minor bigint,
  expires_at timestamptz,
  can_checkout boolean
)
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_inv public.founding_studio_invites%rowtype;
begin
  if p_token_hash !~ '^[0-9a-f]{64}$' then
    return;
  end if;

  select * into v_inv
  from public.founding_studio_invites
  where token_hash = p_token_hash
  for update;

  if v_inv.id is null then
    return;
  end if;

  if v_inv.status in ('ready','opened','checkout_started') and v_inv.expires_at <= now() then
    update public.founding_studio_invites
    set status = 'expired', updated_at = now()
    where id = v_inv.id;

    update public.founding_checkout_slots
    set status = 'retired', retired_at = coalesce(retired_at, now()), updated_at = now()
    where assigned_invite_id = v_inv.id and status = 'assigned';

    v_inv.status := 'expired';
  elsif v_inv.status = 'ready' then
    update public.founding_studio_invites
    set status = 'opened', opened_at = coalesce(opened_at, now()), updated_at = now()
    where id = v_inv.id;
    v_inv.status := 'opened';
  end if;

  return query
  select
    v_inv.studio_name,
    v_inv.contact_name,
    left(v_inv.email, 2) || '***@' || split_part(v_inv.email, '@', 2),
    v_inv.status,
    v_inv.list_value_minor,
    v_inv.waiver_amount_minor,
    v_inv.amount_due_minor,
    v_inv.expires_at,
    (v_inv.status in ('ready','opened','checkout_started') and v_inv.expires_at > now());
end;
$$;

revoke all on function public.resolve_founding_studio_invite(text) from public;
grant execute on function public.resolve_founding_studio_invite(text) to anon, authenticated;

create or replace function public.begin_founding_studio_checkout(p_token_hash text)
returns table (checkout_url text)
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_inv public.founding_studio_invites%rowtype;
begin
  if p_token_hash !~ '^[0-9a-f]{64}$' then
    raise exception 'Invalid invitation';
  end if;

  select * into v_inv
  from public.founding_studio_invites
  where token_hash = p_token_hash
  for update;

  if v_inv.id is null
     or v_inv.status not in ('ready','opened','checkout_started')
     or v_inv.expires_at <= now() then
    raise exception 'Invitation is not available';
  end if;

  update public.founding_studio_invites
  set
    status = 'checkout_started',
    checkout_started_at = coalesce(checkout_started_at, now()),
    updated_at = now()
  where id = v_inv.id;

  return query select v_inv.stripe_payment_link_url;
end;
$$;

revoke all on function public.begin_founding_studio_checkout(text) from public;
grant execute on function public.begin_founding_studio_checkout(text) to anon, authenticated;

create or replace function public.resolve_founding_studio_completion(p_session_id text)
returns table (
  studio_name text,
  contact_name text,
  invite_status text,
  onboarding_status text,
  audit_id uuid,
  website text
)
language sql
security definer
set search_path = ''
as $$
  select
    i.studio_name,
    i.contact_name,
    i.status,
    i.onboarding_status,
    i.audit_id,
    i.website
  from public.founding_studio_invites i
  where i.stripe_session_id = p_session_id
    and i.status = 'completed'
  limit 1;
$$;

revoke all on function public.resolve_founding_studio_completion(text) from public;
grant execute on function public.resolve_founding_studio_completion(text) to anon, authenticated;

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
  on conflict (invite_id) do update set
    location = excluded.location,
    artist_count = excluded.artist_count,
    booking_process = excluded.booking_process,
    primary_goal = excluded.primary_goal,
    data_available = excluded.data_available,
    instagram_url = excluded.instagram_url,
    notes = excluded.notes,
    submitted_at = excluded.submitted_at,
    updated_at = now();

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

create or replace function public.process_founding_studio_checkout(
  p_event_id text,
  p_session_id text,
  p_payment_link_id text,
  p_customer_id text,
  p_email text,
  p_contact_name text,
  p_studio_name text,
  p_website text,
  p_currency text,
  p_amount_total bigint,
  p_livemode boolean
)
returns jsonb
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_inv public.founding_studio_invites%rowtype;
  v_order_id uuid;
  v_contact_id uuid;
  v_studio_id uuid;
  v_audit_id uuid;
  v_site text;
  v_existing_session text;
begin
  if p_livemode is not true or coalesce(p_amount_total, -1) <> 0 then
    return jsonb_build_object('ok',true,'skipped','not_complimentary_live_checkout');
  end if;

  select * into v_inv
  from public.founding_studio_invites
  where stripe_payment_link_id = p_payment_link_id
  for update;

  if v_inv.id is null then
    return jsonb_build_object('ok',true,'skipped','unassigned_checkout_slot');
  end if;

  if v_inv.status = 'completed' and v_inv.stripe_session_id = p_session_id then
    return jsonb_build_object(
      'ok',true,
      'replayed',true,
      'invite_id',v_inv.id,
      'order_id',v_inv.order_id,
      'contact_request_id',v_inv.contact_request_id,
      'audit_id',v_inv.audit_id
    );
  end if;

  if v_inv.status not in ('ready','opened','checkout_started') or v_inv.expires_at <= now() then
    return jsonb_build_object('ok',true,'skipped','invite_not_active','invite_id',v_inv.id);
  end if;

  if lower(trim(coalesce(p_email,''))) <> lower(v_inv.email) then
    update public.founding_studio_invites
    set status='failed', failure_reason='checkout_email_mismatch', updated_at=now()
    where id=v_inv.id;

    update public.founding_checkout_slots
    set status='consumed', consumed_at=now(), updated_at=now()
    where slot_code=v_inv.slot_code;

    return jsonb_build_object('ok',true,'skipped','invite_email_mismatch','invite_id',v_inv.id);
  end if;

  if length(trim(coalesce(p_contact_name,''))) < 2
     or length(trim(coalesce(p_studio_name,''))) < 2
     or length(trim(coalesce(p_website,''))) < 3 then
    update public.founding_studio_invites
    set status='failed', failure_reason='checkout_identity_incomplete', updated_at=now()
    where id=v_inv.id;

    update public.founding_checkout_slots
    set status='consumed', consumed_at=now(), updated_at=now()
    where slot_code=v_inv.slot_code;

    return jsonb_build_object('ok',true,'skipped','checkout_identity_incomplete','invite_id',v_inv.id);
  end if;

  v_site := case
    when trim(p_website) ~* '^https?://' then trim(p_website)
    else 'https://' || trim(p_website)
  end;

  insert into public.orders (
    stripe_customer_id,
    stripe_session_id,
    stripe_payment_intent_id,
    stripe_subscription_id,
    stripe_product_id,
    stripe_price_id,
    offer_slug,
    amount_total,
    currency,
    status,
    customer_email,
    metadata,
    list_value_minor,
    waiver_amount_minor,
    amount_collected_minor,
    access_type,
    founding_invite_id,
    updated_at
  )
  values (
    nullif(trim(coalesce(p_customer_id,'')), ''),
    p_session_id,
    null,
    null,
    null,
    null,
    'studio-intelligence-audit',
    0,
    lower(coalesce(nullif(trim(p_currency),''),'gbp')),
    'complimentary',
    lower(trim(p_email)),
    jsonb_build_object(
      'source','founding_studio_invite',
      'founding_invite_id',v_inv.id,
      'slot_code',v_inv.slot_code,
      'list_value_minor',v_inv.list_value_minor,
      'waiver_amount_minor',v_inv.waiver_amount_minor,
      'amount_collected_minor',0
    ),
    v_inv.list_value_minor,
    v_inv.waiver_amount_minor,
    0,
    'founding_studio',
    v_inv.id,
    now()
  )
  on conflict (stripe_session_id) do update set
    status='complimentary',
    customer_email=excluded.customer_email,
    metadata=public.orders.metadata || excluded.metadata,
    list_value_minor=excluded.list_value_minor,
    waiver_amount_minor=excluded.waiver_amount_minor,
    amount_collected_minor=0,
    access_type='founding_studio',
    founding_invite_id=v_inv.id,
    updated_at=now()
  returning id into v_order_id;

  select id into v_contact_id
  from public.public_contact_requests
  where metadata->>'founding_invite_id' = v_inv.id::text
  order by created_at asc
  limit 1;

  if v_contact_id is null then
    insert into public.public_contact_requests (
      name,
      email,
      studio_name,
      website,
      topic,
      message,
      source,
      status,
      consent_at,
      data_classification,
      business_key,
      platform_key,
      metadata,
      is_test,
      test_reason
    )
    values (
      trim(p_contact_name),
      lower(trim(p_email)),
      trim(p_studio_name),
      v_site,
      'studio-intelligence-audit',
      'Founding Studio invitation accepted. £395 Studio Intelligence Audit fee waived; begin onboarding.',
      'founding_studio_checkout',
      'new',
      now(),
      'external_unverified',
      'inksights_b2b',
      'inksights_b2b',
      jsonb_build_object(
        'founding_invite_id',v_inv.id,
        'stripe_session_id',p_session_id,
        'stripe_payment_link_id',p_payment_link_id,
        'stripe_customer_id',nullif(trim(coalesce(p_customer_id,'')), ''),
        'access_type','founding_studio',
        'list_value_minor',v_inv.list_value_minor,
        'waiver_amount_minor',v_inv.waiver_amount_minor,
        'amount_collected_minor',0,
        'page_path','/offers/studio-intelligence-audit'
      ),
      false,
      null
    )
    returning id into v_contact_id;
  end if;

  select id into v_studio_id
  from public.visibility_studios
  where private.normalise_web_identity(website_url) = private.normalise_web_identity(v_site)
    and private.normalise_web_identity(v_site) <> ''
  order by created_at asc
  limit 1;

  if v_studio_id is null then
    v_studio_id := gen_random_uuid();

    insert into public.visibility_studios (
      id,
      studio_name,
      website_url,
      status,
      canonical_status,
      identity_confidence,
      first_observed_at,
      last_observed_at
    )
    values (
      v_studio_id,
      trim(p_studio_name),
      v_site,
      'draft',
      'claimed',
      0.60,
      now(),
      now()
    );
  end if;

  insert into public.studios (
    id,
    name,
    slug,
    website_url,
    primary_location,
    internal_validation
  )
  values (
    v_studio_id,
    trim(p_studio_name),
    private.invite_slug(p_studio_name, v_studio_id),
    v_site,
    null,
    false
  )
  on conflict (id) do update set
    name=excluded.name,
    website_url=coalesce(public.studios.website_url,excluded.website_url),
    updated_at=now();

  if v_inv.audit_id is null then
    insert into public.audits (
      studio_id,
      audit_type,
      audit_version,
      mode,
      status,
      context,
      qa_status,
      report_status
    )
    values (
      v_studio_id,
      'studio_intelligence',
      '1.0',
      'A',
      'draft',
      jsonb_build_object(
        'lifecycle_state','awaiting_intake',
        'source','founding_studio_invite',
        'founding_invite_id',v_inv.id,
        'commercial_value_minor',v_inv.list_value_minor,
        'waiver_amount_minor',v_inv.waiver_amount_minor,
        'amount_collected_minor',0,
        'identity_classification','CLIENT_CLAIMED'
      ),
      'pending',
      'draft'
    )
    returning id into v_audit_id;
  else
    v_audit_id := v_inv.audit_id;
  end if;

  update public.founding_studio_invites
  set
    status='completed',
    studio_name=trim(p_studio_name),
    contact_name=trim(p_contact_name),
    website=v_site,
    stripe_session_id=p_session_id,
    stripe_customer_id=nullif(trim(coalesce(p_customer_id,'')), ''),
    order_id=v_order_id,
    contact_request_id=v_contact_id,
    studio_id=v_studio_id,
    audit_id=v_audit_id,
    completed_at=now(),
    failure_reason=null,
    updated_at=now()
  where id=v_inv.id;

  update public.founding_checkout_slots
  set status='consumed', consumed_at=now(), updated_at=now()
  where slot_code=v_inv.slot_code;

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
    'checkout.completed',
    now(),
    'stripe',
    p_event_id,
    'founding_checkout:' || p_session_id,
    v_inv.id,
    v_studio_id,
    v_contact_id::text,
    'received',
    jsonb_build_object(
      'event_kind','studio_intelligence_audit_complimentary',
      'invite_id',v_inv.id,
      'audit_id',v_audit_id,
      'order_id',v_order_id,
      'access_type','founding_studio',
      'list_value_minor',v_inv.list_value_minor,
      'waiver_amount_minor',v_inv.waiver_amount_minor,
      'amount_collected_minor',0
    )
  )
  on conflict (idempotency_key) do nothing;

  return jsonb_build_object(
    'ok',true,
    'invite_id',v_inv.id,
    'order_id',v_order_id,
    'contact_request_id',v_contact_id,
    'studio_id',v_studio_id,
    'audit_id',v_audit_id
  );
end;
$$;

revoke all on function public.process_founding_studio_checkout(text,text,text,text,text,text,text,text,text,bigint,boolean) from public;
grant execute on function public.process_founding_studio_checkout(text,text,text,text,text,text,text,text,text,bigint,boolean) to service_role;
