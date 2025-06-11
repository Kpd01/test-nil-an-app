import { LiveMessageFeed } from "@/components/live-message-feed"
import Link from "next/link"
import { ChevronLeft } from "lucide-react"

export default function LiveFeedPage() {
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

        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-8 animate-slide-in">
            <h1 className="text-3xl font-bold text-white mb-2 drop-shadow-md">🚌 Live Passenger Messages</h1>
            <p className="text-[#2c5282] bg-white p-3 rounded-lg inline-block">
              📡 See what fellow passengers are saying to Nilan in real-time!
            </p>
          </div>

          <div className="animate-slide-in-up">
            <LiveMessageFeed />
          </div>
        </div>
      </div>
    </div>
  )
}
