import { Selection } from 'prosemirror-state'
import { EditorView } from 'prosemirror-view'

export function selectionToRect(
  view: EditorView,
  selection: Selection,
): DOMRect {
  const { from, to } = selection
  const start = view.coordsAtPos(from)
  const end = view.coordsAtPos(to)
  const top = Math.min(start.top, end.top)
  const bottom = Math.max(start.bottom, end.bottom)
  const left = Math.min(start.left, end.left)
  const right = Math.max(start.right, end.right)
  const rect = {
    top,
    left,
    bottom,
    right,
    height: bottom - top,
    width: right - left,
    x: left,
    y: top,
  }

  return {
    ...rect,
    toJSON: () => rect,
  }
}
