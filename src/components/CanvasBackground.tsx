import { useEffect, useRef } from 'react'
import type { EffectKind } from '../rooms'

interface CanvasBackgroundProps {
  effect: EffectKind
  accent: string
}

interface Particle {
  x: number
  y: number
  vx: number
  vy: number
  size: number
  life: number
  maxLife: number
  hue: number
  extra: number
}

type EffectModule = {
  count: number
  reset: (p: Particle, w: number, h: number, rand: () => number) => void
  update: (p: Particle, dt: number, w: number, h: number, rand: () => number) => void
  draw: (ctx: CanvasRenderingContext2D, p: Particle, w: number, h: number, t: number) => void
}

const clamp = (v: number, lo: number, hi: number) => Math.min(hi, Math.max(lo, v))

const EFFECTS: Record<EffectKind, EffectModule> = {
  rain: {
    count: 260,
    reset(p, w, h, rand) {
      p.x = rand() * w
      p.y = rand() * -h
      p.vx = -rand() * 120 - 30
      p.vy = 380 + rand() * 340
      p.size = 1 + rand() * 2
      p.life = 0
    },
    update(p, dt, _w, h) {
      p.x += p.vx * dt
      p.y += p.vy * dt
      if (p.y > h + 20 || p.x < -20) p.y = -20
    },
    draw(ctx, p, _w, _h, t) {
      ctx.strokeStyle = `rgba(174, 198, 255, ${0.22 + 0.2 * Math.abs(Math.sin(t + p.x))})`
      ctx.lineWidth = p.size
      ctx.beginPath()
      ctx.moveTo(p.x, p.y)
      ctx.lineTo(p.x + p.vx * 0.012, p.y + p.vy * 0.012)
      ctx.stroke()
    },
  },
  aurora: {
    count: 140,
    reset(p, w, h, rand) {
      p.x = rand() * w
      p.y = rand() * h * 0.6
      p.size = 0.6 + rand() * 1.6
      p.extra = rand() * Math.PI * 2
      p.life = rand()
      p.maxLife = 4
    },
    update(p, _dt, _w, _h) {
      p.extra += 0.004
      p.life += 0.002
    },
    draw(ctx, p, _w, _h, t) {
      const tw = 0.5 + 0.5 * Math.sin(t * 2 + p.extra)
      ctx.globalAlpha = (0.28 + 0.5 * tw) * 0.6
      ctx.fillStyle = '#8fa3bd'
      ctx.beginPath()
      ctx.arc(p.x, p.y, p.size * tw, 0, Math.PI * 2)
      ctx.fill()
      ctx.globalAlpha = 1
    },
  },
  city: {
    count: 90,
    reset(p, w, h, rand) {
      p.x = rand() * w
      p.y = h + 20
      p.vx = (rand() - 0.5) * 30
      p.vy = -(20 + rand() * 60)
      p.size = 1 + rand() * 2.4
      p.hue = 280 + rand() * 90
      p.maxLife = rand() * 3 + 1
      p.life = 0
    },
    update(p, dt) {
      p.x += p.vx * dt
      p.y += p.vy * dt
      p.life += dt
    },
    draw(ctx, p, _w, _h, t) {
      const fade = clamp(1 - p.life / p.maxLife, 0, 1) * (0.6 + 0.4 * Math.sin(t * 3))
      ctx.globalAlpha = fade * 0.9
      ctx.fillStyle = `hsl(${p.hue} 90% 70%)`
      ctx.shadowColor = `hsl(${p.hue} 90% 60%)`
      ctx.shadowBlur = 8
      ctx.beginPath()
      ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2)
      ctx.fill()
      ctx.shadowBlur = 0
      ctx.globalAlpha = 1
    },
  },
  snow: {
    count: 220,
    reset(p, w, h, rand) {
      p.x = rand() * w
      p.y = rand() * -h
      p.vx = (rand() - 0.5) * 30
      p.vy = 30 + rand() * 60
      p.size = 1 + rand() * 3
      p.extra = rand() * Math.PI * 2
      p.life = rand() * 2
    },
    update(p, dt, w, _h) {
      p.extra += dt * 0.8
      p.x = p.x + (Math.sin(p.extra) * 0.5 + p.vx) * dt
      p.y += p.vy * dt
      if (p.y > _h + 10) {
        p.y = -10
        p.x = Math.random() * w
      }
    },
    draw(ctx, p, _w, _h, _t) {
      ctx.fillStyle = `rgba(240, 250, 255, ${0.5 + 0.5 * Math.abs(Math.sin(p.extra))})`
      ctx.beginPath()
      ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2)
      ctx.fill()
    },
  },
  embers: {
    count: 160,
    reset(p, w, h, rand) {
      const cx = w / 2
      p.x = cx + (rand() - 0.5) * w * 0.3
      p.y = h - 10
      p.vx = (rand() - 0.5) * 40
      p.vy = -(40 + rand() * 80)
      p.size = 1.2 + rand() * 2.6
      p.hue = 12 + rand() * 24
      p.maxLife = rand() * 3 + 1.5
      p.life = 0
      p.extra = rand() * Math.PI * 2
    },
    update(p, dt) {
      p.x += (Math.sin(p.extra) * 0.6 + p.vx) * dt
      p.y += p.vy * dt
      p.vy *= 1 - dt * 0.12
      p.life += dt
    },
    draw(ctx, p, _w, _h, _t) {
      const fade = clamp(1 - p.life / p.maxLife, 0, 1)
      ctx.globalAlpha = fade
      ctx.fillStyle = `hsl(${p.hue} 95% ${50 + 20 * fade}%)`
      ctx.shadowColor = `hsl(${p.hue} 95% 55%)`
      ctx.shadowBlur = 10
      ctx.beginPath()
      ctx.arc(p.x, p.y, p.size * (0.6 + fade * 0.6), 0, Math.PI * 2)
      ctx.fill()
      ctx.shadowBlur = 0
      ctx.globalAlpha = 1
    },
  },
  ocean: {
    count: 120,
    reset(p, w, h, rand) {
      p.x = rand() * w
      p.y = rand() * h * 0.7
      p.vx = 0
      p.vy = -(10 + rand() * 40)
      p.size = 1 + rand() * 2.2
      p.life = rand()
      p.maxLife = rand() * 2 + 1
    },
    update(p, dt) {
      p.y += p.vy * dt
      p.x += Math.sin(p.life * 2) * 12 * dt
      p.vy *= 1 - dt * 0.15
      p.life += dt
    },
    draw(ctx, p, _w, _h, _t) {
      const fade = clamp(Math.sin(p.life * 2.4), 0, 1)
      ctx.globalAlpha = fade * 0.85
      ctx.fillStyle = `rgba(215, 242, 255, 1)`
      ctx.shadowColor = '#9fe8ff'
      ctx.shadowBlur = 6
      ctx.beginPath()
      ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2)
      ctx.fill()
      ctx.shadowBlur = 0
      ctx.globalAlpha = 1
    },
  },
}

