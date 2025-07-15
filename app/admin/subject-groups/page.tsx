"use client"

import { useEffect, useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Checkbox } from "@/components/ui/checkbox"
import { AdminLayout } from "@/components/layouts/admin-layout"
import { ApiService } from "@/lib/api"
import { Plus, Search, Edit } from "lucide-react"
import { toast } from "sonner"

export default function SubjectGroupsPage() {
  const [subjectGroups, setSubjectGroups] = useState<any[]>([])
  const [subjects, setSubjects] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState("")
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false)
  const [newGroupCode, setNewGroupCode] = useState("")
  const [selectedSubjects, setSelectedSubjects] = useState<string[]>([])
  const [creating, setCreating] = useState(false)

  useEffect(() => {
    fetchData()
  }, [])

  const fetchData = async () => {
    try {
      setLoading(true)
      const [groupsResponse, subjectsResponse] = await Promise.all([
        ApiService.getSubjectGroups(1, 100),
        ApiService.getSubjects(1, 100),
      ])
      setSubjectGroups(groupsResponse.data?.items || [])
      setSubjects(subjectsResponse.data?.items || [])
    } catch (error) {
      console.error("Failed to fetch data:", error)
      toast.error("Failed to fetch data")
    } finally {
      setLoading(false)
    }
  }

  const handleCreateSubjectGroup = async () => {
    if (!newGroupCode.trim()) {
      toast.error("Please enter a group code")
      return
    }

    if (selectedSubjects.length !== 3) {
      toast.error("Please select exactly 3 subjects")
      return
    }

    try {
      setCreating(true)
      await ApiService.createSubjectGroup({
        code: newGroupCode,
        subjectIds: selectedSubjects,
      })
      toast.success("Subject group created successfully")
      setNewGroupCode("")
      setSelectedSubjects([])
      setIsCreateDialogOpen(false)
      fetchData()
    } catch (error) {
      console.error("Failed to create subject group:", error)
      toast.error("Failed to create subject group")
    } finally {
      setCreating(false)
    }
  }

  const handleSubjectToggle = (subjectId: string) => {
    setSelectedSubjects((prev) => {
      if (prev.includes(subjectId)) {
        return prev.filter((id) => id !== subjectId)
      } else if (prev.length < 3) {
        return [...prev, subjectId]
      } else {
        toast.error("You can only select 3 subjects")
        return prev
      }
    })
  }

  const getStatusBadge = (isDeleted: boolean) => {
    return isDeleted ? <Badge variant="secondary">Inactive</Badge> : <Badge variant="default">Active</Badge>
  }

  const filteredSubjectGroups = subjectGroups.filter((group) =>
    group.code.toLowerCase().includes(searchTerm.toLowerCase()),
  )

  return (
    <AdminLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Subject Groups</h1>
            <p className="text-gray-600">Manage subject combinations for admissions</p>
          </div>
          <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
            <DialogTrigger asChild>
              <Button>
                <Plus className="mr-2 h-4 w-4" />
                Create Subject Group
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-2xl">
              <DialogHeader>
                <DialogTitle>Create New Subject Group</DialogTitle>
                <DialogDescription>Create a new subject group by selecting exactly 3 subjects.</DialogDescription>
              </DialogHeader>
              <div className="space-y-4">
                <div>
                  <label className="text-sm font-medium">Group Code</label>
                  <Input
                    placeholder="Enter group code (e.g., A00, A01)"
                    value={newGroupCode}
                    onChange={(e) => setNewGroupCode(e.target.value)}
                  />
                </div>
                <div>
                  <label className="text-sm font-medium">Select Subjects ({selectedSubjects.length}/3)</label>
                  <div className="grid grid-cols-2 gap-2 mt-2 max-h-60 overflow-y-auto">
                    {subjects
                      .filter((subject) => !subject.isDeleted)
                      .map((subject) => (
                        <div key={subject.id} className="flex items-center space-x-2">
                          <Checkbox
                            id={subject.id}
                            checked={selectedSubjects.includes(subject.id)}
                            onCheckedChange={() => handleSubjectToggle(subject.id)}
                          />
                          <label htmlFor={subject.id} className="text-sm">
                            {subject.name}
                          </label>
                        </div>
                      ))}
                  </div>
                </div>
              </div>
              <DialogFooter>
                <Button variant="outline" onClick={() => setIsCreateDialogOpen(false)}>
                  Cancel
                </Button>
                <Button onClick={handleCreateSubjectGroup} disabled={creating}>
                  {creating ? "Creating..." : "Create Subject Group"}
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>

        {/* Search */}
        <Card>
          <CardHeader>
            <CardTitle>Search</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
              <Input
                placeholder="Search subject groups..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
          </CardContent>
        </Card>

        {/* Subject Groups List */}
        <Card>
          <CardHeader>
            <CardTitle>Subject Groups ({filteredSubjectGroups.length})</CardTitle>
            <CardDescription>
              {loading ? "Loading..." : `Showing ${filteredSubjectGroups.length} subject groups`}
            </CardDescription>
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="flex items-center justify-center py-12">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
              </div>
            ) : (
              <div className="space-y-4">
                {filteredSubjectGroups.map((group) => (
                  <div
                    key={group.id}
                    className="flex items-center justify-between p-4 border rounded-lg hover:bg-gray-50"
                  >
                    <div className="flex-1">
                      <div className="flex items-center space-x-4">
                        <div>
                          <h3 className="font-medium text-gray-900">{group.code}</h3>
                          <div className="flex flex-wrap gap-2 mt-2">
                            {group.subjects?.map((subject: any) => (
                              <Badge key={subject.id} variant="outline">
                                {subject.name}
                              </Badge>
                            ))}
                          </div>
                          <div className="mt-2">{getStatusBadge(group.isDeleted)}</div>
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Button variant="outline" size="sm">
                        <Edit className="mr-2 h-4 w-4" />
                        Edit
                      </Button>
                    </div>
                  </div>
                ))}

                {filteredSubjectGroups.length === 0 && !loading && (
                  <div className="text-center py-12">
                    <p className="text-gray-500">No subject groups found</p>
                  </div>
                )}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </AdminLayout>
  )
}
