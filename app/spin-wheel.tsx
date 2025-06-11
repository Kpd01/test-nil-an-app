"use client"

import { useState, useRef } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog"
import { Input } from "@/components/ui/input"
import { RotateCw } from "lucide-react"

// Sample data - in a real app, this would come from a database
const initialGuests = ["Emma", "Liam", "Olivia", "Noah", "Ava", "Ethan", "Sophia", "Lucas"]

const taskCategories = {
  fun: [
    "Do your best dance move",
    "Sing the chorus of your favorite song",
    "Do 10 jumping jacks",
    "Tell a joke",
    "Make a funny face and hold it for 10 seconds",
  ],
  emotional: [
    "Share a memory with Nilan",
    "Tell us what you admire about Nilan",
    "Share a wish for Nilan's future",
    "Give Nilan a piece of advice",
    "Tell us how you met Nilan",
  ],
  silly: [
    "Speak in an accent for the next 2 minutes",
    "Pretend to be an animal of your choice",
    "Try to touch your nose with your tongue",
    "Do your best impression of a celebrity",
    "Make up a short rap about Nilan",
  ],
}

export function SpinWheel() {
  const [guests, setGuests] = useState(initialGuests)
  const [selectedGuest, setSelectedGuest] = useState<string | null>(null)
  const [selectedTask, setSelectedTask] = useState<string | null>(null)
  const [isSpinning, setIsSpinning] = useState(false)
  const [showResult, setShowResult] = useState(false)
  const [activeCategory, setActiveCategory] = useState("fun")
  const [newGuest, setNewGuest] = useState("")

  const wheelRef = useRef<HTMLDivElement>(null)

  const addGuest = () => {
    if (newGuest.trim() && !guests.includes(newGuest.trim())) {
      setGuests([...guests, newGuest.trim()])
      setNewGuest("")
    }
  }

  const spinWheel = () => {
    if (isSpinning || guests.length === 0) return

    setIsSpinning(true)
    setShowResult(false)
    setSelectedGuest(null)
    setSelectedTask(null)

    // Random rotation between 5 and 10 full spins
    const rotations = 5 + Math.random() * 5
    const degrees = rotations * 360

    if (wheelRef.current) {
      wheelRef.current.style.transition = "transform 4s cubic-bezier(0.1, 0.7, 0.1, 1)"
      wheelRef.current.style.transform = `rotate(${degrees}deg)`
    }

    setTimeout(() => {
      // Select random guest and task
      const randomGuestIndex = Math.floor(Math.random() * guests.length)
      const randomGuest = guests[randomGuestIndex]

      const tasks = taskCategories[activeCategory as keyof typeof taskCategories]
      const randomTaskIndex = Math.floor(Math.random() * tasks.length)
      const randomTask = tasks[randomTaskIndex]

      setSelectedGuest(randomGuest)
      setSelectedTask(randomTask)
      setIsSpinning(false)
      setShowResult(true)

      // Reset wheel rotation for next spin
      setTimeout(() => {
        if (wheelRef.current) {
          wheelRef.current.style.transition = "none"
          wheelRef.current.style.transform = "rotate(0deg)"
        }
      }, 500)
    }, 4000)
  }

  return (
    <div className="space-y-8">
      <Tabs defaultValue="fun" onValueChange={setActiveCategory}>
        <div className="flex justify-center mb-4">
          <TabsList>
            <TabsTrigger value="fun">Fun</TabsTrigger>
            <TabsTrigger value="emotional">Emotional</TabsTrigger>
            <TabsTrigger value="silly">Silly</TabsTrigger>
          </TabsList>
        </div>

        <TabsContent value="fun" className="text-center">
          <p className="text-purple-700 mb-4">Fun challenges that will get everyone laughing!</p>
        </TabsContent>
        <TabsContent value="emotional" className="text-center">
          <p className="text-purple-700 mb-4">Heartfelt moments to create special memories.</p>
        </TabsContent>
        <TabsContent value="silly" className="text-center">
          <p className="text-purple-700 mb-4">Silly tasks that will bring out everyone's playful side!</p>
        </TabsContent>
      </Tabs>

      <div className="flex flex-col md:flex-row gap-8 items-center">
        <div className="w-full md:w-1/2 flex justify-center">
          <div className="relative w-64 h-64">
            <div
              ref={wheelRef}
              className="absolute inset-0 rounded-full bg-gradient-to-r from-purple-500 via-pink-500 to-red-500 shadow-lg"
              style={{
                transformOrigin: "center",
                transition: "transform 4s cubic-bezier(0.1, 0.7, 0.1, 1)",
              }}
            >
              <div className="absolute inset-2 rounded-full bg-white flex items-center justify-center">
                <div className="text-center">
                  <div className="text-2xl font-bold text-purple-700 mb-2">Spin Me!</div>
                  <div className="text-sm text-gray-500">{guests.length} Guests</div>
                </div>
              </div>
            </div>
            <div className="absolute top-0 left-1/2 transform -translate-x-1/2 -translate-y-4 w-0 h-0 border-l-[12px] border-r-[12px] border-b-[24px] border-l-transparent border-r-transparent border-b-purple-600 z-10"></div>
          </div>
        </div>

        <div className="w-full md:w-1/2">
          <Card>
            <CardContent className="p-6">
              <h3 className="text-lg font-semibold mb-4">Guest List</h3>

              <div className="flex gap-2 mb-4">
                <Input
                  value={newGuest}
                  onChange={(e) => setNewGuest(e.target.value)}
                  placeholder="Add guest name"
                  onKeyDown={(e) => e.key === "Enter" && addGuest()}
                />
                <Button onClick={addGuest} variant="outline">
                  Add
                </Button>
              </div>

              <div className="max-h-40 overflow-y-auto mb-4 border rounded-md p-2">
                {guests.length > 0 ? (
                  <ul className="space-y-1">
                    {guests.map((guest, index) => (
                      <li
                        key={index}
                        className="flex justify-between items-center text-sm py-1 px-2 hover:bg-gray-50 rounded"
                      >
                        {guest}
                        <Button
                          variant="ghost"
                          size="sm"
                          className="h-6 w-6 p-0 text-gray-400 hover:text-red-500"
                          onClick={() => setGuests(guests.filter((_, i) => i !== index))}
                        >
                          ×
                        </Button>
                      </li>
                    ))}
                  </ul>
                ) : (
                  <div className="text-center py-4 text-gray-400 text-sm">No guests added yet</div>
                )}
              </div>

              <Button
                onClick={spinWheel}
                disabled={isSpinning || guests.length === 0}
                className="w-full bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600"
              >
                {isSpinning ? (
                  <>
                    <RotateCw className="mr-2 h-4 w-4 animate-spin" />
                    Spinning...
                  </>
                ) : (
                  "Spin the Wheel!"
                )}
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>

      <AlertDialog open={showResult} onOpenChange={setShowResult}>
        <AlertDialogContent className="bg-gradient-to-r from-purple-50 to-pink-50 border-2 border-purple-200">
          <AlertDialogHeader>
            <AlertDialogTitle className="text-center text-2xl text-purple-800">
              {selectedGuest} was selected!
            </AlertDialogTitle>
            <AlertDialogDescription className="text-center text-lg font-medium text-pink-700">
              Your challenge is:
              <div className="mt-4 p-4 bg-white rounded-lg shadow-inner text-xl">{selectedTask}</div>
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogAction className="bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600">
              Let's Do It!
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}
