"use client"

import { useState, useEffect } from "react"
import { Card } from "@/components/ui/card"

export function MessageCounter() {
  const [count, setCount] = useState(0)
  const [isAnimating, setIsAnimating] = useState(false)

  // Simulate message count - in real app this would come from database
  useEffect(() => {
    // Start with initial count
    setCount(12)

    // Simulate new messages coming in
    const interval = setInterval(() => {
      if (Math.random() > 0.7) {
        // 30% chance every 10 seconds
        setIsAnimating(true)
        setCount((prev) => prev + 1)
        setTimeout(() => setIsAnimating(false), 600)
      }
    }, 10000)

    return () => clearInterval(interval)
  }, [])

  return (
    <Card className="inline-block bg-white/90 border-2 border-[#f9e076] px-4 py-2">
      <div className="flex items-center gap-2 text-[#2c5282]">
        <span className="text-2xl">🎫</span>
        <span className="font-semibold">
          <span className={`transition-all duration-300 ${isAnimating ? "scale-125 text-[#e57373]" : ""}`}>
            {count}
          </span>{" "}
          passengers have boarded the message express!
        </span>
        {isAnimating && <span className="text-xl animate-bounce">🎉</span>}
      </div>
    </Card>
  )
}
