import { createClient } from '@supabase/supabase-js'

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY

const missingVariables = [
  !supabaseUrl ? 'VITE_SUPABASE_URL' : null,
  !supabaseAnonKey ? 'VITE_SUPABASE_ANON_KEY' : null,
].filter(Boolean)

if (missingVariables.length > 0) {
  throw new Error(
    `Missing required Supabase environment variables: ${missingVariables.join(', ')}`
  )
}

export const supabaseClient = createClient(supabaseUrl, supabaseAnonKey)
