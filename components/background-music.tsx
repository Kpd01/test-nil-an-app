"use client"

import { useState, useRef, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Volume2, VolumeX } from "lucide-react"

export function BackgroundMusic() {
  const [isPlaying, setIsPlaying] = useState(false)
  const [isMuted, setIsMuted] = useState(false)
  const audioRef = useRef<HTMLAudioElement | null>(null)

  useEffect(() => {
    // Clean up on unmount
    return () => {
      if (audioRef.current) {
        audioRef.current.pause()
        audioRef.current = null
      }
    }
  }, [])

  const toggleMusic = async () => {
    if (!audioRef.current) {
      // Create audio element on first interaction
      audioRef.current = new Audio("/audio/wheelsonthe_bus.mp3")
      audioRef.current.loop = true
      audioRef.current.volume = 0.4 // Soft background volume
    }

    try {
      if (isPlaying) {
        audioRef.current.pause()
        setIsPlaying(false)
      } else {
        await audioRef.current.play()
        setIsPlaying(true)
      }
    } catch (error) {
      console.log("Audio playback failed:", error)
    }
  }

  const toggleMute = () => {
    if (audioRef.current) {
      audioRef.current.muted = !isMuted
      setIsMuted(!isMuted)
    }
  }

  return (
    <div className="fixed top-4 right-4 z-30 flex gap-2">
      <Button
        variant="outline"
        size="icon"
        className="bg-white/90 border-[#2c5282] hover:bg-[#e6f7f9] transition-all duration-300"
        onClick={toggleMusic}
        title={isPlaying ? "Stop Wheels on the Bus theme music" : "Play Wheels on the Bus theme music"}
      >
        {isPlaying ? (
          <span className="text-[#2c5282] animate-pulse">🎵</span>
        ) : (
          <span className="text-[#2c5282]">🎵</span>
        )}
      </Button>

      {isPlaying && (
        <Button
          variant="outline"
          size="icon"
          className="bg-white/90 border-[#2c5282] hover:bg-[#e6f7f9] transition-all duration-300"
          onClick={toggleMute}
          title={isMuted ? "Unmute" : "Mute"}
        >
          {isMuted ? <VolumeX className="h-4 w-4 text-[#2c5282]" /> : <Volume2 className="h-4 w-4 text-[#2c5282]" />}
        </Button>
      )}
    </div>
  )
}
