import { redirect } from 'next/navigation'
import { createSessionClient } from '@/lib/supabase/server'
import DetailClient from './DetailClient'

export const dynamic = 'force-dynamic'

export default async function ApplicationDetailPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const supabase = await createSessionClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) redirect('/admin')

  const { id } = await params

  return <DetailClient id={id} />
}
