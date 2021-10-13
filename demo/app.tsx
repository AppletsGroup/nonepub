import {
  useEditor,
  defaultPreset,
  EditorProvider,
  EditorContent,
} from '@/index'
import { useCallback } from 'react'

const options = defaultPreset()

export default function App() {
  const editor = useEditor(options)

  const handleOutputHtml = useCallback(() => {
    console.log(editor.getContentHtml())
  }, [editor])

  return (
    <div className="app">
      <button onClick={handleOutputHtml}>输出HTML内容</button>
      <EditorProvider editor={editor}>
        <EditorContent />
      </EditorProvider>
    </div>
  )
}
