import { INVISIBLE_RECT } from '@/extension-locator'
import React, { useEffect, useState, useRef } from 'react'
import { useEditorContext } from '@/react/hooks/use-editor-context'
import { useExtension } from '@/react/hooks/use-extension'
import {
  BubbleMenuButtonItem,
  BubbleMenuConfig,
  BubbleMenuCustomItem,
  BubbleMenuDropDownItrm as BubbleMenuDropDownItem,
  BubbleMenuContextMenuItem,
  BubbleMenuExtension,
} from '.'
import { calculatePosition, Placement, Rect } from '@/core/utils/position'
import Icon from '@/react/ui/icon'
import { useOnClickOutside } from '@/react/hooks/use-on-click-outside'
import { ContextMenu, ContextMenuItem } from '@/react/ui/context-menu'
import classNames from 'classnames'
import { ExtensionStore } from '@/core/extension'
import { keyToSymbol } from '@/core/utils/keyboard'

function useBubbleMenuConfig() {
  const extension = useExtension(BubbleMenuExtension)
  const [config, setConfig] = useState<BubbleMenuConfig>()
  useEffect(() => {
    const update = (config: BubbleMenuConfig) => {
      setConfig(config)
    }
    const cancel = extension.onUpdate(update)

    return cancel
  }, [extension])

  return config
}

interface RectGetter {
  getBoundingClientRect: () => Rect
}

interface PopupProps {
  visible: boolean
  target?: RectGetter | null
  offset?: {
    x?: number
    y?: number
  }
  placement?: Placement
  onClickOutside?: () => void
}

function Popup(props: React.PropsWithChildren<PopupProps>) {
  const popupRef = useRef<HTMLDivElement | null>(null)
  const [position, setPosition] = useState<any>({
    x: -99990,
    y: -99990,
  })

  useEffect(() => {
    const id = window.requestAnimationFrame(() => {
      if (popupRef.current && props.visible && props.children) {
        const position = calculatePosition({
          popup: popupRef.current.getBoundingClientRect(),
          target: props.target?.getBoundingClientRect() ?? INVISIBLE_RECT,
          container:
            popupRef.current.offsetParent?.getBoundingClientRect() ??
            INVISIBLE_RECT,
          offset: props.offset,
          placement: props.placement,
        })
        setPosition(position)
      }
    })

    return () => {
      window.cancelAnimationFrame(id)
    }
  }, [
    props.children,
    props.target,
    props.offset,
    props.placement,
    props.visible,
  ])

  useOnClickOutside(popupRef, () => {
    props.onClickOutside?.()
  })

  return (
    <div
      ref={popupRef}
      style={{
        position: 'absolute',
        left: position.x,
        top: position.y,
        display: props.visible ? 'block' : 'none',
        zIndex: 9999,
      }}
      onMouseDown={(e) => {
        e.stopPropagation()
      }}
    >
      {props.children}
    </div>
  )
}

