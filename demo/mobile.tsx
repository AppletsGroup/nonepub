import { useEditor, mobilePreset, EditorProvider, EditorContent } from '@/index'
import { useCallback, useEffect } from 'react'
import html from './content/index.html'

const options = mobilePreset(
  {
    type: 'html',
    value: html,
  },
  {
    uploader: (file) => {
      return new Promise((resolve, reject) => {
        setTimeout(() => {
          const uri = URL.createObjectURL(file)
          console.log('upload uri', uri)
          resolve({
            src: uri,
          })
        }, 4000)
      })
    },
    readonly: false,
  },
)

export default function Mobile() {
  const editor = useEditor(options)

  // 可以做发布操作
  const handleOutputHtml = useCallback(() => {
    console.log(editor.getContentHtml())
  }, [editor])

  const handleOutputJSON = useCallback(() => {
    console.log(editor.getContentJSON())
  }, [editor])

  return (
    <div className="mobile-app">
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
