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

const ensureSession = async (supabase: ReturnType<typeof getSupabaseClient>) => {
  const { data: sessionData, error: sessionError } = await supabase.auth.getSession()

  if (sessionError) {
    console.warn('Session retrieval warning:', sessionError)
  }

  const existingToken = sessionData?.session?.access_token
  if (existingToken) {
    return existingToken
  }

  const { data: anonData, error: anonError } = await supabase.auth.signInAnonymously()
  if (anonError) {
    throw new Error('Impossible de démarrer une session invité. Veuillez réessayer.')
  }

  const anonToken = anonData?.session?.access_token
  if (anonToken) {
    return anonToken
  }

  const { data: retrySession } = await supabase.auth.getSession()
  const retryToken = retrySession?.session?.access_token
  if (retryToken) {
    return retryToken
  }

  throw new Error('Jeton de session introuvable. Veuillez réessayer.')
}

export const createGuestBooking = async (bookingData: GuestBookingPayload) => {
  const supabaseUrl = import.meta.env.VITE_SUPABASE_URL
  const supabase = getSupabaseClient()

  const payload = {
    hotelId: bookingData.hotelId,
    hotel: bookingData.hotel,
    rooms: bookingData.rooms,
    selectedOffer: bookingData.room,
    searchParams: bookingData.searchParams,
    guest: bookingData.guestDetails,
    contact: {
      email: bookingData.guestDetails.email,
      phone: `${bookingData.guestDetails.countryCode}${bookingData.guestDetails.phone}`,
    },
    nights: bookingData.nights,
    totalAmount: bookingData.totalAmount,
  }

  const invokeCreateBooking = async (token: string) =>
    supabase.functions.invoke<GuestBookingResponse>('create-booking', {
      body: payload,
      headers: {
        Authorization: `Bearer ${token}`,
      },
    })

  try {
    console.log('Payload ready:', payload)
    const functionUrl = supabaseUrl
      ? new URL('/functions/v1/create-booking', supabaseUrl).toString()
      : null
    console.log(
      'Supabase function URL:',
      functionUrl ?? 'VITE_SUPABASE_URL manquante.'
    )

    const accessToken = await ensureSession(supabase)
    let response = await invokeCreateBooking(accessToken)

    if (response.error && (response.error.status === 401 || response.error.status === 403)) {
      const retryToken = await ensureSession(supabase)
      response = await invokeCreateBooking(retryToken)
    }

    console.log('Raw create-booking response:', response)
    const { data, error } = response
    if (!data && !error) {
      console.error(
        'Supabase function returned null data without an error.',
        response
      )
    }

    if (error) {
      if (error.status === 401 || error.status === 403) {
        throw new Error('Session expirée. Veuillez vous reconnecter et réessayer.')
      }
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