"use client"

import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { MessageSquare, Camera, Users, Gamepad2, Lock } from "lucide-react"
import { BackgroundMusic } from "@/components/background-music"
import { useAccessControl } from "@/hooks/use-access-control"
import { useUserSession } from "@/hooks/use-user-session"

export default function WelcomePage() {
  const { settings, isLoading } = useAccessControl()
  const { userName } = useUserSession()

  return (
    <div className="min-h-screen bg-[#6baed6] relative overflow-hidden">
      {/* Enhanced weather effects */}
      <div className="absolute top-10 left-10 text-5xl animate-float-slow">☁️</div>
      <div className="absolute top-20 right-20 text-5xl animate-float-medium">☁️</div>
      <div className="absolute bottom-20 left-1/4 text-5xl animate-float-slow">☁️</div>
      <div className="absolute top-1/3 right-1/4 text-5xl animate-float-fast">☁️</div>

      {/* Animated sun with rays */}
      <div className="absolute top-20 left-1/3 text-5xl animate-pulse">☀️</div>
      <div className="absolute top-16 left-1/3 w-16 h-16 animate-spin-slow">
        <div className="absolute inset-0 bg-yellow-300/20 rounded-full animate-ping"></div>
      </div>

      {/* Background music component */}
      <BackgroundMusic />

      {/* Main Title - moved to top */}
      <div className="text-center mb-8">
        <h1 className="text-4xl lg:text-5xl font-bold text-white mb-4 drop-shadow-md animate-bounce-gentle">
          🚌 All Aboard Nilan's Birthday Express! 🚌
        </h1>
      </div>

      <div className="container mx-auto px-4 py-8 relative z-10">
        {/* Hero Section with Better Layout */}
        <div className="space-y-8 mb-12">
          {/* Welcome Content - Top */}
          <div className="text-center animate-slide-in">
            <div className="text-lg text-[#2c5282] bg-white p-6 rounded-xl shadow-lg animate-slide-in mb-4 w-full max-w-5xl mx-auto">
              <div className="text-center space-y-3">
                <p>
                  🚦 <strong>Welcome aboard the party express{userName ? `, ${userName}` : ""}!</strong> We're thrilled
                  to have you ride along on Nilan's big day.
                </p>
                <p>
                  Leave a wish, snap a pic, and honk your love for future Bus Driver Nilan — he'll read it when he's 18
                  and probably roll his eyes (but secretly love it). 🎉
                </p>
              </div>
            </div>
          </div>

          {/* Centered Image */}
          <div className="flex justify-center animate-slide-in">
            <div className="relative w-full max-w-sm">
              {/* Decorative frame */}
              <div className="absolute -inset-1 bg-gradient-to-r from-[#ffb347] via-[#f9e076] to-[#e57373] rounded-2xl opacity-20 animate-pulse-gentle"></div>
              <div className="relative bg-white p-4 rounded-xl shadow-2xl border-4 border-white transform hover:scale-105 transition-all duration-300">
                <img
                  src="/images/nilan-bus-driver.png"
                  alt="Bus Driver Nilan celebrating his birthday"
                  className="w-full h-auto rounded-lg object-contain"
                />
                {/* Speech bubble */}
                <div className="absolute -top-2 -right-2 bg-white border-4 border-[#ffb347] rounded-full p-2 shadow-lg animate-bounce-gentle">
                  <span className="text-2xl">🚌</span>
                </div>
              </div>
            </div>
          </div>

          {/* Action Cards - Grid Layout */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 max-w-6xl mx-auto">
            {/* Messages Card */}
            <Card
              className={`bg-white shadow-md hover:shadow-lg transition-all duration-300 border-2 ${
                settings.messagesEnabled ? "border-[#e57373] hover:scale-105" : "border-gray-300 opacity-75"
              } animate-slide-in-left`}
            >
              <CardContent className="p-6">
                <div className="flex flex-col items-center text-center">
                  <div
                    className={`p-4 rounded-full mb-4 animate-bounce-gentle ${
                      settings.messagesEnabled ? "bg-[#e57373] text-white" : "bg-gray-300 text-gray-500"
                    }`}
                  >
                    {settings.messagesEnabled ? <MessageSquare className="h-8 w-8" /> : <Lock className="h-8 w-8" />}
                  </div>
                  <h2 className="text-xl font-bold mb-3">
                    📝 Leave a Message
                    {!settings.messagesEnabled && <span className="text-red-500 ml-2">🔒</span>}
                  </h2>
                  <p className="mb-4 text-gray-600">
                    {settings.messagesEnabled
                      ? "Write a message for 18-year-old Bus Driver Nilan!"
                      : "Station temporarily closed - check back soon!"}
                  </p>
                  {settings.messagesEnabled ? (
                    <Link href="/message" className="w-full">
                      <Button className="w-full bg-[#e57373] hover:bg-[#ef5350] text-white transition-all duration-300 hover:scale-105 py-3">
                        🎫 Board the Message Bus
                      </Button>
                    </Link>
                  ) : (
                    <Button disabled className="w-full bg-gray-300 text-gray-500 cursor-not-allowed py-3">
                      🚧 Station Closed
                    </Button>
                  )}
                </div>
              </CardContent>
            </Card>

            {/* Gallery Card */}
            <Card
              className={`bg-white shadow-md hover:shadow-lg transition-all duration-300 border-2 ${
                settings.galleryEnabled ? "border-[#8fbc8f] hover:scale-105" : "border-gray-300 opacity-75"
              } animate-slide-in-right`}
            >
              <CardContent className="p-6">
                <div className="flex flex-col items-center text-center">
                  <div
                    className={`p-4 rounded-full mb-4 animate-bounce-gentle ${
                      settings.galleryEnabled ? "bg-[#8fbc8f] text-white" : "bg-gray-300 text-gray-500"
                    }`}
                  >
                    {settings.galleryEnabled ? <Camera className="h-8 w-8" /> : <Lock className="h-8 w-8" />}
                  </div>
                  <h2 className="text-xl font-bold mb-3">
                    📸 Share Photos
                    {!settings.galleryEnabled && <span className="text-red-500 ml-2">🔒</span>}
                  </h2>
                  <p className="mb-4 text-gray-600">
                    {settings.galleryEnabled
                      ? "Upload photos from today's celebration!"
                      : "Station temporarily closed - check back soon!"}
                  </p>
                  {settings.galleryEnabled ? (
                    <Link href="/gallery" className="w-full">
                      <Button className="w-full bg-[#8fbc8f] hover:bg-[#7cac7c] text-white transition-all duration-300 hover:scale-105 py-3">
                        🎨 Next Stop: Photo Gallery
                      </Button>
                    </Link>
                  ) : (
                    <Button disabled className="w-full bg-gray-300 text-gray-500 cursor-not-allowed py-3">
                      🚧 Station Closed
                    </Button>
                  )}
                </div>
              </CardContent>
            </Card>

            {/* Games Card */}
            <Card
              className={`bg-white shadow-md hover:shadow-lg transition-all duration-300 border-2 ${
                settings.gamesEnabled ? "border-[#9b59b6] hover:scale-105" : "border-gray-300 opacity-75"
              } animate-slide-in-right md:col-span-2 lg:col-span-1`}
            >
              <CardContent className="p-6">
                <div className="flex flex-col items-center text-center">
                  <div
                    className={`p-4 rounded-full mb-4 animate-bounce-gentle ${
                      settings.gamesEnabled ? "bg-[#9b59b6] text-white" : "bg-gray-300 text-gray-500"
                    }`}
                  >
                    {settings.gamesEnabled ? <Gamepad2 className="h-8 w-8" /> : <Lock className="h-8 w-8" />}
                  </div>
                  <h2 className="text-xl font-bold mb-3">
                    🎮 Party Games
                    {!settings.gamesEnabled && <span className="text-red-500 ml-2">🔒</span>}
                  </h2>
                  <p className="mb-4 text-gray-600">
                    {settings.gamesEnabled
                      ? "Play spin wheel and quiz games!"
                      : "Station temporarily closed - check back soon!"}
                  </p>
                  {settings.gamesEnabled ? (
                    <Link href="/games" className="w-full">
                      <Button className="w-full bg-[#9b59b6] hover:bg-[#8e44ad] text-white transition-all duration-300 hover:scale-105 py-3">
                        🎯 Enter Game Zone
                      </Button>
                    </Link>
                  ) : (
                    <Button disabled className="w-full bg-gray-300 text-gray-500 cursor-not-allowed py-3">
                      🚧 Station Closed
                    </Button>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Live Messages Button */}
        <div className="text-center mb-8">
          <Link href="/live-feed">
            <Button className="bg-[#ffb347] hover:bg-[#ffa726] text-white transition-all duration-300 hover:scale-105 animate-pulse-gentle">
              <Users className="h-5 w-5 mr-2" />🚌 View All Live Messages
            </Button>
          </Link>
        </div>

        {/* Footer */}
        <footer className="text-center text-white text-sm opacity-70">
          <p>🎂 © 2024 Nilan's Birthday Express - All Passengers Welcome! 🎂</p>
        </footer>
      </div>
    </div>
  )
}
