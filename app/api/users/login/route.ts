import { createServerSupabaseClient } from "@/lib/supabase/server"
import { NextResponse } from "next/server"

// Update the POST function to ensure proper user creation and response
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

    const normalizedUsername = username.toLowerCase().trim()

    // First, try to find existing user
    const { data: existingUser, error: findError } = await supabase
      .from("users")
      .select("*")
      .eq("username", normalizedUsername)
      .single()

    if (existingUser && !findError) {
      // Update last_active and session_count for existing user
      const { data: updatedUser, error: updateError } = await supabase
        .from("users")
        .update({
          last_active: new Date().toISOString(),
          session_count: (existingUser.session_count || 0) + 1,
          is_active: true,
        })
        .eq("id", existingUser.id)
        .select()
        .single()

      if (updateError) {
        console.error("Error updating existing user:", updateError)
        throw updateError
      }

      return NextResponse.json({
        user: updatedUser,
        isNewUser: false,
      })
    }

    // Create new user if not found
    const userAgent = request.headers.get("user-agent") || ""
    const forwarded = request.headers.get("x-forwarded-for")
    const ipAddress = forwarded ? forwarded.split(",")[0] : request.headers.get("x-real-ip")

    const { data: newUser, error: createError } = await supabase
      .from("users")
      .insert({
        username: normalizedUsername,
        display_name: username, // Keep original case for display
        user_agent: userAgent,
        ip_address: ipAddress,
        last_active: new Date().toISOString(),
        session_count: 1,
        is_active: true,
        total_points: 0,
        quiz_completed: false,
        messages_sent: 0,
        photos_uploaded: 0,
      })
      .select()
      .single()

    if (createError) {
      console.error("Error creating new user:", createError)
      throw createError
    }

    return NextResponse.json({
      user: newUser,
      isNewUser: true,
    })
  } catch (error) {
    console.error("Login error:", error)
    return NextResponse.json({ error: "Failed to process login" }, { status: 500 })
  }
}
