import { QuizLeaderboardManager } from "./quiz-leaderboard"
import { VotingSystem } from "./voting-system"

export interface QuizResult {
  playerName: string
  score: number
  correctAnswers: number
  totalQuestions: number
  completionTime: number
  timestamp: Date
  isPerfectScore: boolean
}

export interface PerformanceResult {
  performer: string
  votes: number
  timestamp: number
}

export interface UnifiedPlayerStats {
  playerName: string
  totalPoints: number
  quizScore: number
  performanceVotes: number
  quizAccuracy: number
  quizTime: number
  badges: string[]
  rank: number
  isQuizMaster: boolean
  isTopPerformer: boolean
  isPartyChampion: boolean
}

export interface UnifiedLeaderboardEntry {
  playerName: string
  // Quiz stats
  quizBestScore: number
  quizAttempts: number
  quizPerfectScores: number
  quizAverageScore: number
  quizRank: number
  // Performance stats
  performanceVotes: number
  performanceRank: number
  totalPerformances: number
  // Combined stats
  totalPoints: number
  overallRank: number
  badges: string[]
  lastActivity: Date
}

export class UnifiedLeaderboardManager {
  private static readonly QUIZ_STORAGE_KEY = "party-quiz-leaderboard"
  private static readonly PERFORMANCE_STORAGE_KEY = "party-performance-votes"

  static getQuizResults(): QuizResult[] {
    if (typeof window === "undefined") return []
    try {
      const stored = localStorage.getItem(this.QUIZ_STORAGE_KEY)
      return stored ? JSON.parse(stored) : []
    } catch {
      return []
    }
  }

  static getPerformanceResults(): PerformanceResult[] {
    if (typeof window === "undefined") return []
    try {
      const stored = localStorage.getItem(this.PERFORMANCE_STORAGE_KEY)
      return stored ? JSON.parse(stored) : []
    } catch {
      return []
    }
  }

  static calculatePlayerStats(): UnifiedPlayerStats[] {
    const quizResults = this.getQuizResults()
    const performanceResults = this.getPerformanceResults()

    // Group by player name
    const playerMap = new Map<string, UnifiedPlayerStats>()

    // Process quiz results
    quizResults.forEach((result) => {
      const existing = playerMap.get(result.playerName) || {
        playerName: result.playerName,
        totalPoints: 0,
        quizScore: 0,
        performanceVotes: 0,
        quizAccuracy: 0,
        quizTime: 0,
        badges: [],
        rank: 0,
        isQuizMaster: false,
        isTopPerformer: false,
        isPartyChampion: false,
      }

      // Use best quiz score
      if (result.score > existing.quizScore) {
        existing.quizScore = result.score
        existing.quizAccuracy = (result.correctAnswers / result.totalQuestions) * 100
        existing.quizTime = result.completionTime
      }

      playerMap.set(result.playerName, existing)
    })

    // Process performance results
    performanceResults.forEach((result) => {
      const existing = playerMap.get(result.performer) || {
        playerName: result.performer,
        totalPoints: 0,
        quizScore: 0,
        performanceVotes: 0,
        quizAccuracy: 0,
        quizTime: 0,
        badges: [],
        rank: 0,
        isQuizMaster: false,
        isTopPerformer: false,
        isPartyChampion: false,
      }

      existing.performanceVotes += result.votes
      playerMap.set(result.performer, existing)
    })

    // Calculate total points and badges
    const players = Array.from(playerMap.values()).map((player) => {
      // Calculate total points
      let totalPoints = player.quizScore + player.performanceVotes * 10

      // Add bonus points for achievements
      const badges: string[] = []

      if (player.quizAccuracy === 100) {
        badges.push("🎯 Perfect Score")
        totalPoints += 50
      }
      if (player.quizScore >= 800) {
        badges.push("🧠 Quiz Master")
        totalPoints += 100
      }
      if (player.performanceVotes >= 5) {
        badges.push("🎭 Top Performer")
        totalPoints += 100
      }
      if (player.quizScore > 0 && player.performanceVotes > 0) {
        badges.push("🌟 All-Rounder")
        totalPoints += 50
      }

      return {
        ...player,
        totalPoints,
        badges,
      }
    })

    // Sort by total points (descending) then by quiz time (ascending)
    players.sort((a, b) => {
      if (b.totalPoints !== a.totalPoints) {
        return b.totalPoints - a.totalPoints
      }
      return a.quizTime - b.quizTime
    })

    // Assign ranks and special titles
    return players.map((player, index) => ({
      ...player,
      rank: index + 1,
      isPartyChampion: index === 0,
      isQuizMaster: index === 0 || player.quizScore === Math.max(...players.map((p) => p.quizScore)),
      isTopPerformer: player.performanceVotes === Math.max(...players.map((p) => p.performanceVotes)),
    }))
  }

