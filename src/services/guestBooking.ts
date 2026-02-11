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
import { getMyGoErrorMessage } from '@/services/inventorySync'
import { getUserFriendlyErrorMessage } from '@/lib/edgeFunctionErrors'
import type { SupabaseClient } from '@supabase/supabase-js'
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

const ensureSession = async (supabase: SupabaseClient) => {
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
  const supabase = getSupabaseClient()
  
  if (!supabase) {
    throw new Error('Service de réservation non disponible. Configuration manquante.')
  }

  // Transform searchParams to match backend contract
  const backendSearchParams = {
    cityId: bookingData.searchParams.cityId ? Number(bookingData.searchParams.cityId) : undefined,
    checkIn: bookingData.searchParams.checkIn,
    checkOut: bookingData.searchParams.checkOut,
    rooms: bookingData.searchParams.rooms,
    currency: bookingData.searchParams.currency || 'TND',
  }

  // Transform room to selectedOffer structure
  const selectedOffer = {
    hotelId: Number(bookingData.hotelId),
    roomId: Number(bookingData.room.id),
    boardingId: Number(bookingData.room.selectedBoarding || bookingData.room.boardingType),
  }

  // Transform guestDetails to customer structure
  const customer = {
    firstName: bookingData.guestDetails.firstName,
    lastName: bookingData.guestDetails.lastName,
    email: bookingData.guestDetails.email,
    phone: `${bookingData.guestDetails.countryCode}${bookingData.guestDetails.phone}`,
    nationality: bookingData.guestDetails.nationality,
  }

  const payload = {
    searchParams: backendSearchParams,
    selectedOffer,
    customer,
    specialRequests: bookingData.guestDetails.specialRequests,
    guest_whatsapp_number: bookingData.guestDetails.guestWhatsAppNumber,
    nights: bookingData.nights,
    totalAmount: bookingData.totalAmount,
  }

  const invokeCreateBooking = async (token: string) =>
    supabase.functions.invoke<GuestBookingResponse>('inventory-sync', {
      body: {
        action: 'booking',
        ...payload,
      },
      headers: {
        Authorization: `Bearer ${token}`,
      },
    })

  try {
    console.log('Payload ready:', payload)

    const accessToken = await ensureSession(supabase)
    let response = await invokeCreateBooking(accessToken)

    if (response.error && (response.error.status === 401 || response.error.status === 403)) {
      const retryToken = await ensureSession(supabase)
      response = await invokeCreateBooking(retryToken)
    }

    console.log('Raw booking response:', response)
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
      
      // Parse specific validation errors (400/422)
      if (error.status === 400 || error.status === 422) {
        const errorBody = typeof error.context === 'object' ? error.context : null
        const errorMessage = error.message || ''
        
        // Check for cityId validation errors
        if (errorMessage.includes('cityId') || errorMessage.includes('city') || errorMessage.includes('Invalid city')) {
          throw new Error('Sélection de ville invalide. Veuillez choisir une autre ville.')
        }
        
        // Check for room availability errors from MyGo
        if (errorMessage.includes('no longer available') || 
            errorMessage.includes('not available') || 
            errorMessage.includes('unavailable') ||
            errorMessage.includes('sold out')) {
          throw new Error('Cette chambre n\'est plus disponible. Veuillez sélectionner une autre chambre.')
        }
        
        // Check for price mismatch errors
        if (errorMessage.includes('price') || errorMessage.includes('amount')) {
          throw new Error('Le prix a changé. Veuillez vérifier les détails et réessayer.')
        }
        
        // Return the specific error message if available
        if (errorMessage && errorMessage.trim()) {
          throw new Error(errorMessage)
        }
      }
      
      // Use user-friendly error message for Edge Function errors
      throw new Error(getUserFriendlyErrorMessage(error, 'booking'))
    }

    const myGoError = getMyGoErrorMessage(data)
    if (myGoError) {
      throw new Error(myGoError)
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
