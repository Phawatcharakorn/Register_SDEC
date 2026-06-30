import { NextRequest } from 'next/server'
import { ok, badRequest, notFound, serverError } from '@/lib/api-response'
import { createAdminClient } from '@/lib/supabase/server'

export async function GET(req: NextRequest) {
  const q = req.nextUrl.searchParams.get('q')?.trim()
  if (!q) return badRequest('กรุณากรอกรหัสนิสิตหรือเลขที่ใบสมัคร')

  const admin = createAdminClient()

  // student_id = 10 digits, otherwise treat as UUID reference
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
