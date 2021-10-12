import { ReactNodeViewComponentProps } from '@/extension-react'
import { useExtension } from '@/react/hooks/use-extension'
import {
  ForwardedRef,
  forwardRef,
  MouseEvent,
  useEffect,
  useState,
} from 'react'
import { ImageExtension } from '.'
import styled, { css } from 'styled-components'
import { NodeSelection } from 'prosemirror-state'
import { blue } from '@ant-design/colors'

const Wrapper = styled.div`
  display: flex;
  position: relative;
  font-size: 0px;
  margin: 0 4px;
  background-color: transparent;
`

const ImageMask = styled.div`
  position: absolute;
  left: 0;
  top: 0;
  bottom: 0;
  right: 0;
  background: rgba(0, 0, 0, 0.5);
  border-radius: 4px;
`

interface ImgProps {
  isSelected: boolean
  status: string
}

const Img = styled.img`
  border: ${(props: ImgProps) =>
    props.isSelected ? `1px solid ${blue.primary}` : '1px solid transparent'};
  transition: border 0.25s;
  cursor: pointer;

  &:hover {
    border: 1px solid ${blue.primary};
  }
`

const Handle = styled.div`
  width: 12px;
  height: 12px;
  border-radius: 12px;
  background-color: ${blue.primary};
  position: absolute;
  bottom: -5px;
  right: -5px;
  border: 1px solid #fff;
  cursor: se-resize;
`

function useImageUploadState(id: string) {
  const imageExtension = useExtension(ImageExtension)
  const [state, setState] = useState<any>({})

  useEffect(() => {
    const listener = (payload: any) => {
      if (payload[id]) {
        setState(payload[id])
      }
    }

    const cancel = imageExtension.addUploadStateChangeListener(listener)

    return () => {
      cancel()
    }
  }, [imageExtension, id])

  return state
}

export const ImageView = forwardRef(
  (props: ReactNodeViewComponentProps, ref: ForwardedRef<HTMLImageElement>) => {
    const { src, alt, title, id, width, align, height } = props.node.attrs
    const [resizeState, setResizeState] = useState({
      stage: 'unknown',
      startWidth: 0,
      startX: 0,
      diffX: 0,
    })
    const uploadState = useImageUploadState(id)

    const handleClick = () => {
      console.log('image pos', (props.getPos as any)())
    }

    const handleHandleMouseDown = (e: MouseEvent) => {
      e.preventDefault()

      setResizeState({
        ...resizeState,
        startX: e.pageX,
        diffX: 0,
        startWidth: parseInt(width),
        stage: 'mousedown',
      })

      const onMouseMove = (e: globalThis.MouseEvent) => {
        setResizeState((prev) => {
          return {
            ...prev,
            stage: 'mousemove',
            diffX: e.pageX - prev.startX,
          }
        })
      }

      const onMouseUp = (e: globalThis.MouseEvent) => {
        setResizeState((prev) => {
          const tr = props.view.state.tr.setNodeMarkup(
            (props.getPos as any)(),
            undefined,
            {
              ...props.node.attrs,
              width: `${prev.startWidth + e.pageX - prev.startX}px`,
              height: null,
            },
          )
          tr.setSelection(NodeSelection.create(tr.doc, (props.getPos as any)()))

          props.view.dispatch(tr)

          return {
            ...prev,
            stage: 'mouseup',
            diffX: e.pageX - prev.startX,
          }
        })

        document.removeEventListener('mousemove', onMouseMove)
        document.removeEventListener('mouseup', onMouseUp)
      }

      document.addEventListener('mousemove', onMouseMove)
      document.addEventListener('mouseup', onMouseUp)
    }

    const finalSrc = src || uploadState?.src || ''

    let justifyContent = 'flex-start'

    switch (align) {
      case 'left':
        justifyContent = 'flex-start'
        break
      case 'center':
        justifyContent = 'center'
        break
      case 'right':
        justifyContent = 'flex-end'
        break
    }

    return (
      <Wrapper ref={ref} style={{ justifyContent }}>
        <div style={{ position: 'relative' }}>
          <Img
            id={id}
            src={finalSrc}
            alt={alt}
            title={title}
            onClick={handleClick}
            style={{
              width:
                resizeState.stage === 'mousemove'
                  ? `${resizeState.startWidth + resizeState.diffX}px`
                  : width,
              borderRadius: 4,
              height: resizeState.stage === 'mousemove' ? null : height,
            }}
            isSelected={props.isSelected}
            status={uploadState?.status || 'init'}
          />
          {uploadState?.status === 'uploading' && <ImageMask />}
          {props.isSelected && <Handle onMouseDown={handleHandleMouseDown} />}
        </div>
      </Wrapper>
    )
  },
)
