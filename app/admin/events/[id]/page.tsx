"use client"

import { useEffect, useState } from "react"
import { useParams, useRouter } from "next/navigation"
import { toast } from "sonner"
import { AdminLayout } from "@/components/layouts/admin-layout"
import { ApiService } from "@/lib/api"
import { EventDetail } from "@/components/events/event-detail"

export default function AdminEventDetailPage() {
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

  const handleApprove = async () => {
    try {
      await ApiService.approveEvent(eventId)
      toast.success("Event approved successfully")
      fetchEvent() // Refresh event data
    } catch (error) {
      console.error("Failed to approve event:", error)
      toast.error("Failed to approve event")
    }
  }

  const handleReject = async () => {
    try {
      await ApiService.rejectEvent(eventId)
      toast.success("Event rejected successfully")
      router.push("/admin/events")
    } catch (error) {
      console.error("Failed to reject event:", error)
      toast.error("Failed to reject event")
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
    router.push(`/admin/events/${eventId}/edit`)
  }

  const handleViewRegistrations = () => {
    router.push(`/admin/events/${eventId}/registrations`)
  }

  if (loading || !event) {
    return (
      <AdminLayout>
        <div className="flex items-center justify-center min-h-[400px]">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
        </div>
      </AdminLayout>
    )
  }

  return (
    <AdminLayout>
      <EventDetail
        event={event}
        isAdmin={true}
        onApprove={event.status === 0 ? handleApprove : undefined}
        onReject={event.status === 0 ? handleReject : undefined}
        onCancel={event.status === 0 ? handleCancel : undefined}
        onEdit={handleEdit}
        onViewRegistrations={handleViewRegistrations}
      />
    </AdminLayout>
  )
}
