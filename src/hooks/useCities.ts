import { useCallback, useEffect, useState } from 'react'
import { getSupabaseClient } from '@/lib/supabase'
import type { City } from '@/types'

interface InventoryCity {
  Id?: string | number | null
  Name?: string | null
  Region?: string | null
  Country?: {
    Name?: string | null
  } | null
}

interface InventorySyncResponse {
  success?: boolean
  data?: {
    cities?: InventoryCity[]
  }
}

const normalizeLabelValue = (value?: string | null) => {
  const normalized = value?.trim().replace(/\s+/g, ' ')
  return normalized ? normalized : undefined
}

const mapCity = (city: InventoryCity): City | null => {
  const name = normalizeLabelValue(city.Name)
  if (!name) {
    return null
  }
  const fallbackId = [
    name,
    normalizeLabelValue(city.Region),
    normalizeLabelValue(city.Country?.Name),
  ]
    .filter(Boolean)
    .join('::')

  return {
    id: city.Id !== null && city.Id !== undefined ? String(city.Id) : fallbackId,
    name,
    region: normalizeLabelValue(city.Region),
    country: normalizeLabelValue(city.Country?.Name),
  }
}

const sortCities = (cities: City[]) =>
  [...cities].sort((first, second) => {
    const firstPrimary = first.name.toLowerCase()
    const secondPrimary = second.name.toLowerCase()
    if (firstPrimary !== secondPrimary) {
      return firstPrimary.localeCompare(secondPrimary)
    }
    const firstSecondary = (first.region || '').toLowerCase()
    const secondSecondary = (second.region || '').toLowerCase()
    return firstSecondary.localeCompare(secondSecondary)
  })

export function useCities() {
  const [cities, setCities] = useState<City[] | undefined>(undefined)
  const [error, setError] = useState<Error | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  const refreshCities = useCallback(async () => {
    setIsLoading(true)
    setError(null)

    try {
      const supabase = getSupabaseClient()
      const { data, error: fetchError } = await supabase.functions.invoke<InventorySyncResponse>(
        'inventory-sync',
        {
          body: { action: 'cities' },
          method: 'POST',
        }
      )

      if (fetchError || !data?.success) {
        const message =
          fetchError?.message || 'Unable to load cities from inventory sync.'
        setError(new Error(message))
        return
      }

      const responseCities = data.data?.cities
      const fetchedCities = Array.isArray(responseCities) ? responseCities : []
      // Only keep cities with a name; region/country are optional and used for search/display.
      const nextCities = fetchedCities.map(mapCity).filter((city): city is City => Boolean(city))
      setCities(sortCities(nextCities))
    } catch (fetchError) {
      setError(fetchError instanceof Error ? fetchError : new Error('Unable to load cities.'))
    } finally {
      setIsLoading(false)
    }
  }, [])

  useEffect(() => {
    refreshCities()
  }, [refreshCities])

  return { cities, error, isLoading, refreshCities }
}
