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

  const { email: rawIdentifier, password } = body

  if (!rawIdentifier) return badRequest('กรุณาระบุ Email หรือ Username')
  if (!password || password.length < 8) return badRequest('รหัสผ่านต้องมีอย่างน้อย 8 ตัวอักษร')
  if (password.length > 72) return badRequest('รหัสผ่านยาวเกินไป')

  let email: string
  if (rawIdentifier.includes('@')) {
    // Real email — basic format check
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(rawIdentifier)) {
      return badRequest('รูปแบบ Email ไม่ถูกต้อง')
    }
    if (rawIdentifier.length > 254) return badRequest('Email ยาวเกินไป')
    email = rawIdentifier
  } else {
    // Username — allow only alphanumeric, underscore, hyphen (3–30 chars)
    if (!/^[a-zA-Z0-9_-]{3,30}$/.test(rawIdentifier)) {
      return badRequest('Username ต้องเป็นตัวอักษร a-z, 0-9, _ หรือ - ความยาว 3-30 ตัว')
    }
    email = `${rawIdentifier}@sdec.admin`
  }

  const supabase = createAdminClient()

  const { data, error } = await supabase.auth.admin.createUser({
    email,
    password,
    email_confirm: true,
  })

  if (error) {
    if (error.message.toLowerCase().includes('already')) {
      return badRequest('Username/Email นี้มีในระบบแล้ว')
    }
    throw error
  }

  // Show username (without @sdec.admin) or real email
  const displayName = data.user.email?.endsWith('@sdec.admin')
    ? data.user.email.replace('@sdec.admin', '')
    : data.user.email

  return created({ success: true, userId: data.user.id, email: displayName })
})
