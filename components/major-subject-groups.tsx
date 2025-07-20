"use client"

import { useState, useEffect } from "react"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Button } from "@/components/ui/button"
import { Loader2, Save } from "lucide-react"
import { ApiService } from "@/lib/api"
import { toast } from "sonner"

interface SubjectGroup {
  id: string
  code: string
}

interface MajorSubjectGroupsProps {
  readonly majorId: string
  readonly subjectGroups: SubjectGroup[]
  readonly initialYear: number
  readonly onUpdate: (year: number, groups: string[]) => Promise<void>
}

export function MajorSubjectGroups({ 
  majorId, 
  subjectGroups,
  initialYear,
  onUpdate 
}: Readonly<MajorSubjectGroupsProps>) {
  const [selectedYear, setSelectedYear] = useState<number>(initialYear)
  const [selectedGroups, setSelectedGroups] = useState<string[]>([])
  const [availableGroups, setAvailableGroups] = useState<SubjectGroup[]>([])
  const [loading, setLoading] = useState(false)
  const [saving, setSaving] = useState(false)

  // Available years (current year and next 4 years)
  const availableYears = Array.from({ length: 5 }, (_, i) => new Date().getFullYear() - i)

  // Load available subject groups
  useEffect(() => {
    const loadGroups = async () => {
      setLoading(true)
      try {
        const response = await ApiService.getSubjectGroups(1, 100)
        if (response.data) {
          setAvailableGroups(response.data.items)
        }
      } catch (error) {
        console.error("Failed to load subject groups:", error)
        toast.error("Failed to load subject groups")
      } finally {
        setLoading(false)
      }
    }

    loadGroups()
  }, [])

  // Update selected groups when year changes
  useEffect(() => {
    setSelectedGroups(subjectGroups.map(g => g.id))
  }, [subjectGroups, selectedYear])

  const handleSave = async () => {
    if (selectedGroups.length === 0) {
      toast.warning("Please select at least one subject group")
      return
    }

    setSaving(true)
    try {
      await onUpdate(selectedYear, selectedGroups)
      toast.success("Subject groups updated successfully")
    } catch (error) {
      console.error("Failed to update subject groups:", error)
      toast.error("Failed to update subject groups")
    } finally {
      setSaving(false)
    }
  }

  const toggleGroup = (groupId: string) => {
    setSelectedGroups(prev => 
      prev.includes(groupId)
        ? prev.filter(id => id !== groupId)
        : [...prev, groupId]
    )
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center p-4">
        <Loader2 className="h-6 w-6 animate-spin" />
      </div>
    )
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center space-x-4">
        <div className="w-48">
          <Select 
            value={selectedYear.toString()} 
            onValueChange={value => setSelectedYear(parseInt(value))}
          >
            <SelectTrigger>
              <SelectValue placeholder="Select year" />
            </SelectTrigger>
            <SelectContent>
              {availableYears.map(year => (
                <SelectItem key={year} value={year.toString()}>
                  {year}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        
        <Button 
          onClick={handleSave}
          disabled={saving}
          className="flex items-center gap-2"
        >
          {saving ? (
            <>
              <Loader2 className="h-4 w-4 animate-spin" />
              Saving...
            </>
          ) : (
            <>
              <Save className="h-4 w-4" />
              Save Changes
            </>
          )}
        </Button>
      </div>

      <div className="space-y-2">
        <h4 className="text-sm font-medium">Subject Groups</h4>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-2">
          {availableGroups.map(group => (
            <button
              key={group.id}
              type="button"
              onClick={() => toggleGroup(group.id)}
              onKeyDown={(e) => {
                if (e.key === 'Enter' || e.key === ' ') {
                  e.preventDefault()
                  toggleGroup(group.id)
                }
              }}
              className={`w-full text-left p-3 border rounded-md transition-colors ${
                selectedGroups.includes(group.id)
                  ? 'bg-primary/10 border-primary'
                  : 'hover:bg-muted/50'
              }`}
              aria-pressed={selectedGroups.includes(group.id)}
            >
              <div className="flex items-center space-x-2">
                <div className={`w-4 h-4 rounded border flex items-center justify-center ${
                  selectedGroups.includes(group.id) 
                    ? 'bg-primary border-primary text-primary-foreground' 
                    : 'bg-background'
                }`}>
                  {selectedGroups.includes(group.id) && (
                    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                      <path d="M20 6L9 17L4 12" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                    </svg>
                  )}
                </div>
                <span className="text-sm">{group.code}</span>
              </div>
            </button>
          ))}
        </div>
      </div>
    </div>
  )
}
