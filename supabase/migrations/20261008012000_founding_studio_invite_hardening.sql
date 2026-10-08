-- Harden the private handoff by pre-filling the invited email in Stripe Checkout.
drop function if exists public.begin_founding_studio_checkout(text);

create or replace function public.begin_founding_studio_checkout(p_token_hash text)
returns table (
  checkout_url text,
  checkout_email text
)
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

  return query
  select v_inv.stripe_payment_link_url, v_inv.email;
end;
$$;

revoke all on function public.begin_founding_studio_checkout(text) from public;
grant execute on function public.begin_founding_studio_checkout(text) to anon, authenticated;
