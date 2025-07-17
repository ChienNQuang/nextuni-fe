"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
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

interface EditMajorDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  major: {
    id: string
    name: string
    code: string
    title?: string
    content?: string
  }
  onSuccess: () => void
}

export function EditMajorDialog({ open, onOpenChange, major, onSuccess }: EditMajorDialogProps) {
  const [formData, setFormData] = useState({
    code: "",
    name: ""
  })
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    if (major) {
      setFormData({
        code: major.code || "",
        name: major.name || ""
      })
    }
  }, [major])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!formData.name.trim()) {
      toast.error("Please enter a major name")
      return
    }

    try {
      setLoading(true)
      await ApiService.request(`/majors/${major.id}`, {
        method: "PUT",
        body: JSON.stringify({
          code: formData.code,
          name: formData.name
        }),
      })
      
      toast.success("Major updated successfully")
      onOpenChange(false)
      onSuccess()
    } catch (error) {
      console.error("Failed to update major:", error)
      toast.error("Failed to update major. Please try again.")
    } finally {
      setLoading(false)
    }
  }

  const handleChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }))
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>Edit Major</DialogTitle>
          <DialogDescription>Update major information</DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-sm font-medium">Major Code</label>
              <Input
                placeholder="Enter major code"
                value={formData.code}
                onChange={(e) => handleChange("code", e.target.value)}
              />
            </div>
            <div>
              <label className="text-sm font-medium">Major Name *</label>
              <Input
                placeholder="Enter major name"
                value={formData.name}
                onChange={(e) => handleChange("name", e.target.value)}
                required
              />
            </div>
          </div>
          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              disabled={loading}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={loading}>
              {loading ? "Saving..." : "Save Changes"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
