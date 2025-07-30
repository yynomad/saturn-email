import { NextRequest, NextResponse } from 'next/server'
import { createServerSupabaseClient } from '@/lib/supabase'
import { DatabaseService } from '@/lib/database'

export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
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

    const emailId = params.id

    // Get email to verify ownership
    const email = await db.getEmail(emailId)
    
    if (!email) {
      return NextResponse.json(
        { error: 'Email not found' },
        { status: 404 }
      )
    }

    // Verify user owns the mailbox containing this email
    const mailbox = await db.getMailbox(email.mailbox_id)
    
    if (!mailbox || mailbox.user_id !== user.id) {
      return NextResponse.json(
        { error: 'Forbidden' },
        { status: 403 }
      )
    }

    // Mark email as read
    const success = await db.markEmailAsRead(emailId)
    
    if (!success) {
      return NextResponse.json(
        { error: 'Failed to mark email as read' },
        { status: 500 }
      )
    }

    return NextResponse.json({
      success: true,
      message: 'Email marked as read'
    })

  } catch (error) {
    console.error('Error marking email as read:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
