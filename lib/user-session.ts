export interface User {
  id: string
  username: string
  display_name: string
  email?: string
  created_at: string
  updated_at: string
  last_active: string
  is_active: boolean
  session_count: number
  total_points: number
  quiz_completed: boolean
  messages_sent: number
  photos_uploaded: number
}

export class UserSession {
  private static USER_KEY = "party-user-data"
  private static SESSION_KEY = "party-session-id"

  static getUser(): User | null {
    if (typeof window === "undefined") return null
    const stored = localStorage.getItem(this.USER_KEY)
    return stored ? JSON.parse(stored) : null
  }

  static setUser(user: User): void {
    if (typeof window === "undefined") return
    localStorage.setItem(this.USER_KEY, JSON.stringify(user))
  }

  static getUserName(): string | null {
    const user = this.getUser()
    return user ? user.display_name : null
  }

  static getUserId(): string | null {
    const user = this.getUser()
    return user ? user.id : null
  }

  static clearUser(): void {
    if (typeof window === "undefined") return
    localStorage.removeItem(this.USER_KEY)
    localStorage.removeItem(this.SESSION_KEY)
  }

  static hasUser(): boolean {
    return !!this.getUser()
  }

  static async loginUser(username: string): Promise<{ user: User; isNewUser: boolean }> {
    try {
      const response = await fetch("/api/users/login", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ username }),
      })

      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.error || "Failed to login")
      }

      const result = await response.json()
      this.setUser(result.user)

      return result
    } catch (error) {
      console.error("Login error:", error)
      throw error
    }
  }

  static async updateUserActivity(activity: string): Promise<void> {
    const user = this.getUser()
    if (!user) return

    try {
      // Update local user data
      const updatedUser = { ...user, last_active: new Date().toISOString() }

      // Update specific activity counters
      if (activity === "message-sent") {
        updatedUser.messages_sent += 1
      } else if (activity === "photo-uploaded") {
        updatedUser.photos_uploaded += 1
      } else if (activity === "quiz-completed") {
        updatedUser.quiz_completed = true
      }

      this.setUser(updatedUser)

      // Optionally sync with server (fire and forget)
      fetch(`/api/users/${user.id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          last_active: updatedUser.last_active,
          messages_sent: updatedUser.messages_sent,
          photos_uploaded: updatedUser.photos_uploaded,
          quiz_completed: updatedUser.quiz_completed,
        }),
      }).catch(console.error)
    } catch (error) {
      console.error("Error updating user activity:", error)
    }
  }

  // Helper to get the current session ID
  private static getOrCreateSessionId(): string {
    if (typeof window === "undefined") return "server"

    let sessionId = localStorage.getItem(this.SESSION_KEY)
    if (!sessionId) {
      sessionId = `${Date.now()}-${Math.random().toString(36).substring(2, 9)}`
      localStorage.setItem(this.SESSION_KEY, sessionId)
    }
    return sessionId
  }
}
