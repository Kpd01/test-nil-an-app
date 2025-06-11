"use client"

import { useState, useRef, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Volume2, VolumeX, Wifi, WifiOff } from "lucide-react"
import { VotingSystem } from "@/lib/voting-system"

// Updated guest list as provided
const initialGuests = [
  "KP",
  "Manoj",
  "Pandi",
  "Pd",
  "Viki",
  "Sarita",
  "Gupta",
  "Priyanka",
  "Rafael",
  "Rebeca",
  "Juby",
  "Juby friend",
  "Priya",
  "Nikitha",
  "Muthusamy",
  "Priya friend 1",
  "Priya friend 2",
  "Priya friend 3",
  "Priya friend 4",
  "Ola",
  "Ram",
  "Karthik",
  "Poorani",
  "Madhu",
  "Madhu hubby",
  "Sunil",
  "Bhagya",
  "Nandhini",
  "Hubby",
  "Muthu",
  "Sushmitha",
  "Vinayak",
  "Anagha",
  "Frank",
  "Shiva",
  "Partha",
  "Karthik 2",
  "Gf",
]

const taskCategories = {
  funny: [
    "Do your best impression of a crying baby for 30 seconds",
    "Pretend to be a news reporter describing someone eating a sandwich",
    "Act like you're stuck in an invisible box for 1 minute",
    "Do a dramatic reading of a grocery shopping list",
    "Pretend to be a chicken laying an egg",
    "Act out brushing your teeth in slow motion while humming",
    "Do your best runway walk while carrying an imaginary heavy suitcase",
    "Pretend to be a robot that's running out of battery",
    "Act like you're teaching a toddler how to use a smartphone",
    "Do a weather report as if it's raining cats and dogs (literally)",
  ],
  silly: [
    "Speak in a British accent for the next 10 minutes",
    "Let someone draw a mustache on you with washable marker",
    "Wear your shirt inside out and backwards for 15 minutes",
    "Do everything with your non-dominant hand for 5 minutes",
    "Hop on one foot while singing 'Twinkle Twinkle Little Star'",
    "Let the group style your hair however they want",
    "Pretend you're a mime trapped in a shrinking box",
    "Walk backwards everywhere you go for the next 10 minutes",
    "Talk like a pirate for the next 15 minutes, matey!",
    "Do the chicken dance while someone records it",
  ],
  embarrassing: [
    "Tell everyone about your most embarrassing childhood moment",
    "Show everyone the last photo you took on your phone",
    "Admit to a weird habit you have that no one knows about",
    "Share the most embarrassing thing in your search history",
    "Tell everyone about your weirdest dream",
    "Confess to something you did as a kid that you never got caught for",
    "Share your most embarrassing autocorrect fail",
    "Tell everyone about a time you mistook someone for someone else",
    "Admit to the weirdest food combination you actually enjoy",
    "Share the most embarrassing song on your playlist",
  ],
}

