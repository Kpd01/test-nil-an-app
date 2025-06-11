"use client"

import { MessageForm } from "@/components/message-form"
import Link from "next/link"
import { ChevronLeft } from "lucide-react"
import { AccessDenied } from "@/components/access-denied"
import { useAccessControl } from "@/hooks/use-access-control"
import { useUserSession } from "@/hooks/use-user-session"
import { UserNamePrompt } from "@/components/user-name-prompt"

export default function MessagePage() {
  const { settings, isLoading: isLoadingSettings } = useAccessControl()
  const { userName, setUser, hasUser, isLoading: isLoadingUser } = useUserSession()

  const handleNameSet = (name: string) => {
    console.log("Setting user name:", name)
    setUser(name)
  }

  if (isLoadingSettings || isLoadingUser) {
    return (
      <div className="min-h-screen bg-[#6baed6] flex items-center justify-center">
        <div className="text-white text-xl">🚌 Loading station status...</div>
      </div>
    )
  }

  if (!settings.messagesEnabled) {
    return (
      <AccessDenied
        feature="Message"
        icon="📝"
        message="The message station is currently closed. The party conductor will open it when it's time for guests to leave messages for 18-year-old Nilan!"
      />
    )
  }

  // If no username is set, show the prompt
  if (!hasUser) {
    return (
      <div className="min-h-screen bg-[#6baed6] py-8 flex items-center justify-center">
        <div className="container mx-auto px-4">
          <Link
            href="/"
            className="inline-flex items-center mb-6 text-[#2c5282] hover:text-[#1a365d] bg-white px-3 py-1 rounded-full"
          >
            <ChevronLeft className="h-4 w-4 mr-1" />
            Back to Home
          </Link>

          <div className="max-w-md mx-auto">
            <UserNamePrompt
              onNameSet={handleNameSet}
              title="Join the Message Station!"
              description="Enter your name to leave a message for Nilan"
              icon="📝"
            />
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-[#6baed6] py-8 relative overflow-hidden">
      {/* Enhanced weather effects */}
      <div className="absolute top-10 left-10 text-5xl animate-float-slow">☁️</div>
      <div className="absolute top-20 right-20 text-5xl animate-float-medium">☁️</div>
      <div className="absolute bottom-20 left-1/4 text-5xl animate-float-slow">☁️</div>
      <div className="absolute top-1/3 right-1/4 text-5xl animate-float-fast">☁️</div>

      {/* Animated sun */}
      <div className="absolute top-20 left-1/3 text-5xl animate-pulse">☀️</div>
      <div className="absolute top-16 left-1/3 w-16 h-16 animate-spin-slow">
        <div className="absolute inset-0 bg-yellow-300/20 rounded-full animate-ping"></div>
      </div>

      <div className="container mx-auto px-4 relative z-10">
        <Link
          href="/"
          className="inline-flex items-center mb-6 text-[#2c5282] hover:text-[#1a365d] bg-white px-3 py-1 rounded-full transition-all duration-300 hover:scale-105"
        >
          <ChevronLeft className="h-4 w-4 mr-1" />🚌 Back to Station
        </Link>

        <div className="max-w-2xl mx-auto">
          <div className="text-center mb-8 animate-slide-in">
            <h1 className="text-3xl font-bold text-white mb-2 drop-shadow-md">
              📝 Message for Future Bus Driver Nilan
            </h1>
            <p className="text-[#2c5282] bg-white p-3 rounded-lg inline-block">
              🎫 Write a message that Nilan will read when he turns 18. Share your wishes, advice, or a funny memory
              from the journey!
            </p>
          </div>

          <div className="animate-slide-in-up">
            <MessageForm />
          </div>
        </div>
      </div>
    </div>
  )
}
