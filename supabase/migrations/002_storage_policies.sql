-- ============================================================
-- Migration: 002_storage_policies.sql
-- Storage bucket RLS policies for SDEC application files
-- ============================================================
-- NOTE: Buckets must be created first (via Dashboard or API).
-- See storage-setup.md for bucket creation steps.
-- Run this script AFTER buckets exist.
-- ----------------------------------------------------------

-- ----------------------------------------------------------
-- Bucket: applicant-photos  (public bucket)
-- ----------------------------------------------------------

-- Anyone can read photos (public bucket)
create policy "photos_public_read"
  on storage.objects
  for select
  to anon, authenticated
  using (bucket_id = 'applicant-photos');

-- Only authenticated users can upload photos
create policy "photos_authenticated_insert"
  on storage.objects
  for insert
  to authenticated
  with check (bucket_id = 'applicant-photos');

-- Only authenticated users can update/delete photos
create policy "photos_authenticated_update"
  on storage.objects
  for update
  to authenticated
  using (bucket_id = 'applicant-photos');

create policy "photos_authenticated_delete"
  on storage.objects
  for delete
  to authenticated
  using (bucket_id = 'applicant-photos');

-- ----------------------------------------------------------
-- Bucket: applicant-resumes  (private bucket)
-- ----------------------------------------------------------

-- Only authenticated users can read resumes
create policy "resumes_authenticated_read"
  on storage.objects
  for select
  to authenticated
  using (bucket_id = 'applicant-resumes');

-- Only authenticated users can upload resumes
create policy "resumes_authenticated_insert"
  on storage.objects
  for insert
  to authenticated
  with check (bucket_id = 'applicant-resumes');

-- Only authenticated users can update/delete resumes
create policy "resumes_authenticated_update"
  on storage.objects
  for update
  to authenticated
  using (bucket_id = 'applicant-resumes');

create policy "resumes_authenticated_delete"
  on storage.objects
  for delete
  to authenticated
  using (bucket_id = 'applicant-resumes');
