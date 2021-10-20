import { Command, CommandReturn } from '@/core/command-manager'
import { EventEmitter } from '@/core/event-emitter'
import { Extension, ExtensionMark } from '@/core/extension'
import { BubbleMenuConfig } from '@/extension-bubble-menu'
import { cursorLocator } from '@/extension-locator'
import {
  Fragment,
  Mark,
  MarkType,
  Node,
  ResolvedPos,
  Slice,
} from 'prosemirror-model'
import {
  EditorState,
  Plugin,
  PluginKey,
  TextSelection,
} from 'prosemirror-state'
import EditLink from './edit-link'
import { selectionToRect } from '@/core/utils/selection-to-rect'
import { EditorView } from 'prosemirror-view'

const linkPluginKey = new PluginKey<LinkPluginState>('link')

const pasteRegex =
  /https?:\/\/(?:www\.)?[-a-zA-Z0-9@:%._+~#=]{1,256}\.[a-zA-Z]{2,}\b(?:[-a-zA-Z0-9@:%._+~#=?!&/]*)(?:[-a-zA-Z0-9@:%._+~#=?!&/]*)/gi

let clickOn = false

// 懂了
function getMarkRange($pos: ResolvedPos, markType: MarkType) {
  if (!markType.isInSet($pos.marks())) {
    return
  }

  const mark = $pos.marks().find((mark) => {
    return mark.type.name === markType.name
  })

  let startIndex = $pos.index(),
    endIndex = $pos.indexAfter()

  while (
    startIndex > 0 &&
    markType.isInSet($pos.parent.child(startIndex - 1).marks)
  )
    startIndex--
  while (
    endIndex < $pos.parent.childCount &&
    markType.isInSet($pos.parent.child(endIndex).marks)
  )
    endIndex++
  let startPos = $pos.start(),
    endPos = startPos
  for (let i = 0; i < endIndex; i++) {
    let size = $pos.parent.child(i).nodeSize
    if (i < startIndex) startPos += size
    endPos += size
  }
  return { from: startPos, to: endPos, mark }
}

declare global {
  namespace XEditor {
    interface AllCommands {
      openSelectedLink: () => CommandReturn

      /**
       * 添加
       */
      attachLink: () => CommandReturn

      /**
       * 对选中的文字添加链接
       */
      setLink: ({
        href,
        text,
      }: {
        href: string
        text?: string
      }) => CommandReturn

      /**
       * 移除链接
       */
      unlink: ({ from, to }: { from: number; to: number }) => CommandReturn

      editInsertedLink: () => CommandReturn

      addLinkToSelection: () => CommandReturn
    }
  }
}

export interface LinkPluginState {
  activeLink: {
    from: number
    to: number
    mark: Mark
  } | null
  status: LinkStatus
}

export enum LinkAction {
  ClickLink = 'CLICK_LINK',
  BlurLink = 'BLUR_LINK',
  EditInsertedLink = 'EDIT_INSERTED_LINK',
  AttachLink = 'ATTACH_LINK',
  AddLinkToSelection = 'ADD_LINK_TO_SELECTION',
}

export enum LinkStatus {
  None = 'None',
  ShowTool = 'SHOW_TOOL',
  Edit = 'EDIT',
  Create = 'CREATE',
}

export class LinkExtension extends Extension {
  name = 'link'

  private emitter = new EventEmitter()

  marks(): ExtensionMark[] {
    return [
      {
        name: 'link',
        markSpec: {
          attrs: {
            href: {},
            title: { default: null },
          },
          inclusive: false,
          parseDOM: [
            {
              tag: 'a[href]',
              getAttrs(dom) {
                return {
                  href: (dom as HTMLElement).getAttribute('href'),
                  title: (dom as HTMLElement).getAttribute('title'),
                }
              },
            },
          ],
          toDOM(node) {
            let { href, title } = node.attrs
            return ['a', { href, title }, 0]
          },
        },
      },
    ]
  }

  addKeybindings(): Record<string, () => CommandReturn> {
    return {
      'Mod-k': () => {
        const cmd: CommandReturn = (opts) => {
          if (!opts.tr.selection.empty) {
            return this.editor.command.addLinkToSelection()(opts)
          }
          return this.editor.command.attachLink()(opts)
        }

        return cmd
      },
    }
  }

  addCommands(): Record<string, Command> {
    this.addCommandMeta('attachLink', {
      icon: 'link',
      name: '插入链接',
      markdown: '无',
      shortcut: ['command', 'k'],
    })

    return {
      // 打开选中的链接
      openSelectedLink: () => {
        return ({ state }) => {
          const linkState = linkPluginKey.getState(state)
          const href = linkState?.activeLink?.mark?.attrs?.href
          if (href) {
            window.open(href, '_blank')
          }
          return true
        }
      },

      attachLink: () => {
        return ({ tr, dispatch }) => {
          tr.setMeta(linkPluginKey, {
            type: LinkAction.AttachLink,
          })
          dispatch?.(tr)
          return true
        }
      },

      addLinkToSelection: () => {
        return ({ tr, dispatch }) => {
          tr.setMeta(linkPluginKey, {
            type: LinkAction.AddLinkToSelection,
          })
          dispatch?.(tr)
          return true
        }
      },

      // 编辑选中的超链接
      editInsertedLink: () => {
        return ({ tr, dispatch }) => {
          tr.setMeta(linkPluginKey, {
            type: LinkAction.EditInsertedLink,
          })
          dispatch?.(tr)
          return true
        }
      },

      unlink: ({ from, to }: { from: number; to: number }) => {
        return ({ tr, dispatch, view }) => {
          const markType = this.editor.schema.marks.link
          if (from && to) {
            tr.removeMark(from, to, markType)
          } else {
            // TODO: 没有制定位置的时候
          }
          tr.setMeta(linkPluginKey, {
            type: LinkAction.BlurLink,
          })

          view?.focus()

          dispatch?.(tr)
          return true
        }
      },

      setLink: ({ href, text }: { href: string; text?: string }) => {
        return (params) => {
          const markType = this.editor.schema.marks.link
          const { tr, dispatch } = params
          // 不考虑选择的情况下面
          const { selection, doc } = params.tr
          let canSet = false
          if (
            selection.$from.depth === 0 &&
            params.tr.doc.type.allowsMarkType(markType)
          ) {
            canSet = true
          }

          doc.nodesBetween(
            selection.from,
            selection.to,
            (node, pos, parent, index) => {
              if (canSet) {
                return false
              }
              if (node.type.allowsMarkType(markType) && node.inlineContent) {
                canSet = true
              }
              return
            },
          )

          if (!canSet) {
            return false
          }

          if (selection.empty && text) {
            tr.setMeta(linkPluginKey, {
              type: LinkAction.BlurLink,
            })
            tr.insert(
              selection.from,
              this.editor.schema.text(text, [
                markType.create({
                  href,
                }),
              ]),
            )
            dispatch?.(tr)
            params.view?.focus()

            return true
          } else if (!selection.empty) {
            tr.setMeta(linkPluginKey, {
              type: LinkAction.BlurLink,
            })
            tr.addMark(
              selection.from,
              selection.to,
              markType.create({
                href,
              }),
            )
            tr.setSelection(TextSelection.near(tr.doc.resolve(selection.to)))
            params.view?.focus()

            // TODO: 如果制定了文字，把文字给换掉
            dispatch?.(tr)
            return true
          } else {
            return false
          }
        }
      },
    }
  }

  onMarkClick(fn: any) {
    return this.emitter.on('markClick', fn)
  }

  onStateUpdate(fn: any) {
    return this.emitter.on('update', fn)
  }

  getState() {
    return linkPluginKey.getState(this.editor.editorView.state)
  }

  getBubbleMenuConfig({
    state,
    view,
  }: {
    state: EditorState
    view: EditorView
  }): BubbleMenuConfig | undefined {
    const linkPluginState = linkPluginKey.getState(state)

    if (!state.selection.empty && !(state.selection instanceof TextSelection)) {
      return undefined
    }

    if (linkPluginState?.status === LinkStatus.ShowTool) {
      return {
        items: [
          {
            type: 'button',
            icon: 'edit-line',
            name: '编辑超链接',
            isActive: false,
            onClick: () => {
              this.editor.commandOnce.editInsertedLink()
            },
          },
          {
            type: 'button',
            icon: 'link-unlink-m',
            name: '取消超链接',
            isActive: false,
            onClick: () => {
              if (linkPluginState.activeLink) {
                this.editor.commandOnce.unlink({
                  from: linkPluginState.activeLink.from,
                  to: linkPluginState.activeLink.to,
                })
              }
            },
          },
          {
            type: 'button',
            icon: 'external-link-line',
            name: '打开超链接',
            isActive: false,
            onClick: () => {
              this.editor.commandOnce.openSelectedLink()
            },
          },
        ],
        getBoundingClientRect: () => {
          return selectionToRect(view, state.selection)
        },
        placement: {
          vertical: 'top',
          horizontal: 'center',
        },
        offset: {
          x: 0,
          y: 8,
        },
      }
    }

    if (
      linkPluginState?.status &&
      [LinkStatus.Create, LinkStatus.Edit].includes(linkPluginState.status)
    ) {
      return {
        items: [
          {
            type: 'custom',
            render: () => {
              return <EditLink />
            },
          },
        ],
        getBoundingClientRect: () => {
          return selectionToRect(view, state.selection)
        },
      }
    }
  }

  addPMPlugins() {
    const ext = this

    return [
      new Plugin<LinkPluginState>({
        key: linkPluginKey,
        state: {
          init() {
            return {
              status: LinkStatus.None,
              activeLink: null,
            }
          },
          apply(tr, value, oldState, newState) {
            const meta = tr.getMeta(linkPluginKey)
            if (meta && meta.type) {
              switch (meta.type) {
                case LinkAction.ClickLink:
                  return {
                    status: LinkStatus.ShowTool,
                    activeLink: meta.link,
                  }
                case LinkAction.BlurLink:
                  return {
                    status: LinkStatus.None,
                    activeLink: null,
                  }
                case LinkAction.EditInsertedLink:
                  if (value.activeLink) {
                    return {
                      status: LinkStatus.Edit,
                      activeLink: value.activeLink,
                    }
                  }
                  break
                case LinkAction.AddLinkToSelection:
                  return {
                    status: LinkStatus.Edit,
                    activeLink: null,
                  }

                case LinkAction.AttachLink:
                  return {
                    ...value,
                    status: LinkStatus.Create,
                  }
                default:
              }
            }

            return value
          },
        },

        view() {
          return {
            update: (view) => {
              ext.emitter.emit('update', linkPluginKey.getState(view.state))
            },
          }
        },

        props: {
          handleDOMEvents: {
            // blur(view) {
            //   console.log('[Extension Link] blur')
            //   const tr = view.state.tr.setMeta(linkPluginKey, {
            //     type: LinkAction.BlurLink,
            //   })
            //   view.dispatch(tr)
            //   return false
            // },
            click(view, event) {
              if (!clickOn) {
                const tr = view.state.tr.setMeta(linkPluginKey, {
                  type: LinkAction.BlurLink,
                })
                view.dispatch(tr)
              }
              clickOn = false

              return true
            },
          },
          // return false 说明最终还会让 prosemirror 接管
          handleClickOn: (view, pos, node, nodePos, event, direct) => {
            clickOn = true
            const { doc, schema } = view.state
            const $pos = doc.resolve(pos)

            const markRange = getMarkRange($pos, schema.marks.link)
            if (!markRange) {
              const tr = view.state.tr.setMeta(linkPluginKey, {
                link: null,
                type: LinkAction.BlurLink,
              })
              view.dispatch(tr)
              return false
            }

            const tr = view.state.tr.setMeta(linkPluginKey, {
              link: {
                ...markRange,
              },
              type: LinkAction.ClickLink,
            })

            view.dispatch(tr)

            return true
          },

          transformPasted: (slice) => {
            const handler = (fragment: Fragment, parent?: Node) => {
              const nodes: Node[] = []

              fragment.forEach((child) => {
                if (child.isText && child.text) {
                  const { text } = child
                  let pos = 0
                  let match

                  while ((match = pasteRegex.exec(text)) !== null) {
                    if (
                      parent?.type.allowsMarkType(this.editor.schema.marks.link)
                    ) {
                      const start = match.index
                      const end = start + match[0].length

                      if (start > 0) {
                        nodes.push(child.cut(pos, start))
                      }

                      nodes.push(
                        child.cut(start, end).mark(
                          this.editor.schema.marks.link
                            .create({
                              href: match[0],
                            })
                            .addToSet(child.marks),
                        ),
                      )

                      pos = end
                    }
                  }

                  if (pos < text.length) {
                    nodes.push(child.cut(pos))
                  }
                } else {
                  nodes.push(child.copy(handler(child.content, child)))
                }
              })

              return Fragment.fromArray(nodes)
            }

            return new Slice(
              handler(slice.content),
              slice.openStart,
              slice.openEnd,
            )
          },
        },
      }),
    ]
  }
}
