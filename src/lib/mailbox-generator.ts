import { randomBytes } from 'crypto'

export class MailboxGenerator {
  private domain: string

  constructor(domain: string = process.env.EMAIL_DOMAIN || 'mydomain.com') {
    this.domain = domain
  }

  /**
   * Generate a random email address
   */
  generateRandomEmail(): string {
    const randomString = this.generateRandomString(8)
    return `${randomString}@${this.domain}`
  }

  /**
   * Generate a custom email address with prefix
   */
  generateCustomEmail(prefix: string): string {
    // Sanitize prefix: only allow alphanumeric characters and hyphens
    const sanitizedPrefix = prefix
      .toLowerCase()
      .replace(/[^a-z0-9-]/g, '')
      .substring(0, 20) // Limit length

    if (!sanitizedPrefix) {
      throw new Error('Invalid prefix: must contain at least one alphanumeric character')
    }

    return `${sanitizedPrefix}@${this.domain}`
  }

  /**
   * Generate a themed email address
   */
  generateThemedEmail(theme: 'business' | 'personal' | 'temp' | 'test'): string {
    const themes = {
      business: ['contact', 'info', 'support', 'sales', 'hello', 'team'],
      personal: ['me', 'mail', 'inbox', 'personal', 'private'],
      temp: ['temp', 'tmp', 'throwaway', 'disposable', 'once'],
      test: ['test', 'testing', 'demo', 'sample', 'trial']
    }

    const prefixes = themes[theme]
    const randomPrefix = prefixes[Math.floor(Math.random() * prefixes.length)]
    const randomSuffix = this.generateRandomString(4)
    
    return `${randomPrefix}${randomSuffix}@${this.domain}`
  }

  /**
   * Generate email with timestamp
   */
  generateTimestampedEmail(prefix?: string): string {
    const timestamp = Date.now().toString(36) // Base36 timestamp
    const basePrefix = prefix ? this.sanitizePrefix(prefix) : 'mail'
    
    return `${basePrefix}-${timestamp}@${this.domain}`
  }

  /**
   * Validate email format
   */
  isValidEmailFormat(email: string): boolean {
    const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/
    return emailRegex.test(email)
  }

  /**
   * Check if email belongs to our domain
   */
  isOurDomain(email: string): boolean {
    return email.endsWith(`@${this.domain}`)
  }

  /**
   * Extract local part from email
   */
  getLocalPart(email: string): string {
    return email.split('@')[0]
  }

  /**
   * Generate suggestions for taken email addresses
   */
  generateSuggestions(baseEmail: string, count: number = 3): string[] {
    const localPart = this.getLocalPart(baseEmail)
    const suggestions: string[] = []

    for (let i = 1; i <= count; i++) {
      suggestions.push(`${localPart}${i}@${this.domain}`)
      suggestions.push(`${localPart}-${this.generateRandomString(3)}@${this.domain}`)
    }

    return suggestions
  }

  private generateRandomString(length: number): string {
    const chars = 'abcdefghijklmnopqrstuvwxyz0123456789'
    let result = ''
    
    for (let i = 0; i < length; i++) {
      result += chars.charAt(Math.floor(Math.random() * chars.length))
    }
    
    return result
  }

  private sanitizePrefix(prefix: string): string {
    return prefix
      .toLowerCase()
      .replace(/[^a-z0-9-]/g, '')
      .substring(0, 15)
  }
}

// Export singleton instance
export const mailboxGenerator = new MailboxGenerator()
