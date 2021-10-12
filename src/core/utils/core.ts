import { Mark } from 'prosemirror-model'
import { EditorState } from 'prosemirror-state'

interface IsMarkActiveParams {
  state: EditorState
  markType: Mark | string
}

export function isMarkActive({
  state,
  markType: _markType,
}: IsMarkActiveParams) {
  const markType: Mark =
    typeof _markType === 'string' ? state.schema.marks[_markType] : _markType
  if (state.selection.empty) {
    return markType.isInSet(state.selection.$from.marks())
  }

  return state.doc.rangeHasMark(
    state.selection.from,
    state.selection.to,
    markType,
  )
}
