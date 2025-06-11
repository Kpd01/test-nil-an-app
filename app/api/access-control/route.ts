import { type NextRequest, NextResponse } from "next/server"
import { createServerSupabaseClient } from "@/lib/supabase"

export async function GET() {
  const supabase = createServerSupabaseClient()

  if (!supabase) {
    return NextResponse.json({ error: "Database not configured" }, { status: 503 })
  }

  try {
    const { data, error } = await supabase.from("settings").select("key, value")

    if (error) {
      console.error("Database error:", error)
      return NextResponse.json({ error: "Failed to fetch settings" }, { status: 500 })
    }

    const settings: Record<string, boolean> = {}
    data?.forEach(({ key, value }) => {
      settings[key] = value === "true"
    })

    const response = NextResponse.json(settings)

    // Add no-cache headers
    response.headers.set("Cache-Control", "no-cache, no-store, must-revalidate")
    response.headers.set("Pragma", "no-cache")
    response.headers.set("Expires", "0")

    return response
  } catch (error) {
    console.error("Server error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  const supabase = createServerSupabaseClient()

  if (!supabase) {
    return NextResponse.json({ error: "Database not configured" }, { status: 503 })
  }

  try {
    const settings = await request.json()

    const updates = Object.entries(settings).map(([key, value]) => ({
      key,
      value: value.toString(),
      updated_at: new Date().toISOString(),
    }))

    const { error } = await supabase.from("settings").upsert(updates, { onConflict: "key" })

    if (error) {
      console.error("Database error:", error)
      return NextResponse.json({ error: "Failed to update settings" }, { status: 500 })
    }

    const response = NextResponse.json({ success: true })

    // Add no-cache headers
    response.headers.set("Cache-Control", "no-cache, no-store, must-revalidate")
    response.headers.set("Pragma", "no-cache")
    response.headers.set("Expires", "0")

    return response
  } catch (error) {
    console.error("Server error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
