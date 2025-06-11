"use client"

import type React from "react"
import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Camera, Upload, X } from "lucide-react"
import { uploadPhoto } from "@/lib/storage"
import { useToast } from "@/hooks/use-toast"

export function PhotoUpload() {
  const [selectedFiles, setSelectedFiles] = useState<File[]>([])
  const [previews, setPreviews] = useState<string[]>([])
  const [isUploading, setIsUploading] = useState(false)
  const [uploadProgress, setUploadProgress] = useState(0)
  const { toast } = useToast()

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || [])

    // Validate file types and sizes
    const validFiles = files.filter((file) => {
      if (!file.type.startsWith("image/")) {
        toast({
          title: "Invalid file type",
          description: `${file.name} is not an image file`,
          variant: "destructive",
        })
        return false
      }
      if (file.size > 10 * 1024 * 1024) {
        // 10MB limit
        toast({
          title: "File too large",
          description: `${file.name} is larger than 10MB`,
          variant: "destructive",
        })
        return false
      }
      return true
    })

    setSelectedFiles((prev) => [...prev, ...validFiles])

    // Generate previews
    validFiles.forEach((file) => {
      const reader = new FileReader()
      reader.onloadend = () => {
        setPreviews((prev) => [...prev, reader.result as string])
      }
      reader.readAsDataURL(file)
    })
  }

  const removeFile = (index: number) => {
    setSelectedFiles((prev) => prev.filter((_, i) => i !== index))
    setPreviews((prev) => prev.filter((_, i) => i !== index))
  }

  const handleUpload = async () => {
    if (selectedFiles.length === 0) return

    setIsUploading(true)
    setUploadProgress(0)

    try {
      const uploadPromises = selectedFiles.map(async (file, index) => {
        const fileName = `${Date.now()}-${index}-${file.name}`

        // Update progress incrementally
        const result = await uploadPhoto(file, fileName)
        setUploadProgress((prev) => prev + 100 / selectedFiles.length)

        return result
      })

      await Promise.all(uploadPromises)

      toast({
        title: "Success!",
        description: `${selectedFiles.length} photo(s) uploaded successfully`,
      })

      // Reset form immediately after successful upload
      setSelectedFiles([])
      setPreviews([])
      setUploadProgress(0)

      // Trigger a refresh of the gallery if there's a callback
      if (typeof window !== "undefined") {
        window.dispatchEvent(new CustomEvent("photosUploaded"))
      }
    } catch (error) {
      console.error("Upload error:", error)
      toast({
        title: "Upload failed",
        description: "There was an error uploading your photos. Please try again.",
        variant: "destructive",
      })
    } finally {
      setIsUploading(false)
    }
  }

  return (
    <Card className="border-2 border-[#8fbc8f]">
      <CardContent className="p-6">
        <div className="space-y-4">
          <div className="flex flex-col items-center justify-center border-2 border-dashed border-[#8fbc8f] rounded-lg p-6 bg-white">
            <Camera className="h-12 w-12 text-[#8fbc8f] mb-2" />
            <p className="text-center text-gray-600 mb-4">Drag photos here or click to browse</p>
            <Button
              variant="outline"
              onClick={() => document.getElementById("photo-upload")?.click()}
              className="bg-white border-[#8fbc8f] text-[#8fbc8f] hover:bg-[#8fbc8f]/10"
              disabled={isUploading}
            >
              <Upload className="h-4 w-4 mr-2" />
              Select Photos
            </Button>
            <Input
              id="photo-upload"
              type="file"
              accept="image/*"
              multiple
              className="hidden"
              onChange={handleFileChange}
              disabled={isUploading}
            />
          </div>

          {previews.length > 0 && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
                {previews.map((preview, index) => (
                  <div key={index} className="relative group">
                    <img
                      src={preview || "/placeholder.svg"}
                      alt={`Preview ${index}`}
                      className="w-full h-24 object-cover rounded-md border-2 border-[#8fbc8f]"
                    />
                    <button
                      type="button"
                      onClick={() => removeFile(index)}
                      disabled={isUploading}
                      className="absolute top-1 right-1 bg-black bg-opacity-50 text-white rounded-full w-6 h-6 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity disabled:opacity-50"
                    >
                      <X className="h-4 w-4" />
                    </button>
                  </div>
                ))}
              </div>

              {isUploading ? (
                <div className="space-y-2">
                  <div className="w-full bg-gray-200 rounded-full h-2.5">
                    <div
                      className="bg-[#8fbc8f] h-2.5 rounded-full transition-all duration-300 ease-in-out"
                      style={{ width: `${Math.min(uploadProgress, 100)}%` }}
                    />
                  </div>
                  <p className="text-sm text-center text-gray-500">Uploading... {Math.round(uploadProgress)}%</p>
                </div>
              ) : (
                <Button
                  onClick={handleUpload}
                  className="w-full bg-[#8fbc8f] hover:bg-[#7cac7c] text-white"
                  disabled={selectedFiles.length === 0}
                >
                  Upload {selectedFiles.length} Photo{selectedFiles.length !== 1 ? "s" : ""}
                </Button>
              )}
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  )
}
