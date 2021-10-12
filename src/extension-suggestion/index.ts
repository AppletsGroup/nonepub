/**
 * 设计草稿：
 *
 * 用于显示建议 如快速插入卡片、emoji框、日期、at等...
 * 用户输入，进行匹配，可能是刚触发，在触发之后继续保持（修改输入），取消触发（比如移动光标到匹配字符串外面）
 * 或者按下了 esc 键盘，如果按下 esc
 * 一些设想的场景
 * 一段文字当中，输入 @something，此时是渲染有颜色的，弹出名称选择器，如果此时我按下 esc，@something 变成普通的文字，然后继续输入也一直是普通的文字
 * 这种情况，就是我通过 @ 进行触发，继续输入就可以一直处于激活状态，但是取消的话就变成正常文字了
 *
 * 一段文字中，如数 #标签1，弹出框，此时按下 esc，#标签1 不会变成普通文字，然后继续在#标签1后面输入，还是 #标签1的内容
 */
import { Extension } from '@/core/extension'
import { selectionToRect } from '@/core/utils/selection-to-rect'
import { ResolvedPos } from 'prosemirror-model'
import { Plugin, PluginKey, TextSelection } from 'prosemirror-state'
import { EditorView } from 'prosemirror-view'

const suggestionPluginKey = new PluginKey<PluginState>('suggestion')

export interface SuggestionMatch {
  range: { from: number; to: number }
  text: string
}

export interface SuggestionWatcherMatch {
  match: SuggestionMatch
  watcher: SuggestionWatcher
}

export type SuggestionMathcer = (
  $pos: ResolvedPos,
) => SuggestionMatch | undefined

export interface WatcherHandler {
  watcher: SuggestionWatcher
  match: SuggestionMatch
}

export interface PluginState {
  prev?: SuggestionWatcherMatch
  current?: SuggestionWatcherMatch
  watcherHandlerMap: {
    exit?: WatcherHandler
    enter?: WatcherHandler
    change?: WatcherHandler
  }
}

export type SuggestionWatcherEventHandler = (event: {
  view: EditorView
  match: SuggestionMatch
  rect?: DOMRect
}) => void

// onEnter onChange onExit onKeyDown
export interface SuggestionWatcher {
  matcher: SuggestionMathcer
  onEnter: SuggestionWatcherEventHandler
  onChange: SuggestionWatcherEventHandler
  onExit: SuggestionWatcherEventHandler
}

// 参考了 https://github.com/quartzy/prosemirror-suggestions
export const createCharMathcer = (
  char: string,
  { allowSpaces = false }: { allowSpaces: boolean } = { allowSpaces: false },
): SuggestionMathcer => {
  return ($pos) => {
    // Matching expressions used for later
    const suffix = new RegExp(`\\s${char}$`)
    const regexp = allowSpaces
      ? new RegExp(`${char}.*?(?=\\s${char}|$)`, 'g')
      : new RegExp(`(?:^)?${char}[^\\s${char}]*`, 'g')

    // Lookup the boundaries of the current node
    const textFrom = $pos.before()
    const textTo = $pos.end()

    // TODO: 还不懂 3、4 参数
    const text = $pos.doc.textBetween(textFrom, textTo, '\0', '\0')

    let match: RegExpExecArray | null = null

    while ((match = regexp.exec(text))) {
      // Javascript doesn't have lookbehinds; this hacks a check that first character is " " or the line beginning
      const prefix = match.input.slice(
        Math.max(0, match.index - 1),
        match.index,
      )
      if (!/^[\s\0]?$/.test(prefix)) {
        continue
      }

      // The absolute position of the match in the document
      const from = match.index + $pos.start()
      let to = from + match[0].length

      // Edge case handling; if spaces are allowed and we're directly in between two triggers
      if (allowSpaces && suffix.test(text.slice(to - 1, to + 1))) {
        // TODO: 什么情况？

        match[0] += ' '
        to++
      }

      // If the $position is located within the matched substring, return that range
      if (from < $pos.pos && to >= $pos.pos) {
        return { range: { from, to }, text: match[0] }
      }
    }
  }
}

