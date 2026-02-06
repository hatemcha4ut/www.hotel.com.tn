import { getSupabaseClient } from '@/lib/supabase'
import type { City, Hotel } from '@/types'

type InventorySyncPayload = Record<string, unknown>

interface InventorySyncCitiesResponse {
  cities?: City[]
}

interface InventorySyncHotelsResponse {
  hotels?: Hotel[]
}

export interface InventorySyncSearchResponse {
  hotels?: Hotel[]
  token?: string
}

export const getMyGoErrorMessage = (payload: unknown): string | null => {
  if (!payload || typeof payload !== 'object') {
    return null
  }

  const record = payload as Record<string, unknown>
  const errorPayload = record.error ?? record.Error ?? record.errors

  if (typeof errorPayload === 'string') {
    return errorPayload
  }

  if (errorPayload && typeof errorPayload === 'object') {
    const errorRecord = errorPayload as Record<string, unknown>
    const message = errorRecord.message ?? errorRecord.Message
    if (typeof message === 'string' && message.trim()) {
      return message
    }
  }

  const message = record.message ?? record.Message
  if (typeof message === 'string' && message.trim()) {
    return message
  }

  return null
}

const invokeInventorySync = async <T>(
  payload: InventorySyncPayload,
  headers?: Record<string, string>
) => {
  const supabase = getSupabaseClient()
  const { data, error } = await supabase.functions.invoke<T>('inventory-sync', {
    body: payload,
    headers,
  })

  if (error) {
    throw new Error(error.message || 'Inventory sync request failed.')
  }

  const myGoError = getMyGoErrorMessage(data)
  if (myGoError) {
    throw new Error(myGoError)
  }

  return data
}

export const fetchCities = async (): Promise<City[]> => {
  const data = await invokeInventorySync<InventorySyncCitiesResponse>({ action: 'cities' })
  const cities = data?.cities ?? []
  if (import.meta.env.DEV) {
    console.log(`[Inventory] cities loaded: ${cities.length}`)
  }
  return cities
}

export const fetchHotelsByCity = async (cityId: string): Promise<Hotel[]> => {
  const data = await invokeInventorySync<InventorySyncHotelsResponse>({
    action: 'hotels',
    cityId,
  })
  const hotels = data?.hotels ?? []
  if (import.meta.env.DEV) {
    console.log(`[Inventory] hotels loaded for city (id: ${cityId}): ${hotels.length}`)
  }
  return hotels
}

export const searchInventory = async (
  payload: InventorySyncPayload
): Promise<InventorySyncSearchResponse | null> => {
  const data = await invokeInventorySync<InventorySyncSearchResponse>({
    action: 'search',
    ...payload,
  })
  // Some backend responses use "Token" instead of "token".
  let tokenValue = data?.token
  if (!tokenValue && data && 'Token' in data) {
    const tokenCandidate = (data as { Token?: unknown }).Token
    if (typeof tokenCandidate === 'string') {
      tokenValue = tokenCandidate
    }
  }
  const normalizedData: InventorySyncSearchResponse | null = data
    ? {
        hotels: data.hotels ?? [],
        token: typeof tokenValue === 'string' ? tokenValue : undefined,
      }
    : null
  if (import.meta.env.DEV) {
    console.log(`[Inventory] token present in search: ${Boolean(tokenValue)}`)
  }
  return normalizedData
}

export const bookInventory = async <T>(
  payload: InventorySyncPayload,
  headers?: Record<string, string>
) =>
  invokeInventorySync<T>(
    {
      action: 'booking',
      ...payload,
    },
    headers
  )
