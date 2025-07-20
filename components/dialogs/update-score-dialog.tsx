"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { toast } from "sonner"
import { ApiService } from "@/lib/api"

interface UpdateScoreDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  majorId: string
  majorName: string
  year: string
  initialGpaScore?: number
  initialExamScore?: number
  onSuccess: () => void
}

export function UpdateScoreDialog({
  open,
  onOpenChange,
  majorId,
  majorName,
  year,
  initialGpaScore,
  initialExamScore,
  onSuccess,
}: UpdateScoreDialogProps) {
  const [gpaScore, setGpaScore] = useState(initialGpaScore?.toString() || '')
  const [examScore, setExamScore] = useState(initialExamScore?.toString() || '')
  const [isLoading, setIsLoading] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    try {
      setIsLoading(true)
      await ApiService.updateAdmissionScores(year, [{
        majorId,
        gpaScore: parseFloat(gpaScore) || 0,
        examScore: parseFloat(examScore) || 0
      }])
      
      toast.success("Scores updated successfully")
      onSuccess()
      onOpenChange(false)
    } catch (error) {
      console.error("Error updating scores:", error)
      toast.error("Failed to update scores")
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <form onSubmit={handleSubmit}>
          <DialogHeader>
            <DialogTitle>Update Admission Scores</DialogTitle>
            <DialogDescription>
              Update the admission scores for {majorName} in {year}
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="gpaScore" className="text-right">
                GPA Score
              </Label>
              <Input
                id="gpaScore"
                type="number"
                step="0.1"
                min="0"
                max="10"
                className="col-span-3"
                value={gpaScore}
                onChange={(e) => setGpaScore(e.target.value)}
                required
              />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="examScore" className="text-right">
                Exam Score
              </Label>
              <Input
                id="examScore"
                type="number"
                step="0.1"
                min="0"
                max="30"
                className="col-span-3"
                value={examScore}
                onChange={(e) => setExamScore(e.target.value)}
                required
              />
            </div>
          </div>
          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)} disabled={isLoading}>
              Cancel
            </Button>
            <Button type="submit" disabled={isLoading}>
              {isLoading ? "Saving..." : "Save changes"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
