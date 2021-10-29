import type { Extension } from '../extension'
import { DocExtension } from './doc-extension'
import { CommandExtension } from './extension-command'
import { PasteExtension } from './extension-paste'
import { TextExtension } from './text-extension'

export const createCoreExtensions = (): Extension[] => {
  return [
    new DocExtension(),
    new TextExtension(),
    new PasteExtension(),
    new CommandExtension(),
  ]
}
