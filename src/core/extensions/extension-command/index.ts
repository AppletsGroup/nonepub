import { CommandReturn } from '@/core/command-manager'
import { Extension } from '@/core/extension'
import {
  wrapIn,
  toggleMark,
  joinDown,
  joinUp,
  lift,
  redo,
  selectParentNode,
  transformCommand,
  undo,
  undoInputRule,
  setBlockType,
} from '@/core/utils/command'
import { Fragment, Node } from 'prosemirror-model'

declare global {
  namespace XEditor {
    interface AllCommands {
      wrapIn: typeof wrapIn
      toggleMark: typeof toggleMark
      joinDown: typeof joinDown
      joinUp: typeof joinUp
      lift: typeof lift
      redo: typeof redo
      selectParentNode: typeof selectParentNode
      transformCommand: typeof transformCommand
      undo: typeof undo
      undoInputRule: typeof undoInputRule
      setBlockType: typeof setBlockType
      replaceWith: (
        from: number,
        to: number,
        node: Node | Fragment | Node[],
      ) => CommandReturn
      focus: () => CommandReturn
    }
  }
}

export class CommandExtension extends Extension {
  addCommands() {
    return {
      wrapIn,
      toggleMark,
      joinDown,
      joinUp,
      lift,
      redo,
      selectParentNode,
      transformCommand,
      undo,
      undoInputRule,
      setBlockType,
      replaceWith: (
        from: number,
        to: number,
        node: Node | Fragment | Node[],
      ): CommandReturn => {
        return ({ tr, dispatch }) => {
          if (dispatch) {
            tr.replaceWith(from, to, node)
            return true
          }
          return true
        }
      },
      focus: (): CommandReturn => {
        return ({ view, dispatch }) => {
          if (view && dispatch) {
            view.focus()
          }
          return true
        }
      },
    }
  }
}
