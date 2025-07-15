"use client"

import { useEffect, useState } from "react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { StaffLayout } from "@/components/layouts/staff-layout"
import { ApiService, type Event } from "@/lib/api"
import { Plus, Eye, X, Users } from "lucide-react"
import { useAuth } from "@/contexts/auth-context"

export default function StaffEventsPage() {
  const [events, setEvents] = useState<Event[]>([])
  const [loading, setLoading] = useState(true)
  const [statusFilter, setStatusFilter] = useState("Pending")
  const { user } = useAuth()

  useEffect(() => {
    fetchEvents()
  }, [statusFilter, user?.universityId])

  const fetchEvents = async () => {
    try {
      if (!user?.universityId) return

      const response = await ApiService.getStaffEvents(user.universityId, statusFilter, 1, 10)
      setEvents(response.data?.items || [])
    } catch (error) {
      console.error("Failed to fetch events:", error)
    } finally {
      setLoading(false)
    }
  }

  const cancelEvent = async (eventId: string) => {
    try {
      await ApiService.cancelEvent(eventId)
      fetchEvents() // Refresh the list
    } catch (error) {
      console.error("Failed to cancel event:", error)
    }
  }

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "Pending":
        return <Badge variant="default">Pending</Badge>
      case "Published":
        return (
          <Badge variant="outline" className="border-green-500 text-green-700">
            Published
          </Badge>
        )
      case "Cancelled":
        return <Badge variant="destructive">Cancelled</Badge>
      case "Ongoing":
        return (
          <Badge variant="outline" className="border-blue-500 text-blue-700">
            Ongoing
          </Badge>
        )
      case "Completed":
        return <Badge variant="secondary">Completed</Badge>
      case "Rejected":
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
          <Button asChild>
            <Link href="/staff/events/create">
              <Plus className="mr-2 h-4 w-4" />
              Create Event
            </Link>
          </Button>
        </div>

        {/* Filter */}
        <div className="flex items-center space-x-4">
          <label className="text-sm font-medium">Filter by status:</label>
          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger className="w-48">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="Pending">Pending</SelectItem>
              <SelectItem value="Published">Published</SelectItem>
              <SelectItem value="Cancelled">Cancelled</SelectItem>
              <SelectItem value="Ongoing">Ongoing</SelectItem>
              <SelectItem value="Completed">Completed</SelectItem>
              <SelectItem value="Rejected">Rejected</SelectItem>
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
                      <CardDescription className="line-clamp-3 mt-2">{event.content}</CardDescription>
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
                    <Button variant="outline" size="sm" asChild>
                      <Link href={`/staff/events/${event.id}`}>
                        <Eye className="mr-2 h-4 w-4" />
                        View Details
                      </Link>
                    </Button>
                    {event.status === "Published" && (
                      <Button variant="outline" size="sm" asChild>
                        <Link href={`/staff/events/${event.id}/registrations`}>
                          <Users className="mr-2 h-4 w-4" />
                          Registrations
                        </Link>
                      </Button>
                    )}
                    {event.status === "Published" && (
                      <Button variant="destructive" size="sm" onClick={() => cancelEvent(event.id)}>
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
    </StaffLayout>
  )
}
