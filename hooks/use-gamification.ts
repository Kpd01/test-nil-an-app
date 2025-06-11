"use client"

import { useState, useEffect, useCallback } from "react"
import { GamificationManager, type Player, POINT_VALUES } from "@/lib/gamification"

export function useGamification(playerName?: string) {
  const [currentPlayer, setCurrentPlayer] = useState<Player | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  const refreshData = useCallback(() => {
    if (playerName) {
      const player = GamificationManager.getOrCreatePlayer(playerName)
      setCurrentPlayer(player)
    }
    setIsLoading(false)
  }, [playerName])

  useEffect(() => {
    refreshData()
  }, [refreshData])

  const awardPoints = useCallback(
    (points: number, activity: string) => {
      if (!playerName) return

      GamificationManager.awardPoints(playerName, points, activity)
      refreshData()
    },
    [playerName, refreshData],
  )

  const awardMessagePoints = useCallback(() => {
    awardPoints(POINT_VALUES.MESSAGE_SENT, "message-sent")
  }, [awardPoints])

  const awardPhotoPoints = useCallback(() => {
    awardPoints(POINT_VALUES.PHOTO_UPLOADED, "photo-uploaded")
  }, [awardPoints])

  const awardGamePoints = useCallback(
    (won = false) => {
      const points = won ? POINT_VALUES.GAME_WIN : POINT_VALUES.GAME_PARTICIPATION
      const activity = won ? "game-won" : "game-participated"
      awardPoints(points, activity)
    },
    [awardPoints],
  )

  // Add a simple addPoints method for backward compatibility
  const addPoints = useCallback(
    (points: number, reason: string) => {
      awardPoints(points, reason)
    },
    [awardPoints],
  )

  return {
    currentPlayer,
    isLoading,
    awardPoints,
    awardMessagePoints,
    awardPhotoPoints,
    awardGamePoints,
    addPoints, // Add this for backward compatibility
    refreshData,
  }
}
