create table if not exists public.visibility_provider_configs (
  id uuid primary key default gen_random_uuid(),
  provider text not null check (provider in ('google_ads','dataforseo','google_search_console','semrush')),
  scope text not null default 'global' check (scope in ('global','studio')),
  studio_id uuid references public.visibility_studios(id) on delete cascade,
  enabled boolean not null default true,
  capabilities jsonb not null default '[]'::jsonb,
  config jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique(provider, scope, studio_id)
);

alter table public.visibility_provider_configs enable row level security;
create index if not exists idx_visibility_provider_configs_provider on public.visibility_provider_configs(provider, enabled);

create or replace function public.get_search_provider_status(p_studio_id uuid default null)
returns jsonb language sql security invoker set search_path = public, pg_catalog as $$
  select coalesce(jsonb_agg(jsonb_build_object('provider', provider, 'scope', scope, 'studio_id', studio_id, 'enabled', enabled, 'capabilities', capabilities) order by provider), '[]'::jsonb)
  from public.visibility_provider_configs
  where enabled = true and (scope = 'global' or studio_id = p_studio_id);
$$;
revoke all on function public.get_search_provider_status(uuid) from public;
grant execute on function public.get_search_provider_status(uuid) to authenticated;
