import { createAdminClient, createSessionClient } from '@/lib/supabase/server'
import { badRequest, created, unauthorized, withErrorHandler } from '@/lib/api-response'

export const POST = withErrorHandler(async (req) => {
  // Must be logged-in admin
  const sessionClient = await createSessionClient()
  const { data: { user } } = await sessionClient.auth.getUser()
  if (!user) return unauthorized()

  let body: { email?: string; password?: string }
  try {
    body = await req.json()
  } catch {
    return badRequest('Request body must be valid JSON')
  }

  const { email, password } = body

  if (!email || !email.includes('@')) return badRequest('กรุณาระบุ email ที่ถูกต้อง')
  if (!password || password.length < 8)  return badRequest('รหัสผ่านต้องมีอย่างน้อย 8 ตัวอักษร')

  const supabase = createAdminClient()

  const { data, error } = await supabase.auth.admin.createUser({
    email,
    password,
    email_confirm: true,   // ข้ามขั้นตอน verify email
  })

  if (error) {
    if (error.message.toLowerCase().includes('already')) {
      return badRequest('Email นี้มีในระบบแล้ว')
    }
    throw error
  }

  return created({ success: true, userId: data.user.id, email: data.user.email })
})
