# nonepub

## 使用方法

```html
<!-- 添加图标 -->
<link
  rel="stylesheet"
  href="//at.alicdn.com/t/font_2678303_ixhym2k95c.css"
/>
```

```js
import {
  useEditor,
  defaultPreset,
  EditorProvider,
  EditorContent,
} from 'nonepub'
import 'nonepub/style.css'
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
