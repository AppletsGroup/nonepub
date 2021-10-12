export function isDOMRectEqual(r1: DOMRect, r2: DOMRect) {
  return (
    r1.x === r2.x &&
    r1.y === r2.y &&
    r1.width === r2.width &&
    r1.height === r2.height
  )
}

export const KEYBOARD = {
  ARROW_UP: 'ArrowUp',
  ARROW_DOWN: 'ArrowDown',
  ARROW_LEFT: 'ArrowLeft',
  ARROW_RIGHT: 'ArrowRight',
  ENTER: 'Enter',
}
