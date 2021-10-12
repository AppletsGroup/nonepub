import { Editor, EditorOptions } from '@/core/editor'
import { useEffect, useMemo } from 'react'

export function useEditor(options: Partial<EditorOptions>) {
  const editor = useMemo(() => {
    return new Editor(options)
  }, [options])

  useEffect(() => {
    return () => {
      editor.destroy()
    }
  }, [editor])

  return editor
}
