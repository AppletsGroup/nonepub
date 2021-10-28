import { InputRule } from 'prosemirror-inputrules'
import { MarkSpec, NodeSpec, Schema, Node } from 'prosemirror-model'
import { EditorState, Transaction, Plugin } from 'prosemirror-state'
import { Decoration, EditorView, NodeView } from 'prosemirror-view'
import { Editor } from './editor'
import type { Command, CommandReturn } from './command-manager'
import { PasteRule } from './plugins/pasterules'
import React from 'react'
import { EventEmitter } from './event-emitter'

declare global {
  namespace XEditor {
    interface ExtensionStoreKV {}

    interface ExtensionAddons {}
  }
}

export type PMKeyBindingFn = (
  state: EditorState,
  dispatch?: (tr: Transaction) => void,
) => boolean

export type ExtensionNode = { name: string; nodeSpec: NodeSpec }

export type ExtensionMark = { name: string; markSpec: MarkSpec }

export type CommandMeta = {
  icon?: string | ((...args: any) => string)
  name?: string | ((...args: any) => string)
  markdown?: string | ((...args: any) => string)
  shortcut?: string[] | ((...args: any) => string[])
}

export type CreateNodeView = (
  node: Node,
  view: EditorView,
  getPos: (() => number) | boolean,
  decorations: Decoration[],
) => NodeView

export class ExtensionStore {
  private static _store: ExtensionStore

  private kv = new Map<string, unknown>()

  get<K extends keyof XEditor.ExtensionStoreKV>(
    k: K,
  ): XEditor.ExtensionStoreKV[K] {
    return this.kv.get(k) as XEditor.ExtensionStoreKV[K]
  }

  set<K extends keyof XEditor.ExtensionStoreKV>(
    k: K,
    v: XEditor.ExtensionStoreKV[K],
  ) {
    this.kv.set(k, v)
  }

  static getStore() {
    if (!ExtensionStore._store) {
      ExtensionStore._store = new ExtensionStore()
    }
    return ExtensionStore._store
  }
}

export interface Extension<EventMap = any> extends XEditor.ExtensionAddons {}

export abstract class Extension<EventMap = any> {
  name = 'extension'

  private _editor?: Editor

  protected _store: ExtensionStore = ExtensionStore.getStore()

  protected ee = new EventEmitter<EventMap>()

  commandMeta: Record<string, CommandMeta> = {}

  setEditor(editor: Editor) {
    this._editor = editor
  }

  get editor(): Editor {
    if (!this._editor) {
      throw new Error('access `editor` when editor is not created')
    }
    return this._editor
  }

  nodes(): ExtensionNode[] {
    return []
  }

  marks(): ExtensionMark[] {
    return []
  }

  // TODO: 也可以使用装饰器
  addCommandMeta(key: string, meta: CommandMeta) {
    this.commandMeta[key] = meta
  }

  addCommands(): Record<string, Command> {
    return {}
  }

  addInputRules(): InputRule[] {
    return []
  }

  addPasteRules(): PasteRule[] {
    return []
  }

  addKeybindings(): Record<string, () => CommandReturn> {
    return {}
  }

  addPMPlugins(): Plugin[] {
    return []
  }

  createNodeView(): CreateNodeView | Record<string, CreateNodeView> {
    return {}
  }

  onDestroy() {}

  /**
   * 在所有插件都被处理过之后，返回给编辑器之前调用
   */
  beforeResolvedAll() {}
}

export abstract class ExtensionWithState<
  EventMap = any,
  State = any,
> extends Extension<EventMap> {
  abstract onStateUpdate(fn: (s: State) => void): () => void

  abstract getState(): State
}
