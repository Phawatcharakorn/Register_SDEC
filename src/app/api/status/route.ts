import { NextRequest } from 'next/server'
import { ok, badRequest, notFound, serverError, tooManyRequests } from '@/lib/api-response'
import { createAdminClient } from '@/lib/supabase/server'
import { rateLimit, getIP } from '@/lib/rate-limit'

// 30 lookups per IP per minute — enough for real use, stops enumeration
const RATE_LIMIT  = 30
const RATE_WINDOW = 60 * 1000   // 1 minute

export async function GET(req: NextRequest) {
  const ip = getIP(req)
  if (!rateLimit(`status:${ip}`, RATE_LIMIT, RATE_WINDOW)) {
    return tooManyRequests('ค้นหาบ่อยเกินไป กรุณารอสักครู่')
  }

  const q = req.nextUrl.searchParams.get('q')?.trim()
  if (!q) return badRequest('กรุณากรอกรหัสนิสิตหรือเลขที่ใบสมัคร')

  // Reject suspiciously long input
  if (q.length > 100) return badRequest('ข้อมูลที่ค้นหายาวเกินไป')

  const admin = createAdminClient()

  const isStudentId = /^\d{10}$/.test(q)

  const base = admin
    .from('applications')
    .select('id, full_name, student_id, status, created_at')

  const { data, error } = isStudentId
    ? await (base.eq('student_id', q) as typeof base).maybeSingle()
    : await (base.eq('id', q) as typeof base).maybeSingle()

  if (error) return serverError('เกิดข้อผิดพลาดในระบบ')
  if (!data)  return notFound('ไม่พบข้อมูลการสมัคร')

  return ok({
    id:         data.id         as string,
    full_name:  data.full_name  as string,
    student_id: data.student_id as string,
    status:     data.status     as string,
    created_at: data.created_at as string,
  })
}
