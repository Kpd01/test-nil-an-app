import { NextResponse } from "next/server"
import { createServerSupabaseClient } from "@/lib/supabase"

export async function GET() {
  const supabase = createServerSupabaseClient()

  if (!supabase) {
    return NextResponse.json({ error: "Database not configured" }, { status: 500 })
  }

  try {
    const { data, error } = await supabase.from("messages").select("*").order("created_at", { ascending: false })

    if (error) {
      throw error
    }

    const response = NextResponse.json(data || [])

    // Add no-cache headers
    response.headers.set("Cache-Control", "no-cache, no-store, must-revalidate")
    response.headers.set("Pragma", "no-cache")
    response.headers.set("Expires", "0")

    return response
  } catch (error) {
    console.error("Error fetching messages:", error)
    return NextResponse.json({ error: "Failed to fetch messages" }, { status: 500 })
  }
}

export async function POST(request: Request) {
  const supabase = createServerSupabaseClient()

  if (!supabase) {
    return NextResponse.json({ error: "Database not configured" }, { status: 500 })
  }

  try {
    const body = await request.json()
    const { name, message, emoji = "🎉" } = body

    if (!name || !message) {
      return NextResponse.json({ error: "Name and message are required" }, { status: 400 })
    }

    const { data, error } = await supabase
      .from("messages")
      .insert({
        name,
        message,
        emoji,
      })
      .select()
      .single()

    if (error) {
      throw error
    }

    const response = NextResponse.json(data)

    // Add no-cache headers
    response.headers.set("Cache-Control", "no-cache, no-store, must-revalidate")
    response.headers.set("Pragma", "no-cache")
    response.headers.set("Expires", "0")

    return response
  } catch (error) {
    console.error("Error creating message:", error)
    return NextResponse.json({ error: "Failed to create message" }, { status: 500 })
  }
}
