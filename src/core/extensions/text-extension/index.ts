import { Extension } from '@/core/extension'

export class TextExtension extends Extension {
  name = 'text'

  nodes() {
    return [
      {
        name: 'text',
        nodeSpec: {
          group: 'inline',
        },
      },
    ]
  }
}
