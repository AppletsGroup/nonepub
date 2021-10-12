import { Extension } from '@/core/extension'
import { chainCommands, exitCode } from 'prosemirror-commands'
import { DOMOutputSpec } from 'prosemirror-model'

const brDOM: DOMOutputSpec = ['br']

export class HarkBreakExtension extends Extension {
  name = 'hard_break'

  nodes() {
    return [
      {
        name: 'hard_break',
        nodeSpec: {
          inline: true,
          group: 'inline',
          selectable: false,
          parseDOM: [{ tag: 'br' }],
          toDOM() {
            return brDOM
          },
        },
      },
    ]
  }

  addKeyBindings() {
    const cmd = chainCommands(exitCode, (state, dispatch) => {
      dispatch &&
        dispatch(
          state.tr
            .replaceSelectionWith(this.editor.schema.nodes.hard_break.create())
            .scrollIntoView(),
        )
      return true
    })

    return {
      'Mod-Enter': cmd,
      'Shift-Enter': cmd,
    }
  }
}
