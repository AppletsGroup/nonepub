import {
  MouseEvent,
  PropsWithChildren,
  useCallback,
  useEffect,
  useRef,
} from 'react'
import { createPortal } from 'react-dom'
import Card from '../card'
import Icon from '../icon'

interface ModalProps {
  title: string
  visible?: boolean
  onClose?: () => void
}

export default function Modal(props: PropsWithChildren<ModalProps>) {
  const maskRef = useRef<HTMLDivElement | null>(null)

  useEffect(() => {
    if (props.visible) {
      document.body.classList.add('overflow-hidden')
    } else {
      document.body.classList.remove('overflow-hidden')
    }
  }, [props.visible])

  const handleMaskClick = useCallback((e: MouseEvent<HTMLDivElement>) => {
    if (e.target === maskRef.current) {
      props.onClose?.()
    }
  }, [])

  return createPortal(
    <div
      className="fixed w-screen h-screen bg-black bg-opacity-80 left-0 top-0 flex justify-center items-center"
      ref={maskRef}
      style={{
        zIndex: 99999,
        display: props.visible ? 'flex' : 'none',
      }}
      onClick={handleMaskClick}
    >
      <Card>
        <div className="p-4">
          <div className="text-lg text-gray-700 mb-2">{props.title}</div>
          <div>{props.children}</div>
        </div>
        <Icon
          name="close-fill"
          className="absolute right-2 top-1 cursor-pointer"
          onClick={props.onClose}
        />
      </Card>
    </div>,
    document.body,
  )
}
