"use client"

import { useState, useEffect } from "react"
import { Card } from "@/components/ui/card"

export function CakeCountdown() {
  const [timeLeft, setTimeLeft] = useState({
    hours: 0,
    minutes: 0,
    seconds: 0,
  })
  const [isPartyTime, setIsPartyTime] = useState(false)

  useEffect(() => {
    // Set cake cutting time - you can adjust this time
    const today = new Date()
    const cakeTime = new Date()
    cakeTime.setHours(15, 30, 0, 0) // 3:30 PM today - adjust as needed

    // If the time has passed today, set it for tomorrow
    if (cakeTime < today) {
      cakeTime.setDate(cakeTime.getDate() + 1)
    }

    const interval = setInterval(() => {
      const now = new Date().getTime()
      const distance = cakeTime.getTime() - now

      if (distance < 0) {
        setIsPartyTime(true)
        clearInterval(interval)
        return
      }

      const hours = Math.floor((distance % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60))
      const minutes = Math.floor((distance % (1000 * 60 * 60)) / (1000 * 60))
      const seconds = Math.floor((distance % (1000 * 60)) / 1000)

      setTimeLeft({ hours, minutes, seconds })
    }, 1000)

    return () => clearInterval(interval)
  }, [])

  if (isPartyTime) {
    return (
      <Card className="bg-gradient-to-r from-[#ffb347] to-[#f9e076] border-2 border-[#e57373] p-4 shadow-lg animate-pulse">
        <div className="text-center">
          <div className="text-4xl mb-2">🎂✨</div>
          <h3 className="font-bold text-white text-lg mb-1">IT'S CAKE TIME!</h3>
          <p className="text-white/90 text-sm">🎉 Time to make a wish! 🎉</p>
          <div className="text-2xl mt-2">🕯️🎈🎊</div>
        </div>
      </Card>
    )
  }

  return (
    <Card className="bg-white/95 border-2 border-[#e57373] p-4 shadow-lg">
      <div className="text-center">
        <div className="text-3xl mb-2">🎂</div>
        <h3 className="font-semibold text-[#2c5282] mb-2">Cake Cutting Countdown</h3>

        <div className="grid grid-cols-3 gap-2 mb-3">
          <div className="bg-[#e57373]/20 rounded-lg p-2">
            <div className="text-xl font-bold text-[#e57373]">{timeLeft.hours.toString().padStart(2, "0")}</div>
            <div className="text-xs text-[#2c5282]">Hours</div>
          </div>
          <div className="bg-[#e57373]/20 rounded-lg p-2">
            <div className="text-xl font-bold text-[#e57373]">{timeLeft.minutes.toString().padStart(2, "0")}</div>
            <div className="text-xs text-[#2c5282]">Minutes</div>
          </div>
          <div className="bg-[#e57373]/20 rounded-lg p-2">
            <div className="text-xl font-bold text-[#e57373]">{timeLeft.seconds.toString().padStart(2, "0")}</div>
            <div className="text-xs text-[#2c5282]">Seconds</div>
          </div>
        </div>

        <p className="text-sm text-[#2c5282]">🕯️ Until the big moment! 🕯️</p>
      </div>
    </Card>
  )
}
