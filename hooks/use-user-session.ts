"use client"

import { useState, useEffect } from "react"

export function useUserSession() {
  const [userName, setUserName] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    // Simple synchronous loading from localStorage
    const user = localStorage.getItem("party-user-name")
    setUserName(user)
    setIsLoading(false)
  }, [])

  const setUser = (name: string) => {
    localStorage.setItem("party-user-name", name)
    setUserName(name)
  }

  const clearUser = () => {
    localStorage.removeItem("party-user-name")
    setUserName(null)
  }

  const hasUser = !!userName

  return {
    userName,
    setUser,
    clearUser,
    hasUser,
    isLoading,
  }
}
