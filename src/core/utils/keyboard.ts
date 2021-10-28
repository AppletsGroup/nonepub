const KEYBOARD_SYMBOL: { [k: string]: string } = {
  command: '⌘',
  option: '⌥',
  shift: '⇧',
  capsLock: '⇪',
  control: '⌃',
  return: '↩',
  enter: '⌅',
}

export function keyToSymbol(keyName: string) {
  return KEYBOARD_SYMBOL[keyName] ?? keyName
}
