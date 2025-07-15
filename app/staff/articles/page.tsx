"use client"

import { useEffect, useState } from "react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { StaffLayout } from "@/components/layouts/staff-layout"
import { ApiService, type CounsellingArticle } from "@/lib/api"
import { Plus, Send, Eye } from "lucide-react"
import { useAuth } from "@/contexts/auth-context"

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

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "Draft":
        return <Badge variant="secondary">Draft</Badge>
      case "Pending":
        return <Badge variant="default">Pending</Badge>
      case "Published":
        return (
          <Badge variant="outline" className="border-green-500 text-green-700">
            Published
          </Badge>
        )
      default:
        return <Badge variant="outline">Unknown</Badge>
    }
  }

  if (loading) {
    return (
      <StaffLayout>
        <div className="flex items-center justify-center min-h-[400px]">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary"></div>
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

        <div className="grid gap-6">
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
              <Card key={article.id}>
                <CardHeader>
                  <div className="flex justify-between items-start">
                    <div>
                      <CardTitle className="line-clamp-2">{article.title}</CardTitle>
                      <CardDescription className="line-clamp-3 mt-2">{article.content}</CardDescription>
                    </div>
                    <div className="flex items-center space-x-2">{getStatusBadge(article.status)}</div>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="flex justify-end space-x-2">
                    <Button variant="outline" size="sm" asChild>
                      <Link href={`/staff/articles/${article.id}`}>
                        <Eye className="mr-2 h-4 w-4" />
                        View
                      </Link>
                    </Button>
                    {article.status === "Draft" && (
                      <Button size="sm" onClick={() => submitArticle(article.id)}>
                        <Send className="mr-2 h-4 w-4" />
                        Submit for Approval
                      </Button>
                    )}
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
