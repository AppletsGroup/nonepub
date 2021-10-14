import { Extension, ExtensionWithState } from '@/core/extension'
import { useEffect, useState } from 'react'
import { useEditorContext } from './use-editor-context'

export function useExtension<ExtensionType extends Extension>(
  ExtensionCls: new () => ExtensionType,
): ExtensionType {
  const { editor } = useEditorContext()
  if (!editor) {
    throw new Error('access editor when editor is not initialized')
  }
  const extension = editor.extensions.find(
    (ex) => (ex as any).constructor === ExtensionCls,
  )
  if (!extension) {
    console.log('editor.extensions', editor.extensions)
    throw new Error('can not find extension')
  }
  return extension as ExtensionType
}

export function useExtensionState<ExtensionType extends ExtensionWithState>(
  ExtensionCls: new () => ExtensionType,
): ReturnType<ExtensionType['getState']> {
  const { editor } = useEditorContext()
  if (!editor) {
    throw new Error('access editor when editor is not initialized')
  }
  const _extension = editor.extensions.find(
    (ex) => (ex as any).constructor === ExtensionCls,
  )
  if (!_extension) {
    throw new Error('can not find extension')
  }
  const extension = _extension as ExtensionType
  type S = ReturnType<ExtensionType['getState']>
  const [state, setState] = useState<S>(extension.getState())

  useEffect(() => {
    const onStateUpdate = (s: S) => {
      setState(s)
    }

    const cancel = extension.onStateUpdate(onStateUpdate)

    return cancel
  }, [extension])

  return state
}
