import { Command, CommandReturn } from '@/core/command-manager'
import { Extension } from '@/core/extension'
import { Fragment, NodeRange, NodeType, Slice } from 'prosemirror-model'
import {
  EditorState,
  NodeSelection,
  Selection,
  Transaction,
} from 'prosemirror-state'
import {
  findWrapping,
  liftTarget,
  canSplit,
  ReplaceAroundStep,
} from 'prosemirror-transform'
import * as schemaList from 'prosemirror-schema-list'
import { transformCommand } from '@/core/utils/command'

function _splitListItem(itemType: NodeType) {
  return function (
    state: EditorState,
    dispatch: ((tr: Transaction<any>) => void) | undefined,
  ) {
    // * 会检测 node 是否存在
    // ? 哪些 Selection 会有 node 属性
    let { $from, $to, node } = state.selection as NodeSelection
    if ((node && node.isBlock) || $from.depth < 2 || !$from.sameParent($to))
      return false
    let grandParent = $from.node(-1)
    if (grandParent.type != itemType) return false
    if (
      $from.parent.content.size == 0 &&
      $from.node(-1).childCount == $from.indexAfter(-1)
    ) {
      // In an empty block. If this is a nested list, the wrapping
      // list item should be split. Otherwise, bail out and let next
      // command handle lifting.
      if (
        $from.depth == 2 ||
        $from.node(-3).type != itemType ||
        $from.index(-2) != $from.node(-2).childCount - 1
      )
        return false
      if (dispatch) {
        let wrap = Fragment.empty
        let depthBefore = $from.index(-1) ? 1 : $from.index(-2) ? 2 : 3
        // Build a fragment containing empty versions of the structure
        // from the outer list item to the parent node of the cursor
        for (let d = $from.depth - depthBefore; d >= $from.depth - 3; d--)
          wrap = Fragment.from($from.node(d).copy(wrap))
        let depthAfter =
          $from.indexAfter(-1) < $from.node(-2).childCount
            ? 1
            : $from.indexAfter(-2) < $from.node(-3).childCount
            ? 2
            : 3
        // Add a second list item with an empty default start node
        wrap = wrap.append(Fragment.from(itemType.createAndFill()!))
        let start = $from.before($from.depth - (depthBefore - 1))
        let tr = state.tr.replace(
          start,
          $from.after(-depthAfter),
          new Slice(wrap, 4 - depthBefore, 0),
        )
        let sel = -1
        tr.doc.nodesBetween(start, tr.doc.content.size, (node, pos) => {
          if (sel > -1) return false
          if (node.isTextblock && node.content.size == 0) sel = pos + 1
        })
        if (sel > -1)
          tr.setSelection(
            (state.selection.constructor as typeof Selection).near(
              tr.doc.resolve(sel),
            ),
          )
        dispatch(tr.scrollIntoView())
      }
      return true
    }
    let nextType =
      $to.pos == $from.end() ? grandParent.contentMatchAt(0).defaultType : null
    let tr = state.tr.delete($from.pos, $to.pos)
    let types = nextType ? [null, { type: nextType }] : undefined
    if (!canSplit(tr.doc, $from.pos, 2, types)) return false
    // * tr.split 的 dts 定义有问题，所以强制 any 一下
    if (dispatch) {
      tr.split($from.pos, 2, types as any)

      // ! 拆分之后 修正一下类型 在原来的位置后面
      tr.setNodeMarkup($from.pos + 2, undefined, {
        checked: false,
      })

      dispatch(tr.scrollIntoView())
    }
    return true
  }
}

const splitListItem = (listType: NodeType) => {
  return transformCommand(_splitListItem(listType))
}

// TODO: what does this mean
function isCompatibleContent(one: NodeType, antoher: NodeType): boolean {
  const isCompatible = (one as any).compatibleContent(antoher)
  return isCompatible
}

