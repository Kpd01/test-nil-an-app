"use client"

import { useState, useEffect } from "react"
import { AccessControlManager, type AccessSettings } from "@/lib/access-control"

export function useAccessControl() {
  const [settings, setSettings] = useState<AccessSettings>({
    messagesEnabled: true,
    gamesEnabled: true,
    galleryEnabled: true,
    lastUpdated: new Date().toISOString(),
  })
  const [isLoading, setIsLoading] = useState(true)
  const [isOnline, setIsOnline] = useState(true)

  // Load initial settings
  useEffect(() => {
    const loadSettings = async () => {
      try {
        const initialSettings = await AccessControlManager.getAccessSettings()
        setSettings(initialSettings)
        setIsOnline(true)
      } catch (error) {
        console.error("Error loading initial settings:", error)
        setIsOnline(false)
      } finally {
        setIsLoading(false)
      }
    }

    loadSettings()
  }, [])

  // Set up real-time subscription
  useEffect(() => {
    const subscription = AccessControlManager.subscribeToSettings((newSettings) => {
      setSettings(newSettings)
      setIsOnline(true)
    })

    return () => {
      subscription.unsubscribe()
    }
  }, [])

  const refreshSettings = async () => {
    try {
      const newSettings = await AccessControlManager.getAccessSettings()
      setSettings(newSettings)
      setIsOnline(true)
    } catch (error) {
      console.error("Error refreshing settings:", error)
      setIsOnline(false)
    }
  }

  return {
    settings,
    isLoading,
    isOnline,
    refreshSettings,
  }
}
