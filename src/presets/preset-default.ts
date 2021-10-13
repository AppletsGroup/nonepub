import { EditorOptions } from '@/core/editor'
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
import { LocatorExtension } from '@/extension-locator'
import { ParagraphExtension } from '@/extension-paragaph'
import { PlaceholderExtension } from '@/extension-placeholder'
import { QuickInsertExtension } from '@/extension-quick-insert'
import { ReactExtension } from '@/extension-react'
import { StateExtension } from '@/extension-state'
import { StrikeExtension } from '@/extension-strike'
import { StrongExtension } from '@/extension-strong'
import { SuggestionExtension } from '@/extension-suggestion'
import { UnderlineExtension } from '@/extension-underline'

export default function defaultPreset() {
  const options: Partial<EditorOptions> = {
    extensions: [
      new StateExtension(),
      new ReactExtension(),
      new LocatorExtension(),
      new SuggestionExtension(),
      new DragHandleExtension(),
      new BaseExtension(),
      new ParagraphExtension(),
      new BlockquoteExtension(),
      new HeadingExtension(),
      new QuickInsertExtension({
        items: [
          {
            name: 'setHeading',
            options: { level: 1 },
          },
          {
            name: 'setHeading',
            options: { level: 2 },
          },
          {
            name: 'setHeading',
            options: { level: 3 },
          },
          {
            name: 'toggleBlockquote',
          },
          {
            name: 'attachLink',
          },
          {
            name: 'triggerUploadImage',
          },
          {
            name: 'wrapInList',
            options: {
              type: 'ul',
              attrs: {},
            },
          },
          {
            name: 'wrapInList',
            options: {
              type: 'ol',
              attrs: {},
            },
          },
          {
            name: 'wrapInList',
            options: {
              type: 'todo_list',
              attrs: {},
            },
          },
          {
            name: 'setCodeBlock',
          },
        ],
      }),
      new CodeExtension(),
      new CodeBlockExtension(),
      new EmExtension(),
      new HarkBreakExtension(),
      new HorizontalRuleExtension(),
      new ImageExtension(),
      new LinkExtension(),
      new StrongExtension(),
      new StrikeExtension(),
      new UnderlineExtension(),
      new ColorExtension(),
      new BackgroundColorExtension(),
      new BubbleMenuExtension(),
      new EmojiExtension(),
      new ListCommonExtension(),
      new TodoItemExtension(),
      new TodoListExtension(),
      new PlaceholderExtension(),
    ],
  }

  return options
}
