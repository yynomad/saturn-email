import { NextRequest, NextResponse } from 'next/server'
import { createServerSupabaseClient } from '@/lib/supabase-server'
import { DatabaseService } from '@/lib/database'

export async function GET(
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

    const mailboxId = params.id

    // Get mailbox details
    const mailbox = await db.getMailbox(mailboxId)
    
    if (!mailbox) {
      return NextResponse.json(
        { error: 'Mailbox not found' },
        { status: 404 }
      )
    }

    // Check if user owns this mailbox
    if (mailbox.user_id !== user.id) {
      return NextResponse.json(
        { error: 'Forbidden' },
        { status: 403 }
      )
    }

    // Get query parameters for pagination
    const { searchParams } = new URL(request.url)
    const page = parseInt(searchParams.get('page') || '1')
    const limit = parseInt(searchParams.get('limit') || '20')

    // Get emails for this mailbox
    const emails = await db.getMailboxEmails(mailboxId, page, limit)

    return NextResponse.json({
      success: true,
      mailbox,
      emails,
      pagination: {
        page,
        limit,
        hasMore: emails.length === limit
      }
    })

  } catch (error) {
    console.error('Error fetching mailbox:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const supabase = createServerSupabaseClient()

    // Get the current user
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    
    if (authError || !user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    const mailboxId = params.id
    const body = await request.json()
    const { name, description, is_active } = body

    // Update mailbox
    const { data: updatedMailbox, error } = await supabase
      .from('mailboxes')
      .update({
        name,
        description,
        is_active,
        updated_at: new Date().toISOString()
      })
      .eq('id', mailboxId)
      .eq('user_id', user.id) // Ensure user owns this mailbox
      .select()
      .single()

    if (error) {
      console.error('Error updating mailbox:', error)
      return NextResponse.json(
        { error: 'Failed to update mailbox' },
        { status: 500 }
      )
    }

    if (!updatedMailbox) {
      return NextResponse.json(
        { error: 'Mailbox not found or access denied' },
        { status: 404 }
      )
    }

    return NextResponse.json({
      success: true,
      mailbox: updatedMailbox
    })

  } catch (error) {
    console.error('Error updating mailbox:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const supabase = createServerSupabaseClient()

    // Get the current user
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    
    if (authError || !user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    const mailboxId = params.id

    // Soft delete by setting is_active to false
    const { data: deletedMailbox, error } = await supabase
      .from('mailboxes')
      .update({
        is_active: false,
        updated_at: new Date().toISOString()
      })
      .eq('id', mailboxId)
      .eq('user_id', user.id) // Ensure user owns this mailbox
      .select()
      .single()

    if (error) {
      console.error('Error deleting mailbox:', error)
      return NextResponse.json(
        { error: 'Failed to delete mailbox' },
        { status: 500 }
      )
    }

    if (!deletedMailbox) {
      return NextResponse.json(
        { error: 'Mailbox not found or access denied' },
        { status: 404 }
      )
    }

    return NextResponse.json({
      success: true,
      message: 'Mailbox deleted successfully'
    })

  } catch (error) {
    console.error('Error deleting mailbox:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
