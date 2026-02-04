import { createClient } from '@supabase/supabase-js'

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY
const missingConfig = [
  supabaseUrl ? null : 'VITE_SUPABASE_URL',
  supabaseAnonKey ? null : 'VITE_SUPABASE_ANON_KEY',
].filter((value): value is string => Boolean(value))

let supabaseClient: ReturnType<typeof createClient> | null = null

export const getSupabaseClient = () => {
  if (missingConfig.length) {
    throw new Error(`Configuration Supabase manquante (${missingConfig.join(', ')}).`)
  }
  if (!supabaseClient) {
    supabaseClient = createClient(supabaseUrl!, supabaseAnonKey!)
  }
  return supabaseClient
}
