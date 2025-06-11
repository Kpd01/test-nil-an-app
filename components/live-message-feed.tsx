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
    photo: "/placeholder.svg?height=100&width=100",
    timestamp: new Date().getTime() - 1000 * 60 * 5, // 5 minutes ago
  },
  {
    id: 2,
    name: "Liam",
    message: "I'll never forget our adventures on the playground. Keep that imagination going!",
    photo: "/placeholder.svg?height=100&width=100",
    timestamp: new Date().getTime() - 1000 * 60 * 10, // 10 minutes ago
  },
  {
    id: 3,
    name: "Olivia",
    message: "You're such a sweet kid. I hope you're still just as kind and curious at 18!",
    photo: "/placeholder.svg?height=100&width=100",
    timestamp: new Date().getTime() - 1000 * 60 * 15, // 15 minutes ago
  },
  {
    id: 4,
    name: "Noah",
    message: "Happy birthday! I hope you get to drive all the cool vehicles when you grow up!",
    photo: "/placeholder.svg?height=100&width=100",
    timestamp: new Date().getTime() - 1000 * 60 * 20, // 20 minutes ago
  },
  {
    id: 5,
    name: "Ava",
    message: "Wishing you a wonderful birthday and many more transportation adventures!",
    photo: "/placeholder.svg?height=100&width=100",
    timestamp: new Date().getTime() - 1000 * 60 * 25, // 25 minutes ago
  },
]

export function LiveMessageFeed() {
  const [messages, setMessages] = useState(sampleMessages)
  const [visibleMessages, setVisibleMessages] = useState<number[]>([])

  // Simulate new messages coming in
  useEffect(() => {
    const interval = setInterval(() => {
      // Randomly decide whether to add a new message
      if (Math.random() > 0.7) {
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
          photo: "/placeholder.svg?height=100&width=100",
          timestamp: new Date().getTime(),
        }
        setMessages((prev) => [newMessage, ...prev.slice(0, 19)]) // Keep only the 20 most recent messages
      }
    }, 5000) // Check every 5 seconds

    return () => clearInterval(interval)
  }, [])

  // Control which messages are visible in the feed
  useEffect(() => {
    // Initially show all messages
    setVisibleMessages(messages.map((m) => m.id))

    // Set up a cycle to highlight different messages
    const interval = setInterval(() => {
      // Randomly select 3-5 messages to show
      const numToShow = Math.floor(Math.random() * 3) + 3
      const shuffled = [...messages].sort(() => 0.5 - Math.random())
      const selected = shuffled.slice(0, numToShow).map((m) => m.id)
      setVisibleMessages(selected)
    }, 8000) // Change every 8 seconds

    return () => clearInterval(interval)
  }, [messages])

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      <AnimatePresence>
        {messages.map((message) => (
          <motion.div
            key={message.id}
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{
              opacity: visibleMessages.includes(message.id) ? 1 : 0.5,
              scale: visibleMessages.includes(message.id) ? 1 : 0.95,
              y: visibleMessages.includes(message.id) ? 0 : 10,
            }}
            exit={{ opacity: 0, scale: 0.8 }}
            transition={{ duration: 0.5 }}
            className={`${visibleMessages.includes(message.id) ? "z-10" : "z-0"}`}
          >
            <Card className="p-4 border-2 border-[#f9e076] bg-white shadow-md overflow-hidden">
              <div className="flex gap-4">
                {message.photo ? (
                  <div className="w-16 h-16 rounded-full overflow-hidden flex-shrink-0 border-2 border-[#f9e076]">
                    <img
                      src={message.photo || "/placeholder.svg"}
                      alt={message.name}
                      className="w-full h-full object-cover"
                    />
                  </div>
                ) : (
                  <div className="w-16 h-16 rounded-full bg-[#f9e076] flex items-center justify-center flex-shrink-0">
                    <span className="text-xl font-semibold text-[#2c5282]">{message.name.charAt(0)}</span>
                  </div>
                )}
                <div className="flex-1">
                  <div className="flex justify-between items-start">
                    <h3 className="font-semibold text-[#2c5282]">{message.name}</h3>
                    <span className="text-xs text-gray-400">
                      {new Date(message.timestamp).toLocaleTimeString([], {
                        hour: "2-digit",
                        minute: "2-digit",
                      })}
                    </span>
                  </div>
                  <p className="text-gray-600 mt-1">{message.message}</p>
                </div>
              </div>
            </Card>
          </motion.div>
        ))}
      </AnimatePresence>
    </div>
  )
}
