import { Extension } from '@/core/extension'
import { getLastNode } from '@/core/utils/node'
import { setBlockType } from 'prosemirror-commands'
import { NodeSpec } from 'prosemirror-model'
import { EditorState, Plugin, PluginKey } from 'prosemirror-state'
import './styles/index.css'

interface PreserveNewlineState {
  shouldInsert: boolean
}

const preserveNewlinePluginKey = new PluginKey<PreserveNewlineState>(
  'preserveNewlinePlugin',
)

const PARAGRAPH: 'paragraph' = 'paragraph'

export class ParagraphExtension extends Extension {
  name = PARAGRAPH

  nodes(): { name: string; nodeSpec: NodeSpec }[] {
    return [
      {
        name: PARAGRAPH,
        nodeSpec: {
          content: 'inline*',
          group: 'block',
          parseDOM: [{ tag: 'p' }],
          toDOM() {
            return ['p', 0]
          },
        },
      },
    ]
  }

  addKeyBindings() {
    return {
      'Shift-Ctrl-0': setBlockType(this.editor.schema.nodes.paragraph),
    }
  }

  addPMPlugins() {
    const ctx = this

    function produceState(editorState: EditorState): PreserveNewlineState {
      const lastNode = getLastNode(editorState.doc)
      if (lastNode.node.type.name === PARAGRAPH) {
        return {
          shouldInsert: false,
        }
      }
      return {
        shouldInsert: true,
      }
    }

    return [
      new Plugin({
        key: preserveNewlinePluginKey,
        state: {
          init(_, state) {
            return produceState(state)
          },
          apply(tr, value, oldState, newState) {
            return produceState(newState)
          },
        },
        view() {
          return {
            update: (view) => {
              const pluginState = preserveNewlinePluginKey.getState(view.state)
              if (pluginState?.shouldInsert) {
                view.dispatch(
                  view.state.tr.insert(
                    view.state.tr.doc.content.size,
                    ctx.editor.schema.nodes[PARAGRAPH].create(),
                  ),
                )
              }
            },
          }
        },
      }),
    ]
  }
}
