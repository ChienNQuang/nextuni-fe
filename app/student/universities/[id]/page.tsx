"use client"

import { useEffect, useState } from "react"
import { useParams } from "next/navigation"
import Link from "next/link"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Separator } from "@/components/ui/separator"
import { StudentLayout } from "@/components/layouts/student-layout"
import { ApiService } from "@/lib/api"
import { 
  Building2, 
  MapPin, 
  BookOpen, 
  GraduationCap, 
  TrendingUp, 
  FileText,
  Calendar,
  Users,
  Award
} from "lucide-react"

// Type definitions
interface University {
  id: number
  name: string
  region: number
  type: number
  title?: string
  content?: string
}

interface Major {
  id: number
  name: string
  code: string
  universityId: number
  description?: string
  article?: {
    title: string
    content: string
  }
}

interface SubjectCombination {
  id: number
  majorId: number
  year: number
  subjects: string[]
  requirements: string
}

interface AdmissionScore {
  id: number
  majorId: number
  year: number
  minScore: number
  maxScore: number
  majorName: string
}

interface AdvisoryArticle {
  id: number
  title: string
  content: string
  universityId: number
  createdAt: string
  author?: string
}

export default function UniversityDetailPage() {
  const params = useParams()
  const universityId = params.id as string
  
  // Main data states
  const [university, setUniversity] = useState<University | null>(null)
  const [majors, setMajors] = useState<Major[]>([])
  const [selectedMajor, setSelectedMajor] = useState<Major | null>(null)
  const [subjectCombinations, setSubjectCombinations] = useState<SubjectCombination[]>([])
  const [admissionScores, setAdmissionScores] = useState<AdmissionScore[]>([])
  const [advisoryArticles, setAdvisoryArticles] = useState<AdvisoryArticle[]>([])
  
  // UI states
  const [loading, setLoading] = useState(true)
  const [activeTab, setActiveTab] = useState("information")
  const [selectedYear, setSelectedYear] = useState<number>(2024)
  const [selectedScoreYear, setSelectedScoreYear] = useState<number>(2024)

  // Available years for dropdowns
  const availableYears = [2024, 2023, 2022, 2021, 2020]

  console.log("University ID:", universityId)

  useEffect(() => {
    if (universityId) {
      fetchUniversityData()
    }
  }, [universityId, selectedYear, selectedScoreYear])

  const fetchUniversityData = async () => {
    try {
      setLoading(true)
      
      // Fetch university details
      const universityResponse = await ApiService.getUniversityById(String(universityId))
      setUniversity(universityResponse.data)
      
      // Fetch majors
      const majorsResponse = await ApiService.getMajorsByUniversity(String(universityId))
      setMajors(majorsResponse.data?.items || [])
      
      // Fetch admission scores
      const scoresResponse = await ApiService.getAdmissionScores(String(universityId), selectedScoreYear.toString())
      setAdmissionScores(scoresResponse.data?.items || [])
      
      // Fetch advisory articles
      const articlesResponse = await ApiService.getUniversityConsellingArticles(String(universityId), "Published", 1, 100)
      setAdvisoryArticles(articlesResponse.data?.items || [])
      
    } catch (error) {
      console.error("Failed to fetch university data:", error)
    } finally {
      setLoading(false)
    }
  }



  const handleMajorSelect = async (major: Major) => {
    setSelectedMajor(major)
  }

  const handleYearChange = async (year: string) => {
    const yearNum = parseInt(year)
    setSelectedYear(yearNum)
  }

  const getRegionName = (region: number) => {
    switch (region) {
      case 0: return "North"
      case 1: return "Middle"
      case 2: return "South"
      default: return "Unknown"
    }
  }

  const getTypeName = (type: number) => {
    switch (type) {
      case 0: return "Public"
      case 1: return "Private"
      case 2: return "International"
      default: return "Unknown"
    }
  }

  const getTypeColor = (type: number) => {
    switch (type) {
      case 0: return "bg-blue-100 text-blue-800"
      case 1: return "bg-green-100 text-green-800"
      case 2: return "bg-purple-100 text-purple-800"
      default: return "bg-gray-100 text-gray-800"
    }
  }

  const getScoresForYear = (year: number) => {
    return admissionScores.filter(score => score.year === year)
  }

  const formatScore = (min: number, max: number) => {
    if (min === 0 && max === 0) return "0 - 0"
    return `${min} - ${max}`
  }

  if (loading) {
    return (
      <StudentLayout>
        <div className="flex items-center justify-center min-h-[400px]">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary"></div>
        </div>
      </StudentLayout>
    )
  }

  if (!university) {
    return (
      <StudentLayout>
        <div className="text-center py-12">
          <Building2 className="mx-auto h-12 w-12 text-gray-400" />
          <h3 className="mt-2 text-sm font-medium text-gray-900">University not found</h3>
        </div>
      </StudentLayout>
    )
  }

  return (
    <StudentLayout>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="space-y-6">
          {/* Header */}
          <div className="bg-white rounded-lg shadow-sm border p-6">
            <div className="flex items-start justify-between">
              <div className="flex items-start space-x-4">
                <div className="p-3 bg-primary/10 rounded-lg">
                  <Building2 className="h-8 w-8 text-primary" />
                </div>
                <div>
                  <h1 className="text-3xl font-bold text-gray-900">{university.name}</h1>
                  <div className="flex items-center space-x-4 mt-2">
                    <div className="flex items-center text-gray-600">
                      <MapPin className="mr-1 h-4 w-4" />
                      {getRegionName(university.region)} Region
                    </div>
                    <Badge className={getTypeColor(university.type)}>
                      {getTypeName(university.type)}
                    </Badge>
                  </div>
                </div>
              </div>
              <Button variant="outline" asChild>
                <Link href="/student/universities">
                  ← Back to Universities
                </Link>
              </Button>
            </div>
          </div>

          {/* Tabs */}
          <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
            <TabsList className="grid w-full grid-cols-4">
              <TabsTrigger value="information" className="flex items-center space-x-2">
                <FileText className="h-4 w-4" />
                <span>Information</span>
              </TabsTrigger>
              <TabsTrigger value="majors" className="flex items-center space-x-2">
                <BookOpen className="h-4 w-4" />
                <span>Majors</span>
              </TabsTrigger>
              <TabsTrigger value="scores" className="flex items-center space-x-2">
                <TrendingUp className="h-4 w-4" />
                <span>Admission Scores</span>
              </TabsTrigger>
              <TabsTrigger value="articles" className="flex items-center space-x-2">
                <GraduationCap className="h-4 w-4" />
                <span>Advisory Articles</span>
              </TabsTrigger>
            </TabsList>

            {/* Information & Introduction Tab */}
            <TabsContent value="information" className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center space-x-2">
                    <Building2 className="h-5 w-5" />
                    <span>University Information</span>
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="flex items-center space-x-3">
                      <MapPin className="h-5 w-5 text-gray-500" />
                      <div>
                        <p className="text-sm text-gray-500">Region</p>
                        <p className="font-medium">{getRegionName(university.region)}</p>
                      </div>
                    </div>
                    <div className="flex items-center space-x-3">
                      <Users className="h-5 w-5 text-gray-500" />
                      <div>
                        <p className="text-sm text-gray-500">Type</p>
                        <p className="font-medium">{getTypeName(university.type)}</p>
                      </div>
                    </div>
                    <div className="flex items-center space-x-3">
                      <BookOpen className="h-5 w-5 text-gray-500" />
                      <div>
                        <p className="text-sm text-gray-500">Available Majors</p>
                        <p className="font-medium">{majors.length}</p>
                      </div>
                    </div>
                  </div>
                  
                  <Separator />
                  
                  {university.title && (
                    <div>
                      <h3 className="text-lg font-semibold mb-3">{university.title}</h3>
                      <div className="prose max-w-none text-gray-700">
                        {university.content ? (
                          <div dangerouslySetInnerHTML={{ __html: university.content }} />
                        ) : (
                          <p>No detailed information available.</p>
                        )}
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>
            </TabsContent>

            {/* Majors Tab */}
            <TabsContent value="majors" className="space-y-6">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Majors List */}
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center space-x-2">
                      <BookOpen className="h-5 w-5" />
                      <span>Available Majors</span>
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-2 max-h-96 overflow-y-auto">
                      {majors.map((major) => (
                        <div
                          key={major.id}
                          className={`p-3 rounded-lg border cursor-pointer transition-colors ${
                            selectedMajor?.id === major.id
                              ? 'border-primary bg-primary/5'
                              : 'border-gray-200 hover:border-gray-300'
                          }`}
                          onClick={() => handleMajorSelect(major)}
                        >
                          <div className="flex justify-between items-start">
                            <div>
                              <h4 className="font-medium">{major.name}</h4>
                              <p className="text-sm text-gray-500">{major.code}</p>
                            </div>
                            <Award className="h-4 w-4 text-gray-400" />
                          </div>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>

                {/* Major Details */}
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center justify-between">
                      <span className="flex items-center space-x-2">
                        <GraduationCap className="h-5 w-5" />
                        <span>Major Details</span>
                      </span>
                      {selectedMajor && (
                        <Select value={selectedYear.toString()} onValueChange={handleYearChange}>
                          <SelectTrigger className="w-32">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            {availableYears.map(year => (
                              <SelectItem key={year} value={year.toString()}>{year}</SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      )}
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    {selectedMajor ? (
                      <div className="space-y-4">
                        <div>
                          <h4 className="font-semibold text-lg">{selectedMajor.name}</h4>
                          <p className="text-sm text-gray-500 mb-3">{selectedMajor.code}</p>
                          
                          {selectedMajor.article && (
                            <div>
                              <h5 className="font-medium mb-2">{selectedMajor.article.title}</h5>
                              <div className="prose max-w-none text-sm text-gray-700">
                                <div dangerouslySetInnerHTML={{ __html: selectedMajor.article.content }} />
                              </div>
                            </div>
                          )}
                        </div>

                        <Separator />

                        <div>
                          <h5 className="font-medium mb-3">Subject Combinations ({selectedYear})</h5>
                          {subjectCombinations.length > 0 ? (
                            <div className="space-y-2">
                              {subjectCombinations.map((combination) => (
                                <div key={combination.id} className="p-3 bg-gray-50 rounded-lg">
                                  <div className="flex flex-wrap gap-2 mb-2">
                                    {combination.subjects.map((subject, index) => (
                                      <Badge key={index} variant="secondary">{subject}</Badge>
                                    ))}
                                  </div>
                                  <p className="text-sm text-gray-600">{combination.requirements}</p>
                                </div>
                              ))}
                            </div>
                          ) : (
                            <p className="text-sm text-gray-500">No subject combinations available for {selectedYear}</p>
                          )}
                        </div>
                      </div>
                    ) : (
                      <p className="text-gray-500">Select a major to view details</p>
                    )}
                  </CardContent>
                </Card>
              </div>
            </TabsContent>

            {/* Admission Scores Tab */}
            <TabsContent value="scores" className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center justify-between">
                    <span className="flex items-center space-x-2">
                      <TrendingUp className="h-5 w-5" />
                      <span>Admission Scores</span>
                    </span>
                    <Select value={selectedScoreYear.toString()} onValueChange={(value) => setSelectedScoreYear(parseInt(value))}>
                      <SelectTrigger className="w-32">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {availableYears.map(year => (
                          <SelectItem key={year} value={year.toString()}>{year}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {getScoresForYear(selectedScoreYear).length > 0 ? (
                      <div className="grid gap-4">
                        {getScoresForYear(selectedScoreYear).map((score) => (
                          <div key={score.id} className="flex items-center justify-between p-4 border rounded-lg">
                            <div>
                              <h4 className="font-medium">{score.majorName}</h4>
                              <p className="text-sm text-gray-500">Academic Year {score.year}</p>
                            </div>
                            <div className="text-right">
                              <p className="text-lg font-semibold text-primary">
                                {formatScore(score.minScore, score.maxScore)}
                              </p>
                              <p className="text-sm text-gray-500">Score Range</p>
                            </div>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <div className="text-center py-8">
                        <TrendingUp className="mx-auto h-12 w-12 text-gray-400 mb-4" />
                        <p className="text-gray-500">No admission scores available for {selectedScoreYear}</p>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            {/* Advisory Articles Tab */}
            <TabsContent value="articles" className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center space-x-2">
                    <FileText className="h-5 w-5" />
                    <span>Advisory Articles</span>
                  </CardTitle>
                  <CardDescription>
                    Articles contributed by {university.name} to help students
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  {advisoryArticles.length > 0 ? (
                    <div className="grid gap-4">
                      {advisoryArticles.map((article) => (
                        <Card key={article.id} className="hover:shadow-md transition-shadow cursor-pointer">
                          <CardContent className="p-4">
                            <div className="flex items-start justify-between">
                              <div className="flex-1">
                                <h4 className="font-medium mb-2 hover:text-primary transition-colors">
                                  <Link href={`/student/articles/${article.id}`}>
                                    {article.title}
                                  </Link>
                                </h4>
                                <p className="text-sm text-gray-600 line-clamp-2 mb-3">
                                  {article.content.replace(/<[^>]*>/g, '').slice(0, 150)}...
                                </p>
                                <div className="flex items-center space-x-4 text-sm text-gray-500">
                                  <div className="flex items-center space-x-1">
                                    <Calendar className="h-3 w-3" />
                                    <span>{new Date(article.createdAt).toLocaleDateString()}</span>
                                  </div>
                                  {article.author && (
                                    <div className="flex items-center space-x-1">
                                      <Users className="h-3 w-3" />
                                      <span>{article.author}</span>
                                    </div>
                                  )}
                                </div>
                              </div>
                              <Button variant="ghost" size="sm" asChild>
                                <Link href={`/student/articles/${article.id}`}>
                                  Read More
                                </Link>
                              </Button>
                            </div>
                          </CardContent>
                        </Card>
                      ))}
                    </div>
                  ) : (
                    <div className="text-center py-8">
                      <FileText className="mx-auto h-12 w-12 text-gray-400 mb-4" />
                      <p className="text-gray-500">No advisory articles available</p>
                    </div>
                  )}
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </StudentLayout>
  )
}