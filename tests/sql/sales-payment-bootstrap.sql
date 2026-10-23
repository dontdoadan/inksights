-- Minimal production-compatible schema fixture for isolated CI PostgreSQL.
CREATE ROLE service_role NOLOGIN;
CREATE ROLE authenticated NOLOGIN;
CREATE ROLE anon NOLOGIN;
GRANT USAGE ON SCHEMA public TO service_role, authenticated, anon;
CREATE TABLE public.orders (
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
 metadata jsonb not null default '{}'::jsonb,
 created_at timestamptz not null default now(),
 updated_at timestamptz not null default now(),
 list_value_minor bigint,
 waiver_amount_minor bigint,
 amount_collected_minor bigint,
 access_type text
);
ALTER TABLE public.orders ENABLE ROW LEVEL SECURITY;
REVOKE ALL ON public.orders FROM PUBLIC,anon,authenticated;
GRANT SELECT,INSERT,UPDATE ON public.orders TO service_role;
