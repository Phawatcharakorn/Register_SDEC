import { createAdminClient, createSessionClient } from '@/lib/supabase/server'
import { badRequest, ok, unauthorized, withErrorHandler } from '@/lib/api-response'
import type { AdminApplicationsQuery, AdminApplicationsResponse, ApplicationListItem } from '@/types/api'
import type { ApplicationStatus } from '@/types/database'

const DEFAULT_LIMIT = 20
const MAX_LIMIT = 100
const SIGNED_URL_EXPIRES = 60 * 60   // 1 hour

export const GET = withErrorHandler(async (req) => {
  // 1. Verify session
  const sessionClient = await createSessionClient()
  const { data: { user } } = await sessionClient.auth.getUser()
  if (!user) return unauthorized()

  // 2. Parse query params
  const url = new URL(req.url)
  const query: AdminApplicationsQuery = {
    search: url.searchParams.get('search') ?? undefined,
    status: (url.searchParams.get('status') ?? 'all') as AdminApplicationsQuery['status'],
    page:   Math.max(1, parseInt(url.searchParams.get('page')  ?? '1',  10)),
    limit:  Math.min(MAX_LIMIT, Math.max(1, parseInt(url.searchParams.get('limit') ?? String(DEFAULT_LIMIT), 10))),
  }

  if (isNaN(query.page!))  return badRequest('page must be a number')
  if (isNaN(query.limit!)) return badRequest('limit must be a number')

  const VALID_STATUSES = ['all', 'pending', 'approved', 'rejected']
  if (query.status && !VALID_STATUSES.includes(query.status)) {
    return badRequest(`status must be one of: ${VALID_STATUSES.join(', ')}`)
  }

  // 3. Build query — exclude heavy/sensitive fields from list view
  const supabase = createAdminClient()
  const from = ((query.page! - 1) * query.limit!)
  const to   = from + query.limit! - 1

  let dbQuery = supabase
    .from('applications')
    .select(
      'id, created_at, full_name, student_id, faculty, major, year, gpa, phone, email, photo_url, status',
      { count: 'exact' },
    )
    .order('created_at', { ascending: false })
    .range(from, to)

  if (query.status && query.status !== 'all') {
    dbQuery = dbQuery.eq('status', query.status as ApplicationStatus)
  }

  if (query.search) {
    dbQuery = dbQuery.or(
      `full_name.ilike.%${query.search}%,student_id.ilike.%${query.search}%`,
    )
  }

  const { data, count, error } = await dbQuery

  if (error) {
    console.error('[admin/applications] select failed:', error)
    throw error   // caught by withErrorHandler → 500
  }

  // 4. Replace stored photo paths with public URLs
  //    (photos bucket is public so no signing needed — just ensure the URL is present)
  const rows: ApplicationListItem[] = (data ?? []).map((row) => ({
    ...row,
    year: row.year as 1 | 2 | 3 | 4,
    photo_url: row.photo_url ?? null,
  }))

  const total = count ?? 0

  return ok<AdminApplicationsResponse>({
    data:       rows,
    total,
    page:       query.page!,
    limit:      query.limit!,
    totalPages: Math.ceil(total / query.limit!),
  })
})
