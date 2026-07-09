"use client";

import { useEditor, EditorContent } from '@tiptap/react'
import StarterKit from '@tiptap/starter-kit'
import Link from '@tiptap/extension-link'
import { Bold, Italic, List, ListOrdered, Link as LinkIcon, Heading2, Undo, Redo } from 'lucide-react'

interface RichTextEditorProps {
  content: string;
  onChange: (content: string) => void;
}

const MenuBar = ({ editor }: { editor: any }) => {
  if (!editor) {
    return null
  }

  const setLink = () => {
    const previousUrl = editor.getAttributes('link').href
    const url = window.prompt('URL', previousUrl)

    if (url === null) {
      return
    }

    if (url === '') {
      editor.chain().focus().extendMarkRange('link').unsetLink().run()
      return
    }

    editor.chain().focus().extendMarkRange('link').setLink({ href: url }).run()
  }

  return (
    <div className="flex flex-wrap items-center gap-1 p-2 bg-surface-50 border-b border-surface-200">
      <button
        type="button"
        onClick={() => editor.chain().focus().toggleBold().run()}
        disabled={!editor.can().chain().focus().toggleBold().run()}
        className={`p-2 rounded hover:bg-surface-200 transition-colors ${editor.isActive('bold') ? 'bg-surface-200 text-brand-600' : 'text-surface-600'}`}
        title="Bold"
      >
        <Bold className="w-4 h-4" />
      </button>
      <button
        type="button"
        onClick={() => editor.chain().focus().toggleItalic().run()}
        disabled={!editor.can().chain().focus().toggleItalic().run()}
        className={`p-2 rounded hover:bg-surface-200 transition-colors ${editor.isActive('italic') ? 'bg-surface-200 text-brand-600' : 'text-surface-600'}`}
        title="Italic"
      >
        <Italic className="w-4 h-4" />
      </button>
      <div className="w-px h-6 bg-surface-300 mx-1"></div>
      <button
        type="button"
        onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()}
        className={`p-2 rounded hover:bg-surface-200 transition-colors ${editor.isActive('heading', { level: 2 }) ? 'bg-surface-200 text-brand-600' : 'text-surface-600'}`}
        title="Heading 2"
      >
        <Heading2 className="w-4 h-4" />
      </button>
      <div className="w-px h-6 bg-surface-300 mx-1"></div>
      <button
        type="button"
        onClick={() => editor.chain().focus().toggleBulletList().run()}
        className={`p-2 rounded hover:bg-surface-200 transition-colors ${editor.isActive('bulletList') ? 'bg-surface-200 text-brand-600' : 'text-surface-600'}`}
        title="Bullet List"
      >
        <List className="w-4 h-4" />
      </button>
      <button
        type="button"
        onClick={() => editor.chain().focus().toggleOrderedList().run()}
        className={`p-2 rounded hover:bg-surface-200 transition-colors ${editor.isActive('orderedList') ? 'bg-surface-200 text-brand-600' : 'text-surface-600'}`}
        title="Ordered List"
      >
        <ListOrdered className="w-4 h-4" />
      </button>
      <div className="w-px h-6 bg-surface-300 mx-1"></div>
      <button
        type="button"
        onClick={setLink}
        className={`p-2 rounded hover:bg-surface-200 transition-colors ${editor.isActive('link') ? 'bg-surface-200 text-brand-600' : 'text-surface-600'}`}
        title="Add Link"
      >
        <LinkIcon className="w-4 h-4" />
      </button>
      <div className="flex-1"></div>
      <button
        type="button"
        onClick={() => editor.chain().focus().undo().run()}
        disabled={!editor.can().chain().focus().undo().run()}
        className="p-2 rounded hover:bg-surface-200 transition-colors text-surface-600 disabled:opacity-50"
        title="Undo"
      >
        <Undo className="w-4 h-4" />
      </button>
      <button
        type="button"
        onClick={() => editor.chain().focus().redo().run()}
        disabled={!editor.can().chain().focus().redo().run()}
        className="p-2 rounded hover:bg-surface-200 transition-colors text-surface-600 disabled:opacity-50"
        title="Redo"
      >
        <Redo className="w-4 h-4" />
      </button>
    </div>
  )
}

export function RichTextEditor({ content, onChange }: RichTextEditorProps) {
  const editor = useEditor({
    extensions: [
      StarterKit,
      Link.configure({
        openOnClick: false,
        HTMLAttributes: {
          class: 'text-brand-600 underline',
        },
      }),
    ],
    content,
    editorProps: {
      attributes: {
        class: 'prose prose-sm sm:prose-base focus:outline-none max-w-none p-4 min-h-[200px]',
      },
    },
    onUpdate: ({ editor }) => {
      onChange(editor.getHTML())
    },
  })

  return (
    <div className="border border-surface-300 rounded-xl overflow-hidden focus-within:ring-2 focus-within:ring-brand-500 focus-within:border-brand-500 transition-all bg-white">
      <MenuBar editor={editor} />
      <EditorContent editor={editor} />
    </div>
  )
}
