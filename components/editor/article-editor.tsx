"use client"

import { useEditor, EditorContent } from "@tiptap/react"
import StarterKit from "@tiptap/starter-kit"
import { Toolbar } from "@/components/editor/toolbar"
import { useEffect } from "react"

export function ArticleEditor({
  content = "",
  onChange,
  editable = true,
}: {
  content?: string
  onChange?: (content: string) => void
  editable?: boolean
}) {
  const editor = useEditor({
    immediatelyRender: false,
    extensions: [
      StarterKit.configure({
        heading: {
          levels: [1, 2, 3],
        },
      }),
    ],
    content: content,
    editable,
    editorProps: {
      attributes: {
        class: "prose dark:prose-invert prose-sm sm:prose lg:prose-lg xl:prose-2xl mx-auto focus:outline-none min-h-[300px] p-4",
      },
    },
    onUpdate: ({ editor }) => {
      if (onChange) {
        onChange(editor.getHTML())
      }
    },
  })

  useEffect(() => {
    if (editor && content !== editor.getHTML()) {
      editor.commands.setContent(content)
    }
  }, [content, editor])

  if (!editor) {
    return <div className="border rounded-md p-4 min-h-[300px] bg-muted/50" />
  }

  return (
    <div className="border rounded-lg overflow-hidden">
      {editable && <Toolbar editor={editor} />}
      <EditorContent editor={editor} />
    </div>
  )
}
