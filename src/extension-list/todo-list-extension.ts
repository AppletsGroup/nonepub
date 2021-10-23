import { CommandReturn } from '@/core/command-manager'
import { Extension, ExtensionNode } from '@/core/extension'
import { InputRule, wrappingInputRule } from 'prosemirror-inputrules'
import './todo-list.css'

const TODO_LIST: 'todo_list' = 'todo_list'

export class TodoListExtension extends Extension {
  name = TODO_LIST
  nodes(): ExtensionNode[] {
    return [
      {
        name: TODO_LIST,
        nodeSpec: {
          content: 'todo_item+',
          parseDOM: [{ tag: 'ul[data-todo-list]' }],
          toDOM: (node) => ['ul', { 'data-todo-list': '' }, 0],
          group: 'block',
        },
      },
    ]
  }

  addInputRules(): InputRule[] {
    return [
      wrappingInputRule(/^\s*\-\[\]\s$/, this.editor.schema.nodes[TODO_LIST]),
    ]
  }
}
