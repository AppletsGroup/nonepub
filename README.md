# nonepub

## 使用方法

```js
import {
  useEditor,
  defaultPreset,
  EditorProvider,
  EditorContent,
} from '@yikeguozi/nonepub'
import '@yikeguozi/nonepub/style.css'
import { useCallback } from 'react'

const options = defaultPreset(
  undefined,
  {
    uploader: (file) => {
      return new Promise((resolve, reject) => {
        setTimeout(() => {
          const uri = URL.createObjectURL(file)
          console.log('upload uri', uri)
          resolve({
            src: uri,
          })
        }, 1000)
      })
    },
    readonly: false,
  },
)


function App() {
  const editor = useEditor(options)

  const handleOutputHtml = useCallback(() => {
    console.log(editor.getContentHtml())
  }, [editor])

  const handleOutputJSON = useCallback(() => {
    console.log(editor.getContentJSON())
  }, [editor])

  return (
    <div className="app">
      <button
        onClick={handleOutputHtml}
        className="py-2 px-4 font-semibold rounded-lg shadow-md text-white bg-green-500 hover:bg-green-700 mr-1"
      >
        输出HTML内容
      </button>
      <button
        onClick={handleOutputJSON}
        className="py-2 px-4 font-semibold rounded-lg shadow-md text-white bg-green-500 hover:bg-green-700"
      >
        输出JSON内容
      </button>
      <EditorProvider editor={editor}>
        <EditorContent />
      </EditorProvider>
    </div>
  )
}

export default App
```

## TODO

- [ ] 完成 DragHandle DragExtension
