import { EventEmitter } from '@/core/event-emitter'
import { Extension } from '@/core/extension'
import { selectionToRect } from '@/core/utils/selection-to-rect'
import { useExtension } from '@/react/hooks/use-extension'
import {
  EditorState,
  NodeSelection,
  Plugin,
  PluginKey,
  TextSelection,
} from 'prosemirror-state'
import { EditorView } from 'prosemirror-view'
import { useEffect, useMemo, useState } from 'react'

/**
 * 设计思路：
 *
 * 当选择的文本发生变化的时候，计算出一个位置，提供给UI组件使用
 *
 * 当光标位置发生变化的时候，计算出一个位置
 * const locator = useLocator(NodeLocator)
 *
 */

const locatorPluginKey = new PluginKey('locator')

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

interface Location {
  rect: DOMRect
}

interface LocatorOptions {
  areEqual: (props: { view: EditorView; prevState?: EditorState }) => boolean

  isActive: (props: { view: EditorView; prevState?: EditorState }) => boolean

  getLocation: (props: {
    view: EditorView
    prevState?: EditorState
  }) => Location
}

export class Locator {
  private emitter = new EventEmitter()

  private state: { isActive: boolean; location: Location } = {
    isActive: false,
    location: {
      rect: INVISIBLE_RECT,
    },
  }

  constructor(private options: LocatorOptions) {}

  areEqual(props: { view: EditorView; prevState: EditorState }) {
    return this.options.areEqual(props)
  }

  addListener(fn: (args: { isActive: boolean; location: Location }) => void) {
    this.emitter.on('update', fn)
  }

  getState() {
    return this.state
  }

  onChange(props: { view: EditorView; prevState?: EditorState }) {
    const isActive = this.options.isActive(props)
    if (isActive) {
      this.state = {
        isActive,
        location: this.options.getLocation(props),
      }
    } else {
      this.state = {
        isActive,
        location: {
          rect: INVISIBLE_RECT,
        },
      }
    }

    this.emitter.emit('update', this.state)
  }

  // 从当前 locator 创建一个新的 locator
  from(createOverrideOptions: (prevOptions: LocatorOptions) => LocatorOptions) {
    return new Locator(createOverrideOptions(this.options))
  }
}

export const nodeLocator = new Locator({
  areEqual: ({ view, prevState }) => {
    if (!prevState) {
      return false
    }

    if (
      view.state.doc.eq(prevState.doc) &&
      view.state.selection.eq(prevState.selection)
    ) {
      return true
    }

    return false
  },

  isActive: ({ view, prevState }) => {
    if (view.state.selection instanceof NodeSelection) {
      return true
    }
    return false
  },

  getLocation: ({ view }): Location => {
    const dom = view.domAtPos(view.state.selection.from)
    if (dom.node && dom.node instanceof HTMLElement) {
    }
    return {
      rect: selectionToRect(view, view.state.selection),
    }
  },
})

export const cursorLocator = new Locator({
  areEqual: ({ view, prevState }) => {
    if (!prevState) {
      return false
    }

    return view.state.selection.eq(prevState.selection)
  },

  isActive: ({ view, prevState }) => {
    if (
      view.state.selection.empty &&
      view.state.selection instanceof TextSelection
    ) {
      return true
    }

    return false
  },

  getLocation: ({ view, prevState }): Location => {
    const rect = selectionToRect(view, view.state.selection)
    return {
      rect,
    }
  },
})

export const selectionLocator = new Locator({
  areEqual: ({ view, prevState }) => {
    if (!prevState) {
      return false
    }

    return view.state.selection.eq(prevState.selection)
  },

  isActive: ({ view, prevState }) => {
    if (view.state.selection.empty) {
      return false
    }

    if (!(view.state.selection instanceof TextSelection)) {
      return false
    }

    return true
  },

  getLocation: ({ view, prevState }): Location => {
    const rect = selectionToRect(view, view.state.selection)
    return {
      rect,
    }
  },
})

export class LocatorExtension extends Extension {
  name = 'locator'

  prevState?: EditorState

  // 内置的 locator
  private locators: Locator[] = [selectionLocator, nodeLocator]

  addLocator(locator: Locator) {
    if (!this.locators.includes(locator)) {
      this.locators = [...this.locators, locator]
    }
    // 立即触发 locator 的更新
    locator.onChange({
      view: this.editor.editorView,
      prevState: this.prevState,
    })
  }

  removeLocator(locator: Locator) {
    this.locators = this.locators.filter((loc) => loc !== locator)
  }

  addPMPlugins() {
    const ext = this

    return [
      new Plugin({
        key: locatorPluginKey,
        props: {},
        view(editorView) {
          return {
            update(view, prevState) {
              ext.prevState = prevState

              for (const locator of ext.locators) {
                const equal = locator.areEqual({ view, prevState })
                if (equal) {
                  continue
                }
                locator.onChange({ view, prevState })
              }
            },
            destroy() {
              // noop
            },
          }
        },
      }),
    ]
  }
}

/**
 *
 * @param locator
 * @param isActive 会与 locator 的状态进行合并
 * @returns
 */
export function useLocator(
  locator: Locator,
  isActive: boolean,
): { isActive: boolean; location: Location }
export function useLocator(
  getLocator: () => Locator,
  deps: unknown[],
): { isActive: boolean; location: Location }
export function useLocator(
  locator: Locator | (() => Locator),
  isActiveOrDeps: boolean | unknown[],
) {
  const extension = useExtension(LocatorExtension)
  const deps =
    typeof isActiveOrDeps === 'boolean'
      ? [isActiveOrDeps, locator]
      : isActiveOrDeps
  const memorizedLocator = useMemo(() => {
    if (typeof locator === 'function') {
      return locator()
    }
    return locator
  }, deps)

  const [state, setState] = useState<{
    isActive: boolean
    location: Location
  }>(memorizedLocator.getState())

  useEffect(() => {
    extension.addLocator(memorizedLocator)
    setState(memorizedLocator.getState())

    return () => {
      extension.removeLocator(memorizedLocator)
    }
  }, [extension, memorizedLocator])

  useEffect(() => {
    const listener = (state: { isActive: boolean; location: Location }) => {
      setState(state)
    }

    setState(memorizedLocator.getState())

    const cancel = memorizedLocator.addListener(listener)

    return cancel
  }, [memorizedLocator])

  const isActive = typeof isActiveOrDeps === 'boolean' ? isActiveOrDeps : true

  return useMemo(() => {
    return {
      ...state,
      isActive: state.isActive && isActive,
    }
  }, [state, isActive])
}
