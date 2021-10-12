import { useExtension } from '@/react/hooks/use-extension'
import { useEffect, useMemo, useRef, useState } from 'react'
import { ImageExtension } from '.'
import UiBubbleMenu, { BubbleMenuItem } from '@/react/ui/bubble-menu'
import LocationPopup from '@/react/ui/location-popup'
import { useEditorContext } from '@/react/hooks/use-editor-context'
import { selectionToRect } from '@/core/utils/selection-to-rect'
import { nodeLocator, useLocator } from '@/extension-locator'

function useImageState() {
  const extension = useExtension(ImageExtension)
  const [state, setState] = useState<any>({})

  useEffect(() => {
    extension.addUploadStateChangeListener((state: any) => {
      setState(state)
    })
  })

  return state
}

function createDOMRect({
  x,
  y,
  left,
  top,
  width,
  height,
}: {
  x: number
  y: number
  left: number
  top: number
  width: number
  height: number
}): DOMRect {
  const r = {
    x,
    y,
    left,
    top,
    width,
    height,
    bottom: top + height,
    right: left + width,
  }

  return {
    ...r,
    toJSON() {
      return r
    },
  }
}

export function ImageToolbar() {
  const { editor } = useEditorContext()
  const state = useImageState()
  const isActive = !!state.selection

  const locator = useLocator(() => {
    return nodeLocator.from((prevOptions) => {
      return {
        ...prevOptions,
        isActive({ view, prevState }) {
          return isActive && prevOptions.isActive({ view, prevState })
        },
        getLocation({ view, prevState }) {
          const { rect } = prevOptions.getLocation({ view, prevState })

          if (state.selection?.node?.attrs?.width) {
            return {
              rect: createDOMRect({
                x: rect.x,
                y: rect.y,
                left: rect.left,
                top: rect.top,
                width: Number.parseFloat(state.selection?.node?.attrs?.width),
                height: rect.height,
              }),
            }
          }
          return { rect }
        },
      }
    })
  }, [isActive, state.selection?.node?.attrs?.width])

  const handleMenuClick = (item: BubbleMenuItem) => {
    switch (item.icon) {
      case 'align-center':
        editor.commandOnce.alignCenter()
        break
    }
  }

  return (
    <LocationPopup
      location={locator.location}
      visible={isActive}
      dismissImmediately
      placement="bottom"
      offset={[0, 4]}
    >
      <UiBubbleMenu
        items={[
          {
            icon: 'align-left',
            isActive: false,
            name: '左对齐',
          },
          {
            icon: 'align-center',
            isActive: false,
            name: '居中对齐',
          },
          {
            icon: 'align-left',
            isActive: false,
            name: '右对齐',
          },
        ]}
        onClick={handleMenuClick}
      />
    </LocationPopup>
  )
}
