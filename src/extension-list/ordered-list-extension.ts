import { CommandReturn } from '@/core/command-manager'
import { Extension, ExtensionNode } from '@/core/extension'
import { InputRule, wrappingInputRule } from 'prosemirror-inputrules'

const ORDERD_LIST: 'ordered_list' = 'ordered_list'

export class OrderedListExtension extends Extension {
  name = ORDERD_LIST

  nodes(): ExtensionNode[] {
    return [
      {
        name: ORDERD_LIST,
        nodeSpec: {
          group: 'block',
          content: 'list_item+',
          attrs: { order: { default: 1 } },
          parseDOM: [
            {
              tag: 'ol',
              getAttrs(dom) {
                return {
                  order: (dom as Element).hasAttribute('start')
                    ? Number((dom as Element).getAttribute('start'))
                    : 1,
                }
              },
            },
          ],
          toDOM(node) {
            return node.attrs.order == 1
              ? ['ol', 0]
              : ['ol', { start: node.attrs.order }, 0]
          },
        },
      },
    ]
  }

  addKeybindings(): Record<string, () => CommandReturn> {
    return {
      'Mod-Shift-7': () =>
        this.editor.command.wrapInList({ type: ORDERD_LIST, attrs: {} }),
    }
  }

  addInputRules(): InputRule[] {
    return [
      wrappingInputRule(
        /^(\d+)\.\s$/,
        this.editor.schema.nodes[ORDERD_LIST],
        (match) => ({ order: Number(match[1]) }),
        (match, node) =>
          node.childCount + node.attrs.order === Number(match[1]),
      ),
    ]
  }
}
