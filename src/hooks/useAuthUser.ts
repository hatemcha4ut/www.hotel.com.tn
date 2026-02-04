import { useEffect, useState } from 'react'
import { buildAuthUser, type AuthUser } from '@/lib/auth'
import { getSupabaseClient } from '@/lib/supabase'

export const useAuthUser = () => {
  const [currentUser, setCurrentUser] = useState<AuthUser | null>(null)

  useEffect(() => {
    let unsubscribe: (() => void) | undefined
 copilot/remove-spark-legacy-code
    try {
      const supabase = getSupabaseClient()
      supabase.auth.getUser()
        .then(({ data, error }) => {
          if (error) {
            console.error('Error fetching user session', error)
            return
          }
          setCurrentUser(buildAuthUser(data.user))
        })
        .catch((error) => {
          console.error('Failed to initialize auth session', error)
        })
      const { data: listener } = supabase.auth.onAuthStateChange((_event, session) => {
        setCurrentUser(buildAuthUser(session?.user ?? null))
      })
      unsubscribe = () => listener.subscription.unsubscribe()
    } catch (error) {
      console.error('Error loading session', error)
    }

    const supabase = getSupabaseClient()
    supabase.auth
      .getUser()
      .then(({ data, error }) => {
        if (error) {
          console.error('Error fetching user session', error)
          return
        }
        setCurrentUser(buildAuthUser(data.user))
      })
      .catch((error) => {
        console.error('Failed to initialize auth session', error)
      })
    const { data: listener } = supabase.auth.onAuthStateChange((_event, session) => {
      setCurrentUser(buildAuthUser(session?.user ?? null))
    })
    unsubscribe = () => listener.subscription.unsubscribe()
 main
    return () => {
      unsubscribe?.()
    }
  }, [])

  return currentUser
}
