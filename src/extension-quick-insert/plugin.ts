import { Editor } from '@/core/editor'
import { Plugin, PluginKey } from 'prosemirror-state'

export type QuickInsertPluginState = {
  matched: string
  items: QuickInsertPluginItem[]
  range: number[]
}

export type QuickInsertPluginProps = QuickInsertPluginState & {
  rect: DOMRect | null
}

export type QuickInsertEventHandler = (props: QuickInsertPluginProps) => void

export type QuickInsertPluginItem = {
  icon?: string
  name?: string
  markdown?: string
  shortcut?: string[]
  commandName: string
  commandOptions: any
}

export interface QuickInsertPluginOptions {
  items: QuickInsertPluginItem[]
  editor: Editor
  onChange: QuickInsertEventHandler
}

export const quickInsertPluginKey = new PluginKey<QuickInsertPluginState, any>(
  'quickInsert',
)

export function quickInsertPlugin(options: QuickInsertPluginOptions) {
  return new Plugin({
    key: quickInsertPluginKey,

    state: {
      init() {
        return {
          matched: '',
          items: options.items,
          range: [],
        }
      },
      apply(tr, v, oldState, newState) {
        if (!tr.docChanged) {
          return v
        }

        const pos = tr.selection.$from

        if (pos.depth === 0) {
          return v
        }

        const text = pos.doc.textBetween(pos.before(), pos.end())

        if (/^\/\S*$/.test(text)) {
          return {
            ...v,
            matched: text,
            range: [pos.start(), pos.end()],
          }
        }

        return {
          ...v,
          matched: '',
          range: [pos.start(), pos.end()],
        }
      },
    },

    view() {
      return {
        update(view, prevState) {
          const prevPluginState = quickInsertPluginKey.getState(prevState)
          const pluginState = quickInsertPluginKey.getState(view.state)
          if (
            pluginState &&
            (pluginState?.matched !== prevPluginState?.matched ||
              pluginState?.range !== prevPluginState?.range)
          ) {
            const dom = view.nodeDOM(view.state.selection.$from.before())
            if (dom && dom instanceof Element)
              options.onChange({
                ...pluginState,
                rect: dom.getBoundingClientRect(),
              })
          }
        },
      }
    },
  })
}
