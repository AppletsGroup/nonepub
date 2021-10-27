import Icon from '../icon'
import styled from 'styled-components'
import KeyboardButton from '../keyboard-button'
import { useEffect, useState, forwardRef, useRef } from 'react'

const Card = styled.div`
  width: 420px;
  box-sizing: border-box;
  box-shadow: 0px 4px 12px rgba(0, 0, 0, 0.08), 0px 0px 2px rgba(0, 0, 0, 0.06);
  border-radius: 4px;
  overflow: hidden;
  background-color: #fff;
`

const Wrapper = styled.div`
  box-sizing: border-box;
  width: 420px;
  padding: 8px;
  display: flex;
  flex-wrap: wrap;

  &:focus {
    outline: none;
    border: none;
  }
`

const Footer = styled.div`
  box-sizing: border-box;
  width: 420px;
  height: 32px;
  box-shadow: 0px 1px 8px 0px rgba(0, 0, 0, 0.08);
  display: flex;
  justify-content: space-between;
  align-items: center;
  font-size: 12px;
  padding: 0 8px;
`

const ShortcutWrapper = styled.div`
  display: flex;
  align-items: center;
  color: rgba(32, 36, 38, 0.4);
`

const MarkdownWrapper = styled.div`
  display: flex;
  align-items: center;
  color: rgba(32, 36, 38, 0.4);
`

interface ItemWrapperProps {
  active: boolean
}

const ItemWrapper = styled.div`
  box-sizing: border-box;
  width: 134px;
  display: flex;
  align-items: center;
  font-size: 14px;
  color: rgba(32, 36, 38, 0.6);
  padding: 8px;
  border-radius: 4px;
  cursor: pointer;
  background: ${(props: ItemWrapperProps) =>
    props.active ? 'rgba(32, 36, 38, 0.03)' : 'transparent'};
`

const Name = styled.div`
  margin-left: 8px;
  color: rgba(32, 36, 38, 0.8);
`

export type QuickInsertItem = {
  icon?: string
  name?: string
  shortcut?: string[]
  markdown?: string
  alias?: string[]
  commandName?: string
  commandOptions?: any
}

export type Props = {
  items: QuickInsertItem[]
  onItemClick?: (item: QuickInsertItem) => void
  keyword?: string
  activeIndex?: number
  onActiveIndexChange?: (idx: number) => void
}

const QuickInsertCard = forwardRef((props: Props, ref) => {
  const { items } = props

  const handleMouseEnter = (idx: number) => {
    props.onActiveIndexChange?.(idx)
  }

  const handleMouseLeave = (idx: number) => {}

  const handleItemClick = (idx: number) => {
    props.onItemClick && props.onItemClick(items[idx])
  }

  const activeItem = props.activeIndex != null ? items[props.activeIndex] : null

  return (
    <Card ref={ref as any}>
      <Wrapper>
        {items.map((item, idx) => (
          <ItemWrapper
            key={item.name}
            active={props.activeIndex === idx}
            onMouseEnter={() => {
              handleMouseEnter(idx)
            }}
            onMouseLeave={() => {
              handleMouseLeave(idx)
            }}
            onClick={() => {
              handleItemClick(idx)
            }}
          >
            {item.icon && <Icon name={item.icon} />}
            <Name>{item.name}</Name>
          </ItemWrapper>
        ))}
      </Wrapper>
      <Footer>
        {activeItem ? (
          <>
            <ShortcutWrapper>
              <div>快捷键：</div>
              {(activeItem.shortcut || []).map((keyName) => {
                return <KeyboardButton keyName={keyName} key={keyName} />
              })}
            </ShortcutWrapper>
            <MarkdownWrapper>Makrdown: {activeItem.markdown}</MarkdownWrapper>
          </>
        ) : null}
      </Footer>
    </Card>
  )
})

export default QuickInsertCard
