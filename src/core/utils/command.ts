import { CommandReturn } from '@/core/command-manager'
import {
  wrapIn as pmWrapIn,
  toggleMark as pmToggleMark,
  joinDown as pmJoinDown,
  joinUp as pmJoinUp,
  lift as pmLift,
  selectParentNode as pmSelectParentNode,
  setBlockType as pmSetBlockType,
} from 'prosemirror-commands'
import { redo as pmRedo, undo as pmUndo } from 'prosemirror-history'
import { undoInputRule as pmUndoInputRule } from 'prosemirror-inputrules'
import { MarkType, NodeType, Schema } from 'prosemirror-model'
import { EditorState, Transaction } from 'prosemirror-state'
import { Command as PMCommand } from '../types'

function getChainableState({
  tr,
  state,
}: {
  tr: Transaction
  state: EditorState
}): EditorState {
  return {
    ...state,
    get doc() {
      return tr.doc
    },
    get tr() {
      return tr
    },
    get selection() {
      return tr.selection
    },
    get storedMarks() {
      return tr.storedMarks
    },
    get schema() {
      return state.schema
    },
    plugins: state.plugins,
    apply: state.apply.bind(state),
    applyTransaction: state.applyTransaction.bind(state),
    reconfigure: state.reconfigure.bind(state),
    toJSON: state.toJSON.bind(state),
  }
}

export function transformCommand(originalCommand: PMCommand) {
  const transformed: CommandReturn = ({ tr, state, dispatch, view }) => {
    return originalCommand(getChainableState({ tr, state }), dispatch, view)
  }

  return transformed
}

export function wrapIn<S extends Schema = any>(
  nodeType: NodeType<S>,
  attrs?: { [key: string]: any },
) {
  return transformCommand(pmWrapIn(nodeType, attrs))
}

export function toggleMark<S extends Schema = any>(
  markType: MarkType<S>,
  attrs?: { [key: string]: any },
) {
  return transformCommand(pmToggleMark(markType, attrs))
}

export function undo() {
  return transformCommand(pmUndo)
}

export function redo() {
  return transformCommand(pmRedo)
}

export function undoInputRule() {
  return transformCommand(pmUndoInputRule)
}

export function joinDown() {
  return transformCommand(pmJoinDown)
}

export function joinUp() {
  return transformCommand(pmJoinUp)
}

export function lift() {
  return transformCommand(pmLift)
}

export function selectParentNode() {
  return transformCommand(pmSelectParentNode)
}

export function setBlockType<S extends Schema = any>(
  nodeType: NodeType<S>,
  attrs?: { [key: string]: any },
) {
  return transformCommand(pmSetBlockType(nodeType, attrs))
}
