import { getSupabaseClient } from '@/lib/supabase'
import type { City, Hotel, PrebookResponse, CheckoutInitiateResponse } from '@/types'

type InventorySyncPayload = Record<string, unknown>

interface InventorySyncCitiesResponse {
  cities?: City[]
}

interface PublicCitiesApiResponse {
  items: City[]
  source?: string
  cached?: boolean
  fetchedAt?: string
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

const invokeInventorySyncAction = async <T>(
  payload: InventorySyncPayload,
  headers?: Record<string, string>
) => {
  const supabase = getSupabaseClient()
  if (!supabase) {
    throw new Error('Service non disponible. Configuration manquante.')
  }
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
 copilot/implement-cities-loading-option-a
  const PUBLIC_API_ENDPOINT = 'https://api.hotel.com.tn/static/cities'
  
  try {
    // Use public API endpoint instead of Supabase edge function
    const response = await fetch(PUBLIC_API_ENDPOINT, {
      method: 'GET',
      headers: {
        'Accept': 'application/json',
      },
    })

    if (!response.ok) {
      // Localized, user-friendly error message instead of a technical HTTP status string
      throw new Error('Le service de recherche de villes est momentanément indisponible. Veuillez réessayer plus tard.')
    }

    const rawData: unknown = await response.json()

    if (!rawData || typeof rawData !== 'object') {
      throw new Error('Invalid cities payload: response is not an object')
    }

    const data = rawData as Partial<PublicCitiesApiResponse> & Record<string, unknown>
    const items = (data as Record<string, unknown>).items

    if (!Array.isArray(items)) {
      throw new Error('Invalid cities payload: "items" is not an array')
    }

    if (!items.every((item) => item && typeof item === 'object')) {
      throw new Error('Invalid cities payload: "items" must contain objects')
    }

    const cities = items as City[]
    
    if (import.meta.env.DEV) {
      console.log(`[Inventory] cities loaded: ${cities.length}`, {
        source: data.source,
        cached: data.cached,
        fetchedAt: data.fetchedAt,
        etag: response.headers.get('ETag'),
        cacheControl: response.headers.get('Cache-Control'),
      })
    }
    
    return cities
  } catch (error) {
    if (import.meta.env.DEV) {
      console.error('[Inventory] Failed to fetch cities from public API:', {
        error: error instanceof Error ? error.message : error,
        endpoint: PUBLIC_API_ENDPOINT,
        timestamp: new Date().toISOString(),
      })
    }
    
    // Fallback: try Supabase edge function for backward compatibility
    try {
      const data = await invokeInventorySyncAction<InventorySyncCitiesResponse>({ action: 'cities' })
      const cities = data?.cities ?? []
      if (import.meta.env.DEV) {
        console.log(`[Inventory] cities loaded from fallback: ${cities.length}`)
      }
      return cities
    } catch (fallbackError) {
      if (import.meta.env.DEV) {
        console.error('[Inventory] Fallback also failed:', fallbackError)
      }
      // Re-throw the original error to trigger fallback to static cities
      throw error
    }

  try {
    const data = await invokeInventorySyncAction<InventorySyncCitiesResponse>({ action: 'cities' })
    const cities = data?.cities ?? []
    if (import.meta.env.DEV) {
      console.log(`[Inventory] cities loaded: ${cities.length}`)
    }
    return cities
  } catch (error) {
    if (import.meta.env.DEV) {
      console.error('[Inventory] Failed to fetch cities:', {
        message: error instanceof Error ? error.message : String(error),
        error,
        timestamp: new Date().toISOString(),
        hint: 'Check that VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY are set correctly',
      })
    }
    throw error
 main
  }
}

export const fetchHotelsByCity = async (cityId: string): Promise<Hotel[]> => {
  const data = await invokeInventorySyncAction<InventorySyncHotelsResponse>({
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
  const data = await invokeInventorySyncAction<InventorySyncSearchResponse>({
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
  invokeInventorySyncAction<T>(
    {
      ...payload,
      action: 'booking',
    },
    headers
  )

export const prebookRoom = async (
  payload: InventorySyncPayload
): Promise<PrebookResponse> => {
  try {
    const data = await invokeInventorySyncAction<PrebookResponse>({
      action: 'prebook',
      ...payload,
    })
    
    if (data && typeof data === 'object') {
      return data
    }
    
    return {
      success: false,
      confirmedPrice: 0,
      cancellationPolicy: '',
      error: 'Prebook response missing required fields or has unexpected format',
    }
  } catch (error) {
    console.error('[Inventory] Prebook error:', error)
    return {
      success: false,
      confirmedPrice: 0,
      cancellationPolicy: '',
      error: error instanceof Error ? error.message : 'Prebook failed',
    }
  }
}

export const initiateCheckout = async (
  payload: InventorySyncPayload
): Promise<CheckoutInitiateResponse> => {
  try {
    const data = await invokeInventorySyncAction<CheckoutInitiateResponse>({
      action: 'checkout-initiate',
      ...payload,
    })
    
    if (data && typeof data === 'object') {
      return data
    }
    
    return {
      blocked: false,
      reason: 'Checkout response missing required fields or has unexpected format',
    }
  } catch (error) {
    console.error('[Inventory] Checkout initiate error:', error)
    return {
      blocked: true,
      reason: error instanceof Error ? error.message : 'Checkout initiation failed',
    }
  }
}
