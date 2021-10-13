import { Command, CommandReturn } from '@/core/command-manager'
import { EventEmitter } from '@/core/event-emitter'
import {
  CreateNodeView,
  Extension,
  ExtensionNode,
  ExtensionWithState,
} from '@/core/extension'
import { findDomAtPos } from '@/core/utils/node'
import { BubbleMenuConfig } from '@/extension-bubble-menu'
import { textblockTypeInputRule } from 'prosemirror-inputrules'
import { DOMOutputSpec } from 'prosemirror-model'
import { EditorState, Plugin, PluginKey, Selection } from 'prosemirror-state'
import { Decoration } from 'prosemirror-view'
import { CodeBlockView } from './code-block'
import { LanguageSelect } from './language-select'

export interface CodeBlockPluginState {
  isSelectLang: boolean
  activeNodePos?: number
}

interface CodeBlockSelectLangMeta {
  action: 'SELECT_LANG'
  pos: number
}

interface CodeBlockSelectLangDismisssMeta {
  action: 'SELECT_LANG_DISMISS'
}

interface CodeBlockSwitchLangMeta {
  action: 'SWITCH_LANG'
  mode: string
}

export type CodeBlockMeta =
  | CodeBlockSelectLangMeta
  | CodeBlockSelectLangDismisssMeta
  | CodeBlockSwitchLangMeta

export const codeBlockPluginKey = new PluginKey<CodeBlockPluginState>(
  'codeBlock',
)

export class CodeBlockExtension extends ExtensionWithState<
  {
    update: CodeBlockPluginState
  },
  CodeBlockPluginState
> {
  name = 'code_block'

  nodes(): ExtensionNode[] {
    return [
      {
        name: 'code_block',
        nodeSpec: {
          attrs: {
            mode: { default: 'javascript' },
          },
          content: 'text*',
          marks: '',
          group: 'block',
          code: true,
          defining: true,
          parseDOM: [
            {
              tag: 'pre',
              preserveWhitespace: 'full',
              getAttrs: (node) => {
                let mode = 'plain'
                if (node instanceof Element) {
                  mode = node.getAttribute('data-mode') || 'plain'
                }
                return {
                  mode,
                }
              },
            },
          ],
          toDOM(node) {
            return [
              'pre',
              {
                'data-mode': node.attrs.mode || 'plain',
              },
              ['code', 0],
            ]
          },
        },
      },
    ]
  }

  addCommands(): Record<string, Command> {
    this.addCommandMeta('setCodeBlock', {
      icon: 'code-box-line',
      markdown: '```',
      name: '代码块',
      shortcut: [],
    })
    return {
      setCodeBlock: () => {
        return this.editor.command.setBlockType(
          this.editor.schema.nodes.code_block,
        )
      },
    }
  }

  addKeybindings() {
    const arrowHandler = (
      dir: 'up' | 'down' | 'left' | 'right' | 'forward' | 'backward',
    ): CommandReturn => {
      return ({ state, tr, dispatch, view }) => {
        if (state.selection.empty && view?.endOfTextblock(dir)) {
          const side = dir === 'left' || dir === 'up' ? -1 : 1,
            $head = state.selection.$head
          const nextPos = Selection.near(
            state.doc.resolve(side > 0 ? $head.after() : $head.before()),
            side,
          )
          if (
            nextPos.$head &&
            nextPos.$head.parent.type.name === 'code_block'
          ) {
            dispatch?.(state.tr.setSelection(nextPos))
            return true
          }
        }
        return false
      }
    }

    return {
      'Shift-Ctrl-\\': () =>
        this.editor.command.setBlockType(this.editor.schema.nodes.code_block),
      ArrowLeft: () => arrowHandler('left'),
      ArrowRight: () => arrowHandler('right'),
      ArrowUp: () => arrowHandler('up'),
      ArrowDown: () => arrowHandler('down'),
    }
  }

  addInputRules() {
    return [
      textblockTypeInputRule(/^```$/, this.editor.schema.nodes.code_block),
    ]
  }

  // TODO: 去除这段代码的编写
  onStateUpdate(fn: (state: CodeBlockPluginState) => void) {
    return this.ee.on('update', fn)
  }

  getState() {
    return codeBlockPluginKey.getState(this.editor.editorView.state)!
  }

  addPMPlugins() {
    const ext = this
    return [
      new Plugin({
        key: codeBlockPluginKey,
        state: {
          init() {
            return {
              isSelectLang: false,
            }
          },

          apply(tr, value, oldState, newState) {
            const nextState = {
              ...value,
            }
            if (typeof nextState.activeNodePos === 'number') {
              const { pos, deleted } = tr.mapping.mapResult(
                nextState.activeNodePos,
              )
              if (deleted) {
                nextState.activeNodePos = undefined
              } else {
                nextState.activeNodePos = pos
              }
            }

            const meta = tr.getMeta(codeBlockPluginKey) as
              | CodeBlockMeta
              | undefined
            if (!meta) {
              return value
            }

            switch (meta.action) {
              case 'SELECT_LANG':
                return {
                  isSelectLang: true,
                  activeNodePos: meta.pos,
                }
              case 'SELECT_LANG_DISMISS':
                return {
                  isSelectLang: false,
                  activeNodePos: undefined,
                }
              case 'SWITCH_LANG':
                return value
            }

            return value
          },
        },

        view() {
          return {
            update(view) {
              const state = codeBlockPluginKey.getState(view.state)
              if (state) {
                ext.ee.emit('update', state)
              }
            },
          }
        },
      }),
    ]
  }

  getBubbleMenuConfig({
    state,
  }: {
    state: EditorState
  }): BubbleMenuConfig | undefined {
    const pluginState = codeBlockPluginKey.getState(state)
    if (
      typeof pluginState?.activeNodePos === 'number' &&
      pluginState?.isSelectLang
    ) {
      const pos = pluginState.activeNodePos

      console.log('extension code block', pos)

      return {
        items: [
          {
            type: 'custom',
            render: () => <LanguageSelect key="languageSelect" />,
          },
        ],
        getDomRef: ({ view }) => {
          const el = findDomAtPos(pos, view)
          console.log(
            'block get dom ref',
            (el as HTMLElement).querySelector('.lang-indicator'),
          )
          return (el as HTMLElement).querySelector('.lang-indicator')!
        },
        placement: {
          vertical: 'bottom',
          horizontal: 'end',
        },
        offset: {
          x: 0,
          y: 8,
        },
      }
    }
  }

  createNodeView(): CreateNodeView {
    return (node, view, getPos) => new CodeBlockView(node, view, getPos)
  }
}
