import { Node as PMNode, NodeType, ResolvedPos } from 'prosemirror-model'
import { Selection } from 'prosemirror-state'
import { EditorView } from 'prosemirror-view'
import { isString } from './lang'

type FindChildPredicate = (node: PMNode, pos: number, parent: PMNode) => boolean

type FindParentPredicate = (node: PMNode) => boolean

export function findChild(node: PMNode, predicate: FindChildPredicate) {
  let findNode: PMNode | undefined,
    findPos = 0

  node.descendants((node, pos, parent) => {
    const isMatched = predicate(node, pos, parent)
    if (isMatched) {
      findNode = node
      findPos = pos

      return false
    }

    if (findNode) {
      return false
    }

    return true
  })

  return findNode ? { node: findNode, pos: findPos } : undefined
}

export function findChildWithNodeType(
  node: PMNode,
  nodeType: NodeType | string,
) {
  return findChild(node, (node) => {
    if (isString(nodeType)) {
      return node.type.name === nodeType
    }
    return node.type === nodeType
  })
}

export function findParentNode(
  predicate: FindParentPredicate,
  selection: Selection,
) {
  const { $from } = selection
  const depth = $from.depth
  for (let i = depth; i > 0; i--) {
    const node = $from.node(i)
    if (predicate(node)) {
      return {
        node,
      }
    }
  }
}

export function findDomAtPos(pos: number, view: EditorView) {
  const dom = view.domAtPos(pos)
  const node = dom.node.childNodes[dom.offset]

  if (dom.node.nodeType === Node.TEXT_NODE) {
    return dom.node.parentNode
  }

  if (!node || node.nodeType === Node.TEXT_NODE) {
    return dom.node
  }

  return node
}

export function findNodeAtPosition($pos: ResolvedPos) {
  const { depth } = $pos
  const pos = depth > 0 ? $pos.before(depth) : 0
  const node = $pos.node(depth)
  const start = $pos.start(depth)
  const end = pos + node.nodeSize

  return { pos, start, node, end, depth }
}
