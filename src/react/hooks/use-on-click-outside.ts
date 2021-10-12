import { MutableRefObject, useEffect } from 'react'

export function useOnClickOutside(
  ref: MutableRefObject<Element | undefined | null>,
  handler: (ev: Event) => void,
) {
  useEffect(() => {
    const handleClick = (ev: Event) => {
      if (
        ev.target &&
        ev.target instanceof Node &&
        ref.current?.contains(ev.target)
      ) {
        return
      }

      handler(ev)
    }

    document.addEventListener('mousedown', handleClick)
    document.addEventListener('touchstart', handleClick)

    return () => {
      document.removeEventListener('mousedown', handleClick)
      document.removeEventListener('touchstart', handleClick)
    }
  }, [ref, handler])
}
