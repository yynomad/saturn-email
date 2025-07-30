import { createServerSupabaseClient } from './supabase'
import { Database, User, Mailbox, Email, InsertMailbox, InsertEmail, UpdateEmail } from '@/types/database'

export class DatabaseService {
  private supabase = createServerSupabaseClient()

  // User operations
  async getUser(userId: string): Promise<User | null> {
    const { data, error } = await this.supabase
      .from('users')
      .select('*')
      .eq('id', userId)
      .single()

    if (error) {
      console.error('Error fetching user:', error)
      return null
    }

    return data
  }

  async createUser(email: string): Promise<User | null> {
    const { data, error } = await this.supabase
      .from('users')
      .insert({ email })
      .select()
      .single()

    if (error) {
      console.error('Error creating user:', error)
      return null
    }

    return data
  }

  // Mailbox operations
  async getUserMailboxes(userId: string): Promise<Mailbox[]> {
    const { data, error } = await this.supabase
      .from('mailboxes')
      .select('*')
      .eq('user_id', userId)
      .eq('is_active', true)
      .order('created_at', { ascending: false })

    if (error) {
      console.error('Error fetching mailboxes:', error)
      return []
    }

    return data || []
  }

  async getMailbox(mailboxId: string): Promise<Mailbox | null> {
    const { data, error } = await this.supabase
      .from('mailboxes')
      .select('*')
      .eq('id', mailboxId)
      .single()

    if (error) {
      console.error('Error fetching mailbox:', error)
      return null
    }

    return data
  }

  async createMailbox(mailboxData: InsertMailbox): Promise<Mailbox | null> {
    const { data, error } = await this.supabase
      .from('mailboxes')
      .insert(mailboxData)
      .select()
      .single()

    if (error) {
      console.error('Error creating mailbox:', error)
      return null
    }

    return data
  }

  async getMailboxByEmail(emailAddress: string): Promise<Mailbox | null> {
    const { data, error } = await this.supabase
      .from('mailboxes')
      .select('*')
      .eq('email_address', emailAddress)
      .single()

    if (error) {
      console.error('Error fetching mailbox by email:', error)
      return null
    }

    return data
  }

  // Email operations
  async getMailboxEmails(
    mailboxId: string, 
    page: number = 1, 
    limit: number = 20
  ): Promise<Email[]> {
    const offset = (page - 1) * limit

    const { data, error } = await this.supabase
      .from('emails')
      .select('*')
      .eq('mailbox_id', mailboxId)
      .order('received_at', { ascending: false })
      .range(offset, offset + limit - 1)

    if (error) {
      console.error('Error fetching emails:', error)
      return []
    }

    return data || []
  }

  async getEmail(emailId: string): Promise<Email | null> {
    const { data, error } = await this.supabase
      .from('emails')
      .select('*')
      .eq('id', emailId)
      .single()

    if (error) {
      console.error('Error fetching email:', error)
      return null
    }

    return data
  }

  async createEmail(emailData: InsertEmail): Promise<Email | null> {
    const { data, error } = await this.supabase
      .from('emails')
      .insert(emailData)
      .select()
      .single()

    if (error) {
      console.error('Error creating email:', error)
      return null
    }

    return data
  }

  async updateEmail(emailId: string, updates: UpdateEmail): Promise<Email | null> {
    const { data, error } = await this.supabase
      .from('emails')
      .update(updates)
      .eq('id', emailId)
      .select()
      .single()

    if (error) {
      console.error('Error updating email:', error)
      return null
    }

    return data
  }

  async markEmailAsRead(emailId: string): Promise<boolean> {
    const { error } = await this.supabase
      .from('emails')
      .update({ is_read: true })
      .eq('id', emailId)

    if (error) {
      console.error('Error marking email as read:', error)
      return false
    }

    return true
  }

  async searchEmails(
    userId: string,
    query: string,
    mailboxId?: string
  ): Promise<Email[]> {
    let queryBuilder = this.supabase
      .from('emails')
      .select(`
        *,
        mailboxes!inner(user_id)
      `)
      .eq('mailboxes.user_id', userId)

    if (mailboxId) {
      queryBuilder = queryBuilder.eq('mailbox_id', mailboxId)
    }

    // Search in subject, from_address, and from_name
    queryBuilder = queryBuilder.or(
      `subject.ilike.%${query}%,from_address.ilike.%${query}%,from_name.ilike.%${query}%`
    )

    const { data, error } = await queryBuilder
      .order('received_at', { ascending: false })
      .limit(50)

    if (error) {
      console.error('Error searching emails:', error)
      return []
    }

    return data || []
  }

  async getEmailByMessageId(messageId: string): Promise<Email | null> {
    const { data, error } = await this.supabase
      .from('emails')
      .select('*')
      .eq('message_id', messageId)
      .single()

    if (error && error.code !== 'PGRST116') { // PGRST116 is "not found"
      console.error('Error fetching email by message ID:', error)
    }

    return data
  }
}
