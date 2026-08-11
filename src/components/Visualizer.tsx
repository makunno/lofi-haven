import { useEffect, useRef } from 'react'

interface VisualizerProps {
  playing: boolean
  color: string
  bars?: number
}

export function Visualizer({ playing, color, bars = 24 }: VisualizerProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null)

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext('2d')
    if (!ctx) return

    let raf = 0
    const heights = Array.from({ length: bars }, () => Math.random() * 0.5 + 0.2)

    const frame = (t: number) => {
      const dpr = Math.min(window.devicePixelRatio || 1, 2)
      const rect = canvas.getBoundingClientRect()
      const w = rect.width
      const h = rect.height
      canvas.width = Math.floor(w * dpr)
      canvas.height = Math.floor(h * dpr)
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0)
      ctx.clearRect(0, 0, w, h)

      const barW = w / bars
      for (let i = 0; i < bars; i++) {
        heights[i] += (Math.random() - 0.5) * 0.25
        heights[i] = Math.max(0.1, Math.min(1, heights[i]))
        const target = playing
          ? heights[i] * h * (0.5 + 0.5 * Math.sin(t * 0.003 + i * 1.7))
          : h * 0.04
        const bh = Math.max(2, target)
        const x = i * barW + barW * 0.18
        const bw = barW * 0.64
        ctx.fillStyle = color
        ctx.globalAlpha = 0.35 + 0.4 * Math.abs(Math.sin(t * 0.004 + i * 1.3))
        ctx.beginPath()
        ctx.roundRect(x, h - bh, bw, bh, bw / 2)
        ctx.fill()
        ctx.globalAlpha = 1
      }
      raf = requestAnimationFrame(frame)
    }

    raf = requestAnimationFrame(frame)
    return () => cancelAnimationFrame(raf)
  }, [bars, playing, color])

  return <canvas ref={canvasRef} className="visualizer" aria-hidden />
}
