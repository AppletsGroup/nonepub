import { ExtensionWithState } from '@/core/extension'
import { Plugin, PluginKey, Transaction } from 'prosemirror-state'
import ShortcutOverview from './shortcut-overview'

interface ShortcutOverviewExtensionState {
  visible: boolean
}

export const pluginKey = new PluginKey<ShortcutOverviewExtensionState>(
  'shortcutOverview',
)

export enum OverviewAction {
  ToggleOverview = 'TOGGLE_OVERVIEW',
}

const getMeta = (tr: Transaction) => {
  return tr.getMeta(pluginKey) as
    | {
        type: OverviewAction
      }
    | null
    | undefined
}

export class ShortcutOverviewExtension extends ExtensionWithState<
  {
    update: ShortcutOverviewExtensionState
  },
  ShortcutOverviewExtensionState
> {
  getState() {
    return (
      pluginKey.getState(this.editor.editorView.state) ?? {
        visible: false,
      }
    )
  }

  onStateUpdate(fn: (state: ShortcutOverviewExtensionState) => void) {
    return this.ee.on('update', fn)
  }

  addPMPlugins() {
    const ctx = this

    return [
      new Plugin({
        key: pluginKey,
        state: {
          init() {
            return {
              visible: false,
            }
          },
          apply(tr, value) {
            const meta = getMeta(tr)
            if (!meta) {
              return value
            }
            switch (meta.type) {
              case OverviewAction.ToggleOverview:
                return {
                  visible: !value.visible,
                }
              default:
                return value
            }
          },
        },
        view() {
          return {
            update: () => {
              ctx.ee.emit('update', ctx.getState())
            },
          }
        },
      }),
    ]
  }

  getReactContentComponent() {
    return ShortcutOverview
  }

  beforeResolvedAll() {
    const guides = this.editor.extensions.flatMap(
      (ex) => ex.getShortcutGuide?.() || [],
    )
    this._store.set('shortcutGuides', guides)
  }
}

export interface ShortcutGuide {
  icon: string
  name: string
  shortcut?: string[]
  markdown?: string
}

declare global {
  namespace XEditor {
    interface ExtensionStoreKV {
      shortcutGuides: ShortcutGuide[]
    }

    interface ExtensionAddons {
      /**
       * @injectBy ShortcutOverviewExtension
       */
      getShortcutGuide?(): ShortcutGuide[]
    }
  }
}
