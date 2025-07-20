"use client"

import { Button } from "@/components/ui/button"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { ArticleEditor } from "@/components/editor/article-editor"
import { useState } from "react"
import { toast } from "sonner"

export function ArticleDialog({
  open,
  onOpenChange,
  article,
  onSave,
  loading = false,
}: {
  open: boolean
  onOpenChange: (open: boolean) => void
  article?: {
    id?: string
    title: string
    content: string
    status: string
  }
  onSave: (data: { title: string; content: string }) => Promise<void>
  loading?: boolean
}) {
  const [title, setTitle] = useState(article?.title || "")
  const [content, setContent] = useState(article?.content || "")

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
      await onSave({ title, content })
      onOpenChange(false)
    } catch (error) {
      console.error("Error saving article:", error)
      toast.error("Failed to save article")
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl h-[90vh] flex flex-col">
        <DialogHeader>
          <DialogTitle>{article?.id ? "Edit Article" : "Create New Article"}</DialogTitle>
        </DialogHeader>
        
        <form onSubmit={handleSubmit} className="flex-1 flex flex-col overflow-hidden">
          <div className="space-y-4 mb-6">
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
            
            <div className="space-y-2 flex-1 flex flex-col">
              <Label>Content</Label>
              <div className="flex-1 min-h-0">
                <ArticleEditor
                  content={content}
                  onChange={setContent}
                />
              </div>
            </div>
          </div>
          
          <div className="flex justify-end space-x-2 pt-4 border-t">
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              disabled={loading}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={loading}>
              {loading ? "Saving..." : "Save Article"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
}
