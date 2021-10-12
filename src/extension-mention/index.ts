import { Extension, ExtensionNode } from '@/core/extension'
import { createCharMathcer, SuggestionWatcher } from '@/extension-suggestion'

export class MentionExtension extends Extension {
  name = 'at'

  nodes(): ExtensionNode[] {
    return [
      {
        name: 'mention',
        nodeSpec: {
          group: 'inline',
          inline: true,
          atom: true,
        },
      },
    ]
  }

  createSuggestionWatcher(): SuggestionWatcher {
    return {
      matcher: createCharMathcer('@'),
      onChange: () => {},
      onEnter: () => {},
      onExit: () => {},
    }
  }
}
