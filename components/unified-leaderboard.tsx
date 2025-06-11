"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Trophy, Brain, Star, Target, Users, RefreshCw } from "lucide-react"
import { UnifiedLeaderboardManager, type UnifiedLeaderboardEntry } from "@/lib/unified-leaderboard"
import { useUserSession } from "@/hooks/use-user-session"

export function UnifiedLeaderboard() {
  const [leaderboardData, setLeaderboardData] = useState<UnifiedLeaderboardEntry[]>([])
  const [topPerformers, setTopPerformers] = useState<{
    quizChampion: UnifiedLeaderboardEntry | null
    topPerformer: UnifiedLeaderboardEntry | null
    overallChampion: UnifiedLeaderboardEntry | null
  }>({ quizChampion: null, topPerformer: null, overallChampion: null })
  const [lastUpdated, setLastUpdated] = useState<Date>(new Date())
  const [isLoading, setIsLoading] = useState(true)
  const { userName } = useUserSession()

  const loadLeaderboard = async () => {
    console.log("Loading leaderboard data...")
    setIsLoading(true)
    try {
      const [leaderboardData, topPerformersData] = await Promise.all([
        UnifiedLeaderboardManager.getUnifiedLeaderboard(),
        UnifiedLeaderboardManager.getTopPerformers(),
      ])

      console.log("Loaded leaderboard data:", leaderboardData)
      console.log("Loaded top performers:", topPerformersData)

      setLeaderboardData(leaderboardData)
      setTopPerformers(topPerformersData)
      setLastUpdated(new Date())
    } catch (error) {
      console.error("Error loading leaderboard:", error)
    } finally {
      setIsLoading(false)
    }
  }

  const refreshData = () => {
    loadLeaderboard()
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
        return "🏆"
      case 2:
        return "🥈"
      case 3:
        return "🥉"
      default:
        return `#${rank}`
    }
  }

  const getRankColor = (rank: number) => {
    switch (rank) {
      case 1:
        return "text-yellow-600 bg-yellow-50 border-yellow-200"
      case 2:
        return "text-gray-600 bg-gray-50 border-gray-200"
      case 3:
        return "text-orange-600 bg-orange-50 border-orange-200"
      default:
        return "text-blue-600 bg-blue-50 border-blue-200"
    }
  }

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60)
    const secs = seconds % 60
    return `${mins}:${secs.toString().padStart(2, "0")}`
  }

  const currentUserEntry = userName ? leaderboardData.find((entry) => entry.playerName === userName) : null

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="text-center">
          <RefreshCw className="h-8 w-8 animate-spin mx-auto mb-4 text-purple-500" />
          <p className="text-gray-600">Loading leaderboard...</p>
        </div>
      </div>
    )
  }

  // Show message if no data
  if (leaderboardData.length === 0) {
    return (
      <div className="space-y-6">
        <Card>
          <CardHeader className="text-center bg-gradient-to-r from-purple-500 to-pink-500 text-white">
            <CardTitle className="flex items-center justify-center gap-2">
              <Trophy className="h-6 w-6" />
              Party Leaderboard
            </CardTitle>
          </CardHeader>
          <CardContent className="p-8 text-center">
            <div className="text-6xl mb-4">🏆</div>
            <h3 className="text-xl font-bold text-gray-800 mb-2">No Players Yet!</h3>
            <p className="text-gray-600 mb-4">
              The leaderboard will populate as players take the quiz and participate in performances.
            </p>
            <div className="space-y-2">
              <p className="text-sm text-gray-500">
                💡 Take the quiz or participate in spin & dare to appear on the leaderboard!
              </p>
              <Button onClick={refreshData} className="bg-purple-500 hover:bg-purple-600 text-white">
                <RefreshCw className="h-4 w-4 mr-2" />
                Refresh Leaderboard
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    )
  }

  const champions = leaderboardData.slice(0, 3)
  const quizLeaders = [...leaderboardData].sort((a, b) => b.quizBestScore - a.quizBestScore).slice(0, 10)
  const performanceLeaders = [...leaderboardData].sort((a, b) => b.performanceVotes - a.performanceVotes).slice(0, 10)

  return (
    <div className="space-y-6">
      {/* Global Stats */}
      <Card>
        <CardHeader className="text-center bg-gradient-to-r from-purple-500 to-pink-500 text-white">
          <CardTitle className="flex items-center justify-center gap-2">
            <Trophy className="h-6 w-6" />
            Party Leaderboard
          </CardTitle>
          <div className="flex items-center justify-center gap-4 text-sm">
            <span>Last updated: {lastUpdated.toLocaleTimeString()}</span>
            <Button
              variant="outline"
              size="sm"
              onClick={refreshData}
              disabled={isLoading}
              className="bg-white/20 border-white/30 text-white hover:bg-white/30"
            >
              <RefreshCw className={`h-4 w-4 ${isLoading ? "animate-spin" : ""}`} />
            </Button>
          </div>
        </CardHeader>
        <CardContent className="p-6">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-center">
            <div className="bg-blue-50 p-4 rounded-lg">
              <Users className="h-8 w-8 mx-auto text-blue-600 mb-2" />
              <div className="text-2xl font-bold text-blue-600">{leaderboardData.length}</div>
              <div className="text-sm text-gray-600">Total Players</div>
            </div>
            <div className="bg-green-50 p-4 rounded-lg">
              <Brain className="h-8 w-8 mx-auto text-green-600 mb-2" />
              <div className="text-2xl font-bold text-green-600">
                {leaderboardData.reduce((sum, entry) => sum + entry.quizAttempts, 0)}
              </div>
              <div className="text-sm text-gray-600">Quiz Attempts</div>
            </div>
            <div className="bg-purple-50 p-4 rounded-lg">
              <Star className="h-8 w-8 mx-auto text-purple-600 mb-2" />
              <div className="text-2xl font-bold text-purple-600">
                {leaderboardData.reduce((sum, entry) => sum + entry.performanceVotes, 0)}
              </div>
              <div className="text-sm text-gray-600">Total Votes</div>
            </div>
            <div className="bg-yellow-50 p-4 rounded-lg">
              <Target className="h-8 w-8 mx-auto text-yellow-600 mb-2" />
              <div className="text-2xl font-bold text-yellow-600">
                {leaderboardData.reduce((sum, entry) => sum + entry.quizPerfectScores, 0)}
              </div>
              <div className="text-sm text-gray-600">Perfect Scores</div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Champions Showcase */}
      {champions.length > 0 && (
        <Card>
          <CardHeader className="text-center bg-gradient-to-r from-yellow-400 to-orange-500 text-white">
            <CardTitle>🏆 Champions Showcase 🏆</CardTitle>
          </CardHeader>
          <CardContent className="p-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {champions.map((player, index) => (
                <div
                  key={player.playerName}
                  className={`text-center p-6 rounded-lg border-2 ${getRankColor(index + 1)}`}
                >
                  <div className="text-4xl mb-2">{getRankIcon(index + 1)}</div>
                  <h3 className="font-bold text-lg mb-2">{player.playerName}</h3>
                  <div className="text-2xl font-bold mb-2">{player.totalPoints} pts</div>
                  <div className="space-y-1 text-sm">
                    <div>Quiz: {player.quizBestScore} pts</div>
                    <div>Performance: {player.performanceVotes} votes</div>
                  </div>
                  <div className="flex flex-wrap gap-1 mt-3 justify-center">
                    {player.badges.slice(0, 2).map((badge, i) => (
                      <Badge key={i} variant="outline" className="text-xs">
                        {badge}
                      </Badge>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Current User Stats */}
      {currentUserEntry && (
        <Card className="border-2 border-blue-300 bg-gradient-to-r from-blue-50 to-indigo-50">
          <CardHeader className="bg-gradient-to-r from-blue-500 to-indigo-500 text-white">
            <CardTitle className="text-center flex items-center justify-center gap-2">
              <Target className="h-5 w-5" />
              Your Performance Summary
            </CardTitle>
          </CardHeader>
          <CardContent className="p-6">
            <div className="grid grid-cols-2 md:grid-cols-5 gap-4 text-center mb-4">
              <div className="bg-white p-3 rounded-lg border">
                <div className="text-2xl font-bold text-blue-600">#{currentUserEntry.overallRank}</div>
                <div className="text-sm text-gray-600">Overall Rank</div>
              </div>
              <div className="bg-white p-3 rounded-lg border">
                <div className="text-2xl font-bold text-purple-600">{currentUserEntry.totalPoints}</div>
                <div className="text-sm text-gray-600">Total Points</div>
              </div>
              <div className="bg-white p-3 rounded-lg border">
                <div className="text-2xl font-bold text-green-600">{currentUserEntry.quizBestScore}</div>
                <div className="text-sm text-gray-600">Quiz Best</div>
              </div>
              <div className="bg-white p-3 rounded-lg border">
                <div className="text-2xl font-bold text-orange-600">{currentUserEntry.performanceVotes}</div>
                <div className="text-sm text-gray-600">Performance Votes</div>
              </div>
              <div className="bg-white p-3 rounded-lg border">
                <div className="text-2xl font-bold text-pink-600">{currentUserEntry.badges.length}</div>
                <div className="text-sm text-gray-600">Badges Earned</div>
              </div>
            </div>
            {currentUserEntry.badges.length > 0 && (
              <div className="flex flex-wrap justify-center gap-2">
                {currentUserEntry.badges.map((badge, index) => (
                  <Badge key={index} className="bg-blue-100 text-blue-800">
                    {badge}
                  </Badge>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {/* Main Leaderboard */}
      <Card className="w-full max-w-6xl mx-auto">
        <CardContent className="p-0">
          <Tabs defaultValue="overall" className="w-full">
            <TabsList className="grid w-full grid-cols-3 m-4 mb-0">
              <TabsTrigger value="overall">🏆 Overall</TabsTrigger>
              <TabsTrigger value="quiz">🧠 Quiz</TabsTrigger>
              <TabsTrigger value="performance">🎭 Performance</TabsTrigger>
            </TabsList>

            <TabsContent value="overall" className="space-y-2 p-4">
              {leaderboardData.slice(0, 15).map((entry) => (
                <div
                  key={entry.playerName}
                  className={`flex items-center gap-4 p-4 rounded-lg border-2 transition-all duration-200 ${
                    entry.playerName === userName
                      ? "border-purple-400 bg-purple-50 shadow-md"
                      : "border-gray-200 bg-white hover:border-purple-200"
                  }`}
                >
                  {/* Rank */}
                  <div className="flex-shrink-0 w-12 flex justify-center text-2xl font-bold">
                    {getRankIcon(entry.overallRank)}
                  </div>

                  {/* Player Info */}
                  <div className="flex-grow">
                    <div className="flex items-center gap-2 mb-2">
                      <h3 className="font-bold text-lg text-gray-800">{entry.playerName}</h3>
                      {entry.playerName === userName && <Badge className="bg-purple-500 text-white text-xs">You</Badge>}
                    </div>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-2 text-sm text-gray-600 mb-2">
                      <div>
                        <span className="font-medium">Quiz:</span> {entry.quizBestScore} pts
                      </div>
                      <div>
                        <span className="font-medium">Performance:</span> {entry.performanceVotes} votes
                      </div>
                      <div>
                        <span className="font-medium">Quiz Attempts:</span> {entry.quizAttempts}
                      </div>
                      <div>
                        <span className="font-medium">Performances:</span> {entry.totalPerformances}
                      </div>
                    </div>
                    <div className="flex flex-wrap gap-1">
                      {entry.badges.slice(0, 3).map((badge, index) => (
                        <Badge key={index} className="text-xs bg-gray-100 text-gray-700">
                          {badge}
                        </Badge>
                      ))}
                      {entry.badges.length > 3 && (
                        <Badge className="text-xs bg-gray-100 text-gray-700">+{entry.badges.length - 3} more</Badge>
                      )}
                    </div>
                  </div>

                  {/* Points Badge */}
                  <div className="flex-shrink-0">
                    <div className="bg-gradient-to-r from-purple-500 to-pink-500 text-white px-3 py-2 rounded-lg text-center min-w-[80px]">
                      <div className="text-lg font-bold">{entry.totalPoints}</div>
                      <div className="text-xs opacity-90">points</div>
                    </div>
                  </div>
                </div>
              ))}
            </TabsContent>

            <TabsContent value="quiz" className="space-y-2 p-4">
              {quizLeaders
                .filter((entry) => entry.quizBestScore > 0)
                .slice(0, 15)
                .map((entry, index) => (
                  <div
                    key={entry.playerName}
                    className={`flex items-center gap-4 p-4 rounded-lg border-2 transition-all duration-200 ${
                      entry.playerName === userName
                        ? "border-purple-400 bg-purple-50 shadow-md"
                        : "border-gray-200 bg-white hover:border-purple-200"
                    }`}
                  >
                    <div className="flex-shrink-0 w-12 flex justify-center text-2xl font-bold">
                      {getRankIcon(index + 1)}
                    </div>
                    <div className="flex-grow">
                      <div className="flex items-center gap-2 mb-1">
                        <h3 className="font-bold text-lg text-gray-800">{entry.playerName}</h3>
                        {entry.playerName === userName && (
                          <Badge className="bg-purple-500 text-white text-xs">You</Badge>
                        )}
                        {entry.quizPerfectScores > 0 && (
                          <Badge className="bg-yellow-100 text-yellow-800 text-xs">
                            🎯 {entry.quizPerfectScores} Perfect
                          </Badge>
                        )}
                      </div>
                      <div className="text-sm text-gray-600">
                        <span className="font-medium">Attempts:</span> {entry.quizAttempts} •
                        <span className="font-medium"> Average:</span> {entry.quizAverageScore} pts
                      </div>
                    </div>
                    <div className="flex-shrink-0">
                      <div className="bg-gradient-to-r from-purple-500 to-pink-500 text-white px-3 py-2 rounded-lg text-center min-w-[80px]">
                        <div className="text-lg font-bold">{entry.quizBestScore}</div>
                        <div className="text-xs opacity-90">best score</div>
                      </div>
                    </div>
                  </div>
                ))}
            </TabsContent>

            <TabsContent value="performance" className="space-y-2 p-4">
              {performanceLeaders
                .filter((entry) => entry.performanceVotes > 0)
                .slice(0, 15)
                .map((entry, index) => (
                  <div
                    key={entry.playerName}
                    className={`flex items-center gap-4 p-4 rounded-lg border-2 transition-all duration-200 ${
                      entry.playerName === userName
                        ? "border-green-400 bg-green-50 shadow-md"
                        : "border-gray-200 bg-white hover:border-green-200"
                    }`}
                  >
                    <div className="flex-shrink-0 w-12 flex justify-center text-2xl font-bold">
                      {getRankIcon(index + 1)}
                    </div>
                    <div className="flex-grow">
                      <div className="flex items-center gap-2 mb-1">
                        <h3 className="font-bold text-lg text-gray-800">{entry.playerName}</h3>
                        {entry.playerName === userName && (
                          <Badge className="bg-green-500 text-white text-xs">You</Badge>
                        )}
                      </div>
                      <div className="text-sm text-gray-600">
                        <span className="font-medium">Performances:</span> {entry.totalPerformances} •
                        <span className="font-medium"> Avg votes per performance:</span>{" "}
                        {entry.totalPerformances > 0 ? Math.round(entry.performanceVotes / entry.totalPerformances) : 0}
                      </div>
                    </div>
                    <div className="flex-shrink-0">
                      <div className="bg-gradient-to-r from-green-500 to-emerald-500 text-white px-3 py-2 rounded-lg text-center min-w-[80px]">
                        <div className="text-lg font-bold">{entry.performanceVotes}</div>
                        <div className="text-xs opacity-90">votes</div>
                      </div>
                    </div>
                  </div>
                ))}
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  )
}
