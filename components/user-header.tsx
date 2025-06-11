"use client"

import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { LogOut, User } from "lucide-react"

interface UserHeaderProps {
  userName: string
  onLogout: () => void
}

export function UserHeader({ userName, onLogout }: UserHeaderProps) {
  return (
    <Card className="border-2 border-[#64b5f6] bg-white">
      <CardContent className="p-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <User className="h-5 w-5 text-[#64b5f6]" />
            <span className="font-medium text-[#2c5282]">Welcome, {userName}!</span>
          </div>
          <Button
            onClick={onLogout}
            variant="outline"
            size="sm"
            className="border-[#64b5f6] text-[#64b5f6] hover:bg-[#64b5f6] hover:text-white"
          >
            <LogOut className="h-4 w-4 mr-1" />
            Switch User
          </Button>
        </div>
      </CardContent>
    </Card>
  )
}
