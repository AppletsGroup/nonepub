import { CommandReturn } from '@/core/command-manager'
import { Extension, ExtensionMark } from '@/core/extension'
import { markInputRule } from '@/core/plugins/inputrules'

declare global {
  namespace XEditor {
    interface AllCommands {
      toggleStrike: () => CommandReturn
    }
  }
}

export class StrikeExtension extends Extension {
  name = 'strike'

  marks(): ExtensionMark[] {
    return [
      {
        name: 'strike',
        markSpec: {
          parseDOM: [
            { tag: 'strike' },
            { tag: 's' },
            { tag: 'del' },
            {
              style: 'text-decoration',
              getAttrs: (value) => value === 'line-through' && null,
            },
          ],
          toDOM() {
            return ['s', 0]
          },
        },
      },
    ]
  }

  addCommands() {
    // this.addCommandMeta('toggleBold', {
    //   icon: 'bold',
    //   name: '加粗',
    //   markdown: '',
    //   shortcut: [],
    // })

    return {
      toggleStrike: () => {
        return this.editor.command.toggleMark(this.editor.schema.marks.strike)
      },
    }
  }

  addKeybindings() {
    return {
      'Shift-Mod-s': () => this.editor.command.toggleStrike(),
      'Shift-Mod-S': () => this.editor.command.toggleStrike(),
    }
  }
}
