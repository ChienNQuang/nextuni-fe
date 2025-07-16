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
import { ApiService } from "@/lib/api"
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

// Type definitions
interface Event {
  name: string
  id: string
  title: string
  content: string
  status: number
  universityId: string
  startDate: string
  endDate: string
  // Optional additional fields for enhanced functionality
  registrationDeadline?: string
  location?: string
  maxParticipants?: number
  currentParticipants?: number
  organizerName?: string
  category?: string
  isRegistered?: boolean
  registrationFee?: number
  requirements?: string[]
  contactInfo?: string
}

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
      
      if (response.success) {
        setRegistrationStatus({
          type: 'success',
          message: response.message || 'Successfully registered for the event!'
        })
        // Update local state
        setEvent(prev => prev ? { ...prev, isRegistered: true, currentParticipants: (prev.currentParticipants || 0) + 1 } : null)
      } else {
        setRegistrationStatus({
          type: 'error',
          message: response.message || 'Failed to register for the event'
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
    if (!event) return false
    
    const now = new Date()
    const registrationDeadline = event.registrationDeadline ? new Date(event.registrationDeadline) : new Date(event.startDate)
    const eventEnd = new Date(event.endDate)
    
    return (
      event.status === 0 && // 0 = active
      now <= registrationDeadline &&
      now <= eventEnd &&
      !event.isRegistered &&
      (event.maxParticipants ? (event.currentParticipants || 0) < event.maxParticipants : true)
    )
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
    
    const now = new Date()
    const registrationDeadline = event.registrationDeadline ? new Date(event.registrationDeadline) : new Date(event.startDate)
    const eventStart = new Date(event.startDate)
    const eventEnd = new Date(event.endDate)
    
    // Status: 0 = published, 1 = ongoing, 2 = cancelled, 3 = completed
    if (event.status === 2) {
      return { text: 'Cancelled', color: 'bg-red-100 text-red-800', icon: XCircle }
    }
    
    if (event.status === 3 || now > eventEnd) {
      return { text: 'Completed', color: 'bg-gray-100 text-gray-800', icon: CheckCircle }
    }
    
    if (now > registrationDeadline) {
      return { text: 'Registration Closed', color: 'bg-orange-100 text-orange-800', icon: Timer }
    }
    
    if (event.maxParticipants && (event.currentParticipants || 0) >= event.maxParticipants) {
      return { text: 'Full', color: 'bg-yellow-100 text-yellow-800', icon: Users }
    }
    
    if (event.isRegistered) {
      return { text: 'Registered', color: 'bg-green-100 text-green-800', icon: CheckCircle }
    }
    
    if (event.status === 1) {
      return { text: 'Ongoing', color: 'bg-blue-100 text-blue-800', icon: CalendarDays }
    }
    
    if (event.status === 0 && now < eventStart) {
      return { text: 'Published', color: 'bg-green-100 text-green-800', icon: CalendarDays }
    }
    
    if (event.status === 0) {
      return { text: 'Open for Registration', color: 'bg-green-100 text-green-800', icon: CheckCircle }
    }
    
    return { text: 'Unknown', color: 'bg-gray-100 text-gray-800', icon: AlertCircle }
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
                    {event.category && (
                      <Badge variant="outline">{event.category}</Badge>
                    )}
                  </div>
                  <CardTitle className="text-2xl md:text-3xl mb-2">{event.title}</CardTitle>
                  <CardDescription className="text-base mb-1">{event.name}</CardDescription>
                  {event.organizerName && (
                    <CardDescription className="text-sm text-gray-600">
                      Organized by {event.organizerName}
                    </CardDescription>
                  )}
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

            {/* Registration Deadline */}
            {event.registrationDeadline && (
              <Card>
                <CardContent className="p-4">
                  <div className="flex items-center space-x-3">
                    <Timer className="h-5 w-5 text-orange-500" />
                    <div>
                      <p className="text-sm text-gray-500">Registration Deadline</p>
                      <p className="font-medium">{formatDateTime(event.registrationDeadline)}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Location */}
            {event.location && (
              <Card>
                <CardContent className="p-4">
                  <div className="flex items-center space-x-3">
                    <MapPin className="h-5 w-5 text-red-500" />
                    <div>
                      <p className="text-sm text-gray-500">Location</p>
                      <p className="font-medium">{event.location}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Participants */}
            {event.maxParticipants && (
              <Card>
                <CardContent className="p-4">
                  <div className="flex items-center space-x-3">
                    <Users className="h-5 w-5 text-blue-500" />
                    <div>
                      <p className="text-sm text-gray-500">Participants</p>
                      <p className="font-medium">
                        {event.currentParticipants || 0} / {event.maxParticipants}
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Registration Fee */}
            {event.registrationFee !== undefined && (
              <Card>
                <CardContent className="p-4">
                  <div className="flex items-center space-x-3">
                    <Calendar className="h-5 w-5 text-green-500" />
                    <div>
                      <p className="text-sm text-gray-500">Registration Fee</p>
                      <p className="font-medium">
                        {event.registrationFee === 0 ? 'Free' : `$${event.registrationFee}`}
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}
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

          {/* Requirements */}
          {event.requirements && event.requirements.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle>Requirements</CardTitle>
              </CardHeader>
              <CardContent>
                <ul className="space-y-2">
                  {event.requirements.map((requirement, index) => (
                    <li key={index} className="flex items-start space-x-2">
                      <CheckCircle className="h-4 w-4 text-green-500 mt-0.5 flex-shrink-0" />
                      <span className="text-sm">{requirement}</span>
                    </li>
                  ))}
                </ul>
              </CardContent>
            </Card>
          )}

          {/* Contact Information */}
          {event.contactInfo && (
            <Card>
              <CardHeader>
                <CardTitle>Contact Information</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-gray-700">{event.contactInfo}</p>
              </CardContent>
            </Card>
          )}

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