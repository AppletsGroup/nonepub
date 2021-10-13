import { EditorState } from 'prosemirror-state'
import { EditorView } from 'prosemirror-view'
import { CommandManager } from './command-manager'
import { Extension } from './extension'
import { ExtensionManager } from './extension-manager'
import { DOMParser, DOMSerializer } from 'prosemirror-model'
// import applyDevTools from 'prosemirror-dev-tools'

export interface EditorOptions {
  el: Node
  extensions: Extension[]
  defaultContent?: {
    value: string
    type: 'markdown' | 'html'
  }
}

export class Editor {
  editorView!: EditorView
  private extensionManager!: ExtensionManager
  private commandManager!: CommandManager

  constructor(private options: Partial<EditorOptions>) {
    this.createExtensionManager()
    this.createCommandManager()
    this.createEditorView()
  }

  get schema() {
    return this.extensionManager.schema
  }

  get extensions() {
    return this.extensionManager.extensions
  }

  get command() {
    return this.commandManager.commands()
  }

  get commandOnce() {
    return this.commandManager.runOne()
  }

  get commandChain() {
    return this.commandManager.chain()
  }

  get commandMeta() {
    return this.extensionManager.commandMeta
  }

  createExtensionManager() {
    this.extensionManager = new ExtensionManager(
      this,
      this.options.extensions || [],
    )
    this.extensionManager.process()
  }

  createCommandManager() {
    this.commandManager = new CommandManager(
      this,
      this.extensionManager.commands,
    )
  }

  createEditorView() {
    const pasteExtension = this.extensions.find((ex) => ex.name === 'paste')
    const self = this
    let doc: Parameters<typeof EditorState.create>[0]['doc']

    if (this.options.defaultContent) {
      switch (this.options.defaultContent.type) {
        case 'markdown':
          doc = (pasteExtension as any).parser.parse(
            this.options.defaultContent.value,
          )
          break
        case 'html':
          const dom = document.createElement('div')
          dom.innerHTML = this.options.defaultContent.value
          doc = DOMParser.fromSchema(this.extensionManager.schema).parse(dom)
      }
    }

    const state = EditorState.create({
      schema: this.extensionManager.schema,
      plugins: this.extensionManager.pmPlugins,
      doc,
    })
    this.editorView = new EditorView(this.options.el, {
      state,
      nodeViews: this.extensionManager.nodeViews,
      dispatchTransaction(tr) {
        const newState = self.editorView.state.apply(tr)
        self.editorView.updateState(newState)
      },
    })

    // applyDevTools(this.editorView)
  }

  public destroy() {
    this.extensionManager.destroy()
    this.editorView.destroy()
    this.editorView.state.doc.toJSON
  }

  // TODO: 当状态发生变化的时候 通知 react（注//声称需要状态时时变化的组件才需要）
  onStateChange(fn: any) {}

  getContentJSON() {
    return this.editorView.state.doc.toJSON()
  }

  getContentHtml() {
    const dom = DOMSerializer.fromSchema(
      this.editorView.state.doc.type.schema,
    ).serializeFragment(this.editorView.state.doc.content)
    const el = document.createElement('div')
    el.append(dom)
    return el.innerHTML
  }
}
