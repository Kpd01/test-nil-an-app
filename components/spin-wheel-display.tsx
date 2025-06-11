"use client"

import { useState, useRef, useEffect } from "react"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog"
import { VotingSystem } from "@/lib/voting-system"
import { Wifi, WifiOff } from "lucide-react"

export function SpinWheelDisplay() {
  const [selectedGuest, setSelectedGuest] = useState<string | null>(null)
  const [selectedTask, setSelectedTask] = useState<string | null>(null)
  const [isSpinning, setIsSpinning] = useState(false)
  const [showResult, setShowResult] = useState(false)
  const [connectionStatus, setConnectionStatus] = useState<"online" | "offline">("online")

  const wheelRef = useRef<HTMLDivElement>(null)
  const processedCommands = useRef<Set<string>>(new Set())
  const audioRef = useRef<HTMLAudioElement>(null)
  const lastCommandId = useRef<string>("")
  const componentId = useRef<string>(Math.random().toString(36).substr(2, 9))

  useEffect(() => {
    // Initialize audio
    if (typeof window !== "undefined") {
      audioRef.current = new Audio("/audio/wheel-spin-click-slow-down-101152.mp3")
      audioRef.current.preload = "auto"
      audioRef.current.volume = 0.7

      // Add event listeners for debugging
      audioRef.current.addEventListener("canplaythrough", () => {
        console.log("✅ [DISPLAY] Audio loaded successfully")
      })

      audioRef.current.addEventListener("error", (e) => {
        console.error("❌ [DISPLAY] Audio loading error:", e)
      })
    }

    console.log(`🎮 [DISPLAY-${componentId.current}] Component initialized`)
  }, [])

  useEffect(() => {
    let pollInterval: NodeJS.Timeout | null = null
    const componentStartTime = Date.now()

    // Clear any stale localStorage data on component mount
    if (typeof window !== "undefined") {
      try {
        localStorage.removeItem("spin-wheel-command")
        console.log("🧹 [DISPLAY] Cleared localStorage on mount")
      } catch (error) {
        console.log("🧹 [DISPLAY] Error clearing localStorage:", error)
      }
    }

    // Poll server for spin commands
    const pollForCommands = async () => {
      try {
        const response = await fetch("/api/spin-wheel", {
          method: "GET",
          cache: "no-store",
          headers: {
            "Cache-Control": "no-cache, no-store, must-revalidate",
            Pragma: "no-cache",
          },
        })

        if (response.ok) {
          setConnectionStatus("online")
          const data = await response.json()

          if (data.command) {
            console.log(`📋 [DISPLAY-${componentId.current}] Received command:`, data.command.id)

            // Check if we've already processed this command
            if (!processedCommands.current.has(data.command.id) && data.command.id !== lastCommandId.current) {
              console.log(`✅ [DISPLAY-${componentId.current}] Processing new command:`, data.command.id)
              processedCommands.current.add(data.command.id)
              lastCommandId.current = data.command.id
              startSpin(data.command.guest, data.command.task)
            } else {
              console.log(`⏭️ [DISPLAY-${componentId.current}] Command already processed:`, data.command.id)
            }
          } else {
            console.log(`⏰ [DISPLAY-${componentId.current}] No commands available`)
          }
        } else {
          throw new Error(`Server responded with ${response.status}`)
        }
      } catch (error) {
        console.error(`❌ [DISPLAY-${componentId.current}] Failed to poll server:`, error)
        setConnectionStatus("offline")
      }
    }

    // Poll every 3 seconds (further reduced frequency)
    pollInterval = setInterval(pollForCommands, 3000)

    // Initial poll with delay to avoid race conditions
    setTimeout(pollForCommands, 1000)

    // Cleanup old commands every 30 seconds
    const cleanupInterval = setInterval(async () => {
      try {
        await fetch("/api/spin-wheel", { method: "DELETE" })
        console.log(`🧹 [DISPLAY-${componentId.current}] Triggered cleanup`)
      } catch (error) {
        console.log("Cleanup request failed:", error)
      }
    }, 30000)

    return () => {
      if (pollInterval) {
        clearInterval(pollInterval)
      }
      if (cleanupInterval) {
        clearInterval(cleanupInterval)
      }
      console.log(`🔌 [DISPLAY-${componentId.current}] Component unmounted`)
    }
  }, [])

  const playSpinSound = async () => {
    if (audioRef.current) {
      try {
        audioRef.current.currentTime = 0
        await audioRef.current.play()
        console.log("🎵 [DISPLAY] Audio playing successfully")
      } catch (error) {
        console.error("❌ [DISPLAY] Audio play failed:", error)

        // If autoplay is blocked, try to enable on user interaction
        if (error.name === "NotAllowedError") {
          console.log("🔒 [DISPLAY] Autoplay blocked - waiting for user interaction")

          const enableAudio = async () => {
            try {
              if (audioRef.current) {
                await audioRef.current.play()
                audioRef.current.pause()
                audioRef.current.currentTime = 0
                console.log("✅ [DISPLAY] Audio context unlocked")
              }
            } catch (e) {
              console.log("[DISPLAY] Audio unlock failed:", e)
            }
            document.removeEventListener("click", enableAudio)
          }

          document.addEventListener("click", enableAudio, { once: true })
        }
      }
    }
  }

  const stopSpinSound = () => {
    if (audioRef.current) {
      audioRef.current.pause()
      audioRef.current.currentTime = 0
    }
  }

  const startSpin = (guest: string, task: string) => {
    console.log(`🎡 [DISPLAY-${componentId.current}] Starting spin for:`, guest, "with task:", task)

    if (isSpinning) {
      console.log(`⚠️ [DISPLAY-${componentId.current}] Already spinning, ignoring command`)
      return
    }

    setIsSpinning(true)
    setShowResult(false)
    setSelectedGuest(null)
    setSelectedTask(null)

    // Play spinning sound
    playSpinSound()

    // Random rotation between 5 and 10 full spins
    const rotations = 5 + Math.random() * 5
    const degrees = rotations * 360

    if (wheelRef.current) {
      wheelRef.current.style.transition = "transform 4s cubic-bezier(0.1, 0.7, 0.1, 1)"
      wheelRef.current.style.transform = `rotate(${degrees}deg)`
    }

    setTimeout(() => {
      // Stop spinning sound
      stopSpinSound()

      setSelectedGuest(guest)
      setSelectedTask(task)

      // Add performance to voting system
      VotingSystem.addPerformance(guest, task, "unknown")

      setIsSpinning(false)
      setShowResult(true)

      // Reset wheel rotation for next spin
      setTimeout(() => {
        if (wheelRef.current) {
          wheelRef.current.style.transition = "none"
          wheelRef.current.style.transform = "rotate(0deg)"
        }
      }, 500)
    }, 4000)
  }

  const handleDialogChange = (open: boolean) => {
    setShowResult(open)
  }

  return (
    <div className="space-y-8">
      <div className="flex justify-center">
        <div className="flex items-center gap-2 text-sm text-gray-500 mb-4">
          {connectionStatus === "online" ? (
            <>
              <Wifi className="h-4 w-4 text-green-500" />
              <span>Connected to Server</span>
            </>
          ) : (
            <>
              <WifiOff className="h-4 w-4 text-red-500" />
              <span>Offline Mode</span>
            </>
          )}
          <span className="text-xs text-gray-400">ID: {componentId.current.slice(0, 4)}</span>
        </div>
      </div>

      <div className="flex justify-center">
        <div className="relative w-80 h-80">
          {/* Transportation-themed wheel */}
          <div
            ref={wheelRef}
            className="absolute inset-0 rounded-full shadow-lg overflow-hidden"
            style={{
              transformOrigin: "center",
              transition: "transform 4s cubic-bezier(0.1, 0.7, 0.1, 1)",
            }}
          >
            {/* Colorful wheel design */}
            <div className="absolute inset-0 bg-[#6baed6] flex items-center justify-center">
              {/* Wheel segments */}
              <div className="absolute inset-0">
                <div className="absolute inset-0 bg-[#ffb347] clip-segment-1"></div>
                <div className="absolute inset-0 bg-[#8fbc8f] clip-segment-2"></div>
                <div className="absolute inset-0 bg-[#e57373] clip-segment-3"></div>
                <div className="absolute inset-0 bg-[#f9e076] clip-segment-4"></div>
              </div>

              {/* Center of wheel */}
              <div className="absolute inset-[20%] rounded-full bg-white flex items-center justify-center border-4 border-[#2c5282] z-10">
                <div className="text-center">
                  <div className="text-2xl font-bold text-[#2c5282]">{isSpinning ? "Spinning..." : "Ready!"}</div>
                  <div className="text-sm text-[#2c5282]">{isSpinning ? "🎡" : "🚌"}</div>
                </div>
              </div>

              {/* Transportation icons around the wheel */}
              <div className="absolute top-5 left-1/2 -translate-x-1/2 text-3xl">🚌</div>
              <div className="absolute bottom-5 left-1/2 -translate-x-1/2 text-3xl">🚂</div>
              <div className="absolute left-5 top-1/2 -translate-y-1/2 text-3xl">🚁</div>
              <div className="absolute right-5 top-1/2 -translate-y-1/2 text-3xl">🚗</div>
            </div>
          </div>

          {/* Pointer */}
          <div className="absolute top-0 left-1/2 transform -translate-x-1/2 -translate-y-1 w-0 h-0 border-l-[15px] border-r-[15px] border-b-[30px] border-l-transparent border-r-transparent border-b-[#2c5282] z-10"></div>
        </div>
      </div>

      {!isSpinning && !showResult && (
        <div className="text-center space-y-4">
          <div className="bg-white p-6 rounded-lg border-2 border-[#6baed6] max-w-md mx-auto">
            <h3 className="text-xl font-bold text-[#2c5282] mb-2">🎯 Waiting for Conductor</h3>
            <p className="text-[#2c5282]">The party conductor will spin the wheel from the control center!</p>
          </div>
          <div className="bg-yellow-50 p-4 rounded-lg border-2 border-yellow-200 max-w-md mx-auto">
            <p className="text-sm text-yellow-800">
              💡 <strong>Tip:</strong> Click anywhere on the screen to enable audio for the spinning wheel sound!
            </p>
          </div>
        </div>
      )}

      <AlertDialog open={showResult} onOpenChange={handleDialogChange}>
        <AlertDialogContent className="bg-[#e6f7f9] border-2 border-[#6baed6]">
          <AlertDialogHeader>
            <AlertDialogTitle className="text-center text-2xl text-[#2c5282]">
              🎉 {selectedGuest} was selected! 🎉
            </AlertDialogTitle>
            <AlertDialogDescription className="text-center text-lg font-medium text-[#2c5282]">
              Your challenge is:
              <div className="mt-4 p-4 bg-white rounded-lg shadow-inner text-xl border-2 border-[#6baed6]">
                {selectedTask}
              </div>
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogAction className="bg-[#ffb347] hover:bg-[#ffa726] text-white">
              🚌 Let's Do It! 🚌
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      <style jsx global>{`
        .clip-segment-1 {
          clip-path: polygon(50% 50%, 0 0, 100% 0);
        }
        .clip-segment-2 {
          clip-path: polygon(50% 50%, 100% 0, 100% 100%);
        }
        .clip-segment-3 {
          clip-path: polygon(50% 50%, 100% 100%, 0 100%);
        }
        .clip-segment-4 {
          clip-path: polygon(50% 50%, 0 100%, 0 0);
        }
      `}</style>
    </div>
  )
}
