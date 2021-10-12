import React, {
  useMemo,
  useState,
  useEffect,
  useRef,
  useLayoutEffect,
  CSSProperties,
  useCallback,
} from 'react'
import { animated, useTransition } from 'react-spring'
import { usePopper } from 'react-popper'
import { Instance, Placement, VirtualElement } from '@popperjs/core'
import { INVISIBLE_RECT } from '@/extension-locator'
import { createPopper } from '@popperjs/core'
import { useMemoCompare } from '@/react/hooks/use-memo-compare'

export type LocationPopupProps = React.PropsWithChildren<{
  visible: boolean
  location: any
  dismissImmediately?: boolean
  placement?: Placement
  offset?: [number, number]
}>

interface MyPopperConfig {
  placement?: Placement
}

type UseMyPopperOptions = Parameters<typeof createPopper>[2]

function useMyPoper(
  reference: VirtualElement,
  el?: HTMLElement | null,
  options: UseMyPopperOptions = {},
) {
  const popper = useRef<Instance | null>(null)

  const [state, setState] = useState<{
    styles: {
      [k: string]: CSSProperties
    }
    attributes: {
      [k: string]: {
        [k: string]: string | boolean
      }
    }
  }>({
    styles: {
      popper: {
        position: 'absolute',
        left: '0',
        top: '0',
      },
      arrow: {
        position: 'absolute',
      },
    },
    attributes: {},
  })

  const memoOptions = useMemoCompare(options)

  useLayoutEffect(() => {
    if (reference && el) {
      popper.current = createPopper(reference, el, {
        placement: memoOptions.placement || 'top',
        modifiers: [
          { name: 'eventListeners', enabled: true },
          {
            name: 'updateState',
            enabled: true,
            phase: 'write',
            requires: ['computeStyles'],
            fn: (ref) => {
              const { state } = ref
              const elements = Object.keys(state.elements)
              console.log('before force update set state')
              setState({
                styles: Object.fromEntries(
                  elements.map((el) => {
                    return [el, state.styles[el] || {}]
                  }),
                ) as any,
                attributes: Object.fromEntries(
                  elements.map((el) => {
                    return [el, state.attributes[el]]
                  }),
                ),
              })
            },
          },
          {
            name: 'applyStyles',
            enabled: false,
          },
          ...(memoOptions.modifiers || []),
        ],
      })
    }

    return () => {
      if (popper.current) {
        popper.current.destroy()
        popper.current = null
      }
    }
  }, [reference, el, memoOptions])

  useEffect(() => {
    const id = window.requestAnimationFrame(() => {
      console.log(
        'before force update',
        el?.getBoundingClientRect(),
        el?.innerHTML,
        reference.getBoundingClientRect(),
      )
      popper.current?.forceUpdate()
    })

    return () => {
      window.cancelAnimationFrame(id)
    }
  }, [el, reference])

  return {
    state: popper.current ? popper.current.state : null,
    styles: state.styles,
    attributes: state.attributes,
    update: popper.current ? popper.current.update : null,
    forceUpdate: popper.current ? popper.current.forceUpdate : null,
  }
}

export default function LocationPopup(props: LocationPopupProps) {
  const transitions = useTransition(props.visible, {
    from: { opacity: 0 },
    enter: { opacity: 1 },
    leave: { opacity: 0, immediate: !!props.dismissImmediately, delay: 0 },
    delay: 50,
    config: {
      duration: 250,
    },
  })
  // const [virtualTrigger, setVirtualTrigger] = useState<VirtualElement>({
  //   getBoundingClientRect() {
  //     return INVISIBLE_RECT
  //   },
  // })
  const virtualTrigger = useMemo<VirtualElement>(() => {
    return {
      getBoundingClientRect() {
        return props.location.rect || INVISIBLE_RECT
      },
    }
  }, [
    props.location?.rect.top,
    props.location?.rect.left,
    props.location?.rect.width,
    props.location?.rect.height,
  ])

  // useEffect(() => {
  //   console.log('trigger use effect')
  //   setVirtualTrigger({
  //     getBoundingClientRect() {
  //       console.log('force update', props.location.rect)
  //       return props.location.rect
  //     },
  //   })
  // }, [props.location.rect])

  const [element, setElement] = useState<HTMLElement | null>(null)
  const { styles, forceUpdate, update } = useMyPoper(virtualTrigger, element, {
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

  // useEffect(() => {
  //   forceUpdate?.()
  // }, [forceUpdate, props.children])

  return props.visible ? (
    <div
      ref={setElement}
      style={{
        zIndex: 1000,
        ...styles.popper,
      }}
    >
      {props.children}
    </div>
  ) : null

  // return transitions(({ opacity }, item) => {
  //   return (
  //     item && (
  //       <animated.div
  //         ref={(el: HTMLElement | null) => {
  //           console.log('location popup set element', el)
  //           setElement(el)
  //         }}
  //         className="location-popup"
  //         style={{
  //           position: 'fixed',
  //           opacity: opacity,
  //           ...styles.popper,
  //         }}
  //       >
  //         {props.children}
  //       </animated.div>
  //     )
  //   )
  // })
}