export default function BubbleMenu() {
  const { editor } = useEditorContext()

  const bubbleMenuConfig = useBubbleMenuConfig()

  const [canShow, setCanShow] = useState(true)

  const guides = ExtensionStore.getStore().get('shortcutGuides')

  let isActive = false
  let location = {
    rect: INVISIBLE_RECT,
  }

  if (bubbleMenuConfig?.getBoundingClientRect) {
    isActive = true
    location = {
      rect: bubbleMenuConfig.getBoundingClientRect(),
    }
  } else if (bubbleMenuConfig?.getDomRef) {
    const dom = bubbleMenuConfig.getDomRef({ view: editor.editorView })
    isActive = true
    location = {
      rect: dom.getBoundingClientRect(),
    }
  }

  useEffect(() => {
    document.addEventListener('mousedown', () => {
      setCanShow(false)
    })

    document.addEventListener('mouseup', () => {
      setTimeout(() => {
        setCanShow(true)
      }, 0)
    })
  }, [])

  const handleItemClick = (menuItem: BubbleMenuButtonItem) => {
    menuItem.onClick()
  }

  if (!bubbleMenuConfig) {
    return null
  }

  const menuButtons = bubbleMenuConfig.items.filter(
    (item): item is BubbleMenuButtonItem | BubbleMenuDropDownItem =>
      item.type === 'button' || item.type === 'dropdown',
  )
  // TODO: 完善快捷键机制
  menuButtons.forEach((button) => {
    const guide = guides.find((g) => g.name === button.name)
    if (guide && button.type === 'button') {
      button.shortcut = guide.shortcut
    }
  })

  const customRenderers = bubbleMenuConfig.items.filter(
    (item): item is BubbleMenuCustomItem => item.type === 'custom',
  )

  const contextMenuItems = bubbleMenuConfig.items.filter(
    (item): item is BubbleMenuContextMenuItem => item.type === 'contextmenu',
  )

  if (!canShow) {
    return null
  }

  return (
    <Popup
      target={{
        getBoundingClientRect: () => location.rect,
      }}
      visible={isActive}
      placement={bubbleMenuConfig.placement}
      offset={bubbleMenuConfig.offset}
      onClickOutside={bubbleMenuConfig.onClickOutside}
    >
      <div>
        {menuButtons.length > 0 ? (
          <div className="h-10 px-2 box-border shadow rounded bg-white inline-flex">
            {menuButtons.map((button) => {
              switch (button.type) {
                case 'button':
                  return <NormalMenuButton button={button} key={button.name} />
                case 'dropdown':
                  return <DropdownButton button={button} key={button.name} />
                default:
                  throw new Error('unimplemented')
              }
            })}
          </div>
        ) : null}
        {contextMenuItems.length > 0 && (
          <ContextMenu>
            {contextMenuItems.map((item) => {
              return (
                <ContextMenuItem
                  icon={item.icon}
                  text={item.name}
                  key={item.name}
                />
              )
            })}
          </ContextMenu>
        )}
        {customRenderers.map((item) => {
          return item.render()
        })}
      </div>
    </Popup>
  )
}

function NormalMenuButton({ button }: { button: BubbleMenuButtonItem }) {
  const btnRef = useRef<HTMLDivElement>(null)
  const [isActive, setIsActive] = useState(false)

  const btnClassName = classNames(
    'w-10 h-10 flex items-center justify-center cursor-pointer',
    {
      'text-gray-600': !button.isActive,
      'text-blue-500': button.isActive,
    },
  )

  return (
    <div
      className={btnClassName}
      onClick={button.onClick}
      ref={btnRef}
      onMouseEnter={() => {
        setIsActive(true)
      }}
      onMouseLeave={() => {
        setIsActive(false)
      }}
    >
      <Icon name={button.icon} />
      {button.shortcut && button.shortcut.length > 0 && (
        <Popup
          target={btnRef.current}
          visible={isActive}
          placement={{
            vertical: 'top',
            horizontal: 'center',
          }}
          offset={{
            x: 0,
            y: 8,
          }}
        >
          <div className="whitespace-nowrap bg-black bg-opacity-70 text-white text-sm rounded-md p-2 backdrop-filter backdrop-blur">
            {button.shortcut.map((keyName) => keyToSymbol(keyName)).join(' + ')}
          </div>
        </Popup>
      )}
    </div>
  )
}

function DropdownButton({ button }: { button: BubbleMenuDropDownItem }) {
  const btnRef = useRef<HTMLDivElement>(null)
  const [isActive, setIsActive] = useState(false)
  const timerRef = useRef<number | undefined>()

  const btnClassName = classNames(
    'w-10 h-10 flex items-center justify-center cursor-pointer relative',
    {
      'text-gray-600': !button.isActive,
      'text-blue-500': button.isActive,
    },
  )

  return (
    <div
      className={btnClassName}
      ref={btnRef}
      onMouseEnter={() => {
        window.clearTimeout(timerRef.current)
        setIsActive(true)
      }}
      onMouseLeave={() => {
        timerRef.current = window.setTimeout(() => {
          setIsActive(false)
        }, 100)
      }}
    >
      <Icon name={button.icon} />
      <Popup
        target={btnRef.current}
        visible={isActive}
        placement={{
          vertical: 'top',
          horizontal: 'center',
        }}
        offset={{
          x: 0,
          y: 8,
        }}
      >
        {button.content}
      </Popup>
    </div>
  )
}
