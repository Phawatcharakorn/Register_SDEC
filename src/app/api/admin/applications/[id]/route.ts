import { createAdminClient, createSessionClient } from '@/lib/supabase/server'
import {
  badRequest,
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

  const { data, error } = await supabase
    .from('applications')
    .select('*')
    .eq('id', id)
    .maybeSingle()

  if (error) throw error
  if (!data) return notFound('Application not found')

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

  const { data, error } = await supabase
    .from('applications')
    .update({
      status:     body.status,
      admin_note: body.admin_note ?? null,
    })
    .eq('id', id)
    .select('id, status, admin_note')
    .maybeSingle()

  if (error) throw error
  if (!data) return notFound('Application not found')

  return ok<UpdateApplicationResponse>({ success: true, data })
})
