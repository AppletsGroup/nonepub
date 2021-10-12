import { PortalRenderer } from './portal-renderer'
import { useCallback, useEffect, useState } from 'react'
import { useEditorContext } from '../hooks/use-editor-context'

export function EditorContent() {
  const { editor } = useEditorContext()
  const [dom, setDom] = useState<HTMLDivElement | null>(null)

  const editorContentRef = useCallback((node: HTMLDivElement) => {
    setDom(node)
  }, [])

  useEffect(() => {
    if (dom) {
      dom.appendChild(editor!.editorView.dom)
    }

    return () => {
      while (dom?.firstChild) {
        dom.removeChild(dom.lastChild!)
      }
    }
  }, [dom, editor])

  return (
    <>
      <div className="editor-wrapper" ref={editorContentRef} />
      <PortalRenderer />
    </>
  )
}
