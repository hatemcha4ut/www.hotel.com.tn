import { useCallback, useEffect, useState } from 'react'
import { fetchCities } from '@/services/inventorySync'
import { tunisianCities } from '@/constants/cities'
import type { City } from '@/types'
import { getUserFriendlyErrorMessage } from '@/lib/edgeFunctionErrors'

// Module-level cache so data survives re-mounts
let cachedCities: City[] | null = null
let fetchPromise: Promise<City[]> | null = null

const RETRY_ATTEMPTS = 3
const BASE_RETRY_DELAY_MS = 1000

/**
 * Utility to fetch cities with automatic retry and exponential backoff.
 * @param attempt Current attempt number (1-indexed)
 */
async function fetchCitiesWithRetry(attempt = 1): Promise<City[]> {
  try {
    return await fetchCities()
  } catch (err) {
    if (attempt < RETRY_ATTEMPTS) {
      const delay = BASE_RETRY_DELAY_MS * Math.pow(2, attempt - 1)
      if (import.meta.env.DEV) {
        console.log(`[useCities] Retry attempt ${attempt}/${RETRY_ATTEMPTS} after ${delay}ms`)
      }
      await new Promise((resolve) => setTimeout(resolve, delay))
      return fetchCitiesWithRetry(attempt + 1)
    }
    throw err
  }
}

export interface UseCitiesResult {
  cities: City[]
  isLoading: boolean
  error: Error | null
  retry: () => void
  usingFallback: boolean
}

export function useCities(): UseCitiesResult {
  const [cities, setCities] = useState<City[]>(cachedCities ?? [])
  const [isLoading, setIsLoading] = useState(!cachedCities)
  const [error, setError] = useState<Error | null>(null)
  const [usingFallback, setUsingFallback] = useState(false)

  const load = useCallback(async (force = false) => {
    if (cachedCities && !force) {
      setCities(cachedCities)
      setIsLoading(false)
      setUsingFallback(false)
      return
    }
    setIsLoading(true)
    setError(null)
    setUsingFallback(false)
    try {
      // Deduplicate concurrent fetches
      if (!fetchPromise || force) {
        fetchPromise = fetchCitiesWithRetry()
      }
      const results = await fetchPromise
      cachedCities = results
      fetchPromise = null
      setCities(results)
      setUsingFallback(false)
    } catch (err) {
      const errorMessage = getUserFriendlyErrorMessage(err, 'cities')
      setError(new Error(errorMessage))
      fetchPromise = null
      // Fallback to static tunisianCities from constants
      setCities(tunisianCities)
      setUsingFallback(true)
      if (import.meta.env.DEV) {
        console.warn('[useCities] Failed to fetch cities after retries, using fallback:', err)
      }
    } finally {
      setIsLoading(false)
    }
  }, [])

  useEffect(() => {
    load()
  }, [load])

  return { cities, isLoading, error, retry: () => load(true), usingFallback }
}
