import { useCallback, useEffect, useRef, useState } from 'react'
import { ROOMS } from '../rooms'

export function useAudio(roomId: string) {
  const [isPlaying, setIsPlaying] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [volume, setVolume] = useState(0.8)
  const [isMuted, setIsMuted] = useState(false)
  const audioRef = useRef<HTMLAudioElement | null>(null)
  const isPlayingRef = useRef(false)
  const roomIdRef = useRef(roomId)

  if (!audioRef.current && typeof window !== 'undefined') {
    const audio = new Audio()
    audio.preload = 'none'
    audioRef.current = audio
  }

  useEffect(() => {
    const audio = audioRef.current
    if (audio) audio.volume = isMuted ? 0 : volume
  }, [volume, isMuted])

  useEffect(() => {
    const audio = audioRef.current
    if (!audio) return
    const room = ROOMS.find((r) => r.id === roomId)
    if (!room) return

    if (room.source !== 'radio') {
      roomIdRef.current = roomId
      audio.pause()
      audio.removeAttribute('src')
      audio.load()
      isPlayingRef.current = false
      setIsPlaying(false)
      setIsLoading(false)
      return
    }

    const roomChanged = roomIdRef.current !== roomId
    roomIdRef.current = roomId
    if (!roomChanged && audio.src) return

    const shouldPlay = isPlayingRef.current
    setIsLoading(true)
    audio.pause()
    audio.src = room.streamUrl ?? ''
    audio.load()
    if (shouldPlay) {
      audio.play()
        .then(() => setIsPlaying(true))
        .catch(() => setIsPlaying(false))
        .finally(() => setIsLoading(false))
    } else {
      setIsLoading(false)
    }
  }, [roomId])

  const togglePlay = useCallback(() => {
    const audio = audioRef.current
    if (!audio) return
    if (audio.paused) {
      setIsLoading(true)
      audio.play()
        .then(() => {
          isPlayingRef.current = true
          setIsPlaying(true)
        })
        .catch(() => setIsPlaying(false))
        .finally(() => setIsLoading(false))
    } else {
      isPlayingRef.current = false
      audio.pause()
      setIsPlaying(false)
    }
  }, [])

  const changeVolume = useCallback((v: number) => {
    const clamped = Math.min(1, Math.max(0, v))
    setVolume(clamped)
    if (clamped > 0 && isMuted) setIsMuted(false)
  }, [isMuted])

  const toggleMute = useCallback(() => {
    const audio = audioRef.current
    if (!audio) return
    audio.muted = !audio.muted
    setIsMuted(audio.muted)
  }, [])

  return {
    isPlaying,
    isLoading,
    volume,
    isMuted,
    togglePlay,
    changeVolume,
    toggleMute,
  }
}
