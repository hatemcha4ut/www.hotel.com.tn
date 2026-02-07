import type { User } from '@supabase/supabase-js'
import { getSupabaseClient } from './supabase'

export interface AuthUser {
  id: string
  email: string
  phone: string
  name: string
}

export const buildAuthUser = (user: User | null): AuthUser | null => {
  if (!user) {
    return null
  }
  const metadata = (user.user_metadata ?? {}) as {
    first_name?: string
    last_name?: string
    phone?: string
    name?: string
  }
  const fallbackName = user.email ? user.email.split('@')[0] : ''
  const firstName = metadata.first_name ?? ''
  const lastName = metadata.last_name ?? ''
  return {
    id: user.id,
    email: user.email ?? '',
    phone: user.phone ?? metadata.phone ?? '',
    name: `${firstName} ${lastName}`.trim() || metadata.name || fallbackName,
  }
}

// Auth service functions
export const signUp = async (email: string, password: string) => {
  const supabase = getSupabaseClient()
  return await supabase.auth.signUp({ email, password })
}

export const signIn = async (email: string, password: string) => {
  const supabase = getSupabaseClient()
  return await supabase.auth.signInWithPassword({ email, password })
}

export const resetPassword = async (email: string) => {
  const supabase = getSupabaseClient()
  // Use window.location.origin in browser, fallback to hardcoded URL for SSR or testing
  const redirectUrl = typeof window !== 'undefined' 
    ? `${window.location.origin}/#/update-password`
    : 'https://www.hotel.com.tn/#/update-password'
  return await supabase.auth.resetPasswordForEmail(email, {
    redirectTo: redirectUrl,
  })
}

export const updatePassword = async (newPassword: string) => {
  const supabase = getSupabaseClient()
  return await supabase.auth.updateUser({ password: newPassword })
}

export const signOut = async () => {
  const supabase = getSupabaseClient()
  return await supabase.auth.signOut()
}

export const upsertProfile = async (userId: string, whatsappNumber: string) => {
  const supabase = getSupabaseClient()
  return await supabase
    .from('profiles')
    .upsert({ user_id: userId, whatsapp_number: whatsappNumber })
}

// Future: OTP email verification
// export const verifyOtp = async (email: string, token: string) => {
//   const supabase = getSupabaseClient()
//   return await supabase.auth.verifyOtp({ email, token, type: 'email' })
// }
