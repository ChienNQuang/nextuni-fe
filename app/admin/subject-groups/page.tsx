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
import { Plus, Search, Edit, Trash2 } from "lucide-react"
import { toast } from "sonner"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog"

export default function SubjectGroupsPage() {
  const [subjectGroups, setSubjectGroups] = useState<any[]>([])
  const [subjects, setSubjects] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState("")
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false)
  const [newGroupCode, setNewGroupCode] = useState("")
  const [editingGroupId, setEditingGroupId] = useState<string | null>(null)
  const [selectedSubjects, setSelectedSubjects] = useState<string[]>([])
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false)
  const [creating, setCreating] = useState(false)
  const [editing, setEditing] = useState(false)
  const [deletingId, setDeletingId] = useState<string | null>(null)
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false)

  useEffect(() => {
    fetchData()
  }, [])

  const fetchData = async () => {
    try {
      setLoading(true)
      const [groupsResponse, subjectsResponse] = await Promise.all([
        ApiService.getAdminSubjectGroups(1, 100),
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
    if (!newGroupCode.trim() || selectedSubjects.length !== 3) {
      toast.error("Please fill in all fields and select exactly 3 subjects")
      return
    }

    try {
      setCreating(true)
      await ApiService.createSubjectGroup({
        code: newGroupCode.trim(),
        subjectIds: selectedSubjects,
      })
      toast.success("Subject group created successfully")
      setIsCreateDialogOpen(false)
      setNewGroupCode("")
      setSelectedSubjects([])
      fetchData()
    } catch (error) {
      console.error("Failed to create subject group:", error)
      toast.error("Failed to create subject group")
    } finally {
      setCreating(false)
    }
  }

  const handleEditClick = (group: any) => {
    setEditingGroupId(group.id)
    setNewGroupCode(group.code)
    setSelectedSubjects(group.subjects.map((s: any) => s.id))
    setIsEditDialogOpen(true)
  }

  const handleUpdateSubjectGroup = async () => {
    if (!editingGroupId || !newGroupCode.trim() || selectedSubjects.length !== 3) {
      toast.error("Please fill in all fields and select exactly 3 subjects")
      return
    }

    try {
      setEditing(true)
      await ApiService.updateSubjectGroup(editingGroupId, {
        code: newGroupCode.trim(),
        subjectIds: selectedSubjects,
      })
      toast.success("Subject group updated successfully")
      setIsEditDialogOpen(false)
      setNewGroupCode("")
      setSelectedSubjects([])
      setEditingGroupId(null)
      fetchData()
    } catch (error) {
      console.error("Failed to update subject group:", error)
      toast.error("Failed to update subject group")
    } finally {
      setEditing(false)
    }
  }

  const handleSubjectToggle = (subjectId: string) => {
    setSelectedSubjects((prev) => {
      // If subject is already selected, remove it
      if (prev.includes(subjectId)) {
        return prev.filter((id) => id !== subjectId)
      }
      // If not selected and we have less than 3 selected, add it
      if (prev.length < 3) {
        return [...prev, subjectId]
      }
      // If already have 3 selected, show error and don't add
      toast.error("A subject group must have exactly 3 subjects")
      return prev
    })
  }

  const resetForm = () => {
    setNewGroupCode("")
    setSelectedSubjects([])
    setEditingGroupId(null)
  }

  const handleDeleteClick = (groupId: string) => {
    setDeletingId(groupId)
    setIsDeleteDialogOpen(true)
  }

  const confirmDelete = async () => {
    if (!deletingId) return

    try {
      await ApiService.deleteSubjectGroup(deletingId)
      toast.success("Subject group deleted successfully")
      setIsDeleteDialogOpen(false)
      fetchData()
    } catch (error) {
      console.error("Failed to delete subject group:", error)
      toast.error("Failed to delete subject group")
    } finally {
      setDeletingId(null)
    }
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
                  <label className="text-sm font-medium">Select Subjects ({selectedSubjects.length}/3){selectedSubjects.length === 3 && <span className="text-green-600 text-xs ml-2">✓ Ready to save</span>}</label>
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
                <Button variant="outline" onClick={() => {
                  setIsCreateDialogOpen(false)
                  resetForm()
                }}>
                  Cancel
                </Button>
                <Button onClick={handleCreateSubjectGroup} disabled={creating}>
                  {creating ? "Creating..." : "Create Subject Group"}
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>

        {/* Delete Confirmation Dialog */}
        <AlertDialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Are you sure?</AlertDialogTitle>
              <AlertDialogDescription>
                This will permanently delete the subject group. This action cannot be undone.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>Cancel</AlertDialogCancel>
              <AlertDialogAction 
                onClick={confirmDelete}
                className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
              >
                {deletingId ? "Deleting..." : "Delete"}
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>

        {/* Edit Subject Group Dialog */}
        <Dialog open={isEditDialogOpen} onOpenChange={(open) => !open && setIsEditDialogOpen(open)}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Edit Subject Group</DialogTitle>
              <DialogDescription>Update the subject group details below.</DialogDescription>
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
                <label className="text-sm font-medium">Select Subjects ({selectedSubjects.length}/3){selectedSubjects.length === 3 && <span className="text-green-600 text-xs ml-2">✓ Ready to save</span>}</label>
                <div className="grid grid-cols-2 gap-2 mt-2 max-h-60 overflow-y-auto">
                  {subjects
                    .filter((subject) => !subject.isDeleted)
                    .map((subject) => (
                      <div key={subject.id} className="flex items-center space-x-2">
                        <Checkbox
                          id={`edit-${subject.id}`}
                          checked={selectedSubjects.includes(subject.id)}
                          onCheckedChange={() => handleSubjectToggle(subject.id)}
                        />
                        <label htmlFor={`edit-${subject.id}`} className="text-sm">
                          {subject.name}
                        </label>
                      </div>
                    ))}
                </div>
              </div>
            </div>
            <DialogFooter>
              <Button 
                variant="outline" 
                onClick={() => {
                  setIsEditDialogOpen(false)
                  resetForm()
                }}
              >
                Cancel
              </Button>
              <Button 
                onClick={handleUpdateSubjectGroup} 
                disabled={editing}
              >
                {editing ? "Updating..." : "Update Subject Group"}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

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
                      <Button 
                        variant="outline" 
                        size="sm"
                        onClick={() => handleEditClick(group)}
                      >
                        <Edit className="h-4 w-4" />
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
