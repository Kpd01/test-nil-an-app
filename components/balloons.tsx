"use client"

import { useState, useEffect } from "react"
import { motion } from "framer-motion"

// Update the Bubble component to make bubbles more visible
function Bubble({ x, y, size, color }: { x: number; y: number; size: number; color: string }) {
  return (
    <motion.circle
      cx={x}
      cy={y}
      r={size}
      fill={color}
      initial={{ opacity: 0, scale: 0 }}
      animate={{
        opacity: [0.7, 0.5, 0.7], // Increased opacity
        scale: [1, 1.2, 1],
        x: x + Math.random() * 100 - 50,
        y: y + Math.random() * 100 - 50,
      }}
      transition={{
        duration: 5 + Math.random() * 10,
        repeat: Number.POSITIVE_INFINITY,
        repeatType: "reverse",
      }}
    />
  )
}

// Update the FloatingBubbles function to improve visibility and add a fallback
function FloatingBubbles() {
  const [bubbles, setBubbles] = useState<Array<{ id: number; x: number; y: number; size: number; color: string }>>([])
  const [isClient, setIsClient] = useState(false)

  useEffect(() => {
    // Mark as client-side rendered
    setIsClient(true)

    // Create bubbles with transportation theme colors - brighter versions
    const transportationColors = [
      "rgba(107, 174, 214, 0.8)", // Brighter blue
      "rgba(229, 115, 115, 0.8)", // Brighter red
      "rgba(143, 188, 143, 0.8)", // Brighter green
      "rgba(255, 179, 71, 0.8)", // Brighter orange
      "rgba(249, 224, 118, 0.8)", // Brighter yellow
    ]

    // Create bubbles that start from visible positions
    const newBubbles = Array.from({ length: 50 }, (_, i) => ({
      id: i,
      // Position bubbles across the entire viewport
      x: Math.random() * (window.innerWidth - 100) + 50,
      y: Math.random() * (window.innerHeight - 100) + 50,
      size: Math.random() * 40 + 20, // Larger bubbles
      color: transportationColors[Math.floor(Math.random() * transportationColors.length)],
    }))
    setBubbles(newBubbles)
  }, [])

  // If not client-side rendered yet, show static bubbles as fallback
  if (!isClient) {
    return (
      <div className="absolute inset-0 pointer-events-none">
        <div className="w-20 h-20 rounded-full bg-blue-300/70 absolute top-1/4 left-1/4"></div>
        <div className="w-16 h-16 rounded-full bg-red-300/70 absolute top-1/3 right-1/3"></div>
        <div className="w-24 h-24 rounded-full bg-green-300/70 absolute bottom-1/4 right-1/4"></div>
        <div className="w-12 h-12 rounded-full bg-yellow-300/70 absolute bottom-1/3 left-1/3"></div>
      </div>
    )
  }

  return (
    <div className="absolute inset-0 pointer-events-none overflow-visible">
      <svg className="w-full h-full">
        <title>Floating Bubbles</title>
        {bubbles.map((bubble) => (
          <Bubble key={bubble.id} {...bubble} />
        ))}
      </svg>
    </div>
  )
}

export default function FloatingBubblesBackground({
  title = "Floating Bubbles",
}: {
  title?: string
}) {
  // If no title is provided, just return the bubbles without the title and button
  if (!title) {
    return <FloatingBubbles />
  }

  // Otherwise, return the full component with title and button
  const words = title.split(" ")

  return (
    <div className="relative min-h-screen w-full flex items-center justify-center overflow-hidden">
      <FloatingBubbles />

      <div className="relative z-10 container mx-auto px-4 md:px-6 text-center">
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 2 }}
          className="max-w-4xl mx-auto"
        >
          <h1 className="text-5xl sm:text-7xl md:text-8xl font-bold mb-8 tracking-tighter">
            {words.map((word, wordIndex) => (
              <span key={wordIndex} className="inline-block mr-4 last:mr-0">
                {word.split("").map((letter, letterIndex) => (
                  <motion.span
                    key={`${wordIndex}-${letterIndex}`}
                    initial={{ y: 100, opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                    transition={{
                      delay: wordIndex * 0.1 + letterIndex * 0.03,
                      type: "spring",
                      stiffness: 150,
                      damping: 25,
                    }}
                    className="inline-block text-transparent bg-clip-text 
                               bg-gradient-to-r from-blue-600 to-purple-600 
                               dark:from-blue-300 dark:to-purple-300"
                  >
                    {letter}
                  </motion.span>
                ))}
              </span>
            ))}
          </h1>
        </motion.div>
      </div>
    </div>
  )
}
