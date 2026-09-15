-- Private Golden Audit source storage.
insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values (
  'audit-sources',
  'audit-sources',
  false,
  26214400,
  array['text/plain','text/csv','application/csv','application/octet-stream']::text[]
)
on conflict (id) do update
set public = false,
    file_size_limit = excluded.file_size_limit,
    allowed_mime_types = excluded.allowed_mime_types;

drop policy if exists "golden audit source tenant read" on storage.objects;
create policy "golden audit source tenant read"
on storage.objects
for select
to authenticated
using (
  bucket_id = 'audit-sources'
  and (storage.foldername(name))[1] = 'studio'
  and (storage.foldername(name))[3] = 'audit'
  and public.can_read_studio(((storage.foldername(name))[2])::uuid)
);

-- No authenticated insert/update/delete policy is granted. Service role owns source writes.
