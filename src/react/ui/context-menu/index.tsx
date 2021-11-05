import { PropsWithChildren } from 'react'
import Icon from '../icon'

interface ContextMenuItemProps {
  icon: string
  text: string
  onClick?: () => void
}

export function ContextMenuItem(props: ContextMenuItemProps) {
  return (
    <div
      className="flex justify-between items-center text-sm py-1.5 text-gray-700 cursor-pointer hover:"
      onClick={props.onClick}
    >
      <div className="flex items-center">
        <Icon name={props.icon} className="mr-3 text-sm" />
        <div>{props.text}</div>
      </div>
    </div>
  )
}

export function ContextMenu(props: PropsWithChildren<{}>) {
  return (
    <div className="bg-white shadow-md rounded py-1 px-3 w-40 border border-gray-200">
      {props.children}
    </div>
  )
}
