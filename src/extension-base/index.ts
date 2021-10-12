import { Extension } from '@/core/extension'

export class BaseExtension extends Extension {
  name = 'base'

  addKeybindings() {
    return {
      'Mod-z': () => this.editor.command.undo(),
      'Shift-Mod-z': () => this.editor.command.redo(),
      Backspace: () => this.editor.command.undoInputRule(),
      'Alt-ArrowUp': () => this.editor.command.joinUp(),
      'Alt-ArrowDown': () => this.editor.command.joinDown(),
      'Mod-BracketLeft': () => this.editor.command.lift(),
      Escape: () => this.editor.command.selectParentNode(),
    }
  }
}
