import { useCallback, useEffect, useRef, useState } from 'react'
import { ROOMS } from '../rooms'
import type { YouTubeLike } from '../playerTypes'

interface YTPlayer {
  playVideo(): void
  pauseVideo(): void
  stopVideo(): void
  nextVideo(): void
  previousVideo(): void
  playVideoAt(index: number): void
  seekTo(seconds: number, allowSeekAhead: boolean): void
  setVolume(v: number): void
  getVolume(): number
  mute(): void
  unMute(): void
  isMuted(): boolean
  getCurrentTime(): number
  getDuration(): number
  getPlayerState(): number
  getPlaylist(): string[]
  getPlaylistIndex(): number
  getVideoData(): { title?: string; video_id?: string; author?: string }
  destroy(): void
}

interface YTPlayerEvent {
  target: YTPlayer
  data?: number
}

interface YTNamespace {
  Player: new (
    hostId: string,
    options: {
      width?: string | number
      height?: string | number
      playerVars?: Record<string, string | number | boolean>
      events?: {
        onReady?: (e: YTPlayerEvent) => void
        onStateChange?: (e: YTPlayerEvent) => void
        onError?: (e: YTPlayerEvent) => void
      }
    },
  ) => YTPlayer
}

const STATE_ENDED = 0
const STATE_PLAYING = 1
const STATE_PAUSED = 2
const STATE_BUFFERING = 3

let apiPromise: Promise<YTNamespace> | null = null

function loadYouTubeApi(): Promise<YTNamespace> {
  if (apiPromise) return apiPromise
  apiPromise = new Promise<YTNamespace>((resolve) => {
    const w = window as unknown as { YT?: YTNamespace; onYouTubeIframeAPIReady?: () => void }
    if (w.YT?.Player) {
      resolve(w.YT)
      return
    }
    w.onYouTubeIframeAPIReady = () => {
      if (w.YT) resolve(w.YT)
    }
    const s = document.createElement('script')
    s.src = 'https://www.youtube.com/iframe_api'
    s.async = true
    document.head.appendChild(s)
  })
  return apiPromise
}

function cleanTitle(s?: string): string {
  const t = s?.trim() ?? ''
  return t.replace(/\s+\[[-_a-z ]+\]$/i, '').trim()
}

