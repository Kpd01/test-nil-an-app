import { AdminDashboard } from "@/components/admin-dashboard"
import Link from "next/link"
import { ChevronLeft, Lock } from "lucide-react"
import { Button } from "@/components/ui/button"
import { AccessControlPanel } from "@/components/access-control-panel"

export default function AdminPage() {
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
          href="/"
          className="inline-flex items-center mb-6 text-[#2c5282] hover:text-[#1a365d] bg-white px-3 py-1 rounded-full transition-all duration-300 hover:scale-105"
        >
          <ChevronLeft className="h-4 w-4 mr-1" />🚌 Back to Station
        </Link>

        <div className="max-w-5xl mx-auto">
          <div className="flex items-center justify-center mb-8 animate-slide-in">
            <Lock className="h-5 w-5 mr-2 text-white" />
            <h1 className="text-3xl font-bold text-white drop-shadow-md">🚌 Conductor's Control Center</h1>
          </div>

          <div className="mb-8 flex justify-center animate-slide-in-up">
            <Link href="/admin/spin-wheel">
              <Button className="bg-[#ffb347] hover:bg-[#ffa726] text-white transition-all duration-300 hover:scale-105">
                🎡 Next Stop: Spin Wheel Challenge
              </Button>
            </Link>
          </div>

          <div className="animate-slide-in-up mb-8">
            <AccessControlPanel />
          </div>

          <div className="animate-slide-in-up">
            <AdminDashboard />
          </div>
        </div>
      </div>
    </div>
  )
}
