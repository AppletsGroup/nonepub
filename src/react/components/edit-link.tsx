import { LinkExtension, LinkStatus } from '@/extension-link'
import {
  InputHTMLAttributes,
  KeyboardEventHandler,
  MouseEventHandler,
  useEffect,
  useMemo,
  useRef,
  useState,
} from 'react'
import { useEditorContext } from '../hooks/use-editor-context'
import { useExtension } from '../hooks/use-extension'
import { useEditorState } from '../hooks/use-editor-state'
import UiVirtualTriggerPopup from '../ui/virtual-trigger-popup'
import styled, { CSSProperties } from 'styled-components'
import { selectionToRect } from '@/core/utils/selection-to-rect'
import UiBubbleMenu, { BubbleMenuItem } from '../ui/bubble-menu'
import UiCard from '../ui/card'
import { TextSelection } from 'prosemirror-state'
import Icon from '../ui/icon'
import { cursorLocator, useLocator } from '@/extension-locator'
import LocationPopup from '../ui/location-popup'

type MenuItem = BubbleMenuItem

const Wrapper = styled.div`
  box-shadow: 0px 4px 12px rgba(0, 0, 0, 0.08), 0px 0px 2px rgba(0, 0, 0, 0.06);
  border-radius: 4px;
  background-color: #fff;
  padding: 8px;
`

export function useLinkState() {
  const linkExtension = useExtension(LinkExtension)
  const [state, setState] = useState(linkExtension.getState())
  useEffect(() => {
    const onUpdate = (s: any) => {
      setState(s)
    }
    const cancel = linkExtension.onStateUpdate(onUpdate)

    return cancel
  }, [linkExtension])

  return state!
}

type InputWithIconProps = {
  icon: string
  placeholder?: string
  style?: CSSProperties
  onKeyDown?: KeyboardEventHandler<HTMLInputElement>
  onChange?: (str: string) => void
  value?: string
}

const InputWithIconWrapper = styled.div`
  display: flex;
  align-items: center;
  padding: 8px;
  font-size: 14px;
`

const InputInner = styled.input`
  outline: none;
  border: none;
`

function InputWithIcon(props: InputWithIconProps) {
  const { icon } = props
  return (
    <InputWithIconWrapper style={props.style}>
      <Icon name={icon} style={{ marginRight: 8 }} />
      <InputInner
        placeholder={props.placeholder}
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
    </InputWithIconWrapper>
  )
}

// TODO: 全局的 还是 component 维度的
export default function EditLink() {
  const { editor } = useEditorContext()
  const { state, prevState } = useEditorState()
  const linkState = useLinkState()

  const [href, setHref] = useState('')
  const [text, setText] = useState('')

  const url = linkState.activeLink?.mark?.attrs?.href ?? ''

  useEffect(() => {
    setHref(url)
  }, [url])

  useEffect(() => {
    if (linkState.status === LinkStatus.Create) {
      setText('')
    }
  }, [linkState.status])

  const { location, isActive } = useLocator(
    cursorLocator,
    [LinkStatus.Create, LinkStatus.Edit].includes(linkState.status),
  )

  const menuItems: MenuItem[] = [
    {
      icon: 'edit-line',
      name: '编辑超链接',
      isActive: false,
    },
    {
      icon: 'link-unlink-m',
      name: '取消超链接',
      isActive: false,
    },
    {
      icon: 'external-link-line',
      name: '打开超链接',
      isActive: false,
    },
  ]

  const handleMenuItemClick = (item: MenuItem) => {
    switch (item.name) {
      case '打开超链接':
        editor?.commandOnce.openSelectedLink()
        break
      case '编辑超链接':
        editor?.commandOnce.editInsertedLink()
        break
      case '取消超链接':
        if (linkState.activeLink) {
          editor?.commandOnce.unlink({
            from: linkState.activeLink.from,
            to: linkState.activeLink.to,
          })
        }
        break
    }
  }

  return (
    <>
      <LocationPopup
        location={location}
        visible={linkState.status === LinkStatus.ShowTool}
        dismissImmediately
        offset={[0, 8]}
        placement="top"
      >
        <UiBubbleMenu items={menuItems} onClick={handleMenuItemClick} />
      </LocationPopup>
      <LocationPopup
        location={location}
        visible={isActive}
        dismissImmediately
        offset={[0, 8]}
        placement="top"
      >
        <UiCard>
          <InputWithIcon
            icon="link"
            placeholder="请输入链接"
            style={{ width: 400 }}
            value={href}
            onChange={(_href) => {
              setHref(_href)
            }}
            onKeyDown={(e) => {
              if (e.key === 'Enter') {
                e.stopPropagation()
                e.preventDefault()
                editor?.commandOnce.setLink({
                  href,
                  text: '',
                })
              }
            }}
          />
          {linkState.status === LinkStatus.Create && (
            <InputWithIcon
              icon="text"
              placeholder="请输入文字"
              style={{ width: 400 }}
              value={text}
              onChange={(_text) => {
                setText(_text)
              }}
              onKeyDown={(e) => {
                e.stopPropagation()

                if (e.key === 'Enter') {
                  editor?.commandOnce.setLink({
                    href,
                    text,
                  })
                }
              }}
            />
          )}
        </UiCard>
      </LocationPopup>
    </>
  )
}
