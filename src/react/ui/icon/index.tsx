import type { CSSProperties } from 'react'

type Props = {
  name: string
  style?: CSSProperties
  className?: string
  onClick?: () => void
}

export default function Icon({ name, style, className, onClick }: Props) {
  return (
    <span
      className={`iconfont icon-${name} ${className}`}
      style={style}
      onClick={onClick}
    />
  )
}