export function CanvasBackground({ effect, accent }: CanvasBackgroundProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const accentRef = useRef(accent)

  useEffect(() => {
    accentRef.current = accent
  }, [accent])

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext('2d')
    if (!ctx) return

    let raf = 0
    let w = 0
    let h = 0
    let dpr = 1
    let last = performance.now()
    let particles: Particle[] = []

    const module = EFFECTS[effect]

    const resize = () => {
      const rect = canvas.getBoundingClientRect()
      dpr = clamp(window.devicePixelRatio || 1, 1, 2)
      w = rect.width
      h = rect.height
      canvas.width = Math.floor(w * dpr)
      canvas.height = Math.floor(h * dpr)
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0)
      particles = Array.from({ length: module.count }, () => {
        const p: Particle = { x: 0, y: 0, vx: 0, vy: 0, size: 0, life: 0, maxLife: 1, hue: 0, extra: 0 }
        module.reset(p, w, h, Math.random)
        p.y = Math.random() * h
        return p
      })
    }

    resize()
    const ro = new ResizeObserver(resize)
    ro.observe(canvas)

    const frame = (now: number) => {
      const dt = Math.min((now - last) / 1000, 0.05)
      last = now
      const t = now / 1000

      ctx.clearRect(0, 0, w, h)
      drawBackdrop(ctx, w, h, t, effect)

      for (const p of particles) {
        module.update(p, dt, w, h, Math.random)
        if (effect === 'rain') {
          if (p.y > h + 20 || p.x < -20) module.reset(p, w, h, Math.random)
        } else if (p.life >= p.maxLife && p.y < -20) {
          module.reset(p, w, h, Math.random)
        } else if (effect === 'snow' && p.y > h + 10) {
          module.reset(p, w, h, Math.random)
        }
        module.draw(ctx, p, w, h, t)
      }

      drawAuroraIfNeeded(ctx, effect, w, h, t)
      drawWavesIfNeeded(ctx, effect, w, h, t)
      drawCityIfNeeded(ctx, effect, w, h)

      raf = requestAnimationFrame(frame)
    }

    raf = requestAnimationFrame(frame)
    return () => {
      cancelAnimationFrame(raf)
      ro.disconnect()
    }
  }, [effect])

  return (
    <canvas
      ref={canvasRef}
      aria-hidden
      className="bg-canvas"
      style={{ ['--accent' as string]: accent }}
    />
  )
}

