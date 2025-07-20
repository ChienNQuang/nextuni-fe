'use client'

import { useState, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Switch } from '@/components/ui/switch'
import { useAuth } from '@/contexts/auth-context'
import { ApiService } from '@/lib/api'
import { toast } from 'sonner'
import { Loader2, Plus } from 'lucide-react'
import { TipTapEditor } from '@/components/editor/tiptap-editor'

interface CreateEventDialogProps {
  readonly onEventCreated?: () => void
}

export function CreateEventDialog({ onEventCreated }: CreateEventDialogProps) {
  const [open, setOpen] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [formData, setFormData] = useState({
    name: '',
    title: '',
    content: '',
    address: '',
    startDate: '',
    isOnline: false,
  })
  const { user } = useAuth()
  const router = useRouter()

  const formatDateToDateOnly = (dateString: string): string => {
    const date = new Date(dateString)
    const year = date.getFullYear()
    const month = String(date.getMonth() + 1).padStart(2, '0')
    const day = String(date.getDate()).padStart(2, '0')
    return `${year}-${month}-${day}`
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!user?.universityId) {
      toast.error('University ID is required')
      return
    }

    try {
      setIsSubmitting(true)
      const response = await ApiService.createEvent({
        ...formData,
        universityId: user.universityId,
        startDate: formatDateToDateOnly(formData.startDate)
      })

      if (response.isSuccess) {
        toast.success('Event created successfully')
        setOpen(false)
        onEventCreated?.()
        router.refresh()
      } else {
        throw new Error('Failed to create event')
      }
    } catch (error) {
      console.error('Error creating event:', error)
      toast.error('Failed to create event')
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target
    setFormData(prev => ({
      ...prev,
      [name]: value
    }))
  }

  const handleContentChange = useCallback((content: string) => {
    setFormData(prev => ({
      ...prev,
      content
    }))
  }, [])

  const toggleOnline = () => {
    setFormData(prev => ({
      ...prev,
      isOnline: !prev.isOnline
    }))
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button>
          <Plus className="mr-2 h-4 w-4" />
          Create Event
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[600px]">
        <DialogHeader>
          <DialogTitle>Create New Event</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="name">Event Name *</Label>
              <Input
                id="name"
                name="name"
                value={formData.name}
                onChange={handleChange}
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="title">Title *</Label>
              <Input
                id="title"
                name="title"
                value={formData.title}
                onChange={handleChange}
                required
              />
            </div>
          </div>
          
          <div className="space-y-2">
            <Label>Description *</Label>
            <div className="min-h-[200px] rounded-md border border-input">
              <TipTapEditor
                content={formData.content}
                onChange={handleContentChange}
                placeholder="Write the event description here..."
              />
            </div>
          </div>
          
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="startDate">Start Date *</Label>
              <Input
                id="startDate"
                name="startDate"
                type="datetime-local"
                value={formData.startDate}
                onChange={handleChange}
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="address">Address *</Label>
              <Input
                id="address"
                name="address"
                value={formData.address}
                onChange={handleChange}
                required={!formData.isOnline}
                disabled={formData.isOnline}
              />
            </div>
          </div>
          
          <div className="flex items-center space-x-2">
            <Switch
              id="isOnline"
              checked={formData.isOnline}
              onCheckedChange={toggleOnline}
            />
            <Label htmlFor="isOnline">This is an online event</Label>
          </div>
          
          <div className="flex justify-end space-x-2 pt-4">
            <Button
              type="button"
              variant="outline"
              onClick={() => setOpen(false)}
              disabled={isSubmitting}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Creating...
                </>
              ) : (
                'Create Event'
              )}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
}
