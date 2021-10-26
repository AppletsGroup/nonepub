import { CommandReturn } from '@/core/command-manager'
import { Extension } from '@/core/extension'
import { ShortcutGuide } from '@/extension-shortcut-overview'
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
      'Mod-Shift-9': () => this.editor.command.toggleBlockquote(),
    }
  }

  getShortcutGuide(): ShortcutGuide[] {
    return [
      {
        icon: 'double-quotes-l',
        name: '引用',
        markdown: '> 引用',
        shortcut: ['command', 'shift', '9'],
      },
    ]
  }

  addCommands() {
    this.addCommandMeta('toggleBlockquote', {
      icon: 'double-quotes-l',
      name: '引用',
      markdown: '> 引用',
      shortcut: ['command', 'shift', '9'],
    })

    return {
      toggleBlockquote: () => {
        return this.editor.command.wrapIn(this.editor.schema.nodes.blockquote)
      },
    }
  }
}
