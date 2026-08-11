import type { Room } from '../rooms'
import type { PlayerLike, YouTubeLike } from '../playerTypes'
import { Visualizer } from './Visualizer'

interface StationDockProps {
  room: Room
  player: PlayerLike
  youtube?: YouTubeLike
  panelOpen: boolean
  onTogglePanel: () => void
}

function formatTime(s: number): string {
  if (!Number.isFinite(s) || s < 0) return '0:00'
  const m = Math.floor(s / 60)
  const sec = Math.floor(s % 60)
  return `${m}:${String(sec).padStart(2, '0')}`
}

export function StationDock({ room, player, youtube, panelOpen, onTogglePanel }: StationDockProps) {
  const isYT = !!youtube
  const seekMax = Math.max(youtube?.duration ?? 0, 0.01)
  const seekValue = Math.min(youtube?.currentTime ?? 0, seekMax)

  return (
    <div className="dock">
      <div className="dock-main">
        <button
          className={`play-btn ${player.isLoading ? 'is-loading' : ''}`}
          onClick={player.togglePlay}
          aria-label={player.isPlaying ? 'Pause' : 'Play'}
        >
          {player.isLoading ? (
            <span className="spinner" aria-hidden />
          ) : player.isPlaying ? (
            <svg viewBox="0 0 24 24" width="22" height="22" aria-hidden>
              <path d="M6 5h4v14H6zM14 5h4v14h-4z" fill="currentColor" />
            </svg>
          ) : (
            <svg viewBox="0 0 24 24" width="22" height="22" aria-hidden>
              <path d="M7 4.8v14.4a.6.6 0 0 0 .92.5l11.2-7.2a.6.6 0 0 0 0-1L7.92 4.3a.6.6 0 0 0-.92.5Z" fill="currentColor" />
            </svg>
          )}
        </button>

        {isYT && (
          <button className="skip-btn" onClick={youtube?.prev} aria-label="Previous track" title="Previous (←)">
            <svg viewBox="0 0 24 24" width="16" height="16" aria-hidden>
              <path d="M6 5h2v14H6V5Zm12 .5-9 6.5 9 6.5v-13Z" fill="currentColor" />
            </svg>
          </button>
        )}
        {isYT && (
          <button className="skip-btn" onClick={youtube?.next} aria-label="Next track" title="Next (→)">
            <svg viewBox="0 0 24 24" width="16" height="16" aria-hidden>
              <path d="M16 5h2v14h-2V5ZM6 5.5l9 6.5-9 6.5v-13Z" fill="currentColor" />
            </svg>
          </button>
        )}

        <div className="dock-station">
          <span className="dock-emoji" aria-hidden>
            {room.emoji}
          </span>
          <div className="dock-station-text">
            <span className="dock-label">NOW PLAYING</span>
            <span className="dock-name">{room.name}</span>
            {isYT && youtube?.trackTitle && (
              <span className="dock-track" title={youtube.trackTitle}>
                {youtube.trackTitle}
              </span>
            )}
          </div>
        </div>

        <div className="dock-visualizer">
          <Visualizer playing={player.isPlaying} color={room.accent} />
        </div>

        <div className="dock-controls">
          <button
            className="icon-btn"
            onClick={player.toggleMute}
            aria-label={player.isMuted ? 'Unmute' : 'Mute'}
            title={player.isMuted ? 'Unmute (M)' : 'Mute (M)'}
          >
            {player.isMuted || player.volume === 0 ? (
              <svg viewBox="0 0 24 24" width="18" height="18" aria-hidden>
                <path d="M4 9v6h4l5 4V5L8 9H4Zm13.6 3 2.7-2.7-1.4-1.4L16.2 10.6l-2.7-2.7-1.4 1.4 2.7 2.7-2.7 2.7 1.4 1.4 2.7-2.7 2.7 2.7 1.4-1.4-2.7-2.7Z" fill="currentColor" />
              </svg>
            ) : (
              <svg viewBox="0 0 24 24" width="18" height="18" aria-hidden>
                <path d="M4 9v6h4l5 4V5L8 9H4Zm10.5 3a4.5 4.5 0 0 0-2.5-4v8a4.5 4.5 0 0 0 2.5-4Z" fill="currentColor" />
                <path d="M14 3.3v2.1a6 6 0 0 1 0 11.2v2.1a8 8 0 0 0 0-15.4Z" fill="currentColor" opacity="0.7" />
              </svg>
            )}
          </button>
          <input
            className="volume-slider"
            type="range"
            min="0"
            max="1"
            step="0.01"
            value={player.isMuted ? 0 : player.volume}
            onChange={(e) => player.changeVolume(Number(e.target.value))}
            aria-label="Volume"
          />
        </div>

        <button
          className={`icon-btn panel-toggle ${panelOpen ? 'is-open' : ''}`}
          onClick={onTogglePanel}
          aria-label="Toggle playlist"
          title="Playlist (P)"
        >
          <svg viewBox="0 0 24 24" width="18" height="18" aria-hidden>
            <path d="M9 5h12v2H9V5Zm0 6h12v2H9v-2Zm0 6h12v2H9v-2ZM4 4h3v3H4V4Zm0 6h3v3H4v-3Zm0 6h3v3H4v-3Z" fill="currentColor" />
          </svg>
        </button>
      </div>

      {isYT && (
        <div className="dock-seek">
          <span className="seek-time">{formatTime(youtube?.currentTime ?? 0)}</span>
          <input
            className="seek-slider"
            type="range"
            min="0"
            max={seekMax}
            step="0.1"
            value={seekValue}
            onChange={(e) => youtube?.seekTo(Number(e.target.value))}
            aria-label="Seek"
          />
          <span className="seek-time">{formatTime(youtube?.duration ?? 0)}</span>
        </div>
      )}
    </div>
  )
}
