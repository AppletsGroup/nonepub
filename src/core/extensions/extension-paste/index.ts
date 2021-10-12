import { Extension } from '@/core/extension'
import { FilePasteRule, PasteRule, pasteRules } from '@/core/plugins/pasterules'
import MarkdownIt from 'markdown-it'
import Token from 'markdown-it/lib/token'
import { MarkdownParser, TokenConfig } from 'prosemirror-markdown'
import { Plugin, PluginKey } from 'prosemirror-state'

const tokens: { [key: string]: TokenConfig } = {
  blockquote: { block: 'blockquote' },
  paragraph: { block: 'paragraph' },
  em: { mark: 'em' },
  strong: { mark: 'strong' },
  link: {
    mark: 'link',
    attrs: (tok: Token) => ({
      href: tok.attrGet('href'),
      title: tok.attrGet('title') || null,
    }),
  },
  hr: { node: 'rule' },
  heading: {
    block: 'heading',
    attrs: (tok: Token) => ({ level: +tok.tag.slice(1) }),
  },
  softbreak: { node: 'hardBreak' },
  hardbreak: { node: 'hardBreak' },
  code_block: { block: 'codeBlock' },
  list_item: { block: 'listItem' },
  bullet_list: { block: 'bulletList' },
  ordered_list: {
    block: 'orderedList',
    attrs: (tok: any) => ({ order: +tok.attrGet('order') || 1 }),
  },
  code_inline: { mark: 'code' },
  fence: {
    block: 'code_block',
    // we trim any whitespaces around language definition
    attrs: (tok: any) => ({ language: (tok.info && tok.info.trim()) || null }),
  },
  emoji: {
    node: 'emoji',
    attrs: (tok: any) => ({
      shortName: `:${tok.markup}:`,
      text: tok.content,
    }),
  },
  table: { block: 'table' },
  tr: { block: 'tableRow' },
  th: { block: 'tableHeader' },
  td: { block: 'tableCell' },
  s: { mark: 'strike' },
}

const md = new MarkdownIt('commonmark', {
  html: false,
  linkify: true,
})
md.enable(['linkify'])

export class PasteExtension extends Extension {
  name = 'paste'

  parser?: MarkdownParser

  private pasteRules: PasteRule[] = []

  addPMPlugins() {
    const parser = new MarkdownParser(
      this.editor.schema,
      md,
      Object.fromEntries(
        Object.entries(tokens).filter(([k, config]) => {
          if (config.mark && this.editor.schema.marks[config.mark]) return true
          if (config.block && this.editor.schema.nodes[config.block])
            return true

          return false
        }),
      ),
    )
    this.parser = parser

    this.editor.extensions.forEach((ex) => {
      const rules = ex.addPasteRules()
      this.pasteRules.push(...rules)
    })

    return [
      pasteRules({
        rules: this.pasteRules,
        parser,
      }),
    ]
  }
}
