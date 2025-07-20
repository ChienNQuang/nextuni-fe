"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"

import { AdminLayout } from "@/components/layouts/admin-layout"
import { ApiService, Event, EventStatus } from "@/lib/api"
import { Search, Eye, Check, X, MapPin, Calendar } from "lucide-react"
import { toast } from "sonner"

export default function EventsPage() {
  const [events, setEvents] = useState<Event[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState("")
  const [statusFilter, setStatusFilter] = useState("Pending")
  const router = useRouter()
  const [currentPage, setCurrentPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)

  useEffect(() => {
    fetchEvents()
  }, [currentPage, statusFilter])

  const fetchEvents = async () => {
    try {
      setLoading(true)
      const response = await ApiService.getAdminEvents(statusFilter, currentPage, 10)
      setEvents(response.data?.items || [])
      setTotalPages(response.data?.totalPages || 1)
    } catch (error) {
      console.error("Failed to fetch events:", error)
      toast.error("Failed to fetch events")
    } finally {
      setLoading(false)
    }
  }

  const handleApproveEvent = async (eventId: string) => {
    try {
      await ApiService.approveEvent(eventId)
      toast.success("Event approved successfully")
      fetchEvents()
    } catch (error) {
      console.error("Failed to approve event:", error)
      toast.error("Failed to approve event")
    }
  }

  const handleRejectEvent = async (eventId: string) => {
    try {
      await ApiService.rejectEvent(eventId)
      toast.success("Event rejected successfully")
      fetchEvents()
    } catch (error) {
      console.error("Failed to reject event:", error)
      toast.error("Failed to reject event")
    }
  }

  const getStatusBadge = (status: number) => {
    switch (status) {
      case 0:
        return <Badge variant="outline">Pending</Badge>
      case 1:
        return <Badge variant="default">Published</Badge>
      case 2:
        return <Badge variant="secondary">Cancelled</Badge>
      case 3:
        return <Badge variant="default">Ongoing</Badge>
      case 4:
        return <Badge variant="destructive">Rejected</Badge>
      case 5:
        return <Badge variant="secondary">Completed</Badge>
      default:
        return <Badge variant="outline">Unknown</Badge>
    }
  }

  const filteredEvents = events.filter((event) => event.name.toLowerCase().includes(searchTerm.toLowerCase()))

  return (
    <AdminLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Events Management</h1>
            <p className="text-gray-600">Review and approve events submitted by universities</p>
          </div>
        </div>

        {/* Filters */}
        <Card>
          <CardHeader>
            <CardTitle>Filters</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex flex-col sm:flex-row gap-4">
              <div className="flex-1">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                  <Input
                    placeholder="Search events..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10"
                  />
                </div>
              </div>
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger className="w-48">
                  <SelectValue placeholder="Filter by status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Pending">Pending</SelectItem>
                  <SelectItem value="Published">Published</SelectItem>
                  <SelectItem value="Cancelled">Cancelled</SelectItem>
                  <SelectItem value="Ongoing">Ongoing</SelectItem>
                  <SelectItem value="Rejected">Rejected</SelectItem>
                  <SelectItem value="Completed">Completed</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </CardContent>
        </Card>

        {/* Events List */}
        <Card>
          <CardHeader>
            <CardTitle>Events ({filteredEvents.length})</CardTitle>
            <CardDescription>{loading ? "Loading..." : `Showing ${filteredEvents.length} events`}</CardDescription>
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="flex items-center justify-center py-12">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
              </div>
            ) : (
              <div className="space-y-4">
                {filteredEvents.map((event) => (
                  <div
                    key={event.id}
                    className="flex items-center justify-between p-4 border rounded-lg hover:bg-gray-50"
                  >
                    <div className="flex-1">
                      <div className="flex items-center space-x-4">
                        <div>
                          <h3 className="font-medium text-gray-900">{event.name}</h3>
                          <div className="flex items-center text-sm text-gray-600 mt-1">
                            <Calendar className="mr-1 h-4 w-4" />
                            {new Date(event.startDate).toLocaleDateString()}
                            {event.address && (
                              <>
                                <MapPin className="ml-3 mr-1 h-4 w-4" />
                                {event.address}
                              </>
                            )}
                            {event.isOnline && (
                              <Badge variant="outline" className="ml-2">
                                Online
                              </Badge>
                            )}
                          </div>
                          <div className="flex items-center space-x-4 mt-2">{getStatusBadge(event.status)}</div>
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Button variant="ghost" size="icon" asChild>
                        <Link href={`/admin/events/${event.id}`}>
                          <Eye className="h-4 w-4" />
                        </Link>
                      </Button>
                      {event.status == EventStatus.Pending &&
                      <>

                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleApproveEvent(event.id)}
                        className="text-green-600 hover:text-green-700"
                      >
                        <Check className="mr-2 h-4 w-4" />
                        Approve
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleRejectEvent(event.id)}
                        className="text-red-600 hover:text-red-700"
                      >
                        <X className="mr-2 h-4 w-4" />
                        Reject
                      </Button>
                      </>}
                    </div>
                  </div>
                ))}

                {filteredEvents.length === 0 && !loading && (
                  <div className="text-center py-12">
                    <p className="text-gray-500">No events found</p>
                  </div>
                )}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="flex justify-center space-x-2">
            <Button
              variant="outline"
              onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
              disabled={currentPage === 1}
            >
              Previous
            </Button>
            <span className="flex items-center px-4">
              Page {currentPage} of {totalPages}
            </span>
            <Button
              variant="outline"
              onClick={() => setCurrentPage(Math.min(totalPages, currentPage + 1))}
              disabled={currentPage === totalPages}
            >
              Next
            </Button>
          </div>
        )}
      </div>
    </AdminLayout>
  )
}
