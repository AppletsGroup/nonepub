import { Extension } from '@/core/extension'
import { setBlockType, wrapIn } from 'prosemirror-commands'
import { InputRule, wrappingInputRule } from 'prosemirror-inputrules'
import { DOMOutputSpec, NodeSpec } from 'prosemirror-model'
import './styles/index.css'

export class ParagraphExtension extends Extension {
  name = 'paragraph'

  nodes(): { name: string; nodeSpec: NodeSpec }[] {
    return [
      {
        name: 'paragraph',
        nodeSpec: {
          content: 'inline*',
          group: 'block',
          parseDOM: [{ tag: 'p' }],
          toDOM() {
            return ['p', 0]
          },
        },
      },
    ]
  }

  addKeyBindings() {
    return {
      'Shift-Ctrl-0': setBlockType(this.editor.schema.nodes.paragraph),
    }
  }
}
