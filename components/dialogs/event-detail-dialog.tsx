'use client'

import { Button } from "@/components/ui/button"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Event } from "@/lib/api"
import { format } from 'date-fns'
import { X } from 'lucide-react'

interface EventDetailDialogProps {
  event: Event | null
  open: boolean
  onOpenChange: (open: boolean) => void
  onCancelEvent?: (eventId: string) => Promise<void>
}

export function EventDetailDialog({ event, open, onOpenChange, onCancelEvent }: EventDetailDialogProps) {
  if (!event) return null

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-3xl">
        <DialogHeader>
          <div className="flex justify-between items-center">
            <DialogTitle>Event Details</DialogTitle>
            <Button
              variant="ghost"
              size="icon"
              onClick={() => onOpenChange(false)}
              className="h-8 w-8"
            >
              <X className="h-4 w-4" />
              <span className="sr-only">Close</span>
            </Button>
          </div>
        </DialogHeader>
        
        <div className="space-y-6 py-4">
          <div className="space-y-2">
            <h2 className="text-2xl font-bold tracking-tight">{event.title}</h2>
            <div className="flex items-center space-x-4 text-sm text-muted-foreground">
              <span>Status: {getStatusText(event.status)}</span>
              <span>•</span>
              <span>Start: {format(new Date(event.startDate), 'PPpp')}</span>
              <span>•</span>
              <span>End: {event.endDate ? format(new Date(event.endDate), 'PPpp') : 'N/A'}</span>
            </div>
          </div>

          <div className="prose max-w-none">
            <div dangerouslySetInnerHTML={{ __html: event.content }} />
          </div>

          <div className="space-y-2">
            <h3 className="font-medium">Location</h3>
            <p className="text-sm">
              {event.isOnline ? 'Online Event' : event.address || 'No location specified'}
            </p>
          </div>

          <div className="flex justify-end space-x-2 pt-4">
            {event.status === 1 && onCancelEvent && (
              <Button
                variant="destructive"
                onClick={() => onCancelEvent(event.id)}
                className="ml-auto"
              >
                Cancel Event
              </Button>
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}

function getStatusText(status: number): string {
  switch (status) {
    case 0: return 'Pending'
    case 1: return 'Published'
    case 2: return 'Cancelled'
    case 3: return 'Ongoing'
    case 4: return 'Completed'
    case 5: return 'Rejected'
    default: return 'Unknown'
  }
}
