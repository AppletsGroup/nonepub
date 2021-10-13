import { Extension } from '@/core/extension'
import BubbleMenu from './bubble-menu'
import { EventEmitter } from '@/utils'
import {
  EditorState,
  Plugin,
  PluginKey,
  TextSelection,
} from 'prosemirror-state'
import rafSchedule from 'raf-schd'
import React from 'react'
import { findParentNode } from '@/core/utils/node'
import { EditorView } from 'prosemirror-view'
import { selectionToRect } from '@/core/utils/selection-to-rect'
import { Placement } from '@/core/utils/position'
import ColorPalette from './color-palette'
import { isMarkActive } from '@/core/utils/core'

export interface BubbleMenuContextMenuItem {
  type: 'contextmenu'
  icon: string
  name: string
  onClick: () => void
}

export interface BubbleMenuButtonItem {
  type: 'button'
  icon: string
  name: string
  isActive: boolean
  onClick: () => void
}

export interface BubbleMenuDropDownItrm {
  type: 'dropdown'
  icon: string
  name: string
  isActive: boolean
  onClick: () => void
  content: React.ReactElement
}

export interface BubbleMenuCustomItem {
  type: 'custom'
  render: () => React.ReactElement
}

export type BubbleMenuItem =
  | BubbleMenuButtonItem
  | BubbleMenuCustomItem
  | BubbleMenuDropDownItrm
  | BubbleMenuContextMenuItem

export interface BubbleMenuConfig {
  items: BubbleMenuItem[]
  getDomRef?: ({ view }: { view: EditorView }) => HTMLElement
  getBoundingClientRect?: () => DOMRect
  placement?: Placement
  offset?: {
    x: number
    y: number
  }
  onClickOutside?: () => void
}

const bubbleMenuPluginKey = new PluginKey<BubbleMenuConfig>('bubbleMenu')

export class BubbleMenuExtension extends Extension {
  name = 'bubble_menu'

  private emitter = new EventEmitter()

  getBubbleMenuConfig({
    state,
    view,
  }: {
    state: EditorState
    view: EditorView
  }): BubbleMenuConfig | undefined {
    if (state.selection instanceof TextSelection && !state.selection.empty) {
      // TODO: 如何把这个逻辑结耦出来？
      if (
        findParentNode(
          (node) => node.type.name === 'code_block',
          state.selection,
        )
      ) {
        return undefined
      }

      return {
        items: [
          {
            type: 'button',
            icon: 'bold',
            name: '加粗',
            isActive: isMarkActive({ state, markType: 'strong' }),
            onClick: () => {
              this.editor.commandChain.toggleBold().focus().run()
            },
          },
          {
            type: 'button',
            icon: 'strikethrough',
            name: '删除线',
            isActive: isMarkActive({ state, markType: 'strike' }),
            onClick: () => {
              this.editor.commandChain.toggleStrike().focus().run()
            },
          },
          {
            type: 'dropdown',
            icon: 'font-color',
            name: '字体颜色',
            isActive: isMarkActive({ state, markType: 'text_color' }),
            onClick: () => {},
            content: <ColorPalette mode="default" />,
          },
          {
            type: 'dropdown',
            icon: 'mark-pen-line',
            name: '背景颜色',
            isActive: isMarkActive({
              state,
              markType: 'text_background_color',
            }),
            onClick: () => {},
            content: <ColorPalette mode="light" />,
          },
          {
            type: 'button',
            icon: 'link',
            name: '超链接',
            isActive: isMarkActive({ state, markType: 'link' }),
            onClick: () => {
              this.editor.commandChain.addLinkToSelection().run()
            },
          },
          {
            type: 'button',
            icon: 'underline',
            name: '下划线',
            isActive: isMarkActive({ state, markType: 'underline' }),
            onClick: () => {
              this.editor.commandChain.toggleUnderline().focus().run()
            },
          },
          {
            type: 'button',
            icon: 'italic',
            name: '斜体',
            isActive: isMarkActive({ state, markType: 'em' }),
            onClick: () => {
              this.editor.commandChain.toggleItalic().focus().run()
            },
          },
          {
            type: 'button',
            icon: 'code-s-slash-line',
            name: '行内代码',
            isActive: isMarkActive({ state, markType: 'code' }),
            onClick: () => {
              this.editor.commandChain.toggleInlineCode().focus().run()
            },
          },
        ],
        placement: {
          horizontal: 'center',
          vertical: 'top',
        },
        // TODO: use rem instead?
        offset: {
          x: 0,
          y: 8,
        },
        getBoundingClientRect: () => {
          return selectionToRect(view, view.state.selection)
        },
      }
    }
  }

  onUpdate(fn: (config: BubbleMenuConfig) => void) {
    return this.emitter.on('update', fn)
  }

  addPMPlugins() {
    const ext = this

    return [
      new Plugin({
        key: bubbleMenuPluginKey,
        view() {
          const update = (view: EditorView) => {
            const configs = ext.editor.extensions
              .map((e) => e.getBubbleMenuConfig?.({ state: view.state, view }))
              .filter((config): config is BubbleMenuConfig => !!config)
            ext.emitter.emit('update', configs[0])
          }
          return {
            update: rafSchedule(update),
          }
        },
      }),
    ]
  }

  getReactContentComponent() {
    return BubbleMenu
  }
}

declare global {
  namespace XEditor {
    interface ExtensionAddons {
      getBubbleMenuConfig?(options: {
        state: EditorState
        view: EditorView
      }): BubbleMenuConfig | undefined
    }
  }
}
