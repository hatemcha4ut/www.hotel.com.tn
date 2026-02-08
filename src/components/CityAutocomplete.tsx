import { useEffect, useId, useMemo, useRef, useState } from 'react'
import { Input } from '@/components/ui/input'
import { City, Language } from '@/types'
import { tunisianCities } from '@/constants/cities'
import { cn } from '@/lib/utils'
import { t } from '@/lib/translations'

// Allow click events to fire before closing the dropdown.
const BLUR_DELAY_MS = 100

interface CityAutocompleteProps {
  onSelect: (cityId: string) => void
  selectedCityId?: string
  placeholder?: string
  cities?: City[]
  className?: string
  isLoading?: boolean
  error?: Error | null
  onRetry?: () => void
  language?: Language
}

const normalizeForSearch = (value: string | null | undefined) =>
  (value ?? '')
    .toLowerCase()
    .trim()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    // Normalize en-dash/em-dash characters from labels like "City – Region" for search matching.
    .replace(/[\u2013\u2014()]/g, ' ')
    .replace(/[^\p{L}\p{N}\s-]/gu, '')
    .replace(/\s+/g, ' ')

const getCityLabel = (city: City) => {
  const region = city.region?.trim()
  const country = city.country?.trim()
  if (region && country) {
    return `${city.name} – ${region} (${country})`
  }
  if (region) {
    return `${city.name} – ${region}`
  }
  if (country) {
    return `${city.name} (${country})`
  }
  return city.name
}

const getCitySearchValue = (city: City) =>
  [city.name, city.region, city.country]
    .map((value) => value?.trim())
    .filter(Boolean)
    .join(' ')