function drawBackdrop(
  ctx: CanvasRenderingContext2D,
  w: number,
  h: number,
  t: number,
  effect: EffectKind,
) {
  if (effect === 'rain') {
    const flash = Math.max(0, Math.sin(t * 0.07) * 0.12 + Math.sin(t * 0.03 + 2) * 0.08)
    const g = ctx.createLinearGradient(0, 0, 0, h)
    g.addColorStop(0, '#0a0e1a')
    g.addColorStop(1, '#12182b')
    ctx.fillStyle = g
    ctx.fillRect(0, 0, w, h)
    if (flash > 0.1) {
      ctx.fillStyle = `rgba(200, 215, 255, ${flash * 0.5})`
      ctx.fillRect(0, 0, w, h)
    }
    return
  }
  if (effect === 'aurora') {
    const g = ctx.createLinearGradient(0, 0, 0, h)
    g.addColorStop(0, '#010207')
    g.addColorStop(0.55, '#03060f')
    g.addColorStop(1, '#060a12')
    ctx.fillStyle = g
    ctx.fillRect(0, 0, w, h)
    return
  }
  if (effect === 'city') {
    const g = ctx.createLinearGradient(0, 0, 0, h)
    g.addColorStop(0, '#0d0714')
    g.addColorStop(0.75, '#150b20')
    g.addColorStop(1, '#1b1030')
    ctx.fillStyle = g
    ctx.fillRect(0, 0, w, h)
    return
  }
  if (effect === 'snow') {
    const g = ctx.createLinearGradient(0, 0, 0, h)
    g.addColorStop(0, '#0e1622')
    g.addColorStop(1, '#16202e')
    ctx.fillStyle = g
    ctx.fillRect(0, 0, w, h)
    return
  }
  if (effect === 'embers') {
    const g = ctx.createRadialGradient(w / 2, h + 40, 10, w / 2, h + 40, h * 0.9)
    g.addColorStop(0, 'rgba(255, 120, 50, 0.35)')
    g.addColorStop(1, 'rgba(10, 6, 4, 0)')
    ctx.fillStyle = '#0c0806'
    ctx.fillRect(0, 0, w, h)
    ctx.fillStyle = g
    ctx.fillRect(0, 0, w, h)
    return
  }
  // ocean
  const g = ctx.createLinearGradient(0, 0, 0, h)
  g.addColorStop(0, '#051018')
  g.addColorStop(0.6, '#071c2a')
  g.addColorStop(1, '#0a2a3d')
  ctx.fillStyle = g
  ctx.fillRect(0, 0, w, h)
}

