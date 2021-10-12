import { useEffect, useRef } from 'react'

export function useEventListener<K extends keyof DocumentEventMap>(
  event: K,
  listener: (ev: DocumentEventMap[K]) => any,
  capture?: boolean,
  shouldListen?: boolean,
) {
  const listenerRef = useRef<typeof listener>()

  useEffect(() => {
    listenerRef.current = listener
  }, [listener])

  useEffect(() => {
    const eventListener = (ev: DocumentEventMap[K]) => {
      listenerRef.current?.(ev)
    }

    if (shouldListen == null || shouldListen) {
      document.addEventListener(event, eventListener, capture)
    }

    return () => {
      document.removeEventListener(event, eventListener, capture)
    }
  }, [event, capture, shouldListen])
}
