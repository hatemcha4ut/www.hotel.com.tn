import type { Hotel, MyGoHotel } from '@/types'

export const MYGO_BASE_URL = 'https://admin.mygo.co'
export const HOTEL_FALLBACK_IMAGE =
  'https://images.unsplash.com/photo-1566073771259-6a8506099945?w=800&h=600&fit=crop'
const FALLBACK_IDENTIFIER_FIELDS: Array<keyof MyGoHotel> = ['Name', 'Address', 'MinPrice']

export const isMyGoHotel = (value: Hotel | MyGoHotel): value is MyGoHotel => {
  if ('type' in value && value.type) {
    return value.type === 'mygo'
  }
  return 'Name' in value
}

export const getMyGoHotelIdentifier = (hotel: MyGoHotel): string => {
  const fallback = FALLBACK_IDENTIFIER_FIELDS.map((field) => hotel[field])
    .filter((value) => value !== undefined && value !== null && value !== '')
    .map((value) => encodeURIComponent(String(value)))
    .join('-')
  return String(hotel.id ?? hotel.Id ?? fallback)
}
