import { Hotel, City, Room } from '@/types'
import { getApiBaseUrl, parseHttpError, getUserFriendlyErrorMessage } from '@/lib/edgeFunctionErrors'

// Note: API calls should go through Supabase Edge Functions for security
// Direct API calls with credentials are removed to prevent credential exposure

// Constants for hotel details
const HOTEL_TYPE = 'hotel'
const DEFAULT_CHECK_IN_TIME = '15:00'
const DEFAULT_CHECK_OUT_TIME = '12:00'

/**
 * MyGo hotel detail API response interface (flexible to handle various field name casing)
 */
interface MyGoHotelResponse {
  id?: string | number
  Id?: string | number
  hotelId?: string | number
  HotelId?: string | number
  name?: string
  Name?: string
  city?: string
  City?: string
  cityName?: string
  address?: string
  Address?: string
  stars?: number
  category?: number
  Category?: number
  rating?: number
  Rating?: number
  reviewCount?: number
  ReviewCount?: number
  description?: string
  Description?: string
  image?: string
  mainPhoto?: string
  MainPhoto?: string
  images?: unknown[]
  amenities?: unknown[]
  Amenities?: unknown[]
  boardingType?: unknown[]
  boardingTypes?: unknown[]
  price?: number
  minPrice?: number
  MinPrice?: number
  latitude?: number
  Latitude?: number
  longitude?: number
  Longitude?: number
  checkInTime?: string
  CheckInTime?: string
  checkOutTime?: string
  CheckOutTime?: string
  [key: string]: unknown // Allow additional fields
}

/**
 * Maps MyGo hotel detail response to frontend Hotel interface
 */
function mapMyGoHotelToFrontend(myGoHotel: MyGoHotelResponse): Hotel {
  const isValidNumber = (value: unknown): value is number =>
    typeof value === 'number' && Number.isFinite(value)
  
  const normalizeToNonEmptyString = (value: unknown) => {
    if (typeof value !== 'string') return undefined
    const trimmed = value.trim()
    return trimmed || undefined
  }

  // Extract hotel ID (could be in various fields)
  const hotelId = myGoHotel.id || myGoHotel.Id || myGoHotel.hotelId || myGoHotel.HotelId || '0'
  
  // Extract location information
  const city = normalizeToNonEmptyString(myGoHotel.city) || 
               normalizeToNonEmptyString(myGoHotel.City) || 
               normalizeToNonEmptyString(myGoHotel.cityName) || ''
  
  const address = normalizeToNonEmptyString(myGoHotel.address) || 
                  normalizeToNonEmptyString(myGoHotel.Address) || 
                  city
  
  // Extract name
  const name = normalizeToNonEmptyString(myGoHotel.name) || 
               normalizeToNonEmptyString(myGoHotel.Name) || 
               String(hotelId)
  
  // Extract images
  const mainImage = normalizeToNonEmptyString(myGoHotel.image) || 
                    normalizeToNonEmptyString(myGoHotel.mainPhoto) ||
                    normalizeToNonEmptyString(myGoHotel.MainPhoto) || ''
  
  const imagesArray = Array.isArray(myGoHotel.images)
    ? myGoHotel.images.filter((img: unknown) => Boolean(normalizeToNonEmptyString(img)))
    : []
  
  const images = imagesArray.length ? imagesArray : mainImage ? [mainImage] : []
  
  // Extract amenities
  const amenities = Array.isArray(myGoHotel.amenities)
    ? myGoHotel.amenities.filter((a: unknown) => Boolean(normalizeToNonEmptyString(a)))
    : Array.isArray(myGoHotel.Amenities)
    ? myGoHotel.Amenities.filter((a: unknown) => Boolean(normalizeToNonEmptyString(a)))
    : []
  
  // Extract boarding types
  const boardingType = Array.isArray(myGoHotel.boardingType)
    ? myGoHotel.boardingType.filter((b: unknown) => Boolean(normalizeToNonEmptyString(b)))
    : Array.isArray(myGoHotel.boardingTypes)
    ? myGoHotel.boardingTypes.filter((b: unknown) => Boolean(normalizeToNonEmptyString(b)))
    : []
  
  // Extract price
  const price = isValidNumber(myGoHotel.price) ? myGoHotel.price :
                isValidNumber(myGoHotel.minPrice) ? myGoHotel.minPrice :
                isValidNumber(myGoHotel.MinPrice) ? myGoHotel.MinPrice : 0
  
  return {
    type: HOTEL_TYPE,
    id: String(hotelId),
    name,
    city,
    address,
    stars: isValidNumber(myGoHotel.stars) ? myGoHotel.stars : 
           isValidNumber(myGoHotel.category) ? myGoHotel.category :
           isValidNumber(myGoHotel.Category) ? myGoHotel.Category : 0,
    rating: isValidNumber(myGoHotel.rating) ? myGoHotel.rating : 
            isValidNumber(myGoHotel.Rating) ? myGoHotel.Rating : 0,
    reviewCount: isValidNumber(myGoHotel.reviewCount) ? myGoHotel.reviewCount :
                 isValidNumber(myGoHotel.ReviewCount) ? myGoHotel.ReviewCount : 0,
    description: normalizeToNonEmptyString(myGoHotel.description) ||
                 normalizeToNonEmptyString(myGoHotel.Description) || '',
    image: mainImage,
    images,
    price,
    hasPrice: price > 0,
    amenities,
    boardingType,
    latitude: isValidNumber(myGoHotel.latitude) ? myGoHotel.latitude :
              isValidNumber(myGoHotel.Latitude) ? myGoHotel.Latitude : undefined,
    longitude: isValidNumber(myGoHotel.longitude) ? myGoHotel.longitude :
               isValidNumber(myGoHotel.Longitude) ? myGoHotel.Longitude : undefined,
    checkInTime: normalizeToNonEmptyString(myGoHotel.checkInTime) ||
                 normalizeToNonEmptyString(myGoHotel.CheckInTime) || DEFAULT_CHECK_IN_TIME,
    checkOutTime: normalizeToNonEmptyString(myGoHotel.checkOutTime) ||
                  normalizeToNonEmptyString(myGoHotel.CheckOutTime) || DEFAULT_CHECK_OUT_TIME,
  }
}

