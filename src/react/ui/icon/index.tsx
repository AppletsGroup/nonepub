import type { CSSProperties } from 'react'

type Props = {
  name: string
  style?: CSSProperties
  className?: string
}

export default function Icon({ name, style, className }: Props) {
  return <span className={`iconfont icon-${name} ${className}`} style={style} />
}
