import { Extension, ExtensionMark } from '@/core/extension'
import { markInputRule } from '@/core/plugins/inputrules'
import { toggleMark } from 'prosemirror-commands'
import './styles/index.css'

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

  addKeybindings() {
    return {
      'Mod-`': () => {
        return this.editor.command.toggleMark(this.editor.schema.marks.code)
      },
    }
  }
}
