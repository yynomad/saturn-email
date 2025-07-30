import { NextRequest, NextResponse } from 'next/server'
import { createImapService } from '@/lib/imap-service'

export async function GET(request: NextRequest) {
  // Verify the request is from Vercel Cron
  const authHeader = request.headers.get('authorization')
  if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return NextResponse.json(
      { error: 'Unauthorized' },
      { status: 401 }
    )
  }

  try {
    console.log('Starting email fetch job...')
    
    const imapService = createImapService()
    
    // Connect to IMAP server
    await imapService.connect()
    
    // Fetch new emails
    await imapService.fetchNewEmails()
    
    // Disconnect
    await imapService.disconnect()
    
    console.log('Email fetch job completed successfully')
    
    return NextResponse.json({
      success: true,
      message: 'Emails fetched successfully',
      timestamp: new Date().toISOString()
    })

  } catch (error) {
    console.error('Error in email fetch job:', error)
    
    return NextResponse.json(
      { 
        error: 'Email fetch failed',
        message: error instanceof Error ? error.message : 'Unknown error',
        timestamp: new Date().toISOString()
      },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  // Allow manual triggering via POST for testing
  return GET(request)
}
