import { supabase, isSupabaseAvailable } from "./supabase"

export interface Performance {
  id: string
  performer: string
  task: string
  category: "funny" | "silly" | "embarrassing"
  timestamp: number
  votes: number
}

export interface Vote {
  performanceId: string
  voterName: string
  timestamp: number
}

export class VotingSystem {
  private static PERFORMANCES_KEY = "party-performances"
  private static VOTES_KEY = "party-votes"

  // Force cache invalidation by adding timestamp
  private static getCacheKey(key: string): string {
    return `${key}_${Date.now()}`
  }

  // Clear all cached data
  static clearCache() {
    if (typeof window === "undefined") return

    // Remove all voting-related keys
    const keysToRemove = []
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i)
      if (key && (key.includes("party-performances") || key.includes("party-votes"))) {
        keysToRemove.push(key)
      }
    }

    keysToRemove.forEach((key) => localStorage.removeItem(key))

    // Trigger storage event to update other tabs
    window.dispatchEvent(
      new StorageEvent("storage", {
        key: this.PERFORMANCES_KEY,
        newValue: null,
        oldValue: null,
      }),
    )
  }

  // Get performances from Supabase or localStorage with cache busting
  static async getPerformances(): Promise<Performance[]> {
    // Try Supabase first with cache busting
    if (isSupabaseAvailable()) {
      try {
        const { data, error } = await supabase!
          .from("performances")
          .select("*")
          .order("timestamp", { ascending: false })

        if (!error && data) {
          const performances = data.map((p) => ({
            id: p.id,
            performer: p.performer,
            task: p.task,
            category: p.category as "funny" | "silly" | "embarrassing",
            timestamp: new Date(p.timestamp).getTime(),
            votes: p.total_votes || 0,
          }))

          // Update localStorage with fresh data
          if (typeof window !== "undefined") {
            localStorage.setItem(this.PERFORMANCES_KEY, JSON.stringify(performances))
          }

          return performances
        }
      } catch (error) {
        console.error("Error fetching performances from Supabase:", error)
      }
    }

    // Fallback to localStorage
    if (typeof window === "undefined") return []
    const stored = localStorage.getItem(this.PERFORMANCES_KEY)
    return stored ? JSON.parse(stored) : []
  }

  // Get votes from Supabase or localStorage with cache busting
  static async getVotes(): Promise<Vote[]> {
    // Try Supabase first with cache busting
    if (isSupabaseAvailable()) {
      try {
        const { data, error } = await supabase!.from("votes").select("*")

        if (!error && data) {
          const votes = data.map((v) => ({
            performanceId: v.performance_id,
            voterName: v.voter_name,
            timestamp: new Date(v.timestamp).getTime(),
          }))

          // Update localStorage with fresh data
          if (typeof window !== "undefined") {
            localStorage.setItem(this.VOTES_KEY, JSON.stringify(votes))
          }

          return votes
        }
      } catch (error) {
        console.error("Error fetching votes from Supabase:", error)
      }
    }

    // Fallback to localStorage
    if (typeof window === "undefined") return []
    const stored = localStorage.getItem(this.VOTES_KEY)
    return stored ? JSON.parse(stored) : []
  }

  // Add a new performance with immediate cache invalidation
  static async addPerformance(
    performer: string,
    task: string,
    category: "funny" | "silly" | "embarrassing",
  ): Promise<Performance> {
    const timestamp = Date.now()
    const performance: Performance = {
      id: `${timestamp}-${Math.random()}`,
      performer,
      task,
      category,
      timestamp,
      votes: 0,
    }

    // Try to save to Supabase
    if (isSupabaseAvailable()) {
      try {
        const { data, error } = await supabase!
          .from("performances")
          .insert({
            id: performance.id,
            performer,
            task,
            category,
            timestamp: new Date(timestamp).toISOString(),
            total_votes: 0,
          })
          .select()
          .single()

        if (!error && data) {
          const newPerformance = {
            id: data.id,
            performer: data.performer,
            task: data.task,
            category: data.category as "funny" | "silly" | "embarrassing",
            timestamp: new Date(data.timestamp).getTime(),
            votes: data.total_votes || 0,
          }

          // Clear cache and update localStorage
          this.clearCache()

          return newPerformance
        }
      } catch (error) {
        console.error("Error saving performance to Supabase:", error)
      }
    }

    // Fallback to localStorage with cache invalidation
    const performances = await this.getPerformances()
    performances.push(performance)
    localStorage.setItem(this.PERFORMANCES_KEY, JSON.stringify(performances))

    // Trigger storage event for real-time updates
    window.dispatchEvent(
      new StorageEvent("storage", {
        key: this.PERFORMANCES_KEY,
        newValue: JSON.stringify(performances),
        oldValue: null,
      }),
    )

    return performance
  }

  // Vote for a performance with immediate cache invalidation
  static async vote(performanceId: string, voterName: string): Promise<boolean> {
    // Try to save to Supabase
    if (isSupabaseAvailable()) {
      try {
        // Check if voter already voted
        const { data: existingVotes } = await supabase!.from("votes").select("*").eq("voter_name", voterName)

        // If voter already voted, remove old vote
        if (existingVotes && existingVotes.length > 0) {
          const oldVote = existingVotes[0]

          // Decrement vote count for old performance
          if (oldVote.performance_id !== performanceId) {
            await supabase!.rpc("decrement_votes", { performance_id: oldVote.performance_id })
          } else {
            // Voting for same performance, no change needed
            return true
          }

          // Delete old vote
          await supabase!.from("votes").delete().eq("id", oldVote.id)
        }

        // Add new vote
        await supabase!.from("votes").insert({
          performance_id: performanceId,
          voter_name: voterName,
          vote_type: "up",
        })

        // Increment vote count for new performance
        await supabase!.rpc("increment_votes", { performance_id: performanceId })

        // Clear all caches to force refresh
        this.clearCache()

        return true
      } catch (error) {
        console.error("Error saving vote to Supabase:", error)
      }
    }

    // Fallback to localStorage with immediate cache invalidation
    const votes = await this.getVotes()

    // Check if voter already voted
    const existingVoteIndex = votes.findIndex((v) => v.voterName === voterName)
    if (existingVoteIndex !== -1) {
      // Remove old vote
      votes.splice(existingVoteIndex, 1)
    }

    // Add new vote
    votes.push({
      performanceId,
      voterName,
      timestamp: Date.now(),
    })

    localStorage.setItem(this.VOTES_KEY, JSON.stringify(votes))

    // Trigger storage event for real-time updates
    window.dispatchEvent(
      new StorageEvent("storage", {
        key: this.VOTES_KEY,
        newValue: JSON.stringify(votes),
        oldValue: null,
      }),
    )

    return true
  }

  // Get leaderboard with forced refresh
  static async getLeaderboard(): Promise<Performance[]> {
    // Always fetch fresh data
    const performances = await this.getPerformances()
    const votes = await this.getVotes()

    // Calculate vote counts
    performances.forEach((performance) => {
      performance.votes = votes.filter((v) => v.performanceId === performance.id).length
    })

    return performances.sort((a, b) => b.votes - a.votes)
  }

  // Clear all data (for testing) with aggressive cache clearing
  static async clearAll() {
    if (isSupabaseAvailable()) {
      try {
        await supabase!.from("votes").delete().neq("id", "0")
        await supabase!.from("performances").delete().neq("id", "0")
      } catch (error) {
        console.error("Error clearing data from Supabase:", error)
      }
    }

    // Clear all localStorage data
    this.clearCache()
    localStorage.removeItem(this.PERFORMANCES_KEY)
    localStorage.removeItem(this.VOTES_KEY)

    // Trigger storage events for all tabs
    window.dispatchEvent(
      new StorageEvent("storage", {
        key: this.PERFORMANCES_KEY,
        newValue: null,
        oldValue: null,
      }),
    )
    window.dispatchEvent(
      new StorageEvent("storage", {
        key: this.VOTES_KEY,
        newValue: null,
        oldValue: null,
      }),
    )
  }

  // Get performances from localStorage (synchronous fallback) with cache busting
  static getPerformances(): Performance[] {
    if (typeof window === "undefined") return []
    const stored = localStorage.getItem(this.PERFORMANCES_KEY)
    return stored ? JSON.parse(stored) : []
  }

  // Get votes from localStorage (synchronous fallback) with cache busting
  static getVotes(): Vote[] {
    if (typeof window === "undefined") return []
    const stored = localStorage.getItem(this.VOTES_KEY)
    return stored ? JSON.parse(stored) : []
  }
}
