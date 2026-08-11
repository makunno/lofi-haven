export interface PlayerLike {
  isPlaying: boolean
  isLoading: boolean
  volume: number
  isMuted: boolean
  togglePlay(): void
  toggleMute(): void
  changeVolume(v: number): void
}

export interface YouTubeLike extends PlayerLike {
  currentTime: number
  duration: number
  trackTitle: string
  currentIndex: number
  playlistTitles: (string | null)[]
  next(): void
  prev(): void
  seekTo(s: number): void
  playAt(i: number): void
}
