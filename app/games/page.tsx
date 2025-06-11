"use client"
import Link from "next/link"
import { ChevronLeft } from "lucide-react"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { SpinWheelDisplay } from "@/components/spin-wheel-display"
import { PartyQuiz } from "@/components/party-quiz"
import { PerformanceVoting } from "@/components/performance-voting"
import { AccessDenied } from "@/components/access-denied"
import { useAccessControl } from "@/hooks/use-access-control"
import { useUserSession } from "@/hooks/use-user-session"
import { UserNamePrompt } from "@/components/user-name-prompt"
import { UnifiedLeaderboard } from "@/components/unified-leaderboard"

export default function GamesPage() {
  const { settings, isLoading: isLoadingSettings } = useAccessControl()
  const { userName, setUser, hasUser, isLoading: isLoadingUser } = useUserSession()

  const handleNameSet = (name: string) => {
    console.log("Setting user name:", name)
    setUser(name)
  }

  if (isLoadingSettings || isLoadingUser) {
    return (
      <div className="min-h-screen bg-[#5dade2] flex items-center justify-center">
        <div className="text-white text-xl">🎮 Loading game zone...</div>
      </div>
    )
  }

  if (!settings?.gamesEnabled) {
    return (
      <AccessDenied
        feature="Party Games"
        icon="🎮"
        message="The party games zone is currently closed. The conductor will open it when it's time for guests to play spin wheel challenges and birthday quizzes!"
      />
    )
  }

  // If no username is set, show the prompt
  if (!hasUser) {
    return (
      <div className="min-h-screen bg-[#5dade2] py-8 flex items-center justify-center">
        <div className="container mx-auto px-4">
          <Link
            href="/"
            className="inline-flex items-center mb-6 text-[#1a5276] hover:text-[#154360] bg-white px-3 py-1 rounded-full"
          >
            <ChevronLeft className="h-4 w-4 mr-1" />
            Back to Home
          </Link>

          <div className="max-w-md mx-auto">
            <UserNamePrompt
              onNameSet={handleNameSet}
              title="Join the Game Zone!"
              description="Enter your name to play games and earn points"
              icon="🎮"
            />
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-[#5dade2] py-8 relative">
      {/* Background elements */}
      <div className="absolute top-10 left-10 text-5xl animate-float-slow">☁️</div>
      <div className="absolute top-20 right-20 text-5xl animate-float-medium">☁️</div>
      <div className="absolute bottom-20 left-1/4 text-5xl animate-float-slow">☁️</div>
      <div className="absolute top-1/3 right-1/4 text-5xl animate-float-fast">☁️</div>
      <div className="absolute top-20 left-1/3 text-5xl animate-pulse">☀️</div>

      <div className="container mx-auto px-4 relative z-10">
        <Link
          href="/"
          className="inline-flex items-center mb-6 text-[#1a5276] hover:text-[#154360] bg-white px-3 py-1 rounded-full"
        >
          <ChevronLeft className="h-4 w-4 mr-1" />
          Back to Home
        </Link>

        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-8">
            <h1 className="text-4xl font-bold text-white mb-2 drop-shadow-md">🎮 Party Games Zone 🎮</h1>
            <p className="text-[#1a5276] bg-white p-3 rounded-lg inline-block">
              Welcome, {userName}! Play fun games and earn points for Nilan's birthday celebration!
            </p>
          </div>

          <Tabs defaultValue="spin" className="w-full">
            <TabsList className="grid w-full grid-cols-4 mb-8">
              <TabsTrigger value="spin" className="text-lg">
                🎡 Party Spin
              </TabsTrigger>
              <TabsTrigger value="quiz" className="text-lg">
                🧠 Birthday Quiz
              </TabsTrigger>
              <TabsTrigger value="voting" className="text-lg">
                🏆 Vote Best Performer
              </TabsTrigger>
              <TabsTrigger value="leaderboard" className="text-lg">
                📊 Leaderboard
              </TabsTrigger>
            </TabsList>

            <TabsContent value="spin" className="space-y-4">
              <div className="text-center mb-6">
                <h2 className="text-2xl font-bold text-white mb-2">Transportation Challenge Wheel</h2>
                <p className="text-[#1a5276] bg-white p-2 rounded-lg inline-block">
                  Watch the wheel spin and see who gets the next challenge!
                </p>
              </div>
              <SpinWheelDisplay />
            </TabsContent>

            <TabsContent value="quiz" className="space-y-4">
              <div className="text-center mb-6">
                <h2 className="text-2xl font-bold text-white mb-2">Birthday Party Quiz</h2>
                <p className="text-[#1a5276] bg-white p-2 rounded-lg inline-block">
                  Test your party knowledge and earn points!
                </p>
              </div>
              <PartyQuiz />
            </TabsContent>

            <TabsContent value="voting" className="space-y-4">
              <div className="text-center mb-6">
                <h2 className="text-2xl font-bold text-white mb-2">Best Performer Voting</h2>
                <p className="text-[#1a5276] bg-white p-2 rounded-lg inline-block">
                  Vote for your favorite spin and dare performer!
                </p>
              </div>
              <PerformanceVoting />
            </TabsContent>

            <TabsContent value="leaderboard" className="space-y-4">
              <div className="text-center mb-6">
                <h2 className="text-2xl font-bold text-white mb-2">Party Champions</h2>
                <p className="text-[#1a5276] bg-white p-2 rounded-lg inline-block">
                  See who's dominating the party games!
                </p>
              </div>
              <UnifiedLeaderboard />
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </div>
  )
}
