import { EventEmitter } from '@/core/event-emitter'
import { Extension } from '@/core/extension'
import {
  createCharMathcer,
  SuggestionMatch,
  SuggestionWatcher,
} from '@/extension-suggestion'
import { Plugin, PluginKey } from 'prosemirror-state'
import QuickInsert from './quick-insert'

export interface QuickInsertChangeHandlerProps {
  match?: SuggestionMatch
  items: any[]
  visible: boolean
  rect?: DOMRect
}

type QuickInsertExtensionOptions = {
  items: { name: string; options?: any }[]
}

export class QuickInsertExtension extends Extension {
  name = 'quickInsert'

  emitter = new EventEmitter()

  constructor(private options: QuickInsertExtensionOptions = { items: [] }) {
    super()
  }

  private resolveMenuItems() {
    return this.options.items
      .filter((item) => this.editor.commandMeta[item.name])
      .map((item) => {
        const meta = this.editor.commandMeta[item.name]
        let icon: string | undefined
        let markdown: string | undefined
        let name: string | undefined
        let shortcut: string[] | undefined
        if (typeof meta.icon === 'string') {
          icon = meta.icon
        } else if (typeof meta.icon === 'function') {
          icon = meta.icon(item.options)
        }

        if (typeof meta.markdown === 'string') {
          markdown = meta.markdown
        } else if (typeof meta.markdown === 'function') {
          markdown = meta.markdown(item.options)
        }

        if (typeof meta.name === 'string') {
          name = meta.name
        } else if (typeof meta.name === 'function') {
          name = meta.name(item.options)
        }

        if (typeof meta.shortcut === 'string') {
          shortcut = meta.shortcut
        } else if (typeof meta.shortcut === 'function') {
          shortcut = meta.shortcut(item.options)
        }

        return {
          icon,
          markdown,
          name,
          shortcut,
          commandName: item.name,
          commandOptions: item.options,
        }
      })
  }

  addQuickInsertChangeHandler(
    handler: (props: QuickInsertChangeHandlerProps) => void,
  ) {
    return this.emitter.on('update', handler)
  }

  onQuickInsertChange(props: QuickInsertChangeHandlerProps) {
    this.emitter.emit('update', props)
  }

  createSuggestionWatcher(): SuggestionWatcher {
    const menuItems = this.resolveMenuItems()

    const findMatchedMenuItems = (text: string) => {
      const keyword = text.slice(1)
      if (!keyword) {
        return menuItems
      }

      return menuItems.filter(
        (item) => (item.name?.indexOf(keyword) ?? -1) >= 0,
      )
    }

    return {
      matcher: createCharMathcer('/'),
      onChange: ({ view, match, rect }) => {
        const items = findMatchedMenuItems(match.text)
        this.onQuickInsertChange({
          match,
          items,
          visible: true,
          rect,
        })
      },
      onEnter: ({ view, match, rect }) => {
        const items = findMatchedMenuItems(match.text)
        this.onQuickInsertChange({
          match,
          items,
          visible: true,
          rect,
        })
      },
      onExit: ({ view, match, rect }) => {
        this.onQuickInsertChange({
          match,
          items: [],
          visible: false,
          rect,
        })
      },
    }
  }

  addPMPlugins() {
    return [
      new Plugin({
        key: new PluginKey('quickInsert'),
        props: {},
      }),
    ]
  }

  getReactContentComponent() {
    return QuickInsert
  }
}
