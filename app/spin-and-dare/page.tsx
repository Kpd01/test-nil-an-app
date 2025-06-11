import { SpinWheel } from "@/components/spin-wheel"
import Link from "next/link"
import { ChevronLeft } from "lucide-react"
import { redirect } from "next/navigation"

export default function SpinAndDarePage() {
  // Redirect to admin page
  redirect("/admin/spin-wheel")

  return (
    <div className="min-h-screen bg-[#5dade2] py-8 relative">
      {/* Background elements */}
      <div className="absolute top-10 left-10 text-5xl">☁️</div>
      <div className="absolute top-20 right-20 text-5xl">☁️</div>
      <div className="absolute bottom-20 left-1/4 text-5xl">☁️</div>
      <div className="absolute top-1/3 right-1/4 text-5xl">☁️</div>
      <div className="absolute top-20 left-1/3 text-5xl">☀️</div>

      <div className="container mx-auto px-4 relative z-10">
        <Link
          href="/"
          className="inline-flex items-center mb-6 text-[#1a5276] hover:text-[#154360] bg-white px-3 py-1 rounded-full"
        >
          <ChevronLeft className="h-4 w-4 mr-1" />
          Back to Home
        </Link>

        <div className="max-w-3xl mx-auto">
          <div className="text-center mb-8">
            <h1 className="text-4xl font-bold text-white mb-2 drop-shadow-md">Transportation Challenge</h1>
            <p className="text-[#1a5276] bg-white p-3 rounded-lg inline-block">
              Spin the wheel to randomly select a friend and assign them a fun transportation challenge!
            </p>
          </div>

          <SpinWheel />
        </div>
      </div>
    </div>
  )
}
