"use client"

import { useEffect, useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { AdminLayout } from "@/components/layouts/admin-layout"
import { ApiService, CounsellingArticleStatus } from "@/lib/api"
import { Search, Eye, Check, X } from "lucide-react"
import { toast } from "sonner"

export default function UniversityArticlesPage() {
  const [articles, setArticles] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState("")
  const [statusFilter, setStatusFilter] = useState(CounsellingArticleStatus.Pending)
  const [isViewDialogOpen, setIsViewDialogOpen] = useState(false)
  const [selectedArticle, setSelectedArticle] = useState<any>(null)
  const [currentPage, setCurrentPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)

  useEffect(() => {
    fetchArticles()
  }, [currentPage, statusFilter])

  const fetchArticles = async () => {
    try {
      setLoading(true)
      const response = await ApiService.getAdminCounsellingArticles(CounsellingArticleStatus[statusFilter], currentPage, 10)
      setArticles(response.data?.items || [])
      setTotalPages(response.data?.totalPages || 1)
    } catch (error) {
      console.error("Failed to fetch articles:", error)
      toast.error("Failed to fetch articles")
    } finally {
      setLoading(false)
    }
  }

  const handleApproveArticle = async (articleId: string) => {
    try {
      await ApiService.approveArticle(articleId)
      toast.success("Article approved successfully")
      fetchArticles()
    } catch (error) {
      console.error("Failed to approve article:", error)
      toast.error("Failed to approve article")
    }
  }

  const handleRejectArticle = async (articleId: string) => {
    try {
      await ApiService.rejectArticle(articleId)
      toast.success("Article rejected successfully")
      fetchArticles()
    } catch (error) {
      console.error("Failed to reject article:", error)
      toast.error("Failed to reject article")
    }
  }

  const handleViewArticle = (article: any) => {
    setSelectedArticle(article)
    setIsViewDialogOpen(true)
  }

  const getStatusBadge = (status: number) => {
    switch (status) {
      case 0:
        return <Badge variant="secondary">Draft</Badge>
      case 1:
        return <Badge variant="outline">Pending</Badge>
      case 2:
        return <Badge variant="default">Published</Badge>
      default:
        return <Badge variant="outline">Unknown</Badge>
    }
  }

  const filteredArticles = articles.filter((article) => article.title.toLowerCase().includes(searchTerm.toLowerCase()))

  return (
    <AdminLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">University Counselling Articles</h1>
            <p className="text-gray-600">Review and approve articles submitted by universities</p>
          </div>
        </div>

        {/* Filters */}
        <Card>
          <CardHeader>
            <CardTitle>Filters</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex flex-col sm:flex-row gap-4">
              <div className="flex-1">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                  <Input
                    placeholder="Search articles..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10"
                  />
                </div>
              </div>
              <Select value={CounsellingArticleStatus[statusFilter]} onValueChange={(value) => setStatusFilter(Number(value))}>
                <SelectTrigger className="w-48">
                  <SelectValue placeholder="Filter by status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Pending">Pending</SelectItem>
                  <SelectItem value="Published">Published</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </CardContent>
        </Card>

        {/* Articles List */}
        <Card>
          <CardHeader>
            <CardTitle>Articles ({filteredArticles.length})</CardTitle>
            <CardDescription>{loading ? "Loading..." : `Showing ${filteredArticles.length} articles`}</CardDescription>
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="flex items-center justify-center py-12">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
              </div>
            ) : (
              <div className="space-y-4">
                {filteredArticles.map((article) => (
                  <div
                    key={article.id}
                    className="flex items-center justify-between p-4 border rounded-lg hover:bg-gray-50"
                  >
                    <div className="flex-1">
                      <div className="flex items-center space-x-4">
                        <div>
                          <h3 className="font-medium text-gray-900">{article.title}</h3>
                          <p className="text-sm text-gray-600 mt-1 line-clamp-2" dangerouslySetInnerHTML={{__html: article.content}}></p>
                          <div className="flex items-center space-x-4 mt-2">{getStatusBadge(article.status)}</div>
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Button variant="outline" size="sm" onClick={() => handleViewArticle(article)}>
                        <Eye className="mr-2 h-4 w-4" />
                        View
                      </Button>
                      {statusFilter === CounsellingArticleStatus.Pending && (
                        <>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleApproveArticle(article.id)}
                            className="text-green-600 hover:text-green-700"
                          >
                            <Check className="mr-2 h-4 w-4" />
                            Approve
                          </Button>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleRejectArticle(article.id)}
                            className="text-red-600 hover:text-red-700"
                          >
                            <X className="mr-2 h-4 w-4" />
                            Reject
                          </Button>
                        </>
                      )}
                    </div>
                  </div>
                ))}

                {filteredArticles.length === 0 && !loading && (
                  <div className="text-center py-12">
                    <p className="text-gray-500">No articles found</p>
                  </div>
                )}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="flex justify-center space-x-2">
            <Button
              variant="outline"
              onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
              disabled={currentPage === 1}
            >
              Previous
            </Button>
            <span className="flex items-center px-4">
              Page {currentPage} of {totalPages}
            </span>
            <Button
              variant="outline"
              onClick={() => setCurrentPage(Math.min(totalPages, currentPage + 1))}
              disabled={currentPage === totalPages}
            >
              Next
            </Button>
          </div>
        )}

        {/* View Article Dialog */}
        <Dialog open={isViewDialogOpen} onOpenChange={setIsViewDialogOpen}>
          <DialogContent className="max-w-4xl">
            <DialogHeader>
              <DialogTitle>{selectedArticle?.title}</DialogTitle>
              <DialogDescription>Status: {selectedArticle && getStatusBadge(selectedArticle.status)}</DialogDescription>
            </DialogHeader>
            <div className="max-h-96 overflow-y-auto">
              <div className="whitespace-pre-wrap text-sm" dangerouslySetInnerHTML={{__html: selectedArticle?.content}}></div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setIsViewDialogOpen(false)}>
                Close
              </Button>
              {selectedArticle?.status === 1 && (
                <>
                  <Button
                    onClick={() => {
                      handleApproveArticle(selectedArticle.id)
                      setIsViewDialogOpen(false)
                    }}
                    className="bg-green-600 hover:bg-green-700"
                  >
                    <Check className="mr-2 h-4 w-4" />
                    Approve
                  </Button>
                  <Button
                    variant="destructive"
                    onClick={() => {
                      handleRejectArticle(selectedArticle.id)
                      setIsViewDialogOpen(false)
                    }}
                  >
                    <X className="mr-2 h-4 w-4" />
                    Reject
                  </Button>
                </>
              )}
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </AdminLayout>
  )
}
