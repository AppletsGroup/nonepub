import { EventEmitter } from '@/core/event-emitter'
import { Extension } from '@/core/extension'
import { findDomAtPos, findNodeAtPosition } from '@/core/utils/node'
import { BubbleMenuConfig } from '@/extension-bubble-menu'
import { Plugin, PluginKey, Transaction } from 'prosemirror-state'
import { EditorView } from 'prosemirror-view'
import rafSchd from 'raf-schd'
import { DragHandle } from './drag-handle'
import { getTargetRect } from './helper'

export enum DragHandleAction {
  SetNode = 'SET_NODE',
  ShowContextMenu = 'SHOW_CONTEXT_MENU',
  DismissContextMenu = 'DISMISS_CONTEXT_MENU',
  ClearAll = 'CLEAR_ALL',
}

export interface DragHandleState {
  activeNode?: {
    node: Node
    pos: number
  } | null
  isContextMenuActive: boolean
}

type DragHandleMeta =
  | {
      type: DragHandleAction.SetNode
      node:
        | {
            node: Node
            pos: number
          }
        | null
        | undefined
    }
  | {
      type: DragHandleAction.ShowContextMenu
    }
  | {
      type: DragHandleAction.DismissContextMenu
    }
  | {
      type: DragHandleAction.ClearAll
    }

const dragHandlePluginKey = new PluginKey<DragHandleState>('dragHandle')

export function setMeta(tr: Transaction, meta: DragHandleMeta) {
  return tr.setMeta(dragHandlePluginKey, meta)
}

export function getMeta(tr: Transaction) {
  return tr.getMeta(dragHandlePluginKey) as DragHandleMeta | undefined | null
}

const rafHandleMouseMove = rafSchd((view: EditorView, event: MouseEvent) => {
  const { clientX, clientY } = event
  const pos = view.posAtCoords({
    left: clientX + 24,
    top: clientY,
  })
  const dragHandlerPluginState = dragHandlePluginKey.getState(view.state)
  if (pos) {
    if (pos.inside >= 0) {
      const $pos = view.state.doc.resolve(pos.inside)
      const topPos = $pos.before(1)
      const dom = findDomAtPos(topPos, view)
      if (
        dragHandlerPluginState?.activeNode?.node !== dom ||
        dragHandlerPluginState?.activeNode?.pos !== topPos
      ) {
        const tr = setMeta(view.state.tr, {
          type: DragHandleAction.SetNode,
          node: {
            node: dom!,
            pos: topPos,
          },
        })
        view.dispatch(tr)
      }
    } else {
      if (dragHandlerPluginState && dragHandlerPluginState.activeNode) {
        const tr = setMeta(view.state.tr, {
          type: DragHandleAction.SetNode,
          node: null,
        })
        view.dispatch(tr)
      }
    }
  } else {
    const tr = setMeta(view.state.tr, {
      type: DragHandleAction.SetNode,
      node: null,
    })
    view.dispatch(tr)
  }
})

export class DragHandleExtension extends Extension {
  name = 'drag_handle'

  private emitter = new EventEmitter()

  getState(): DragHandleState {
    const state = dragHandlePluginKey.getState(this.editor.editorView.state)
    if (!state) {
      throw new Error('called getState before plugin init')
    }
    return state
  }

  onStateUpdate(fn: (s: DragHandleState) => void) {
    this.emitter.on('update', fn)
  }

  getBubbleMenuConfig({
    view,
  }: {
    view: EditorView
  }): BubbleMenuConfig | undefined {
    const state = dragHandlePluginKey.getState(view.state)
    console.log('drag handle bubble menu')

    if (state && state.activeNode && state.isContextMenuActive) {
      return {
        items: [
          {
            type: 'contextmenu',
            icon: 'align-left',
            name: '左对齐',
            onClick: () => {},
          },
          {
            type: 'contextmenu',
            icon: 'align-center',
            name: '居中对齐',
            onClick: () => {},
          },
          {
            type: 'contextmenu',
            icon: 'align-right',
            name: '右对齐',
            onClick: () => {},
          },
          {
            type: 'contextmenu',
            icon: 'file-copy-line',
            name: '复制内容',
            onClick: () => {},
          },
          {
            type: 'contextmenu',
            icon: 'delete-bin-line',
            name: '删除',
            onClick: () => {},
          },
        ],
        getBoundingClientRect: () => {
          const rect = getTargetRect(
            view,
            state.activeNode!.node as HTMLElement,
            state.activeNode!.pos,
          )
          const r = {
            ...rect,
            left: rect.x,
            top: rect.y,
            right: rect.x + rect.width,
            bottom: rect.y + rect.height,
          }

          return {
            ...r,
            toJSON() {
              return r
            },
          }
        },
        placement: {
          horizontal: 'right',
          vertical: 'start',
        },
        onClickOutside: () => {
          const tr = setMeta(view.state.tr, {
            type: DragHandleAction.DismissContextMenu,
          })
          view.dispatch(tr)
        },
      }
    }
    console.log('drag handle bubble menu here')
    return undefined
  }

  addPMPlugins() {
    const ext = this

    return [
      new Plugin({
        key: dragHandlePluginKey,

        state: {
          init() {
            return {
              isContextMenuActive: false,
            }
          },

          apply(tr, value, oldState, newState) {
            const meta = getMeta(tr)

            if (meta) {
              switch (meta.type) {
                case DragHandleAction.SetNode:
                  if (value.isContextMenuActive) {
                    return value
                  }

                  return {
                    ...value,
                    activeNode: meta.node,
                  }
                case DragHandleAction.ShowContextMenu:
                  if (value.activeNode) {
                    return {
                      ...value,
                      isContextMenuActive: true,
                    }
                  }
                  break
                case DragHandleAction.DismissContextMenu:
                  return {
                    ...value,
                    isContextMenuActive: false,
                  }
                case DragHandleAction.ClearAll:
                  return {
                    isContextMenuActive: false,
                    activeNode: undefined,
                  }
              }
            }

            return value
          },
        },

        view(editorView) {
          return {
            update(view, prevState) {
              // 如果文档发生了变化
              if (!prevState.doc.eq(view.state.doc)) {
                view.dispatch(
                  setMeta(view.state.tr, {
                    type: DragHandleAction.ClearAll,
                  }),
                )
              }

              ext.emitter.emit(
                'update',
                dragHandlePluginKey.getState(view.state),
              )
            },
            destroy() {},
          }
        },

        props: {
          handleDOMEvents: {
            // TODO: 不一定用 prosemirror 的状态
            mousemove: (view, event) => {
              rafHandleMouseMove(view, event)
              return false
            },
          },
        },
      }),
    ]
  }

  getReactContentComponent() {
    return DragHandle
  }
}
