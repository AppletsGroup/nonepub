import { Command, CommandReturn } from '@/core/command-manager'
import { CreateNodeView, Extension, ExtensionNode } from '@/core/extension'
import { NodeSelection } from 'prosemirror-state'
import { TodoItemNodeView } from './todo-item-node-view'

export class TodoItemExtension extends Extension {
  name = 'todo_item'

  nodes(): ExtensionNode[] {
    return [
      {
        name: 'todo_item',
        nodeSpec: {
          attrs: {
            checked: { default: false },
          },
          defining: true,
          content: 'paragraph block*',
          parseDOM: [
            {
              tag: 'li[data-todo-item]',
              getAttrs: (node) => {
                let checked = false

                if (
                  node instanceof Element &&
                  node.getAttribute('data-checked') !== null
                ) {
                  checked = true
                }

                return {
                  checked,
                }
              },
            },
          ],
          toDOM: (node) => {
            return [
              'li',
              {
                'data-todo-item': '',
                'data-checked': node.attrs.checked ? '' : undefined,
              },
              0,
            ]
          },
        },
      },
    ]
  }

  addCommands(): Record<string, Command> {
    return {
      toggleTodoItem: (): CommandReturn => {
        return ({ tr, dispatch }) => {
          if (
            tr.selection instanceof NodeSelection &&
            tr.selection.node.type.name === 'todo_item'
          ) {
            tr.setNodeMarkup(tr.selection.$from.pos, undefined, {
              checked: !tr.selection.node.attrs.checked,
            })
            dispatch?.(tr)
            return true
          }
          return false
        }
      },
    }
  }

  createNodeView(): CreateNodeView {
    return (node, view, getPos) => {
      return new TodoItemNodeView(node, view, getPos, this.editor)
    }
  }
}

declare global {
  namespace XEditor {
    interface AllCommands {
      toggleTodoItem: () => CommandReturn
    }
  }
}
