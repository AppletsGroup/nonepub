import { EditorOptions } from '@/core/editor'
import { Extension } from '@/core/extension'
import { FileUploader } from '@/core/utils/file-manager'
import { BaseExtension } from '@/extension-base'
import { BackgroundColorExtension } from '@/extension-bg-color'
import { BlockquoteExtension } from '@/extension-blockquote'
import { BubbleMenuExtension } from '@/extension-bubble-menu'
import { CodeExtension } from '@/extension-code'
import { CodeBlockExtension } from '@/extension-code-block'
import { ColorExtension } from '@/extension-color'
import { DragHandleExtension } from '@/extension-drag-handle'
import { EmExtension } from '@/extension-em'
import { EmojiExtension } from '@/extension-emoji'
import { HarkBreakExtension } from '@/extension-hard-break'
import { HeadingExtension } from '@/extension-heading'
import { HorizontalRuleExtension } from '@/extension-horizontal-rule'
import { ImageExtension } from '@/extension-image'
import { LinkExtension } from '@/extension-link'
import {
  ListCommonExtension,
  TodoItemExtension,
  TodoListExtension,
} from '@/extension-list'
import { BulletListExtension } from '@/extension-list/bullet-list-extension'
import { OrderedListExtension } from '@/extension-list/ordered-list-extension'
import { LocatorExtension } from '@/extension-locator'
import { ParagraphExtension } from '@/extension-paragaph'
import { PlaceholderExtension } from '@/extension-placeholder'
import { QuickInsertExtension } from '@/extension-quick-insert'
import { ReactExtension } from '@/extension-react'
import { ShortcutOverviewExtension } from '@/extension-shortcut-overview'
import { StateExtension } from '@/extension-state'
import { StrikeExtension } from '@/extension-strike'
import { StrongExtension } from '@/extension-strong'
import { SuggestionExtension } from '@/extension-suggestion'
import { UnderlineExtension } from '@/extension-underline'
import { MobileToolbarExtension } from '@/extension-mobile-toolbar'
import smoothscroll from 'smoothscroll-polyfill'

smoothscroll.polyfill()

export default function defaultPreset(
  defaultContent: EditorOptions['defaultContent'] | undefined,
  config: {
    uploader: FileUploader
    readonly: boolean
  },
) {
  const options: Partial<EditorOptions> = {
    defaultContent,
    readonly: config.readonly,
    extensions: [
      new StateExtension(),
      new ReactExtension(),
      new LocatorExtension(),
      new SuggestionExtension(),
      new BaseExtension(),
      new ParagraphExtension(),
      new BlockquoteExtension(),
      new HeadingExtension(),
      new MobileToolbarExtension(),
      new CodeExtension(),
      new CodeBlockExtension(),
      new EmExtension(),
      new HarkBreakExtension(),
      new HorizontalRuleExtension(),
      new ImageExtension({ uploader: config.uploader }),
      new LinkExtension(),
      new StrongExtension(),
      new StrikeExtension(),
      new UnderlineExtension(),
      new ColorExtension(),
      new BackgroundColorExtension(),
      !config.readonly ? new EmojiExtension() : undefined,
      new ListCommonExtension(),
      new OrderedListExtension(),
      new BulletListExtension(),
      new TodoItemExtension(),
      new TodoListExtension(),
      !config.readonly ? new PlaceholderExtension() : undefined,
      !config.readonly ? new ShortcutOverviewExtension() : undefined,
    ].filter((ext): ext is Extension => {
      return !!ext
    }),
  }

  return options
}
