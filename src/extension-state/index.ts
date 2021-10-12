import { EventEmitter } from '@/core/event-emitter'
import { Extension } from '@/core/extension'
import { Plugin } from 'prosemirror-state'

export class StateExtension extends Extension {
  private emitter = new EventEmitter()

  onChange(fn: any) {
    return this.emitter.on('change', fn)
  }

  addPMPlugins() {
    const self = this

    return [
      new Plugin({
        view(editorView) {
          return {
            update: (view, prevState) => {
              console.log('state update')
              if (!view.state.selection.eq(prevState.selection)) {
                console.log('selection change', view.state.selection)
              }

              self.emitter.emit('change', {
                state: view.state,
                prevState,
              })
            },

            destroy: () => {},
          }
        },
      }),
    ]
  }
}
