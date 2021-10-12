import { INVISIBLE_RECT } from '@/extension-locator'
import { RefObject, useEffect, useState } from 'react'

export function useElementRect<T extends Element>(ref: RefObject<T>) {
  const [rect, setRect] = useState(INVISIBLE_RECT)

  useEffect(() => {
    if (ref.current) {
      const sizeObserver = new ResizeObserver((entries) => {
        entries.forEach(({ target }) => {
          const nextRect = target.getBoundingClientRect()
          if (
            nextRect.x !== rect.x ||
            nextRect.y !== rect.y ||
            nextRect.width !== rect.width ||
            nextRect.height !== rect.height
          ) {
            setRect(nextRect)
          }
        })
      })
      sizeObserver.observe(ref.current)

      return () => sizeObserver.disconnect()
    }

    return () => {}
  }, [ref])

  return rect
}
