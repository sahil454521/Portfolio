import { useState } from 'react'

export default function TargetCursorDemo({ children, className = '' }) {
  const [cursor, setCursor] = useState({ x: 120, y: 120, active: false })

  const handleMove = (event) => {
    const bounds = event.currentTarget.getBoundingClientRect()
    setCursor({
      x: event.clientX - bounds.left,
      y: event.clientY - bounds.top,
      active: true,
    })
  }

  return (
    <div
      className={`target-cursor-demo ${className}`.trim()}
      onMouseMove={handleMove}
      onMouseLeave={() => setCursor((current) => ({ ...current, active: false }))}
    >
      <span
        className="target-cursor"
        style={{ left: `${cursor.x}px`, top: `${cursor.y}px`, opacity: cursor.active ? 1 : 0 }}
      >
        <span className="target-cursor-ring" />
        <span className="target-cursor-dot" />
      </span>
      {children}
    </div>
  )
}