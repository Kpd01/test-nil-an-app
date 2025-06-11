"use client"

import { PhotoUpload } from "@/components/photo-upload"
import { PhotoGallery } from "@/components/photo-gallery"
import Link from "next/link"
import { ChevronLeft } from "lucide-react"
import { AccessDenied } from "@/components/access-denied"
import { useAccessControl } from "@/hooks/use-access-control"

export default function GalleryPage() {
  const { settings, isLoading } = useAccessControl()

  if (isLoading) {
    return (
      <div className="min-h-screen bg-[#6baed6] flex items-center justify-center">
        <div className="text-white text-xl">📸 Loading gallery status...</div>
      </div>
    )
  }

  if (!settings.galleryEnabled) {
    return (
      <AccessDenied
        feature="Photo Gallery"
        icon="📸"
        message="The photo gallery station is currently closed. The conductor will open it when it's time for guests to share their celebration photos!"
      />
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

        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-8 animate-slide-in">
            <h1 className="text-3xl font-bold text-white mb-2 drop-shadow-md">📸 Photo Gallery Express</h1>
            <p className="text-[#2c5282] bg-white p-3 rounded-lg inline-block">
              🎨 Share your favorite moments from Nilan's transportation-themed birthday celebration!
            </p>
          </div>

          <div className="animate-slide-in-up">
            <PhotoUpload />
          </div>

          <div className="mt-12 animate-slide-in-up">
            <h2 className="text-2xl font-semibold text-white mb-4 drop-shadow-md">🖼️ Journey Memories</h2>
            <PhotoGallery />
          </div>
        </div>
      </div>
    </div>
  )
}
