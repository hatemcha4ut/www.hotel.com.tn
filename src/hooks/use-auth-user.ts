import { useEffect, useState } from 'react'
import { getSupabaseClient } from '@/lib/supabase'
import type { AuthUser } from '@/components/AuthDialog'
import { buildAuthUser } from '@/components/AuthDialog'

export const useAuthUser = () => {
  const [currentUser, setCurrentUser] = useState<AuthUser | null>(null)

  useEffect(() => {
    const supabase = getSupabaseClient()
    let isMounted = true
    supabase.auth.getUser().then(({ data, error }) => {
      if (!isMounted) return
      if (error) {
        console.error('Error retrieving user session', error)
        setCurrentUser(null)
        return
      }
      if (data.user) {
        setCurrentUser(buildAuthUser(data.user))
      }
    })
    const { data: authStateListener } = supabase.auth.onAuthStateChange((_event, session) => {
      if (!isMounted) return
      setCurrentUser(session?.user ? buildAuthUser(session.user) : null)
    })
    return () => {
      isMounted = false
      try {
        authStateListener.subscription.unsubscribe()
      } catch (error) {
        console.error('Error unsubscribing from auth state listener', error)
      }
    }
  }, [])

  return { currentUser, setCurrentUser }
}
