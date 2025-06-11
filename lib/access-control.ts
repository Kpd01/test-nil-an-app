import { supabase, isSupabaseAvailable } from "./supabase"

export interface AccessSettings {
  messagesEnabled: boolean
  gamesEnabled: boolean
  galleryEnabled: boolean
  lastUpdated: string
}

export class AccessControlManager {
  private static readonly STORAGE_KEY = "nilan-party-access-control"
  private static readonly SETTINGS_ID = "access-control"

  // Fallback to localStorage for offline support
  static getLocalSettings(): AccessSettings {
    if (typeof window === "undefined") {
      return this.getDefaultSettings()
    }

    try {
      const stored = localStorage.getItem(this.STORAGE_KEY)
      if (stored) {
        return JSON.parse(stored)
      }
    } catch (error) {
      console.error("Failed to load local settings")
    }

    return this.getDefaultSettings()
  }

  static saveLocalSettings(settings: AccessSettings): void {
    if (typeof window === "undefined") return
    try {
      localStorage.setItem(this.STORAGE_KEY, JSON.stringify(settings))
    } catch (error) {
      console.error("Failed to save local settings")
    }
  }

  // Server-side methods
  static async getAccessSettings(): Promise<AccessSettings> {
    // If Supabase is not available, use localStorage
    if (!isSupabaseAvailable()) {
      console.log("Supabase not available, using local settings")
      return this.getLocalSettings()
    }

    try {
      const { data, error } = await supabase!.from("settings").select("value").eq("id", this.SETTINGS_ID).single()

      if (error || !data) {
        console.log("Settings not found in database, using local settings")
        return this.getLocalSettings()
      }

      const settings = data.value as AccessSettings
      // Save to localStorage as backup
      this.saveLocalSettings(settings)
      return settings
    } catch (error) {
      console.error("Failed to fetch settings from server, using local:", error)
      // Fallback to localStorage
      return this.getLocalSettings()
    }
  }

  static async saveAccessSettings(settings: AccessSettings): Promise<AccessSettings> {
    const updatedSettings = {
      ...settings,
      lastUpdated: new Date().toISOString(),
    }

    // Always save to localStorage as backup
    this.saveLocalSettings(updatedSettings)

    // If Supabase is not available, just return the settings
    if (!isSupabaseAvailable()) {
      console.log("Supabase not available, saved to localStorage only")
      return updatedSettings
    }

    try {
      const { error } = await supabase!.from("settings").upsert({
        id: this.SETTINGS_ID,
        value: updatedSettings,
        updated_at: new Date().toISOString(),
      })

      if (error) {
        console.error("Failed to save settings to database:", error)
      }

      return updatedSettings
    } catch (error) {
      console.error("Failed to save settings to server:", error)
      return updatedSettings
    }
  }

  static async toggleFeature(feature: "messages" | "games" | "gallery"): Promise<AccessSettings> {
    const currentSettings = await this.getAccessSettings()

    const updatedSettings = {
      ...currentSettings,
      [`${feature}Enabled`]: !currentSettings[`${feature}Enabled` as keyof AccessSettings],
      lastUpdated: new Date().toISOString(),
    }

    return await this.saveAccessSettings(updatedSettings)
  }

  private static getDefaultSettings(): AccessSettings {
    return {
      messagesEnabled: true,
      gamesEnabled: true,
      galleryEnabled: true,
      lastUpdated: new Date().toISOString(),
    }
  }

  // Real-time subscription for settings changes (only works with Supabase)
  static subscribeToSettings(callback: (settings: AccessSettings) => void) {
    if (!isSupabaseAvailable()) {
      console.log("Supabase not available, real-time subscriptions disabled")
      return { unsubscribe: () => {} }
    }

    return supabase!
      .channel("settings-changes")
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "settings",
          filter: `id=eq.${this.SETTINGS_ID}`,
        },
        (payload) => {
          if (payload.new && typeof payload.new === "object" && "value" in payload.new) {
            callback(payload.new.value as AccessSettings)
          }
        },
      )
      .subscribe()
  }
}
