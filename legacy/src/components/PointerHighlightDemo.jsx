import { useState } from 'react'

export default function PointerHighlightDemo({ children, className = '' }) {
  const [position, setPosition] = useState({ x: 50, y: 50, active: false })

  const handleMove = (event) => {
    const bounds = event.currentTarget.getBoundingClientRect()
    const x = ((event.clientX - bounds.left) / bounds.width) * 100
    const y = ((event.clientY - bounds.top) / bounds.height) * 100

    setPosition({ x, y, active: true })
  }

  return (
    <div
      className={`pointer-highlight ${className}`.trim()}
      onMouseMove={handleMove}
      onMouseLeave={() => setPosition((current) => ({ ...current, active: false }))}
      style={{ '--pointer-x': `${position.x}%`, '--pointer-y': `${position.y}%`, '--pointer-opacity': position.active ? 1 : 0 }}
    >
      {children}
    </div>
  )
}