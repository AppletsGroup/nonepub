import { useEditorContext } from '@/react/hooks/use-editor-context'
import { useEventListener } from '@/react/hooks/use-event-listener'
import { useExtensionState } from '@/react/hooks/use-extension'
import Icon from '@/react/ui/icon'
import KeyboardButton from '@/react/ui/keyboard-button'
import Modal from '@/react/ui/modal'
import { useCallback } from 'react'
import { ShortcutOverviewExtension, pluginKey, OverviewAction } from '.'

function useShortcutOverviewState() {
  const state = useExtensionState(ShortcutOverviewExtension)
  return state
}

export default function ShortcutOverview() {
  const { editor } = useEditorContext()
  const state = useShortcutOverviewState()

  useEventListener(
    'keydown',
    (event) => {
      if (event.key === '/' && event.metaKey) {
        const { editorView: view } = editor
        event.preventDefault()
        event.stopPropagation()

        const tr = view.state.tr.setMeta(pluginKey, {
          type: OverviewAction.ToggleOverview,
        })
        view.dispatch(tr)
      }
    },
    true,
  )

  const handleModalClose = useCallback(() => {
    const { editorView: view } = editor
    const tr = view.state.tr.setMeta(pluginKey, {
      type: OverviewAction.ToggleOverview,
    })
    view.dispatch(tr)
  }, [editor])

  return (
    <Modal visible={state.visible} title="快捷输入" onClose={handleModalClose}>
      <div style={{ width: 700 }} className="flex justify-between flex-wrap">
        {editor.extensions.flatMap((ex) => {
          if (ex.getShortcutGuide) {
            return ex.getShortcutGuide().map((config) => {
              return (
                <div
                  key={config.name}
                  className="flex justify-between items-center w-80 mb-2"
                >
                  <div className="flex items-center">
                    <Icon name={config.icon} className="mr-4 text-gray-600" />
                    <div className="text-gray-500 font-mono">
                      {config.markdown || config.name}
                    </div>
                  </div>
                  <div className="flex">
                    {(config.shortcut || []).map((keyName) => {
                      return <KeyboardButton keyName={keyName} />
                    })}
                  </div>
                </div>
              )
            })
          }
          return []
        })}
      </div>
    </Modal>
  )
}
