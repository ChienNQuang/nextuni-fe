'use client'

import { useState, useCallback, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { TipTapEditor } from '@/components/editor/tiptap-editor'
import { ApiService } from '@/lib/api'
import { toast } from 'sonner'
import { Edit } from 'lucide-react'

interface UniversityIntroductionBlogProps {
  universityId: string
  initialContent?: string
  onSave?: () => void
}

export function UniversityIntroductionBlog({ 
  universityId, 
  initialContent = '',
  onSave 
}: UniversityIntroductionBlogProps) {
  const [title, setTitle] = useState('')
  const [content, setContent] = useState(initialContent)
  const [isEditing, setIsEditing] = useState(false)
  const [isSaving, setIsSaving] = useState(false)
  const [isLoading, setIsLoading] = useState(true)

  const fetchBlog = useCallback(async () => {
    try {
      setIsLoading(true)
      const response = await ApiService.getUniversityIntroductionBlog(universityId)
      
      if (response?.isSuccess && response.data) {
        setTitle(response.data.title || '')
        setContent(response.data.content || '')
      }
    } catch (error) {
      console.error('Failed to fetch university blog:', error)
      toast.error('Failed to load introduction blog')
    } finally {
      setIsLoading(false)
    }
  }, [universityId])

  useEffect(() => {
    fetchBlog()
  }, [fetchBlog])

  const handleSave = async () => {
    try {
      setIsSaving(true)
      const response = await ApiService.createUniversityIntroductionBlog({
        universityId,
        title,
        content
      })
      
      if (response?.isSuccess) {
        toast.success('Introduction saved successfully')
        setIsEditing(false)
        onSave?.()
      } else {
        throw new Error('Failed to save introduction')
      }
    } catch (error) {
      console.error('Failed to save introduction blog:', error)
      toast.error('Failed to save introduction')
    } finally {
      setIsSaving(false)
    }
  }

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>{title}</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="h-32 flex items-center justify-center">
            <p className="text-muted-foreground">Loading introduction...</p>
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle>{title}</CardTitle>
        <div className="flex gap-2">
          {isEditing ? (
            <>
              <Button 
                variant="outline" 
                size="sm" 
                onClick={() => {
                  setContent(initialContent)
                  setIsEditing(false)
                }}
                disabled={isSaving}
              >
                Cancel
              </Button>
              <Button 
                size="sm" 
                onClick={handleSave}
                disabled={isSaving || !content.trim()}
              >
                {isSaving ? 'Saving...' : 'Save Changes'}
              </Button>
            </>
          ) : (
            <Button 
              variant="outline" 
              size="sm" 
              onClick={() => setIsEditing(true)}
            >
              <Edit className="h-4 w-4 mr-2" />
              Edit Introduction
            </Button>
          )}
        </div>
      </CardHeader>
      <CardContent>
        {isEditing ? (
          <div className="space-y-4">
            <TipTapEditor 
              content={content}
              onChange={setContent}
              placeholder="Write the university introduction here..."
            />
          </div>
        ) : content ? (
          <div 
            className="prose dark:prose-invert max-w-none"
            dangerouslySetInnerHTML={{ __html: content }}
          />
        ) : (
          <div className="text-muted-foreground italic">
            No introduction content available. Click "Edit Introduction" to add one.
          </div>
        )}
      </CardContent>
    </Card>
  )
}
