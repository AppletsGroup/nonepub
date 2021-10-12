export default function UiDragHandle() {
  const circleClass = 'rounded-lg w-1 h-1 bg-gray-400 p-2 m-1'

  return (
    <div
      style={{
        width: 16,
        height: 16,
        display: 'flex',
        flexWrap: 'wrap',
        justifyContent: 'space-between',
      }}
    >
      <div
        style={{ display: 'flex', width: 16, justifyContent: 'space-between' }}
      >
        <div className={circleClass} />
        <div className={circleClass} />
      </div>
      <div style={{ display: 'flex', width: 16 }}>
        <div className={circleClass} />
        <div className={circleClass} />
      </div>
    </div>
  )
}
