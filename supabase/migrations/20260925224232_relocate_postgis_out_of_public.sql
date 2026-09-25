drop index if exists public.idx_studio_candidates_location_gist;
drop index if exists public.idx_visibility_studios_location_gist;

alter table public.studio_candidates drop column location;
alter table public.visibility_studios drop column location;

drop extension postgis;
create extension postgis schema extensions;

alter table public.studio_candidates
  add column location extensions.geography(Point,4326);

alter table public.visibility_studios
  add column location extensions.geography(Point,4326);

create index idx_studio_candidates_location_gist
  on public.studio_candidates using gist (location);

create index idx_visibility_studios_location_gist
  on public.visibility_studios using gist (location);
