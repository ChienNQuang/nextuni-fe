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
import { useCounsellingArticleStore } from "@/stores/use-counselling-article-store"
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { TipTapEditor } from "@/components/editor/tiptap-editor"
import { toast } from "sonner"

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
      default:
        return <Badge variant="outline">Unknown</Badge>
    }
  }

  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false)
  const [isViewDialogOpen, setIsViewDialogOpen] = useState(false)
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false)
  const [editingArticle, setEditingArticle] = useState<{
    id: string
    title: string
    content: string
  } | null>(null)
  const [selectedArticle, setSelectedArticle] = useState<{
    id: string
    title: string
    content: string
    status: number
    publishedAt: string
  } | null>(null)
  const [newArticle, setNewArticle] = useState({ title: '', content: '' })
  const [creating, setCreating] = useState(false)
  const [editing, setEditing] = useState(false)

  const handleCreateArticle = async () => {
    if (!newArticle.title.trim() || !newArticle.content.trim()) {
      toast.error('Please fill in all fields')
      return
    }

    try {
      setCreating(true)
      await ApiService.createCounsellingArticle({
        title: newArticle.title,
        content: newArticle.content,
        status: CounsellingArticleStatus.Draft,
        universityId: user?.universityId || '',
      })
      toast.success('Article created successfully')
      setNewArticle({ title: '', content: '' })
      setIsCreateDialogOpen(false)
      fetchArticles()
    } catch (error) {
      console.error('Failed to create article:', error)
      toast.error('Failed to create article')
    } finally {
      setCreating(false)
    }
  }

  const handleViewArticle = (article: any) => {
    setSelectedArticle(article)
    setIsViewDialogOpen(true)
  }

  const handleEditArticle = (article: any) => {
    setEditingArticle({
      id: article.id,
      title: article.title,
      content: article.content,
    })
    setIsEditDialogOpen(true)
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
          <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
            <DialogTrigger asChild>
              <Button>
                <Plus className="mr-2 h-4 w-4" />
                Create Article
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-2xl">
              <DialogHeader>
                <DialogTitle>Create New Master Article</DialogTitle>
                <DialogDescription>
                  Create a new counselling article that will be managed by the system.
                </DialogDescription>
              </DialogHeader>
              <div className="space-y-4">
                <div>
                  <label className="text-sm font-medium">Title</label>
                  <Input
                    placeholder="Enter article title"
                    value={newArticle.title}
                    onChange={(e) => setNewArticle({ ...newArticle, title: e.target.value })}
                  />
                </div>
                <div>
                  <label className="text-sm font-medium">Content</label>
                  <TipTapEditor
                    content={newArticle.content}
                    onChange={(content) => setNewArticle({ ...newArticle, content })}
                    placeholder="Write your article content here..."
                  />
                </div>
              </div>
              <DialogFooter>
                <Button variant="outline" onClick={() => setIsCreateDialogOpen(false)}>
                  Cancel
                </Button>
                <Button onClick={handleCreateArticle} disabled={creating}>
                  {creating ? "Creating..." : "Create Article"}
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
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
                  <Button onClick={() => setIsCreateDialogOpen(true)}>
                  Create your first article
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
                      <Button variant="outline" onClick={() => handleViewArticle(article)} size="sm">
                        <Eye className="mr-2 h-3.5 w-3.5" />
                        View
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

        {/* View Article Dialog */}
        <Dialog open={isViewDialogOpen} onOpenChange={setIsViewDialogOpen}>
          <DialogContent className="max-w-4xl">
            <DialogHeader>
              <DialogTitle>{selectedArticle?.title}</DialogTitle>
              <DialogDescription>
                Published on{" "}
                {selectedArticle?.publishedAt ? new Date(selectedArticle.publishedAt).toLocaleDateString() : "N/A"}
              </DialogDescription>
            </DialogHeader>
            <div className="border rounded-lg overflow-hidden">
              <div 
                className="prose dark:prose-invert max-w-none p-4" 
                dangerouslySetInnerHTML={{ __html: selectedArticle?.content || '' }}
              />
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setIsViewDialogOpen(false)}>
                Close
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* Edit Article Dialog */}
        <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
          <DialogContent className="max-w-4xl">
            <DialogHeader>
              <DialogTitle>Edit Article</DialogTitle>
              <DialogDescription>Update the article content below.</DialogDescription>
            </DialogHeader>
            <div className="space-y-4">
              <div>
                <label className="text-sm font-medium">Title</label>
                <Input
                  placeholder="Enter article title"
                  value={editingArticle?.title || ''}
                  onChange={(e) => editingArticle && setEditingArticle({ ...editingArticle, title: e.target.value })}
                />
              </div>
              <div>
                <label className="text-sm font-medium">Content</label>
                <TipTapEditor
                  content={editingArticle?.content || ''}
                  onChange={(content) => editingArticle && setEditingArticle({ ...editingArticle, content })}
                  placeholder="Write your article content here..."
                />
              </div>
            </div>
            <DialogFooter>
              <Button 
                variant="outline" 
                onClick={() => {
                  setIsEditDialogOpen(false)
                  setEditingArticle(null)
                }}
              >
                Cancel
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
        </div>
      </div>
    </StaffLayout>
  )
}
