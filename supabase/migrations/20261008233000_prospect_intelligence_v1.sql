-- Prospect Intelligence v1: preserve unknown studio maturity and register internal research provenance.
-- Prepared for review only. Apply through the normal migration/approval path.
begin;

alter table public.visibility_studios
  alter column artist_count drop not null,
  alter column artist_count drop default;

comment on column public.visibility_studios.artist_count is
  'Observed or owner-supplied artist count. NULL means unknown; do not coerce unobserved team size to zero.';

insert into public.studio_sources (
  source_key,
  source_name,
  source_type,
  access_method,
  permitted_for_commercial_use,
  notes,
  active,
  refresh_interval_days
)
values (
  'inksights_prospect_research',
  'INKSIGHTS Prospect Research',
  'other',
  'manual',
  true,
  'Internal analyst/operator research used to seed prospect identity from public business information. Individual observations retain their original URLs, timestamps and confidence; this source does not make third-party facts verified by itself.',
  true,
  30
)
on conflict (source_key) do nothing;

create index if not exists audits_audit_type_created_idx
  on public.audits (audit_type, created_at desc);

commit;
