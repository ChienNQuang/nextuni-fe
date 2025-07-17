'use client'

import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog'
import { TipTapEditor } from '@/components/editor/tiptap-editor'
import { Input } from '@/components/ui/input'
import { toast } from 'sonner'
import { Loader2 } from 'lucide-react'

interface SaveBlogData {
  title: string;
  content: string;
  majorId?: string;
}

interface IntroductionBlogProps {
  id: string
  type: 'university' | 'major'
  title?: string
  content?: string
  majorId?: string
  onSave: (data: SaveBlogData) => Promise<{ isSuccess: boolean }>
  onFetch: (id: string) => Promise<{ isSuccess: boolean; data: { title: string; content: string } | null }>
}

export function IntroductionBlog({ id, type, title: initialTitle, content: initialContent, onSave, onFetch }: IntroductionBlogProps) {
  const [isEditing, setIsEditing] = useState(false)
  const [title, setTitle] = useState(initialTitle || '')
  const [content, setContent] = useState(initialContent || '')
  const [loading, setLoading] = useState(false)
  const [hasBlog, setHasBlog] = useState(!!initialTitle || !!initialContent)
  const [isLoading, setIsLoading] = useState(!initialTitle && !initialContent)

  useEffect(() => {
    const fetchBlog = async () => {
      if (!initialTitle && !initialContent) {
        try {
          const response = await onFetch(id)
          if (response?.isSuccess && response.data) {
            setTitle(response.data.title || '')
            setContent(response.data.content || '')
            setHasBlog(!!response.data.title || !!response.data.content)
          } else {
            setHasBlog(false)
          }
        } catch (error) {
          console.error('Failed to fetch blog:', error)
          setHasBlog(false)
        } finally {
          setIsLoading(false)
        }
      } else {
        setIsLoading(false)
      }
    }

    fetchBlog()
  }, [id, initialTitle, initialContent, onFetch])

  const handleSave = async () => {
    if (!title.trim() || !content.trim()) {
      toast.error('Please fill in all fields')
      return
    }

    try {
      setLoading(true)
      // Prepare the data object with title and content
      const data: SaveBlogData = { 
        title, 
        content,
        // Add majorId for major introductions
        ...(type === 'major' && { majorId: id })
      };
      
      // Call the onSave callback with the data
      const result = await onSave(data);
      
      if (result.isSuccess) {
        setHasBlog(true)
        setIsEditing(false)
        toast.success('Blog saved successfully')
      } else {
        throw new Error('Failed to save blog')
      }
    } catch (error) {
      console.error('Failed to save blog:', error)
      toast.error('Failed to save blog')
    } finally {
      setLoading(false)
    }
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center p-8">
        <Loader2 className="h-6 w-6 animate-spin" />
      </div>
    )
  }

  if (!hasBlog) {
    return (
      <div className="border rounded-lg p-6 text-center">
        <p className="text-gray-600 mb-4">No introduction blog found for this {type}.</p>
        <Button onClick={() => setIsEditing(true)}>
          Add Introduction Blog
        </Button>
      </div>
    )
  }

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold">{title}</h2>
        <Button variant="outline" size="sm" onClick={() => setIsEditing(true)}>
          Edit
        </Button>
      </div>
      <div 
        className="prose dark:prose-invert max-w-none" 
        dangerouslySetInnerHTML={{ __html: content }} 
      />

      <Dialog open={isEditing} onOpenChange={setIsEditing}>
        <DialogContent className="max-w-4xl">
          <DialogHeader>
            <DialogTitle>Edit {type === 'university' ? 'University' : 'Major'} Introduction</DialogTitle>
            <DialogDescription>
              Update the introduction content for this {type}.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <label className="text-sm font-medium">Title</label>
              <Input
                placeholder={`Enter ${type} introduction title`}
                value={title}
                onChange={(e) => setTitle(e.target.value)}
              />
            </div>
            <div>
              <label className="text-sm font-medium">Content</label>
              <TipTapEditor
                content={content}
                onChange={setContent}
                placeholder={`Write ${type} introduction content here...`}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsEditing(false)}>
              Cancel
            </Button>
            <Button onClick={handleSave} disabled={loading}>
              {loading ? 'Saving...' : 'Save Changes'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
