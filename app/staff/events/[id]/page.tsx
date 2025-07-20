"use client"

import { useEffect, useState } from "react"
import { useParams, useRouter } from "next/navigation"
import { toast } from "sonner"
import { StaffLayout } from "@/components/layouts/staff-layout"
import { ApiService } from "@/lib/api"
import { EventDetail } from "@/components/events/event-detail"

export default function StaffEventDetailPage() {
  const params = useParams()
  const router = useRouter()
  const eventId = params.id as string
  
  const [event, setEvent] = useState<any>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (eventId) {
      fetchEvent()
    }
  }, [eventId])

  const fetchEvent = async () => {
    try {
      setLoading(true)
      const response = await ApiService.getEventById(eventId)
      setEvent(response.data)
    } catch (error) {
      console.error("Failed to fetch event:", error)
      toast.error("Failed to load event details")
    } finally {
      setLoading(false)
    }
  }

  const handleCancel = async () => {
    try {
      await ApiService.cancelEvent(eventId)
      toast.success("Event cancelled successfully")
      fetchEvent() // Refresh event data
    } catch (error) {
      console.error("Failed to cancel event:", error)
      toast.error("Failed to cancel event")
    }
  }

  const handleEdit = () => {
    router.push(`/staff/events/${eventId}/edit`)
  }

  const handleViewRegistrations = () => {
    router.push(`/staff/events/${eventId}/registrations`)
  }

  if (loading || !event) {
    return (
      <StaffLayout>
        <div className="flex items-center justify-center min-h-[400px]">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
        </div>
      </StaffLayout>
    )
  }

  return (
    <StaffLayout>
      <EventDetail
        event={event}
        isStaff={true}
        onCancel={event.status === 0 ? handleCancel : undefined}
        onEdit={handleEdit}
        onViewRegistrations={handleViewRegistrations}
      />
    </StaffLayout>
  )
}
