"use client"

import type React from "react"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"

interface UserNamePromptProps {
  onNameSet: (name: string) => void
  title?: string
  description?: string
  icon?: string
}

export function UserNamePrompt({
  onNameSet,
  title = "Join the Party!",
  description = "Enter your name to get started",
  icon = "🎉",
}: UserNamePromptProps) {
  const [name, setName] = useState("")
  const [isSubmitting, setIsSubmitting] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!name.trim()) return

    setIsSubmitting(true)

    try {
      // Simple delay to show loading state
      await new Promise((resolve) => setTimeout(resolve, 500))
      onNameSet(name.trim())
    } catch (error) {
      console.error("Error setting name:", error)
      onNameSet(name.trim())
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <Card className="w-full max-w-md mx-auto border-2 border-[#e57373] bg-white">
      <CardHeader className="bg-[#e57373] text-white text-center">
        <CardTitle className="flex items-center justify-center gap-2">
          <span className="text-2xl">{icon}</span>
          {title}
        </CardTitle>
      </CardHeader>
      <CardContent className="p-6">
        <p className="text-center text-gray-600 mb-4">{description}</p>
        <form onSubmit={handleSubmit} className="space-y-4">
          <Input
            type="text"
            placeholder="Your name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="border-[#e57373] focus-visible:ring-[#ef5350]"
            autoFocus
            disabled={isSubmitting}
          />
          <Button
            type="submit"
            disabled={!name.trim() || isSubmitting}
            className="w-full bg-[#e57373] hover:bg-[#ef5350] text-white"
          >
            {isSubmitting ? "Joining..." : "Join Party! 🚌"}
          </Button>
        </form>
      </CardContent>
    </Card>
  )
}