// joinBefore 合并到前一个 list item 里面
function doWrapInList(
  tr: Transaction,
  range: NodeRange,
  wrappers: NonNullable<ReturnType<typeof findWrapping>>,
  joinBefore: boolean,
  listType: NodeType,
) {
  let content = Fragment.empty
  for (let i = wrappers.length - 1; i >= 0; i--) {
    content = Fragment.from(wrappers[i].type.create(wrappers[i].attrs, content))
  }
  tr.step(
    new ReplaceAroundStep(
      range.start - (joinBefore ? 2 : 0),
      range.end,
      range.start,
      range.end,
      new Slice(content, 0, 0),
      wrappers.length,
      true,
    ),
  )

  // 阅读到这里
  let found = 0
  for (let i = 0; i < wrappers.length; i++) {
    if (wrappers[i].type === listType) {
      found = i + 1
    }
  }
  // [todo_list todo_item]
  let splitDepth = wrappers.length - found
  let splitPos = range.start + wrappers.length - (joinBefore ? 2 : 0),
    parent = range.parent
  for (
    let i = range.startIndex, e = range.endIndex, first = true;
    i < e;
    i++, first = false
  ) {
    if (!first && canSplit(tr.doc, splitPos, splitDepth)) {
      tr.split(splitPos, splitDepth)
      // split 后，嵌套层级增加
      splitPos += 2 * splitDepth
    }
    splitPos += parent.child(i).nodeSize
  }
  return tr
}

interface WrapInListOptions {
  type: NodeType | string
  attrs: any
}

export class ListCommonExtension extends Extension {
  addKeybindings() {
    return {
      Enter: () => this.editor.command.splitListItem(),
    }
  }

  addCommands(): Record<string, Command> {
    this.addCommandMeta('wrapInList', {
      icon: ({ type }: WrapInListOptions) => {
        switch (type) {
          case 'todo_list':
            return 'list-check'
          case 'ol':
            return 'list-ordered'
          case 'ul':
            return 'list-unordered'
          default:
            return 'question-line'
        }
      },
      markdown: ({ type }: WrapInListOptions) => {
        switch (type) {
          case 'todo_list':
            return ''
          case 'ol':
            return '1. 任意内容'
          case 'ul':
            return '- 任意内容'
          default:
            return '未知'
        }
      },
      name: ({ type }: WrapInListOptions) => {
        switch (type) {
          case 'todo_list':
            return '任务列表'
          case 'ol':
            return '有序列表'
          case 'ul':
            return '无序列表'
          default:
            return '未知'
        }
      },
      shortcut: ({ type }: WrapInListOptions) => [],
    })

    return {
      wrapInList: ({ type: _type, attrs }: WrapInListOptions) => {
        return ({ tr, state, dispatch, view }) => {
          const type =
            typeof _type === 'string' ? this.editor.schema.nodes[_type] : _type

          const { $from, $to } = tr.selection

          // block range parent 是 包裹了 $to 和 $from 的共同祖先
          let range = $from.blockRange($to),
            doJoin = false,
            outerRange = range

          if (!range) {
            return false
          }

          // range.dpeth >= 2 选区是在todo_item->paragraph下面，或者嵌套更深层次
          // isCompatibleContent 我暂时理解是同一个类型
          // startIndex 选区父节点的第几个 必须是第0个，才能进入深层次嵌套
          if (
            range.depth >= 2 &&
            isCompatibleContent($from.node(range.depth - 1).type, type) &&
            range.startIndex === 0
          ) {
            // 看是不是父级 list 下的第一个子元素，如果是的话，不能进入下一层级
            if ($from.index(range.depth - 1) === 0) return false
            // 取到前一个 list item 的位置
            const $insert = state.doc.resolve(range.start - 2)

            outerRange = new NodeRange($insert, $insert, range.depth)
            if (range.endIndex < range.parent.childCount) {
              range = new NodeRange(
                $from,
                state.doc.resolve($to.end(range.depth)),
                range.depth,
              )
            }
            doJoin = true
          }
          if (!range || !outerRange) return false

          const wrap = findWrapping(outerRange, type, attrs, range)

          if (!wrap) return false

          if (dispatch) {
            dispatch(
              doWrapInList(tr, range, wrap, doJoin, type).scrollIntoView(),
            )
          }

          return true
        }
      },
      splitListItem: () => {
        return splitListItem(this.editor.schema.nodes.todo_item)
      },
    }
  }
}

declare global {
  namespace XEditor {
    interface AllCommands {
      wrapInList: (options: WrapInListOptions) => CommandReturn
      splitListItem: () => CommandReturn
    }
  }
}
