import { CSSProperties, useEffect, useState } from 'react'

export default function VisualViewportComponent() {
  const [visualViewport, setVisualViewport] = useState<any | null>(
    window.visualViewport || null,
  )
  const [windowInnerWidth, setWindowInnerWidth] = useState(window.innerHeight)
  const [windowInnerHeight, setWindowInnerHeight] = useState(window.innerHeight)

  useEffect(() => {
    function handleViewport(e: Event) {
      const vp = e.target as VisualViewport
      setVisualViewport({
        width: vp.width,
        height: vp.height,
        offsetLeft: vp.offsetLeft,
        offsetTop: vp.offsetTop,
      })
    }

    function handleResize() {
      setWindowInnerWidth(window.innerWidth)
      setWindowInnerHeight(window.innerHeight)
    }

    window.visualViewport.addEventListener('resize', handleViewport)
    window.visualViewport.addEventListener('scroll', handleViewport)

    window.addEventListener('resize', handleResize)

    return () => {
      window.visualViewport.removeEventListener('resize', handleViewport)
      window.visualViewport.removeEventListener('scroll', handleViewport)
      window.visualViewport.removeEventListener('resize', handleResize)
    }
  }, [])

  const getStyles = () => {
    // 开启 3D Transform，让 fixed 的子元素相对于容器定位
    // 同时自身也设置为 fixed，以便在非放大情况下不需要频繁移动位置
    const styles: CSSProperties = {
      position: 'fixed',
      transform: 'translateZ(0)',
      background: 'yellow',
      border: '4px solid black',
      boxSizing: 'border-box',
      display: 'flex',
      justifyContent: 'center',
      alignItems: 'center',
    }

    // 支持 VisualViewport API 情况下直接计算
    if (visualViewport != null) {
      // 需要针对 iOS 越界弹性滚动的情况进行边界检查
      styles.left =
        Math.max(
          0,
          Math.min(
            document.documentElement.scrollWidth - visualViewport.width,
            visualViewport.offsetLeft,
          ),
        ) + 'px'

      // 需要针对 iOS 越界弹性滚动的情况进行边界检查
      styles.top =
        Math.max(
          0,
          Math.min(
            document.documentElement.scrollHeight - visualViewport.height,
            visualViewport.offsetTop,
          ),
        ) + 'px'

      styles.width = visualViewport.width + 'px'
      styles.height = visualViewport.height + 'px'
    } else {
      // 不支持 VisualViewport API 情况下（如 iOS 8~12）
      styles.top = '0'
      styles.left = '0'
      styles.width = windowInnerWidth + 'px'
      styles.height = windowInnerHeight + 'px'
    }

    return styles
  }

  console.log('styles', getStyles())

  return (
    <div style={getStyles()}>
      width: {visualViewport?.width} height: {visualViewport?.height}
      offsetTop: {visualViewport?.offsetTop} offsetLeft:{' '}
      {visualViewport?.offsetLeft}
    </div>
  )
}
