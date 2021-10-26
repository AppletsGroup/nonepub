import { CommandReturn } from '@/core/command-manager'
import { Extension, ExtensionMark } from '@/core/extension'
import { markInputRule } from '@/core/plugins/inputrules'
import { ShortcutGuide } from '@/extension-shortcut-overview'

declare global {
  namespace XEditor {
    interface AllCommands {
      toggleUnderline: () => CommandReturn
    }
  }
}

export class UnderlineExtension extends Extension {
  name = 'underline'

  marks(): ExtensionMark[] {
    return [
      {
        name: 'underline',
        markSpec: {
          parseDOM: [
            { tag: 'u' },
            {
              style: 'text-decoration',
              getAttrs: (value) => value === 'underline' && null,
            },
          ],
          toDOM() {
            return ['u', 0]
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
      toggleUnderline: () => {
        return this.editor.command.toggleMark(
          this.editor.schema.marks.underline,
        )
      },
    }
  }

  addKeybindings() {
    return {
      'Mod-u': () => this.editor.command.toggleUnderline(),
      'Mod-U': () => this.editor.command.toggleUnderline(),
    }
  }

  getShortcutGuide(): ShortcutGuide[] {
    return [
      {
        icon: 'underline',
        name: '下划线',
        markdown: '',
        shortcut: ['command', 'shift', 'U'],
      },
    ]
  }
}
