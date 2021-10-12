import { StateExtension } from '@/extension-state'
import { EditorState } from 'prosemirror-state'
import { EditorView } from 'prosemirror-view'
import { useEffect, useState } from 'react'
import { useEditorContext } from './use-editor-context'
import { useExtension } from './use-extension'

export function useEditorState() {
  const { editor } = useEditorContext()
  const stateExtension = useExtension(StateExtension)
  const [prevState, setPrevState] = useState<EditorState | null>(null)
  const [state, setState] = useState(editor!.editorView.state)

  useEffect(() => {
    const onStateChange = ({
      state,
      prevState,
    }: {
      state: EditorState
      prevState: EditorState
    }) => {
      setPrevState(prevState)
      setState(state)
    }

    const cancel = stateExtension.onChange(onStateChange)

    return () => {
      cancel()
    }
  }, [stateExtension])

  return {
    prevState,
    state,
  }
}
