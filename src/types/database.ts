export interface Database {
  public: {
    Tables: {
      users: {
        Row: {
          id: string
          email: string
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          email: string
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          email?: string
          created_at?: string
          updated_at?: string
        }
      }
      mailboxes: {
        Row: {
          id: string
          user_id: string
          email_address: string
          name: string | null
          description: string | null
          is_active: boolean
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          user_id: string
          email_address: string
          name?: string | null
          description?: string | null
          is_active?: boolean
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          email_address?: string
          name?: string | null
          description?: string | null
          is_active?: boolean
          created_at?: string
          updated_at?: string
        }
      }
      emails: {
        Row: {
          id: string
          mailbox_id: string
          message_id: string
          from_address: string
          from_name: string | null
          to_address: string
          subject: string
          body_text: string | null
          body_html: string | null
          received_at: string
          is_read: boolean
          is_starred: boolean
          attachments: any[] | null
          headers: any | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          mailbox_id: string
          message_id: string
          from_address: string
          from_name?: string | null
          to_address: string
          subject: string
          body_text?: string | null
          body_html?: string | null
          received_at: string
          is_read?: boolean
          is_starred?: boolean
          attachments?: any[] | null
          headers?: any | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          mailbox_id?: string
          message_id?: string
          from_address?: string
          from_name?: string | null
          to_address?: string
          subject?: string
          body_text?: string | null
          body_html?: string | null
          received_at?: string
          is_read?: boolean
          is_starred?: boolean
          attachments?: any[] | null
          headers?: any | null
          created_at?: string
          updated_at?: string
        }
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      [_ in never]: never
    }
    Enums: {
      [_ in never]: never
    }
  }
}

export type User = Database['public']['Tables']['users']['Row']
export type Mailbox = Database['public']['Tables']['mailboxes']['Row']
export type Email = Database['public']['Tables']['emails']['Row']

export type InsertUser = Database['public']['Tables']['users']['Insert']
export type InsertMailbox = Database['public']['Tables']['mailboxes']['Insert']
export type InsertEmail = Database['public']['Tables']['emails']['Insert']

export type UpdateUser = Database['public']['Tables']['users']['Update']
export type UpdateMailbox = Database['public']['Tables']['mailboxes']['Update']
export type UpdateEmail = Database['public']['Tables']['emails']['Update']
