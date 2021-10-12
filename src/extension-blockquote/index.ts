import { CommandReturn } from '@/core/command-manager'
import { Extension } from '@/core/extension'
import { InputRule, wrappingInputRule } from 'prosemirror-inputrules'
import { DOMOutputSpec } from 'prosemirror-model'

declare global {
  namespace XEditor {
    interface AllCommands {
      toggleBlockquote: () => CommandReturn
    }
  }
}

const blockquoteDOM: DOMOutputSpec = ['blockquote', 0]

export class BlockquoteExtension extends Extension {
  name = 'blockquote'

  nodes() {
    return [
      {
        name: 'blockquote',
        nodeSpec: {
          content: 'block+',
          group: 'block',
          defining: true,
          parseDOM: [{ tag: 'blockquote' }],
          toDOM() {
            return blockquoteDOM
          },
        },
      },
    ]
  }

  addInputRules(): InputRule[] {
    return [wrappingInputRule(/^\s*>\s$/, this.editor.schema.nodes.blockquote)]
  }

  addKeybindings() {
    return {
      'Ctrl->': () => this.editor.command.toggleBlockquote(),
    }
  }

  addCommands() {
    this.addCommandMeta('toggleBlockquote', {
      icon: 'double-quotes-l',
      name: '引用',
      markdown: '> 引用',
      shortcut: ['command', 'shift', '.'],
    })

    return {
      toggleBlockquote: () => {
        return this.editor.command.wrapIn(this.editor.schema.nodes.blockquote)
      },
    }
  }
}
