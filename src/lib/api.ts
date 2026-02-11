import { Hotel, City, Room } from '@/types'
import { getApiBaseUrl, parseHttpError, getUserFriendlyErrorMessage } from '@/lib/edgeFunctionErrors'

// Note: API calls should go through Supabase Edge Functions for security
// Direct API calls with credentials are removed to prevent credential exposure

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
    type: 'hotel',
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
                 normalizeToNonEmptyString(myGoHotel.CheckInTime) || '15:00',
    checkOutTime: normalizeToNonEmptyString(myGoHotel.checkOutTime) ||
                  normalizeToNonEmptyString(myGoHotel.CheckOutTime) || '12:00',
  }
}

const mockCities: City[] = [
  { id: '1', name: 'Tunis', country: 'Tunisia' },
  { id: '2', name: 'Sousse', country: 'Tunisia' },
  { id: '3', name: 'Hammamet', country: 'Tunisia' },
  { id: '4', name: 'Djerba', country: 'Tunisia' },
  { id: '5', name: 'Monastir', country: 'Tunisia' },
  { id: '6', name: 'Mahdia', country: 'Tunisia' },
  { id: '7', name: 'Tozeur', country: 'Tunisia' },
  { id: '8', name: 'Sfax', country: 'Tunisia' },
]

const mockRooms: Room[] = [
  {
    id: 'r1',
    name: 'Chambre Standard Double',
    bedConfig: '1 lit double',
    maxOccupancy: 2,
    size: 28,
    boardingType: 'Petit-déjeuner',
    boardingOptions: [
      { type: 'Logement seul', pricePerNight: 100, totalPrice: 300 },
      { type: 'Petit-déjeuner', pricePerNight: 120, totalPrice: 360 },
      { type: 'Demi-pension', pricePerNight: 150, totalPrice: 450 },
      { type: 'Pension complète', pricePerNight: 180, totalPrice: 540 },
      { type: 'All Inclusive', pricePerNight: 220, totalPrice: 660 },
    ],
    amenities: ['WiFi', 'Climatisation', 'TV', 'Minibar', 'Coffre-fort'],
    cancellationPolicy: 'Annulation gratuite jusqu\'à 7 jours avant l\'arrivée',
    pricePerNight: 120,
    totalPrice: 360,
    image: 'https://images.unsplash.com/photo-1611892440504-42a792e24d32?w=400&h=300&fit=crop',
  },
  {
    id: 'r2',
    name: 'Chambre Supérieure Vue Mer',
    bedConfig: '1 lit double ou 2 lits simples',
    maxOccupancy: 3,
    size: 35,
    boardingType: 'Demi-pension',
    boardingOptions: [
      { type: 'Logement seul', pricePerNight: 150, totalPrice: 450 },
      { type: 'Petit-déjeuner', pricePerNight: 180, totalPrice: 540 },
      { type: 'Demi-pension', pricePerNight: 220, totalPrice: 660 },
      { type: 'Pension complète', pricePerNight: 260, totalPrice: 780 },
      { type: 'All Inclusive', pricePerNight: 320, totalPrice: 960 },
    ],
    amenities: ['WiFi', 'Climatisation', 'TV', 'Minibar', 'Coffre-fort', 'Balcon', 'Vue mer'],
    cancellationPolicy: 'Annulation gratuite jusqu\'à 7 jours avant l\'arrivée',
    pricePerNight: 180,
    totalPrice: 540,
    image: 'https://images.unsplash.com/photo-1598928506311-c55ded91a20c?w=400&h=300&fit=crop',
  },
  {
    id: 'r3',
    name: 'Suite Junior',
    bedConfig: '1 lit king size',
    maxOccupancy: 4,
    size: 45,
    boardingType: 'All Inclusive',
    boardingOptions: [
      { type: 'Logement seul', pricePerNight: 230, totalPrice: 690 },
      { type: 'Petit-déjeuner', pricePerNight: 260, totalPrice: 780 },
      { type: 'Demi-pension', pricePerNight: 300, totalPrice: 900 },
      { type: 'Pension complète', pricePerNight: 350, totalPrice: 1050 },
      { type: 'All Inclusive', pricePerNight: 420, totalPrice: 1260 },
    ],
    amenities: ['WiFi', 'Climatisation', 'TV', 'Minibar', 'Coffre-fort', 'Balcon', 'Vue mer', 'Salon', 'Baignoire'],
    cancellationPolicy: 'Annulation gratuite jusqu\'à 14 jours avant l\'arrivée',
    pricePerNight: 280,
    totalPrice: 840,
    image: 'https://images.unsplash.com/photo-1590490360182-c33d57733427?w=400&h=300&fit=crop',
  },
]

export const api = {
  getCities: async (): Promise<City[]> => {
    await new Promise(resolve => setTimeout(resolve, 300))
    return mockCities
  },

  searchHotels: async (params: {
    cityId?: string
    hotelName?: string
    checkIn?: string
    checkOut?: string
  }): Promise<Hotel[]> => {
    // This legacy function is deprecated in favor of fetchSearchHotels in searchHotels.ts
    // Return empty array as popular hotels should come from backend API
    console.warn('api.searchHotels is deprecated. Popular hotels feature requires backend API implementation.')
    return []
  },

  getHotelsWithPromotions: async (): Promise<Hotel[]> => {
    // This legacy function is deprecated
    // Promotions should come from backend API
    console.warn('api.getHotelsWithPromotions is deprecated. Promotions feature requires backend API implementation.')
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

  getAvailableRooms: async (hotelId: string, roomCount?: number): Promise<Room[]> => {
    await new Promise(resolve => setTimeout(resolve, 400))
    return mockRooms
  },

  createBooking: async (bookingData: any): Promise<{ reference: string }> => {
    await new Promise(resolve => setTimeout(resolve, 800))
    const reference = 'TN' + Date.now().toString().slice(-8)
    return { reference }
  },
}