function drawAuroraIfNeeded(
  ctx: CanvasRenderingContext2D,
  effect: EffectKind,
  w: number,
  h: number,
  t: number,
) {
  if (effect !== 'aurora') return
  ctx.save()
  ctx.globalCompositeOperation = 'lighter'
  for (let band = 0; band < 3; band++) {
    const color = band === 0 ? '#2ecc71' : band === 1 ? '#00d9ff' : '#8a63ff'
    ctx.beginPath()
    for (let x = 0; x <= w; x += 8) {
      const y =
        h * 0.35 +
        band * h * 0.11 +
        Math.sin(x * 0.004 + t * 0.5 + band * 2.1) * h * 0.09 +
        Math.sin(x * 0.013 - t * 0.3) * h * 0.05
      if (x === 0) ctx.moveTo(x, y)
      else ctx.lineTo(x, y)
    }
    ctx.lineTo(w, h)
    ctx.lineTo(0, h)
    ctx.closePath()
    ctx.globalAlpha = 0.2 + band * 0.05
    ctx.fillStyle = color
    ctx.fill()
  }
  ctx.restore()
}

function drawWavesIfNeeded(
  ctx: CanvasRenderingContext2D,
  effect: EffectKind,
  w: number,
  h: number,
  t: number,
) {
  if (effect !== 'ocean') return
  ctx.save()
  const layers = [
    { y: 0.68, amp: 0.035, freq: 0.006, speed: 0.5, alpha: 0.35, color: '#1b6f8f' },
    { y: 0.78, amp: 0.03, freq: 0.008, speed: 0.7, alpha: 0.45, color: '#176183' },
    { y: 0.88, amp: 0.026, freq: 0.011, speed: 0.9, alpha: 0.55, color: '#0f4d6e' },
  ]
  for (const layer of layers) {
    ctx.beginPath()
    for (let x = 0; x <= w; x += 6) {
      const y =
        h * layer.y +
        Math.sin(x * layer.freq + t * layer.speed) * h * layer.amp +
        Math.sin(x * layer.freq * 2.3 - t * layer.speed * 0.8) * h * layer.amp * 0.4
      if (x === 0) ctx.moveTo(x, y)
      else ctx.lineTo(x, y)
    }
    ctx.lineTo(w, h)
    ctx.lineTo(0, h)
    ctx.closePath()
    ctx.globalAlpha = layer.alpha
    ctx.fillStyle = layer.color
    ctx.fill()
  }
  const glow = ctx.createRadialGradient(w * 0.72, h * 0.2, 4, w * 0.72, h * 0.2, w * 0.25)
  glow.addColorStop(0, 'rgba(220, 245, 255, 0.5)')
  glow.addColorStop(1, 'rgba(220, 245, 255, 0)')
  ctx.fillStyle = glow
  ctx.fillRect(0, 0, w, h)
  ctx.restore()
}

function drawCityIfNeeded(
  ctx: CanvasRenderingContext2D,
  effect: EffectKind,
  w: number,
  h: number,
) {
  if (effect !== 'city') return
  ctx.save()
  ctx.fillStyle = '#0a0612'
  const ground = h * 0.86
  for (let i = 0; i < 22; i++) {
    const bw = (w / 22) * (0.6 + ((i * 37) % 10) / 10)
    const bh = h * (0.08 + (((i * 53) % 19) / 19) * 0.3)
    const bx = i * (w / 22)
    ctx.fillStyle = `rgba(8, 5, 16, ${0.85 + ((i * 7) % 10) / 30})`
    ctx.fillRect(bx, ground - bh, bw, bh + 20)
    // windows
    const cols = Math.max(2, Math.floor(bw / 12))
    const rows = Math.max(3, Math.floor(bh / 18))
    for (let r = 0; r < rows; r++) {
      for (let c = 0; c < cols; c++) {
        const lit = (i * 13 + r * 7 + c * 3) % 7 < 2
        if (lit) {
          ctx.fillStyle = `rgba(255, 214, 150, ${0.35 + (((i * 31 + r * 11) % 10) / 20)})`
          ctx.fillRect(bx + 4 + c * 12, ground - bh + 6 + r * 18, 5, 8)
        }
      }
    }
  }
  ctx.restore()
}
