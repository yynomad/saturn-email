#!/usr/bin/env node

/**
 * Manual email fetching script for development and testing
 * Usage: node scripts/fetch-emails.js
 */

const { createImapService } = require('../src/lib/imap-service')

async function main() {
  try {
    console.log('Starting manual email fetch...')
    
    const imapService = createImapService()
    
    // Connect to IMAP server
    console.log('Connecting to IMAP server...')
    await imapService.connect()
    
    // Fetch new emails
    console.log('Fetching new emails...')
    await imapService.fetchNewEmails()
    
    // Disconnect
    console.log('Disconnecting from IMAP server...')
    await imapService.disconnect()
    
    console.log('Email fetch completed successfully!')
    process.exit(0)

  } catch (error) {
    console.error('Error fetching emails:', error)
    process.exit(1)
  }
}

// Handle graceful shutdown
process.on('SIGINT', () => {
  console.log('\nReceived SIGINT, shutting down gracefully...')
  process.exit(0)
})

process.on('SIGTERM', () => {
  console.log('\nReceived SIGTERM, shutting down gracefully...')
  process.exit(0)
})

main()
