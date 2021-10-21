import CodeMirror from 'codemirror'
import { EditorView, NodeView } from 'prosemirror-view'
import { Node as PMNode } from 'prosemirror-model'
import { Selection, TextSelection } from 'prosemirror-state'
import { exitCode } from 'prosemirror-commands'
import { redo, undo } from 'prosemirror-history'
import 'codemirror/lib/codemirror.css'
import 'codemirror/theme/monokai.css'
import 'codemirror/mode/javascript/javascript'
import 'codemirror/mode/go/go'
import 'codemirror/mode/shell/shell'
import 'codemirror/mode/jsx/jsx'
import 'codemirror/mode/python/python'
import html from 'nanohtml'
import './index.scss'
import { CodeBlockMeta, codeBlockPluginKey } from '.'

function computeChange(oldVal: string, newVal: string) {
  if (oldVal === newVal) return null
  let start = 0,
    oldEnd = oldVal.length,
    newEnd = newVal.length
  while (
    start < oldEnd &&
    oldVal.charCodeAt(start) === newVal.charCodeAt(start)
  )
    ++start
  while (
    oldEnd > start &&
    newEnd > start &&
    oldVal.charCodeAt(oldEnd - 1) === newVal.charCodeAt(newEnd - 1)
  ) {
    oldEnd--
    newEnd--
  }
  return { from: start, to: oldEnd, text: newVal.slice(start, newEnd) }
}

export class CodeBlockView implements NodeView {
  dom = html`
    <div class="code-block-view"></div>
  `

  private incomingChanges = false
  private cm!: CodeMirror.Editor
  private updating = false
  private isToolbarVisible = false
  private preserveToolbar = false
  private langIndicator?: HTMLElement

  constructor(
    public node: PMNode,
    public view: EditorView,
    public getPos: boolean | (() => number),
  ) {
    this.dom.style.position = 'relative'

    this.cm = CodeMirror(this.dom, {
      value: this.node.textContent,
      lineNumbers: true,
      theme: 'monokai',
      mode: node.attrs.mode || 'plain',
      viewportMargin: Infinity,
      extraKeys: this.codeMirrorKeymap(),
    })
    setTimeout(() => this.cm.refresh(), 20)

    this.cm.on('beforeChange', () => (this.incomingChanges = true))

    this.cm.on('cursorActivity', () => {
      if (!this.updating && !this.incomingChanges) {
        this.forwardSelection()
      }
    })
    this.cm.on('changes', () => {
      if (!this.updating) {
        this.valueChanged()
        this.forwardSelection()
      }
      this.incomingChanges = false
    })
    this.cm.on('focus', () => this.forwardSelection())
    this.cm.on('keydown', (_, event) => {
      if (event.key === 'Backspace') {
        if (!this.cm.getValue()) {
          console.log('remove node')
          const pos = (this.getPos as () => number)()
          view.dispatch(view.state.tr.delete(pos, pos + this.node.nodeSize))
          view.focus()
        }
      }
    })
    this.dom.addEventListener('mouseenter', this.onMouseEnter.bind(this))
    this.dom.addEventListener('mouseleave', this.onMouseLeave.bind(this))
    this.renderToolbar()
  }

  onMouseEnter() {
    this.isToolbarVisible = true
    this.renderToolbar()
  }

  onMouseLeave() {
    let preserveToolbar = false
    const pluginState = codeBlockPluginKey.getState(this.view.state)
    // 选中了
    if (pluginState?.activeNodePos === (this.getPos as any)()) {
      preserveToolbar = true
    } else {
      preserveToolbar = false
    }

    if (preserveToolbar) {
      this.isToolbarVisible = true
    } else {
      this.isToolbarVisible = false
    }

    this.renderToolbar()
  }

