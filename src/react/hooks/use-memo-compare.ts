import { useEffect, useRef } from 'react'
import equal from 'fast-deep-equal/es6'

/**
 * 类似 useMemo，但是是根据比较函数决定是否用新的值
 * 默认的 compare 函数是深度比较是否相等的
 *
 * @param next
 * @param compare
 * @returns
 */
export function useMemoCompare<T>(
  next: T,
  compare: (prev: T, next: T) => boolean = equal,
): T {
  const prevRef = useRef<T>(next)
  const prev = prevRef.current

  const isEqual = compare(prev, next)

  useEffect(() => {
    if (!isEqual) {
      prevRef.current = next
    }
  })

  return isEqual ? prev : next
}
