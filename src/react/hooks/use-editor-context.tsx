import type { Editor as CoreEditor } from '@/core/editor'
import { createContext, useContext } from 'react'

// 注意：保证 context 中肯定会有 editor
export const EditorContext = createContext(
  {} as {
    editor: CoreEditor
  },
)

export function useEditorContext() {
  return useContext(EditorContext)
}
