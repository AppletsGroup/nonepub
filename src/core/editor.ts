import { EditorState } from 'prosemirror-state'
import { EditorView } from 'prosemirror-view'
import { CommandManager } from './command-manager'
import { Extension } from './extension'
import { ExtensionManager } from './extension-manager'
// import applyDevTools from 'prosemirror-dev-tools'
import { s } from './data'

export interface EditorOptions {
  el: Node
  extensions: Extension[]
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
    const state = EditorState.create({
      schema: this.extensionManager.schema,
      plugins: this.extensionManager.pmPlugins,
      doc: (pasteExtension as any).parser.parse(s),
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
  }

  // TODO: 当状态发生变化的时候 通知 react（注//声称需要状态时时变化的组件才需要）
  onStateChange(fn: any) {}
}
