import { Mark, NodeType } from 'prosemirror-model'
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
    if (state.storedMarks) {
      return markType.isInSet(state.storedMarks)
    }

    return markType.isInSet(state.selection.$from.marks())
  }

  return state.doc.rangeHasMark(
    state.selection.from,
    state.selection.to,
    markType,
  )
}

interface IsNodeActiveParams {
  state: EditorState
  nodeType: string
  matchAttrs?: any
}

// a rough implementation
export function isNodeActive({
  state,
  nodeType,
  matchAttrs,
}: IsNodeActiveParams) {
  const type: NodeType = state.schema.nodes[nodeType]
  if (state.selection.empty) {
    let match = state.selection.$from.node().type === type
    if (match && matchAttrs) {
      match = Object.entries(matchAttrs).every(([k, v]) => {
        return state.selection.$from.node().attrs[k] === v
      })
    }
    return match
  }

  return false
}
