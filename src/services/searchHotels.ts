import { format } from 'date-fns'
import { getSupabaseClient } from '@/lib/supabase'
import type { Hotel, RoomGuests, SearchParams } from '@/types'

type CurrencyCode = 'TND' | 'EUR' | 'USD'

export interface SearchRoomRequest {
  adults: number
  childrenAges?: number[]
}

export interface SearchRequest {
  cityId: number
  checkIn: string
  checkOut: string
  rooms: SearchRoomRequest[]
  currency?: CurrencyCode
}

export interface SearchHotelRoom {
  price?: number
  onRequest?: boolean
  [key: string]: unknown
}

export interface SearchHotel {
  id: number
  name: string
  available?: boolean
  rooms: SearchHotelRoom[]
  [key: string]: unknown
}

export interface SearchResponse {
  rawCount?: number
  visibleCount?: number
  hotels: SearchHotel[]
}

export interface SearchHotelsResult {
  hotels: Hotel[]
  rawCount?: number
  visibleCount?: number
}

const normalizeToNonEmptyString = (value: unknown) => {
  if (typeof value !== 'string') {
    return undefined
  }
  const trimmed = value.trim()
  return trimmed || undefined
}

const extractLocation = (hotel: SearchHotel) => {
  const candidates = [
    normalizeToNonEmptyString((hotel as { region?: unknown }).region),
    normalizeToNonEmptyString((hotel as { city?: unknown }).city),
    normalizeToNonEmptyString((hotel as { cityName?: unknown }).cityName),
    normalizeToNonEmptyString((hotel as { location?: { city?: unknown } }).location?.city),
    normalizeToNonEmptyString((hotel as { location?: { region?: unknown } }).location?.region),
  ]
  return candidates.find((value): value is string => Boolean(value))
}

const isValidNumber = (value: unknown): value is number =>
  typeof value === 'number' && Number.isFinite(value)

const normalizeHotelRooms = (rooms: SearchHotelRoom[] | undefined) =>
  Array.isArray(rooms) ? rooms : []

export const buildSearchRequest = (params: SearchParams): SearchRequest => {
  if (!params.cityId) {
    throw new Error('Veuillez sélectionner une ville.')
  }
  const cityId = Number(params.cityId)
  if (!Number.isFinite(cityId) || cityId < 1) {
    throw new Error('Ville invalide. Veuillez sélectionner une ville valide.')
  }
  if (!params.checkIn || !params.checkOut) {
    throw new Error('Veuillez sélectionner des dates de séjour.')
  }
  const rooms = params.rooms.map((room: RoomGuests) => {
    const childrenAges = room.children.length ? room.children : undefined
    return childrenAges ? { adults: room.adults, childrenAges } : { adults: room.adults }
  })
  return {
    cityId,
    checkIn: format(params.checkIn, 'yyyy-MM-dd'),
    checkOut: format(params.checkOut, 'yyyy-MM-dd'),
    rooms,
  }
}

export const mapSearchHotelsToList = (hotels: SearchHotel[]): Hotel[] =>
  hotels.map((hotel) => {
    const rooms = normalizeHotelRooms(hotel.rooms)
    const prices = rooms.map((room) => room.price).filter(isValidNumber)
    const minPrice = prices.length ? Math.min(...prices) : undefined
    const onRequestOnly = rooms.length > 0 && rooms.every((room) => room.onRequest === true)
    const location = extractLocation(hotel)
    const images = Array.isArray(hotel.images)
      ? hotel.images.filter((image: unknown): image is string =>
          Boolean(normalizeToNonEmptyString(image))
        )
      : []
    const image = normalizeToNonEmptyString((hotel as { image?: unknown }).image) ?? images[0] ?? ''
    const amenities = Array.isArray(hotel.amenities)
      ? hotel.amenities.filter((amenity: unknown): amenity is string =>
          Boolean(normalizeToNonEmptyString(amenity))
        )
      : []
    const boardingType = Array.isArray(hotel.boardingType)
      ? hotel.boardingType.filter((boarding: unknown): boarding is string =>
          Boolean(normalizeToNonEmptyString(boarding))
        )
      : []
    return {
      type: 'hotel',
      id: String(hotel.id),
      name: normalizeToNonEmptyString(hotel.name) ?? String(hotel.id),
      city: location ?? '',
      address: location ?? '',
      stars: isValidNumber(hotel.stars) ? hotel.stars : 0,
      rating: isValidNumber(hotel.rating) ? hotel.rating : 0,
      reviewCount: isValidNumber(hotel.reviewCount) ? hotel.reviewCount : 0,
      description: normalizeToNonEmptyString(hotel.description) ?? '',
      image,
      images: images.length ? images : image ? [image] : [],
      price: minPrice ?? 0,
      amenities,
      boardingType,
      onRequestOnly,
      hasPrice: minPrice !== undefined,
    }
  })

export const fetchSearchHotels = async (params: SearchRequest): Promise<SearchResponse> => {
  // Primary: Try Supabase Edge Function
  try {
    const supabase = getSupabaseClient()
    if (supabase) {
      const { data, error } = await supabase.functions.invoke<SearchResponse>('search-hotels', {
        body: params,
      })
      
      if (!error && data && Array.isArray(data.hotels)) {
        return data
      }
      
      // Log error but don't throw - we'll try fallback
      if (error) {
        console.warn('Supabase search failed, trying fallback:', error)
      }
    }
  } catch (err) {
    console.warn('Supabase search failed, trying fallback:', err)
  }
  
  // Fallback: Direct call to Cloudflare Worker
  try {
    const response = await fetch('https://api.hotel.com.tn/hotels/search', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(params),
    })
    
    if (!response.ok) {
      const errorText = await response.text()
      
      // Handle specific error status codes
      if (response.status === 400) {
        // Parse validation errors
        try {
          const errorData = JSON.parse(errorText)
          const errorMessage = errorData.message || errorData.error || 'Paramètres de recherche invalides'
          
          // Check for specific validation errors using more precise patterns
          const lowerMessage = errorMessage.toLowerCase()
          if (lowerMessage.includes('cityid') || lowerMessage.includes('city id') || 
              lowerMessage.includes('invalid city') || lowerMessage.includes('ville invalide')) {
            throw new Error('Ville invalide. Veuillez sélectionner une ville valide.')
          }
          if (lowerMessage.includes('checkin') || lowerMessage.includes('checkout') || 
              lowerMessage.includes('check-in') || lowerMessage.includes('check-out') ||
              lowerMessage.includes('invalid date') || lowerMessage.includes('date invalide')) {
            throw new Error('Dates invalides. Veuillez vérifier vos dates de séjour.')
          }
          throw new Error(errorMessage)
        } catch (parseError) {
          throw new Error('Paramètres de recherche invalides. Veuillez vérifier vos critères.')
        }
      }
      
      if (response.status >= 500) {
        throw new Error('Service temporairement indisponible. Veuillez réessayer dans quelques instants.')
      }
      
      throw new Error(`Erreur de recherche: ${response.status} ${errorText}`)
    }
    
    const data = await response.json()
    
    if (!data || !Array.isArray(data.hotels)) {
      throw new Error('Réponse de recherche invalide.')
    }
    
    return data
  } catch (err) {
    // If it's already a formatted error, rethrow it
    if (err instanceof Error) {
      throw err
    }
    throw new Error('Erreur de connexion au service de recherche.')
  }
}
