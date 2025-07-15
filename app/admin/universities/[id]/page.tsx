"use client"

import { useEffect, useState } from "react"
import { useParams } from "next/navigation"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { AdminLayout } from "@/components/layouts/admin-layout"
import { ApiService, type University, type Major, type AdmissionScore } from "@/lib/api"
import { Edit, Plus, Power, User, BookOpen, Trophy, Building2 } from "lucide-react"
import { AddMajorDialog } from "@/components/dialogs/add-major-dialog"
import { AddStaffDialog } from "@/components/dialogs/add-staff-dialog"

export default function UniversityDetailPage() {
  const params = useParams()
  const universityId = params.id as string

  const [university, setUniversity] = useState<University | null>(null)
  const [majors, setMajors] = useState<Major[]>([])
  const [admissionScores, setAdmissionScores] = useState<AdmissionScore[]>([])
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear().toString())
  const [loading, setLoading] = useState(true)
  const [staffAccount, setStaffAccount] = useState<any>(null)

  const [isAddMajorDialogOpen, setIsAddMajorDialogOpen] = useState(false)
  const [isAddStaffDialogOpen, setIsAddStaffDialogOpen] = useState(false)

  useEffect(() => {
    fetchUniversityData()
  }, [universityId])

  useEffect(() => {
    if (selectedYear) {
      fetchAdmissionScores()
    }
  }, [selectedYear])

  const fetchUniversityData = async () => {
    try {
      const [universityRes, majorsRes, staffRes] = await Promise.all([
        ApiService.getUniversityById(universityId),
        ApiService.getMajorsByUniversity(universityId, 1, 50),
        ApiService.getStaffByUniversity(universityId).catch(() => ({ data: null })),
      ])

      setUniversity(universityRes.data)
      setMajors(majorsRes.data?.items || [])
      setStaffAccount(staffRes.data)
    } catch (error) {
      console.error("Failed to fetch university data:", error)
    } finally {
      setLoading(false)
    }
  }

  const fetchAdmissionScores = async () => {
    try {
      const response = await ApiService.getAdmissionScores(universityId, selectedYear)
      setAdmissionScores(response.data || [])
    } catch (error) {
      console.error("Failed to fetch admission scores:", error)
    }
  }

  const getStatusBadge = (status: number) => {
    switch (status) {
      case 1:
        return <Badge variant="default">Active</Badge>
      case 0:
        return <Badge variant="secondary">Inactive</Badge>
      default:
        return <Badge variant="outline">Unknown</Badge>
    }
  }

  const getTypeName = (type: number) => {
    switch (type) {
      case 0:
        return "Public"
      case 1:
        return "Private"
      case 2:
        return "International"
      default:
        return "Unknown"
    }
  }

  if (loading) {
    return (
      <AdminLayout>
        <div className="flex items-center justify-center min-h-[400px]">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary"></div>
        </div>
      </AdminLayout>
    )
  }

  if (!university) {
    return (
      <AdminLayout>
        <div className="text-center py-12">
          <h2 className="text-2xl font-bold text-gray-900">University not found</h2>
        </div>
      </AdminLayout>
    )
  }

  return (
    <AdminLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex justify-between items-start">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">{university.name}</h1>
            <div className="flex items-center space-x-4 mt-2">
              <span className="text-gray-600">
                {university.region} • {getTypeName(university.type)}
              </span>
              {getStatusBadge(university.status)}
            </div>
          </div>
          <Button variant="outline">
            <Edit className="mr-2 h-4 w-4" />
            Edit University
          </Button>
        </div>

        {/* Tabs */}
        <Tabs defaultValue="details" className="space-y-6">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="details" className="flex items-center">
              <Building2 className="mr-2 h-4 w-4" />
              University Details
            </TabsTrigger>
            <TabsTrigger value="majors" className="flex items-center">
              <BookOpen className="mr-2 h-4 w-4" />
              Majors
            </TabsTrigger>
            <TabsTrigger value="scores" className="flex items-center">
              <Trophy className="mr-2 h-4 w-4" />
              Admission Scores
            </TabsTrigger>
            <TabsTrigger value="staff" className="flex items-center">
              <User className="mr-2 h-4 w-4" />
              Staff Account
            </TabsTrigger>
          </TabsList>

          <TabsContent value="details">
            <Card>
              <CardHeader>
                <CardTitle>University Information</CardTitle>
                <CardDescription>Basic information and introduction article</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="grid grid-cols-2 gap-6">
                  <div>
                    <label className="text-sm font-medium text-gray-700">Name</label>
                    <p className="mt-1 text-sm text-gray-900">{university.name}</p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-700">Region</label>
                    <p className="mt-1 text-sm text-gray-900">{university.region}</p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-700">Type</label>
                    <p className="mt-1 text-sm text-gray-900">{getTypeName(university.type)}</p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-700">Status</label>
                    <div className="mt-1">{getStatusBadge(university.status)}</div>
                  </div>
                </div>

                {university.title && (
                  <div>
                    <label className="text-sm font-medium text-gray-700">Introduction Title</label>
                    <p className="mt-1 text-sm text-gray-900">{university.title}</p>
                  </div>
                )}

                {university.content && (
                  <div>
                    <label className="text-sm font-medium text-gray-700">Introduction Content</label>
                    <div className="mt-1 text-sm text-gray-900 whitespace-pre-wrap">{university.content}</div>
                  </div>
                )}

                <Button>
                  <Edit className="mr-2 h-4 w-4" />
                  Update Information
                </Button>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="majors">
            <Card>
              <CardHeader>
                <div className="flex justify-between items-center">
                  <div>
                    <CardTitle>Majors</CardTitle>
                    <CardDescription>Manage university majors and their subject groups</CardDescription>
                  </div>
                  <Button onClick={() => setIsAddMajorDialogOpen(true)}>
                    <Plus className="mr-2 h-4 w-4" />
                    Add Major
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {majors.map((major) => (
                    <div key={major.id} className="flex items-center justify-between p-4 border rounded-lg">
                      <div>
                        <h4 className="font-medium">{major.name}</h4>
                        {major.title && <p className="text-sm text-gray-600 mt-1">{major.title}</p>}
                      </div>
                      <div className="flex items-center space-x-2">
                        {getStatusBadge(major.status)}
                        <Button variant="outline" size="sm">
                          <Edit className="mr-2 h-4 w-4" />
                          Edit
                        </Button>
                        <Button variant="outline" size="sm">
                          <Power className="mr-2 h-4 w-4" />
                          {major.status === 1 ? "Deactivate" : "Activate"}
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="scores">
            <Card>
              <CardHeader>
                <div className="flex justify-between items-center">
                  <div>
                    <CardTitle>Admission Scores</CardTitle>
                    <CardDescription>View and manage admission scores by academic year</CardDescription>
                  </div>
                  <Select value={selectedYear} onValueChange={setSelectedYear}>
                    <SelectTrigger className="w-48">
                      <SelectValue placeholder="Select year" />
                    </SelectTrigger>
                    <SelectContent>
                      {Array.from({ length: 5 }, (_, i) => {
                        const year = new Date().getFullYear() - i
                        return (
                          <SelectItem key={year} value={year.toString()}>
                            {year}
                          </SelectItem>
                        )
                      })}
                    </SelectContent>
                  </Select>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {majors.map((major) => {
                    const score = admissionScores.find((s) => s.majorId === major.id)
                    return (
                      <div key={major.id} className="flex items-center justify-between p-4 border rounded-lg">
                        <div>
                          <h4 className="font-medium">{major.name}</h4>
                        </div>
                        <div className="flex items-center space-x-4">
                          <span className="text-sm text-gray-600">
                            Score: {score ? `${score.minScore} - ${score.maxScore}` : "0 - 0"}
                          </span>
                          <Button variant="outline" size="sm">
                            <Edit className="mr-2 h-4 w-4" />
                            Update Score
                          </Button>
                        </div>
                      </div>
                    )
                  })}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="staff">
            <Card>
              <CardHeader>
                <CardTitle>Staff Account</CardTitle>
                <CardDescription>Manage staff account for this university</CardDescription>
              </CardHeader>
              <CardContent>
                {staffAccount ? (
                  <div className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="text-sm font-medium text-gray-700">Name</label>
                        <p className="mt-1 text-sm text-gray-900">
                          {staffAccount.firstName} {staffAccount.lastName}
                        </p>
                      </div>
                      <div>
                        <label className="text-sm font-medium text-gray-700">Email</label>
                        <p className="mt-1 text-sm text-gray-900">{staffAccount.email}</p>
                      </div>
                      <div>
                        <label className="text-sm font-medium text-gray-700">Phone</label>
                        <p className="mt-1 text-sm text-gray-900">{staffAccount.phoneNumber}</p>
                      </div>
                    </div>
                    <Button variant="destructive">Remove Staff Account</Button>
                  </div>
                ) : (
                  <div className="text-center py-8">
                    <p className="text-gray-500 mb-4">No staff account exists for this university.</p>
                    <Button onClick={() => setIsAddStaffDialogOpen(true)}>
                      <Plus className="mr-2 h-4 w-4" />
                      Create Staff Account
                    </Button>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
        <AddMajorDialog
          open={isAddMajorDialogOpen}
          onOpenChange={setIsAddMajorDialogOpen}
          universityId={universityId}
          onSuccess={fetchUniversityData}
        />

        <AddStaffDialog
          open={isAddStaffDialogOpen}
          onOpenChange={setIsAddStaffDialogOpen}
          universityId={universityId}
          onSuccess={fetchUniversityData}
        />
      </div>
    </AdminLayout>
  )
}
