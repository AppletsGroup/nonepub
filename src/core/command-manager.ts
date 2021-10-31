import { EditorState, Transaction } from 'prosemirror-state'
import { EditorView } from 'prosemirror-view'
import { Editor } from './editor'
import type { Command as PMCommand } from './types'

declare global {
  namespace XEditor {
    interface AllCommands {}
  }
}

export type ChainableCommands = {
  [K in keyof XEditor.AllCommands]: (
    ...args: Parameters<XEditor.AllCommands[K]>
  ) => ChainableCommands
} & {
  callCommand: (name: string, ...args: any[]) => ChainableCommands
  run: () => void
  dryRun: () => void
}

export type OnceCommands = {
  [K in keyof XEditor.AllCommands]: (
    ...args: Parameters<XEditor.AllCommands[K]>
  ) => boolean
} & {
  callCommand: (name: string, ...args: any[]) => boolean
  dryCallCommand: (name: string, ...args: any[]) => boolean
}

export type CommandReturn = (params: {
  tr: Transaction
  state: EditorState
  dispatch?: (tr: Transaction) => void
  view?: EditorView
}) => boolean

export type Command = (...args: any[]) => CommandReturn

export class CommandManager {
  private commandMap: Record<string, Command> = {}

  tr!: Transaction

  constructor(private editor: Editor, command: Record<string, Command>) {
    this.commandMap = command
  }

  addCommand(name: string, command: Command) {
    this.commandMap[name] = command
  }

  commands() {
    return this.commandMap as unknown as XEditor.AllCommands
  }

  runOne() {
    this.tr = this.editor.editorView.state.tr

    const onceCommands: Record<string, unknown> = {}

    Object.keys(this.commandMap).forEach((cmdName) => {
      onceCommands[cmdName] = (...args: any[]) => {
        return this.commandMap[cmdName](...args)({
          tr: this.tr,
          state: this.editor.editorView.state,
          dispatch: this.editor.editorView.dispatch,
          view: this.editor.editorView,
        })
      }
    })

    onceCommands['callCommand'] = (name: string, ...args: any[]) => {
      return this.commandMap[name](...args)({
        tr: this.tr,
        state: this.editor.editorView.state,
        dispatch: this.editor.editorView.dispatch,
        view: this.editor.editorView,
      })
    }

    onceCommands['dryCallCommand'] = (name: string, ...args: any[]) => {
      return this.commandMap[name](...args)({
        tr: this.tr,
        state: this.editor.editorView.state,
        view: this.editor.editorView,
      })
    }

    return onceCommands as unknown as OnceCommands
  }

  chain() {
    this.tr = this.editor.editorView.state.tr

    const chainableCommands: Record<string, unknown> = {}

    const dispatch = (tr: Transaction) => {
      if (tr !== this.tr) {
        throw new Error('Runtime Error: Transaction mismatched')
      }
    }

    Object.keys(this.commandMap).forEach((cmdName) => {
      chainableCommands[cmdName] = (...args: any) => {
        this.commandMap[cmdName](...args)({
          tr: this.tr,
          state: this.editor.editorView.state,
          dispatch,
          view: this.editor.editorView,
        })

        return chainableCommands
      }
    })

    // raw call command
    chainableCommands['callCommand'] = (name: string, ...args: any) => {
      this.commandMap[name](...args)({
        tr: this.tr,
        state: this.editor.editorView.state,
        dispatch,
        view: this.editor.editorView,
      })

      return chainableCommands
    }

    chainableCommands['run'] = () => {
      this.editor.editorView.dispatch(this.tr)
    }

    chainableCommands['dryRun'] = () => {
      // do nothing
    }

    return chainableCommands as unknown as ChainableCommands
  }

  command(name: string) {
    return this.commandMap[name]
  }
}
