"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Switch } from "@/components/ui/switch"
import { Label } from "@/components/ui/label"
import { AccessControlManager } from "@/lib/access-control"
import { useAccessControl } from "@/hooks/use-access-control"
import { MessageSquare, Gamepad2, Camera, Lock, Unlock, RefreshCw, Wifi, WifiOff } from "lucide-react"

export function AccessControlPanel() {
  const { settings, refreshSettings, isOnline } = useAccessControl()
  const [isUpdating, setIsUpdating] = useState<string | null>(null)

  const handleToggle = async (feature: "messages" | "games" | "gallery") => {
    setIsUpdating(feature)

    try {
      await AccessControlManager.toggleFeature(feature)
      // Refresh to get latest state
      await refreshSettings()
    } catch (error) {
      console.error("Error toggling feature:", error)
    } finally {
      setIsUpdating(null)
    }
  }

  const handleQuickAction = async (action: "open" | "close") => {
    try {
      const newSettings = {
        messagesEnabled: action === "open",
        gamesEnabled: action === "open",
        galleryEnabled: action === "open",
        lastUpdated: new Date().toISOString(),
      }

      await AccessControlManager.saveAccessSettings(newSettings)
      await refreshSettings()
    } catch (error) {
      console.error("Error with quick action:", error)
    }
  }

  return (
    <Card className="border-2 border-[#ffb347]">
      <CardHeader className="bg-[#ffb347] text-white">
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="flex items-center gap-2">
              <Lock className="h-6 w-6" />🚦 Party Access Control
            </CardTitle>
            <p className="text-sm opacity-90">Control which features guests can access</p>
          </div>
          <div className="flex items-center gap-2">
            <div className="flex items-center gap-1">
              {isOnline ? <Wifi className="h-4 w-4 text-green-200" /> : <WifiOff className="h-4 w-4 text-red-200" />}
              <span className="text-xs">{isOnline ? "Online" : "Offline"}</span>
            </div>
            <Button
              onClick={refreshSettings}
              variant="ghost"
              size="sm"
              className="text-white hover:bg-white/20"
              title="Refresh settings"
            >
              <RefreshCw className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </CardHeader>
      <CardContent className="p-6 space-y-6">
        {/* Messages Control */}
        <div className="flex items-center justify-between p-4 bg-[#e57373]/10 rounded-lg border border-[#e57373]/20">
          <div className="flex items-center gap-3">
            <div
              className={`p-2 rounded-full ${settings.messagesEnabled ? "bg-[#e57373] text-white" : "bg-gray-200 text-gray-500"}`}
            >
              <MessageSquare className="h-5 w-5" />
            </div>
            <div>
              <Label className="text-base font-semibold">📝 Message Station</Label>
              <p className="text-sm text-gray-600">Allow guests to leave messages for 18-year-old Nilan</p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <div
              className={`px-3 py-1 rounded-full text-sm font-medium ${
                settings.messagesEnabled ? "bg-green-100 text-green-700" : "bg-red-100 text-red-700"
              }`}
            >
              {settings.messagesEnabled ? (
                <>
                  <Unlock className="h-3 w-3 inline mr-1" />
                  Open
                </>
              ) : (
                <>
                  <Lock className="h-3 w-3 inline mr-1" />
                  Locked
                </>
              )}
            </div>
            <Switch
              checked={settings.messagesEnabled}
              onCheckedChange={() => handleToggle("messages")}
              disabled={isUpdating === "messages"}
            />
          </div>
        </div>

        {/* Games Control */}
        <div className="flex items-center justify-between p-4 bg-[#9b59b6]/10 rounded-lg border border-[#9b59b6]/20">
          <div className="flex items-center gap-3">
            <div
              className={`p-2 rounded-full ${settings.gamesEnabled ? "bg-[#9b59b6] text-white" : "bg-gray-200 text-gray-500"}`}
            >
              <Gamepad2 className="h-5 w-5" />
            </div>
            <div>
              <Label className="text-base font-semibold">🎮 Party Games Zone</Label>
              <p className="text-sm text-gray-600">Allow guests to play spin wheel and quiz games</p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <div
              className={`px-3 py-1 rounded-full text-sm font-medium ${
                settings.gamesEnabled ? "bg-green-100 text-green-700" : "bg-red-100 text-red-700"
              }`}
            >
              {settings.gamesEnabled ? (
                <>
                  <Unlock className="h-3 w-3 inline mr-1" />
                  Open
                </>
              ) : (
                <>
                  <Lock className="h-3 w-3 inline mr-1" />
                  Locked
                </>
              )}
            </div>
            <Switch
              checked={settings.gamesEnabled}
              onCheckedChange={() => handleToggle("games")}
              disabled={isUpdating === "games"}
            />
          </div>
        </div>

        {/* Gallery Control */}
        <div className="flex items-center justify-between p-4 bg-[#8fbc8f]/10 rounded-lg border border-[#8fbc8f]/20">
          <div className="flex items-center gap-3">
            <div
              className={`p-2 rounded-full ${settings.galleryEnabled ? "bg-[#8fbc8f] text-white" : "bg-gray-200 text-gray-500"}`}
            >
              <Camera className="h-5 w-5" />
            </div>
            <div>
              <Label className="text-base font-semibold">📸 Photo Gallery</Label>
              <p className="text-sm text-gray-600">Allow guests to upload and view photos</p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <div
              className={`px-3 py-1 rounded-full text-sm font-medium ${
                settings.galleryEnabled ? "bg-green-100 text-green-700" : "bg-red-100 text-red-700"
              }`}
            >
              {settings.galleryEnabled ? (
                <>
                  <Unlock className="h-3 w-3 inline mr-1" />
                  Open
                </>
              ) : (
                <>
                  <Lock className="h-3 w-3 inline mr-1" />
                  Locked
                </>
              )}
            </div>
            <Switch
              checked={settings.galleryEnabled}
              onCheckedChange={() => handleToggle("gallery")}
              disabled={isUpdating === "gallery"}
            />
          </div>
        </div>

        {/* Quick Actions */}
        <div className="pt-4 border-t">
          <h4 className="font-semibold mb-3">🚀 Quick Actions</h4>
          <div className="flex gap-2 flex-wrap">
            <Button
              onClick={() => handleQuickAction("open")}
              className="bg-green-500 hover:bg-green-600 text-white"
              size="sm"
            >
              🎉 Open All Stations
            </Button>
            <Button
              onClick={() => handleQuickAction("close")}
              variant="outline"
              className="border-red-500 text-red-500 hover:bg-red-50"
              size="sm"
            >
              🔒 Lock All Stations
            </Button>
          </div>
        </div>

        {/* Status */}
        <div className="text-center text-sm text-gray-500 bg-gray-50 p-3 rounded-lg">
          <div>Last updated: {new Date(settings.lastUpdated).toLocaleTimeString()}</div>
          <div className="mt-1 text-xs flex items-center justify-center gap-1">
            {isOnline ? (
              <>
                <Wifi className="h-3 w-3 text-green-500" />🔄 Syncing across all devices
              </>
            ) : (
              <>
                <WifiOff className="h-3 w-3 text-red-500" />📱 Offline mode - using local storage
              </>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
