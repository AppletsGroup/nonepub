import { Extension, ExtensionNode } from '@/core/extension'
import { InputRule, wrappingInputRule } from 'prosemirror-inputrules'

export class OrderedListExtension extends Extension {
  nodes(): ExtensionNode[] {
    return [
      {
        name: 'ordered_list',
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

  addInputRules(): InputRule[] {
    return [
      wrappingInputRule(
        /^(\d+)\.\s$/,
        this.editor.schema.nodes.ordered_list,
        (match) => ({ order: Number(match[1]) }),
        (match, node) =>
          node.childCount + node.attrs.order === Number(match[1]),
      ),
    ]
  }
}
