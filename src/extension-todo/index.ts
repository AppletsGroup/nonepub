import { Command, CommandReturn } from '@/core/command-manager'
import { CreateNodeView, Extension, ExtensionNode } from '@/core/extension'
import { NodeSelection } from 'prosemirror-state'
import { TodoItemNodeView } from './todo-item-node-view'

export class TodoExtension extends Extension {
  name = 'todo'

  nodes(): ExtensionNode[] {
    return [
      {
        name: 'todo',
        nodeSpec: {
          attrs: {
            checked: { default: false },
          },
          defining: true,
          group: 'block',
          content: 'text*',
          parseDOM: [
            {
              tag: 'div[data-todo-item]',
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
              'div',
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

  addKeybindings() {
    return {
      // Enter: (): CommandReturn => {
      //   return ({ tr, state, dispatch, view }) => {
      //     if (
      //       tr.selection.$from.depth > 0 &&
      //       tr.selection.$from.parent.type.name === 'todo' &&
      //       tr.selection.$from.parent.nodeSize > 2
      //     ) {
      //       const from = tr.selection.from
      //       tr.split(from)
      //       tr.setNodeMarkup(from + 1, undefined, {
      //         checked: false,
      //       })
      //       dispatch?.(tr)
      //       return true
      //     }
      //     // console.log('enter false')
      //     return false
      //   }
      // },
    }
  }

  addCommands(): Record<string, Command> {
    this.addCommandMeta('wrapInTodo', {
      icon: 'double-quotes-l',
      name: '待办列表',
      markdown: '> 引用',
      shortcut: ['command', 'shift', '.'],
    })

    return {
      wrapInTodo: () => {
        console.log('wrapintodo')
        console.log('wrapintodo', this.editor.schema.nodes.todo)
        return this.editor.command.setBlockType(this.editor.schema.nodes.todo)
      },
      toggleTodoItem: (): CommandReturn => {
        return ({ tr, dispatch }) => {
          if (
            tr.selection instanceof NodeSelection &&
            tr.selection.node.type.name === 'todo'
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
