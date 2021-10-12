import { Extension, ExtensionNode, PMKeyBindingFn } from '@/core/extension'
import { DOMOutputSpec } from 'prosemirror-model'

const hrDOM: DOMOutputSpec = ['hr']

export class HorizontalRuleExtension extends Extension {
  name = 'horizontal_rule'

  nodes(): ExtensionNode[] {
    return [
      {
        name: 'horizontal_rule',
        nodeSpec: {
          group: 'block',
          parseDOM: [{ tag: 'hr' }],
          toDOM() {
            return hrDOM
          },
        },
      },
    ]
  }

  addKeyBindings(): Record<string, PMKeyBindingFn> {
    return {
      'Mod-_': (state, dispatch) => {
        dispatch &&
          dispatch(
            state.tr
              .replaceSelectionWith(
                this.editor.schema.nodes.horizontal_rule.create(),
              )
              .scrollIntoView(),
          )
        return true
      },
    }
  }
}
