import { NextRequest, NextResponse } from 'next/server'
import { createServerSupabaseClient } from '@/lib/supabase-server'
import { DatabaseService } from '@/lib/database'
import { mailboxGenerator } from '@/lib/mailbox-generator'

export async function POST(request: NextRequest) {
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

    // Parse request body
    const body = await request.json()
    const { 
      type = 'random', 
      prefix, 
      theme, 
      name, 
      description 
    } = body

    let emailAddress: string

    // Generate email address based on type
    switch (type) {
      case 'custom':
        if (!prefix) {
          return NextResponse.json(
            { error: 'Prefix is required for custom email' },
            { status: 400 }
          )
        }
        try {
          emailAddress = mailboxGenerator.generateCustomEmail(prefix)
        } catch (error) {
          return NextResponse.json(
            { error: 'Invalid prefix format' },
            { status: 400 }
          )
        }
        break

      case 'themed':
        if (!theme || !['business', 'personal', 'temp', 'test'].includes(theme)) {
          return NextResponse.json(
            { error: 'Valid theme is required (business, personal, temp, test)' },
            { status: 400 }
          )
        }
        emailAddress = mailboxGenerator.generateThemedEmail(theme)
        break

      case 'timestamped':
        emailAddress = mailboxGenerator.generateTimestampedEmail(prefix)
        break

      case 'random':
      default:
        emailAddress = mailboxGenerator.generateRandomEmail()
        break
    }

    // Check if email already exists
    const existingMailbox = await db.getMailboxByEmail(emailAddress)
    if (existingMailbox) {
      // Generate suggestions
      const suggestions = mailboxGenerator.generateSuggestions(emailAddress)
      return NextResponse.json(
        { 
          error: 'Email address already exists',
          suggestions 
        },
        { status: 409 }
      )
    }

    // Create the mailbox
    const mailboxData = {
      user_id: user.id,
      email_address: emailAddress,
      name: name || null,
      description: description || null,
      is_active: true
    }

    const newMailbox = await db.createMailbox(mailboxData)

    if (!newMailbox) {
      return NextResponse.json(
        { error: 'Failed to create mailbox' },
        { status: 500 }
      )
    }

    return NextResponse.json({
      success: true,
      mailbox: newMailbox
    })

  } catch (error) {
    console.error('Error creating mailbox:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

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

    // Get user's mailboxes
    const mailboxes = await db.getUserMailboxes(user.id)

    return NextResponse.json({
      success: true,
      mailboxes
    })

  } catch (error) {
    console.error('Error fetching mailboxes:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
