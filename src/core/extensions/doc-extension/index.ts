import { Extension } from '@/core/extension'

export class DocExtension extends Extension {
  name = 'doc'

  nodes() {
    return [
      {
        name: 'doc',
        nodeSpec: {
          content: 'block+',
        },
      },
    ]
  }
}
