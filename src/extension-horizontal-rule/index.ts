import { Command, CommandReturn } from '@/core/command-manager'
import { Extension, ExtensionNode, PMKeyBindingFn } from '@/core/extension'
import { ShortcutGuide } from '@/extension-shortcut-overview'
import { DOMOutputSpec } from 'prosemirror-model'

const HORIZONTAL_RULE: 'horizontal_rule' = 'horizontal_rule'

const hrDOM: DOMOutputSpec = ['hr']

declare global {
  namespace XEditor {
    interface AllCommands {
      addHorizontalRule: () => CommandReturn
    }
  }
}

export class HorizontalRuleExtension extends Extension {
  name = HORIZONTAL_RULE

  nodes(): ExtensionNode[] {
    return [
      {
        name: HORIZONTAL_RULE,
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

  addCommands(): Record<string, Command> {
    this.addCommandMeta('addHorizontalRule', {
      icon: 'separator',
      name: '分隔线',
      markdown: '无',
      shortcut: ['command', 'shift', '-'],
    })

    return {
      addHorizontalRule: () => {
        return ({ state, tr, dispatch, view }) => {
          dispatch?.(
            tr
              .replaceSelectionWith(
                this.editor.schema.nodes[HORIZONTAL_RULE].create(),
              )
              .scrollIntoView(),
          )
          return true
        }
      },
    }
  }

  addKeybindings(): Record<string, () => CommandReturn> {
    return {
      'Mod-Shift--': () => this.editor.command.addHorizontalRule(),
    }
  }

  getShortcutGuide(): ShortcutGuide[] {
    return [
      {
        icon: 'separator',
        name: '分隔线',
        markdown: '',
        shortcut: ['command', 'shift', '-'],
      },
    ]
  }
}
