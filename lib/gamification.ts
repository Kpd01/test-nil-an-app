export interface Badge {
  id: string
  name: string
  description: string
  icon: string
  earned: boolean
  earnedAt?: Date
}

export interface Player {
  name: string
  points: number
  badges: Badge[]
  activities: string[]
  joinedAt: Date
}

export interface GameData {
  players: Record<string, Player>
  totalActivities: number
}

export const AVAILABLE_BADGES: Omit<Badge, "earned" | "earnedAt">[] = [
  {
    id: "first-message",
    name: "First Message",
    description: "Left the first message for Nilan",
    icon: "📝",
  },
  {
    id: "photo-uploader",
    name: "Photo Uploader",
    description: "Shared a photo in the gallery",
    icon: "📸",
  },
  {
    id: "game-winner",
    name: "Game Winner",
    description: "Won a spin wheel challenge",
    icon: "🏆",
  },
  {
    id: "early-bird",
    name: "Early Bird",
    description: "One of the first 5 people to join",
    icon: "🐦",
  },
  {
    id: "social-butterfly",
    name: "Social Butterfly",
    description: "Completed 3 different activities",
    icon: "🦋",
  },
  {
    id: "party-legend",
    name: "Party Legend",
    description: "Earned 100+ points",
    icon: "⭐",
  },
  {
    id: "quiz-master",
    name: "Quiz Master",
    description: "Scored 80% or higher on the birthday quiz",
    icon: "🧠",
  },
  {
    id: "quiz-participant",
    name: "Quiz Participant",
    description: "Completed the birthday quiz",
    icon: "🎯",
  },
]

export const POINT_VALUES = {
  MESSAGE_SENT: 10,
  PHOTO_UPLOADED: 15,
  GAME_PARTICIPATION: 5,
  GAME_WIN: 20,
  FIRST_ACTIVITY: 25,
  BADGE_EARNED: 30,
}

export class GamificationManager {
  private static STORAGE_KEY = "nilan-party-game-data"

  static getGameData(): GameData {
    if (typeof window === "undefined") {
      return { players: {}, totalActivities: 0 }
    }

    const stored = localStorage.getItem(this.STORAGE_KEY)
    if (!stored) {
      return { players: {}, totalActivities: 0 }
    }

    try {
      const data = JSON.parse(stored)
      // Convert date strings back to Date objects
      Object.values(data.players).forEach((player: any) => {
        player.joinedAt = new Date(player.joinedAt)
        player.badges.forEach((badge: any) => {
          if (badge.earnedAt) {
            badge.earnedAt = new Date(badge.earnedAt)
          }
        })
      })
      return data
    } catch {
      return { players: {}, totalActivities: 0 }
    }
  }

  static saveGameData(data: GameData): void {
    if (typeof window === "undefined") return
    localStorage.setItem(this.STORAGE_KEY, JSON.stringify(data))
  }

  static getOrCreatePlayer(name: string): Player {
    const gameData = this.getGameData()

    if (!gameData.players[name]) {
      const playerCount = Object.keys(gameData.players).length
      const badges = AVAILABLE_BADGES.map((badge) => ({
        ...badge,
        earned: false,
      }))

      // Award early bird badge for first 5 players
      if (playerCount < 5) {
        const earlyBirdBadge = badges.find((b) => b.id === "early-bird")
        if (earlyBirdBadge) {
          earlyBirdBadge.earned = true
          earlyBirdBadge.earnedAt = new Date()
        }
      }

      gameData.players[name] = {
        name,
        points: playerCount < 5 ? POINT_VALUES.BADGE_EARNED : 0,
        badges,
        activities: [],
        joinedAt: new Date(),
      }

      this.saveGameData(gameData)
    }

    return gameData.players[name]
  }

  static awardPoints(playerName: string, points: number, activity: string): void {
    const gameData = this.getGameData()
    const player = gameData.players[playerName]

    if (!player) return

    player.points += points
    player.activities.push(activity)
    gameData.totalActivities++

    // Check for badge achievements
    this.checkBadgeAchievements(player, gameData)

    this.saveGameData(gameData)
  }

  private static checkBadgeAchievements(player: Player, gameData: GameData): void {
    const badges = player.badges

    // First Message Badge
    const firstMessageBadge = badges.find((b) => b.id === "first-message")
    if (
      firstMessageBadge &&
      !firstMessageBadge.earned &&
      player.activities.includes("message-sent") &&
      gameData.totalActivities === 1
    ) {
      firstMessageBadge.earned = true
      firstMessageBadge.earnedAt = new Date()
      player.points += POINT_VALUES.BADGE_EARNED
    }

    // Photo Uploader Badge
    const photoUploaderBadge = badges.find((b) => b.id === "photo-uploader")
    if (photoUploaderBadge && !photoUploaderBadge.earned && player.activities.includes("photo-uploaded")) {
      photoUploaderBadge.earned = true
      photoUploaderBadge.earnedAt = new Date()
      player.points += POINT_VALUES.BADGE_EARNED
    }

    // Game Winner Badge
    const gameWinnerBadge = badges.find((b) => b.id === "game-winner")
    if (gameWinnerBadge && !gameWinnerBadge.earned && player.activities.includes("game-won")) {
      gameWinnerBadge.earned = true
      gameWinnerBadge.earnedAt = new Date()
      player.points += POINT_VALUES.BADGE_EARNED
    }

    // Social Butterfly Badge
    const socialButterflyBadge = badges.find((b) => b.id === "social-butterfly")
    const uniqueActivities = new Set(player.activities.map((a) => a.split("-")[0])).size
    if (socialButterflyBadge && !socialButterflyBadge.earned && uniqueActivities >= 3) {
      socialButterflyBadge.earned = true
      socialButterflyBadge.earnedAt = new Date()
      player.points += POINT_VALUES.BADGE_EARNED
    }

    // Party Legend Badge
    const partyLegendBadge = badges.find((b) => b.id === "party-legend")
    if (partyLegendBadge && !partyLegendBadge.earned && player.points >= 100) {
      partyLegendBadge.earned = true
      partyLegendBadge.earnedAt = new Date()
      player.points += POINT_VALUES.BADGE_EARNED
    }

    // Quiz Master Badge
    const quizMasterBadge = badges.find((b) => b.id === "quiz-master")
    if (quizMasterBadge && !quizMasterBadge.earned && player.activities.includes("quiz-master-achieved")) {
      quizMasterBadge.earned = true
      quizMasterBadge.earnedAt = new Date()
      player.points += POINT_VALUES.BADGE_EARNED
    }

    // Quiz Participant Badge
    const quizParticipantBadge = badges.find((b) => b.id === "quiz-participant")
    if (quizParticipantBadge && !quizParticipantBadge.earned && player.activities.includes("quiz-completed")) {
      quizParticipantBadge.earned = true
      quizParticipantBadge.earnedAt = new Date()
      player.points += POINT_VALUES.BADGE_EARNED
    }
  }

  static getPlayerStats(playerName: string) {
    const gameData = this.getGameData()
    const player = gameData.players[playerName]
    if (!player) return null

    const earnedBadges = player.badges.filter((b) => b.earned)

    return {
      ...player,
      earnedBadgesCount: earnedBadges.length,
      totalBadges: player.badges.length,
    }
  }
}
