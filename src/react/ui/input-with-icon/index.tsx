import React from 'react'
import { CSSProperties, KeyboardEventHandler } from 'react'
import Icon from '../icon'

type InputWithIconProps = {
  icon: string
  placeholder?: string
  style?: CSSProperties
  onKeyDown?: KeyboardEventHandler<HTMLInputElement>
  onChange?: (str: string) => void
  value?: string
}

function InputWithIcon(props: InputWithIconProps, ref: any) {
  const { icon } = props
  return (
    <div className="flex items-center p-2 text-xs text-gray-600">
      <Icon name={icon} style={{ marginRight: 8 }} />
      <input
        ref={ref}
        placeholder={props.placeholder}
        className="flex outline-none border-none placeholder-gray-400"
        style={{ flex: '1' }}
        onKeyDown={props.onKeyDown}
        onKeyPress={(e) => {
          e.stopPropagation()
        }}
        onKeyUp={(e) => {
          e.stopPropagation()
        }}
        onChange={(e) => {
          props.onChange?.(e.target.value)
        }}
        onSubmit={(e) => {}}
        value={props.value}
      />
    </div>
  )
}

export default React.forwardRef(InputWithIcon) as (
  props: InputWithIconProps & { ref?: React.ForwardedRef<HTMLInputElement> },
) => ReturnType<typeof InputWithIcon>
