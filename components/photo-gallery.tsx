"use client"

import { useState, useEffect } from "react"
import { Card } from "@/components/ui/card"
import { Dialog, DialogContent, DialogTrigger } from "@/components/ui/dialog"
import { getPhotos } from "@/lib/storage"
import { Button } from "@/components/ui/button"

interface Photo {
  id: string
  url: string
  uploader: string
  caption?: string
  created_at: string
}

export function PhotoGallery() {
  const [photos, setPhotos] = useState<Photo[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    loadPhotos()

    // Listen for photo upload events
    const handlePhotosUploaded = () => {
      loadPhotos()
    }

    window.addEventListener("photosUploaded", handlePhotosUploaded)

    return () => {
      window.removeEventListener("photosUploaded", handlePhotosUploaded)
    }
  }, [])

  const loadPhotos = async () => {
    try {
      const fetchedPhotos = await getPhotos()
      setPhotos(fetchedPhotos)
    } catch (error) {
      console.error("Error loading photos:", error)
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return (
      <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
        {[...Array(6)].map((_, i) => (
          <Card key={i} className="overflow-hidden border-2 border-white animate-pulse">
            <div className="w-full h-40 bg-gray-200" />
          </Card>
        ))}
      </div>
    )
  }

  return (
    <div>
      <div className="flex justify-between items-center mb-4">
        <h3 className="text-lg font-semibold">Journey Memories</h3>
        <Button onClick={loadPhotos} variant="outline" size="sm" disabled={loading}>
          {loading ? "Loading..." : "Refresh"}
        </Button>
      </div>
      {photos.length > 0 ? (
        <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
          {photos.map((photo) => (
            <Dialog key={photo.id}>
              <DialogTrigger asChild>
                <Card className="overflow-hidden cursor-pointer hover:shadow-md transition-shadow border-2 border-white">
                  <img
                    src={photo.url || "/placeholder.svg"}
                    alt={photo.caption || `Photo by ${photo.uploader}`}
                    className="w-full h-40 object-cover"
                    loading="lazy"
                  />
                </Card>
              </DialogTrigger>
              <DialogContent className="max-w-3xl p-0 bg-transparent border-none">
                <div className="relative">
                  <img
                    src={photo.url || "/placeholder.svg"}
                    alt={photo.caption || `Photo by ${photo.uploader}`}
                    className="w-full h-auto max-h-[80vh] object-contain"
                  />
                  {photo.caption && (
                    <div className="absolute bottom-0 left-0 right-0 bg-black bg-opacity-50 text-white p-4">
                      <p className="text-sm">{photo.caption}</p>
                      <p className="text-xs opacity-75">By {photo.uploader}</p>
                    </div>
                  )}
                </div>
              </DialogContent>
            </Dialog>
          ))}
        </div>
      ) : (
        <div className="text-center py-12 bg-white rounded-lg border-2 border-[#2ecc71]">
          <p className="text-gray-500">No photos have been uploaded yet.</p>
          <p className="text-gray-400 text-sm mt-2">Be the first to share a memory!</p>
        </div>
      )}
    </div>
  )
}
