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
import { AdminLayout } from "@/components/layouts/admin-layout"
import { ApiService } from "@/lib/api"
import { Plus, Search, Edit, Power } from "lucide-react"
import { toast } from "sonner"

export default function SubjectsPage() {
  const [subjects, setSubjects] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState("")
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false)
  const [newSubjectName, setNewSubjectName] = useState("")
  const [creating, setCreating] = useState(false)

  useEffect(() => {
    fetchSubjects()
  }, [])

  const fetchSubjects = async () => {
    try {
      setLoading(true)
      const response = await ApiService.getSubjects(1, 100)
      setSubjects(response.data?.items || [])
    } catch (error) {
      console.error("Failed to fetch subjects:", error)
      toast.error("Failed to fetch subjects")
    } finally {
      setLoading(false)
    }
  }

  const handleCreateSubject = async () => {
    if (!newSubjectName.trim()) {
      toast.error("Please enter a subject name")
      return
    }

    try {
      setCreating(true)
      await ApiService.createSubject({ name: newSubjectName })
      toast.success("Subject created successfully")
      setNewSubjectName("")
      setIsCreateDialogOpen(false)
      fetchSubjects()
    } catch (error) {
      console.error("Failed to create subject:", error)
      toast.error("Failed to create subject")
    } finally {
      setCreating(false)
    }
  }

  const getStatusBadge = (isDeleted: boolean) => {
    return isDeleted ? <Badge variant="secondary">Inactive</Badge> : <Badge variant="default">Active</Badge>
  }

  const filteredSubjects = subjects.filter((subject) => subject.name.toLowerCase().includes(searchTerm.toLowerCase()))

  return (
    <AdminLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Subjects</h1>
            <p className="text-gray-600">Manage academic subjects</p>
          </div>
          <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
            <DialogTrigger asChild>
              <Button>
                <Plus className="mr-2 h-4 w-4" />
                Create Subject
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Create New Subject</DialogTitle>
                <DialogDescription>Add a new academic subject to the system.</DialogDescription>
              </DialogHeader>
              <div className="space-y-4">
                <div>
                  <label className="text-sm font-medium">Subject Name</label>
                  <Input
                    placeholder="Enter subject name"
                    value={newSubjectName}
                    onChange={(e) => setNewSubjectName(e.target.value)}
                  />
                </div>
              </div>
              <DialogFooter>
                <Button variant="outline" onClick={() => setIsCreateDialogOpen(false)}>
                  Cancel
                </Button>
                <Button onClick={handleCreateSubject} disabled={creating}>
                  {creating ? "Creating..." : "Create Subject"}
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
                placeholder="Search subjects..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
          </CardContent>
        </Card>

        {/* Subjects List */}
        <Card>
          <CardHeader>
            <CardTitle>Subjects ({filteredSubjects.length})</CardTitle>
            <CardDescription>{loading ? "Loading..." : `Showing ${filteredSubjects.length} subjects`}</CardDescription>
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="flex items-center justify-center py-12">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
              </div>
            ) : (
              <div className="space-y-4">
                {filteredSubjects.map((subject) => (
                  <div
                    key={subject.id}
                    className="flex items-center justify-between p-4 border rounded-lg hover:bg-gray-50"
                  >
                    <div className="flex items-center space-x-4">
                      <div>
                        <h3 className="font-medium text-gray-900">{subject.name}</h3>
                        <div className="mt-1">{getStatusBadge(subject.isDeleted)}</div>
                      </div>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Button variant="outline" size="sm">
                        <Edit className="mr-2 h-4 w-4" />
                        Edit
                      </Button>
                      <Button variant="outline" size="sm">
                        <Power className="mr-2 h-4 w-4" />
                        {subject.isDeleted ? "Activate" : "Deactivate"}
                      </Button>
                    </div>
                  </div>
                ))}

                {filteredSubjects.length === 0 && !loading && (
                  <div className="text-center py-12">
                    <p className="text-gray-500">No subjects found</p>
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
