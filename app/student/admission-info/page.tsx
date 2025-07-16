"use client"

import { useEffect, useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Separator } from "@/components/ui/separator"
import { StudentLayout } from "@/components/layouts/student-layout"
import { ApiService } from "@/lib/api"
import { 
  BookOpen,
  FileText,
  Calendar,
  University,
  ArrowRight,
  Search,
  Filter,
  Newspaper
} from "lucide-react"

// Type definitions based on your interfaces
interface MasterCounsellingArticle {
  id: string
  title: string
  content: string
  createdAt?: string
  updatedAt?: string
}

interface CounsellingArticle {
  id: string
  title: string
  content: string
  status: "Draft" | "Pending" | "Published"
  universityId?: string
  universityName?: string
  createdAt?: string
  updatedAt?: string
}

export default function AdmissionInformationPage() {
  // General Information tab state
  const [generalArticles, setGeneralArticles] = useState<MasterCounsellingArticle[]>([])
  const [selectedGeneralArticle, setSelectedGeneralArticle] = useState<MasterCounsellingArticle | null>(null)
  const [generalLoading, setGeneralLoading] = useState(true)
  const [generalCurrentPage, setGeneralCurrentPage] = useState(1)
  const [generalTotalPages, setGeneralTotalPages] = useState(1)

  // University Articles tab state
  const [universityArticles, setUniversityArticles] = useState<CounsellingArticle[]>([])
  const [selectedUniversityArticle, setSelectedUniversityArticle] = useState<CounsellingArticle | null>(null)
  const [universityLoading, setUniversityLoading] = useState(true)
  const [universityCurrentPage, setUniversityCurrentPage] = useState(1)
  const [universityTotalPages, setUniversityTotalPages] = useState(1)

  // UI state
  const [activeTab, setActiveTab] = useState("general")

  const itemsPerPage = 10

  useEffect(() => {
    fetchGeneralArticles()
  }, [generalCurrentPage])

  useEffect(() => {
    fetchUniversityArticles()
  }, [universityCurrentPage])

  const fetchGeneralArticles = async () => {
    try {
      setGeneralLoading(true)
      const response = await ApiService.getMasterCounsellingArticles(generalCurrentPage, itemsPerPage)
      setGeneralArticles(response.data?.items || [])
      
      const totalItems = response.data?.totalCount || 0
      setGeneralTotalPages(Math.ceil(totalItems / itemsPerPage))
    } catch (error) {
      console.error("Failed to fetch general articles:", error)
    } finally {
      setGeneralLoading(false)
    }
  }

  const fetchUniversityArticles = async () => {
    try {
      setUniversityLoading(true)
      // Fetch only published university counselling articles
      const response = await ApiService.getCounsellingArticles("Published", universityCurrentPage, itemsPerPage)
      setUniversityArticles(response.data?.items || [])
      
      const totalItems = response.data?.totalCount || 0
      setUniversityTotalPages(Math.ceil(totalItems / itemsPerPage))
    } catch (error) {
      console.error("Failed to fetch university articles:", error)
    } finally {
      setUniversityLoading(false)
    }
  }

  const formatDate = (dateString?: string) => {
    if (!dateString) return "Unknown date"
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    })
  }

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "Published":
        return <Badge variant="default">Published</Badge>
      case "Pending":
        return <Badge variant="outline" className="border-yellow-500 text-yellow-700">Pending</Badge>
      case "Draft":
        return <Badge variant="secondary">Draft</Badge>
      default:
        return <Badge variant="outline">Unknown</Badge>
    }
  }

  const renderArticlesList = (
    articles: any[],
    selectedArticle: any,
    onSelect: (article: any) => void,
    loading: boolean,
    isUniversity = false
  ) => {
    if (loading) {
      return (
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
        </div>
      )
    }

    if (articles.length === 0) {
      return (
        <div className="text-center py-12">
          <FileText className="mx-auto h-12 w-12 text-gray-400" />
          <h3 className="mt-2 text-sm font-medium text-gray-900">No articles found</h3>
          <p className="mt-1 text-sm text-gray-500">
            No {isUniversity ? 'university' : 'general'} articles are available at this time.
          </p>
        </div>
      )
    }

    return (
      <div className="space-y-3 max-h-96 overflow-y-auto">
        {articles.map((article) => (
          <Card
            key={article.id}
            className={`cursor-pointer transition-all duration-200 hover:shadow-md ${
              selectedArticle?.id === article.id
                ? 'ring-2 ring-primary bg-primary/5'
                : 'hover:bg-gray-50'
            }`}
            onClick={() => onSelect(article)}
          >
            <CardContent className="p-4">
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <h4 className="font-medium text-gray-900 line-clamp-2 mb-1">
                    {article.title}
                  </h4>
                  <div className="flex items-center space-x-4 text-sm text-gray-500">
                    <div className="flex items-center space-x-1">
                      <Calendar className="h-3 w-3" />
                      <span>{formatDate(article.createdAt || article.updatedAt)}</span>
                    </div>
                    {isUniversity && article.universityName && (
                      <div className="flex items-center space-x-1">
                        <University className="h-3 w-3" />
                        <span>{article.universityName}</span>
                      </div>
                    )}
                    {isUniversity && article.status && (
                      <div className="flex items-center">
                        {getStatusBadge(article.status)}
                      </div>
                    )}
                  </div>
                </div>
                <ArrowRight className="h-4 w-4 text-gray-400 ml-2 flex-shrink-0" />
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    )
  }

  const renderSelectedArticle = (article: any, isUniversity = false) => {
    if (!article) {
      return (
        <div className="flex items-center justify-center h-64 text-gray-500">
          <div className="text-center">
            <FileText className="mx-auto h-12 w-12 text-gray-400 mb-4" />
            <p>Select an article to view its content</p>
          </div>
        </div>
      )
    }

    return (
      <div className="space-y-6">
        <div>
          <h2 className="text-2xl font-bold text-gray-900 mb-4">{article.title}</h2>
          <div className="flex items-center space-x-4 text-sm text-gray-500 mb-6">
            <div className="flex items-center space-x-1">
              <Calendar className="h-4 w-4" />
              <span>{formatDate(article.createdAt || article.updatedAt)}</span>
            </div>
            {isUniversity && article.universityName && (
              <div className="flex items-center space-x-1">
                <University className="h-4 w-4" />
                <span>{article.universityName}</span>
              </div>
            )}
            {isUniversity && article.status && getStatusBadge(article.status)}
          </div>
        </div>
        
        <Separator />
        
        <div className="prose prose-lg max-w-none prose-headings:text-gray-900 prose-p:text-gray-700 prose-a:text-blue-600 prose-strong:text-gray-900">
          <div dangerouslySetInnerHTML={{ __html: article.content }} />
        </div>
      </div>
    )
  }

  const renderPagination = (currentPage: number, totalPages: number, onPageChange: (page: number) => void) => {
    if (totalPages <= 1) return null

    return (
      <div className="flex justify-center space-x-2 mt-6">
        <Button
          variant="outline"
          onClick={() => onPageChange(Math.max(currentPage - 1, 1))}
          disabled={currentPage === 1}
          size="sm"
        >
          Previous
        </Button>
        <span className="flex items-center px-4 text-sm text-gray-600">
          Page {currentPage} of {totalPages}
        </span>
        <Button
          variant="outline"
          onClick={() => onPageChange(Math.min(currentPage + 1, totalPages))}
          disabled={currentPage === totalPages}
          size="sm"
        >
          Next
        </Button>
      </div>
    )
  }

  return (
    <StudentLayout>
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="space-y-8">
            {/* Header */}
            <div className="text-center">
              <h1 className="text-4xl font-bold bg-gradient-to-r from-gray-900 to-gray-700 bg-clip-text text-transparent mb-4">
                Admission Information
              </h1>
              <p className="text-lg text-gray-600 max-w-2xl mx-auto">
                Comprehensive guides and articles to help you navigate the university admission process
              </p>
            </div>

            {/* Tabs */}
            <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-8">
              <div className="flex justify-center">
                <TabsList className="grid w-full max-w-md grid-cols-2 bg-white/80 backdrop-blur-sm">
                  <TabsTrigger value="general" className="flex items-center space-x-2">
                    <BookOpen className="h-4 w-4" />
                    <span>General Information</span>
                  </TabsTrigger>
                  <TabsTrigger value="university" className="flex items-center space-x-2">
                    <University className="h-4 w-4" />
                    <span>University Articles</span>
                  </TabsTrigger>
                </TabsList>
              </div>

              {/* General Information Tab */}
              <TabsContent value="general" className="space-y-6">
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                  {/* Articles List */}
                  <Card className="bg-white/80 backdrop-blur-sm border-0 shadow-xl">
                    <CardHeader className="border-b border-gray-100">
                      <CardTitle className="flex items-center space-x-2">
                        <div className="p-2 bg-gradient-to-r from-blue-500 to-indigo-600 rounded-lg">
                          <Newspaper className="h-5 w-5 text-white" />
                        </div>
                        <span>General Admission Articles</span>
                      </CardTitle>
                      <CardDescription>
                        System-wide guides and information about university admissions
                      </CardDescription>
                    </CardHeader>
                    <CardContent className="p-6">
                      {renderArticlesList(
                        generalArticles,
                        selectedGeneralArticle,
                        setSelectedGeneralArticle,
                        generalLoading
                      )}
                      {renderPagination(
                        generalCurrentPage,
                        generalTotalPages,
                        setGeneralCurrentPage
                      )}
                    </CardContent>
                  </Card>

                  {/* Selected Article Content */}
                  <Card className="bg-white/80 backdrop-blur-sm border-0 shadow-xl">
                    <CardHeader className="border-b border-gray-100">
                      <CardTitle className="flex items-center space-x-2">
                        <div className="p-2 bg-gradient-to-r from-emerald-500 to-teal-600 rounded-lg">
                          <FileText className="h-5 w-5 text-white" />
                        </div>
                        <span>Article Content</span>
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="p-6 max-h-96 overflow-y-auto">
                      {renderSelectedArticle(selectedGeneralArticle)}
                    </CardContent>
                  </Card>
                </div>
              </TabsContent>

              {/* University Articles Tab */}
              <TabsContent value="university" className="space-y-6">
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                  {/* Articles List */}
                  <Card className="bg-white/80 backdrop-blur-sm border-0 shadow-xl">
                    <CardHeader className="border-b border-gray-100">
                      <CardTitle className="flex items-center space-x-2">
                        <div className="p-2 bg-gradient-to-r from-purple-500 to-pink-600 rounded-lg">
                          <University className="h-5 w-5 text-white" />
                        </div>
                        <span>University Published Articles</span>
                      </CardTitle>
                      <CardDescription>
                        Articles and guides published by individual universities
                      </CardDescription>
                    </CardHeader>
                    <CardContent className="p-6">
                      {renderArticlesList(
                        universityArticles,
                        selectedUniversityArticle,
                        setSelectedUniversityArticle,
                        universityLoading,
                        true
                      )}
                      {renderPagination(
                        universityCurrentPage,
                        universityTotalPages,
                        setUniversityCurrentPage
                      )}
                    </CardContent>
                  </Card>

                  {/* Selected Article Content */}
                  <Card className="bg-white/80 backdrop-blur-sm border-0 shadow-xl">
                    <CardHeader className="border-b border-gray-100">
                      <CardTitle className="flex items-center space-x-2">
                        <div className="p-2 bg-gradient-to-r from-orange-500 to-red-500 rounded-lg">
                          <FileText className="h-5 w-5 text-white" />
                        </div>
                        <span>Article Content</span>
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="p-6 max-h-96 overflow-y-auto">
                      {renderSelectedArticle(selectedUniversityArticle, true)}
                    </CardContent>
                  </Card>
                </div>
              </TabsContent>
            </Tabs>
          </div>
        </div>
      </div>
    </StudentLayout>
  )
}