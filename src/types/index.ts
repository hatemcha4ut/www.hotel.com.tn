export interface Hotel {
  type?: 'hotel'
  id: string
  name: string
  city: string
  address: string
  stars: number
  rating: number
  reviewCount: number
  description: string
  image: string
  images: string[]
  price: number
  hasPrice?: boolean
  onRequestOnly?: boolean
  amenities: string[]
  boardingType: string[]
  latitude?: number
  longitude?: number
  checkInTime?: string
  checkOutTime?: string
  promotion?: {
    discount: number
    label: string
    validUntil: string
    originalPrice: number
  }
}

export interface MyGoHotel {
  type?: 'mygo'
  id?: string | number
  Id?: string | number
  Name: string
  Category: number
  Address: string
  MainPhoto: string
  MinPrice: number
}

export interface City {
  id: string
  name: string
  region?: string
  country?: string
}

export interface RoomGuests {
  adults: number
  children: number[]
  boardingType?: string
}

export interface SearchParams {
  searchMode: 'city' | 'hotel'
  cityId?: string
  hotelName?: string
  checkIn: Date | null
  checkOut: Date | null
  rooms: RoomGuests[]
  currency?: string
}

export interface Room {
  id: string
  name: string
  bedConfig: string
  maxOccupancy: number
  size: number
  boardingType: string
  boardingOptions?: { type: string; pricePerNight: number; totalPrice: number }[]
  amenities: string[]
  cancellationPolicy: string
  cancellationDeadline?: string  // ISO date
  pricePerNight: number
  totalPrice: number
  image: string
  selectedBoarding?: string
  roomIndex?: number
}

export interface SelectedOffer {
  hotelId: number
  roomId: number
  boardingId: number
  views?: number[]
  supplements?: number[]
}

export interface GuestDetails {
  firstName: string
  lastName: string
  email: string
  phone: string
  countryCode: string
  nationality: string
  specialRequests?: string
  bookingForOther?: boolean
  guestFirstName?: string
  guestLastName?: string
  guestWhatsAppNumber?: string
  whatsappConsent?: boolean
}

export interface Booking {
  id: string
  reference: string
  hotel: Hotel
  room: Room
  checkIn: string
  checkOut: string
  guests: GuestDetails
  totalPrice: number
  status: 'confirmed' | 'pending' | 'cancelled'
  myGoState?: 'OnRequest' | 'Validated' | 'Cancelled'
  paymentStatus?: 'preauth' | 'captured' | 'reversed' | 'failed' | 'pending'
  createdAt: string
}

/**
 * Legacy User interface - consider using AuthUser from @/lib/auth instead
 * Token field removed as JWT tokens are now managed by Supabase auth
 */
export interface User {
  id: string
  name: string
  email: string
  phone: string
}

export interface FilterOptions {
  priceRange: [number, number]
  stars: number[]
  boardingTypes: string[]
  amenities: string[]
  maxDistance: number
}

export type SortOption = 'price-asc' | 'price-desc' | 'stars' | 'rating' | 'distance'
export type Language = 'fr' | 'en' | 'ar'

export interface BookingListItem {
  id: string
  date: string
  client: string
  hotel: string
  amount: string
  status: string
}

export interface PrebookResponse {
  success: boolean
  confirmedPrice: number
  cancellationPolicy: string
  cancellationDeadline?: string
  notRefundable?: boolean
  error?: string
}

export interface CheckoutInitiateResponse {
  blocked: boolean
  reason?: string
  formUrl?: string
  preauth?: boolean
  bookingId?: string
  orderId?: string
}
