import { Editor as CoreEditor } from '@/core/editor'
import { PropsWithChildren } from 'react'
import { EditorContext } from '../hooks/use-editor-context'

interface EditorProps {
  editor: CoreEditor
}

export function EditorProvider(props: PropsWithChildren<EditorProps>) {
  return (
    <EditorContext.Provider value={{ editor: props.editor }}>
      {props.children}
    </EditorContext.Provider>
  )
}
