'use client'

import { useState } from 'react'
import { Copy, Edit, Mail, Settings, Trash2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Mailbox } from '@/types/database'
import { toast } from 'sonner'

interface MailboxHeaderProps {
  mailbox: Mailbox
}

export function MailboxHeader({ mailbox }: MailboxHeaderProps) {
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [formData, setFormData] = useState({
    name: mailbox.name || '',
    description: mailbox.description || ''
  })

  const copyToClipboard = async (text: string) => {
    try {
      await navigator.clipboard.writeText(text)
      toast.success('Email address copied to clipboard!')
    } catch (error) {
      toast.error('Failed to copy email address')
    }
  }

  const handleUpdateMailbox = async () => {
    setIsLoading(true)
    
    try {
      const response = await fetch(`/api/mailbox/${mailbox.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(formData)
      })

      if (response.ok) {
        toast.success('Mailbox updated successfully!')
        setIsEditDialogOpen(false)
        // Refresh the page to show updated data
        window.location.reload()
      } else {
        const error = await response.json()
        toast.error(error.error || 'Failed to update mailbox')
      }
    } catch (error) {
      toast.error('Failed to update mailbox')
    } finally {
      setIsLoading(false)
    }
  }

  const handleDeleteMailbox = async () => {
    if (!confirm('Are you sure you want to delete this mailbox? This action cannot be undone.')) {
      return
    }

    setIsLoading(true)
    
    try {
      const response = await fetch(`/api/mailbox/${mailbox.id}`, {
        method: 'DELETE'
      })

      if (response.ok) {
        toast.success('Mailbox deleted successfully!')
        // Redirect to home page
        window.location.href = '/'
      } else {
        const error = await response.json()
        toast.error(error.error || 'Failed to delete mailbox')
      }
    } catch (error) {
      toast.error('Failed to delete mailbox')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <Mail className="h-6 w-6 text-blue-600" />
            <div>
              <CardTitle className="text-xl">
                {mailbox.name || 'Unnamed Mailbox'}
              </CardTitle>
              <div className="flex items-center space-x-2 mt-1">
                <code className="text-sm bg-gray-100 px-2 py-1 rounded">
                  {mailbox.email_address}
                </code>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => copyToClipboard(mailbox.email_address)}
                >
                  <Copy className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </div>
          
          <div className="flex items-center space-x-2">
            <Badge variant={mailbox.is_active ? 'default' : 'secondary'}>
              {mailbox.is_active ? 'Active' : 'Inactive'}
            </Badge>
            
            <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
              <DialogTrigger asChild>
                <Button variant="outline" size="sm">
                  <Edit className="h-4 w-4 mr-2" />
                  Edit
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Edit Mailbox</DialogTitle>
                </DialogHeader>
                <div className="space-y-4">
                  <div>
                    <Label htmlFor="name">Name</Label>
                    <Input
                      id="name"
                      value={formData.name}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                      placeholder="Enter mailbox name"
                    />
                  </div>
                  <div>
                    <Label htmlFor="description">Description</Label>
                    <Textarea
                      id="description"
                      value={formData.description}
                      onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                      placeholder="Enter mailbox description"
                      rows={3}
                    />
                  </div>
                  <div className="flex justify-end space-x-2">
                    <Button
                      variant="outline"
                      onClick={() => setIsEditDialogOpen(false)}
                      disabled={isLoading}
                    >
                      Cancel
                    </Button>
                    <Button
                      onClick={handleUpdateMailbox}
                      disabled={isLoading}
                    >
                      {isLoading ? 'Updating...' : 'Update'}
                    </Button>
                  </div>
                </div>
              </DialogContent>
            </Dialog>

            <Button
              variant="outline"
              size="sm"
              onClick={handleDeleteMailbox}
              disabled={isLoading}
            >
              <Trash2 className="h-4 w-4 mr-2" />
              Delete
            </Button>
          </div>
        </div>
      </CardHeader>
      
      {mailbox.description && (
        <CardContent>
          <p className="text-gray-600">{mailbox.description}</p>
        </CardContent>
      )}
    </Card>
  )
}
