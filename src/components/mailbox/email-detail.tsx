'use client'

import { useState } from 'react'
import { X, Star, StarOff, Reply, Forward, Download, Calendar } from 'lucide-react'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Separator } from '@/components/ui/separator'
import { Email } from '@/types/database'
import { format } from 'date-fns'

interface EmailDetailProps {
  email: Email
  isOpen: boolean
  onClose: () => void
}

export function EmailDetail({ email, isOpen, onClose }: EmailDetailProps) {
  const [isStarred, setIsStarred] = useState(email.is_starred)

  const toggleStar = async () => {
    try {
      const response = await fetch(`/api/emails/${email.id}/star`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ is_starred: !isStarred })
      })
      
      if (response.ok) {
        setIsStarred(!isStarred)
      }
    } catch (error) {
      console.error('Error toggling star:', error)
    }
  }

  const downloadAttachment = (attachment: any) => {
    // This would need to be implemented based on how attachments are stored
    console.log('Download attachment:', attachment)
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-hidden flex flex-col">
        <DialogHeader className="flex-shrink-0">
          <div className="flex items-center justify-between">
            <DialogTitle className="text-xl font-semibold truncate pr-4">
              {email.subject}
            </DialogTitle>
            <div className="flex items-center space-x-2">
              <Button
                variant="ghost"
                size="sm"
                onClick={toggleStar}
              >
                {isStarred ? (
                  <Star className="h-4 w-4 text-yellow-500 fill-current" />
                ) : (
                  <StarOff className="h-4 w-4 text-gray-400" />
                )}
              </Button>
              <Button variant="ghost" size="sm" onClick={onClose}>
                <X className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </DialogHeader>

        <div className="flex-1 overflow-y-auto">
          {/* Email Header */}
          <div className="space-y-4 mb-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                  <span className="text-blue-600 font-semibold text-sm">
                    {(email.from_name || email.from_address).charAt(0).toUpperCase()}
                  </span>
                </div>
                <div>
                  <div className="font-medium">
                    {email.from_name || email.from_address}
                  </div>
                  <div className="text-sm text-gray-500">
                    {email.from_address}
                  </div>
                </div>
              </div>
              <div className="text-right">
                <div className="text-sm text-gray-500">
                  {format(new Date(email.received_at), 'PPP p')}
                </div>
                <div className="text-xs text-gray-400">
                  to {email.to_address}
                </div>
              </div>
            </div>

            {/* Badges */}
            <div className="flex items-center space-x-2">
              {!email.is_read && (
                <Badge variant="secondary">Unread</Badge>
              )}
              {isStarred && (
                <Badge variant="outline" className="text-yellow-600 border-yellow-600">
                  Starred
                </Badge>
              )}
            </div>

            <Separator />
          </div>

          {/* Email Body */}
          <div className="space-y-4">
            {email.body_html ? (
              <div 
                className="prose max-w-none"
                dangerouslySetInnerHTML={{ __html: email.body_html }}
              />
            ) : email.body_text ? (
              <div className="whitespace-pre-wrap font-mono text-sm bg-gray-50 p-4 rounded-lg">
                {email.body_text}
              </div>
            ) : (
              <div className="text-gray-500 italic">
                No content available
              </div>
            )}
          </div>

          {/* Attachments */}
          {email.attachments && email.attachments.length > 0 && (
            <div className="mt-6">
              <Separator className="mb-4" />
              <h4 className="font-medium mb-3">Attachments ({email.attachments.length})</h4>
              <div className="space-y-2">
                {email.attachments.map((attachment: any, index: number) => (
                  <div
                    key={index}
                    className="flex items-center justify-between p-3 bg-gray-50 rounded-lg"
                  >
                    <div className="flex items-center space-x-3">
                      <div className="w-8 h-8 bg-blue-100 rounded flex items-center justify-center">
                        <Download className="h-4 w-4 text-blue-600" />
                      </div>
                      <div>
                        <div className="font-medium text-sm">
                          {attachment.filename || `Attachment ${index + 1}`}
                        </div>
                        <div className="text-xs text-gray-500">
                          {attachment.size ? `${Math.round(attachment.size / 1024)} KB` : 'Unknown size'}
                        </div>
                      </div>
                    </div>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => downloadAttachment(attachment)}
                    >
                      <Download className="h-4 w-4 mr-2" />
                      Download
                    </Button>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Action Buttons */}
        <div className="flex-shrink-0 border-t pt-4 mt-6">
          <div className="flex items-center justify-between">
            <div className="flex space-x-2">
              <Button variant="outline" size="sm">
                <Reply className="h-4 w-4 mr-2" />
                Reply
              </Button>
              <Button variant="outline" size="sm">
                <Forward className="h-4 w-4 mr-2" />
                Forward
              </Button>
            </div>
            <div className="flex space-x-2">
              <Button variant="outline" size="sm">
                <Calendar className="h-4 w-4 mr-2" />
                Add to Calendar
              </Button>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}