export function useYouTube(hostId: string, roomId: string): YouTubeLike {
  const [isPlaying, setIsPlaying] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [isMuted, setIsMuted] = useState(false)
  const [volume, setVolume] = useState(0.8)
  const [currentIndex, setCurrentIndex] = useState(0)
  const [currentTime, setCurrentTime] = useState(0)
  const [duration, setDuration] = useState(0)
  const [trackTitle, setTrackTitle] = useState('')
  const [playlistTitles, setPlaylistTitles] = useState<(string | null)[]>([])

  const playerRef = useRef<YTPlayer | null>(null)
  const volumeRef = useRef(0.8)
  const titlesCache = useRef<Record<string, string | null>>({})
  const playlistKeyRef = useRef('')

  useEffect(() => {
    volumeRef.current = volume
  }, [volume])

  useEffect(() => {
    const room = ROOMS.find((r) => r.id === roomId)
    let cancelled = false
    let pollId: number | null = null

    async function setup() {
      if (!room || room.source !== 'youtube' || !room.youtubePlaylistId) {
        if (playerRef.current) {
          playerRef.current.destroy()
          playerRef.current = null
        }
        setIsPlaying(false)
        setIsLoading(false)
        return
      }

      const api = await loadYouTubeApi()
      if (cancelled) return
      if (playerRef.current) {
        playerRef.current.destroy()
        playerRef.current = null
      }

      const host = document.getElementById(hostId)
      if (!host) return
      host.innerHTML = ''

      setIsLoading(true)

      function syncNow(p: YTPlayer) {
        try {
          setCurrentIndex(Math.max(0, p.getPlaylistIndex()))
          setTrackTitle(cleanTitle(p.getVideoData().title))
        } catch {
          /* ignore */
        }
      }

      async function fetchTitles(p: YTPlayer, key: string) {
        if (playlistKeyRef.current === key) return
        playlistKeyRef.current = key
        let ids: string[] = []
        try {
          ids = p.getPlaylist()
        } catch {
          return
        }
        const titles: (string | null)[] = []
        for (const id of ids) {
          if (cancelled) return
          let title = titlesCache.current[id]
          if (title === undefined) {
            title = null
            try {
              const res = await fetch(
                `https://www.youtube.com/oembed?format=json&url=${encodeURIComponent(`https://www.youtube.com/watch?v=${id}`)}`,
              )
              if (res.ok) {
                const j = (await res.json()) as { title?: string }
                title = cleanTitle(j.title)
              }
            } catch {
              /* keep null */
            }
            titlesCache.current[id] = title
            await new Promise((r) => setTimeout(r, 40))
          }
          titles.push(title)
        }
        if (!cancelled) setPlaylistTitles(titles)
      }

      const player = new api.Player(hostId, {
        width: '100%',
        height: '100%',
        playerVars: {
          listType: 'playlist',
          list: room.youtubePlaylistId,
          autoplay: 0,
          controls: 0,
          disablekb: 1,
          fs: 0,
          iv_load_policy: 3,
          modestbranding: 1,
          playsinline: 1,
          rel: 0,
        },
        events: {
          onReady: () => {
            playerRef.current = player
            player.setVolume(Math.round(volumeRef.current * 100))
            if (player.isMuted()) player.unMute()
            setIsMuted(player.isMuted())
            setIsLoading(false)
            syncNow(player)
            void fetchTitles(player, room.youtubePlaylistId ?? '')
            pollId = window.setInterval(() => {
              const p = playerRef.current
              if (!p) return
              const t = p.getCurrentTime()
              const d = p.getDuration()
              setCurrentTime((prev) => (Math.abs(prev - t) < 0.06 ? prev : t))
              setDuration((prev) => (Math.abs(prev - d) < 0.05 ? prev : d))
            }, 500)
          },
          onStateChange: (e) => {
            const st = e.data
            if (st === STATE_PLAYING) {
              setIsPlaying(true)
              setIsLoading(false)
            } else if (st === STATE_PAUSED) {
              setIsPlaying(false)
              setIsLoading(false)
            } else if (st === STATE_BUFFERING) {
              setIsLoading(true)
            } else if (st === STATE_ENDED) {
              setIsPlaying(false)
            }
            if (playerRef.current) syncNow(playerRef.current)
          },
          onError: (_e) => {
            setIsLoading(false)
            setIsPlaying(false)
          },
        },
      })
    }

    void setup()

    return () => {
      cancelled = true
      if (pollId) window.clearInterval(pollId)
      if (playerRef.current) {
        playerRef.current.destroy()
        playerRef.current = null
      }
    }
  }, [hostId, roomId])

  const togglePlay = useCallback(() => {
    const p = playerRef.current
    if (!p) return
    if (p.getPlayerState() === STATE_PLAYING) {
      p.pauseVideo()
      setIsPlaying(false)
    } else {
      setIsLoading(true)
      p.playVideo()
      setIsPlaying(true)
    }
  }, [])

  const next = useCallback(() => playerRef.current?.nextVideo(), [])
  const prev = useCallback(() => playerRef.current?.previousVideo(), [])
  const seekTo = useCallback((s: number) => playerRef.current?.seekTo(s, true), [])
  const playAt = useCallback((i: number) => {
    const p = playerRef.current
    if (!p) return
    p.playVideoAt(i)
    setIsPlaying(true)
  }, [])

  const changeVolume = useCallback(
    (v: number) => {
      const clamped = Math.min(1, Math.max(0, v))
      setVolume(clamped)
      volumeRef.current = clamped
      playerRef.current?.setVolume(Math.round(clamped * 100))
      if (clamped > 0 && isMuted) {
        playerRef.current?.unMute()
        setIsMuted(false)
      }
    },
    [isMuted],
  )

  const toggleMute = useCallback(() => {
    const p = playerRef.current
    if (!p) return
    if (p.isMuted()) p.unMute()
    else p.mute()
    setIsMuted(p.isMuted())
  }, [])

  return {
    isPlaying,
    isLoading,
    isMuted,
    volume,
    currentIndex,
    currentTime,
    duration,
    trackTitle,
    playlistTitles,
    togglePlay,
    next,
    prev,
    seekTo,
    playAt,
    changeVolume,
    toggleMute,
  }
}
