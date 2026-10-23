-- Profile version history for confirmed studio-claim owners.
-- Append-only snapshots are maintained by a default SECURITY INVOKER trigger (no RLS bypass).
create table if not exists public.studio_directory_profile_versions (
  id uuid primary key default gen_random_uuid(),
  candidate_id uuid not null references public.studio_candidates(id) on delete restrict,
  prior_profile jsonb,
  next_profile jsonb not null,
  changed_at timestamptz not null default now()
);
alter table public.studio_directory_profile_versions enable row level security;
revoke all on public.studio_directory_profile_versions from public, anon, authenticated;
grant select,insert on public.studio_directory_profile_versions to service_role;

create or replace function public.audit_studio_directory_profile_change()
returns trigger
language plpgsql
security invoker
set search_path = ''
as $$
begin
  insert into public.studio_directory_profile_versions
    (candidate_id, prior_profile, next_profile)
  values
    (new.candidate_id,
     case when tg_op = 'UPDATE' then to_jsonb(old) else null end,
     to_jsonb(new));
  return new;
end;
$$;
revoke all on function public.audit_studio_directory_profile_change() from public, anon, authenticated;
grant execute on function public.audit_studio_directory_profile_change() to service_role;
drop trigger if exists studio_directory_profiles_version on public.studio_directory_profiles;
create trigger studio_directory_profiles_version
after insert or update on public.studio_directory_profiles
for each row execute function public.audit_studio_directory_profile_change();
