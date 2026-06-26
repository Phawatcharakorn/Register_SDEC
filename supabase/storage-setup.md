# Storage Bucket Setup — SDEC Application System

## 1. Create Buckets

### Option A — Supabase Dashboard

1. Go to **Storage** → **New Bucket**
2. Create `applicant-photos`:
   - Public bucket: **Yes**
   - Allowed MIME types: `image/jpeg, image/png`
   - Max file size: `2097152` (2 MB)
3. Create `applicant-resumes`:
   - Public bucket: **No**
   - Allowed MIME types: `application/pdf`
   - Max file size: `5242880` (5 MB)

### Option B — Supabase Management API (or seed script)

```ts
import { createClient } from '@supabase/supabase-js'

const supabase = createClient(process.env.SUPABASE_URL!, process.env.SUPABASE_SERVICE_ROLE_KEY!)

await supabase.storage.createBucket('applicant-photos', {
  public: true,
  allowedMimeTypes: ['image/jpeg', 'image/png'],
  fileSizeLimit: 2 * 1024 * 1024, // 2 MB
})

await supabase.storage.createBucket('applicant-resumes', {
  public: false,
  allowedMimeTypes: ['application/pdf'],
  fileSizeLimit: 5 * 1024 * 1024, // 5 MB
})
```

## 2. Apply Storage RLS Policies

Run `002_storage_policies.sql` in the Supabase SQL Editor **after** the buckets exist.

## 3. Upload Helper (Next.js)

```ts
// lib/storage.ts
import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
)

export async function uploadPhoto(file: File, studentId: string) {
  const ext = file.name.split('.').pop()
  const path = `${studentId}/photo.${ext}`

  const { error } = await supabase.storage
    .from('applicant-photos')
    .upload(path, file, { upsert: true })

  if (error) throw error

  const { data } = supabase.storage
    .from('applicant-photos')
    .getPublicUrl(path)

  return data.publicUrl
}

export async function uploadResume(file: File, studentId: string) {
  const path = `${studentId}/resume.pdf`

  const { error } = await supabase.storage
    .from('applicant-resumes')
    .upload(path, file, { upsert: true })

  if (error) throw error

  // Private bucket — generate a signed URL (valid 1 hour)
  const { data, error: signErr } = await supabase.storage
    .from('applicant-resumes')
    .createSignedUrl(path, 60 * 60)

  if (signErr) throw signErr
  return data.signedUrl
}
```

## 4. File Naming Convention

```
applicant-photos/{student_id}/photo.{jpg|png}
applicant-resumes/{student_id}/resume.pdf
```

Using `student_id` as the folder keeps files organized and prevents collisions.
