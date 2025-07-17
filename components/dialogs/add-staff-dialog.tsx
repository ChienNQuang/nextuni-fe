"use client"

import type React from "react"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { ApiService } from "@/lib/api"
import { toast } from "sonner"

interface AddStaffDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  universityId: string
  onSuccess: () => void
}

export function AddStaffDialog({ open, onOpenChange, universityId, onSuccess }: AddStaffDialogProps) {
  const [formData, setFormData] = useState({
    email: "",
    password: "",
    firstName: "",
    lastName: "",
    phoneNumber: "",
  })
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (
      !formData.email.trim() ||
      !formData.password.trim() ||
      !formData.firstName.trim() ||
      !formData.lastName.trim()
    ) {
      toast.error("Please fill in all required fields")
      return
    }

    try {
      setLoading(true)
      const result = await ApiService.createStaffAccount({
        ...formData,
        universityId,
      })
      toast.success("Staff account created successfully")
      setFormData({ email: "", password: "", firstName: "", lastName: "", phoneNumber: "" })
      onOpenChange(false)
      onSuccess()
    } catch (error: any) {
      console.error("Failed to create staff account:", error)
      
      // Handle API validation errors
      if (error.response?.data?.errors?.length > 0) {
        // Show each validation error
        error.response.data.errors.forEach((err: { description: string }) => {
          toast.error(err.description)
        })
      } 
      // Handle other API errors
      else if (error.response?.data?.title || error.response?.data?.detail) {
        toast.error(error.response.data.detail || error.response.data.title)
      }
      // Fallback error message
      else {
        toast.error("Failed to create staff account. Please try again.")
      }
    } finally {
      setLoading(false)
    }
  }

  const handleChange = (field: string, value: string) => {
    setFormData({ ...formData, [field]: value })
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Create Staff Account</DialogTitle>
          <DialogDescription>Create a new staff account for this university.</DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-sm font-medium">First Name *</label>
              <Input
                placeholder="Enter first name"
                value={formData.firstName}
                onChange={(e) => handleChange("firstName", e.target.value)}
                required
              />
            </div>
            <div>
              <label className="text-sm font-medium">Last Name *</label>
              <Input
                placeholder="Enter last name"
                value={formData.lastName}
                onChange={(e) => handleChange("lastName", e.target.value)}
                required
              />
            </div>
          </div>
          <div>
            <label className="text-sm font-medium">Email *</label>
            <Input
              type="email"
              placeholder="Enter email address"
              value={formData.email}
              onChange={(e) => handleChange("email", e.target.value)}
              required
            />
          </div>
          <div>
            <label className="text-sm font-medium">Password *</label>
            <Input
              type="password"
              placeholder="Enter password"
              value={formData.password}
              onChange={(e) => handleChange("password", e.target.value)}
              required
            />
          </div>
          <div>
            <label className="text-sm font-medium">Phone Number</label>
            <Input
              placeholder="Enter phone number"
              value={formData.phoneNumber}
              onChange={(e) => handleChange("phoneNumber", e.target.value)}
            />
          </div>
          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button type="submit" disabled={loading}>
              {loading ? "Creating..." : "Create Account"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
