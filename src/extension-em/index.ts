import { CommandReturn } from '@/core/command-manager'
import { Extension, ExtensionMark } from '@/core/extension'
import { markInputRule } from '@/core/plugins/inputrules'
import { toggleMark } from 'prosemirror-commands'

declare global {
  namespace XEditor {
    interface AllCommands {
      toggleItalic: () => CommandReturn
    }
  }
}

export class EmExtension extends Extension {
  name = 'em'

  marks(): ExtensionMark[] {
    return [
      {
        name: 'em',
        markSpec: {
          parseDOM: [
            { tag: 'i' },
            { tag: 'em' },
            { style: 'font-style=italic' },
          ],
          toDOM() {
            return ['em', 0]
          },
        },
      },
    ]
  }

  addInputRules() {
    return [
      markInputRule(/(?:^|[^*])(\*([^*]+)\*)$/, this.editor.schema.marks.em),
    ]
  }

  addCommands() {
    return {
      toggleItalic: () => {
        return this.editor.command.toggleMark(this.editor.schema.marks.em)
      },
    }
  }

  addKeyBindings() {
    return {
      'Mod-i': toggleMark(this.editor.schema.marks.em),
      'Mod-I': toggleMark(this.editor.schema.marks.em),
    }
  }
}
