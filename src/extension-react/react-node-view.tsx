import React from 'react'
import { NodeView, Decoration, EditorView } from 'prosemirror-view'
import { Node as PMNode } from 'prosemirror-model'
import { PortalContainer } from '.'

export interface ReactNodeViewComponentProps {
  node: PMNode
  view: EditorView
  getPos: boolean | (() => number)
  isSelected: boolean
}

export class ReactNodeView implements NodeView {
  dom?: Element | null
  contentDOM?: Element | null

  node: PMNode
  view: EditorView
  getPos: boolean | (() => number)
  component: React.ComponentType<any>
  portalContainer: PortalContainer
  isSelected = false

  constructor(
    node: PMNode,
    view: EditorView,
    getPos: boolean | (() => number),
    component: React.ComponentType<any>,
    portalContainer: PortalContainer,
  ) {
    this.node = node
    this.view = view
    this.getPos = getPos
    this.component = component
    this.portalContainer = portalContainer
  }

  createOuterDOM() {
    return this.node.isInline
      ? document.createElement('span')
      : document.createElement('div')
  }

  createContentDOM(): Element | null {
    return null
  }

  init() {
    this.dom = this.createOuterDOM()
    this.dom.classList.add(`${this.node.type.name}_nodeview_dom`)

    this.contentDOM = this.createContentDOM()

    if (this.contentDOM) {
      this.dom.appendChild(this.contentDOM)
    }

    this.renderNode()

    return this
  }

  handleRef = (node: Element) => {
    if (node && this.contentDOM && !node.contains(this.contentDOM)) {
      node.appendChild(this.contentDOM)
    }
  }

  update(node: PMNode, decorations: Decoration[]) {
    if (!this.dom) {
      return false
    }

    if (node.type !== this.node.type) {
      return false
    }

    this.node = node

    this.renderNode()

    return true
  }

  ignoreMutation(
    mutation:
      | MutationRecord
      | {
          type: 'selection'
          target: Element
        },
  ): boolean {
    if (mutation.type === 'selection') {
      return false
    } else if (!this.contentDOM) {
      return true
    }

    return !this.contentDOM.contains(mutation.target)
  }

  destroy() {
    if (this.dom) {
      this.portalContainer.remove(this.dom)
    }
    this.dom = null
    this.contentDOM = null
  }

  selectNode() {
    this.isSelected = true

    this.renderNode()
  }

  renderNode() {
    const Component = this.component

    this.portalContainer.render(
      <Component
        ref={this.handleRef}
        node={this.node}
        isSelected={this.isSelected}
        getPos={this.getPos}
        view={this.view}
      />,
      this.dom!,
    )
  }

  deselectNode() {
    this.isSelected = false

    this.renderNode()
  }

  static fromComponent(
    component: React.ComponentType<any>,
    portalAPI: PortalContainer,
  ) {
    return (
      node: PMNode,
      view: EditorView,
      getPos: (() => number) | boolean,
    ) => {
      return new ReactNodeView(node, view, getPos, component, portalAPI).init()
    }
  }
}
