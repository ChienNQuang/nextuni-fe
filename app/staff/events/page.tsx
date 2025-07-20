"use client"

import { useCallback, useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { StaffLayout } from "@/components/layouts/staff-layout"
import { ApiService, EventStatus, type Event } from "@/lib/api"
import { Eye, X, Users } from "lucide-react"
import { useAuth } from "@/contexts/auth-context"
import { CreateEventDialog } from "@/components/dialogs/create-event-dialog"
import { EventRegistrationsDialog } from "@/components/dialogs/event-registrations-dialog"
import { toast } from "sonner"

export default function StaffEventsPage() {
  const [events, setEvents] = useState<Event[]>([])
  const [loading, setLoading] = useState(false)
  const [statusFilter, setStatusFilter] = useState(EventStatus.Pending)
  const [selectedEventId, setSelectedEventId] = useState<string | null>(null)
  const [isRegistrationsDialogOpen, setIsRegistrationsDialogOpen] = useState(false)
  const router = useRouter()
  const { user } = useAuth()

  useEffect(() => {
    fetchEvents()
    console.log(user)
  }, [statusFilter, user?.universityId])

  const statusString = (status: EventStatus) => {
    switch (status) {
      case EventStatus.Pending:
        return "Pending"
      case EventStatus.Published:
        return "Published"
      case EventStatus.Cancelled:
        return "Cancelled"
      case EventStatus.Ongoing:
        return "Ongoing"
      case EventStatus.Completed:
        return "Completed"
      case EventStatus.Rejected:
        return "Rejected"
      default:
        return "Unknown"
    }
  }

  const fetchEvents = useCallback(async () => {
    try {
      if (!user?.universityId) {
        return
      } 
      setLoading(true)
      const result = await ApiService.getStaffEvents(user?.universityId || '', statusString(statusFilter), 1, 10)
      setEvents(result.data?.items || [])
    } catch (error) {
      console.error('Error fetching events:', error)
      toast.error('Failed to load events')
    } finally {
      setLoading(false)
    }
  }, [user?.universityId, statusFilter])

  const handleEventCreated = () => {
    fetchEvents()
  }

  const handleViewEvent = (eventId: string) => {
    router.push(`/staff/events/${eventId}`)
  }

  const handleViewRegistrations = (eventId: string) => {
    setSelectedEventId(eventId)
    setIsRegistrationsDialogOpen(true)
  }

  const handleCancelEvent = async (eventId: string) => {
    if (!confirm('Are you sure you want to cancel this event? This action cannot be undone.')) {
      return
    }

    try {
      const response = await ApiService.cancelEvent(eventId)
      if (response.isSuccess) {
        toast.success('Event has been cancelled successfully')
        fetchEvents() // Refresh the events list
      } else {
        throw new Error('Failed to cancel event')
      }
    } catch (error) {
      console.error('Error cancelling event:', error)
      toast.error('Failed to cancel event. Please try again.')
    }
  }

  const getStatusBadge = (status: EventStatus) => {
    switch (status) {
      case EventStatus.Pending:
        return <Badge variant="default">Pending</Badge>
      case EventStatus.Published:
        return (
          <Badge variant="outline" className="border-green-500 text-green-700">
            Published
          </Badge>
        )
      case EventStatus.Cancelled:
        return <Badge variant="destructive">Cancelled</Badge>
      case EventStatus.Ongoing:
        return (
          <Badge variant="outline" className="border-blue-500 text-blue-700">
            Ongoing
          </Badge>
        )
      case EventStatus.Completed:
        return <Badge variant="secondary">Completed</Badge>
      case EventStatus.Rejected:
        return <Badge variant="destructive">Rejected</Badge>
      default:
        return <Badge variant="outline">Unknown</Badge>
    }
  }

  if (loading) {
    return (
      <StaffLayout>
        <div className="flex items-center justify-center min-h-[400px]">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary"></div>
        </div>
      </StaffLayout>
    )
  }

  return (
    <StaffLayout>
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Events</h1>
            <p className="text-gray-600">Manage your university's events</p>
          </div>
          <CreateEventDialog onEventCreated={handleEventCreated} />
        </div>

        {/* Filter */}
        <div className="flex items-center space-x-4">
          <label className="text-sm font-medium">Filter by status:</label>
          <Select value={statusFilter.toString()} onValueChange={(value) => setStatusFilter(Number(value))}>
            <SelectTrigger className="w-48">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value={EventStatus.Pending.toString()}>Pending</SelectItem>
              <SelectItem value={EventStatus.Published.toString()}>Published</SelectItem>
              <SelectItem value={EventStatus.Cancelled.toString()}>Cancelled</SelectItem>
              <SelectItem value={EventStatus.Ongoing.toString()}>Ongoing</SelectItem>
              <SelectItem value={EventStatus.Completed.toString()}>Completed</SelectItem>
              <SelectItem value={EventStatus.Rejected.toString()}>Rejected</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="grid gap-6">
          {events.length === 0 ? (
            <Card>
              <CardContent className="flex items-center justify-center py-12">
                <div className="text-center">
                  <p className="text-gray-500 mb-4">No events found for the selected status.</p>
                  <Button asChild>
                    <Link href="/staff/events/create">Create your first event</Link>
                  </Button>
                </div>
              </CardContent>
            </Card>
          ) : (
            events.map((event) => (
              <Card key={event.id}>
                <CardHeader>
                  <div className="flex justify-between items-start">
                    <div>
                      <CardTitle className="line-clamp-2">{event.title}</CardTitle>
                      <CardDescription className="line-clamp-3 mt-2">
                        <div 
                          className="prose prose-sm max-w-none"
                          dangerouslySetInnerHTML={{ __html: event.content }} 
                        />
                      </CardDescription>
                      <div className="flex items-center space-x-4 mt-2 text-sm text-gray-500">
                        <span>Start: {new Date(event.startDate).toLocaleDateString()}</span>
                        <span>End: {new Date(event.endDate).toLocaleDateString()}</span>
                      </div>
                    </div>
                    <div className="flex items-center space-x-2">{getStatusBadge(event.status)}</div>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="flex justify-end space-x-2">
                    <Button
                      variant="ghost"
                      size="icon"
                      asChild
                    >
                      <Link href={`/staff/events/${event.id}`}>
                        <Eye className="h-4 w-4" />
                      </Link>
                    </Button>
                    {event.status === EventStatus.Published && (
                      <Button 
                        variant="outline" 
                        size="sm" 
                        onClick={() => handleViewRegistrations(event.id)}
                      >
                        <Users className="mr-2 h-4 w-4" />
                        Registrations
                      </Button>
                    )}
                    {event.status === EventStatus.Published && (
                      <Button 
                        variant="destructive" 
                        size="sm" 
                        onClick={() => handleCancelEvent(event.id)}
                      >
                        <X className="mr-2 h-4 w-4" />
                        Cancel
                      </Button>
                    )}
                  </div>
                </CardContent>
              </Card>
            ))
          )}
        </div>
      </div>

      {selectedEventId && (
        <EventRegistrationsDialog
          eventId={selectedEventId}
          open={isRegistrationsDialogOpen}
          onOpenChange={setIsRegistrationsDialogOpen}
        />
      )}
    </StaffLayout>
  )
}
