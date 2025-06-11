"use client"

import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Lock } from "lucide-react"
import Link from "next/link"

interface AccessDeniedProps {
  feature: string
  icon: string
  message: string
}

export function AccessDenied({ feature, icon, message }: AccessDeniedProps) {
  return (
    <div className="min-h-screen bg-[#6baed6] py-8 relative overflow-hidden flex items-center justify-center">
      {/* Background elements */}
      <div className="absolute top-10 left-10 text-5xl animate-float-slow">☁️</div>
      <div className="absolute top-20 right-20 text-5xl animate-float-medium">☁️</div>
      <div className="absolute bottom-20 left-1/4 text-5xl animate-float-slow">☁️</div>
      <div className="absolute top-1/3 right-1/4 text-5xl animate-float-fast">☁️</div>

      <div className="container mx-auto px-4 relative z-10">
        <div className="max-w-2xl mx-auto">
          <Card className="border-2 border-[#ffb347] bg-white shadow-lg">
            <CardContent className="p-8 text-center">
              <div className="text-6xl mb-4">{icon}</div>
              <div className="text-4xl mb-4">
                <Lock className="h-12 w-12 mx-auto text-[#e57373]" />
              </div>

              <h1 className="text-3xl font-bold text-[#2c5282] mb-4">🚧 Station Temporarily Closed 🚧</h1>

              <div className="bg-[#f9e076]/20 border-2 border-[#f9e076] rounded-lg p-6 mb-6">
                <h2 className="text-xl font-semibold text-[#2c5282] mb-2">{feature} Station</h2>
                <p className="text-gray-600 mb-4">{message}</p>
                <div className="text-sm text-[#2c5282] bg-white p-3 rounded-lg">
                  🎫 The party conductor will open this station when it's time!
                </div>
              </div>

              <Link href="/">
                <Button className="bg-[#6baed6] hover:bg-[#5dade2] text-white transition-all duration-300 hover:scale-105">
                  🚌 Return to Main Station
                </Button>
              </Link>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
