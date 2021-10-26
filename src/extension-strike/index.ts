import { CommandReturn } from '@/core/command-manager'
import { Extension, ExtensionMark } from '@/core/extension'
import { ShortcutGuide } from '@/extension-shortcut-overview'

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
    return {
      toggleStrike: () => {
        return this.editor.command.toggleMark(this.editor.schema.marks.strike)
      },
    }
  }

  addKeybindings() {
    return {
      'Mod-Shift-s': () => this.editor.command.toggleStrike(),
      'Mod-Shift-S': () => this.editor.command.toggleStrike(),
    }
  }

  getShortcutGuide(): ShortcutGuide[] {
    return [
      {
        icon: 'strikethrough',
        name: '删除线',
        markdown: '',
        shortcut: ['command', 'shift', 'S'],
      },
    ]
  }
}
