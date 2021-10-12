import { EventEmitter } from '@/core/event-emitter'
import { Extension } from '@/core/extension'
import { createUniqueId } from '@/utils'
import React from 'react'

export class PortalContainer {
  portalMap: Map<Element, { Component: React.ReactNode; key: string }>
  rendererCallback?: () => void
  pendingUpdates = new Map<Element, any>()
  // 监听 dom 对应的变化
  listeners = new Map<Element, Set<any>>()
  private emitter = new EventEmitter()

  shouldRerenderPortals = true

  constructor() {
    this.portalMap = new Map()
  }

  render(component: React.ReactNode, container: Element) {
    this.portalMap.set(container, {
      Component: component,
      key: this.portalMap.get(container)?.key ?? createUniqueId(),
    })

    this.emitter.emit('update', this.portalMap)
  }

  remove(container: Element) {
    this.portalMap.delete(container)

    this.emitter.emit('update', this.portalMap)
  }

  onUpdate(fn: any) {
    this.emitter.on('update', fn)
  }
}

export class ReactExtension extends Extension {
  private portalContainer = new PortalContainer()
  private contentDom = document.createElement('div')

  constructor() {
    super()
    this._store.set('portalContainer', this.portalContainer)
    this.contentDom.className = 'xx-editor-content-wrapper'
    document.body.appendChild(this.contentDom)
  }

  name = 'react'

  getPortalContainer() {
    return this.portalContainer
  }

  beforeResolvedAll() {
    const components: { key: string; Component: React.ComponentType }[] = []

    this.editor.extensions.forEach((ext) => {
      const key = ext.name + '_react_view'
      const Component = ext.getReactContentComponent?.()
      Component &&
        components.push({
          key,
          Component,
        })
    })

    this.portalContainer.render(
      <>
        {components.map(({ key, Component }) => {
          return <Component key={key} />
        })}
      </>,
      this.contentDom,
    )
  }
}

export * from './react-node-view'

declare global {
  namespace XEditor {
    interface ExtensionStoreKV {
      portalContainer: PortalContainer
    }

    interface ExtensionAddons {
      /**
       * @injectBy ReactExtension
       */
      getReactContentComponent?(): React.ComponentType | null
    }
  }
}
