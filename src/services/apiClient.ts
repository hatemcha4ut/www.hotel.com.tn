import { api } from '@/lib/api'
import type { Hotel } from '@/types'

export interface SearchHotelsParams {
  cityId?: string
  hotelName?: string
  checkIn?: string
  checkOut?: string
}

export const apiClient = {
  searchHotels: (params: SearchHotelsParams): Promise<Hotel[]> => api.searchHotels(params),
}