function findActiveWatcherMatch(
  $pos: ResolvedPos,
  watchers: SuggestionWatcher[],
) {
  for (const watcher of watchers) {
    const match = watcher.matcher($pos)
    if (match) {
      return {
        match,
        watcher,
      }
    }
  }
}

/**
 * 更新 state
 * * 这个方法会对 state 进行原地更改
 * @param state
 */
function driveState(state: PluginState) {
  if (
    state.prev &&
    state.current &&
    state.prev.match.range.from !== state.current.match.range.from
  ) {
    // 跳到了另一个建议
    state.watcherHandlerMap.exit = {
      watcher: state.prev.watcher,
      match: state.prev.match,
    }
    state.watcherHandlerMap.enter = {
      watcher: state.current.watcher,
      match: state.current.match,
    }
  }

  if (
    state.prev &&
    state.current &&
    state.prev.match.range.from === state.current.match.range.from &&
    state.prev.match.text !== state.current.match.text
  ) {
    // 在触发了建议的状态下继续输入其他文字
    state.watcherHandlerMap.change = {
      watcher: state.current.watcher,
      match: state.current.match,
    }
  }

  if (!state.prev && state.current) {
    // 开始触发建议
    state.watcherHandlerMap.enter = {
      watcher: state.current.watcher,
      match: state.current.match,
    }
  }

  if (state.prev && !state.current) {
    // 离开建议
    state.watcherHandlerMap.exit = {
      watcher: state.prev.watcher,
      match: state.prev.match,
    }
  }
}

export class SuggestionExtension extends Extension {
  name = 'suggestion'

  watchers: SuggestionWatcher[] = []

  resolveWatchers() {
    this.editor.extensions.forEach((ext) => {
      const watcher = ext.createSuggestionWatcher?.()
      watcher && this.watchers.push(watcher)
    })
  }

  beforeResolvedAll() {
    this.resolveWatchers()
  }

  addPMPlugins() {
    const ext = this

    return [
      new Plugin({
        key: suggestionPluginKey,
        state: {
          init() {
            return {
              watcherHandlerMap: {},
            }
          },
          apply(tr, value, oldState, newState) {
            const nextState: PluginState = {
              ...value,
              watcherHandlerMap: {},
            }

            nextState.prev = nextState.current

            if (tr.selection instanceof TextSelection && tr.selection.empty) {
              if (tr.selection.$from.depth === 0) {
                console.error('tr.selection.$from', tr.selection.$from)
                return nextState
              } else {
                console.warn('ok tr.selection.$from', tr.selection.$from)
              }

              const activeMatch = findActiveWatcherMatch(
                tr.selection.$from,
                ext.watchers,
              )
              nextState.current = activeMatch
            } else {
              nextState.current = undefined
            }

            driveState(nextState)

            return nextState
          },
        },
        view(editorView) {
          return {
            update: (view, prevState) => {
              const suggestionState = suggestionPluginKey.getState(view.state)
              if (suggestionState) {
                const { enter, change, exit } =
                  suggestionState.watcherHandlerMap

                const { current } = suggestionState
                let rect: DOMRect | undefined

                if (current) {
                  const selection = TextSelection.create(
                    view.state.doc,
                    current.match.range.from,
                    current.match.range.to,
                  )
                  rect = selectionToRect(view, selection)
                }

                enter?.watcher.onEnter({ view, match: enter.match, rect })
                change?.watcher.onChange({ view, match: change.match, rect })
                exit?.watcher.onExit({ view, match: exit.match, rect })
              }
            },
          }
        },
      }),
    ]
  }
}

declare global {
  namespace XEditor {
    interface ExtensionAddons {
      /**
       * 由 `SuggestionExtension` 插入
       */
      createSuggestionWatcher?(): SuggestionWatcher
    }
  }
}
