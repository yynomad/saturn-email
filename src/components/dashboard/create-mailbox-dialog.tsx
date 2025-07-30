'use client'

import { useState } from 'react'
import { Plus, Shuffle, Clock, Briefcase, User, TestTube } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Card, CardContent } from '@/components/ui/card'
import { Mailbox } from '@/types/database'
import { toast } from 'sonner'

interface CreateMailboxDialogProps {
  isOpen: boolean
  onOpenChange: (open: boolean) => void
  onMailboxCreated: (mailbox: Mailbox) => void
}

export function CreateMailboxDialog({ isOpen, onOpenChange, onMailboxCreated }: CreateMailboxDialogProps) {
  const [isLoading, setIsLoading] = useState(false)
  const [selectedType, setSelectedType] = useState<'random' | 'custom' | 'themed' | 'timestamped'>('random')
  const [formData, setFormData] = useState({
    prefix: '',
    theme: 'business' as 'business' | 'personal' | 'temp' | 'test',
    name: '',
    description: ''
  })
  const [suggestions, setSuggestions] = useState<string[]>([])

  const handleCreateMailbox = async () => {
    setIsLoading(true)
    setSuggestions([])
    
    try {
      const requestData = {
        type: selectedType,
        prefix: formData.prefix || undefined,
        theme: selectedType === 'themed' ? formData.theme : undefined,
        name: formData.name || undefined,
        description: formData.description || undefined
      }

      const response = await fetch('/api/mailbox', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(requestData)
      })

      const data = await response.json()

      if (response.ok) {
        toast.success('Mailbox created successfully!')
        onMailboxCreated(data.mailbox)
        resetForm()
      } else if (response.status === 409) {
        // Email already exists, show suggestions
        setSuggestions(data.suggestions || [])
        toast.error('Email address already exists. Try one of the suggestions below.')
      } else {
        toast.error(data.error || 'Failed to create mailbox')
      }
    } catch (error) {
      toast.error('Failed to create mailbox')
    } finally {
      setIsLoading(false)
    }
  }

  const handleSuggestionClick = (suggestion: string) => {
    const localPart = suggestion.split('@')[0]
    setFormData({ ...formData, prefix: localPart })
    setSelectedType('custom')
    setSuggestions([])
  }

  const resetForm = () => {
    setFormData({
      prefix: '',
      theme: 'business',
      name: '',
      description: ''
    })
    setSelectedType('random')
    setSuggestions([])
  }

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'random': return <Shuffle className="h-4 w-4" />
      case 'custom': return <User className="h-4 w-4" />
      case 'themed': return <Briefcase className="h-4 w-4" />
      case 'timestamped': return <Clock className="h-4 w-4" />
      default: return <Shuffle className="h-4 w-4" />
    }
  }

  const getThemeIcon = (theme: string) => {
    switch (theme) {
      case 'business': return <Briefcase className="h-4 w-4" />
      case 'personal': return <User className="h-4 w-4" />
      case 'temp': return <Clock className="h-4 w-4" />
      case 'test': return <TestTube className="h-4 w-4" />
      default: return <Briefcase className="h-4 w-4" />
    }
  }

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogTrigger asChild>
        <Button>
          <Plus className="h-4 w-4 mr-2" />
          Create Mailbox
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>Create New Mailbox</DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          {/* Email Type Selection */}
          <div>
            <Label className="text-base font-medium">Email Type</Label>
            <div className="grid grid-cols-2 gap-3 mt-2">
              {[
                { type: 'random', label: 'Random', desc: 'Generate a random email address' },
                { type: 'custom', label: 'Custom', desc: 'Choose your own prefix' },
                { type: 'themed', label: 'Themed', desc: 'Business, personal, temp, or test' },
                { type: 'timestamped', label: 'Timestamped', desc: 'Include timestamp for uniqueness' }
              ].map(({ type, label, desc }) => (
                <Card
                  key={type}
                  className={`cursor-pointer transition-colors ${
                    selectedType === type ? 'ring-2 ring-blue-500 bg-blue-50' : 'hover:bg-gray-50'
                  }`}
                  onClick={() => setSelectedType(type as any)}
                >
                  <CardContent className="p-3">
                    <div className="flex items-center space-x-2 mb-1">
                      {getTypeIcon(type)}
                      <span className="font-medium text-sm">{label}</span>
                    </div>
                    <p className="text-xs text-gray-600">{desc}</p>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>

          {/* Type-specific inputs */}
          {selectedType === 'custom' && (
            <div>
              <Label htmlFor="prefix">Email Prefix</Label>
              <Input
                id="prefix"
                value={formData.prefix}
                onChange={(e) => setFormData({ ...formData, prefix: e.target.value })}
                placeholder="Enter prefix (e.g., 'contact', 'support')"
              />
              <p className="text-xs text-gray-500 mt-1">
                Only letters, numbers, and hyphens allowed
              </p>
            </div>
          )}

          {selectedType === 'themed' && (
            <div>
              <Label htmlFor="theme">Theme</Label>
              <Select value={formData.theme} onValueChange={(value: any) => setFormData({ ...formData, theme: value })}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {[
                    { value: 'business', label: 'Business', desc: 'contact, info, support, sales' },
                    { value: 'personal', label: 'Personal', desc: 'me, mail, inbox, personal' },
                    { value: 'temp', label: 'Temporary', desc: 'temp, throwaway, disposable' },
                    { value: 'test', label: 'Testing', desc: 'test, demo, sample, trial' }
                  ].map(({ value, label, desc }) => (
                    <SelectItem key={value} value={value}>
                      <div className="flex items-center space-x-2">
                        {getThemeIcon(value)}
                        <div>
                          <div className="font-medium">{label}</div>
                          <div className="text-xs text-gray-500">{desc}</div>
                        </div>
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          )}

          {selectedType === 'timestamped' && (
            <div>
              <Label htmlFor="timestamped-prefix">Prefix (Optional)</Label>
              <Input
                id="timestamped-prefix"
                value={formData.prefix}
                onChange={(e) => setFormData({ ...formData, prefix: e.target.value })}
                placeholder="Enter prefix (defaults to 'mail')"
              />
            </div>
          )}

          {/* Suggestions */}
          {suggestions.length > 0 && (
            <div>
              <Label className="text-base font-medium text-orange-600">
                Email already exists. Try these suggestions:
              </Label>
              <div className="grid grid-cols-1 gap-2 mt-2">
                {suggestions.map((suggestion, index) => (
                  <Button
                    key={index}
                    variant="outline"
                    className="justify-start text-left"
                    onClick={() => handleSuggestionClick(suggestion)}
                  >
                    {suggestion}
                  </Button>
                ))}
              </div>
            </div>
          )}

          {/* Optional fields */}
          <div className="space-y-4">
            <div>
              <Label htmlFor="name">Name (Optional)</Label>
              <Input
                id="name"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                placeholder="Give your mailbox a friendly name"
              />
            </div>

            <div>
              <Label htmlFor="description">Description (Optional)</Label>
              <Textarea
                id="description"
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                placeholder="Describe what this mailbox is for"
                rows={3}
              />
            </div>
          </div>

          {/* Actions */}
          <div className="flex justify-end space-x-2">
            <Button
              variant="outline"
              onClick={() => onOpenChange(false)}
              disabled={isLoading}
            >
              Cancel
            </Button>
            <Button
              onClick={handleCreateMailbox}
              disabled={isLoading}
            >
              {isLoading ? 'Creating...' : 'Create Mailbox'}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}
