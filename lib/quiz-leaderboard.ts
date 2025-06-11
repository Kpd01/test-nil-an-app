export interface QuizResult {
  playerName: string
  score: number
  correctAnswers: number
  totalQuestions: number
  completionTime: number // in seconds
  timestamp: Date
  isPerfectScore: boolean
}

export interface QuizLeaderboardEntry {
  playerName: string
  bestScore: number
  totalAttempts: number
  bestCorrectAnswers: number
  bestCompletionTime: number
  averageScore: number
  perfectScores: number
  lastPlayed: Date
  rank: number
}

export class QuizLeaderboardManager {
  private static STORAGE_KEY = "nilan-quiz-leaderboard"

  static getQuizResults(): QuizResult[] {
    if (typeof window === "undefined") return []

    const stored = localStorage.getItem(this.STORAGE_KEY)
    if (!stored) return []

    try {
      const results = JSON.parse(stored)
      return results.map((result: any) => ({
        ...result,
        timestamp: new Date(result.timestamp),
      }))
    } catch {
      return []
    }
  }

  static saveQuizResult(result: QuizResult): void {
    if (typeof window === "undefined") return

    const results = this.getQuizResults()
    results.push(result)

    // Keep only last 100 results to prevent storage bloat
    if (results.length > 100) {
      results.splice(0, results.length - 100)
    }

    localStorage.setItem(this.STORAGE_KEY, JSON.stringify(results))
  }

  static getLeaderboard(): QuizLeaderboardEntry[] {
    const results = this.getQuizResults()
    const playerStats = new Map<
      string,
      {
        scores: number[]
        correctAnswers: number[]
        completionTimes: number[]
        perfectScores: number
        lastPlayed: Date
      }
    >()

    // Group results by player
    results.forEach((result) => {
      if (!playerStats.has(result.playerName)) {
        playerStats.set(result.playerName, {
          scores: [],
          correctAnswers: [],
          completionTimes: [],
          perfectScores: 0,
          lastPlayed: result.timestamp,
        })
      }

      const stats = playerStats.get(result.playerName)!
      stats.scores.push(result.score)
      stats.correctAnswers.push(result.correctAnswers)
      stats.completionTimes.push(result.completionTime)
      if (result.isPerfectScore) stats.perfectScores++
      if (result.timestamp > stats.lastPlayed) {
        stats.lastPlayed = result.timestamp
      }
    })

    // Calculate leaderboard entries
    const leaderboard: QuizLeaderboardEntry[] = []

    playerStats.forEach((stats, playerName) => {
      const bestScore = Math.max(...stats.scores)
      const bestCorrectAnswers = Math.max(...stats.correctAnswers)
      const bestCompletionTime = Math.min(...stats.completionTimes)
      const averageScore = stats.scores.reduce((a, b) => a + b, 0) / stats.scores.length

      leaderboard.push({
        playerName,
        bestScore,
        totalAttempts: stats.scores.length,
        bestCorrectAnswers,
        bestCompletionTime,
        averageScore: Math.round(averageScore),
        perfectScores: stats.perfectScores,
        lastPlayed: stats.lastPlayed,
        rank: 0, // Will be set after sorting
      })
    })

    // Sort by best score (descending), then by best completion time (ascending)
    leaderboard.sort((a, b) => {
      if (a.bestScore !== b.bestScore) {
        return b.bestScore - a.bestScore
      }
      return a.bestCompletionTime - b.bestCompletionTime
    })

    // Assign ranks
    leaderboard.forEach((entry, index) => {
      entry.rank = index + 1
    })

    return leaderboard
  }

  static getPlayerStats(playerName: string): QuizLeaderboardEntry | null {
    const leaderboard = this.getLeaderboard()
    return leaderboard.find((entry) => entry.playerName === playerName) || null
  }

  static hasUserCompletedQuiz(playerName: string): boolean {
    if (typeof window === "undefined") return false

    const results = this.getQuizResults()
    return results.some((result) => result.playerName === playerName)
  }

  static getUserQuizResult(playerName: string): QuizResult | null {
    if (typeof window === "undefined") return null

    const results = this.getQuizResults()
    return results.find((result) => result.playerName === playerName) || null
  }

  static clearAllData(): void {
    if (typeof window === "undefined") return
    localStorage.removeItem(this.STORAGE_KEY)
  }
}
