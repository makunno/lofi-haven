import { TapeClock } from './TapeClock'

export function VhsOverlay() {
  return (
    <div className="vhs-overlay" aria-hidden>
      <div className="vhs-scanlines" />
      <div className="vhs-glow" />
      <div className="vhs-frame" />
      <TapeClock />
    </div>
  )
}
