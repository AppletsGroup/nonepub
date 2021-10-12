import React, { forwardRef, CSSProperties } from 'react'
import styled from 'styled-components'
import Icon from '../icon'
import { blue } from '@ant-design/colors'

const Wrapper = styled.div`
  height: 40px;
  padding: 0 8px;
  box-sizing: border-box;
  box-shadow: 0px 4px 12px rgba(0, 0, 0, 0.08), 0px 0px 2px rgba(0, 0, 0, 0.06);
  border-radius: 4px;
  background-color: #fff;
  display: inline-flex;
`

interface ItemWrapperProps {
  active: boolean
}

const ItemWrapper = styled.div`
  width: 40px;
  height: 40px;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  color: ${(props: ItemWrapperProps) =>
    props.active ? blue.primary : 'rgba(32, 36, 38, 0.6)'};

  &:hover {
    color: rgba(32, 36, 38, 0.8);
  }
`

export interface BubbleMenuItem {
  icon: string
  name: string
  isActive: boolean
  shortcut?: string[]
  markdown?: string
  alias?: string[]
  commandName?: string
  commandOptions?: any
}

interface BubbleMenuProps<MenuItem> {
  style?: CSSProperties
  items: MenuItem[]
  onClick?: (menuItem: MenuItem) => void
}

function BubbleMenu<MenuItem extends BubbleMenuItem>(
  props: BubbleMenuProps<MenuItem>,
  ref: any,
) {
  return (
    <Wrapper
      ref={ref}
      style={props.style}
      onMouseDown={(e) => {
        e.stopPropagation()
        e.preventDefault()
      }}
    >
      {props.items.map((item) => {
        return (
          <ItemWrapper
            active={item.isActive}
            onClick={(e) => {
              if (props.onClick) {
                // e.preventDefault()
                // e.stopPropagation()
                props.onClick(item)
              }
            }}
          >
            <Icon name={item.icon} />
          </ItemWrapper>
        )
      })}
    </Wrapper>
  )
}

const ForwardRefBubbleMenu = forwardRef(BubbleMenu) as <
  MenuItem extends BubbleMenuItem,
>(
  props: BubbleMenuProps<MenuItem> & { ref?: React.ForwardedRef<any> },
) => ReturnType<typeof BubbleMenu>

export default ForwardRefBubbleMenu
