"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Trophy, Medal, Award, Clock, Target, RefreshCw } from "lucide-react"
import { QuizLeaderboardManager, type QuizLeaderboardEntry } from "@/lib/quiz-leaderboard"
import { useUserSession } from "@/hooks/use-user-session"

export function QuizLeaderboard() {
  const [leaderboard, setLeaderboard] = useState<QuizLeaderboardEntry[]>([])
  const [lastUpdated, setLastUpdated] = useState<Date>(new Date())
  const { userName } = useUserSession()

  const loadLeaderboard = () => {
    const data = QuizLeaderboardManager.getLeaderboard()
    setLeaderboard(data)
    setLastUpdated(new Date())
  }

  useEffect(() => {
    loadLeaderboard()

    // Auto-refresh every 30 seconds
    const interval = setInterval(loadLeaderboard, 30000)
    return () => clearInterval(interval)
  }, [])

  const getRankIcon = (rank: number) => {
    switch (rank) {
      case 1:
        return <Trophy className="h-6 w-6 text-yellow-500" />
      case 2:
        return <Medal className="h-6 w-6 text-gray-400" />
      case 3:
        return <Award className="h-6 w-6 text-amber-600" />
      default:
        return <span className="text-lg font-bold text-gray-500">#{rank}</span>
    }
  }

  const getRankBadgeColor = (rank: number) => {
    switch (rank) {
      case 1:
        return "bg-gradient-to-r from-yellow-400 to-yellow-600"
      case 2:
        return "bg-gradient-to-r from-gray-300 to-gray-500"
      case 3:
        return "bg-gradient-to-r from-amber-400 to-amber-600"
      default:
        return "bg-gradient-to-r from-blue-400 to-blue-600"
    }
  }

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60)
    const secs = seconds % 60
    return `${mins}:${secs.toString().padStart(2, "0")}`
  }

  if (leaderboard.length === 0) {
    return (
      <Card className="w-full max-w-4xl mx-auto">
        <CardHeader className="text-center bg-gradient-to-r from-purple-500 to-pink-500 text-white">
          <CardTitle className="text-2xl flex items-center justify-center gap-2">
            <Trophy className="h-6 w-6" />🧠 Quiz Leaderboard 🧠
          </CardTitle>
        </CardHeader>
        <CardContent className="p-8 text-center">
          <div className="text-6xl mb-4">📊</div>
          <h3 className="text-xl font-bold text-gray-600 mb-2">No Quiz Results Yet!</h3>
          <p className="text-gray-500">Be the first to complete the birthday quiz and claim the top spot!</p>
        </CardContent>
      </Card>
    )
  }

  const currentUserEntry = userName ? leaderboard.find((entry) => entry.playerName === userName) : null

  return (
    <div className="space-y-6">
      {/* Current User Stats */}
      {currentUserEntry && (
        <Card className="border-2 border-purple-300 bg-gradient-to-r from-purple-50 to-pink-50">
          <CardHeader className="bg-gradient-to-r from-purple-500 to-pink-500 text-white">
            <CardTitle className="text-center flex items-center justify-center gap-2">
              <Target className="h-5 w-5" />
              Your Quiz Performance
            </CardTitle>
          </CardHeader>
          <CardContent className="p-6">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-center">
              <div className="bg-white p-3 rounded-lg border">
                <div className="text-2xl font-bold text-purple-600">#{currentUserEntry.rank}</div>
                <div className="text-sm text-gray-600">Current Rank</div>
              </div>
              <div className="bg-white p-3 rounded-lg border">
                <div className="text-2xl font-bold text-green-600">{currentUserEntry.bestScore}</div>
                <div className="text-sm text-gray-600">Best Score</div>
              </div>
              <div className="bg-white p-3 rounded-lg border">
                <div className="text-2xl font-bold text-blue-600">{currentUserEntry.totalAttempts}</div>
                <div className="text-sm text-gray-600">Attempts</div>
              </div>
              <div className="bg-white p-3 rounded-lg border">
                <div className="text-2xl font-bold text-orange-600">{currentUserEntry.perfectScores}</div>
                <div className="text-sm text-gray-600">Perfect Scores</div>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Main Leaderboard */}
      <Card className="w-full max-w-4xl mx-auto">
        <CardHeader className="bg-gradient-to-r from-purple-500 to-pink-500 text-white">
          <div className="flex justify-between items-center">
            <CardTitle className="text-2xl flex items-center gap-2">
              <Trophy className="h-6 w-6" />🧠 Quiz Champions 🧠
            </CardTitle>
            <div className="flex items-center gap-2">
              <Button
                onClick={loadLeaderboard}
                variant="outline"
                size="sm"
                className="bg-white/20 border-white/30 text-white hover:bg-white/30"
              >
                <RefreshCw className="h-4 w-4 mr-1" />
                Refresh
              </Button>
            </div>
          </div>
          <p className="text-purple-100 text-sm">Last updated: {lastUpdated.toLocaleTimeString()}</p>
        </CardHeader>
        <CardContent className="p-0">
          <div className="space-y-2 p-4">
            {leaderboard.slice(0, 10).map((entry, index) => (
              <div
                key={entry.playerName}
                className={`flex items-center gap-4 p-4 rounded-lg border-2 transition-all duration-200 ${
                  entry.playerName === userName
                    ? "border-purple-400 bg-purple-50 shadow-md"
                    : "border-gray-200 bg-white hover:border-purple-200 hover:bg-purple-25"
                }`}
              >
                {/* Rank */}
                <div className="flex-shrink-0 w-12 flex justify-center">{getRankIcon(entry.rank)}</div>

                {/* Player Info */}
                <div className="flex-grow">
                  <div className="flex items-center gap-2 mb-1">
                    <h3 className="font-bold text-lg text-gray-800">{entry.playerName}</h3>
                    {entry.playerName === userName && <Badge className="bg-purple-500 text-white text-xs">You</Badge>}
                    {entry.perfectScores > 0 && (
                      <Badge className="bg-gradient-to-r from-yellow-400 to-yellow-600 text-white text-xs">
                        🎯 {entry.perfectScores} Perfect
                      </Badge>
                    )}
                  </div>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-2 text-sm text-gray-600">
                    <div>
                      <span className="font-medium">Best Score:</span> {entry.bestScore}
                    </div>
                    <div>
                      <span className="font-medium">Correct:</span> {entry.bestCorrectAnswers}/5
                    </div>
                    <div className="flex items-center gap-1">
                      <Clock className="h-3 w-3" />
                      <span className="font-medium">Best Time:</span> {formatTime(entry.bestCompletionTime)}
                    </div>
                    <div>
                      <span className="font-medium">Attempts:</span> {entry.totalAttempts}
                    </div>
                  </div>
                </div>

                {/* Score Badge */}
                <div className="flex-shrink-0">
                  <div
                    className={`${getRankBadgeColor(entry.rank)} text-white px-3 py-2 rounded-lg text-center min-w-[80px]`}
                  >
                    <div className="text-lg font-bold">{entry.bestScore}</div>
                    <div className="text-xs opacity-90">points</div>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {leaderboard.length > 10 && (
            <div className="p-4 text-center border-t bg-gray-50">
              <p className="text-gray-600">Showing top 10 players • Total players: {leaderboard.length}</p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Stats Summary */}
      <Card className="w-full max-w-4xl mx-auto">
        <CardHeader className="bg-gradient-to-r from-blue-500 to-indigo-500 text-white">
          <CardTitle className="text-center">📊 Quiz Statistics</CardTitle>
        </CardHeader>
        <CardContent className="p-6">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-center">
            <div className="bg-blue-50 p-4 rounded-lg">
              <div className="text-2xl font-bold text-blue-600">{leaderboard.length}</div>
              <div className="text-sm text-gray-600">Total Players</div>
            </div>
            <div className="bg-green-50 p-4 rounded-lg">
              <div className="text-2xl font-bold text-green-600">
                {leaderboard.reduce((sum, entry) => sum + entry.totalAttempts, 0)}
              </div>
              <div className="text-sm text-gray-600">Total Attempts</div>
            </div>
            <div className="bg-yellow-50 p-4 rounded-lg">
              <div className="text-2xl font-bold text-yellow-600">
                {leaderboard.reduce((sum, entry) => sum + entry.perfectScores, 0)}
              </div>
              <div className="text-sm text-gray-600">Perfect Scores</div>
            </div>
            <div className="bg-purple-50 p-4 rounded-lg">
              <div className="text-2xl font-bold text-purple-600">
                {leaderboard.length > 0
                  ? Math.round(leaderboard.reduce((sum, entry) => sum + entry.averageScore, 0) / leaderboard.length)
                  : 0}
              </div>
              <div className="text-sm text-gray-600">Avg Score</div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
