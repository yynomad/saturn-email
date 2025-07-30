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
    const body = await request.json()
    const { is_starred } = body

    if (typeof is_starred !== 'boolean') {
      return NextResponse.json(
        { error: 'is_starred must be a boolean' },
        { status: 400 }
      )
    }

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

    // Update star status
    const updatedEmail = await db.updateEmail(emailId, { is_starred })
    
    if (!updatedEmail) {
      return NextResponse.json(
        { error: 'Failed to update email' },
        { status: 500 }
      )
    }

    return NextResponse.json({
      success: true,
      email: updatedEmail
    })

  } catch (error) {
    console.error('Error updating email star status:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
