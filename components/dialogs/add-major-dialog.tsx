"use client"

import type React from "react"

import { useState } from "react"
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

interface AddMajorDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  universityId: string
  onSuccess: () => void
}

export function AddMajorDialog({ open, onOpenChange, universityId, onSuccess }: AddMajorDialogProps) {
  const [formData, setFormData] = useState({
    code: "",
    name: ""
  })
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!formData.name.trim()) {
      toast.error("Please enter a major name")
      return
    }

    try {
      setLoading(true)
      const result = await ApiService.createMajor({
        code: formData.code,
        name: formData.name,
        universityId
      })
      
      if (result.isSuccess) {
        toast.success("Major created successfully")
        setFormData({ code: "", name: "" })
        onOpenChange(false)
        onSuccess()
      } else {
        throw new Error("Failed to create major")
      }
    } catch (error) {
      console.error("Failed to create major:", error)
      toast.error("Failed to create major. Please try again.")
    } finally {
      setLoading(false)
    }
  }

  const handleChange = (field: string, value: string) => {
    setFormData({ ...formData, [field]: value })
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>Add New Major</DialogTitle>
          <DialogDescription>Create a new major for this university.</DialogDescription>
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
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button type="submit" disabled={loading}>
              {loading ? "Creating..." : "Create Major"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
