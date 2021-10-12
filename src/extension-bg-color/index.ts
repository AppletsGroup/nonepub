import { CommandReturn } from '@/core/command-manager'
import { Extension, ExtensionMark } from '@/core/extension'
import { TextSelection } from 'prosemirror-state'

declare global {
  namespace XEditor {
    interface AllCommands {
      setBackgroundColor: (color: string) => CommandReturn
    }
  }
}

/**
 * 提供给文本自定义背景颜色的扩展
 */
export class BackgroundColorExtension extends Extension {
  name = 'text_background_color'

  marks(): ExtensionMark[] {
    return [
      {
        name: 'text_background_color',
        markSpec: {
          attrs: { backgroundColor: {} },
          inclusive: true,
          group: 'color',
          parseDOM: [
            {
              style: 'background-color',
              getAttrs: (v) => {
                // TODO: get attrs
                const value = v as string
                return { backgroundColor: value }
              },
            },
          ],
          toDOM(mark) {
            return [
              'span',
              {
                style: `background-color: ${mark.attrs.backgroundColor}`,
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
      setBackgroundColor: (color: string): CommandReturn => {
        return ({ state, tr, dispatch, view }) => {
          if (tr.selection instanceof TextSelection && !tr.selection.empty) {
            tr.addMark(
              tr.selection.from,
              tr.selection.to,
              this.editor.schema.marks.text_background_color.create({
                backgroundColor: color,
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
