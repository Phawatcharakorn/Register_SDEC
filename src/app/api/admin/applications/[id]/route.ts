import { createAdminClient, createSessionClient } from '@/lib/supabase/server'
import {
  badRequest,
  noContent,
  notFound,
  ok,
  serverError,
  unauthorized,
  withErrorHandler,
} from '@/lib/api-response'
import type {
  AdminApplicationDetailResponse,
  UpdateApplicationBody,
  UpdateApplicationResponse,
} from '@/types/api'
import type { Application } from '@/types/database'

const SIGNED_URL_EXPIRES = 60 * 60   // 1 hour

// ------------------------------------------------------------------
// GET /api/admin/applications/[id]
// ------------------------------------------------------------------
export const GET = withErrorHandler(async (_req, ctx) => {
  const sessionClient = await createSessionClient()
  const { data: { user } } = await sessionClient.auth.getUser()
  if (!user) return unauthorized()

  const { id } = await ctx.params

  const supabase = createAdminClient()

  const { data: rawData, error } = await supabase
    .from('applications')
    .select('*')
    .eq('id', id)
    .maybeSingle()

  if (error) throw error
  if (!rawData) return notFound('Application not found')

  const data = rawData as unknown as Application

  // Generate signed URL for the private resume bucket
  let resumeSignedUrl: string | null = null
  if (data.resume_url) {
    const { data: signed, error: signErr } = await supabase.storage
      .from('applicant-resumes')
      .createSignedUrl(data.resume_url, SIGNED_URL_EXPIRES)

    if (signErr) {
      console.error('[admin/applications/[id]] resume sign failed:', signErr)
    } else {
      resumeSignedUrl = signed.signedUrl
    }
  }

  return ok<AdminApplicationDetailResponse>({
    data: {
      ...data,
      year: data.year as 1 | 2 | 3 | 4,
      resume_url: resumeSignedUrl,
    },
  })
})

// ------------------------------------------------------------------
// PATCH /api/admin/applications/[id]
// ------------------------------------------------------------------
export const PATCH = withErrorHandler(async (req, ctx) => {
  const sessionClient = await createSessionClient()
  const { data: { user } } = await sessionClient.auth.getUser()
  if (!user) return unauthorized()

  const { id } = await ctx.params

  let body: UpdateApplicationBody
  try {
    body = await req.json()
  } catch {
    return badRequest('Request body must be valid JSON')
  }

  // Validate
  const VALID_STATUSES = ['approved', 'rejected']
  if (!body.status || !VALID_STATUSES.includes(body.status)) {
    return badRequest(`status must be one of: ${VALID_STATUSES.join(', ')}`)
  }
  if (body.admin_note !== undefined && typeof body.admin_note !== 'string') {
    return badRequest('admin_note must be a string')
  }

  const supabase = createAdminClient()

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { data: rawUpdate, error } = await (supabase as any)
    .from('applications')
    .update({
      status:     body.status,
      admin_note: body.admin_note ?? null,
    })
    .eq('id', id)
    .select('id, status, admin_note')
    .maybeSingle()

  if (error) throw error
  if (!rawUpdate) return notFound('Application not found')

  const data = rawUpdate as Pick<Application, 'id' | 'status' | 'admin_note'>

  return ok<UpdateApplicationResponse>({ success: true, data })
})

// ------------------------------------------------------------------
// DELETE /api/admin/applications/[id]
// ------------------------------------------------------------------
export const DELETE = withErrorHandler(async (_req, ctx) => {
  const sessionClient = await createSessionClient()
  const { data: { user } } = await sessionClient.auth.getUser()
  if (!user) return unauthorized()

  const { id } = await ctx.params
  const supabase = createAdminClient()

  // 1. Fetch file paths before deleting the row
  const { data: rawApp, error: fetchErr } = await supabase
    .from('applications')
    .select('student_id, photo_url, resume_url')
    .eq('id', id)
    .maybeSingle()

  if (fetchErr) throw fetchErr
  if (!rawApp) return notFound('Application not found')

  const app = rawApp as { student_id: string; photo_url: string | null; resume_url: string | null }

  // 2. Delete files from storage (best-effort, don't fail the request if missing)
  const removeOps: Promise<unknown>[] = []
  const photoPath = `${app.student_id}/photo.jpg`
  const photoPng  = `${app.student_id}/photo.png`
  const resumePath = app.resume_url ?? `${app.student_id}/resume.pdf`

  removeOps.push(
    supabase.storage.from('applicant-photos').remove([photoPath, photoPng]),
    supabase.storage.from('applicant-resumes').remove([resumePath]),
  )
  await Promise.allSettled(removeOps)

  // 3. Delete the database row
  const { error: deleteErr } = await supabase
    .from('applications')
    .delete()
    .eq('id', id)

  if (deleteErr) throw deleteErr

  return noContent()
})
