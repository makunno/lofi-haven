import { useEffect, useState } from 'react'

const DAYS = ['SUN', 'MON', 'TUE', 'WED', 'THU', 'FRI', 'SAT']

function formatDate(d: Date): string {
  const day = DAYS[d.getDay()]
  const mm = String(d.getMonth() + 1).padStart(2, '0')
  const dd = String(d.getDate()).padStart(2, '0')
  const yy = String(d.getFullYear()).slice(2)
  return `${day} ${mm}.${dd}.${yy}`
}

function formatTime(d: Date): { hh: string; mm: string; ampm: string } {
  let h = d.getHours()
  const ampm = h >= 12 ? 'PM' : 'AM'
  h = h % 12 || 12
  return {
    hh: String(h),
    mm: String(d.getMinutes()).padStart(2, '0'),
    ampm,
  }
}

export function TapeClock() {
  const [now, setNow] = useState(() => new Date())

  useEffect(() => {
    const id = window.setInterval(() => setNow(new Date()), 1000)
    return () => window.clearInterval(id)
  }, [])

  const { hh, mm, ampm } = formatTime(now)

  return (
    <div className="tape-clock" aria-hidden>
      <span className="tape-clock-label">TAPECODE</span>
      <div className="tape-clock-time">
        <span>{hh}</span>
        <span className="tape-clock-colon">:</span>
        <span>{mm}</span>
        <span className="tape-clock-ampm">{ampm}</span>
      </div>
      <span className="tape-clock-date">{formatDate(now)}</span>
    </div>
  )
}
