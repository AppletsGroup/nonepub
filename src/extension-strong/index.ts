import { CommandReturn } from '@/core/command-manager'
import { Extension, ExtensionMark } from '@/core/extension'
import { markInputRule } from '@/core/plugins/inputrules'
import { ShortcutGuide } from '@/extension-shortcut-overview'

declare global {
  namespace XEditor {
    interface AllCommands {
      toggleBold: () => CommandReturn
    }
  }
}

export class StrongExtension extends Extension {
  name = 'strong'

  marks(): ExtensionMark[] {
    return [
      {
        name: 'strong',
        markSpec: {
          parseDOM: [
            { tag: 'strong' },
            // This works around a Google Docs misbehavior where
            // pasted content will be inexplicably wrapped in `<b>`
            // tags with a font-weight normal.
            {
              tag: 'b',
              getAttrs: (node) =>
                (node as HTMLElement).style.fontWeight !== 'normal' && null,
            },
            {
              style: 'font-weight',
              getAttrs: (value) =>
                /^(bold(er)?|[5-9]\d{2,})$/.test(value as string) && null,
            },
          ],
          toDOM() {
            return ['strong', 0]
          },
        },
      },
    ]
  }

  addInputRules() {
    return [
      markInputRule(
        /(?:^|[^*])(\*\*([^*]+)\*\*)$/,
        this.editor.schema.marks.strong,
      ),
    ]
  }

  addCommands() {
    this.addCommandMeta('toggleBold', {
      icon: 'bold',
      name: '加粗',
      markdown: '',
      shortcut: [],
    })

    return {
      toggleBold: () => {
        return this.editor.command.toggleMark(this.editor.schema.marks.strong)
      },
    }
  }

  addKeybindings() {
    return {
      'Mod-b': () => this.editor.command.toggleBold(),
      'Mod-B': () => this.editor.command.toggleBold(),
    }
  }

  getShortcutGuide(): ShortcutGuide[] {
    return [
      {
        icon: 'bold',
        name: '加粗',
        markdown: '**加粗**',
        shortcut: ['command', 'shift', 'B'],
      },
    ]
  }
}
