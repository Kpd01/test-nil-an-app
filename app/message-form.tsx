"use client"

import type React from "react"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Camera, Loader2 } from "lucide-react"

export function MessageForm() {
  const router = useRouter()
  const [name, setName] = useState("")
  const [message, setMessage] = useState("")
  const [photo, setPhoto] = useState<File | null>(null)
  const [photoPreview, setPhotoPreview] = useState<string | null>(null)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState(false)

  const handlePhotoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0] || null
    setPhoto(file)

    if (file) {
      const reader = new FileReader()
      reader.onloadend = () => {
        setPhotoPreview(reader.result as string)
      }
      reader.readAsDataURL(file)
    } else {
      setPhotoPreview(null)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)
    setError(null)

    try {
      // In a real app, you would upload the photo and save the message
      // For this demo, we'll simulate a successful submission
      await new Promise((resolve) => setTimeout(resolve, 1500))

      // This would be replaced with actual server action call
      // await submitMessage({ name, message, photo })

      setSuccess(true)
      setName("")
      setMessage("")
      setPhoto(null)
      setPhotoPreview(null)

      // Redirect after a short delay to show success message
      setTimeout(() => {
        router.push("/")
      }, 2000)
    } catch (err) {
      setError("Failed to submit your message. Please try again.")
    } finally {
      setIsSubmitting(false)
    }
  }

  if (success) {
    return (
      <Card className="p-8 text-center bg-white shadow-md">
        <div className="text-green-500 text-5xl mb-4">🎉</div>
        <h3 className="text-2xl font-bold text-green-700 mb-2">Thank You!</h3>
        <p className="text-gray-600 mb-4">Your message has been saved for Nilan to read when he turns 18.</p>
        <Button onClick={() => router.push("/")} className="mt-4">
          Return to Home
        </Button>
      </Card>
    )
  }

  return (
    <Card className="p-6 bg-white shadow-md">
      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="space-y-2">
          <Label htmlFor="name">Your Name</Label>
          <Input
            id="name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Enter your name"
            required
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="message">Your Message to 18-Year-Old Nilan</Label>
          <Textarea
            id="message"
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            placeholder="Share your wishes, advice, or a funny memory..."
            className="min-h-[150px]"
            required
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="photo">Add a Photo (Optional)</Label>
          <div className="flex items-center gap-4">
            <Button
              type="button"
              variant="outline"
              onClick={() => document.getElementById("photo")?.click()}
              className="flex items-center gap-2"
            >
              <Camera className="h-4 w-4" />
              {photo ? "Change Photo" : "Take Selfie"}
            </Button>
            <Input id="photo" type="file" accept="image/*" onChange={handlePhotoChange} className="hidden" />
            {photoPreview && (
              <div className="relative w-16 h-16 rounded-full overflow-hidden border-2 border-purple-300">
                <img src={photoPreview || "/placeholder.svg"} alt="Preview" className="w-full h-full object-cover" />
              </div>
            )}
          </div>
        </div>

        {error && <div className="text-red-500 text-sm p-2 bg-red-50 rounded">{error}</div>}

        <Button
          type="submit"
          className="w-full bg-gradient-to-r from-blue-500 to-purple-500 hover:from-blue-600 hover:to-purple-600"
          disabled={isSubmitting}
        >
          {isSubmitting ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Submitting...
            </>
          ) : (
            "Submit Message"
          )}
        </Button>
      </form>
    </Card>
  )
}
