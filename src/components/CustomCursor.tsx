import { useEffect, useRef, useState } from 'react'

const FINE_POINTER = '(pointer: fine)'

export function CustomCursor() {
  const [enabled, setEnabled] = useState(false)
  const ringRef = useRef<HTMLDivElement>(null)
  const dotRef = useRef<HTMLDivElement>(null)
  const posRef = useRef({ x: 0, y: 0 })
  const ringPosRef = useRef({ x: 0, y: 0 })
  const hoverRef = useRef(false)
  const downRef = useRef(false)

  useEffect(() => {
    if (!window.matchMedia(FINE_POINTER).matches) return
    setEnabled(true)
    let raf = 0

    const onMove = (e: MouseEvent) => {
      posRef.current = { x: e.clientX, y: e.clientY }
      const target = e.target as HTMLElement
      hoverRef.current = !!target.closest('button, a, input, [role="button"]')
    }
    const onDown = () => (downRef.current = true)
    const onUp = () => (downRef.current = false)

    function loop() {
      ringPosRef.current.x += (posRef.current.x - ringPosRef.current.x) * 0.18
      ringPosRef.current.y += (posRef.current.y - ringPosRef.current.y) * 0.18
      if (ringRef.current) {
        const r = ringRef.current
        const scale = hoverRef.current ? 1.6 : downRef.current ? 0.8 : 1
        r.style.transform = `translate(${ringPosRef.current.x}px, ${ringPosRef.current.y}px) translate(-50%, -50%) scale(${scale})`
      }
      if (dotRef.current) {
        dotRef.current.style.transform = `translate(${posRef.current.x}px, ${posRef.current.y}px) translate(-50%, -50%)`
      }
      raf = requestAnimationFrame(loop)
    }

    window.addEventListener('mousemove', onMove)
    window.addEventListener('mousedown', onDown)
    window.addEventListener('mouseup', onUp)
    raf = requestAnimationFrame(loop)
    return () => {
      window.removeEventListener('mousemove', onMove)
      window.removeEventListener('mousedown', onDown)
      window.removeEventListener('mouseup', onUp)
      cancelAnimationFrame(raf)
    }
  }, [])

  if (!enabled) return null

  return (
    <>
      <div ref={ringRef} className="cursor-ring" aria-hidden />
      <div ref={dotRef} className="cursor-dot" aria-hidden />
    </>
  )
}
