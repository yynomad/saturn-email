'use client'

import { useEffect, useState } from 'react'
import { Search, Mail, MailOpen, Star, StarOff } from 'lucide-react'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { EmailDetail } from './email-detail'
import { EmailListSkeleton } from './email-list-skeleton'
import { Email } from '@/types/database'
import { formatDistanceToNow } from 'date-fns'

interface EmailListProps {
  mailboxId: string
  page?: number
  searchQuery?: string
}

export function EmailList({ mailboxId, page = 1, searchQuery = '' }: EmailListProps) {
  const [emails, setEmails] = useState<Email[]>([])
  const [selectedEmail, setSelectedEmail] = useState<Email | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState(searchQuery)
  const [hasMore, setHasMore] = useState(false)

  useEffect(() => {
    fetchEmails()
  }, [mailboxId, page, searchQuery])

  const fetchEmails = async () => {
    setIsLoading(true)
    
    try {
      const params = new URLSearchParams({
        page: page.toString(),
        limit: '20'
      })
      
      if (searchQuery) {
        params.append('search', searchQuery)
      }

      const response = await fetch(`/api/mailbox/${mailboxId}?${params}`)
      
      if (response.ok) {
        const data = await response.json()
        setEmails(data.emails || [])
        setHasMore(data.pagination?.hasMore || false)
      } else {
        console.error('Failed to fetch emails')
        setEmails([])
      }
    } catch (error) {
      console.error('Error fetching emails:', error)
      setEmails([])
    } finally {
      setIsLoading(false)
    }
  }

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault()
    const url = new URL(window.location.href)
    if (searchTerm) {
      url.searchParams.set('search', searchTerm)
    } else {
      url.searchParams.delete('search')
    }
    url.searchParams.set('page', '1')
    window.location.href = url.toString()
  }

  const markAsRead = async (emailId: string) => {
    try {
      const response = await fetch(`/api/emails/${emailId}/read`, {
        method: 'POST'
      })
      
      if (response.ok) {
        setEmails(emails.map(email => 
          email.id === emailId ? { ...email, is_read: true } : email
        ))
      }
    } catch (error) {
      console.error('Error marking email as read:', error)
    }
  }

  const toggleStar = async (emailId: string, isStarred: boolean) => {
    try {
      const response = await fetch(`/api/emails/${emailId}/star`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ is_starred: !isStarred })
      })
      
      if (response.ok) {
        setEmails(emails.map(email => 
          email.id === emailId ? { ...email, is_starred: !isStarred } : email
        ))
      }
    } catch (error) {
      console.error('Error toggling star:', error)
    }
  }

  const handleEmailClick = (email: Email) => {
    setSelectedEmail(email)
    if (!email.is_read) {
      markAsRead(email.id)
    }
  }

  if (isLoading) {
    return <EmailListSkeleton />
  }

  return (
    <div className="space-y-6">
      {/* Search Bar */}
      <form onSubmit={handleSearch} className="flex space-x-2">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
          <Input
            type="text"
            placeholder="Search emails..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
          />
        </div>
        <Button type="submit">Search</Button>
      </form>

      {/* Email List */}
      <div className="space-y-2">
        {emails.length === 0 ? (
          <Card>
            <CardContent className="flex items-center justify-center py-12">
              <div className="text-center">
                <Mail className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">No emails found</h3>
                <p className="text-gray-500">
                  {searchQuery ? 'Try adjusting your search terms.' : 'This mailbox is empty.'}
                </p>
              </div>
            </CardContent>
          </Card>
        ) : (
          emails.map((email) => (
            <Card
              key={email.id}
              className={`cursor-pointer transition-colors hover:bg-gray-50 ${
                !email.is_read ? 'border-l-4 border-l-blue-500' : ''
              }`}
              onClick={() => handleEmailClick(email)}
            >
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center space-x-2 mb-1">
                      {email.is_read ? (
                        <MailOpen className="h-4 w-4 text-gray-400" />
                      ) : (
                        <Mail className="h-4 w-4 text-blue-600" />
                      )}
                      <span className={`text-sm ${!email.is_read ? 'font-semibold' : 'text-gray-600'}`}>
                        {email.from_name || email.from_address}
                      </span>
                      {!email.is_read && (
                        <Badge variant="secondary" className="text-xs">New</Badge>
                      )}
                    </div>
                    <h3 className={`text-sm truncate ${!email.is_read ? 'font-semibold' : ''}`}>
                      {email.subject}
                    </h3>
                    <p className="text-xs text-gray-500 mt-1">
                      {formatDistanceToNow(new Date(email.received_at), { addSuffix: true })}
                    </p>
                  </div>
                  
                  <div className="flex items-center space-x-2 ml-4">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={(e) => {
                        e.stopPropagation()
                        toggleStar(email.id, email.is_starred)
                      }}
                    >
                      {email.is_starred ? (
                        <Star className="h-4 w-4 text-yellow-500 fill-current" />
                      ) : (
                        <StarOff className="h-4 w-4 text-gray-400" />
                      )}
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))
        )}
      </div>

      {/* Pagination */}
      {(page > 1 || hasMore) && (
        <div className="flex justify-center space-x-2">
          {page > 1 && (
            <Button
              variant="outline"
              onClick={() => {
                const url = new URL(window.location.href)
                url.searchParams.set('page', (page - 1).toString())
                window.location.href = url.toString()
              }}
            >
              Previous
            </Button>
          )}
          {hasMore && (
            <Button
              variant="outline"
              onClick={() => {
                const url = new URL(window.location.href)
                url.searchParams.set('page', (page + 1).toString())
                window.location.href = url.toString()
              }}
            >
              Next
            </Button>
          )}
        </div>
      )}

      {/* Email Detail Modal */}
      {selectedEmail && (
        <EmailDetail
          email={selectedEmail}
          isOpen={!!selectedEmail}
          onClose={() => setSelectedEmail(null)}
        />
      )}
    </div>
  )
}


