import { Command, CommandReturn } from '@/core/command-manager'
import { Extension, ExtensionNode } from '@/core/extension'
import { ShortcutGuide } from '@/extension-shortcut-overview'
import { textblockTypeInputRule } from 'prosemirror-inputrules'
import './styles/index.css'

declare global {
  namespace XEditor {
    interface AllCommands {
      setHeading: (options: HeadingCommandOptions) => CommandReturn
    }
  }
}

type HeadingCommandOptions = { level: number }

export class HeadingExtension extends Extension {
  name = 'heading'

  nodes(): ExtensionNode[] {
    return [
      {
        name: 'heading',
        nodeSpec: {
          attrs: { level: { default: 1 } },
          content: 'inline*',
          group: 'block',
          defining: true,
          parseDOM: [
            { tag: 'h1', attrs: { level: 1 } },
            { tag: 'h2', attrs: { level: 2 } },
            { tag: 'h3', attrs: { level: 3 } },
            { tag: 'h4', attrs: { level: 4 } },
            { tag: 'h5', attrs: { level: 5 } },
            { tag: 'h6', attrs: { level: 6 } },
          ],
          toDOM(node) {
            return ['h' + node.attrs.level, 0]
          },
        },
      },
    ]
  }

  addCommands() {
    this.addCommandMeta('setHeading', {
      icon: ({ level }: HeadingCommandOptions) => `h-${level}`,
      markdown: ({ level }: HeadingCommandOptions) => '#'.repeat(level),
      name: ({ level }: HeadingCommandOptions) => `标题${level}`,
      shortcut: ({ level }: HeadingCommandOptions) => [
        'command',
        'shift',
        `${level}`,
      ],
    })

    return {
      setHeading: ({ level }: HeadingCommandOptions) => {
        return this.editor.command.setBlockType(
          this.editor.schema.nodes.heading,
          {
            level,
          },
        )
      },
    }
  }

  addKeybindings() {
    const bindings: Record<string, () => CommandReturn> = {}
    for (let i = 0; i <= 6; i++) {
      bindings[`Mod-Shift-${i}`] = () =>
        this.editor.command.setHeading({ level: i })
    }
    return bindings
  }

  addInputRules() {
    const maxLevel = 6
    return [
      textblockTypeInputRule(
        new RegExp('^(#{1,' + maxLevel + '})\\s$'),
        this.editor.schema.nodes.heading,
        (match) => ({ level: match[1].length }),
      ),
    ]
  }

  getShortcutGuide(): ShortcutGuide[] {
    return [
      {
        icon: 'h-1',
        name: '标题1',
        markdown: '# 标题1',
        shortcut: ['command', 'shift', '1'],
      },
      {
        icon: 'h-2',
        name: '标题2',
        markdown: '## 标题2',
        shortcut: ['command', 'shift', '2'],
      },
      {
        icon: 'h-3',
        name: '标题3',
        markdown: '### 标题3',
        shortcut: ['command', 'shift', '3'],
      },
      {
        icon: 'h-4',
        name: '标题4',
        markdown: '#### 标题4',
        shortcut: ['command', 'shift', '4'],
      },
    ]
  }
}
