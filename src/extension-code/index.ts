import { CommandReturn } from '@/core/command-manager'
import { Extension, ExtensionMark } from '@/core/extension'
import { markInputRule } from '@/core/plugins/inputrules'
import { ShortcutGuide } from '@/extension-shortcut-overview'
import './styles/index.css'

declare global {
  namespace XEditor {
    interface AllCommands {
      toggleInlineCode: () => CommandReturn
    }
  }
}

export class CodeExtension extends Extension {
  name = 'code'

  constructor() {
    super()
  }

  marks(): ExtensionMark[] {
    return [
      {
        name: 'code',
        markSpec: {
          parseDOM: [{ tag: 'code' }],
          toDOM() {
            return ['code', 0]
          },
        },
      },
    ]
  }

  addInputRules() {
    return [
      markInputRule(/(?:^|[^`])(`([^`]+)`)$/, this.editor.schema.marks.code),
    ]
  }

  addCommands() {
    return {
      toggleInlineCode: () => {
        return this.editor.command.toggleMark(this.editor.schema.marks.code)
      },
    }
  }

  addKeybindings() {
    return {
      'Mod-Shift-m': () => {
        return this.editor.command.toggleMark(this.editor.schema.marks.code)
      },
      'Mod-Shift-M': () => {
        return this.editor.command.toggleMark(this.editor.schema.marks.code)
      },
    }
  }

  getShortcutGuide(): ShortcutGuide[] {
    return [
      {
        name: '行内代码',
        icon: 'code-s-slash-line',
        markdown: '`code`',
        shortcut: ['command', 'shift', 'm'],
      },
    ]
  }
}
