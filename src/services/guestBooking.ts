/**
 * Guest Booking Service
 * 
 * This service handles booking creation for both authenticated and guest users.
 * JWT tokens are automatically included by Supabase client:
 * - For logged-in users: session access_token
 * - For guest users: anon key
 * 
 * No MyGo tokens are used or required from search-hotels response.
 */
import { getSupabaseClient } from '@/lib/supabase'
import type { GuestDetails, Hotel, Room, SearchParams } from '@/types'

export interface GuestBookingPayload {
  hotelId: string
  hotel: Hotel
  room: Room
  rooms: Room[]
  searchParams: SearchParams
  guestDetails: GuestDetails
  nights: number
  totalAmount: number
}

interface GuestBookingResponse {
  paymentUrl?: string
  payment_url?: string
  booking_id?: string
  reference?: string
}

const getPaymentUrl = (payload: GuestBookingResponse | null) =>
  payload?.paymentUrl ?? payload?.payment_url

export const createGuestBooking = async (bookingData: GuestBookingPayload) => {
  const payload = bookingData
  const supabaseUrl = import.meta.env.VITE_SUPABASE_URL
  const supabase = getSupabaseClient()

  try {
    // Debug mode: verify JWT token will be included (for development only)
    if (import.meta.env.DEV) {
      const { data: sessionData, error: sessionError } = await supabase.auth.getSession()
      
      if (sessionError) {
        console.warn('Session retrieval warning:', sessionError)
      }
      
      // Log session state for debugging (guest users will have null session, using anon key)
      const userEmail = sessionData?.session?.user?.email
      console.log('Auth session status:', {
        hasSession: !!sessionData?.session,
        hasAccessToken: !!sessionData?.session?.access_token,
        userEmail: userEmail ? userEmail.substring(0, 3) + '***' : 'guest',
      })
    }
    
    console.log('Payload ready:', payload)
    const functionUrl = supabaseUrl
      ? new URL('/functions/v1/create-booking', supabaseUrl).toString()
      : null
    console.log(
      'Supabase function URL:',
      functionUrl ?? 'VITE_SUPABASE_URL manquante.'
    )
    
    // Supabase client automatically includes Authorization: Bearer <JWT> header
    // For logged-in users: uses session access_token
    // For guest users: uses anon key
    const response = await supabase.functions.invoke<GuestBookingResponse>(
      'create-booking',
      {
        body: payload,
      }
    )
    console.log('Raw create-booking response:', response)
    const { data, error } = response
    if (!data && !error) {
      console.error(
        'Supabase function returned null data without an error.',
        response
      )
    }

    if (error) {
      throw new Error(error?.message || 'Impossible de créer la réservation.')
    }

    const paymentUrl = getPaymentUrl(data ?? null)
    if (!paymentUrl) {
      throw new Error(
        "La réservation a été créée mais l'URL de paiement est manquante. Veuillez contacter le support."
      )
    }

    window.location.assign(paymentUrl)
  } catch (error) {
    console.error('Error in createBooking:', error)
    throw error
  }
}
