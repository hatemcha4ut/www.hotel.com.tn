import { getSupabaseClient } from '@/lib/supabase'
import type { GuestDetails, Hotel, Room, SearchParams } from '@/types'

export interface GuestBookingPayload {
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

export const createGuestBooking = async (payload: GuestBookingPayload) => {
  const supabase = getSupabaseClient()
  const { data, error } = await supabase.functions.invoke<GuestBookingResponse>('create-booking', {
    body: payload,
  })

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
}
