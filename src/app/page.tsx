import { Suspense } from 'react'
import { createServerSupabaseClient } from '@/lib/supabase-server'
import { DatabaseService } from '@/lib/database'
import { MailboxDashboard } from '@/components/dashboard/mailbox-dashboard'
import { DashboardSkeleton } from '@/components/dashboard/dashboard-skeleton'
import { redirect } from 'next/navigation'

export default async function Home() {
  const supabase = createServerSupabaseClient()
  const db = new DatabaseService()

  // Get the current user
  const { data: { user }, error: authError } = await supabase.auth.getUser()

  if (authError || !user) {
    redirect('/auth/login')
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">
          Saturn Email Dashboard
        </h1>
        <p className="text-gray-600">
          Manage your infinite email addresses and view your messages
        </p>
      </div>

      <Suspense fallback={<DashboardSkeleton />}>
        <MailboxDashboard userId={user.id} />
      </Suspense>
    </div>
  )
}
