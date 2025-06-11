import Link from "next/link"
import { ChevronLeft } from "lucide-react"
import { SpinWheel } from "@/components/spin-wheel"

export default function AdminSpinWheelPage() {
  return (
    <div className="min-h-screen bg-[#6baed6] py-8 relative overflow-hidden">
      {/* Enhanced weather effects */}
      <div className="absolute top-10 left-10 text-5xl animate-float-slow">☁️</div>
      <div className="absolute top-20 right-20 text-5xl animate-float-medium">☁️</div>
      <div className="absolute bottom-20 left-1/4 text-5xl animate-float-slow">☁️</div>
      <div className="absolute top-1/3 right-1/4 text-5xl animate-float-fast">☁️</div>

      {/* Animated sun */}
      <div className="absolute top-20 left-1/3 text-5xl animate-pulse">☀️</div>

      <div className="container mx-auto px-4 relative z-10">
        <Link
          href="/admin"
          className="inline-flex items-center mb-6 text-[#2c5282] hover:text-[#1a365d] bg-white px-3 py-1 rounded-full transition-all duration-300 hover:scale-105"
        >
          <ChevronLeft className="h-4 w-4 mr-1" />🚌 Back to Control Center
        </Link>

        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-8 animate-slide-in">
            <h1 className="text-3xl font-bold text-white drop-shadow-md">🎡 Spin Wheel Control Center</h1>
            <p className="text-[#2c5282] bg-white p-3 rounded-lg inline-block mt-4">
              Manage guests and control the party spin wheel from here!
            </p>
          </div>

          <div className="animate-slide-in-up">
            <SpinWheel />
          </div>
        </div>
      </div>
    </div>
  )
}
