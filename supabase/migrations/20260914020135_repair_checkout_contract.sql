-- Restore the server-side Stripe checkout persistence contract used by /api/public/stripe-webhook.
-- Browser roles do not receive direct access; writes occur through the service-role server client.

create table if not exists public.orders (
  id uuid primary key default gen_random_uuid(),
  stripe_customer_id text,
  stripe_session_id text not null unique,
  stripe_payment_intent_id text,
  stripe_subscription_id text,
  stripe_product_id text,
  stripe_price_id text,
  offer_slug text not null,
  amount_total bigint,
  currency text,
  status text not null default 'pending',
  customer_email text,
  user_id uuid references auth.users(id) on delete set null,
  metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists idx_orders_user_created on public.orders(user_id, created_at desc);
create index if not exists idx_orders_customer_email on public.orders(lower(customer_email));
create index if not exists idx_orders_offer_status on public.orders(offer_slug, status);

alter table public.orders enable row level security;
revoke all on public.orders from anon, authenticated;
