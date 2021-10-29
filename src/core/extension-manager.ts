import {
  baseKeymap,
  chainCommands,
  createParagraphNear,
  liftEmptyBlock,
  newlineInCode,
  splitBlock,
} from 'prosemirror-commands'
import { dropCursor } from 'prosemirror-dropcursor'
import { gapCursor } from 'prosemirror-gapcursor'
import { history } from 'prosemirror-history'
import { InputRule, inputRules } from 'prosemirror-inputrules'
import { keymap } from 'prosemirror-keymap'
import { MarkSpec, NodeSpec, Schema } from 'prosemirror-model'
import { Plugin } from 'prosemirror-state'
import { Editor } from './editor'
import { CommandMeta, CreateNodeView, Extension } from './extension'
import { createCoreExtensions } from './extensions/core-extensions'
import sortBy from './sort'
import type { Command } from './command-manager'
import type { Command as PMCommand } from './types'
import 'prosemirror-gapcursor/style/gapcursor.css'

function logFn<T>(fn: T): T {
  function withLog(...args: any): any {
    console.log('function called', (fn as any).name)
    return (fn as any).apply(null, args)
  }
  return withLog as any
}

export class ExtensionManager {
  schema!: Schema
  shortcut!: Record<string, PMCommand>
  inputRules!: InputRule[]
  pmPlugins!: Plugin[]
  commands!: Record<string, Command>
  commandMeta: Record<string, CommandMeta> = {}
  nodeViews: Record<string, CreateNodeView> = {}

  constructor(private editor: Editor, public extensions: Extension[]) {}

  destroy() {
    this.extensions.forEach((ex) => {
      ex.onDestroy()
    })
  }

  process() {
    const extensions = [...createCoreExtensions(), ...this.extensions]
    this.extensions = extensions
    extensions.forEach((ex) => {
      ex.setEditor(this.editor)
    })

    const nodes = extensions.flatMap((ex) => ex.nodes()).sort(sortBy('node'))
    const marks = extensions.flatMap((ex) => ex.marks()).sort(sortBy('mark'))

    const schema = new Schema({
      nodes: nodes.reduce((prev, node) => {
        return {
          ...prev,
          [node.name]: node.nodeSpec,
        }
      }, {} as Record<string, NodeSpec>),
      marks: marks.reduce((prev, mark) => {
        return {
          ...prev,
          [mark.name]: mark.markSpec,
        }
      }, {} as Record<string, MarkSpec>),
    })
    this.schema = schema

    const commands = extensions.reduce((prev, curr) => {
      return {
        ...prev,
        ...curr.addCommands(),
      }
    }, {} as Record<string, Command>)
    this.commands = commands

    // add command meta
    this.commandMeta = extensions.reduce((prev, curr) => {
      return {
        ...prev,
        ...curr.commandMeta,
      }
    }, {})

    const keys = extensions.reduce((prev, curr) => {
      const keys = curr.addKeybindings()
      Object.entries(keys).forEach(([key, cmd]) => {
        if (prev[key]) {
          prev[key].push((state, dispatch, view) => {
            return cmd()({ tr: state.tr, state, dispatch, view })
          })
        } else {
          prev[key] = [
            (state, dispatch, view) => {
              return cmd()({ tr: state.tr, state, dispatch, view })
            },
          ]
        }
      })

      return prev
    }, {} as Record<string, PMCommand[]>)
    const shortcut: Record<string, PMCommand> = {}
    Object.entries(keys).forEach(([key, cmds]) => {
      if (cmds.length > 1) {
        shortcut[key] = chainCommands(...cmds)
      } else if (cmds.length === 1) {
        shortcut[key] = cmds[0]
      }
    })
    this.shortcut = shortcut

    const rules = extensions.flatMap((ex) => ex.addInputRules())
    this.inputRules = rules

    extensions.forEach((ex) => {
      const createNodeViewMethods = ex.createNodeView()
      if (typeof createNodeViewMethods === 'function') {
        this.nodeViews[ex.name] = createNodeViewMethods
      } else {
        Object.entries(createNodeViewMethods).forEach(([k, v]) => {
          this.nodeViews[k] = v
        })
      }
    })

    const pmPlugins = extensions.flatMap((ex) => ex.addPMPlugins())
    extensions.forEach((ext) => {
      ext.beforeResolvedAll()
    })

    this.pmPlugins = [
      ...pmPlugins,
      inputRules({ rules }),
      keymap(shortcut),
      keymap({
        ...baseKeymap,
        Enter: chainCommands(
          logFn(newlineInCode),
          logFn(createParagraphNear),
          logFn(liftEmptyBlock),
          logFn(splitBlock),
        ),
      }),
      dropCursor(),
      gapCursor(),
      history(),
      new Plugin({
        props: {
          attributes: { class: 'xxeditor-wrapper xx-editor prose prose-sm' },
        },
      }),
    ]
  }
}
