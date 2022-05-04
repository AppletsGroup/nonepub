import { Extension } from '@/core/extension'
import { Plugin, PluginKey } from 'prosemirror-state'
import MobileToolbar from './MobileToolbar'
import * as Litchi from '@yikeguozi/litchi'

function getMobileToolbarElement() {
  return document.querySelector('x-mobile-toolbar')
}

export class MobileToolbarExtension extends Extension {
  name = 'mobileToolbar'

  constructor() {
    super()
  }

  addPMPlugins(): Plugin[] {
    return [
      new Plugin({
        key: new PluginKey('MobileToolbarPlugin'),

        view() {
          return {
            update(view, prevState) {
              if (view.hasFocus()) {
                const { top } = view.coordsAtPos(view.state.selection.from)
                let needScroll = window.visualViewport.height - top - 200
                if (needScroll < 0) {
                  needScroll = -needScroll
                  window.scrollBy({
                    top: needScroll,
                    left: 0,
                    behavior: 'smooth',
                  })
                }
              }
            },
          }
        },

        props: {
          handleDOMEvents: {
            focus(view, event) {
              event.preventDefault()
              setTimeout(() => {
                const { top } = view.coordsAtPos(view.state.selection.from)
                // TODO: 100 是随便写的 用来测试
                let needScroll = window.visualViewport.height - top - 200
                console.log('need scroll', needScroll)
                if (needScroll < 0) {
                  needScroll = -needScroll
                  window.scrollBy({
                    top: needScroll,
                    left: 0,
                    behavior: 'smooth',
                  })
                }
                console.log('scroll into view')
              }, 1000)

              // setTimeout(async () => {
              //   console.log('get keyboard height')
              //   const keyboardHeight = await Litchi.getKeyboardHeight()
              //   const el = getMobileToolbarElement()
              //   console.log('keyboardHeight', keyboardHeight)
              // }, 300)
              return false
            },
          },
        },
      }),
    ]
  }

  getReactContentComponent() {
    return MobileToolbar
  }
}
