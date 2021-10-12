import { isMarkActive } from '@/core/utils/core'
import { selectionLocator, useLocator } from '@/extension-locator'
import { useEffect, useState } from 'react'
import { useEditorContext } from '../hooks/use-editor-context'
import { useEditorState } from '../hooks/use-editor-state'
import UiBubbleMenu from '../ui/bubble-menu'
import LocationPopup from '../ui/location-popup'

interface MenuItem {
  icon: string
  name: string
  isActive: boolean
  markType: string
  commandName?: string
  onClick?: () => void
}

export default function BubbleMenu() {
  const { editor } = useEditorContext()
  const { state, prevState } = useEditorState()

  const [menuItems, setMenuItems] = useState<MenuItem[]>([
    {
      icon: 'bold',
      name: '加粗',
      isActive: false,
      markType: 'strong',
      commandName: 'toggleBold',
    },
    { icon: 'italic', name: '斜体', isActive: false, markType: 'em' },
    {
      icon: 'link',
      name: '超链接',
      isActive: false,
      markType: 'link',
      onClick: () => {
        editor?.commandOnce.attachLink()
      },
    },
  ])
  const [canShow, setCanShow] = useState(false)

  const { isActive, location } = useLocator(selectionLocator, canShow)

  useEffect(() => {
    setMenuItems((prevMenuItems) => {
      return prevMenuItems.map((item) => {
        return {
          ...item,
          isActive: isMarkActive({ state, markType: item.markType }),
        }
      })
    })
  }, [state])

  useEffect(() => {
    document.addEventListener('mousedown', () => {
      setCanShow(false)
    })

    document.addEventListener('mouseup', () => {
      setCanShow(true)
    })
  }, [])

  const handleItemClick = (menuItem: MenuItem) => {
    if (menuItem.commandName) {
      editor?.commandChain.focus().callCommand(menuItem.commandName!, {}).run()
    } else if (menuItem.onClick) {
      menuItem.onClick()
    }
  }

  return (
    <LocationPopup
      location={location}
      visible={isActive}
      dismissImmediately
      offset={[0, 8]}
      placement="top"
    >
      <UiBubbleMenu items={menuItems} onClick={handleItemClick} />
    </LocationPopup>
  )
}
