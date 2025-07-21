"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Loader2, Calendar, X, Check, Clock, CalendarX } from "lucide-react"
import { ApiService } from "@/lib/api"
import { toast } from "sonner"
import { format } from "date-fns"
import { StudentLayout } from "@/components/layouts/student-layout"

type EventRegistration = {
  eventRegistrationId: string
  eventId: string
  eventName: string
  eventDate: string
  eventStatus: number
}

export default function MyEventsPage() {
  const router = useRouter()
  const [registrations, setRegistrations] = useState<EventRegistration[]>([])
  const [loading, setLoading] = useState(true)
  const [cancellingId, setCancellingId] = useState<string | null>(null)

  const fetchRegistrations = async () => {
    try {
      setLoading(true)
      const response = await ApiService.getStudentEventRegistrations()
      if (response.isSuccess && response.data) {
        // Sort by event date (soonest first)
        const sorted = [...response.data].sort((a, b) => 
          new Date(a.eventDate).getTime() - new Date(b.eventDate).getTime()
        )
        setRegistrations(sorted)
      }
    } catch (error) {
      console.error("Failed to fetch event registrations:", error)
      toast.error("Failed to load your event registrations")
    } finally {
      setLoading(false)
    }
  }

  const handleCancelRegistration = async (registrationId: string) => {
    if (!confirm("Are you sure you want to cancel this registration?")) return
    
    try {
      setCancellingId(registrationId)
      const response = await ApiService.cancelEventRegistration(registrationId)
      if (response.isSuccess) {
        toast.success("Registration cancelled successfully")
        // Refresh the list
        fetchRegistrations()
      }
    } catch (error) {
      console.error("Failed to cancel registration:", error)
      toast.error("Failed to cancel registration")
    } finally {
      setCancellingId(null)
    }
  }

  useEffect(() => {
    fetchRegistrations()
  }, [])

  const getEventStatusBadge = (status: number, eventDate: string) => {
    const now = new Date()
    const eventDateObj = new Date(eventDate)
    
    if (now > eventDateObj) {
      return (
        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
          <CalendarX className="w-3 h-3 mr-1" />
          Event ended
        </span>
      )
    }
    
    switch (status) {
      case 0: // Pending
        return (
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800">
            <Clock className="w-3 h-3 mr-1" />
            Pending
          </span>
        )
      case 1: // Confirmed
        return (
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
            <Check className="w-3 h-3 mr-1" />
            Confirmed
          </span>
        )
      case 2: // Cancelled
        return (
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-800">
            <X className="w-3 h-3 mr-1" />
            Cancelled
          </span>
        )
      default:
        return null
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    )
  }

  return (
    <StudentLayout>

    <div className="container mx-auto px-4 py-8">
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">My Event Registrations</h1>
          <p className="text-muted-foreground">View and manage your event registrations</p>
        </div>
      </div>

      {registrations.length === 0 ? (
        <div className="text-center py-12">
          <Calendar className="mx-auto h-12 w-12 text-gray-400" />
          <h3 className="mt-2 text-sm font-medium text-gray-900">No event registrations</h3>
          <p className="mt-1 text-sm text-gray-500">You haven't registered for any events yet.</p>
          <div className="mt-6">
            <Button onClick={() => router.push('/student/events')}>
              Browse Events
            </Button>
          </div>
        </div>
      ) : (
        <div className="grid gap-6">
          {registrations.map((registration) => {
            const eventDate = new Date(registration.eventDate)
            const isPastEvent = new Date() > eventDate
            const canCancel = !isPastEvent && registration.eventStatus !== 2 // Not cancelled and not past event
            
            return (
              <Card key={registration.eventRegistrationId} className="overflow-hidden">
                <div className="md:flex">
                  <div className="p-6 md:flex-1">
                    <CardHeader className="p-0 mb-4">
                      <div className="flex justify-between items-start">
                        <div>
                          <CardTitle className="text-lg">
                            {registration.eventName}
                          </CardTitle>
                          <CardDescription className="mt-1">
                            {format(eventDate, "EEEE, MMMM d, yyyy 'at' h:mm a")}
                          </CardDescription>
                        </div>
                        {getEventStatusBadge(registration.eventStatus, registration.eventDate)}
                      </div>
                    </CardHeader>
                    <CardContent className="p-0">
                      <div className="space-y-2">
                        <div className="flex items-center text-sm text-muted-foreground">
                          <span>Registration ID: {registration.eventRegistrationId}</span>
                        </div>
                      </div>
                    </CardContent>
                  </div>
                  <CardFooter className="p-6 border-t md:border-t-0 md:border-l md:items-center">
                    <div className="flex flex-col sm:flex-row gap-3 w-full">
                      <Button 
                        variant="outline" 
                        className="w-full"
                        onClick={() => router.push(`/student/events/${registration.eventId}`)}
                      >
                        View Event
                      </Button>
                      <Button 
                        variant="outline" 
                        className="w-full"
                        disabled={!canCancel || cancellingId === registration.eventRegistrationId}
                        onClick={() => handleCancelRegistration(registration.eventRegistrationId)}
                      >
                        {cancellingId === registration.eventRegistrationId ? (
                          <>
                            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                            Cancelling...
                          </>
                        ) : (
                          'Cancel Registration'
                        )}
                      </Button>
                    </div>
                  </CardFooter>
                </div>
              </Card>
            )
          })}
        </div>
      )}
    </div>
    </StudentLayout>
  )
}
