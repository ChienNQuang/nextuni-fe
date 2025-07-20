"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { StaffLayout } from "@/components/layouts/staff-layout"
import { ApiService, CounsellingArticleStatus } from "@/lib/api"
import { toast } from "sonner"
import { ArticleEditor } from "@/components/editor/article-editor"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { ArrowLeft } from "lucide-react"
import { useAuth } from "@/contexts/auth-context"

export default function CreateArticlePage() {
  const router = useRouter()
  const [title, setTitle] = useState("")
  const [content, setContent] = useState("")
  const [loading, setLoading] = useState(false)
  const { user } = useAuth()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!title.trim()) {
      toast.error("Title is required")
      return
    }
    
    if (!content.trim()) {
      toast.error("Content is required")
      return
    }

    try {
      setLoading(true)
      await ApiService.createCounsellingArticle({
        title,
        content,
        status: CounsellingArticleStatus.Draft,
        universityId: user?.universityId || ""
      })
      
      toast.success("Article created successfully")
      router.push("/staff/articles")
    } catch (error) {
      console.error("Error creating article:", error)
      toast.error("Failed to create article")
    } finally {
      setLoading(false)
    }
  }

  return (
    <StaffLayout>
      <div className="space-y-6">
        <div className="flex items-center">
          <Button variant="ghost" onClick={() => router.back()}>
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Articles
          </Button>
        </div>
        
        <h1 className="text-3xl font-bold">Create New Article</h1>
        
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="space-y-2">
            <Label htmlFor="title">Title</Label>
            <Input
              id="title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Enter article title"
              disabled={loading}
            />
          </div>
          
          <div className="space-y-2">
            <Label>Content</Label>
            <div className="border rounded-lg overflow-hidden">
              <ArticleEditor
                content={content}
                onChange={setContent}
              />
            </div>
          </div>
          
          <div className="flex justify-end space-x-2 pt-4">
            <Button
              type="button"
              variant="outline"
              onClick={() => router.push("/staff/articles")}
              disabled={loading}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={loading}>
              {loading ? "Saving..." : "Save as Draft"}
            </Button>
            <Button
              type="button"
              variant="default"
              disabled={loading || !title.trim() || !content.trim()}
              onClick={async () => {
                if (!title.trim() || !content.trim()) return
                try {
                  setLoading(true)
                  await ApiService.createCounsellingArticle({
                    title,
                    content,
                    status: CounsellingArticleStatus.Draft,
                    universityId: user?.universityId || ""
                  })
                  toast.success("Article submitted for approval")
                  router.push("/staff/articles")
                } catch (error) {
                  console.error("Error submitting article:", error)
                  toast.error("Failed to submit article")
                } finally {
                  setLoading(false)
                }
              }}
            >
              {loading ? "Submitting..." : "Submit for Approval"}
            </Button>
          </div>
        </form>
      </div>
    </StaffLayout>
  )
}
