import { Plugin, PluginKey } from 'prosemirror-state'
import { MarkdownParser } from 'prosemirror-markdown'

const isMarkdownLike = (content: string) => {
  // has heading
  if (/^#{1,6}\s+\S+/.test(content)) {
    return true
  }
}

export interface FilePasteRule {
  type: 'file'
  regex: RegExp
  handler: (params: { files: File[] }) => boolean
}

export type PasteRule = FilePasteRule

interface PasteRulesOptions {
  rules: PasteRule[]
  parser: MarkdownParser
}

const pastePluginKey = new PluginKey('pastePlugin')

export function pasteRules(options: PasteRulesOptions) {
  return new Plugin({
    key: pastePluginKey,
    props: {
      handlePaste(view, event) {
        const editable = view.props.editable?.(view.state)
        if (!editable) return false
        if (!event.clipboardData) return false

        const text = event.clipboardData.getData('text/plain')
        const html = event.clipboardData.getData('text/html')

        if (html.length > 0) {
          return false
        }

        event.preventDefault()
        event.stopPropagation()

        const markdown = options.parser.parse(text)
        const slice = markdown.slice(0)
        const tr = view.state.tr.replaceSelection(slice)
        view.dispatch(tr)
        return true
      },

      handleDOMEvents: {
        paste(view, event) {
          if (!view.props.editable?.(view.state)) {
            return false
          }

          const _items = event.clipboardData?.items

          if (_items && _items.length) {
            const items = [..._items]

            for (const handler of options.rules) {
              const filtered = items
                .filter((item) => handler.regex.test(item.type))
                .map((item) => item.getAsFile())
                .filter((file): file is File => !!file)

              if (filtered.length > 0) {
                if (handler.handler({ files: filtered })) {
                  event.preventDefault()
                  return true
                }
              }
            }
          }

          return false
        },
        drop(view, event) {
          if (view.props.editable?.(view.state)) {
            return false
          }

          const _items = event.dataTransfer?.items
          if (_items && _items.length) {
            const items = [..._items]

            for (const handler of options.rules) {
              const filtered = items
                .filter((item) => handler.regex.test(item.type))
                .map((item) => item.getAsFile())
                .filter((file): file is File => !!file)

              if (filtered.length > 0) {
                if (handler.handler({ files: filtered })) {
                  event.preventDefault()
                  return true
                }
              }
            }
          }

          return false
        },
      },
    },
  })
}
