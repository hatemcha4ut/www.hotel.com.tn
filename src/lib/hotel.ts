import type { Hotel, MyGoHotel } from '@/types'

export const MYGO_BASE_URL = 'https://admin.mygo.co'

export const isMyGoHotel = (value: Hotel | MyGoHotel): value is MyGoHotel => {
  if ('type' in value && value.type) {
    return value.type === 'mygo'
  }
  return 'Name' in value
}

export const getMyGoHotelIdentifier = (hotel: MyGoHotel): string => {
  const fallback = [hotel.Name, hotel.Address, hotel.MinPrice]
    .filter((value) => value !== undefined && value !== null && value !== '')
    .map((value) => encodeURIComponent(String(value)))
    .join('-')
  return String(hotel.Id ?? fallback)
}
