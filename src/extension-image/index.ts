import { Command, CommandReturn } from '@/core/command-manager'
import { EventEmitter } from '@/core/event-emitter'
import { Extension, ExtensionNode } from '@/core/extension'
import { PasteRule } from '@/core/plugins/pasterules'
import { selectionToRect } from '@/core/utils/selection-to-rect'
import { ReactNodeView } from '@/extension-react'
import {
  EditorState,
  NodeSelection,
  Plugin,
  PluginKey,
} from 'prosemirror-state'
import { ImageView } from './image'
import { ImageToolbar } from './image-toolbar'
import { findChild, findDomAtPos } from '@/core/utils/node'
import {
  FileManager,
  FileState,
  FileStateChangeListener,
  FileStateListener,
} from '@/core/utils/file-manager'
import { BubbleMenuConfig } from '@/extension-bubble-menu'
import { EditorView } from 'prosemirror-view'

declare global {
  namespace XEditor {
    interface AllCommands {
      uploadImage: (file: File) => CommandReturn
      alignLeft: () => CommandReturn
      alignCenter: () => CommandReturn
      alignRight: () => CommandReturn
    }
  }
}

const imagePluginKey = new PluginKey('imagePlugin')

interface ImagePluginMeta {
  id: string
  src?: string
  status: 'init' | 'uploaded' | 'uploading'
  width?: number
  height?: number
}

export class ImageExtension extends Extension {
  name = 'image'

  private emitter = new EventEmitter()

  private fileManager = new FileManager()

  constructor() {
    super()
    this.fileManager.onNewFile(this.insertImage)
  }

  nodes(): ExtensionNode[] {
    return [
      {
        name: 'image',
        nodeSpec: {
          attrs: {
            src: {},
            alt: { default: null },
            title: { default: null },
            id: { default: null },
            width: { default: '200px' },
            height: { default: null },
            align: { default: 'left' },
          },
          group: 'block',
          draggable: true,
          parseDOM: [
            {
              tag: 'img[src]',
              getAttrs(dom) {
                return {
                  src: (dom as HTMLElement).getAttribute('src'),
                  title: (dom as HTMLElement).getAttribute('title'),
                  alt: (dom as HTMLElement).getAttribute('alt'),
                  id: (dom as HTMLElement).getAttribute('id'),
                }
              },
            },
          ],
          toDOM(node) {
            let { src, alt, title, id } = node.attrs
            return ['img', { src, alt, title, id }]
          },
        },
      },
    ]
  }

  insertImage: FileStateListener = (
    fileState: FileState,
    onFileStateChange: FileStateChangeListener,
  ) => {
    const view = this.editor.editorView
    const tr = this.editor.editorView.state.tr
    tr.replaceWith(
      tr.selection.$from.before(),
      tr.selection.$from.after(),
      this.editor.schema.nodes.image.create({
        id: fileState.id,
        src: '',
      }),
    ).setMeta(imagePluginKey, {
      id: fileState.id,
      src: '',
      status: 'init',
    })

    onFileStateChange((fileState) => {
      console.log('on file state change', fileState)
      switch (fileState.status) {
        case 'preview':
          {
            const tr = view.state.tr.setMeta(imagePluginKey, {
              id: fileState.id,
              src: fileState.url,
              width: fileState.width,
              height: fileState.height,
              status: 'uploading',
            })
            view.dispatch(tr)
          }
          break
        case 'uploading':
          {
            const tr = view.state.tr.setMeta(imagePluginKey, {
              id: fileState.id,
              src: fileState.url,
              width: fileState.width,
              height: fileState.height,
              status: 'uploading',
            })
            view.dispatch(tr)
          }
          break
        case 'uploaded':
          {
            const tr = view.state.tr.setMeta(imagePluginKey, {
              id: fileState.id,
              src: fileState.url,
              status: 'uploaded',
            })
            const imageNode = findChild(
              view.state.doc,
              (node) =>
                node.type.name === 'image' && node.attrs.id === fileState.id,
            )
            if (imageNode) {
              tr.replaceWith(
                imageNode.pos,
                imageNode.pos + imageNode.node.nodeSize,
                this.editor.schema.nodes.image.create({
                  ...imageNode.node.attrs,
                  src: fileState.url,
                }),
              )
            }

            view.dispatch(tr)
          }
          break
        default:
      }
    })

    this.editor.editorView.dispatch(tr)
  }

