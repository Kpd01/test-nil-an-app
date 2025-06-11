import { NextResponse } from "next/server"
import { createServerSupabaseClient } from "@/lib/supabase"

export async function GET() {
  const supabase = createServerSupabaseClient()

  if (!supabase) {
    return NextResponse.json({ error: "Database not configured" }, { status: 500 })
  }

  try {
    const { data, error } = await supabase.from("users").select("*").order("created_at", { ascending: false })

    if (error) {
      console.error("Supabase error:", error)
      throw error
    }

    const response = NextResponse.json(data || [])
    response.headers.set("Cache-Control", "no-cache, no-store, must-revalidate")
    response.headers.set("Pragma", "no-cache")
    response.headers.set("Expires", "0")

    return response
  } catch (error) {
    console.error("Error fetching users:", error)
    return NextResponse.json({ error: "Failed to fetch users" }, { status: 500 })
  }
}

export async function POST(request: Request) {
  const supabase = createServerSupabaseClient()

  if (!supabase) {
    return NextResponse.json({ error: "Database not configured" }, { status: 500 })
  }

  try {
    const body = await request.json()
    const { username, display_name, email } = body

    if (!username) {
      return NextResponse.json({ error: "Username is required" }, { status: 400 })
    }

    // Check if username already exists
    const { data: existingUser } = await supabase
      .from("users")
      .select("id")
      .eq("username", username.toLowerCase())
      .single()

    if (existingUser) {
      return NextResponse.json({ error: "Username already exists" }, { status: 409 })
    }

    // Get client info from headers
    const userAgent = request.headers.get("user-agent") || ""
    const forwarded = request.headers.get("x-forwarded-for")
    const ipAddress = forwarded ? forwarded.split(",")[0] : request.headers.get("x-real-ip")

    const { data, error } = await supabase
      .from("users")
      .insert({
        username: username.toLowerCase(),
        display_name: display_name || username,
        email,
        user_agent: userAgent,
        ip_address: ipAddress,
        last_active: new Date().toISOString(),
      })
      .select()
      .single()

    if (error) {
      throw error
    }

    const response = NextResponse.json(data)
    response.headers.set("Cache-Control", "no-cache, no-store, must-revalidate")

    return response
  } catch (error) {
    console.error("Error creating user:", error)
    return NextResponse.json({ error: "Failed to create user" }, { status: 500 })
  }
}
