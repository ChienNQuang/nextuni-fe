"use client"

import { useEffect, useState } from "react"
import Link from "next/link"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { StudentLayout } from "@/components/layouts/student-layout"
import { ApiService, type Event } from "@/lib/api"
import { Calendar, Clock, Users } from "lucide-react"

export default function StudentEventsPage() {
  const [events, setEvents] = useState<Event[]>([])
  const [loading, setLoading] = useState(true)
  const [statusFilter, setStatusFilter] = useState("Published")
  const [currentPage, setCurrentPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)

  useEffect(() => {
    fetchEvents()
  }, [statusFilter, currentPage])

  const fetchEvents = async () => {
    try {
      const response = await ApiService.getEvents(statusFilter, currentPage, 12)
      setEvents(response.data?.items || [])
      setTotalPages(Math.ceil((response.data?.totalCount || 0) / 12))
    } catch (error) {
      console.error("Failed to fetch events:", error)
    } finally {
      setLoading(false)
    }
  }

  const registerForEvent = async (eventId: string) => {
    try {
      await ApiService.registerForEvent(eventId)
      // Show success message
      console.log("Registered successfully!")
    } catch (error) {
      console.error("Failed to register for event:", error)
    }
  }

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "Published":
        return <Badge variant="default">Published</Badge>
      case "Ongoing":
        return (
          <Badge variant="outline" className="border-blue-500 text-blue-700">
            Ongoing
          </Badge>
        )
      case "Cancelled":
        return <Badge variant="destructive">Cancelled</Badge>
      case "Completed":
        return <Badge variant="secondary">Completed</Badge>
      default:
        return <Badge variant="outline">Unknown</Badge>
    }
  }

  const canRegister = (event: Event) => {
    return event.status === "Published" && new Date(event.startDate) > new Date()
  }

  if (loading) {
    return (
      <StudentLayout>
        <div className="flex items-center justify-center min-h-[400px]">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary"></div>
        </div>
      </StudentLayout>
    )
  }

  return (
    <StudentLayout>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="space-y-6">
          {/* Header */}
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">University Events</h1>
              <p className="text-gray-600">Discover and register for university events</p>
            </div>
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-48">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="Published">Published</SelectItem>
                <SelectItem value="Ongoing">Ongoing</SelectItem>
                <SelectItem value="Cancelled">Cancelled</SelectItem>
                <SelectItem value="Completed">Completed</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Events Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {events.map((event) => (
              <Card key={event.id} className="hover:shadow-lg transition-shadow">
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <Calendar className="h-8 w-8 text-primary" />
                    {getStatusBadge(event.status)}
                  </div>
                  <CardTitle className="line-clamp-2">{event.title}</CardTitle>
                  <CardDescription className="line-clamp-3">{event.content}</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2 text-sm text-gray-600">
                    <div className="flex items-center">
                      <Clock className="mr-2 h-4 w-4" />
                      Start: {new Date(event.startDate).toLocaleDateString()}
                    </div>
                    <div className="flex items-center">
                      <Clock className="mr-2 h-4 w-4" />
                      End: {new Date(event.endDate).toLocaleDateString()}
                    </div>
                  </div>

                  <div className="flex space-x-2">
                    <Button variant="outline" size="sm" asChild className="flex-1 bg-transparent">
                      <Link href={`/student/events/${event.id}`}>View Details</Link>
                    </Button>
                    {canRegister(event) && (
                      <Button size="sm" onClick={() => registerForEvent(event.id)}>
                        <Users className="mr-2 h-4 w-4" />
                        Register
                      </Button>
                    )}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          {events.length === 0 && (
            <div className="text-center py-12">
              <Calendar className="mx-auto h-12 w-12 text-gray-400" />
              <h3 className="mt-2 text-sm font-medium text-gray-900">No events found</h3>
              <p className="mt-1 text-sm text-gray-500">No events are available for the selected status.</p>
            </div>
          )}

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="flex justify-center space-x-2">
              <Button
                variant="outline"
                onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
                disabled={currentPage === 1}
              >
                Previous
              </Button>
              <span className="flex items-center px-4">
                Page {currentPage} of {totalPages}
              </span>
              <Button
                variant="outline"
                onClick={() => setCurrentPage((prev) => Math.min(prev + 1, totalPages))}
                disabled={currentPage === totalPages}
              >
                Next
              </Button>
            </div>
          )}
        </div>
      </div>
    </StudentLayout>
  )
}
