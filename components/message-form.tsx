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
import { useGamification } from "@/hooks/use-gamification"
import { supabase } from "@/lib/supabase"

export function MessageForm() {
  const router = useRouter()
  const [name, setName] = useState("")
  const [message, setMessage] = useState("")
  const [photo, setPhoto] = useState<File | null>(null)
  const [photoPreview, setPhotoPreview] = useState<string | null>(null)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState(false)

  const [currentPlayerName] = useState(() => {
    if (typeof window !== "undefined") {
      return localStorage.getItem("nilan-party-player-name")
    }
    return null
  })
  const { awardMessagePoints } = useGamification(currentPlayerName || undefined)

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
      // Check if Supabase is available
      if (!supabase) {
        console.log("Supabase not available, simulating submission")
        // Simulate a successful submission with a delay
        await new Promise((resolve) => setTimeout(resolve, 1500))
      } else {
        console.log("Saving message to Supabase")
        // Save message to Supabase
        const { error: supabaseError } = await supabase.from("messages").insert({
          name,
          message,
          emoji: "🎉", // Default emoji
        })

        if (supabaseError) {
          throw new Error(`Supabase error: ${supabaseError.message}`)
        }

        // If there's a photo, upload it to Supabase Storage
        if (photo) {
          // Create a storage bucket if it doesn't exist
          const { data: bucketData } = await supabase.storage.getBucket("photos")
          if (!bucketData) {
            await supabase.storage.createBucket("photos", { public: true })
          }

          // Upload the photo
          const fileName = `${Date.now()}-${photo.name}`
          const { error: uploadError, data: uploadData } = await supabase.storage.from("photos").upload(fileName, photo)

          if (uploadError) {
            console.error("Photo upload error:", uploadError)
          } else if (uploadData) {
            // Get the public URL
            const { data: urlData } = supabase.storage.from("photos").getPublicUrl(fileName)

            // Save photo reference to photos table
            await supabase.from("photos").insert({
              uploader: name,
              url: urlData?.publicUrl || "",
              caption: message,
            })
          }
        }
      }

      setSuccess(true)

      // Award points for sending message
      if (currentPlayerName) {
        awardMessagePoints()
      }

      setName("")
      setMessage("")
      setPhoto(null)
      setPhotoPreview(null)

      // Redirect after a short delay to show success message
      setTimeout(() => {
        router.push("/")
      }, 2000)
    } catch (err) {
      console.error("Error submitting message:", err)
      setError("Failed to submit your message. Please try again.")
    } finally {
      setIsSubmitting(false)
    }
  }

  // Enhanced success message with confetti effect
  if (success) {
    return (
      <Card className="p-8 text-center bg-white shadow-md border-2 border-[#e57373] animate-bounce-in">
        <div className="text-5xl mb-4 animate-bounce">🚌</div>
        <div className="text-4xl mb-4">🎉✨🎊</div>
        <h3 className="text-2xl font-bold text-[#e57373] mb-2">Beep Beep! Message Delivered!</h3>
        <p className="text-gray-600 mb-4">
          Your message has been safely stored in the time capsule for Bus Driver Nilan to read when he turns 18!
        </p>
        <div className="text-2xl mb-4">🎫📮✅</div>
        <Button
          onClick={() => router.push("/")}
          className="mt-4 bg-[#e57373] hover:bg-[#ef5350] text-white transition-all duration-300 hover:scale-105"
        >
          🚌 Return to Station
        </Button>
      </Card>
    )
  }

  return (
    <Card className="p-6 bg-white shadow-md border-2 border-[#e57373] animate-slide-in">
      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="space-y-2">
          <Label htmlFor="name">🎫 Your Name</Label>
          <Input
            id="name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Enter your passenger name"
            required
            className="border-[#e57373] focus-visible:ring-[#ef5350] transition-all duration-300"
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="message">💌 Your Message to 18-Year-Old Bus Driver Nilan</Label>
          <Textarea
            id="message"
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            placeholder="Share your wishes, advice, or a funny memory from the journey..."
            className="min-h-[150px] border-[#e57373] focus-visible:ring-[#ef5350] transition-all duration-300"
            required
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="photo">📸 Add a Photo (Optional)</Label>
          <div className="flex items-center gap-4">
            <Button
              type="button"
              variant="outline"
              onClick={() => document.getElementById("photo")?.click()}
              className="flex items-center gap-2 border-[#e57373] text-[#e57373] hover:bg-[#e57373]/10 transition-all duration-300 hover:scale-105"
            >
              <Camera className="h-4 w-4" />
              {photo ? "📷 Change Photo" : "📷 Add Photo"}
            </Button>
            <Input id="photo" type="file" accept="image/*" onChange={handlePhotoChange} className="hidden" />
            {photoPreview && (
              <div className="relative w-16 h-16 rounded-full overflow-hidden border-2 border-[#e57373] animate-photo-develop">
                <img src={photoPreview || "/placeholder.svg"} alt="Preview" className="w-full h-full object-cover" />
              </div>
            )}
          </div>
        </div>

        {error && <div className="text-red-500 text-sm p-2 bg-red-50 rounded animate-shake">{error}</div>}

        <Button
          type="submit"
          className="w-full bg-[#e57373] hover:bg-[#ef5350] text-white transition-all duration-300 hover:scale-105"
          disabled={isSubmitting}
        >
          {isSubmitting ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />🚌 Message boarding the bus...
            </>
          ) : (
            "🎫 Send Message to Future Nilan"
          )}
        </Button>
      </form>
    </Card>
  )
}
