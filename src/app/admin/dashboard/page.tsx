import { redirect } from 'next/navigation'
import { createSessionClient } from '@/lib/supabase/server'
import DashboardClient from './DashboardClient'

export const dynamic = 'force-dynamic'

export default async function DashboardPage() {
  const supabase = await createSessionClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) redirect('/admin')

  return <DashboardClient userEmail={user.email ?? ''} />
}
