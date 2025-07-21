"use client"

import { useEffect, useState } from "react"
import { useParams, useRouter } from "next/navigation"
import Link from "next/link"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { StudentLayout } from "@/components/layouts/student-layout"
import { ApiService, Event } from "@/lib/api"
import { 
  Calendar,
  Clock,
  MapPin,
  Users,
  CheckCircle,
  XCircle,
  ArrowLeft,
  CalendarDays,
  Timer,
  AlertCircle
} from "lucide-react"

interface RegistrationResponse {
  success: boolean
  message: string
  registrationId?: number
}

export default function EventDetailPage() {
  const params = useParams()
  const router = useRouter()
  const eventId = params.id as string
  
  const [event, setEvent] = useState<Event | null>(null)
  const [loading, setLoading] = useState(true)
  const [registering, setRegistering] = useState(false)
  const [registrationStatus, setRegistrationStatus] = useState<{
    type: 'success' | 'error' | null
    message: string
  }>({ type: null, message: '' })

  useEffect(() => {
    if (eventId) {
      fetchEventData()
    }
  }, [eventId])

  const fetchEventData = async () => {
    try {
      setLoading(true)
      const response = await ApiService.getEventById(eventId)
      setEvent(response.data)
    } catch (error) {
      console.error("Failed to fetch event data:", error)
    } finally {
      setLoading(false)
    }
  }

  const handleRegister = async () => {
    if (!event || !isEventActive()) return

    try {
      setRegistering(true)
      const response = await ApiService.registerForEvent(eventId)
      
      if (response.isSuccess) {
        setRegistrationStatus({
          type: 'success',
          message:  'Successfully registered for the event!'
        })
        // Update local state
        setEvent(prev => prev ? { ...prev, isRegistered: true, currentParticipants: (prev.currentParticipants || 0) + 1 } : null)
      } else {
        setRegistrationStatus({
          type: 'error',
          message:  'Failed to register for the event'
        })
      }
    } catch (error) {
      setRegistrationStatus({
        type: 'error',
        message: 'An error occurred while registering. Please try again.'
      })
    } finally {
      setRegistering(false)
    }
  }

  const isEventActive = () => {
    return true;
  }

  const getStatusBadge = (status: number) => {
    switch (status) {
      case 0:
        return <Badge variant="default">Published</Badge>
      case 1:
        return (
          <Badge variant="outline" className="border-blue-500 text-blue-700">
            Ongoing
          </Badge>
        )
      case 2:
        return <Badge variant="destructive">Cancelled</Badge>
      case 3:
        return <Badge variant="secondary">Completed</Badge>
      default:
        return <Badge variant="outline">Unknown</Badge>
    }
  }

  const getEventStatusInfo = () => {
    if (!event) return { text: '', color: '', icon: null }
    
    switch (event.status) {
      case 0:
        return { text: 'Published', color: 'bg-green-100 text-green-800', icon: CalendarDays }
      case 1:
        return { text: 'Ongoing', color: 'bg-blue-100 text-blue-800', icon: CalendarDays }
      case 2:
        return { text: 'Cancelled', color: 'bg-red-100 text-red-800', icon: XCircle }
      case 3:
        return { text: 'Completed', color: 'bg-gray-100 text-gray-800', icon: CheckCircle }
      default:
        return { text: 'Unknown', color: 'bg-gray-100 text-gray-800', icon: AlertCircle }
    }
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    })
  }

  const formatTime = (dateString: string) => {
    return new Date(dateString).toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  const formatDateTime = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    })
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

  if (!event) {
    return (
      <StudentLayout>
        <div className="text-center py-12">
          <Calendar className="mx-auto h-12 w-12 text-gray-400" />
          <h3 className="mt-2 text-sm font-medium text-gray-900">Event not found</h3>
          <p className="mt-1 text-sm text-gray-500">The event you're looking for doesn't exist.</p>
          <Button asChild className="mt-4">
            <Link href="/student/events">Back to Events</Link>
          </Button>
        </div>
      </StudentLayout>
    )
  }

  const statusInfo = getEventStatusInfo()
  const StatusIcon = statusInfo.icon

  return (
    <StudentLayout>
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="space-y-6">
          {/* Header */}
          <div className="flex items-center space-x-4">
            <Button variant="ghost" onClick={() => router.back()} className="flex items-center space-x-2">
              <ArrowLeft className="h-4 w-4" />
              <span>Back</span>
            </Button>
            <div className="flex items-center space-x-2 text-sm text-gray-500">
              <Link href="/student/events" className="hover:text-gray-700">Events</Link>
              <span>/</span>
              <span>Event Details</span>
            </div>
          </div>

          {/* Registration Status Alert */}
          {registrationStatus.type && (
            <Alert className={registrationStatus.type === 'success' ? 'border-green-200 bg-green-50' : 'border-red-200 bg-red-50'}>
              <AlertCircle className="h-4 w-4" />
              <AlertDescription className={registrationStatus.type === 'success' ? 'text-green-800' : 'text-red-800'}>
                {registrationStatus.message}
              </AlertDescription>
            </Alert>
          )}

          {/* Event Header Card */}
          <Card>
            <CardHeader>
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center space-x-3 mb-2">
                    <Calendar className="h-6 w-6 text-primary" />
                    {StatusIcon && <StatusIcon className="h-5 w-5 text-gray-500" />}
                    <Badge className={statusInfo.color}>{statusInfo.text}</Badge>
                  </div>
                  <CardTitle className="text-2xl md:text-3xl mb-2">{event.title}</CardTitle>
                  <CardDescription className="text-base mb-1">{event.name}</CardDescription>
                </div>
                {isEventActive() && (
                  <Button 
                    onClick={handleRegister} 
                    disabled={registering}
                    size="lg"
                    className="ml-4"
                  >
                    {registering ? 'Registering...' : 'Register Now'}
                  </Button>
                )}
              </div>
            </CardHeader>
          </Card>

          {/* Event Info Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {/* Date & Time */}
            <Card>
              <CardContent className="p-4">
                <div className="flex items-center space-x-3">
                  <CalendarDays className="h-5 w-5 text-primary" />
                  <div>
                    <p className="text-sm text-gray-500">Event Date</p>
                    <p className="font-medium">{formatDate(event.startDate)}</p>
                    <p className="text-sm text-gray-600">
                      {formatTime(event.startDate)} - {formatTime(event.endDate)}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>

          </div>

          {/* Event Content */}
          <Card>
            <CardHeader>
              <CardTitle>Event Details</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="prose max-w-none">
                <div dangerouslySetInnerHTML={{ __html: event.content }} />
              </div>
            </CardContent>
          </Card>

          {/* Registration Button (Mobile) */}
          {isEventActive() && (
            <div className="md:hidden">
              <Button 
                onClick={handleRegister} 
                disabled={registering}
                size="lg"
                className="w-full"
              >
                {registering ? 'Registering...' : 'Register Now'}
              </Button>
            </div>
          )}
        </div>
      </div>
    </StudentLayout>
  )
}