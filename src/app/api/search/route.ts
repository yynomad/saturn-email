import { NextRequest, NextResponse } from 'next/server'
import { createServerSupabaseClient } from '@/lib/supabase-server'
import { DatabaseService } from '@/lib/database'

export async function GET(request: NextRequest) {
  try {
    const supabase = createServerSupabaseClient()
    const db = new DatabaseService()

    // Get the current user
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    
    if (authError || !user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    const { searchParams } = new URL(request.url)
    const query = searchParams.get('q')
    const mailboxId = searchParams.get('mailbox_id')

    if (!query || query.trim().length < 2) {
      return NextResponse.json(
        { error: 'Search query must be at least 2 characters long' },
        { status: 400 }
      )
    }

    // Search emails
    const emails = await db.searchEmails(user.id, query.trim(), mailboxId || undefined)

    return NextResponse.json({
      success: true,
      emails,
      query: query.trim(),
      mailbox_id: mailboxId,
      count: emails.length
    })

  } catch (error) {
    console.error('Error searching emails:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