export function CityAutocomplete({
  onSelect,
  selectedCityId,
  placeholder = '',
  cities = tunisianCities,
  className,
  isLoading = false,
  error = null,
  onRetry,
  language = 'fr',
}: CityAutocompleteProps) {
  const [query, setQuery] = useState('')
  const [isOpen, setIsOpen] = useState(false)
  const [highlightedIndex, setHighlightedIndex] = useState(-1)
  const listboxId = useId()
  const blurTimeoutRef = useRef<number | null>(null)
  const highlightedCityIdRef = useRef<string | null>(null)

  useEffect(() => {
    if (!selectedCityId) {
      setQuery('')
      return
    }
    const selectedCity = cities.find((city) => city.id === selectedCityId)
    if (selectedCity) {
      setQuery(getCityLabel(selectedCity))
    }
  }, [cities, selectedCityId])

  const searchableCities = useMemo(
    () =>
      cities.map((city) => ({
        city,
        searchValue: normalizeForSearch(getCitySearchValue(city)),
      })),
    [cities]
  )

  const filteredCities = useMemo(() => {
    const normalizedQuery = normalizeForSearch(query)
    // Match by name/region/country so searches work with all available metadata.
    return searchableCities
      .filter((city) =>
        normalizedQuery ? city.searchValue.includes(normalizedQuery) : true
      )
      .map((city) => city.city)
  }, [query, searchableCities])

  const listId = `${listboxId}-listbox`
  const activeOption =
    highlightedIndex >= 0 && highlightedIndex < filteredCities.length
      ? filteredCities[highlightedIndex]
      : undefined
  const activeOptionId = activeOption ? `${listboxId}-option-${activeOption.id}` : undefined

  const handleSelect = (city: City) => {
    setQuery(getCityLabel(city))
    setIsOpen(false)
    onSelect(city.id)
  }

  useEffect(() => {
    if (!isOpen || filteredCities.length === 0) {
      setHighlightedIndex(-1)
      return
    }
    const highlightedCityId = highlightedCityIdRef.current
    if (highlightedCityId) {
      const nextIndex = filteredCities.findIndex((city) => city.id === highlightedCityId)
      if (nextIndex !== -1) {
        setHighlightedIndex(nextIndex)
        return
      }
    }
    setHighlightedIndex(0)
  }, [filteredCities, isOpen])

  useEffect(() => {
    if (isOpen && blurTimeoutRef.current !== null) {
      window.clearTimeout(blurTimeoutRef.current)
      blurTimeoutRef.current = null
    }
  }, [isOpen])

  useEffect(() => {
    if (highlightedIndex >= 0 && highlightedIndex < filteredCities.length) {
      highlightedCityIdRef.current = filteredCities[highlightedIndex].id
    } else {
      highlightedCityIdRef.current = null
    }
  }, [filteredCities, highlightedIndex])

  useEffect(() => {
    return () => {
      if (blurTimeoutRef.current !== null) {
        window.clearTimeout(blurTimeoutRef.current)
      }
    }
  }, [])

  return (
    <div className={cn('relative', className)}>
      <Input
        placeholder={placeholder}
        value={query}
        onChange={(event) => {
          setQuery(event.target.value)
          setIsOpen(true)
        }}
        onFocus={() => setIsOpen(true)}
        onBlur={() => {
          if (blurTimeoutRef.current !== null) {
            window.clearTimeout(blurTimeoutRef.current)
          }
          blurTimeoutRef.current = window.setTimeout(() => setIsOpen(false), BLUR_DELAY_MS)
        }}
        onKeyDown={(event) => {
          if (event.key === 'ArrowDown') {
            event.preventDefault()
            setIsOpen(true)
            setHighlightedIndex((prev) => {
              if (filteredCities.length === 0) {
                return -1
              }
              if (prev < 0) {
                return 0
              }
              return (prev + 1) % filteredCities.length
            })
          }
          if (event.key === 'ArrowUp') {
            event.preventDefault()
            setIsOpen(true)
            setHighlightedIndex((prev) => {
              if (filteredCities.length === 0) {
                return -1
              }
              if (prev < 0) {
                return filteredCities.length - 1
              }
              return prev === 0 ? filteredCities.length - 1 : prev - 1
            })
          }
          if (event.key === 'Enter' && activeOption) {
            event.preventDefault()
            handleSelect(activeOption)
          }
          if (event.key === 'Escape') {
            setIsOpen(false)
          }
        }}
        role="combobox"
        aria-autocomplete="list"
        aria-expanded={isOpen}
        aria-controls={listId}
        aria-activedescendant={activeOptionId}
      />
      {isOpen && isLoading && cities.length === 0 && (
        <div className="absolute z-10 mt-1 w-full rounded-md border border-border bg-popover py-3 px-3 text-sm shadow-lg">
          <div className="flex items-center justify-center text-muted-foreground">
            <span className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin mr-2" />
            {t('cityAutocomplete.loading', language)}
          </div>
        </div>
      )}
      {isOpen && filteredCities.length > 0 && (
        <ul
          id={listId}
          role="listbox"
          className="absolute z-10 mt-1 max-h-60 w-full overflow-auto rounded-md border border-border bg-popover py-1 text-sm shadow-lg"
        >
          {filteredCities.map((city, index) => (
            <li
              key={city.id}
              id={`${listboxId}-option-${city.id}`}
              role="option"
              aria-selected={city.id === selectedCityId}
              className={cn(
                'cursor-pointer px-3 py-2 text-foreground hover:bg-accent hover:text-accent-foreground',
                index === highlightedIndex && 'bg-accent text-accent-foreground'
              )}
              onMouseDown={(event) => {
                // Prevent blur so click can register before the list closes.
                event.preventDefault()
              }}
              onMouseEnter={() => setHighlightedIndex(index)}
              onClick={() => handleSelect(city)}
            >
              {getCityLabel(city)}
            </li>
          ))}
        </ul>
      )}
      {error && (
        <div className="mt-2 p-2 bg-destructive/10 border border-destructive/20 rounded-md">
          <p className="text-xs text-destructive">
            {error.message}
          </p>
          {onRetry && (
            <button
              onClick={onRetry}
              className="mt-1 text-xs text-destructive underline hover:no-underline"
            >
              {t('cityAutocomplete.retry', language)}
            </button>
          )}
        </div>
      )}
    </div>
  )
}
