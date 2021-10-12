import {
  QuickInsertChangeHandlerProps,
  QuickInsertExtension,
} from '@/extension-quick-insert'
import { QuickInsertPluginProps } from '@/extension-quick-insert/plugin'
import { useEffect, useState } from 'react'
import { useExtension } from './use-extension'

export function useQuickInsert() {
  const extension = useExtension(QuickInsertExtension)

  const [state, setState] = useState<QuickInsertChangeHandlerProps>({
    items: [],
    visible: false,
  })

  useEffect(() => {
    extension.addQuickInsertChangeHandler((props) => {
      setState(props)
    })
  }, [extension])

  return state
}
