import { CommandReturn } from '@/core/command-manager'
import { Extension, ExtensionMark } from '@/core/extension'
import { TextSelection } from 'prosemirror-state'
import './index.css'

declare global {
  namespace XEditor {
    interface AllCommands {
      setFontColor: (color: string) => CommandReturn
    }
  }
}

/**
 * 提供给文本自定义颜色的扩展
 */
export class ColorExtension extends Extension {
  name = 'text_color'

  marks(): ExtensionMark[] {
    return [
      {
        name: 'text_color',
        markSpec: {
          attrs: { color: {} },
          inclusive: true,
          group: 'color',
          parseDOM: [
            {
              style: 'color',
              getAttrs: (v) => {
                // TODO: get attrs
                const value = v as string
                return { color: value }
              },
            },
          ],
          toDOM(mark) {
            return [
              'span',
              {
                class: 'text-color',
                style: `color: ${mark.attrs.color}`,
              },
              0,
            ]
          },
        },
      },
    ]
  }

  addCommands() {
    return {
      setFontColor: (color: string): CommandReturn => {
        return ({ state, tr, dispatch, view }) => {
          if (tr.selection instanceof TextSelection && !tr.selection.empty) {
            tr.addMark(
              tr.selection.from,
              tr.selection.to,
              this.editor.schema.marks.text_color.create({
                color,
              }),
            )
            dispatch?.(tr)
            return true
          }
          return false
        }
      },
    }
  }
}