  renderToolbar() {
    const handleLangClick = (ev: MouseEvent) => {
      const getPos = this.getPos as () => number
      ev.stopPropagation()
      ev.preventDefault()
      this.view.dispatch(
        this.view.state.tr.setMeta(codeBlockPluginKey, {
          action: 'SELECT_LANG',
          pos: getPos(),
        } as CodeBlockMeta),
      )
    }

    const init = () => {
      if (!this.langIndicator) {
        this.langIndicator = html`
          <div class="lang-indicator" onclick=${handleLangClick}>
            ${this.node.attrs.mode}
          </div>
        `
        this.dom.appendChild(this.langIndicator)
      }
    }

    if (this.isToolbarVisible) {
      init()
      this.langIndicator!.className = 'lang-indicator'
      this.langIndicator!.innerHTML = this.node.attrs.mode
    } else {
      init()
      this.langIndicator!.className = 'lang-indicator lang-indicator--hide'
      this.langIndicator!.innerHTML = this.node.attrs.mode
    }
  }

  codeMirrorKeymap() {
    const { view } = this
    const mod = /Mac/.test(navigator.platform) ? 'Cmd' : 'Ctrl'

    return CodeMirror.normalizeKeyMap({
      Up: () => this.maybeEscape('line', -1),
      Left: () => this.maybeEscape('char', -1),
      Down: () => this.maybeEscape('line', 1),
      Right: () => this.maybeEscape('char', 1),
      'Ctrl-Enter': () => {
        if (exitCode(view.state, view.dispatch)) view.focus()
      },
      [`${mod}-Z`]: () => undo(view.state, view.dispatch),
      [`Shift-${mod}-Z`]: () => redo(view.state, view.dispatch),
      [`${mod}-Y`]: () => redo(view.state, view.dispatch),
    })
  }

  maybeEscape(unit: string, dir: number) {
    const pos = this.cm.getCursor()
    if (
      this.cm.somethingSelected() ||
      pos.line !== (dir < 0 ? this.cm.firstLine() : this.cm.lastLine()) ||
      (unit === 'char' &&
        pos.ch !== (dir < 0 ? 0 : this.cm.getLine(pos.line).length))
    ) {
      return CodeMirror.Pass
    }
    this.view.focus()
    const getPos = this.getPos as () => number
    const targetPos = getPos() + (dir < 0 ? 0 : this.node.nodeSize)
    const selection = Selection.near(
      this.view.state.doc.resolve(targetPos),
      dir,
    )
    this.view.dispatch(
      this.view.state.tr.setSelection(selection).scrollIntoView(),
    )
    this.view.focus()
  }

  forwardSelection() {
    if (!this.cm.hasFocus()) return
    const { state } = this.view
    const selection = this.asProseMirrorSelection(state.doc)
    if (!selection.eq(state.selection)) {
      this.view.dispatch(state.tr.setSelection(selection))
    }
  }

  asProseMirrorSelection(doc: PMNode): Selection {
    const getPos = this.getPos as () => number
    const offset = getPos() + 1
    const anchor = this.cm.indexFromPos(this.cm.getCursor('anchor')) + offset
    const head = this.cm.indexFromPos(this.cm.getCursor('head')) + offset
    return TextSelection.create(doc, anchor, head)
  }

  valueChanged() {
    const getPos = this.getPos as () => number
    const change = computeChange(this.node.textContent, this.cm.getValue())
    if (change) {
      const start = getPos() + 1
      const tr = this.view.state.tr.replaceWith(
        start + change.from,
        start + change.to,
        change.text ? this.view.state.schema.text(change.text) : null,
      )
      this.view.dispatch(tr)
    }
  }

  update(node: PMNode): boolean {
    if (node.type !== this.node.type) return false
    this.node = node

    if (this.cm.getOption('mode') !== this.node.attrs.mode) {
      this.cm.setOption('mode', this.node.attrs.mode || 'text/plain')
    }

    this.renderToolbar()

    const change = computeChange(this.cm.getValue(), node.textContent)
    if (change) {
      this.updating = true
      this.cm.replaceRange(
        change.text,
        this.cm.posFromIndex(change.from),
        this.cm.posFromIndex(change.to),
      )
      this.updating = false
    }
    return true
  }

  setSelection(anchor: number, head: number) {
    this.cm.focus()
    this.updating = true
    this.cm.setSelection(
      this.cm.posFromIndex(anchor),
      this.cm.posFromIndex(head),
    )
    this.updating = false
  }

  selectNode() {
    this.cm.focus()
  }

  stopEvent() {
    return true
  }
}
