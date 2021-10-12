import { INVISIBLE_RECT } from '@/extension-locator'
import { useExtension } from '@/react/hooks/use-extension'
import LocationPopup from '@/react/ui/location-popup'
import Card from '@/react/ui/card'
import 'emoji-mart/css/emoji-mart.css'
import { useEffect, useRef, useState } from 'react'
import { EmojiExtension } from '.'
import { Emoji, searchEmoji } from './utils'
import styled from 'styled-components'
import { useEditorContext } from '@/react/hooks/use-editor-context'
import { useEventListener } from '@/react/hooks/use-event-listener'
import { KEYBOARD } from '@/core/utils/dom'

const EMOJI_ROW_COUNT = 6

function getListItemOnDirection<T>(
  curr: number | undefined,
  items: T[],
  direction: 'top' | 'right' | 'bottom' | 'left',
  columnCount: number,
): { item: T; idx: number } | undefined {
  if (items.length === 0) {
    return undefined
  }

  if (curr == null && items.length > 0) {
    return {
      item: items[0],
      idx: 0,
    }
  }

  let next = 0

  switch (direction) {
    case 'top':
      next = curr! - columnCount
      break
    case 'right':
      next = curr! + 1
      break
    case 'bottom':
      next = curr! + columnCount
      break
    case 'left':
      next = curr! - 1
      break
  }

  if (next < 0 || next > items.length - 1) {
    return {
      item: items[curr!],
      idx: curr!,
    }
  }

  return {
    item: items[next],
    idx: next,
  }
}

