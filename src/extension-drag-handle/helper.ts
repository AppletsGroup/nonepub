import { TextSelection } from 'prosemirror-state'
import { EditorView } from 'prosemirror-view'

export function getTargetRect(
  view: EditorView,
  node: HTMLElement,
  pos: number,
) {
  const selection = TextSelection.create(view.state.doc, pos)
  const coords = view.coordsAtPos(selection.from)
  const rect = node.getBoundingClientRect()
  const target = {
    x: rect.x,
    y: coords.top,
    width: 1,
    height: coords.bottom - coords.top,
  }

  return target
}
