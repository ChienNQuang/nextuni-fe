"use client"

import { Button } from "@/components/ui/button"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { EventRegistration } from "@/lib/api"
import { X } from 'lucide-react'
import { useEffect, useState } from "react"
import { ApiService } from "@/lib/api"  // Import as value for runtime usage

interface EventRegistrationsDialogProps {
  readonly eventId: string
  readonly open: boolean
  readonly onOpenChange: (open: boolean) => void
}

export function EventRegistrationsDialog({ eventId, open, onOpenChange }: EventRegistrationsDialogProps) {
  const [registrations, setRegistrations] = useState<EventRegistration[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (open) {
      fetchRegistrations()
    }
  }, [open])

  const fetchRegistrations = async () => {
    try {
      setLoading(true)
      setError(null)
      const response = await ApiService.getEventRegistrations(eventId)
      if (response.isSuccess) {
        setRegistrations(response.data || [])
      } else {
        setError('Failed to load registrations')
      }
    } catch (error) {
      console.error('Error fetching registrations:', error)
      setError('An error occurred while loading registrations')
    } finally {
      setLoading(false)
    }
  }

  const renderContent = () => {
    if (loading) {
      return (
        <div className="flex justify-center py-8">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900"></div>
        </div>
      )
    }

    if (error) {
      return <div className="text-red-500 text-center py-4">{error}</div>
    }

    if (registrations.length === 0) {
      return <div className="text-center py-4 text-gray-500">No registrations found for this event.</div>
    }

    return (
      <div className="border rounded-md">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Name</TableHead>
              <TableHead>Email</TableHead>
              <TableHead>Phone</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {registrations.map((reg) => (
              <TableRow key={`${reg.email}-${reg.phoneNumber}`}>
                <TableCell>{`${reg.firstName} ${reg.lastName}`}</TableCell>
                <TableCell>{reg.email}</TableCell>
                <TableCell>{reg.phoneNumber || 'N/A'}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    )
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <div className="flex justify-between items-center">
            <DialogTitle>Event Registrations</DialogTitle>
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
        {renderContent()}
      </DialogContent>
    </Dialog>
  )
}

// Using the imported ApiService type from above
