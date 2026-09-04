create table if not exists public.public_endpoint_rate_limits (
  endpoint text not null,
  key_hash text not null,
  window_started_at timestamptz not null,
  request_count integer not null default 0 check (request_count >= 0),
  last_seen_at timestamptz not null default now(),
  primary key (endpoint, key_hash, window_started_at)
);

alter table public.public_endpoint_rate_limits enable row level security;
drop policy if exists "public endpoint rate limits service role only" on public.public_endpoint_rate_limits;
create policy "public endpoint rate limits service role only" on public.public_endpoint_rate_limits
for all to service_role using (true) with check (true);

create index if not exists idx_public_endpoint_rate_limits_cleanup
  on public.public_endpoint_rate_limits(last_seen_at);