  static getTopPlayers(limit = 10): UnifiedPlayerStats[] {
    return this.calculatePlayerStats().slice(0, limit)
  }

  static async getPlayerStats(playerName: string): Promise<UnifiedPlayerStats | null> {
    const leaderboard = await this.getUnifiedLeaderboard()
    return leaderboard.find((entry) => entry.playerName === playerName) || null
  }

  static getGlobalStats() {
    const quizResults = QuizLeaderboardManager.getQuizResults()
    const performanceResults = this.getPerformanceResults()

    return {
      totalPlayers: new Set([...quizResults.map((r) => r.playerName), ...performanceResults.map((p) => p.performer)])
        .size,
      totalQuizAttempts: quizResults.length,
      totalVotes: performanceResults.reduce((sum, result) => sum + result.votes, 0),
      perfectScores: quizResults.filter((result) => result.isPerfectScore).length,
      averageQuizScore:
        quizResults.length > 0
          ? Math.round(quizResults.reduce((sum, result) => sum + result.score, 0) / quizResults.length)
          : 0,
      topScore: 0, // Will be calculated from leaderboard
    }
  }

  static clearAllData() {
    QuizLeaderboardManager.clearAllData()
    VotingSystem.clearAll()
  }

  static async getUnifiedLeaderboard(): Promise<UnifiedLeaderboardEntry[]> {
    console.log("Getting unified leaderboard...")

    // Get quiz leaderboard
    const quizLeaderboard = QuizLeaderboardManager.getLeaderboard()
    console.log("Quiz leaderboard:", quizLeaderboard)

    // Get performance data
    const performances = await VotingSystem.getLeaderboard()
    console.log("Performance leaderboard:", performances)

    // Create a map of all unique players
    const playerMap = new Map<string, UnifiedLeaderboardEntry>()

    // Initialize with quiz data
    quizLeaderboard.forEach((quizEntry, index) => {
      playerMap.set(quizEntry.playerName, {
        playerName: quizEntry.playerName,
        quizBestScore: quizEntry.bestScore,
        quizAttempts: quizEntry.totalAttempts,
        quizPerfectScores: quizEntry.perfectScores,
        quizAverageScore: quizEntry.averageScore,
        quizRank: index + 1,
        performanceVotes: 0,
        performanceRank: 0,
        totalPerformances: 0,
        totalPoints: 0,
        overallRank: 0,
        badges: [],
        lastActivity: quizEntry.lastPlayed,
      })
    })

    // Group performances by performer to count total performances and votes
    const performanceStats = new Map<string, { votes: number; performances: number; lastActivity: Date }>()

    performances.forEach((performance) => {
      const existing = performanceStats.get(performance.performer) || {
        votes: 0,
        performances: 0,
        lastActivity: new Date(performance.timestamp),
      }

      existing.votes += performance.votes
      existing.performances += 1

      if (performance.timestamp > existing.lastActivity.getTime()) {
        existing.lastActivity = new Date(performance.timestamp)
      }

      performanceStats.set(performance.performer, existing)
    })

    // Add performance data to player map
    performanceStats.forEach((stats, performerName) => {
      if (!playerMap.has(performerName)) {
        playerMap.set(performerName, {
          playerName: performerName,
          quizBestScore: 0,
          quizAttempts: 0,
          quizPerfectScores: 0,
          quizAverageScore: 0,
          quizRank: 0,
          performanceVotes: 0,
          performanceRank: 0,
          totalPerformances: 0,
          totalPoints: 0,
          overallRank: 0,
          badges: [],
          lastActivity: stats.lastActivity,
        })
      }

      const entry = playerMap.get(performerName)!
      entry.performanceVotes = stats.votes
      entry.totalPerformances = stats.performances

      if (stats.lastActivity > entry.lastActivity) {
        entry.lastActivity = stats.lastActivity
      }
    })

    // Calculate performance rankings
    const performanceRankings = Array.from(playerMap.values())
      .filter((entry) => entry.totalPerformances > 0)
      .sort((a, b) => b.performanceVotes - a.performanceVotes)

    performanceRankings.forEach((entry, index) => {
      entry.performanceRank = index + 1
    })

    // Calculate total points and badges
    Array.from(playerMap.values()).forEach((entry) => {
      // Points calculation
      let points = 0

      // Quiz points (direct score)
      points += entry.quizBestScore

      // Performance points (10 points per vote)
      points += entry.performanceVotes * 10

      // Bonus points for achievements
      if (entry.quizPerfectScores > 0) points += 50 // Perfect quiz bonus
      if (entry.performanceRank === 1 && entry.performanceVotes > 0) points += 100 // Top performer bonus
      if (entry.quizRank === 1 && entry.quizBestScore > 0) points += 100 // Quiz champion bonus

      entry.totalPoints = points

      // Generate badges
      const badges: string[] = []

      // Quiz badges
      if (entry.quizPerfectScores > 0) badges.push("🎯 Quiz Master")
      if (entry.quizRank === 1 && entry.quizBestScore > 0) badges.push("🧠 Quiz Champion")
      if (entry.quizAttempts >= 5) badges.push("📚 Quiz Enthusiast")

      // Performance badges
      if (entry.performanceRank === 1 && entry.performanceVotes > 0) badges.push("🏆 Top Performer")
      if (entry.performanceVotes >= 10) badges.push("⭐ Crowd Favorite")
      if (entry.totalPerformances >= 3) badges.push("🎭 Stage Star")

      // Combined badges
      if (entry.quizBestScore > 0 && entry.totalPerformances > 0) badges.push("🌟 All-Rounder")
      if (entry.totalPoints >= 500) badges.push("👑 Party Legend")

      entry.badges = badges
    })

    // Sort by total points for overall ranking
    const finalLeaderboard = Array.from(playerMap.values()).sort((a, b) => {
      if (a.totalPoints !== b.totalPoints) {
        return b.totalPoints - a.totalPoints
      }
      // Tiebreaker: quiz score, then performance votes
      if (a.quizBestScore !== b.quizBestScore) {
        return b.quizBestScore - a.quizBestScore
      }
      return b.performanceVotes - a.performanceVotes
    })

    // Assign overall ranks
    finalLeaderboard.forEach((entry, index) => {
      entry.overallRank = index + 1
    })

    console.log("Final leaderboard:", finalLeaderboard)
    return finalLeaderboard
  }

  static async getTopPerformers(): Promise<{
    quizChampion: UnifiedLeaderboardEntry | null
    topPerformer: UnifiedLeaderboardEntry | null
    overallChampion: UnifiedLeaderboardEntry | null
  }> {
    const leaderboard = await this.getUnifiedLeaderboard()

    const quizChampion =
      leaderboard.filter((entry) => entry.quizBestScore > 0).sort((a, b) => b.quizBestScore - a.quizBestScore)[0] ||
      null

    const topPerformer =
      leaderboard
        .filter((entry) => entry.performanceVotes > 0)
        .sort((a, b) => b.performanceVotes - a.performanceVotes)[0] || null

    const overallChampion = leaderboard[0] || null

    return { quizChampion, topPerformer, overallChampion }
  }
}
