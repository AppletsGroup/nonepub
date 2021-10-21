import { LinkExtension, LinkStatus } from '@/extension-link'
import { useEffect, useRef, useState } from 'react'
import { useEditorContext } from '@/react/hooks/use-editor-context'
import { useExtension } from '@/react/hooks/use-extension'
import styled from 'styled-components'
import { BubbleMenuItem } from '@/react/ui/bubble-menu'
import UiCard from '@/react/ui/card'
import InputWithIcon from '@/react/ui/input-with-icon'

const Separator = styled.div`
  height: 1px;
  width: 100%;
  background: rgba(32, 36, 38, 0.1);
`

function useLinkState() {
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

export default function EditLink() {
  const { editor } = useEditorContext()
  const linkState = useLinkState()
  const inputRef = useRef<HTMLInputElement | null>(null)

  const [href, setHref] = useState('')
  const [text, setText] = useState('')

  const url = linkState.activeLink?.mark?.attrs?.href ?? ''

  useEffect(() => {
    inputRef.current?.focus({
      preventScroll: true,
    })
  }, [])

  useEffect(() => {
    setHref(url)
  }, [url])

  useEffect(() => {
    if (linkState.status === LinkStatus.Create) {
      setText('')
    }
  }, [linkState.status])

  return (
    <UiCard>
      <InputWithIcon
        ref={inputRef}
        icon="link"
        placeholder="请输入链接"
        style={{ width: 250 }}
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
      {linkState.status === LinkStatus.Create && <Separator />}
      {linkState.status === LinkStatus.Create && (
        <InputWithIcon
          icon="text"
          placeholder="请输入文字"
          style={{ width: 250 }}
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
  )
}
