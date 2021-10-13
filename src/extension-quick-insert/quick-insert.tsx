import { useCallback, useMemo, useState } from 'react'
import UiQuickInsert, { QuickInsertItem } from '@/react/ui/quick-insert'
import { useQuickInsert } from './use-quick-insert'
import { useEditorContext } from '../react/hooks/use-editor-context'
import { Fragment } from 'prosemirror-model'
import { INVISIBLE_RECT } from '@/core/utils/position'
import LocationPopup from '../react/ui/location-popup'
import { KEYBOARD } from '@/core/utils/dom'
import { useEventListener } from '../react/hooks/use-event-listener'

export default function QuickInsert() {
  const { editor } = useEditorContext()
  const quickInsertProps = useQuickInsert()
  const [activeIndex, setActiveIndex] = useState<number | undefined>()
  const [activeItem, setActiveItem] = useState<any>()

  const location = useMemo(() => {
    if (!quickInsertProps.rect) {
      return {
        rect: INVISIBLE_RECT,
      }
    }

    return {
      rect: quickInsertProps.rect,
    }
  }, [quickInsertProps.rect])

  const keyDownHandler = (e: KeyboardEvent) => {
    if (!quickInsertProps.visible) {
      return
    }

    let handled = true

    switch (e.key) {
      case KEYBOARD.ARROW_DOWN:
        setActiveIndex((prev) => {
          if (quickInsertProps.items.length === 0) {
            return undefined
          }

          if (prev == null) {
            return 0
          }

          const next = prev + 3

          if (next > quickInsertProps.items.length - 1) {
            return undefined
          }

          return next
        })
        break
      case KEYBOARD.ARROW_UP:
        setActiveIndex((prev) => {
          if (quickInsertProps.items.length === 0) {
            return undefined
          }

          if (prev == null) {
            return quickInsertProps.items.length - 1
          }

          const next = prev - 3

          if (next < 0) {
            return undefined
          }

          return next
        })
        break
      case KEYBOARD.ARROW_LEFT:
        setActiveIndex((prev) => {
          if (quickInsertProps.items.length === 0) {
            return undefined
          }

          if (prev && prev <= 0) {
            return quickInsertProps.items.length - 1
          }

          return typeof prev === 'number' ? prev - 1 : 0
        })
        break
      case KEYBOARD.ARROW_RIGHT:
        setActiveIndex((prev) => {
          if (quickInsertProps.items.length === 0) {
            return undefined
          }

          if (prev && prev >= quickInsertProps.items.length - 1) {
            return 0
          }

          return typeof prev === 'number' ? prev + 1 : 0
        })
        break
      case KEYBOARD.ENTER:
        if (typeof activeIndex === 'number') {
          handleMenuItemClick(quickInsertProps.items[activeIndex])
        }
        break
      default:
        handled = false
    }

    if (handled) {
      e.preventDefault()
      e.stopPropagation()
    }
  }

  useEventListener('keydown', keyDownHandler, true)

  const handleMenuItemClick = useCallback(
    (pluginItem: QuickInsertItem) => {
      editor.commandChain
        .focus()
        .replaceWith(
          quickInsertProps.match!.range.from,
          quickInsertProps.match!.range.to,
          Fragment.empty,
        )
        .callCommand(pluginItem.commandName!, pluginItem.commandOptions)
        .run()
    },
    [editor, quickInsertProps],
  )

  return (
    <LocationPopup
      location={location}
      visible={quickInsertProps.visible}
      placement="bottom-start"
      dismissImmediately
    >
      <UiQuickInsert
        items={quickInsertProps.items || []}
        onItemClick={handleMenuItemClick}
        activeIndex={activeIndex}
        onActiveIndexChange={(idx) => {
          setActiveIndex(idx)
          setActiveItem(quickInsertProps.items[idx])
        }}
      />
    </LocationPopup>
  )
}
