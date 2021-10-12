import { Extension, ExtensionNode } from '@/core/extension'
import './todo-list.css'

export class TodoListExtension extends Extension {
  nodes(): ExtensionNode[] {
    return [
      {
        name: 'todo_list',
        nodeSpec: {
          content: 'todo_item+',
          parseDOM: [{ tag: 'ul[data-todo-list]' }],
          toDOM: (node) => ['ul', { 'data-todo-list': '' }, 0],
          group: 'block',
        },
      },
    ]
  }
}
