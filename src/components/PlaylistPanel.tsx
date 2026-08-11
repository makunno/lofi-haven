import { useEffect, useState } from 'react'
import { ROOMS } from '../rooms'
import type { Room } from '../rooms'
import type { YouTubeLike } from '../playerTypes'
import { Visualizer } from './Visualizer'

interface PlaylistPanelProps {
  room: Room
  isPlaying: boolean
  open: boolean
  onSelect: (roomId: string) => void
  onClose: () => void
  youtube?: YouTubeLike
}

const TRACK_DURATION = 90000

export function PlaylistPanel({
  room,
  isPlaying,
  open,
  onSelect,
  onClose,
  youtube,
}: PlaylistPanelProps) {
  const isYT = room.source === 'youtube'
  const [trackIndex, setTrackIndex] = useState(0)
  const [elapsed, setElapsed] = useState(0)

  useEffect(() => {
    setTrackIndex(0)
    setElapsed(0)
  }, [room.id])

  useEffect(() => {
    if (isYT) return
    const countRef = { seconds: 0 }
    const id = window.setInterval(() => {
      countRef.seconds += 1
      if (countRef.seconds >= TRACK_DURATION / 1000) {
        countRef.seconds = 0
        setTrackIndex((i) => (i + 1) % room.tracks.length)
      }
      setElapsed(countRef.seconds * 1000)
    }, 1000)
    return () => window.clearInterval(id)
  }, [isYT, room.id, room.tracks.length])

  const progress = Math.min(100, (elapsed / TRACK_DURATION) * 100)
  const currentTrack = isYT ? youtube?.trackTitle : room.tracks[trackIndex]
  const currentIndex = youtube?.currentIndex ?? 0

  return (
    <aside className={`panel ${isPlaying ? 'is-playing' : ''} ${open ? 'is-open' : ''}`}>
      <div className="panel-head">
        <div className="panel-now">
          {isYT ? (
            <span className="yt-badge" aria-hidden>
              <svg viewBox="0 0 24 24" width="22" height="22" aria-hidden>
                <path
                  d="M23 12s0-3.2-.4-4.7a2.5 2.5 0 0 0-1.8-1.8C19.3 5.1 12 5.1 12 5.1s-7.3 0-8.8.4a2.5 2.5 0 0 0-1.8 1.8C1 8.8 1 12 1 12s0 3.2.4 4.7c.2.9.9 1.6 1.8 1.8 1.5.4 8.8.4 8.8.4s7.3 0 8.8-.4a2.5 2.5 0 0 0 1.8-1.8C23 15.2 23 12 23 12ZM9.8 15.6V8.4l6.2 3.6-6.2 3.6Z"
                  fill="#f00"
                />
              </svg>
            </span>
          ) : (
            <Visualizer playing={isPlaying} color={room.accent} bars={14} />
          )}
          <div className="panel-now-text">
            <span className="panel-eyebrow">{isYT ? 'NOW PLAYING' : 'NOW PLAYING'}</span>
            <span className="panel-track">
              {isYT ? (currentTrack || 'Loading…') : currentTrack}
            </span>
            <span className="panel-room">
              {isYT ? `${room.emoji} ${room.name} · tap a track to jump` : `${room.emoji} ${room.name}`}
            </span>
          </div>
        </div>
        <button className="icon-btn panel-close" onClick={onClose} aria-label="Close playlist">
          <svg viewBox="0 0 24 24" width="16" height="16" aria-hidden>
            <path d="M6.4 5 5 6.4 10.6 12 5 17.6 6.4 19 12 13.4 17.6 19 19 17.6 13.4 12 19 6.4 17.6 5 12 10.6Z" fill="currentColor" />
          </svg>
        </button>
      </div>

      {isYT ? (
        <div className="panel-list">
          {youtube && youtube.playlistTitles.length > 0 ? (
            youtube.playlistTitles.map((title, i) => (
              <button
                key={`${room.id}-${i}`}
                className={`track-row is-btn ${i === currentIndex ? 'is-current' : ''}`}
                onClick={() => youtube.playAt(i)}
              >
                <span className="track-num">{String(i + 1).padStart(2, '0')}</span>
                <span className="track-title">{title ?? 'Unavailable'}</span>
                {i === currentIndex && isPlaying && (
                  <span className="eq" aria-hidden>
                    <span /><span /><span />
                  </span>
                )}
              </button>
            ))
          ) : (
            <div className="panel-loading">Loading playlist…</div>
          )}
        </div>
      ) : (
        <>
          <div className="track-progress">
            <div className="track-progress-fill" style={{ width: `${progress}%` }} />
          </div>

          <div className="panel-list">
            {room.tracks.map((track, i) => (
              <div key={track} className={`track-row ${i === trackIndex ? 'is-current' : ''}`}>
                <span className="track-num">{String(i + 1).padStart(2, '0')}</span>
                <span className="track-title">{track}</span>
                <span className="track-duration">{Math.round(TRACK_DURATION / 60000)}:00</span>
                {i === trackIndex && isPlaying && (
                  <span className="eq" aria-hidden>
                    <span /><span /><span />
                  </span>
                )}
              </div>
            ))}
          </div>
        </>
      )}

      <div className="panel-stations">
        <span className="panel-eyebrow">STATIONS</span>
        {ROOMS.map((r) => (
          <button
            key={r.id}
            className={`station-row ${r.id === room.id ? 'is-active' : ''}`}
            style={{ ['--accent' as string]: r.accent }}
            onClick={() => onSelect(r.id)}
          >
            <span className="station-row-emoji" aria-hidden>
              {r.emoji}
            </span>
            <span className="station-row-name">{r.name}</span>
            <span className="station-row-arrow" aria-hidden>
              →
            </span>
          </button>
        ))}
      </div>
    </aside>
  )
}
