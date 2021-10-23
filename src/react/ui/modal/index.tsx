import { createPortal } from 'react-dom'
import Card from '../card'

export default function Modal() {
  return createPortal(
    <div
      className="fixed w-screen h-screen bg-black bg-opacity-80 left-0 top-0 flex justify-center items-center"
      style={{
        zIndex: 99999,
      }}
    >
      <Card>
        <div className="p-4">
          <div>标题</div>
          <div>内容</div>
          <div>底部</div>
        </div>
      </Card>
    </div>,
    document.body,
  )
}
