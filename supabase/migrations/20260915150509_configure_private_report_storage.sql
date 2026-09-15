insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values (
  'studio-reports',
  'studio-reports',
  false,
  26214400,
  array['application/pdf', 'application/json']::text[]
)
on conflict (id) do update
set public = false,
    file_size_limit = excluded.file_size_limit,
    allowed_mime_types = excluded.allowed_mime_types;

drop policy if exists "studio report members can read" on storage.objects;
create policy "studio report members can read"
on storage.objects
for select
to authenticated
using (
  bucket_id = 'studio-reports'
  and exists (
    select 1
    from public.studio_members sm
    where sm.user_id = (select auth.uid())
      and sm.active
      and (storage.foldername(name))[1] = sm.studio_id::text
  )
);
