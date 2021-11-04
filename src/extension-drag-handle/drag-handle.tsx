import { useEditorContext } from '@/react/hooks/use-editor-context'
import Icon from '@/react/ui/icon'
import { DragEvent, MouseEvent, useEffect, useRef, useState } from 'react'
import { useDragHandle } from './use-drag-handle'
import { calculatePosition } from '@/core/utils/position'
import { INVISIBLE_RECT } from '@/extension-locator'
import { NodeSelection, TextSelection } from 'prosemirror-state'
import { DragHandleAction, setMeta } from '.'
import { DOMSerializer } from 'prosemirror-model'

export function DragHandle() {
  const { editor } = useEditorContext()
  const { activeNode } = useDragHandle()
  const circleClass = 'rounded-full h-4 w-4 bg-gray-400'

  const style = {
    width: 6,
    height: 6,
    borderRadius: 6,
    backgroundColor: 'gray',
  }

  const handleShowBlockMenu = () => {
    editor.editorView.dispatch(
      setMeta(editor.editorView.state.tr, {
        type: DragHandleAction.ShowContextMenu,
      }),
    )
  }

  const handleOnMouseDown = (e: MouseEvent<HTMLDivElement>) => {
    if (activeNode) {
      editor.editorView.dispatch(
        editor.editorView.state.tr.setSelection(
          NodeSelection.create(editor.editorView.state.doc, activeNode.pos),
        ),
      )
    }
  }

  const handleDragStart = (e: DragEvent<HTMLDivElement>) => {
    if (activeNode) {
      const dom = DOMSerializer.fromSchema(
        editor.editorView.state.doc.type.schema,
      ).serializeNode(editor.editorView.state.doc.nodeAt(activeNode.pos)!)
      e.dataTransfer.clearData()
      e.dataTransfer.setData('text/html', (dom as HTMLElement).outerHTML)
      e.dataTransfer.setDragImage(activeNode.node as Element, 0, 0)
      // https://github.com/ProseMirror/prosemirror-view/blob/c7ddda91219a6c81449d3cc8f704edd8a33123c2/src/input.js#L603
      editor.editorView.dragging = {
        slice: editor.editorView.state.selection.content(),
        move: true,
      }
    }
  }

  const elRef = useRef<HTMLDivElement | null>(null)
  const [position, setPosition] = useState<{ x: number; y: number }>({
    x: -99990,
    y: -99990,
  })

  useEffect(() => {
    if (
      activeNode?.node &&
      elRef.current &&
      activeNode.node instanceof HTMLElement
    ) {
      // TODO: 检查安全性
      let node = editor.editorView.state.doc.nodeAt(activeNode.pos)

      if (!node) {
      } else {
        let depth = 0
        while (node.firstChild) {
          depth++
          node = node.firstChild
        }
        if (!node.isText) {
          return
        }

        const selection = TextSelection.create(
          editor.editorView.state.doc,
          activeNode.pos + depth,
        )

        const coords = editor.editorView.coordsAtPos(selection.from)
        const rect = activeNode.node.getBoundingClientRect()
        const target = {
          x: rect.x,
          y: coords.top,
          width: 1,
          height: coords.bottom - coords.top,
        }
        const popup = elRef.current.getBoundingClientRect()
        const position = calculatePosition({
          container:
            elRef.current.offsetParent?.getBoundingClientRect() ??
            INVISIBLE_RECT,
          popup,
          target,
          allowOutsideBoundary: true,
          offset: {
            x: 8,
            y: 0,
          },
          placement: {
            vertical: 'center',
            horizontal: 'left',
          },
        })
        setPosition(position)
      }
    } else {
      setPosition({
        x: -99990,
        y: -99990,
      })
    }
  }, [activeNode?.node, editor])

  return (
    <div
      className="w-4 h-4 flex justify-center items-center rounded-sm cursor-pointer hover:bg-gray-200"
      ref={elRef}
      style={{
        position: 'absolute',
        left: position.x,
        top: position.y,
      }}
      onMouseDown={handleOnMouseDown}
      onDragStart={handleDragStart}
      draggable
      onClick={handleShowBlockMenu}
    >
      <Icon name="drag-handle" className="text-gray-500 text-xs" />
    </div>
  )
}
