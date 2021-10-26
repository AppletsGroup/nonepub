import Icon from '@/react/ui/icon'
import { CSSProperties, useCallback } from 'react'
import classNames from 'classnames'
import { useEditorContext } from '@/react/hooks/use-editor-context'
import { OverviewAction, pluginKey } from '.'

export interface HelpButtonProps {
  style?: CSSProperties
  className?: string
}

export default function HelpButton(props: HelpButtonProps) {
  const { editor } = useEditorContext()

  const handleClick = useCallback(() => {
    const { editorView: view } = editor
    const tr = view.state.tr.setMeta(pluginKey, {
      type: OverviewAction.ToggleOverview,
    })
    view.dispatch(tr)
  }, [editor])

  const className = classNames(
    'w-8 h-8 fixed right-3 bottom-3 shadow-lg rounded-full flex justify-center items-center border border-gray-200 text-gray-600 cursor-pointer',
    props.className,
  )

  return (
    <div className={className} style={props.style} onClick={handleClick}>
      <Icon name="question-fill" />
    </div>
  )
}
