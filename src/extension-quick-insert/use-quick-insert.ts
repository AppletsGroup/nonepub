import { useEffect, useState } from 'react'
import { QuickInsertChangeHandlerProps, QuickInsertExtension } from '.'
import { useExtension } from '@/react/hooks/use-extension'

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
