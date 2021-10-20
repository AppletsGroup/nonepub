function createDOMRect({
  x,
  y,
  left,
  top,
  width,
  height,
}: {
  x: number
  y: number
  left: number
  top: number
  width: number
  height: number
}): DOMRect {
  const r = {
    x,
    y,
    left,
    top,
    width,
    height,
    bottom: top + height,
    right: left + width,
  }

  return {
    ...r,
    toJSON() {
      return r
    },
  }
}

export const INVISIBLE_RECT = createDOMRect({
  x: -999999,
  y: -999999,
  left: -999999,
  top: -999999,
  width: 1,
  height: 1,
})

// 假设基于整个 body

export interface Position {
  x: number
  y: number
}

export interface Rect {
  x: number
  y: number
  width: number
  height: number
}

type HorizontalPlacement = 'left' | 'start' | 'center' | 'end' | 'right'
type VerticalPlacement = 'start' | 'top' | 'center' | 'end' | 'bottom'

export interface Placement {
  vertical?: VerticalPlacement
  horizontal?: HorizontalPlacement
}

interface CalculatePositionOptions {
  // 固定不动的那个
  target: Rect
  // 弹出框的那个
  popup: Rect
  // 包含 popup 的容器（基于cointainer定位）
  container: Rect
  offset?: {
    x?: number
    y?: number
  }
  placement?: Placement
  allowOutsideBoundary?: boolean
}

function getViewportHeight() {
  return window.innerHeight
}

function getViewportWidth() {
  return window.innerWidth
}

function calcVerticalPosition(options: CalculatePositionOptions): number {
  const { target, popup, container, offset } = options

  const checkTop = (): boolean => {
    const y = target.y - popup.height - (offset?.y ?? 0)
    return y >= 0
  }

  const checkBottom = (): boolean => {
    const y = target.y + target.height + popup.height + (offset?.y ?? 0)
    return y <= getViewportHeight()
  }

  let placement: VerticalPlacement = options.placement?.vertical || 'top'

  switch (options.placement?.vertical) {
    case 'top':
      if (checkTop()) {
        placement = 'top'
      } else {
        if (checkBottom()) {
          placement = 'bottom'
        } else {
          placement = 'top'
        }
      }
      break
    case 'bottom':
      if (checkBottom()) {
        placement = 'bottom'
      } else {
        if (checkTop()) {
          placement = 'top'
        } else {
          placement = 'bottom'
        }
      }
      break
  }

  switch (placement) {
    case 'top':
      return target.y - container.y - popup.height - (offset?.y ?? 0)
    case 'bottom':
      return target.y - container.y + target.height + (offset?.y ?? 0)
    case 'start':
      // TODO: 处理边界问题
      return target.y - (offset?.y ?? 0) - container.y
    case 'end':
      // TODO: 处理边界问题
      return (
        target.y + target.height - popup.height - (offset?.y ?? 0) - container.y
      )
    case 'center':
      return (
        target.y +
        target.height / 2 -
        popup.height / 2 +
        (offset?.y ?? 0) -
        container.y
      )
    default:
      throw new Error('unimplemented')
  }
}

function calcHorizontalPosition(options: CalculatePositionOptions): number {
  const { container, popup, target, offset } = options

  let viewportX = 0

  switch (options.placement?.horizontal) {
    case 'start':
      viewportX = target.x + (offset?.x ?? 0)
      break
    case 'center':
      viewportX =
        target.x + target.width / 2 - popup.width / 2 + (offset?.x ?? 0)
      if (viewportX < 0) {
        viewportX = 0
      } else if (viewportX + popup.width > getViewportWidth()) {
        viewportX = getViewportWidth() - popup.width
      }
      break
    case 'end':
      viewportX = target.x + target.width - popup.width - (offset?.x ?? 0)
      if (viewportX < 0) {
        viewportX = 0
      } else if (viewportX + popup.width > getViewportWidth()) {
        viewportX = getViewportWidth() - popup.width
      }
      break
    // TODO: 边界情况处理
    case 'left':
      return target.x - container.x - popup.width - (offset?.x ?? 0)
    // TODO: 边界情况处理
    case 'right':
      return target.x - container.x + target.width + (offset?.x ?? 0)
    default:
      throw new Error('不可能到这里')
  }

  return viewportX - container.x
}

export function calculatePosition(options: CalculatePositionOptions): Position {
  if (!options.placement) {
    options.placement = {}
  }
  if (!options.placement.horizontal) {
    options.placement.horizontal = 'center'
  }
  if (!options.placement.vertical) {
    options.placement.vertical = 'top'
  }

  const x = calcHorizontalPosition(options)
  const y = calcVerticalPosition(options)

  return {
    x,
    y,
  }
}
