import { ReactExtension } from '@/extension-react'
import { useCallback, useEffect, useReducer } from 'react'
import { createPortal } from 'react-dom'
import { useExtension } from '../hooks/use-extension'

export function PortalRenderer() {
  const reactExtension = useExtension(ReactExtension)
  const portalContainer = reactExtension.getPortalContainer()
  const [, forceUpdate] = useReducer((x) => x + 1, 0)

  const onPortalUpdate = useCallback(() => {
    forceUpdate()
  }, [])

  useEffect(() => {
    portalContainer.onUpdate(onPortalUpdate)
  }, [onPortalUpdate, portalContainer])

  console.log('portal renderer rerender')

  return (
    <>
      {Array.from(portalContainer.portalMap.entries()).map(
        ([container, portal]) => {
          return createPortal(portal.Component, container, portal.key)
        },
      )}
    </>
  )
}