export function SpinWheel() {
  const [guests, setGuests] = useState(initialGuests)
  const [selectedGuest, setSelectedGuest] = useState<string | null>(null)
  const [selectedTask, setSelectedTask] = useState<string | null>(null)
  const [isSpinning, setIsSpinning] = useState(false)
  const [showResult, setShowResult] = useState(false)
  const [activeCategory, setActiveCategory] = useState("funny")
  const [newGuest, setNewGuest] = useState("")
  const [audioEnabled, setAudioEnabled] = useState(true)
  const [connectionStatus, setConnectionStatus] = useState<"online" | "offline">("online")
  const [audioStatus, setAudioStatus] = useState<"loading" | "ready" | "error" | "blocked">("loading")
  const [usedGuests, setUsedGuests] = useState<string[]>([])

  const wheelRef = useRef<HTMLDivElement>(null)
  const audioRef = useRef<HTMLAudioElement>(null)

  useEffect(() => {
    // Initialize audio with multiple fallback approaches
    if (typeof window !== "undefined") {
      console.log("🎵 Initializing audio...")

      // Create audio element
      audioRef.current = new Audio()
      audioRef.current.crossOrigin = "anonymous"
      audioRef.current.preload = "auto"
      audioRef.current.volume = 0.7

      // Try multiple audio sources
      const audioSources = [
        "/audio/wheel-spin-click-slow-down-101152.mp3",
        "https://hebbkx1anhila5yf.public.blob.vercel-storage.com/wheel-spin-click-slow-down-101152-dn1k7Df0jae7VqvmkaCg4GkvRMrrZp.mp3", // Direct blob URL as fallback
      ]

      let currentSourceIndex = 0

      const tryNextSource = () => {
        if (currentSourceIndex < audioSources.length) {
          const source = audioSources[currentSourceIndex]
          console.log(`🔄 Trying audio source ${currentSourceIndex + 1}:`, source)
          audioRef.current!.src = source
          audioRef.current!.load()
          currentSourceIndex++
        } else {
          console.error("❌ All audio sources failed")
          setAudioStatus("error")
        }
      }

      // Event listeners
      audioRef.current.addEventListener("loadstart", () => {
        console.log("🔄 Audio loading started...")
        setAudioStatus("loading")
      })

      audioRef.current.addEventListener("canplay", () => {
        console.log("✅ Audio can play")
        setAudioStatus("ready")
      })

      audioRef.current.addEventListener("canplaythrough", () => {
        console.log("✅ Audio fully loaded")
        setAudioStatus("ready")
      })

      audioRef.current.addEventListener("error", (e) => {
        console.error("❌ Audio error:", e)
        console.error("Audio error details:", audioRef.current?.error)
        tryNextSource()
      })

      audioRef.current.addEventListener("play", () => {
        console.log("▶️ Audio started playing")
      })

      audioRef.current.addEventListener("pause", () => {
        console.log("⏸️ Audio paused")
      })

      audioRef.current.addEventListener("ended", () => {
        console.log("⏹️ Audio ended")
      })

      // Start with first source
      tryNextSource()
    }
  }, [])

  const addGuest = () => {
    if (newGuest.trim() !== "") {
      setGuests([...guests, newGuest])
      setNewGuest("")
    }
  }

  const testAudio = async () => {
    if (!audioRef.current) {
      console.error("❌ Audio not initialized")
      return false
    }

    try {
      console.log("🧪 Testing audio...")
      console.log("Audio state:", {
        src: audioRef.current.src,
        readyState: audioRef.current.readyState,
        networkState: audioRef.current.networkState,
        paused: audioRef.current.paused,
        volume: audioRef.current.volume,
        duration: audioRef.current.duration,
        error: audioRef.current.error,
      })

      audioRef.current.currentTime = 0
      await audioRef.current.play()

      // Stop after 1 second for testing
      setTimeout(() => {
        if (audioRef.current) {
          audioRef.current.pause()
          audioRef.current.currentTime = 0
        }
      }, 1000)

      console.log("✅ Audio test successful!")
      setAudioStatus("ready")
      return true
    } catch (error) {
      console.error("❌ Audio test failed:", error)
      setAudioStatus("blocked")
      return false
    }
  }

  const playSpinSound = async () => {
    if (!audioEnabled || !audioRef.current) {
      console.log("🔇 Audio disabled or not available")
      return
    }

    try {
      console.log("🎵 Attempting to play spin sound...")

      // Reset to beginning
      audioRef.current.currentTime = 0

      // Check if audio is ready
      if (audioRef.current.readyState < 2) {
        console.log("⏳ Audio not ready, waiting...")
        await new Promise((resolve) => {
          const onCanPlay = () => {
            audioRef.current?.removeEventListener("canplay", onCanPlay)
            resolve(true)
          }
          audioRef.current?.addEventListener("canplay", onCanPlay)
        })
      }

      await audioRef.current.play()
      console.log("✅ Spin sound playing!")
    } catch (error) {
      console.error("❌ Failed to play spin sound:", error)
      setAudioStatus("blocked")

      // Try to create a new audio instance as fallback
      try {
        console.log("🔄 Trying fallback audio...")
        const fallbackAudio = new Audio("/audio/wheel-spin-click-slow-down-101152.mp3")
        fallbackAudio.volume = 0.7
        await fallbackAudio.play()
        console.log("✅ Fallback audio working!")
      } catch (fallbackError) {
        console.error("❌ Fallback audio also failed:", fallbackError)
      }
    }
  }

  const stopSpinSound = () => {
    if (audioRef.current) {
      audioRef.current.pause()
      audioRef.current.currentTime = 0
    }
  }

  const sendSpinCommand = async (guest: string, task: string, category: string) => {
    try {
      const response = await fetch("/api/spin-wheel", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          action: "spin",
          guest,
          task,
          category,
          timestamp: Date.now(),
        }),
      })

      if (response.ok) {
        setConnectionStatus("online")
        console.log("Spin command sent to server successfully")
      } else {
        throw new Error("Server error")
      }
    } catch (error) {
      console.error("Failed to send spin command to server:", error)
      setConnectionStatus("offline")

      // Fallback to localStorage for offline support
      const fallbackCommand = {
        action: "spin",
        guest,
        task,
        category,
        timestamp: Date.now(),
        id: Math.random().toString(36).substr(2, 9),
      }
      localStorage.setItem("spin-wheel-command", JSON.stringify(fallbackCommand))
    }
  }

  const spinWheel = async () => {
    if (isSpinning || guests.length === 0) return

    setIsSpinning(true)
    setShowResult(false)
    setSelectedGuest(null)
    setSelectedTask(null)

    // Play spinning sound
    playSpinSound()

    // Get available guests (not yet used)
    const availableGuests = guests.filter((guest) => !usedGuests.includes(guest))

    console.log("🎯 Available guests:", availableGuests)
    console.log("🎯 Used guests:", usedGuests)
    console.log("🎯 Total guests:", guests.length)

    // If no available guests, reset the used list (everyone gets a fresh chance)
    const guestsToChooseFrom = availableGuests.length > 0 ? availableGuests : guests

    // Select random guest from available pool
    const randomGuestIndex = Math.floor(Math.random() * guestsToChooseFrom.length)
    const randomGuest = guestsToChooseFrom[randomGuestIndex]

    // If we reset the pool, clear used guests, otherwise add current guest to used list
    if (availableGuests.length === 0) {
      setUsedGuests([randomGuest])
    } else {
      setUsedGuests([...usedGuests, randomGuest])
    }

    const tasks = taskCategories[activeCategory as keyof typeof taskCategories]
    const randomTaskIndex = Math.floor(Math.random() * tasks.length)
    const randomTask = tasks[randomTaskIndex]

    console.log("Admin spinning for:", randomGuest, "with task:", randomTask)

    // Send command to server for cross-device sync
    await sendSpinCommand(randomGuest, randomTask, activeCategory)

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

      setSelectedGuest(randomGuest)
      setSelectedTask(randomTask)

      // Add performance to voting system
      VotingSystem.addPerformance(randomGuest, randomTask, activeCategory as "funny" | "silly" | "embarrassing")

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

  const toggleAudio = () => {
    setAudioEnabled(!audioEnabled)
  }

  const getAudioStatusColor = () => {
    switch (audioStatus) {
      case "ready":
        return "text-green-600"
      case "loading":
        return "text-yellow-600"
      case "error":
        return "text-red-600"
      case "blocked":
        return "text-orange-600"
      default:
        return "text-gray-600"
    }
  }

  const getAudioStatusText = () => {
    switch (audioStatus) {
      case "ready":
        return "Audio Ready ✅"
      case "loading":
        return "Loading Audio ⏳"
      case "error":
        return "Audio Error ❌"
      case "blocked":
        return "Audio Blocked 🔒"
      default:
        return "Audio Unknown ❓"
    }
  }

  return (
    <div className="space-y-8">
      <div className="flex justify-between items-center">
        <div className="text-center text-sm text-gray-500 flex-1 flex items-center justify-center gap-2">
          {connectionStatus === "online" ? (
            <>
              <Wifi className="h-4 w-4 text-green-500" />
              <span>Server Connected</span>
            </>
          ) : (
            <>
              <WifiOff className="h-4 w-4 text-red-500" />
              <span>Offline Mode</span>
            </>
          )}
        </div>
        <div className={`text-xs ${getAudioStatusColor()}`}>{getAudioStatusText()}</div>
        <Button
          onClick={toggleAudio}
          variant="outline"
          size="sm"
          className="border-[#6baed6] text-[#2c5282] hover:bg-[#e6f7f9]"
        >
          {audioEnabled ? <Volume2 className="h-4 w-4" /> : <VolumeX className="h-4 w-4" />}
        </Button>
        <Button
          onClick={testAudio}
          variant="outline"
          size="sm"
          className="border-[#6baed6] text-[#2c5282] hover:bg-[#e6f7f9]"
        >
          Test Audio
        </Button>
      </div>

      {/* Category selection */}
      <div className="bg-white p-4 rounded-lg shadow-md">
        <h3 className="font-semibold text-[#2c5282] mb-2">Select Task Category:</h3>
        <div className="grid grid-cols-3 gap-2">
          <Button
            variant={activeCategory === "funny" ? "default" : "outline"}
            onClick={() => setActiveCategory("funny")}
            className={activeCategory === "funny" ? "bg-[#ffb347] hover:bg-[#ffa726]" : ""}
          >
            Funny
          </Button>
          <Button
            variant={activeCategory === "silly" ? "default" : "outline"}
            onClick={() => setActiveCategory("silly")}
            className={activeCategory === "silly" ? "bg-[#8fbc8f] hover:bg-[#7cac7c]" : ""}
          >
            Silly
          </Button>
          <Button
            variant={activeCategory === "embarrassing" ? "default" : "outline"}
            onClick={() => setActiveCategory("embarrassing")}
            className={activeCategory === "embarrassing" ? "bg-[#e57373] hover:bg-[#d32f2f]" : ""}
          >
            Embarrassing
          </Button>
        </div>
      </div>

      {/* Wheel visualization */}
      <div className="flex justify-center">
        <div className="relative w-80 h-80">
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

      {/* Spin button */}
      <div className="flex justify-center">
        <Button
          onClick={spinWheel}
          disabled={isSpinning || guests.length === 0}
          className="bg-[#2c5282] hover:bg-[#1a365d] text-white px-8 py-6 text-xl rounded-full shadow-lg transform transition-transform hover:scale-105 disabled:opacity-50"
        >
          {isSpinning ? "Spinning..." : "Spin the Wheel!"}
        </Button>
      </div>

      {/* Result display */}
      {showResult && (
        <div className="bg-white p-6 rounded-lg border-2 border-[#6baed6] max-w-md mx-auto animate-fade-in">
          <h3 className="text-xl font-bold text-[#2c5282] mb-2">🎉 {selectedGuest} was selected!</h3>
          <p className="text-[#2c5282] mb-4">Their challenge is:</p>
          <div className="p-4 bg-[#e6f7f9] rounded-lg border border-[#6baed6]">
            <p className="text-lg font-medium">{selectedTask}</p>
          </div>
        </div>
      )}

      {/* Guest management */}
      <div className="bg-white p-6 rounded-lg shadow-md">
        <h3 className="font-semibold text-[#2c5282] mb-4">Guest Management</h3>

        {/* Add new guest */}
        <div className="flex gap-2 mb-4">
          <input
            type="text"
            value={newGuest}
            onChange={(e) => setNewGuest(e.target.value)}
            placeholder="Add new guest..."
            className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#6baed6]"
            onKeyDown={(e) => e.key === "Enter" && addGuest()}
          />
          <Button onClick={addGuest} className="bg-[#2c5282] hover:bg-[#1a365d]">
            Add
          </Button>
        </div>

        {/* Guest list */}
        <div className="max-h-60 overflow-y-auto border border-gray-200 rounded-md">
          <div className="grid grid-cols-2 gap-2 p-2">
            {guests.map((guest, index) => (
              <div
                key={index}
                className={`px-3 py-2 rounded-md text-sm ${
                  usedGuests.includes(guest) ? "bg-gray-100 text-gray-500" : "bg-[#e6f7f9] text-[#2c5282]"
                }`}
              >
                {guest} {usedGuests.includes(guest) && "✓"}
              </div>
            ))}
          </div>
        </div>

        {/* Reset used guests */}
        {usedGuests.length > 0 && (
          <Button
            variant="outline"
            size="sm"
            onClick={() => setUsedGuests([])}
            className="mt-2 text-xs border-[#6baed6] text-[#2c5282]"
          >
            Reset Used Guests
          </Button>
        )}
      </div>

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
        @keyframes fade-in {
          from { opacity: 0; }
          to { opacity: 1; }
        }
        .animate-fade-in {
          animation: fade-in 0.5s ease-in-out;
        }
      `}</style>
    </div>
  )
}
