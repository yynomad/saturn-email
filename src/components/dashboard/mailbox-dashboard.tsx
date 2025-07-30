'use client'

import { useEffect, useState } from 'react'
import { Plus, Search, Mail, MailOpen, Filter } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { CreateMailboxDialog } from './create-mailbox-dialog'
import { Mailbox, Email } from '@/types/database'
import { formatDistanceToNow } from 'date-fns'
import Link from 'next/link'

interface MailboxDashboardProps {
  userId: string
}

export function MailboxDashboard({ userId }: MailboxDashboardProps) {
  const [mailboxes, setMailboxes] = useState<Mailbox[]>([])
  const [searchResults, setSearchResults] = useState<Email[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [isSearching, setIsSearching] = useState(false)
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedMailbox, setSelectedMailbox] = useState<string>('all')
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false)

  useEffect(() => {
    fetchMailboxes()
  }, [])

  const fetchMailboxes = async () => {
    setIsLoading(true)
    try {
      const response = await fetch('/api/mailbox')
      if (response.ok) {
        const data = await response.json()
        setMailboxes(data.mailboxes || [])
      }
    } catch (error) {
      console.error('Error fetching mailboxes:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!searchQuery.trim() || searchQuery.trim().length < 2) {
      return
    }

    setIsSearching(true)
    try {
      const params = new URLSearchParams({
        q: searchQuery.trim()
      })
      
      if (selectedMailbox !== 'all') {
        params.append('mailbox_id', selectedMailbox)
      }

      const response = await fetch(`/api/search?${params}`)
      if (response.ok) {
        const data = await response.json()
        setSearchResults(data.emails || [])
      }
    } catch (error) {
      console.error('Error searching emails:', error)
    } finally {
      setIsSearching(false)
    }
  }

  const clearSearch = () => {
    setSearchQuery('')
    setSearchResults([])
    setSelectedMailbox('all')
  }

  const handleMailboxCreated = (newMailbox: Mailbox) => {
    setMailboxes([newMailbox, ...mailboxes])
    setIsCreateDialogOpen(false)
  }

  if (isLoading) {
    return <DashboardSkeleton />
  }

  return (
    <div className="space-y-8">
      {/* Search Section */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Search className="h-5 w-5" />
            <span>Search Emails</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSearch} className="space-y-4">
            <div className="flex space-x-2">
              <div className="flex-1">
                <Input
                  type="text"
                  placeholder="Search emails by subject, sender, or content..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
              </div>
              <Select value={selectedMailbox} onValueChange={setSelectedMailbox}>
                <SelectTrigger className="w-48">
                  <SelectValue placeholder="All mailboxes" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All mailboxes</SelectItem>
                  {mailboxes.map((mailbox) => (
                    <SelectItem key={mailbox.id} value={mailbox.id}>
                      {mailbox.name || mailbox.email_address}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <Button type="submit" disabled={isSearching}>
                {isSearching ? 'Searching...' : 'Search'}
              </Button>
              {searchResults.length > 0 && (
                <Button variant="outline" onClick={clearSearch}>
                  Clear
                </Button>
              )}
            </div>
          </form>

          {/* Search Results */}
          {searchResults.length > 0 && (
            <div className="mt-6">
              <h3 className="text-lg font-medium mb-4">
                Search Results ({searchResults.length})
              </h3>
              <div className="space-y-2">
                {searchResults.map((email) => (
                  <Card key={email.id} className="cursor-pointer hover:bg-gray-50">
                    <CardContent className="p-4">
                      <div className="flex items-center justify-between">
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center space-x-2 mb-1">
                            {email.is_read ? (
                              <MailOpen className="h-4 w-4 text-gray-400" />
                            ) : (
                              <Mail className="h-4 w-4 text-blue-600" />
                            )}
                            <span className="text-sm font-medium">
                              {email.from_name || email.from_address}
                            </span>
                            <Badge variant="outline" className="text-xs">
                              {email.to_address}
                            </Badge>
                          </div>
                          <h4 className="text-sm font-medium truncate">
                            {email.subject}
                          </h4>
                          <p className="text-xs text-gray-500 mt-1">
                            {formatDistanceToNow(new Date(email.received_at), { addSuffix: true })}
                          </p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Mailboxes Section */}
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold">Your Mailboxes</h2>
        <CreateMailboxDialog
          isOpen={isCreateDialogOpen}
          onOpenChange={setIsCreateDialogOpen}
          onMailboxCreated={handleMailboxCreated}
        />
      </div>

      {mailboxes.length === 0 ? (
        <Card>
          <CardContent className="flex items-center justify-center py-12">
            <div className="text-center">
              <Mail className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">No mailboxes yet</h3>
              <p className="text-gray-500 mb-4">
                Create your first email address to get started
              </p>
              <Button onClick={() => setIsCreateDialogOpen(true)}>
                <Plus className="h-4 w-4 mr-2" />
                Create Mailbox
              </Button>
            </div>
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {mailboxes.map((mailbox) => (
            <Link key={mailbox.id} href={`/mailbox/${mailbox.id}`}>
              <Card className="cursor-pointer hover:shadow-md transition-shadow">
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-lg">
                      {mailbox.name || 'Unnamed Mailbox'}
                    </CardTitle>
                    <Badge variant={mailbox.is_active ? 'default' : 'secondary'}>
                      {mailbox.is_active ? 'Active' : 'Inactive'}
                    </Badge>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    <div className="flex items-center space-x-2">
                      <Mail className="h-4 w-4 text-gray-500" />
                      <code className="text-sm bg-gray-100 px-2 py-1 rounded">
                        {mailbox.email_address}
                      </code>
                    </div>
                    {mailbox.description && (
                      <p className="text-sm text-gray-600 line-clamp-2">
                        {mailbox.description}
                      </p>
                    )}
                    <p className="text-xs text-gray-500">
                      Created {formatDistanceToNow(new Date(mailbox.created_at), { addSuffix: true })}
                    </p>
                  </div>
                </CardContent>
              </Card>
            </Link>
          ))}
        </div>
      )}
    </div>
  )
}

function DashboardSkeleton() {
  return (
    <div className="space-y-8">
      <Card>
        <CardHeader>
          <div className="h-6 w-32 bg-gray-200 rounded animate-pulse"></div>
        </CardHeader>
        <CardContent>
          <div className="flex space-x-2">
            <div className="flex-1 h-10 bg-gray-200 rounded animate-pulse"></div>
            <div className="w-48 h-10 bg-gray-200 rounded animate-pulse"></div>
            <div className="w-20 h-10 bg-gray-200 rounded animate-pulse"></div>
          </div>
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {[...Array(6)].map((_, i) => (
          <Card key={i}>
            <CardHeader>
              <div className="h-6 w-3/4 bg-gray-200 rounded animate-pulse"></div>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                <div className="h-4 w-full bg-gray-200 rounded animate-pulse"></div>
                <div className="h-4 w-2/3 bg-gray-200 rounded animate-pulse"></div>
                <div className="h-3 w-1/2 bg-gray-200 rounded animate-pulse"></div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  )
}
