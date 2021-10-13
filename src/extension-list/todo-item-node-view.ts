import { EditorView, NodeView } from 'prosemirror-view'
import { Node as PMNode } from 'prosemirror-model'
import './todo-item-node-view.css'
import { NodeSelection } from 'prosemirror-state'
import { Editor } from '@/core/editor'

export class TodoItemNodeView implements NodeView {
  dom: HTMLDivElement
  contentDOM: HTMLElement
  private checkbox: HTMLInputElement

  constructor(
    public node: PMNode,
    public view: EditorView,
    public getPos: boolean | (() => number),
    private editor: Editor,
  ) {
    this.dom = document.createElement('div')
    this.dom.className = 'xx-editor-todo-item flex items-start'
    const checkbox = document.createElement('input')
    checkbox.type = 'checkbox'
    checkbox.checked = !!node.attrs.checked
    checkbox.className = 'rounded-sm w-4 h-4'
    this.checkbox = checkbox
    this.checkbox.addEventListener('change', () => {
      this.view.dispatch(
        this.view.state.tr.setSelection(
          new NodeSelection(
            this.view.state.doc.resolve((this.getPos as any)()),
          ),
        ),
      )
      this.editor.commandChain.toggleTodoItem().focus().run()
    })
    const checkboxContainer = document.createElement('div')
    checkboxContainer.className =
      'w-5 h-5 flex items-center justify-center mr-1'
    checkboxContainer.appendChild(checkbox)

    const content = document.createElement('div')
    content.className = 'flex-auto whitespace-pre-wrap'
    this.contentDOM = content
    this.dom.appendChild(checkboxContainer)
    this.dom.appendChild(content)
  }

  update(node: PMNode): boolean {
    if (node.type !== this.node.type) return false
    this.node = node
    if (this.node.attrs.checked) {
      this.checkbox.checked = true
      this.dom.classList.add('xx-editor-todo-item--done')
    } else {
      this.checkbox.checked = false
      this.dom.classList.remove('xx-editor-todo-item--done')
    }

    return true
  }
}
