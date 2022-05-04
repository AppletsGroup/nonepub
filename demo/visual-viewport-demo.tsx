import VisualViewportComponent from './components/visual-viewport-component'

export default function VVDemo() {
  return (
    <>
      <div style={{ height: '300vh' }} />
      <input
        placeholder="hello"
        style={{ position: 'fixed', zIndex: 1000, top: 0, left: 0 }}
      />
      <VisualViewportComponent />
    </>
  )
}
