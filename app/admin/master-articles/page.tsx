"use client"

'use client'

import { useEffect, useState } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog'
import { AdminLayout } from '@/components/layouts/admin-layout'
import { ApiService, CounsellingArticleStatus } from '@/lib/api'
import { Plus, Search, Edit, Eye, Power } from 'lucide-react'
import { toast } from 'sonner'
import { TipTapEditor } from '@/components/editor/tiptap-editor'

export default function MasterArticlesPage() {
  const [articles, setArticles] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState("")
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

  useEffect(() => {
    fetchArticles()
  }, [])

  const fetchArticles = async () => {
    try {
      setLoading(true)
      const response = await ApiService.getMasterCounsellingArticles(1, 100)
      setArticles(response.data?.items || [])
    } catch (error) {
      console.error("Failed to fetch articles:", error)
      toast.error("Failed to fetch articles")
    } finally {
      setLoading(false)
    }
  }

  const handleCreateArticle = async () => {
    if (!newArticle.title.trim() || !newArticle.content.trim()) {
      toast.error('Please fill in all fields')
      return
    }

    try {
      setCreating(true)
      await ApiService.createMasterCounsellingArticle({
        title: newArticle.title,
        content: newArticle.content,
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

  const handleUpdateArticle = async () => {
    if (!editingArticle?.title.trim() || !editingArticle?.content.trim()) {
      toast.error('Please fill in all fields')
      return
    }

    try {
      setEditing(true)
      await ApiService.updateCounsellingArticle(editingArticle.id, {
        title: editingArticle.title,
        content: editingArticle.content,
      })
      toast.success('Article updated successfully')
      setIsEditDialogOpen(false)
      setEditingArticle(null)
      fetchArticles()
    } catch (error) {
      console.error('Failed to update article:', error)
      toast.error('Failed to update article')
    } finally {
      setEditing(false)
    }
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
            <h1 className="text-3xl font-bold text-gray-900">Master Counselling Articles</h1>
            <p className="text-gray-600">Create and manage rich text articles with advanced formatting</p>
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

        {/* Search */}
        <Card>
          <CardHeader>
            <CardTitle>Search</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
              <Input
                placeholder="Search articles..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
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
                          <div 
                            className="text-sm text-gray-600 mt-1 line-clamp-2 prose prose-sm max-w-none" 
                            dangerouslySetInnerHTML={{ 
                              __html: article.content.replace(/<[^>]*>?/gm, '').substring(0, 200) + '...' 
                            }} 
                          />
                          <div className="flex items-center space-x-4 mt-2">
                            {getStatusBadge(article.status)}
                            <span className="text-xs text-gray-500">
                              {new Date(article.publishedAt).toLocaleDateString()}
                            </span>
                          </div>
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Button variant="outline" size="sm" onClick={() => handleViewArticle(article)}>
                        <Eye className="h-4 w-4" />
                      </Button>
                      <Button 
                        variant="outline" 
                        size="sm"
                        onClick={() => handleEditArticle(article)}
                      >
                        <Edit className="h-4 w-4" />
                      </Button>
                      {/* <Button variant="outline" size="sm">
                        <Power className="mr-2 h-4 w-4" />
                        {article.status === 2 ? "Deactivate" : "Activate"}
                      </Button> */}
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
              <Button 
                onClick={handleUpdateArticle} 
                disabled={editing}
              >
                {editing ? 'Updating...' : 'Update Article'}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </AdminLayout>
  )
}
