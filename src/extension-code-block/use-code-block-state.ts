import { useExtension } from '@/react/hooks/use-extension'
import { useEffect, useState } from 'react'
import { CodeBlockExtension, CodeBlockPluginState } from '.'

export function useCodeBlockState() {
  const extension = useExtension(CodeBlockExtension)
  const [state, setState] = useState<CodeBlockPluginState>(extension.getState())

  useEffect(() => {
    const onStateUpdate = (s: CodeBlockPluginState) => {
      setState(s)
    }

    const cancel = extension.onStateUpdate(onStateUpdate)

    return cancel
  }, [extension])

  return state
}
