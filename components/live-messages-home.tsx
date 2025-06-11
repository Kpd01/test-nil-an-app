"use client"

import { useState, useEffect } from "react"
import { Card } from "@/components/ui/card"
import { motion, AnimatePresence } from "framer-motion"

// Sample messages - in a real app, these would come from a database
const sampleMessages = [
  {
    id: 1,
    name: "Emma",
    message: "Happy birthday Nilan! I hope you grow up to be a great bus driver one day!",
    timestamp: new Date().getTime() - 1000 * 60 * 2,
  },
  {
    id: 2,
    name: "Liam",
    message: "I'll never forget our adventures on the playground. Keep that imagination going!",
    timestamp: new Date().getTime() - 1000 * 60 * 5,
  },
  {
    id: 3,
    name: "Olivia",
    message: "You're such a sweet kid. I hope you're still just as kind and curious at 18!",
    timestamp: new Date().getTime() - 1000 * 60 * 8,
  },
  {
    id: 4,
    name: "Noah",
    message: "Happy birthday! I hope you get to drive all the cool vehicles when you grow up!",
    timestamp: new Date().getTime() - 1000 * 60 * 12,
  },
]

export function LiveMessagesHome() {
  const [messages, setMessages] = useState(sampleMessages)
  const [currentIndex, setCurrentIndex] = useState(0)

  // Simulate new messages coming in
  useEffect(() => {
    const interval = setInterval(() => {
      if (Math.random() > 0.8) {
        const newMessage = {
          id: Math.floor(Math.random() * 10000),
          name: ["Emma", "Liam", "Olivia", "Noah", "Ava", "Ethan", "Sophia", "Lucas"][Math.floor(Math.random() * 8)],
          message: [
            "Happy birthday Nilan! You're awesome!",
            "I hope you have the best day ever!",
            "Can't wait to see what amazing things you'll do!",
            "Wishing you lots of fun with all your transportation toys!",
            "You're going to be the best bus driver one day!",
          ][Math.floor(Math.random() * 5)],
          timestamp: new Date().getTime(),
        }
        setMessages((prev) => [newMessage, ...prev.slice(0, 9)]) // Keep only 10 most recent
      }
    }, 8000)

    return () => clearInterval(interval)
  }, [])

  // Rotate through messages
  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % Math.min(messages.length, 3))
    }, 4000)

    return () => clearInterval(interval)
  }, [messages.length])

  const visibleMessages = messages.slice(0, 3)

  return (
    <Card className="bg-white/95 border-2 border-[#f9e076] p-4 shadow-lg">
      <div className="flex items-center gap-2 mb-3">
        <span className="text-xl">📱</span>
        <h3 className="font-semibold text-[#2c5282]">Live Messages</h3>
        <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
      </div>

      <div className="space-y-2 h-32 overflow-hidden">
        <AnimatePresence mode="wait">
          {visibleMessages.map((message, index) => (
            <motion.div
              key={`${message.id}-${index}`}
              initial={{ opacity: 0, x: 20 }}
              animate={{
                opacity: index === currentIndex ? 1 : 0.4,
                x: 0,
                scale: index === currentIndex ? 1 : 0.95,
              }}
              exit={{ opacity: 0, x: -20 }}
              transition={{ duration: 0.5 }}
              className={`p-2 rounded-lg border ${
                index === currentIndex ? "bg-[#f9e076]/30 border-[#f9e076]" : "bg-gray-50 border-gray-200"
              }`}
            >
              <div className="flex justify-between items-start">
                <span className="font-medium text-[#2c5282] text-sm">{message.name}</span>
                <span className="text-xs text-gray-400">
                  {new Date(message.timestamp).toLocaleTimeString([], {
                    hour: "2-digit",
                    minute: "2-digit",
                  })}
                </span>
              </div>
              <p className="text-sm text-gray-600 mt-1 line-clamp-2">{message.message}</p>
            </motion.div>
          ))}
        </AnimatePresence>
      </div>

      <div className="mt-3 text-center">
        <span className="text-xs text-[#2c5282] bg-[#f9e076]/20 px-2 py-1 rounded-full">
          {messages.length} messages sent 🎉
        </span>
      </div>
    </Card>
  )
}
