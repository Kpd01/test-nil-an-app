"use client"

import { useState, useEffect, useCallback } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Trophy, Users, RefreshCw } from "lucide-react"
import { VotingSystem, type Performance } from "@/lib/voting-system"
import { useUserSession } from "@/hooks/use-user-session"
import { UserNamePrompt } from "@/components/user-name-prompt"
import { UserHeader } from "@/components/user-header"

export function PerformanceVoting() {
  const [performances, setPerformances] = useState<Performance[]>([])
  const { userName, setUser, clearUser, hasUser, isLoading } = useUserSession()
  const [selectedPerformance, setSelectedPerformance] = useState<string | null>(null)
  const [isRefreshing, setIsRefreshing] = useState(false)
  const [lastUpdate, setLastUpdate] = useState(Date.now())
  const [dataLoaded, setDataLoaded] = useState(false)

  const loadPerformances = useCallback(async () => {
    try {
      const leaderboard = await VotingSystem.getLeaderboard()
      console.log("Loaded performances:", leaderboard)
      setPerformances(leaderboard)
      setDataLoaded(true)
    } catch (error) {
      console.error("Error loading performances:", error)
      setPerformances([])
      setDataLoaded(true)
    }
  }, [])

  const checkIfVoted = useCallback(async () => {
    if (!userName) {
      setSelectedPerformance(null)
      return
    }
    try {
      const votes = await VotingSystem.getVotes()
      const userVote = votes.find((v) => v.voterName === userName)
      setSelectedPerformance(userVote ? userVote.performanceId : null)
    } catch (error) {
      console.error("Error checking votes:", error)
      setSelectedPerformance(null)
    }
  }, [userName])

  // Force refresh function with less aggressive cache clearing
  const forceRefresh = useCallback(async () => {
    setIsRefreshing(true)
    try {
      // Only clear cache if we're actually refreshing
      VotingSystem.clearCache()

      // Wait a bit for cache to clear
      await new Promise((resolve) => setTimeout(resolve, 200))

      // Reload data
      await loadPerformances()
      await checkIfVoted()

      setLastUpdate(Date.now())
    } catch (error) {
      console.error("Error refreshing data:", error)
    } finally {
      setIsRefreshing(false)
    }
  }, [loadPerformances, checkIfVoted])

  // Initial data load
  useEffect(() => {
    const initializeData = async () => {
      console.log("Initializing performance voting data...")
      await loadPerformances()
      await checkIfVoted()
    }

    initializeData()
  }, [loadPerformances, checkIfVoted])

  // Listen for storage changes (less aggressive)
  useEffect(() => {
    const handleStorageChange = (e: StorageEvent) => {
      if (e.key?.includes("party-performances") || e.key?.includes("party-votes")) {
        console.log("Storage changed, refreshing data...")
        // Debounce storage changes
        setTimeout(() => {
          loadPerformances()
          checkIfVoted()
        }, 500)
      }
    }

    window.addEventListener("storage", handleStorageChange)

    // Less aggressive polling - every 10 seconds instead of 1 second
    const interval = setInterval(async () => {
      if (!isRefreshing) {
        await loadPerformances()
        await checkIfVoted()
      }
    }, 10000) // Every 10 seconds

    return () => {
      window.removeEventListener("storage", handleStorageChange)
      clearInterval(interval)
    }
  }, [loadPerformances, checkIfVoted, isRefreshing])

  const handleVote = async (performanceId: string) => {
    if (!userName) return

    try {
      setIsRefreshing(true)

      await VotingSystem.vote(performanceId, userName)
      setSelectedPerformance(performanceId)

      // Immediate local update without full refresh
      setPerformances((prev) =>
        prev.map((p) =>
          p.id === performanceId
            ? { ...p, votes: p.votes + (selectedPerformance ? 0 : 1) }
            : selectedPerformance === p.id
              ? { ...p, votes: Math.max(0, p.votes - 1) }
              : p,
        ),
      )

      // Then do a proper refresh after a delay
      setTimeout(() => {
        loadPerformances()
        checkIfVoted()
      }, 1000)
    } catch (error) {
      console.error("Error voting:", error)
    } finally {
      setIsRefreshing(false)
    }
  }

  const getCategoryColor = (category: string) => {
    switch (category) {
      case "funny":
        return "bg-[#ffb347] text-white"
      case "silly":
        return "bg-[#e57373] text-white"
      case "embarrassing":
        return "bg-[#8fbc8f] text-white"
      default:
        return "bg-gray-500 text-white"
    }
  }

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case "funny":
        return "😂"
      case "silly":
        return "🤪"
      case "embarrassing":
        return "😳"
      default:
        return "🎭"
    }
  }

  if (isLoading) {
    return <div className="text-center py-8">Loading...</div>
  }

  if (!hasUser) {
    return (
      <UserNamePrompt
        onNameSet={setUser}
        title="Vote for Best Performer! 🏆"
        description="Enter your name to vote for your favorite performance!"
        icon="🎭"
      />
    )
  }

  if (!dataLoaded) {
    return (
      <div className="text-center py-8">
        <div className="text-6xl mb-4">🎭</div>
        <h3 className="text-xl font-bold text-[#2c5282] mb-2">Loading Performances...</h3>
        <p className="text-gray-600">Please wait while we fetch the latest data.</p>
      </div>
    )
  }

  if (performances.length === 0) {
    return (
      <div className="space-y-6">
        {/* User Header */}
        <UserHeader userName={userName!} onLogout={clearUser} />

        <Card className="border-2 border-[#6baed6]">
          <CardContent className="p-8 text-center">
            <div className="text-6xl mb-4">🎭</div>
            <h3 className="text-xl font-bold text-[#2c5282] mb-2">No Performances Yet!</h3>
            <p className="text-gray-600 mb-4">
              Performances will appear here after guests complete spin wheel challenges.
            </p>
            <div className="space-y-2">
              <p className="text-sm text-gray-500">
                💡 Tip: Go to the Spin & Dare section to create some performances!
              </p>
              <Button
                onClick={forceRefresh}
                disabled={isRefreshing}
                className="bg-[#6baed6] hover:bg-[#5a9bd4] text-white"
              >
                <RefreshCw className={`h-4 w-4 mr-2 ${isRefreshing ? "animate-spin" : ""}`} />
                {isRefreshing ? "Refreshing..." : "Check for Performances"}
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* User Header */}
      <UserHeader userName={userName!} onLogout={clearUser} />

      {/* Leaderboard */}
      <Card className="border-2 border-[#6baed6]">
        <CardHeader className="bg-[#e6f7f9]">
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="text-[#2c5282] flex items-center gap-2">
                <Trophy className="h-5 w-5" />
                Performance Leaderboard
              </CardTitle>
              <CardDescription>Vote for the best spin and dare performer!</CardDescription>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-xs text-gray-500">Last updated: {new Date(lastUpdate).toLocaleTimeString()}</span>
              <Button
                onClick={forceRefresh}
                disabled={isRefreshing}
                size="sm"
                variant="outline"
                className="border-[#6baed6] text-[#6baed6] hover:bg-[#6baed6] hover:text-white"
              >
                <RefreshCw className={`h-4 w-4 ${isRefreshing ? "animate-spin" : ""}`} />
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent className="p-6">
          <div className="space-y-4">
            {performances.map((performance, index) => (
              <Card
                key={performance.id} // Removed timestamp from key to prevent unnecessary re-renders
                className={`p-4 transition-all duration-200 ${
                  selectedPerformance === performance.id
                    ? "border-2 border-[#ffb347] bg-[#f9e076]/20"
                    : "border border-gray-200 hover:border-[#6baed6]"
                }`}
              >
                <div className="flex items-center justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      {/* Ranking */}
                      <div
                        className={`w-8 h-8 rounded-full flex items-center justify-center text-white font-bold ${
                          index === 0
                            ? "bg-yellow-500"
                            : index === 1
                              ? "bg-gray-400"
                              : index === 2
                                ? "bg-amber-600"
                                : "bg-gray-300"
                        }`}
                      >
                        {index === 0 ? "👑" : index + 1}
                      </div>

                      {/* Performer Name */}
                      <h3 className="text-lg font-semibold text-[#2c5282]">{performance.performer}</h3>

                      {/* Category Badge */}
                      <Badge className={getCategoryColor(performance.category)}>
                        {getCategoryIcon(performance.category)} {performance.category}
                      </Badge>
                    </div>

                    {/* Task */}
                    <p className="text-gray-600 mb-3 italic">"{performance.task}"</p>

                    {/* Vote Count */}
                    <div className="flex items-center gap-2 text-sm text-gray-500">
                      <Users className="h-4 w-4" />
                      {performance.votes} vote{performance.votes !== 1 ? "s" : ""}
                    </div>
                  </div>

                  {/* Vote Button */}
                  <div className="ml-4">
                    {selectedPerformance === performance.id ? (
                      <Badge className="bg-green-500 text-white">✓ Your Vote</Badge>
                    ) : (
                      <Button
                        onClick={() => handleVote(performance.id)}
                        className="bg-[#ffb347] hover:bg-[#ffa726] text-white"
                        disabled={!userName || isRefreshing}
                      >
                        {isRefreshing ? "Voting..." : "Vote"}
                      </Button>
                    )}
                  </div>
                </div>
              </Card>
            ))}
          </div>

          {selectedPerformance && (
            <div className="mt-6 p-4 bg-green-50 border border-green-200 rounded-lg text-center">
              <p className="text-green-700 font-medium">
                ✓ Thanks for voting, {userName}! You can change your vote anytime.
              </p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