export default function EmojiPicker() {
  const { editor } = useEditorContext()
  const extension = useExtension(EmojiExtension)
  const [location, setLocatoin] = useState({
    rect: INVISIBLE_RECT,
  })
  const [visible, setVisible] = useState(false)
  const [filteredEmojiList, setFilteredEmojiList] = useState<Emoji[]>([])
  const [selectedEmoji, setSelectedEmoji] = useState<Emoji>()
  const [selectedEmojiIdx, setSelectedEmojiIdx] = useState<number>()
  const [range, setRange] = useState<{ from: number; to: number }>()
  const emojiListRef = useRef<HTMLDivElement | null>(null)
  const [navigateMethod, setNavigateMethod] = useState<'mouse' | 'key'>()

  useEffect(() => {
    const handleSuggestEmoji = (
      options: Parameters<Parameters<typeof extension.onSuggestEmoji>[0]>[0],
    ) => {
      if (options.rect) {
        setLocatoin({
          rect: options.rect,
        })
      }

      setVisible(options.visible)
      setRange(options.match.range)

      const keyword = options.match.text.slice(1)

      const emojiList = searchEmoji(keyword)
      setFilteredEmojiList(emojiList)
      if (emojiList.length > 0) {
        setSelectedEmoji(emojiList[0])
        setSelectedEmojiIdx(0)
      } else {
        setSelectedEmoji(undefined)
        setSelectedEmojiIdx(undefined)
      }
    }

    const cancel = extension.onSuggestEmoji(handleSuggestEmoji)

    return cancel
  }, [extension])

  useEventListener(
    'keydown',
    (ev) => {
      let direction: 'top' | 'right' | 'bottom' | 'left' | undefined

      switch (ev.key) {
        case KEYBOARD.ARROW_UP:
          direction = 'top'
          ev.preventDefault()
          ev.stopPropagation()
          break
        case KEYBOARD.ARROW_RIGHT:
          direction = 'right'
          ev.preventDefault()
          ev.stopPropagation()
          break
        case KEYBOARD.ARROW_DOWN:
          direction = 'bottom'
          ev.preventDefault()
          ev.stopPropagation()
          break
        case KEYBOARD.ARROW_LEFT:
          direction = 'left'
          ev.preventDefault()
          ev.stopPropagation()
          break
        case KEYBOARD.ENTER:
          handleEmojiSelect()
          ev.preventDefault()
          ev.stopPropagation()
      }

      if (direction) {
        const foundItem = getListItemOnDirection(
          selectedEmojiIdx,
          filteredEmojiList,
          direction,
          EMOJI_ROW_COUNT,
        )
        if (foundItem) {
          setSelectedEmoji(foundItem.item)
          setSelectedEmojiIdx(foundItem.idx)
        } else {
          setSelectedEmoji(undefined)
          setSelectedEmojiIdx(undefined)
        }
        setNavigateMethod('key')
      }
    },
    true,
    visible,
  )

  useEffect(() => {
    if (
      emojiListRef.current &&
      typeof selectedEmojiIdx === 'number' &&
      navigateMethod === 'key'
    ) {
      const children = [...emojiListRef.current.children]
      const emojiItemDom = children[selectedEmojiIdx] as HTMLElement
      const containerHeight = emojiListRef.current.offsetHeight
      const containerScrollHeight = emojiListRef.current.scrollTop

      if (
        emojiItemDom.offsetTop + emojiItemDom.offsetHeight <
          containerHeight + containerScrollHeight &&
        containerScrollHeight <
          emojiItemDom.offsetTop + emojiItemDom.offsetHeight - 8
      ) {
        // 说明可以看到，不改变
      } else if (
        containerScrollHeight >=
        emojiItemDom.offsetTop + emojiItemDom.offsetHeight
      ) {
        emojiListRef.current.scrollTop =
          emojiItemDom.offsetTop < 0 ? 0 : emojiItemDom.offsetTop
      } else {
        emojiListRef.current.scrollTop =
          emojiItemDom.offsetTop + emojiItemDom.offsetHeight - containerHeight
      }
    }
  }, [selectedEmojiIdx, navigateMethod])

  const handleEmojiSelect = () => {
    if (range) {
      editor.commandChain
        .replaceWith(
          range.from,
          range.to,
          editor.schema.text(selectedEmoji!.emoji),
        )
        .focus()
        .run()
    }
  }

  return (
    <LocationPopup location={location} visible={visible}>
      <Card>
        <EmojiListWrapper>
          <EmojiListInner ref={emojiListRef}>
            {filteredEmojiList.map((item, idx) => {
              return (
                <EmojiItem>
                  <EmojiItemInner
                    isActive={
                      !!(selectedEmoji && item.emoji === selectedEmoji.emoji)
                    }
                    onMouseEnter={() => {
                      setSelectedEmoji(item)
                      setSelectedEmojiIdx(idx)
                      setNavigateMethod('mouse')
                    }}
                    onClick={handleEmojiSelect}
                  >
                    {item.emoji}
                  </EmojiItemInner>
                </EmojiItem>
              )
            })}
          </EmojiListInner>
          <div>
            {selectedEmoji ? (
              <EmojiDetail>
                <EmojiDetailEmoji>{selectedEmoji.emoji}</EmojiDetailEmoji>
                <div>
                  <EmojiDetailName>{selectedEmoji.name}</EmojiDetailName>
                  <EmojiDetailKeyword>
                    :{selectedEmoji.slug}:
                  </EmojiDetailKeyword>
                </div>
              </EmojiDetail>
            ) : (
              '没找到'
            )}
          </div>
        </EmojiListWrapper>
      </Card>
    </LocationPopup>
  )
}

const EmojiListWrapper = styled.div`
  width: ${40 * EMOJI_ROW_COUNT + 8 * 2}px;
`

const EmojiListInner = styled.div`
  font-size: 24px;
  padding: 8px;
  display: flex;
  flex-wrap: wrap;
  height: 268px;
  overflow-y: scroll;
  align-items: flex-start;
  align-content: flex-start;
`

const EmojiItem = styled.div`
  width: 40px;
  height: 40px;
  background: #fff;
  display: flex;
  align-items: center;
  justify-content: center;
`

interface EmojiItemInnerProps {
  isActive: boolean
}

const EmojiItemInner = styled.div`
  width: 32px;
  height: 32px;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 4px;
  background: ${(props: EmojiItemInnerProps) =>
    props.isActive ? 'rgba(32, 36, 38, 0.1)' : 'transparent'};
  cursor: pointer;
`

const EmojiDetail = styled.div`
  padding: 8px;
  display: flex;
  align-items: center;
  border-top: 1px solid rgb(241, 242, 244);
`

const EmojiDetailEmoji = styled.div`
  font-size: 28px;
  margin: 0 8px;
  margin-right: 12px;
`

const EmojiDetailName = styled.div`
  font-size: 18px;
  color: rgba(32, 36, 38, 1);
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  width: 180px;
`

const EmojiDetailKeyword = styled.div`
  font-size: 14px;
  color: rgba(32, 36, 38, 0.8);
`
