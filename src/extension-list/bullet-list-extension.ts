import { CommandReturn } from '@/core/command-manager'
import { Extension, ExtensionNode } from '@/core/extension'
import { ShortcutGuide } from '@/extension-shortcut-overview'
import { InputRule, wrappingInputRule } from 'prosemirror-inputrules'

const BULLET_LIST: 'bullet_list' = 'bullet_list'

export class BulletListExtension extends Extension {
  name = BULLET_LIST

  nodes(): ExtensionNode[] {
    return [
      {
        name: BULLET_LIST,
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

  addKeybindings(): Record<string, () => CommandReturn> {
    return {
      'Mod-Shift-8': () =>
        this.editor.command.wrapInList({ type: BULLET_LIST, attrs: {} }),
    }
  }

  addInputRules(): InputRule[] {
    return [
      wrappingInputRule(
        /^\s*([-+*])\s$/,
        this.editor.schema.nodes[BULLET_LIST],
      ),
    ]
  }
}
