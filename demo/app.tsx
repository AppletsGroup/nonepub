import {
  useEditor,
  defaultPreset,
  EditorProvider,
  EditorContent,
} from '@/index'

const options = defaultPreset()

export default function App() {
  const editor = useEditor(options)

  return (
    <div className="app">
      <EditorProvider editor={editor}>
        <EditorContent />
      </EditorProvider>
    </div>
  )
}
