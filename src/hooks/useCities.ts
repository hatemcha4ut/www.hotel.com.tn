import { useCallback, useEffect, useState } from 'react'
import { fetchCities } from '@/services/inventorySync'
import { tunisianCities } from '@/constants/cities'
import type { City } from '@/types'

// Module-level cache so data survives re-mounts
let cachedCities: City[] | null = null
let fetchPromise: Promise<City[]> | null = null

export function useCities() {
  const [cities, setCities] = useState<City[]>(cachedCities ?? [])
  const [isLoading, setIsLoading] = useState(!cachedCities)
  const [error, setError] = useState<Error | null>(null)

  const load = useCallback(async (force = false) => {
    if (cachedCities && !force) {
      setCities(cachedCities)
      setIsLoading(false)
      return
    }
    setIsLoading(true)
    setError(null)
    try {
      // Deduplicate concurrent fetches
      if (!fetchPromise || force) {
        fetchPromise = fetchCities()
      }
      const results = await fetchPromise
      cachedCities = results
      fetchPromise = null
      setCities(results)
    } catch (err) {
      setError(err instanceof Error ? err : new Error('Failed to load cities'))
      fetchPromise = null
      // Fallback to static tunisianCities from constants
      setCities(tunisianCities)
    } finally {
      setIsLoading(false)
    }
  }, [])

  useEffect(() => {
    load()
  }, [load])

  return { cities, isLoading, error, retry: () => load(true) }
}