  addCommands(): Record<string, Command> {
    this.addCommandMeta('triggerUploadImage', {
      icon: 'double-quotes-l',
      name: '上传',
      markdown: '',
      shortcut: ['command', 'shift', 'xxx'],
    })

    const createAlignCommand = (
      align: 'left' | 'center' | 'right',
    ): (() => CommandReturn) => {
      return () =>
        ({ view, tr, dispatch }) => {
          if (
            tr.selection instanceof NodeSelection &&
            tr.selection.node.type === this.editor.schema.nodes.image
          ) {
            console.log('change align')
            tr = tr.setNodeMarkup(tr.selection.anchor, undefined, {
              ...tr.selection.node.attrs,
              align,
            })
            dispatch?.(tr)
            return true
          }

          return false
        }
    }

    return {
      alignLeft: createAlignCommand('left'),
      alignCenter: createAlignCommand('center'),
      alignRight: createAlignCommand('right'),

      triggerUploadImage: (): CommandReturn => {
        return () => {
          this.fileManager.openPicker()
          return true
        }
      },

      uploadImage: (file: File): CommandReturn => {
        return (props) => {
          props.dispatch?.(props.tr)
          console.log('upload file')
          this.fileManager.uploadFile(file)
          return true
        }
      },
    }
  }

  addPasteRules(): PasteRule[] {
    return [
      {
        type: 'file',
        regex: /image/,
        handler: ({ files }) => {
          files.forEach((file) => {
            this.editor.commandOnce.uploadImage(file)
          })

          return true
        },
      },
    ]
  }

  // TODO: 实现一个 plugin，检查图片上传的进度，图片最终的url... 实现一个hook，能够从中获取信息，并最终替换 image 的属性
  addPMPlugins() {
    const ext = this

    return [
      new Plugin({
        key: imagePluginKey,
        state: {
          init() {
            return {}
          },
          apply(tr, v, oldState, state) {
            const action = tr.getMeta(this) as ImagePluginMeta | undefined

            if (action) {
              // 添加
              const next = {
                ...v,
                [action.id]: action,
              }

              switch (action.status) {
                case 'uploading':
              }

              return next
            }

            return v
          },
        },
        view() {
          return {
            update: (view) => {
              const nextState = {
                ...imagePluginKey.getState(view.state),
              }

              if (view.state.selection instanceof NodeSelection) {
                if (
                  view.state.selection.node.type ===
                  ext.editor.schema.nodes.image
                ) {
                  nextState.selection = view.state.selection
                  const rect = selectionToRect(view, nextState.selection)
                  nextState.rect = rect
                } else {
                  nextState.selection = null
                  nextState.rect = null
                }
              } else {
                nextState.selection = null
                nextState.rect = null
              }

              ext.emitter.emit('update', nextState)
            },
          }
        },
      }),
    ]
  }

  createNodeView() {
    return {
      image: ReactNodeView.fromComponent(
        ImageView,
        this._store.get('portalContainer'),
      ),
    }
  }

  getState() {
    return imagePluginKey.getState(this.editor.editorView.state)
  }

  addUploadStateChangeListener(fn: any) {
    return this.emitter.on('update', fn)
  }

  getBubbleMenuConfig({
    state,
    view,
  }: {
    state: EditorState
    view: EditorView
  }): BubbleMenuConfig | undefined {
    if (
      state.selection instanceof NodeSelection &&
      state.selection.node.type.name === 'image'
    ) {
      const dom = findDomAtPos(state.selection.from, view)

      if (!dom) {
        return
      }

      return {
        items: [
          {
            type: 'button',
            icon: 'align-left',
            isActive: false,
            name: '左对齐',
            onClick: () => {
              this.editor.commandChain.alignLeft().run()
            },
          },
          {
            type: 'button',
            icon: 'align-center',
            isActive: false,
            name: '居中对齐',
            onClick: () => {
              console.log('center')
              this.editor.commandChain.alignCenter().run()
            },
          },
          {
            type: 'button',
            icon: 'align-left',
            isActive: false,
            name: '右对齐',
            onClick: () => {
              this.editor.commandChain.alignRight().run()
            },
          },
        ],
        getDomRef: () => {
          const ref = (dom as HTMLElement).querySelector('img')!
          console.log('get ref ok?', ref)
          return ref
        },
        placement: {
          vertical: 'bottom',
          horizontal: 'center',
        },
        offset: {
          x: 0,
          y: 8,
        },
      }
    }

    return undefined
  }
}
