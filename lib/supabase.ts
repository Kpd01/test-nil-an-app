import { createClient } from "@supabase/supabase-js"

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

// Check if environment variables are available
if (!supabaseUrl || !supabaseAnonKey) {
  console.warn("Supabase environment variables not found. Database features will be disabled.")
}

// Create client only if environment variables are available
export const supabase = supabaseUrl && supabaseAnonKey ? createClient(supabaseUrl, supabaseAnonKey) : null

// Server-side client for API routes
export const createServerSupabaseClient = () => {
  const serverKey = process.env.SUPABASE_SERVICE_ROLE_KEY

  if (!supabaseUrl || !serverKey) {
    console.warn("Server Supabase environment variables not found.")
    return null
  }

  return createClient(supabaseUrl, serverKey)
}

// Helper function to check if Supabase is available
export const isSupabaseAvailable = () => {
  return supabase !== null
}
