import { createClient, SupabaseClient } from '@supabase/supabase-js'

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY

/** true when both VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY are set */
export const supabaseConfigured = Boolean(supabaseUrl && supabaseAnonKey)

/** Human-readable list of missing env vars (empty when configured) */
export const missingSupabaseVars = [
  supabaseUrl ? null : 'VITE_SUPABASE_URL',
  supabaseAnonKey ? null : 'VITE_SUPABASE_ANON_KEY',
].filter((value): value is string => Boolean(value))

let supabaseClient: SupabaseClient | null = null

/**
 * Returns the Supabase client instance.
 * Returns `null` if environment variables are not configured (instead of throwing).
 * Callers MUST check for null before using.
 */
export const getSupabaseClient = (): SupabaseClient | null => {
  if (!supabaseConfigured) {
    if (import.meta.env.DEV) {
      console.warn(
        `[supabase] Supabase not configured — missing: ${missingSupabaseVars.join(', ')}. Auth features disabled.`
      )
    }
    return null
  }
  if (!supabaseClient) {
    supabaseClient = createClient(supabaseUrl!, supabaseAnonKey!)
  }
  return supabaseClient
}
