import { Suspense } from 'react'
import { notFound } from 'next/navigation'
import { createServerSupabaseClient } from '@/lib/supabase-server'
import { DatabaseService } from '@/lib/database'
import { MailboxHeader } from '@/components/mailbox/mailbox-header'
import { EmailList } from '@/components/mailbox/email-list'
import { EmailListSkeleton } from '@/components/mailbox/email-list-skeleton'

interface MailboxPageProps {
  params: {
    id: string
  }
  searchParams: {
    page?: string
    search?: string
  }
}

export default async function MailboxPage({ params, searchParams }: MailboxPageProps) {
  const supabase = createServerSupabaseClient()
  const db = new DatabaseService()

  // Get the current user
  const { data: { user }, error: authError } = await supabase.auth.getUser()
  
  if (authError || !user) {
    notFound()
  }

  // Get mailbox details
  const mailbox = await db.getMailbox(params.id)
  
  if (!mailbox || mailbox.user_id !== user.id) {
    notFound()
  }

  const page = parseInt(searchParams.page || '1')
  const searchQuery = searchParams.search

  return (
    <div className="container mx-auto px-4 py-8">
      <MailboxHeader mailbox={mailbox} />
      
      <div className="mt-8">
        <Suspense fallback={<EmailListSkeleton />}>
          <EmailList 
            mailboxId={params.id}
            page={page}
            searchQuery={searchQuery}
          />
        </Suspense>
      </div>
    </div>
  )
}

export async function generateMetadata({ params }: { params: { id: string } }) {
  const supabase = createServerSupabaseClient()
  const db = new DatabaseService()

  try {
    const mailbox = await db.getMailbox(params.id)
    
    if (!mailbox) {
      return {
        title: 'Mailbox Not Found'
      }
    }

    return {
      title: `${mailbox.name || mailbox.email_address} - Saturn Email`,
      description: `View emails for ${mailbox.email_address}`
    }
  } catch (error) {
    return {
      title: 'Mailbox - Saturn Email'
    }
  }
}
