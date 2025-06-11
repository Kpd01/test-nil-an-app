"use client"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Trophy, Star, Target } from "lucide-react"
import { useGamification } from "@/hooks/use-gamification"
import { useUserSession } from "@/hooks/use-user-session"
import { UserNamePrompt } from "@/components/user-name-prompt"

export function PlayerStats() {
  const { userName, setUser, clearUser, isLoading } = useUserSession()
  const { currentPlayer } = useGamification(userName || undefined)

  if (isLoading) {
    return (
      <Card className="border-2 border-[#e57373] bg-white">
        <CardHeader className="bg-[#e57373] text-white">
          <CardTitle className="text-center">🎫 Loading Player Stats...</CardTitle>
        </CardHeader>
        <CardContent className="p-6 flex justify-center">
          <div className="animate-pulse">⏳</div>
        </CardContent>
      </Card>
    )
  }

  if (!userName || !currentPlayer) {
    return (
      <Card className="border-2 border-[#e57373] bg-white">
        <CardContent className="p-6">
          <UserNamePrompt
            onNameSet={(name) => setUser(name)}
            title="Join the Party!"
            description="Enter your name to start earning points and badges!"
            icon="🎫"
          />
        </CardContent>
      </Card>
    )
  }

  const earnedBadges = currentPlayer.badges.filter((b) => b.earned)
  const availableBadges = currentPlayer.badges.filter((b) => !b.earned)

  return (
    <div className="space-y-6">
      {/* Player Overview */}
      <Card className="border-2 border-[#8fbc8f] bg-white">
        <CardHeader className="bg-[#8fbc8f] text-white">
          <CardTitle className="text-center flex items-center justify-center gap-2">
            <Star className="h-6 w-6" />
            Welcome aboard, {currentPlayer.name}! 🎉
          </CardTitle>
        </CardHeader>
        <CardContent className="p-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-center">
            <div className="bg-[#e6f7f9] p-4 rounded-lg">
              <div className="text-3xl font-bold text-[#2c5282]">{currentPlayer.points}</div>
              <div className="text-sm text-gray-600">Total Points</div>
            </div>
            <div className="bg-[#f3e5f5] p-4 rounded-lg">
              <div className="text-3xl font-bold text-[#2c5282]">{earnedBadges.length}</div>
              <div className="text-sm text-gray-600">Badges Earned</div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Earned Badges */}
      {earnedBadges.length > 0 && (
        <Card className="border-2 border-[#ffb347] bg-white">
          <CardHeader className="bg-[#ffb347] text-white">
            <CardTitle className="text-center flex items-center justify-center gap-2">
              <Trophy className="h-6 w-6" />🏆 Your Achievements
            </CardTitle>
          </CardHeader>
          <CardContent className="p-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {earnedBadges.map((badge) => (
                <div
                  key={badge.id}
                  className="flex items-center gap-3 p-3 bg-gradient-to-r from-yellow-50 to-yellow-100 border-2 border-yellow-300 rounded-lg"
                >
                  <div className="text-3xl">{badge.icon}</div>
                  <div>
                    <h4 className="font-bold text-[#2c5282]">{badge.name}</h4>
                    <p className="text-sm text-gray-600">{badge.description}</p>
                    {badge.earnedAt && (
                      <p className="text-xs text-gray-500">Earned: {badge.earnedAt.toLocaleDateString()}</p>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Available Badges */}
      {availableBadges.length > 0 && (
        <Card className="border-2 border-gray-300 bg-white">
          <CardHeader className="bg-gray-100">
            <CardTitle className="text-center flex items-center justify-center gap-2 text-gray-700">
              <Target className="h-6 w-6" />🎯 Badges to Earn
            </CardTitle>
          </CardHeader>
          <CardContent className="p-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {availableBadges.map((badge) => (
                <div
                  key={badge.id}
                  className="flex items-center gap-3 p-3 bg-gray-50 border-2 border-gray-200 rounded-lg opacity-75"
                >
                  <div className="text-3xl grayscale">{badge.icon}</div>
                  <div>
                    <h4 className="font-bold text-gray-600">{badge.name}</h4>
                    <p className="text-sm text-gray-500">{badge.description}</p>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Change Player */}
      <div className="text-center">
        <Button
          onClick={() => clearUser()}
          variant="outline"
          className="border-[#2c5282] text-[#2c5282] hover:bg-[#2c5282] hover:text-white"
        >
          🔄 Switch Player
        </Button>
      </div>
    </div>
  )
}
