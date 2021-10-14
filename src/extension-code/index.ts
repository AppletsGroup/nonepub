import { CommandReturn } from '@/core/command-manager'
import { Extension, ExtensionMark } from '@/core/extension'
import { markInputRule } from '@/core/plugins/inputrules'
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
}
