import { createAdminClient, createSessionClient } from '@/lib/supabase/server'
import { badRequest, ok, unauthorized, withErrorHandler } from '@/lib/api-response'

export const GET = withErrorHandler(async () => {
  const supabase = createAdminClient()
  const { data, error } = await supabase.from('settings').select('key, value')
  if (error) throw error
  const map = Object.fromEntries((data ?? []).map((r: { key: string; value: string }) => [r.key, r.value]))
  return ok(map)
})

export const PATCH = withErrorHandler(async (req) => {
  const sessionClient = await createSessionClient()
  const { data: { user } } = await sessionClient.auth.getUser()
  if (!user) return unauthorized()

  let body: { open_date?: string; close_date?: string; is_open?: boolean }
  try { body = await req.json() } catch { return badRequest('Invalid JSON') }

  const supabase = createAdminClient()
  const updates: { key: string; value: string }[] = []

  if (body.open_date !== undefined) {
    if (typeof body.open_date !== 'string' || body.open_date.length > 100)
      return badRequest('open_date ไม่ถูกต้อง')
    updates.push({ key: 'open_date', value: body.open_date.trim() })
  }
  if (body.close_date !== undefined) {
    if (typeof body.close_date !== 'string' || body.close_date.length > 100)
      return badRequest('close_date ไม่ถูกต้อง')
    updates.push({ key: 'close_date', value: body.close_date.trim() })
  }
  if (body.is_open !== undefined) {
    updates.push({ key: 'is_open', value: String(body.is_open) })
  }

  if (updates.length === 0) return badRequest('ไม่มีข้อมูลที่ต้องการอัปเดต')

  for (const { key, value } of updates) {
    const { error } = await supabase
      .from('settings')
      .upsert({ key, value, updated_at: new Date().toISOString() }, { onConflict: 'key' })
    if (error) throw error
  }

  return ok({ success: true })
})
