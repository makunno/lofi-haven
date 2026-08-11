import { ROOMS } from '../rooms'

interface StationPickerProps {
  currentRoomId: string
  isPlaying: boolean
  onSelect: (roomId: string) => void
}

export function StationPicker({ currentRoomId, isPlaying, onSelect }: StationPickerProps) {
  return (
    <section className="stations" aria-label="Stations">
      <p className="stations-hint">Pick a room</p>
      <div className="stations-row">
        {ROOMS.map((room) => {
          const active = room.id === currentRoomId
          return (
            <button
              key={room.id}
              className={`station-chip ${active ? 'is-active' : ''}`}
              style={{ ['--accent' as string]: room.accent }}
              onClick={() => onSelect(room.id)}
              aria-pressed={active}
            >
              <span className="station-chip-emoji" aria-hidden>
                {room.emoji}
              </span>
              <span className="station-chip-name">{room.name}</span>
              {active && isPlaying && (
                <span className="station-chip-eq" aria-hidden>
                  <span />
                  <span />
                  <span />
                </span>
              )}
            </button>
          )
        })}
      </div>
    </section>
  )
}
