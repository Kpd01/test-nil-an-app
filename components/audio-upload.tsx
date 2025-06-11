"use client"

import type React from "react"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Music, Upload, X } from "lucide-react"
import { uploadAudio } from "@/lib/storage"
import { useToast } from "@/hooks/use-toast"

export function AudioUpload() {
  const [selectedFile, setSelectedFile] = useState<File | null>(null)
  const [isUploading, setIsUploading] = useState(false)
  const [audioPreview, setAudioPreview] = useState<string | null>(null)
  const { toast } = useToast()

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    if (!file.type.startsWith("audio/")) {
      toast({
        title: "Invalid file type",
        description: "Please select an audio file",
        variant: "destructive",
      })
      return
    }

    if (file.size > 50 * 1024 * 1024) {
      toast({
        title: "File too large",
        description: "Audio file must be less than 50MB",
        variant: "destructive",
      })
      return
    }

    setSelectedFile(file)

    // Create audio preview URL
    const audioUrl = URL.createObjectURL(file)
    setAudioPreview(audioUrl)
  }

  const handleUpload = async () => {
    if (!selectedFile) return

    setIsUploading(true)

    try {
      const fileName = `${Date.now()}-${selectedFile.name}`
      await uploadAudio(selectedFile, fileName)

      toast({
        title: "Success!",
        description: "Audio file uploaded successfully",
      })

      // Reset form
      setSelectedFile(null)
      setAudioPreview(null)
    } catch (error) {
      console.error("Upload error:", error)
      toast({
        title: "Upload failed",
        description: "There was an error uploading your audio file",
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
            <Music className="h-12 w-12 text-[#8fbc8f] mb-2" />
            <p className="text-center text-gray-600 mb-4">Upload audio files (MP3, WAV, etc.)</p>
            <Button
              variant="outline"
              onClick={() => document.getElementById("audio-upload")?.click()}
              className="bg-white border-[#8fbc8f] text-[#8fbc8f] hover:bg-[#8fbc8f]/10"
              disabled={isUploading}
            >
              <Upload className="h-4 w-4 mr-2" />
              Select Audio File
            </Button>
            <Input
              id="audio-upload"
              type="file"
              accept="audio/*"
              className="hidden"
              onChange={handleFileChange}
              disabled={isUploading}
            />
          </div>

          {audioPreview && selectedFile && (
            <div className="space-y-4">
              <div className="p-4 border rounded-md">
                <div className="flex items-center justify-between mb-2">
                  <span className="font-medium truncate">{selectedFile.name}</span>
                  <button
                    type="button"
                    onClick={() => {
                      setSelectedFile(null)
                      setAudioPreview(null)
                    }}
                    disabled={isUploading}
                    className="text-gray-500 hover:text-gray-700"
                  >
                    <X className="h-4 w-4" />
                  </button>
                </div>
                <audio controls className="w-full">
                  <source src={audioPreview} type={selectedFile.type} />
                  Your browser does not support the audio element.
                </audio>
              </div>

              <Button
                onClick={handleUpload}
                className="w-full bg-[#8fbc8f] hover:bg-[#7cac7c] text-white"
                disabled={isUploading}
              >
                {isUploading ? "Uploading..." : "Upload Audio"}
              </Button>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  )
}
