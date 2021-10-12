import { Extension } from '@/core/extension'
import { Plugin, PluginKey } from 'prosemirror-state'
import { Decoration, DecorationSet } from 'prosemirror-view'

const placeholderPluginKey = new PluginKey('placeholder')

export class PlaceholderExtension extends Extension {
  name = 'placeholder'

  addPMPlugins() {
    return [
      new Plugin({
        key: placeholderPluginKey,
        props: {
          decorations: (state) => {
            const decorations: Decoration[] = []

            if (state.selection && state.selection.empty) {
              const parent = state.selection.$from.node()
              const pos = state.selection.$from.before()
              if (parent.type.isBlock && parent.childCount === 0) {
                decorations.push(
                  Decoration.node(pos, pos + parent.nodeSize, {
                    class: 'empty-node',
                  }),
                )
              }
            }

            return DecorationSet.create(state.doc, decorations)
          },
        },
      }),
    ]
  }
}
