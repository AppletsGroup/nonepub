import { EventEmitter } from '@/core/event-emitter'
import { Extension } from '@/core/extension'
import { ShortcutGuide } from '@/extension-shortcut-overview'
import {
  createCharMathcer,
  SuggestionMatch,
  SuggestionWatcher,
} from '@/extension-suggestion'
import { EditorView } from 'prosemirror-view'
import EmojiPicker from './emoji-picker'

export class EmojiExtension extends Extension {
  name = 'emoji'

  emitter = new EventEmitter()

  onSuggestEmoji(
    fn: (options: {
      view: EditorView
      match: SuggestionMatch
      rect?: DOMRect
      visible: boolean
    }) => void,
  ) {
    this.emitter.on('suggest', fn)
  }

  createSuggestionWatcher(): SuggestionWatcher {
    return {
      matcher: createCharMathcer(':'),
      onChange: (options) => {
        this.emitter.emit('suggest', {
          ...options,
          visible: true,
        })
      },
      onEnter: (options) => {
        this.emitter.emit('suggest', {
          ...options,
          visible: true,
        })
      },
      onExit: (options) => {
        this.emitter.emit('suggest', {
          ...options,
          visible: false,
        })
      },
    }
  }

  getReactContentComponent() {
    return EmojiPicker
  }

  getShortcutGuide(): ShortcutGuide[] {
    return [
      {
        icon: 'question-line',
        name: 'Emoji',
        markdown: ':emoji',
        shortcut: [],
      },
    ]
  }
}
