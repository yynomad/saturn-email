import * as Imap from 'node-imap'
import { simpleParser, ParsedMail } from 'mailparser'
import { createServiceSupabaseClient } from './supabase'
import { DatabaseService } from './database'

interface ImapConfig {
  host: string
  port: number
  user: string
  password: string
  tls: boolean
}

export class ImapService {
  private config: ImapConfig
  private imap: Imap
  private db: DatabaseService

  constructor(config: ImapConfig) {
    this.config = config
    this.db = new DatabaseService()
    this.imap = new Imap({
      host: config.host,
      port: config.port,
      user: config.user,
      password: config.password,
      tls: config.tls,
      tlsOptions: { rejectUnauthorized: false }
    })
  }

  async connect(): Promise<void> {
    return new Promise((resolve, reject) => {
      this.imap.once('ready', () => {
        console.log('IMAP connection ready')
        resolve()
      })

      this.imap.once('error', (err: Error) => {
        console.error('IMAP connection error:', err)
        reject(err)
      })

      this.imap.once('end', () => {
        console.log('IMAP connection ended')
      })

      this.imap.connect()
    })
  }

  async disconnect(): Promise<void> {
    return new Promise((resolve) => {
      this.imap.end()
      resolve()
    })
  }

  async fetchNewEmails(): Promise<void> {
    return new Promise((resolve, reject) => {
      this.imap.openBox('INBOX', false, (err, box) => {
        if (err) {
          reject(err)
          return
        }

        console.log(`Inbox has ${box.messages.total} messages`)

        // Search for unseen messages
        this.imap.search(['UNSEEN'], (err, results) => {
          if (err) {
            reject(err)
            return
          }

          if (!results || results.length === 0) {
            console.log('No new messages')
            resolve()
            return
          }

          console.log(`Found ${results.length} new messages`)

          const fetch = this.imap.fetch(results, {
            bodies: '',
            struct: true,
            markSeen: false
          })

          const promises: Promise<void>[] = []

          fetch.on('message', (msg, seqno) => {
            const promise = this.processMessage(msg, seqno)
            promises.push(promise)
          })

          fetch.once('error', (err) => {
            reject(err)
          })

          fetch.once('end', async () => {
            try {
              await Promise.all(promises)
              console.log('Finished processing all messages')
              resolve()
            } catch (error) {
              reject(error)
            }
          })
        })
      })
    })
  }

  private async processMessage(msg: any, seqno: number): Promise<void> {
    return new Promise((resolve, reject) => {
      let buffer = ''

      msg.on('body', (stream: any) => {
        stream.on('data', (chunk: any) => {
          buffer += chunk.toString('utf8')
        })

        stream.once('end', async () => {
          try {
            const parsed = await simpleParser(buffer)
            await this.saveEmail(parsed)
            resolve()
          } catch (error) {
            console.error(`Error processing message ${seqno}:`, error)
            reject(error)
          }
        })
      })

      msg.once('error', (err: Error) => {
        console.error(`Error fetching message ${seqno}:`, err)
        reject(err)
      })
    })
  }

  private async saveEmail(parsed: ParsedMail): Promise<void> {
    try {
      // Extract recipient email address
      const toAddress = this.extractEmailAddress(parsed.to)
      if (!toAddress) {
        console.log('No valid recipient address found, skipping email')
        return
      }

      // Find the mailbox for this email address
      const mailbox = await this.db.getMailboxByEmail(toAddress)
      if (!mailbox) {
        console.log(`No mailbox found for ${toAddress}, skipping email`)
        return
      }

      // Check if email already exists
      const messageId = parsed.messageId || `${Date.now()}-${Math.random()}`
      const existingEmail = await this.db.getEmailByMessageId(messageId)
      if (existingEmail) {
        console.log(`Email with message ID ${messageId} already exists, skipping`)
        return
      }

      // Extract sender information
      const fromAddress = this.extractEmailAddress(parsed.from)
      const fromName = this.extractName(parsed.from)

      // Process attachments
      const attachments = parsed.attachments?.map(att => ({
        filename: att.filename,
        contentType: att.contentType,
        size: att.size,
        // In a real implementation, you'd save the attachment content to storage
        // and store the URL here
        url: null
      })) || []

      // Create email record
      const emailData = {
        mailbox_id: mailbox.id,
        message_id: messageId,
        from_address: fromAddress || 'unknown@unknown.com',
        from_name: fromName,
        to_address: toAddress,
        subject: parsed.subject || '(No Subject)',
        body_text: parsed.text || null,
        body_html: parsed.html || null,
        received_at: parsed.date?.toISOString() || new Date().toISOString(),
        is_read: false,
        is_starred: false,
        attachments: attachments,
        headers: parsed.headers ? Object.fromEntries(parsed.headers) : {}
      }

      const savedEmail = await this.db.createEmail(emailData)
      if (savedEmail) {
        console.log(`Saved email: ${parsed.subject} to ${toAddress}`)
      } else {
        console.error('Failed to save email to database')
      }

    } catch (error) {
      console.error('Error saving email:', error)
      throw error
    }
  }

  private extractEmailAddress(addressField: any): string | null {
    if (!addressField) return null
    
    if (typeof addressField === 'string') {
      const match = addressField.match(/<([^>]+)>/)
      return match ? match[1] : addressField
    }
    
    if (Array.isArray(addressField) && addressField.length > 0) {
      return addressField[0].address || null
    }
    
    if (addressField.address) {
      return addressField.address
    }
    
    return null
  }

  private extractName(addressField: any): string | null {
    if (!addressField) return null
    
    if (typeof addressField === 'string') {
      const match = addressField.match(/^([^<]+)</)
      return match ? match[1].trim().replace(/"/g, '') : null
    }
    
    if (Array.isArray(addressField) && addressField.length > 0) {
      return addressField[0].name || null
    }
    
    if (addressField.name) {
      return addressField.name
    }
    
    return null
  }
}

// Factory function to create IMAP service with environment config
export function createImapService(): ImapService {
  const config: ImapConfig = {
    host: process.env.IMAP_HOST || 'imap.gmail.com',
    port: parseInt(process.env.IMAP_PORT || '993'),
    user: process.env.IMAP_USER || '',
    password: process.env.IMAP_PASSWORD || '',
    tls: process.env.IMAP_TLS === 'true'
  }

  if (!config.user || !config.password) {
    throw new Error('IMAP credentials not configured')
  }

  return new ImapService(config)
}
