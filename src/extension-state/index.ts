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
