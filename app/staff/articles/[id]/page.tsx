"use client"

import { useParams, useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { StaffLayout } from "@/components/layouts/staff-layout"
import { ApiService, type CounsellingArticle } from "@/lib/api"
import { useAuth } from "@/contexts/auth-context"
import { useEffect, useState } from "react"
import { toast } from "sonner"
import { format } from "date-fns"
import { ArticleEditor } from "@/components/editor/article-editor"
import { Pencil, ArrowLeft, Send, Loader2 } from "lucide-react"

export default function ArticleDetailPage() {
  const { id } = useParams()
  const router = useRouter()
  const { user } = useAuth()
  const [article, setArticle] = useState<CounsellingArticle | null>(null)
  const [loading, setLoading] = useState(true)
  const [editing, setEditing] = useState(false)
  const [saving, setSaving] = useState(false)
  const [title, setTitle] = useState("")
  const [content, setContent] = useState("")

  useEffect(() => {
    if (id) {
      fetchArticle()
    }
  }, [id])

  const fetchArticle = async () => {
    try {
      setLoading(true)
      const response = await ApiService.getCounsellingArticle(id as string)
      if (response.data) {
        setArticle(response.data)
        setTitle(response.data.title)
        setContent(response.data.content)
      }
    } catch (error) {
      console.error("Failed to fetch article:", error)
      toast.error("Failed to load article")
    } finally {
      setLoading(false)
    }
  }

  const handleSave = async () => {
    if (!title.trim() || !content.trim()) {
      toast.error("Title and content are required")
      return
    }

    try {
      setSaving(true)
      await ApiService.updateCounsellingArticle(article?.id || "", { title, content })
      await fetchArticle() // Refresh the article data
      setEditing(false)
      toast.success("Article updated successfully")
    } catch (error) {
      console.error("Error updating article:", error)
      toast.error("Failed to update article")
    } finally {
      setSaving(false)
    }
  }

  const handleSubmitForApproval = async () => {
    if (!article) return
    
    try {
      setSaving(true)
      await ApiService.submitArticle(article.id)
      await fetchArticle() // Refresh the article data
      toast.success("Article submitted for approval")
    } catch (error) {
      console.error("Error submitting article:", error)
      toast.error("Failed to submit article for approval")
    } finally {
      setSaving(false)
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

  if (!article) {
    return (
      <StaffLayout>
        <div className="flex flex-col items-center justify-center min-h-[400px] space-y-4">
          <p className="text-gray-500">Article not found</p>
          <Button onClick={() => router.push("/staff/articles")}>
            Back to Articles
          </Button>
        </div>
      </StaffLayout>
    )
  }

  return (
    <StaffLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <Button variant="ghost" onClick={() => router.back()}>
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Articles
          </Button>
          
          {article.status === "Draft" && !editing && (
            <div className="space-x-2">
              <Button variant="outline" onClick={() => setEditing(true)} disabled={saving}>
                <Pencil className="mr-2 h-4 w-4" />
                Edit
              </Button>
              <Button onClick={handleSubmitForApproval} disabled={saving}>
                {saving ? (
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                ) : (
                  <Send className="mr-2 h-4 w-4" />
                )}
                Submit for Approval
              </Button>
            </div>
          )}
          
          {editing && (
            <div className="space-x-2">
              <Button variant="outline" onClick={() => setEditing(false)} disabled={saving}>
                Cancel
              </Button>
              <Button onClick={handleSave} disabled={saving}>
                {saving ? (
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                ) : null}
                Save Changes
              </Button>
            </div>
          )}
        </div>

        <Card>
          <CardHeader>
            <div className="flex justify-between items-start">
              <div>
                {editing ? (
                  <input
                    type="text"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    className="text-2xl font-bold w-full p-2 border rounded"
                    disabled={saving}
                  />
                ) : (
                  <CardTitle className="text-2xl">{article.title}</CardTitle>
                )}
                <div className="mt-2 flex items-center space-x-4 text-sm text-muted-foreground">
                  <span>
                    Created: {format(new Date(article.createdAt), "MMM d, yyyy")}
                  </span>
                  <span>•</span>
                  <span>Status: {getStatusBadge(article.status)}</span>
                </div>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            {editing ? (
              <div className="mt-4">
                <ArticleEditor
                  content={content}
                  onChange={setContent}
                />
              </div>
            ) : (
              <div 
                className="prose max-w-none"
                dangerouslySetInnerHTML={{ __html: article.content }}
              />
            )}
          </CardContent>
        </Card>
      </div>
    </StaffLayout>
  )
}

function getStatusBadge(status: string) {
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
