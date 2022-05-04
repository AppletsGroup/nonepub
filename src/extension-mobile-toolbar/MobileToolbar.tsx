import { Editor } from '@/core/editor'
import { isMarkActive } from '@/core/utils/core'
import { useEditorContext } from '@/react/hooks/use-editor-context'
import { useEditorState } from '@/react/hooks/use-editor-state'
import Icon from '@/react/ui/icon'
import classNames from 'classnames'
import { EditorState } from 'prosemirror-state'
import React, { useCallback, useEffect, useState } from 'react'
import { CSSProperties } from 'styled-components'
import './index.scss'

type ToolbarMenuItem = {
  icon: string
  name: string
  children?: SubItem[]
  action?: (editor: Editor) => void
}

const MENU_ITEMS: ToolbarMenuItem[] = [
  {
    icon: 'font-size-2',
    name: 'heading',
    children: [
      {
        icon: 'h-1',
        action: (editor: Editor) => {
          editor.commandChain
            .setHeading({
              level: 1,
            })
            .focus()
            .run()
        },
      },
      {
        icon: 'h-2',
        action: (editor: Editor) => {
          editor.commandChain
            .setHeading({
              level: 2,
            })
            .focus()
            .run()
        },
      },
      {
        icon: 'h-3',
        action: (editor: Editor) => {
          editor.commandChain
            .setHeading({
              level: 3,
            })
            .focus()
            .run()
        },
      },
    ],
  },
  {
    icon: 'font-size',
    name: 'style',
    children: [
      {
        icon: 'bold',
        action: (editor: Editor) => {
          editor.commandChain.toggleBold().focus().run()
        },
        isActive: (state: EditorState) => {
          console.log('is mark active?')
          return isMarkActive({ state, markType: 'strong' })
        },
      },
      {
        icon: 'strikethrough',
        action: (editor: Editor) => {
          editor.commandChain.toggleStrike().focus().run()
        },
        isActive: (state: EditorState) => {
          return isMarkActive({ state, markType: 'strike' })
        },
      },
      {
        icon: 'underline',
        action: (editor: Editor) => {
          editor.commandChain.toggleUnderline().focus().run()
        },
        isActive: (state: EditorState) => {
          return isMarkActive({ state, markType: 'underline' })
        },
      },
      {
        icon: 'italic',
        action: (editor: Editor) => {
          editor.commandChain.toggleItalic().focus().run()
        },
        isActive: (state: EditorState) => {
          return isMarkActive({ state, markType: 'em' })
        },
      },
      {
        icon: 'code-s-slash-line',
        action: (editor: Editor) => {
          editor.commandChain.toggleInlineCode().focus().run()
        },
        isActive: (state: EditorState) => {
          return isMarkActive({ state, markType: 'code' })
        },
      },
    ],
  },
  // {
  //   icon: 'align-left',
  //   name: 'align',
  //   children: [
  //     {
  //       icon: 'align-left',
  //       action: (editor: Editor) => {
  //         editor.commandChain.alignLeft().focus().run()
  //       },
  //     },
  //     {
  //       icon: 'align-center',
  //       action: (editor: Editor) => {
  //         editor.commandChain.alignCenter().focus().run()
  //       },
  //     },
  //     {
  //       icon: 'align-right',
  //       action: (editor: Editor) => {
  //         editor.commandChain.alignRight().focus().run()
  //       },
  //     },
  //   ],
  // },
  {
    icon: 'checkbox-line',
    name: 'todo',
    action: (editor: Editor) => {
      editor.commandChain
        .wrapInList({
          type: 'todo_list',
          attrs: {},
        })
        .focus()
        .run()
    },
  },
  {
    icon: 'arrow-go-back-fill',
    name: 'undo',
    action: (editor: Editor) => {
      editor.commandChain.undo().focus().run()
    },
  },
  {
    icon: 'arrow-go-forward-fill',
    name: 'redo',
    action: (editor: Editor) => {
      editor.commandChain.redo().focus().run()
    },
  },
]

type MenuItem = typeof MENU_ITEMS[0]
type SubItem = {
  icon: string
  action?: any
  isActive?: (state: EditorState) => boolean
}

export default function MobileToolbar() {
  const { editor } = useEditorContext()
  const [wrapperStyles, setWrapperStyles] = useState<CSSProperties>({})
  const [visible, setVisible] = useState(false)
  const [activeItem, setActiveItem] = useState<MenuItem | null>(null)
  const { state } = useEditorState()

  // 在 flutter webview 中不存在这种问题
  // 安卓是否有问题需要进一步测试

  // useEffect(() => {
  //   const viewport = window.visualViewport
  //   function viewportHandler(e: Event) {
  //     const vp = e.target as VisualViewport
  //     const toolbarEl = document.querySelector('.x-mobile-toolbar')!

  //     const wrapperStyles: CSSProperties = {
  //       left: vp.offsetLeft,
  //       top:
  //         vp.height + vp.offsetTop - toolbarEl.getBoundingClientRect().height,
  //     }

  //     setWrapperStyles(wrapperStyles)
  //   }

  //   viewport.addEventListener('scroll', viewportHandler)
  //   viewport.addEventListener('resize', viewportHandler)

  //   return () => {
  //     viewport.removeEventListener('scroll', viewportHandler)
  //     viewport.removeEventListener('resize', viewportHandler)
  //   }
  // }, [])

  const handleMainItemClick = useCallback(
    (item: MenuItem) => {
      if (item.action) {
        setActiveItem(null)
        item.action(editor)
      } else {
        setActiveItem(item)
      }
    },
    [editor],
  )

  const handleItemClick = useCallback(
    (item: SubItem) => {
      if (item.action) {
        item.action(editor)
        console.log('call action')
      }
    },
    [editor],
  )

  return (
    <div
      className="x-mobile-toolbar fixed bottom-0 left-0 right-0 h-12 bg-white z-50 flex items-center border-t border-gray-200 justify-between px-2"
      style={{ ...wrapperStyles }}
    >
      <div className="h-12 flex">
        {MENU_ITEMS.map((item) => (
          <div
            className="w-8 h-12 flex justify-center items-center mr-1"
            style={{
              WebkitTapHighlightColor: 'transparent',
            }}
            onClick={() => {
              handleMainItemClick(item)
              editor.commandOnce.focus()
            }}
          >
            <div
              className={classNames(
                'w-8 h-8 flex justify-center items-center rounded',
                {
                  'bg-gray-200': activeItem && activeItem.name === item.name,
                },
              )}
            >
              <Icon name={item.icon} className="text-lg" />
            </div>
          </div>
        ))}
      </div>
      <div className="h-12 flex">
        <div className="w-8 h-12 flex justify-center items-center">
          <Icon name="arrow-down-s-line" className="text-lg" />
        </div>
      </div>
      {activeItem && activeItem.children && (
        <div
          className="secondary-toolbar absolute -top-2 bg-white h-12 shadow-sm rounded border border-gray-200 flex px-2"
          style={{ transform: 'translate(0px, -100%)' }}
        >
          {activeItem.children.map((item) => (
            <div
              className="w-8 h-12 flex justify-center items-center mr-1"
              style={{
                WebkitTapHighlightColor: 'transparent',
              }}
              onClick={() => {
                handleItemClick(item)
                editor.commandOnce.focus()
              }}
            >
              <div
                className={classNames(
                  'w-8 h-8 flex justify-center items-center rounded',
                  {
                    'bg-gray-200': item.isActive?.(state) ?? false,
                  },
                )}
              >
                <Icon name={item.icon} className="text-lg" />
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
