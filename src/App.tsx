import { useCallback, useEffect, useState } from 'react'
import { ROOMS, getRoom } from './rooms'
import { useAudio } from './hooks/useAudio'
import { useYouTube } from './hooks/useYouTube'
import { CanvasBackground } from './components/CanvasBackground'
import { StationPicker } from './components/StationPicker'
import { StationDock } from './components/StationDock'
import { PlaylistPanel } from './components/PlaylistPanel'
import { CustomCursor } from './components/CustomCursor'
import { VhsOverlay } from './components/VhsOverlay'

export default function App() {
  const [roomId, setRoomId] = useState(ROOMS[0].id)
  const [panelOpen, setPanelOpen] = useState(false)
  const room = getRoom(roomId)
  const isYT = room.source === 'youtube'
  const audio = useAudio(roomId)
  const yt = useYouTube('yt-player-host', roomId)
  const player = isYT ? yt : audio

  const selectRoom = useCallback((id: string) => {
    setRoomId(id)
  }, [])

  const cycleRoom = useCallback((dir: 1 | -1) => {
    setRoomId((prev) => {
      const idx = ROOMS.findIndex((r) => r.id === prev)
      return ROOMS[(idx + dir + ROOMS.length) % ROOMS.length].id
    })
  }, [])

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      const target = e.target as HTMLElement
      if (target && (target.tagName === 'INPUT' || target.tagName === 'TEXTAREA')) return
      const isYtRoom = getRoom(roomId).source === 'youtube'
      switch (e.code) {
        case 'Space':
          e.preventDefault()
          if (isYtRoom) yt.togglePlay()
          else audio.togglePlay()
          break
        case 'KeyM':
          if (isYtRoom) yt.toggleMute()
          else audio.toggleMute()
          break
        case 'KeyP':
          setPanelOpen((open) => !open)
          break
        case 'ArrowRight':
          if (isYtRoom) yt.next()
          else cycleRoom(1)
          break
        case 'ArrowLeft':
          if (isYtRoom) yt.prev()
          else cycleRoom(-1)
          break
        case 'ArrowUp':
          player.changeVolume(player.volume + 0.05)
          break
        case 'ArrowDown':
          player.changeVolume(player.volume - 0.05)
          break
      }
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [audio, yt, cycleRoom, roomId, player])

  return (
    <div
      className={`app ${isYT ? 'is-youtube' : ''}`}
      style={{ ['--accent' as string]: room.accent }}
    >
      <CanvasBackground effect={room.effect} accent={room.accent} />
      <div className="grain" aria-hidden />
      <div className="vignette" aria-hidden />
      <VhsOverlay />
      <CustomCursor />

      <div id="yt-player-host" className="yt-host" aria-hidden />

      <header className="topbar">
        <div className="brand">
          <span className="brand-text">
            <span className="brand-name">lofi haven</span>
            <span className="brand-tagline">pick a room, press play, drift away</span>
          </span>
        </div>
        <div className="topbar-now">
          <span className="now-dot" aria-hidden />
          <span>{room.emoji} {room.name}</span>
          {player.isPlaying && <span className="now-live">LIVE</span>}
        </div>
      </header>

      <main className="stage">
        <StationPicker currentRoomId={roomId} isPlaying={player.isPlaying} onSelect={selectRoom} />
      </main>

      <PlaylistPanel
        room={room}
        isPlaying={player.isPlaying}
        open={panelOpen}
        onSelect={selectRoom}
        onClose={() => setPanelOpen(false)}
        youtube={isYT ? yt : undefined}
      />

      <StationDock
        room={room}
        player={player}
        youtube={isYT ? yt : undefined}
        panelOpen={panelOpen}
        onTogglePanel={() => setPanelOpen((open) => !open)}
      />

      <footer className="footer">
        <span>Free lofi radio • 6 rooms</span>
        <span className="footer-shortcuts">
          {isYT
            ? 'Space play/pause · ←→ track · ↑↓ volume · M mute · P playlist'
            : 'Space play/pause · ←→ rooms · ↑↓ volume · M mute · P playlist'}
        </span>
      </footer>
    </div>
  )
}
