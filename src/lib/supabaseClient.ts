import { createClient } from '@supabase/supabase-js'

const requiredVariables = {
  VITE_SUPABASE_URL: import.meta.env.VITE_SUPABASE_URL,
  VITE_SUPABASE_ANON_KEY: import.meta.env.VITE_SUPABASE_ANON_KEY,
}

const missingVariables = Object.entries(requiredVariables)
  .filter(([, value]) => !value || value.trim() === '')
  .map(([key]) => key)

if (missingVariables.length > 0) {
  throw new Error(
    `Missing required Supabase environment variables: ${missingVariables.join(', ')}`
  )
}

export const supabaseClient = createClient(
  requiredVariables.VITE_SUPABASE_URL as string,
  requiredVariables.VITE_SUPABASE_ANON_KEY as string
)
