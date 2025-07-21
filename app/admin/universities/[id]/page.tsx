"use client"

import { useEffect, useState } from "react"
import { useParams } from "next/navigation"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { AdminLayout } from "@/components/layouts/admin-layout"
import { 
  ApiService, 
  type University, 
  type Major, 
  type AdmissionScore, 
  UniversityRegion, 
  UniversityType 
} from "@/lib/api"
import { IntroductionBlog } from "@/components/introduction-blog"
import { UniversityIntroductionBlog } from "@/components/university/university-introduction-blog"
import { Edit, Plus, Power, User, BookOpen, Trophy, Building2, ChevronDown, ChevronUp } from "lucide-react"
import { AddMajorDialog } from "@/components/dialogs/add-major-dialog"
import { EditMajorDialog } from "@/components/dialogs/edit-major-dialog"
import { AddStaffDialog } from "@/components/dialogs/add-staff-dialog"
import { toast } from "sonner"
import { UpdateScoreDialog } from "@/components/dialogs/update-score-dialog"
import { MajorSubjectGroups } from "@/components/major-subject-groups"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"

type UniversityWithRegion = Omit<University, 'title' | 'description'> & {
  region: UniversityRegion;
  universityType: UniversityType;
  introduction?: string;
};


export default function UniversityDetailPage() {
  const params = useParams()
  const universityId = params.id as string

  const [university, setUniversity] = useState<UniversityWithRegion | null>(null)
  const [majors, setMajors] = useState<Major[]>([])
  const [admissionScores, setAdmissionScores] = useState<AdmissionScore[]>([]);
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear())
  const [loading, setLoading] = useState(false)
  const [staffAccount, setStaffAccount] = useState<any>(null)
  const [deletingStaffId, setDeletingStaffId] = useState<string | null>(null)
  const [isAddMajorDialogOpen, setIsAddMajorDialogOpen] = useState(false)
  const [editingMajor, setEditingMajor] = useState<Major | null>(null)
  const [expandedMajors, setExpandedMajors] = useState<Record<string, boolean>>({})
  const [updatingScore, setUpdatingScore] = useState<{
    majorId: string
    majorName: string
    gpaScore?: number
    examScore?: number
  } | null>(null)
  const [isAddStaffDialogOpen, setIsAddStaffDialogOpen] = useState(false)
  const [activeTab, setActiveTab] = useState<string>('details')

  // Initialize active tab from URL hash or default to 'details'
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const tabFromUrl = window.location.hash.replace('#', '')
      if (tabFromUrl && ['details', 'majors', 'scores', 'staff'].includes(tabFromUrl)) {
        setActiveTab(tabFromUrl)
      }
    }
  }, [])

  useEffect(() => {
    const fetchData = async () => {
      try {
        await Promise.all([
          fetchUniversity(),
          fetchMajors(),
          fetchAdmissionScores(),
          fetchStaffAccount()
        ])
      } catch (error) {
        console.error('Failed to fetch data:', error)
        toast.error('Failed to load data')
      }
    }
    
    fetchData()
  }, [universityId])

  useEffect(() => {
    if (selectedYear) {
      fetchAdmissionScores()
    }
  }, [selectedYear])

  const fetchUniversity = async () => {
    try {
      setLoading(true)
      const response = await ApiService.getUniversityById(universityId)
      if (response.isSuccess) {
        setUniversity(response.data)
      }
    } catch (error) {
      console.error('Failed to fetch university:', error)
      toast.error('Failed to load university data')
    } finally {
      setLoading(false)
    }
  }

  const fetchMajorBlog = async (id: string) => {
    try {
      const response = await ApiService.getMajorIntroductionBlog(id) as unknown as {
        isSuccess: boolean;
        data: { title: string; content: string } | null;
      };
      
      if (response.isSuccess && response.data) {
        return { isSuccess: true, data: response.data };
      }
      return { isSuccess: true, data: { title: '', content: '' } };
    } catch (error) {
      console.error('Failed to fetch major blog:', error);
      return { isSuccess: false, data: { title: '', content: '' } };
    }
  };

  const handleSaveMajorBlog = async (data: { 
    title: string; 
    content: string; 
    majorId?: string 
  }): Promise<{ isSuccess: boolean }> => {
    try {
      if (!data.majorId) {
        toast.error('Major ID is required to save introduction');
        return { isSuccess: false };
      }

      const response = await ApiService.createMajorIntroductionBlog({
        majorId: data.majorId,
        title: data.title,
        content: data.content
      });
      
      if (response.isSuccess) {
        toast.success('Major introduction saved successfully');
        return { isSuccess: true };
      } else {
        throw new Error('Failed to save major introduction');
      }
    } catch (error) {
      console.error('Failed to save major blog:', error);
      toast.error('Failed to save major introduction');
      return { isSuccess: false };
    }
  }

  // handleSaveMajorBlog is already defined above with a different signature

  const toggleMajorExpansion = (majorId: string) => {
    setExpandedMajors(prev => ({
      ...prev,
      [majorId]: !prev[majorId]
    }))
  }

  const handleUpdateSubjectGroups = async (majorId: string, year: number, groupIds: string[]) => {
    try {
      const response = await ApiService.updateMajorSubjectGroups(majorId, year, groupIds)
      if (response.isSuccess) {
        // Refresh majors to get updated subject groups
        const response = await ApiService.getAdminMajors(universityId, 1, 100)
        if (response.data) {
          setMajors(response.data.items)
        }
      }
    } catch (error) {
      console.error("Failed to update subject groups:", error)
      throw error
    }
  }

  const fetchMajors = async () => {
    try {
      const result = await ApiService.getMajorsByUniversity(universityId)
      setMajors(result.data.items)
      return result
    } catch (error) {
      console.error("Failed to fetch majors:", error)
      toast.error("Failed to load majors")
      throw error
    }
  }
  
  const handleToggleMajorStatus = async (majorId: string, isDeleted: boolean) => {
    try {
      setLoading(true)
      await ApiService.request<{ isSuccess: boolean }>(`/majors/status/${majorId}`, {
        method: 'PUT'
      })
      await fetchMajors()
      toast.success(`Major ${isDeleted ? 'deactivated' : 'activated'} successfully`)
    } catch (error) {
      console.error('Error toggling major status:', error)
      toast.error(`Failed to ${isDeleted ? 'deactivate' : 'activate'} major`)
    } finally {
      setLoading(false)
    }
  }

  const fetchAdmissionScores = async () => {
    try {
      const response = await ApiService.getAdmissionScores(universityId, selectedYear.toString());
      if (response.isSuccess) {
        // Ensure we're setting an array of AdmissionScore
        const scores = Array.isArray(response.data) ? response.data : [];
        setAdmissionScores(scores);
      } else {
        setAdmissionScores([]);
      }
    } catch (error) {
      console.error('Failed to fetch admission scores:', error);
      setAdmissionScores([]);
    }
  };

  const fetchStaffAccount = async () => {
    try {
      const response = await ApiService.getStaffByUniversity(universityId)
      setStaffAccount(response.data || null)
    } catch (error) {
      console.error('Failed to fetch staff account:', error)
      toast.error('Failed to load staff account')
    }
  }

  const getStatusBadge = (isDeleted: boolean) => {
    return isDeleted ? (
      <Badge variant="secondary">Inactive</Badge>
    ) : (
      <Badge variant="default">Active</Badge>
    )
  }

  const getRegionName = (region: number): string => {
    switch (region) {
      case UniversityRegion.North:
        return "North"
      case UniversityRegion.Middle:
        return "Central"
      case UniversityRegion.South:
        return "South"
      default:
        return "Unknown"
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

  const handleTabChange = (value: string) => {
    setActiveTab(value)
    if (typeof window !== 'undefined') {
      const newUrl = new URL(window.location.href)
      newUrl.hash = value
      window.history.replaceState({}, '', newUrl.toString())
    }
  }

  const handleDeleteStaff = async () => {
    if (!confirm('Are you sure you want to remove the staff account for this university? This action cannot be undone.')) {
      return
    }

    try {
      setDeletingStaffId(universityId)
      await ApiService.deleteStaffAccount(universityId)
      toast.success('Staff account removed successfully')
      setStaffAccount(null)
    } catch (error: any) {
      console.error('Failed to remove staff account:', error)
      if (error.response?.data?.errors?.length > 0) {
        error.response.data.errors.forEach((err: { description: string }) => {
          toast.error(err.description)
        })
      } else {
        toast.error(error.response?.data?.message || 'Failed to remove staff account')
      }
    } finally {
      setDeletingStaffId(null)
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
  const availableYears = Array.from({ length: 5 }, (_, i) => new Date().getFullYear() - i)

  return (
    <AdminLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex justify-between items-start">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">{university.name}</h1>
            <div className="flex items-center space-x-4 mt-2">
              <span className="text-gray-600">
                {getRegionName(university.region)} • {getTypeName(university.universityType)}
              </span>
              {getStatusBadge(university.isDeleted)}
            </div>
          </div>
        </div>

        {/* Tabs */}
        <Tabs value={activeTab} onValueChange={handleTabChange} className="space-y-6">
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
            <TabsTrigger value="staff" className="flex items-center gap-2">
              <User className="h-4 w-4" />
              <span>Staff ({staffAccount ? 1 : 0})</span>
            </TabsTrigger>
          </TabsList>

          <TabsContent value="details">
            <Card>
              <CardHeader>
                <CardTitle>University Information</CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="space-y-6">
                  <h2 className="text-xl font-semibold">University Introduction</h2>
                  <UniversityIntroductionBlog 
                    universityId={universityId}
                    initialContent={university.introduction || ''}
                    onSave={() => {
                      // Refresh university data after saving
                      fetchUniversity();
                    }}
                  />
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-700">Type</label>
                  <p className="mt-1 text-sm text-gray-900">{getTypeName(university.universityType)}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-700">Status</label>
                  <div className="mt-1">{getStatusBadge(university.isDeleted)}</div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="majors">
            <Card>
              <CardHeader>
                <div className="flex justify-between items-center">
                  <div>
                    <CardTitle>Majors</CardTitle>
                    <p className="text-sm text-gray-500">Manage university majors and their subject groups</p>
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
                    <div key={major.id} className="border rounded-lg overflow-hidden">
                      <div className="flex items-center justify-between p-4 bg-gray-50 border-b">
                        <div>
                          <h4 className="font-medium">{major.name}</h4>
                          <p className="text-sm text-gray-600">Code: {major.code}</p>
                        </div>
                        <div className="flex items-center space-x-2">
                          {getStatusBadge(major.isDeleted)}
                          <Button 
                            variant="outline" 
                            size="sm"
                            onClick={() => toggleMajorExpansion(major.id)}
                          >
                            {expandedMajors[major.id] ? (
                              <>
                                <ChevronUp className="mr-2 h-4 w-4" />
                                Hide Details
                              </>
                            ) : (
                              <>
                                <ChevronDown className="mr-2 h-4 w-4" />
                                Manage Groups
                              </>
                            )}
                          </Button>
                          <Button 
                            variant="outline" 
                            size="sm"
                            onClick={() => setEditingMajor(major)}
                          >
                            <Edit className="mr-2 h-4 w-4" />
                            Edit
                          </Button>
                          <Button 
                            variant="outline" 
                            size="sm"
                            onClick={() => handleToggleMajorStatus(major.id, !major.isDeleted)}
                            disabled={loading}
                          >
                            <Power className="mr-2 h-4 w-4" />
                            {major.isDeleted ? "Activate" : "Deactivate"}
                          </Button>
                        </div>
                      </div>
                      
                      {expandedMajors[major.id] && (
                        <div className="p-6 border-t">
                          <h4 className="font-medium mb-4">Subject Group Management</h4>
                          <MajorSubjectGroups 
                            majorId={major.id}
                            subjectGroupByYear={major.subjectGroupByYear|| {}}
                            initialYear={selectedYear}
                            onUpdate={(year, groups) => handleUpdateSubjectGroups(major.id, year, groups)}
                          />
                          
                          <div className="mt-6">
                            <h4 className="font-medium mb-2">Introduction Blog</h4>
                            <IntroductionBlog
                              id={major.id}
                              type="major"
                              onSave={handleSaveMajorBlog}
                              onFetch={fetchMajorBlog}
                            />
                          </div>
                        </div>
                      )}
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
                    <p className="text-sm text-gray-500">View and update admission scores by year</p>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Select value={selectedYear.toString()} onValueChange={(value) => setSelectedYear(parseInt(value))}>
                      <SelectTrigger className="w-32">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {availableYears.map(year => (
                          <SelectItem key={year} value={year.toString()}>{year}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {admissionScores.length > 0 ? (
                    <div className="overflow-x-auto">
                      <table className="min-w-full divide-y divide-gray-200">
                        <thead className="bg-gray-50">
                          <tr>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                              Major
                            </th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                              GPA Score
                            </th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                              Exam Score
                            </th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                              Actions
                            </th>
                          </tr>
                        </thead>
                        <tbody className="bg-white divide-y divide-gray-200">
                          {admissionScores.map((score) => (
                            <tr key={score.majorId}>
                              <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                                {score.majorName}
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                {score.gpaScore || 'N/A'}
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                {score.examScore || 'N/A'}
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  onClick={() =>
                                    setUpdatingScore({
                                      majorId: score.majorId,
                                      majorName: score.majorName,
                                      gpaScore: score.gpaScore,
                                      examScore: score.examScore
                                    })
                                  }
                                  disabled={selectedYear !== new Date().getFullYear()}
                                >
                                  <Edit className="h-4 w-4 mr-2" />
                                  Edit
                                </Button>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  ) : (
                    <div className="text-center py-8">
                      <p className="text-gray-500">No admission scores found for the selected year.</p>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="staff">
            <Card>
              <CardHeader>
                <div className="flex justify-between items-center">
                  <div>
                    <CardTitle>Staff Account</CardTitle>
                    <p className="text-sm text-gray-500">
                      {staffAccount
                        ? "Manage the staff account for this university"
                        : "No staff account has been created for this university"}
                    </p>
                  </div>
                  {!staffAccount && (
                    <Button onClick={() => setIsAddStaffDialogOpen(true)}>
                      <Plus className="mr-2 h-4 w-4" />
                      Add Staff Account
                    </Button>
                  )}
                </div>
              </CardHeader>
              {staffAccount && (
                <CardContent>
                  <div className="border rounded-lg p-4">
                    <div className="flex justify-between items-center">
                      <div>
                        <h4 className="font-medium">{staffAccount.email}</h4>
                      </div>
                      <Button
                        variant="destructive"
                        size="sm"
                        onClick={handleDeleteStaff}
                        disabled={deletingStaffId === universityId}
                      >
                        {deletingStaffId === universityId ? "Removing..." : "Remove Access"}
                      </Button>
                    </div>
                  </div>
                </CardContent>
              )}
            </Card>
          </TabsContent>
        </Tabs>

        {/* Dialogs */}
        <AddMajorDialog
          open={isAddMajorDialogOpen}
          onOpenChange={setIsAddMajorDialogOpen}
          universityId={universityId}
          onSuccess={() => {
            fetchMajors()
            setIsAddMajorDialogOpen(false)
          }}
        />

        {editingMajor && (
          <EditMajorDialog
            open={!!editingMajor}
            onOpenChange={(open) => !open && setEditingMajor(null)}
            major={editingMajor}
            onSuccess={() => {
              fetchMajors()
              setEditingMajor(null)
            }}
          />
        )}

        <AddStaffDialog
          open={isAddStaffDialogOpen}
          onOpenChange={setIsAddStaffDialogOpen}
          universityId={universityId}
          onSuccess={() => {
            fetchStaffAccount()
            setIsAddStaffDialogOpen(false)
          }}
        />

        {updatingScore && (
          <UpdateScoreDialog
            open={!!updatingScore}
            onOpenChange={(open) => !open && setUpdatingScore(null)}
            majorId={updatingScore.majorId}
            majorName={updatingScore.majorName}
            year={selectedYear}
            initialGpaScore={updatingScore.gpaScore}
            initialExamScore={updatingScore.examScore}
            onSuccess={() => {
              fetchAdmissionScores()
              setUpdatingScore(null)
            }}
          />
        )}
      </div>
    </AdminLayout>
  )
}
