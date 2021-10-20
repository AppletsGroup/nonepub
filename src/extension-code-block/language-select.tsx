import { KEYBOARD } from '@/core/utils/dom'
import { useEditorContext } from '@/react/hooks/use-editor-context'
import { useEventListener } from '@/react/hooks/use-event-listener'
import { useExtensionState } from '@/react/hooks/use-extension'
import { useOnClickOutside } from '@/react/hooks/use-on-click-outside'
import Card from '@/react/ui/card'
import InputWithIcon from '@/react/ui/input-with-icon'
import {
  MouseEvent,
  MouseEventHandler,
  useEffect,
  useRef,
  useState,
} from 'react'
import styled from 'styled-components'
import { CodeBlockExtension, CodeBlockMeta, codeBlockPluginKey } from '.'
import { useCodeBlockState } from './use-code-block-state'
import classNames from 'classnames'

const languages = ['plain', 'javascript', 'python', 'go', 'shell', 'jsx']

interface OptionItemProps {
  isActive?: boolean
}

export function LanguageSelect() {
  const { editor } = useEditorContext()
  const codeBlockState = useExtensionState(CodeBlockExtension)
  const inputRef = useRef<HTMLInputElement | null>(null)
  const nodeRef = useRef<HTMLDivElement | null>(null)
  const [keyword, setKeyword] = useState('')
  const [activeLang, setActiveLang] = useState('plain')
  const [filteredLanguages, setFilteredLanguages] = useState<string[]>([])

  useEffect(() => {
    inputRef.current?.focus({
      preventScroll: true,
    })
  }, [])

  useEffect(() => {
    if (typeof codeBlockState.activeNodePos === 'number') {
      const node = editor.editorView.state.doc.nodeAt(
        codeBlockState.activeNodePos,
      )
      if (node && node.type.name === 'code_block' && node.attrs.mode) {
        setActiveLang(node.attrs.mode)
      }
    }
  }, [codeBlockState.activeNodePos, editor])

  useEffect(() => {
    let next: string[] = []
    if (keyword) {
      next = languages.filter((l) => l.includes(keyword))
    } else {
      next = languages
    }

    if (!next.includes(activeLang)) {
      if (next.length > 0) {
        setActiveLang(next[0])
      } else {
        setActiveLang('')
      }
    }
    setFilteredLanguages(next)
  }, [keyword, activeLang])

  useOnClickOutside(nodeRef, () => {
    editor.editorView.dispatch(
      editor.editorView.state.tr.setMeta(codeBlockPluginKey, {
        action: 'SELECT_LANG_DISMISS',
      } as CodeBlockMeta),
    )
  })

  useEventListener(
    'keydown',
    (ev) => {
      const currentIdx = filteredLanguages.indexOf(activeLang)
      let nextIndex = currentIdx
      switch (ev.key) {
        case KEYBOARD.ARROW_UP:
          nextIndex = currentIdx <= 0 ? 0 : currentIdx - 1
          setActiveLang(filteredLanguages[nextIndex])
          ev.preventDefault()
          ev.stopPropagation()
          break
        case KEYBOARD.ARROW_DOWN:
          nextIndex =
            currentIdx >= filteredLanguages.length - 1
              ? filteredLanguages.length - 1
              : currentIdx + 1
          setActiveLang(filteredLanguages[nextIndex])
          ev.preventDefault()
          ev.stopPropagation()
          break
        case KEYBOARD.ENTER:
          if (activeLang) {
            handleLangClick(activeLang)
          }
          ev.preventDefault()
          ev.stopPropagation()
          break
        default:
      }
    },
    true,
  )

  const handleLangClick = (lang: string) => {
    const state = codeBlockPluginKey.getState(editor.editorView.state)
    if (typeof state?.activeNodePos === 'number' && state?.isSelectLang) {
      editor.editorView.dispatch(
        editor.editorView.state.tr
          .setMeta(codeBlockPluginKey, {
            action: 'SELECT_LANG_DISMISS',
          } as CodeBlockMeta)
          .setNodeMarkup(state.activeNodePos, undefined, {
            mode: lang,
          }),
      )
      editor.editorView.focus()
    }
  }

  const handleMouseEnter = (ev: MouseEvent, lang: string) => {
    setActiveLang(lang)
  }

  const getOptionClassName = (isActive: boolean) => {
    return classNames(
      'py-1',
      'px-2',
      'text-sm',
      'text-gray-600',
      'cursor-pointer',
      {
        'bg-gray-100': isActive,
      },
    )
  }

  return (
    <Card ref={nodeRef}>
      <InputWithIcon
        ref={inputRef}
        value={keyword}
        icon="search-line"
        onChange={(v) => setKeyword(v)}
        placeholder="搜索语言..."
      />
      <div className="pb-1">
        {filteredLanguages.map((lang) => (
          <div
            className={getOptionClassName(lang === activeLang)}
            key={lang}
            onClick={() => {
              handleLangClick(lang)
            }}
            onMouseEnter={(e) => handleMouseEnter(e, lang)}
          >
            {lang}
          </div>
        ))}
      </div>
    </Card>
  )
}
