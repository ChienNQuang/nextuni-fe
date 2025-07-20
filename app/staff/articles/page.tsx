"use client"

import { useEffect, useState } from "react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { StaffLayout } from "@/components/layouts/staff-layout"
import { ApiService, type CounsellingArticle, CounsellingArticleStatus } from "@/lib/api"
import { Plus, Send, Eye, Pencil, Clock, CheckCircle, AlertCircle } from "lucide-react"
import { useAuth } from "@/contexts/auth-context"
import { format } from "date-fns"
import { Skeleton } from "@/components/ui/skeleton"

export default function StaffArticlesPage() {
  const [articles, setArticles] = useState<CounsellingArticle[]>([])
  const [loading, setLoading] = useState(true)
  const [statusFilter, setStatusFilter] = useState("Pending")
  const { user } = useAuth()

  useEffect(() => {
    fetchArticles()
  }, [statusFilter])

  const fetchArticles = async () => {
    try {
      const response = await ApiService.getStaffCounsellingArticles(statusFilter, 1, 10)
      setArticles(response.data?.items || [])
    } catch (error) {
      console.error("Failed to fetch articles:", error)
    } finally {
      setLoading(false)
    }
  }

  const submitArticle = async (articleId: string) => {
    try {
      await ApiService.submitArticle(articleId)
      fetchArticles() // Refresh the list
    } catch (error) {
      console.error("Failed to submit article:", error)
    }
  }

  const getStatusBadge = (status: CounsellingArticleStatus) => {
    switch (status) {
      case CounsellingArticleStatus.Draft:
        return <Badge variant="secondary" className="flex items-center gap-1"><Pencil className="h-3 w-3" /> Draft</Badge>
      case CounsellingArticleStatus.Pending:
        return <Badge variant="default" className="flex items-center gap-1"><Clock className="h-3 w-3" /> Pending</Badge>
      case CounsellingArticleStatus.Published:
        return (
          <Badge variant="outline" className="border-green-500 text-green-700 flex items-center gap-1">
            <CheckCircle className="h-3 w-3" /> Published
          </Badge>
        )
      case CounsellingArticleStatus.Rejected:
        return (
          <Badge variant="outline" className="border-red-500 text-red-700 flex items-center gap-1">
            <AlertCircle className="h-3 w-3" /> Rejected
          </Badge>
        )
      default:
        return <Badge variant="outline">Unknown</Badge>
    }
  }

  if (loading && articles.length === 0) {
    return (
      <StaffLayout>
        <div className="space-y-6">
          <div className="flex justify-between items-center">
            <div>
              <Skeleton className="h-9 w-64 mb-2" />
              <Skeleton className="h-4 w-80" />
            </div>
            <Skeleton className="h-10 w-32" />
          </div>
          
          <div className="flex items-center space-x-4">
            <Skeleton className="h-4 w-24" />
            <Skeleton className="h-10 w-48" />
          </div>
          
          <div className="space-y-4">
            {[1, 2, 3].map((i) => (
              <Card key={i}>
                <CardHeader>
                  <div className="flex justify-between items-start">
                    <div className="space-y-2 w-full">
                      <Skeleton className="h-6 w-3/4" />
                      <Skeleton className="h-4 w-full" />
                      <Skeleton className="h-4 w-2/3" />
                    </div>
                    <Skeleton className="h-6 w-20" />
                  </div>
                </CardHeader>
              </Card>
            ))}
          </div>
        </div>
      </StaffLayout>
    )
  }

  return (
    <StaffLayout>
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Counselling Articles</h1>
            <p className="text-gray-600">Manage your university's counselling articles</p>
          </div>
          <Button asChild>
            <Link href="/staff/articles/create">
              <Plus className="mr-2 h-4 w-4" />
              Create Article
            </Link>
          </Button>
        </div>

        {/* Filter */}
        <div className="flex items-center space-x-4">
          <label className="text-sm font-medium">Filter by status:</label>
          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger className="w-48">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="Draft">Draft</SelectItem>
              <SelectItem value="Pending">Pending</SelectItem>
              <SelectItem value="Published">Published</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-4">
          {articles.length === 0 ? (
            <Card>
              <CardContent className="flex items-center justify-center py-12">
                <div className="text-center">
                  <p className="text-gray-500 mb-4">No articles found for the selected status.</p>
                  <Button asChild>
                    <Link href="/staff/articles/create">Create your first article</Link>
                  </Button>
                </div>
              </CardContent>
            </Card>
          ) : (
            articles.map((article) => (
              <Card key={article.id} className="hover:shadow-md transition-shadow">
                <CardHeader className="pb-3">
                  <div className="flex justify-between items-start space-x-4">
                    <div className="flex-1 min-w-0">
                      <CardTitle className="text-lg line-clamp-2">
                        <Link href={`/staff/articles/${article.id}`} className="hover:underline">
                          {article.title}
                        </Link>
                      </CardTitle>
                    </div>
                    <div className="flex-shrink-0">
                      {getStatusBadge(article.status)}
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="prose prose-sm max-w-none text-muted-foreground line-clamp-3 mb-4">
                    {/* Strip HTML tags for the preview */}
                    {article.content.replace(/<[^>]*>?/gm, '')}
                  </div>
                  <div className="flex justify-between items-center pt-2 border-t">
                    <div className="flex space-x-2">
                      <Button variant="outline" size="sm" asChild>
                        <Link href={`/staff/articles/${article.id}`} className="flex items-center">
                          <Eye className="mr-2 h-3.5 w-3.5" />
                          View
                        </Link>
                      </Button>
                      {article.status === CounsellingArticleStatus.Draft && (
                        <Button 
                          size="sm" 
                          onClick={(e) => {
                            e.preventDefault()
                            submitArticle(article.id)
                          }}
                          className="flex items-center"
                        >
                          <Send className="mr-2 h-3.5 w-3.5" />
                          Submit
                        </Button>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))
          )}
        </div>
      </div>
    </StaffLayout>
  )
}
