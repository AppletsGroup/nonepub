import { Extension } from '../extension'
import { DocExtension } from './doc-extension'
import { CommandExtension } from './extension-command'
import { PasteExtension } from './extension-paste'
import { TextExtension } from './text-extension'

export const coreExtensions: Extension[] = [
  new DocExtension(),
  new TextExtension(),
  new PasteExtension(),
  new CommandExtension(),
]
