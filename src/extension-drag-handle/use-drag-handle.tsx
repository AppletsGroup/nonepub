import { useExtension } from '@/react/hooks/use-extension'
import { useEffect, useState } from 'react'
import { DragHandleExtension, DragHandleState } from '.'

export function useDragHandle() {
  const extension = useExtension(DragHandleExtension)
  const [state, setState] = useState<DragHandleState>(extension.getState())

  useEffect(() => {
    extension.onStateUpdate((state) => {
      setState(state)
    })
  }, [extension])

  return state
}
