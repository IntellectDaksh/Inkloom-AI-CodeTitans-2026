-- Private bucket for uploaded originals (evidence, brand books, ad files).
-- The server uploads with the service role and hands out short-lived signed URLs
-- from /api/files/[id]; browsers never read the bucket directly.
insert into storage.buckets (id, name, public, file_size_limit)
values ('evidence', 'evidence', false, 15728640)
on conflict (id) do update set public = false, file_size_limit = excluded.file_size_limit;

-- RLS is on for storage.objects by default. Deny direct client access to this bucket:
-- no select/insert/update/delete policies for anon or authenticated. The service role bypasses RLS.
drop policy if exists "evidence no client access" on storage.objects;
create policy "evidence no client access" on storage.objects
  as restrictive for all to anon, authenticated
  using (bucket_id <> 'evidence')
  with check (bucket_id <> 'evidence');
