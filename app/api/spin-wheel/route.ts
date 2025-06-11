import { type NextRequest, NextResponse } from "next/server"
import { createServerSupabaseClient } from "@/lib/supabase"

// In-memory storage for spin wheel commands (fallback)
let spinCommands: any[] = []
const serverStartTime = Date.now()

export async function GET() {
  const supabase = createServerSupabaseClient()

  // Try to get latest UNPROCESSED command from Supabase
  if (supabase) {
    try {
      // Only get commands from the last 30 seconds that haven't been processed
      const thirtySecondsAgo = new Date(Date.now() - 30000).toISOString()

      const { data, error } = await supabase
        .from("spin_results")
        .select("*")
        .gte("timestamp", thirtySecondsAgo)
        .is("processed", false) // Only get unprocessed commands
        .order("timestamp", { ascending: false })
        .limit(1)
        .single()

      if (!error && data) {
        // Mark this command as processed so it won't be returned again
        await supabase.from("spin_results").update({ processed: true }).eq("id", data.id)

        const response = NextResponse.json({
          command: {
            id: data.id,
            action: "spin",
            guest: data.player_name,
            task: data.result,
            category: data.category,
            timestamp: new Date(data.timestamp).getTime(),
            serverTimestamp: new Date(data.timestamp).getTime(),
          },
          timestamp: Date.now(),
          serverStartTime,
        })

        // Add no-cache headers
        response.headers.set("Cache-Control", "no-cache, no-store, must-revalidate")
        response.headers.set("Pragma", "no-cache")
        response.headers.set("Expires", "0")

        console.log("📤 [API] Returning fresh command:", data.id)
        return response
      }
    } catch (error) {
      console.error("❌ [API] Error fetching spin command from Supabase:", error)
    }
  }

  // Fallback to in-memory storage - only return unprocessed commands
  const unprocessedCommands = spinCommands.filter((cmd) => !cmd.processed && Date.now() - cmd.serverTimestamp < 30000)
  const latestCommand = unprocessedCommands[unprocessedCommands.length - 1] || null

  if (latestCommand) {
    // Mark as processed
    latestCommand.processed = true
    console.log("📤 [API] Returning fresh in-memory command:", latestCommand.id)
  }

  const response = NextResponse.json({
    command: latestCommand,
    timestamp: Date.now(),
    serverStartTime,
  })

  // Add no-cache headers
  response.headers.set("Cache-Control", "no-cache, no-store, must-revalidate")
  response.headers.set("Pragma", "no-cache")
  response.headers.set("Expires", "0")

  return response
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const supabase = createServerSupabaseClient()

    // Add unique ID and timestamp
    const command = {
      ...body,
      id: Math.random().toString(36).substr(2, 9),
      serverTimestamp: Date.now(),
      processed: false, // Mark as unprocessed initially
    }

    console.log("📥 [API] New spin command received:", command.id)

    // Try to save to Supabase
    if (supabase) {
      try {
        await supabase.from("spin_results").insert({
          id: command.id,
          player_name: command.guest,
          result: command.task,
          category: command.category,
          timestamp: new Date(command.serverTimestamp).toISOString(),
          processed: false, // Mark as unprocessed
        })
        console.log("💾 [API] Saved to Supabase:", command.id)
      } catch (error) {
        console.error("❌ [API] Error saving spin command to Supabase:", error)
      }
    }

    // Store the command in memory as fallback (keep only last 10 for memory efficiency)
    spinCommands.push(command)
    if (spinCommands.length > 10) {
      spinCommands = spinCommands.slice(-10)
    }

    const response = NextResponse.json(command)

    // Add no-cache headers
    response.headers.set("Cache-Control", "no-cache, no-store, must-revalidate")
    response.headers.set("Pragma", "no-cache")
    response.headers.set("Expires", "0")

    return response
  } catch (error) {
    console.error("❌ [API] Invalid request:", error)
    return NextResponse.json({ error: "Invalid request" }, { status: 400 })
  }
}

// Add a cleanup endpoint to clear old processed commands
export async function DELETE() {
  const supabase = createServerSupabaseClient()

  if (supabase) {
    try {
      // Delete processed commands older than 1 hour
      const oneHourAgo = new Date(Date.now() - 3600000).toISOString()

      const { error } = await supabase.from("spin_results").delete().lt("timestamp", oneHourAgo).eq("processed", true)

      if (!error) {
        console.log("🧹 [API] Cleaned up old processed commands")
      }
    } catch (error) {
      console.error("❌ [API] Error cleaning up commands:", error)
    }
  }

  // Clean up in-memory commands
  spinCommands = spinCommands.filter((cmd) => Date.now() - cmd.serverTimestamp < 3600000)

  return NextResponse.json({ message: "Cleanup completed" })
}
