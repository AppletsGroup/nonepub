import { Extension, ExtensionNode } from '@/core/extension'
import { InputRule, wrappingInputRule } from 'prosemirror-inputrules'

export class BulletListExtension extends Extension {
  nodes(): ExtensionNode[] {
    return [
      {
        name: 'bullet_list',
        nodeSpec: {
          parseDOM: [{ tag: 'ul' }],
          toDOM() {
            return ['ul', 0]
          },
          group: 'block',
          content: 'list_item+',
        },
      },
    ]
  }

  addInputRules(): InputRule[] {
    return [
      wrappingInputRule(/^\s*([-+*])\s$/, this.editor.schema.nodes.bullet_list),
    ]
  }
}
