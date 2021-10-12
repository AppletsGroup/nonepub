import React, { useState } from 'react'
import { animated, useTransition } from 'react-spring'
import { usePopper } from 'react-popper'
import type { Placement, VirtualElement } from '@popperjs/core'

export type VirtualTriggerPopupProps = React.PropsWithChildren<{
  visible: boolean
  virtualTrigger: VirtualElement
  dismissImmediately?: boolean
  placement?: Placement
  offset?: [number, number]
}>

export default function VirtualTriggerPopup(props: VirtualTriggerPopupProps) {
  const transitions = useTransition(props.visible, {
    from: { opacity: 0 },
    enter: { opacity: 1 },
    leave: { opacity: 0, immediate: !!props.dismissImmediately, delay: 0 },
    delay: 50,
    config: {
      duration: 250,
    },
  })
  const [element, setElement] = useState<HTMLElement | null>(null)
  const { styles } = usePopper(props.virtualTrigger, element, {
    placement: props.placement || 'auto-start',
    modifiers: [
      {
        name: 'offset',
        options: {
          offset: props.offset || [0, 0],
        },
      },
    ],
  })

  return transitions(({ opacity }, item) => {
    return (
      item && (
        <animated.div
          ref={setElement}
          style={{
            position: 'fixed',
            opacity: opacity,
            ...styles.popper,
          }}
        >
          {props.children}
        </animated.div>
      )
    )
  })
}
