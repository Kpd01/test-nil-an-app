import { NextResponse } from "next/server"
import { createServerSupabaseClient } from "@/lib/supabase"

export async function POST(request: Request) {
  const supabase = createServerSupabaseClient()

  if (!supabase) {
    return NextResponse.json({ error: "Database not configured" }, { status: 500 })
  }

  try {
    const body = await request.json()
    const { username } = body

    if (!username) {
      return NextResponse.json({ error: "Username is required" }, { status: 400 })
    }

    // Try to find existing user
    const { data: existingUser, error: fetchError } = await supabase
      .from("users")
      .select("*")
      .eq("username", username.toLowerCase())
      .single()

    if (fetchError && fetchError.code !== "PGRST116") {
      throw fetchError
    }

    if (existingUser) {
      // Update last active and session count
      const { data, error } = await supabase
        .from("users")
        .update({
          last_active: new Date().toISOString(),
          session_count: existingUser.session_count + 1,
        })
        .eq("id", existingUser.id)
        .select()
        .single()

      if (error) {
        throw error
      }

      return NextResponse.json({ user: data, isNewUser: false })
    } else {
      // Create new user
      const userAgent = request.headers.get("user-agent") || ""
      const forwarded = request.headers.get("x-forwarded-for")
      const ipAddress = forwarded ? forwarded.split(",")[0] : request.headers.get("x-real-ip")

      const { data, error } = await supabase
        .from("users")
        .insert({
          username: username.toLowerCase(),
          display_name: username,
          user_agent: userAgent,
          ip_address: ipAddress,
          last_active: new Date().toISOString(),
        })
        .select()
        .single()

      if (error) {
        throw error
      }

      return NextResponse.json({ user: data, isNewUser: true })
    }
  } catch (error) {
    console.error("Error during login:", error)
    return NextResponse.json({ error: "Failed to login" }, { status: 500 })
  }
}
