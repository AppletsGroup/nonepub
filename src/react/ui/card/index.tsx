import React, { forwardRef, CSSProperties } from 'react'
import styled from 'styled-components'

const Wrapper = styled.div`
  box-sizing: border-box;
  box-shadow: 0px 4px 12px rgba(0, 0, 0, 0.08), 0px 0px 2px rgba(0, 0, 0, 0.06);
  border-radius: 4px;
  background-color: #fff;
`

type Props = React.PropsWithChildren<{
  style?: CSSProperties
}>

function Card(props: Props, ref: any) {
  return (
    <div
      className="box-border shadow rounded bg-white"
      ref={ref}
      style={props.style}
      onMouseDown={(e) => {
        e.stopPropagation()
      }}
    >
      {props.children}
    </div>
  )
}

const ForwardRefCard = forwardRef(Card) as (
  props: Props & { ref?: React.ForwardedRef<HTMLDivElement> },
) => ReturnType<typeof Card>

export default ForwardRefCard
