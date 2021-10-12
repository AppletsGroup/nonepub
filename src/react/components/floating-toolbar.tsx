import { useEditorContext } from '../hooks/use-editor-context'
import BubbleMenu from '../ui/bubble-menu'

export default function FloatingToolbar() {
  const { editor } = useEditorContext()
  const selection = editor!.editorView.state.selection

  return null
}