// Mock data removed - all data now comes from real API

export const api = {
  getCities: async (): Promise<City[]> => {
    console.warn('api.getCities() is deprecated. Use fetchCities() from cities hook instead.')
    return []
  },

  searchHotels: async (params: {
    cityId?: string
    hotelName?: string
    checkIn?: string
    checkOut?: string
  }): Promise<Hotel[]> => {
    console.warn('api.searchHotels() is deprecated. Use fetchSearchHotels() from searchHotels.ts instead.')
    return []
  },

  getHotelsWithPromotions: async (): Promise<Hotel[]> => {
    console.warn('api.getHotelsWithPromotions() is deprecated. No replacement available.')
    return []
  },

  getHotelDetails: async (hotelId: string): Promise<Hotel | null> => {
    try {
      // Validate hotelId is numeric
      const numericHotelId = Number(hotelId)
      if (!Number.isFinite(numericHotelId) || numericHotelId <= 0) {
        console.error(`Invalid hotel ID: ${hotelId}`)
        return null
      }

      const apiBaseUrl = getApiBaseUrl()
      const response = await fetch(`${apiBaseUrl}/hotels/detail`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ hotelId: numericHotelId }),
      })

      if (!response.ok) {
        if (response.status === 404) {
          console.error(`Hotel ${hotelId} not found`)
          return null
        }
        const errorMessage = await parseHttpError(response)
        throw new Error(errorMessage)
      }

      const data = await response.json()
      
      if (!data) {
        return null
      }

      return mapMyGoHotelToFrontend(data)
    } catch (err) {
      console.error('Error fetching hotel details:', err)
      throw new Error(getUserFriendlyErrorMessage(err, 'hotel-details'))
    }
  },

 copilot/resolve-merge-conflicts
  getAvailableRooms: async (hotelId: string, roomCount?: number): Promise<Room[]> => {
    console.warn('api.getAvailableRooms() is deprecated. Room data should come from inventory search.')

 copilot/fix-frontend-issues
  getAvailableRooms: async (hotelId: string, roomCount?: number): Promise<Room[]> => {
    console.warn('api.getAvailableRooms() is deprecated. Room data should come from inventory search.')

    try {
      // Validate hotelId is numeric and positive
      const numericHotelId = Number(hotelId)
      if (!Number.isFinite(numericHotelId) || numericHotelId <= 0) {
        console.error(`Invalid hotel ID for getAvailableRooms: ${hotelId}`)
        return []
      }

      const apiBaseUrl = getApiBaseUrl()

      const payload: { hotelId: number; roomCount?: number } = {
        hotelId: numericHotelId,
      }

      if (roomCount !== undefined) {
        const numericRoomCount = Number(roomCount)
        if (Number.isFinite(numericRoomCount) && numericRoomCount > 0) {
          payload.roomCount = numericRoomCount
        } else {
          console.warn(`Ignoring invalid roomCount for getAvailableRooms: ${roomCount}`)
        }
      }

      const response = await fetch(`${apiBaseUrl}/inventory/search`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload),
      })

      if (!response.ok) {
        if (response.status === 404) {
          console.error(`No rooms found for hotel ${hotelId}`)
          return []
        }
        const errorMessage = await parseHttpError(response)
        throw new Error(errorMessage)
      }

      const data = await response.json()

      if (!data) {
        return []
      }

      // Accept both a plain array of rooms, or an object with a `rooms` array
      if (Array.isArray(data)) {
        return data as Room[]
      }

      if (Array.isArray((data as any).rooms)) {
        return (data as any).rooms as Room[]
      }

      console.error('Unexpected response format for getAvailableRooms:', data)
      return []
    } catch (err) {
      console.error('Error fetching available rooms:', err)
      throw new Error(getUserFriendlyErrorMessage(err, 'available-rooms'))
    }

  getAvailableRooms: async (hotelId: string): Promise<Room[]> => {
    // TODO: This should also call backend API in future
    // For now, return empty array - rooms are in search results
 main
    return []
 main
  },

  createBooking: async (bookingData: any): Promise<{ reference: string }> => {
    await new Promise(resolve => setTimeout(resolve, 800))
    const reference = 'TN' + Date.now().toString().slice(-8)
    return { reference }
  },
}
