import { useEffect, useId, useMemo, useState } from 'react'
import { Input } from '@/components/ui/input'
import { City } from '@/types'
import { cn } from '@/lib/utils'

const BLUR_DELAY_MS = 100

const tunisianCities: City[] = [
  { id: '1', name: 'Tunis', country: 'Tunisia' },
  { id: '2', name: 'Sousse', country: 'Tunisia' },
  { id: '3', name: 'Hammamet', country: 'Tunisia' },
  { id: '4', name: 'Djerba', country: 'Tunisia' },
  { id: '5', name: 'Monastir', country: 'Tunisia' },
  { id: '6', name: 'Mahdia', country: 'Tunisia' },
  { id: '7', name: 'Tozeur', country: 'Tunisia' },
  { id: '8', name: 'Sfax', country: 'Tunisia' },
]

interface CityAutocompleteProps {
  onSelect: (cityId: string) => void
  selectedCityId?: string
  placeholder?: string
  cities?: City[]
  className?: string
}

const normalizeValue = (value: string) =>
  value
    .toLowerCase()
    .trim()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')

export function CityAutocomplete({
  onSelect,
  selectedCityId,
  placeholder = '',
  cities = tunisianCities,
  className,
}: CityAutocompleteProps) {
  const [query, setQuery] = useState('')
  const [isOpen, setIsOpen] = useState(false)
  const listboxId = useId()

  useEffect(() => {
    if (!selectedCityId) {
      setQuery('')
      return
    }
    const selectedCity = cities.find((city) => city.id === selectedCityId)
    if (selectedCity) {
      setQuery(selectedCity.name)
    }
  }, [selectedCityId])

  const filteredCities = useMemo(() => {
    const normalizedQuery = normalizeValue(query)
    if (!normalizedQuery) {
      return cities
    }
    return cities.filter((city) => normalizeValue(city.name).includes(normalizedQuery))
  }, [cities, query])

  const listId = `${listboxId}-listbox`

  const handleSelect = (city: City) => {
    setQuery(city.name)
    setIsOpen(false)
    onSelect(city.id)
  }

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
          window.setTimeout(() => setIsOpen(false), BLUR_DELAY_MS)
        }}
        role="combobox"
        aria-autocomplete="list"
        aria-expanded={isOpen}
        aria-controls={listId}
      />
      {isOpen && filteredCities.length > 0 && (
        <ul
          id={listId}
          role="listbox"
          className="absolute z-10 mt-1 max-h-60 w-full overflow-auto rounded-md border border-border bg-popover py-1 text-sm shadow-lg"
        >
          {filteredCities.map((city) => (
            <li
              key={city.id}
              id={`${listboxId}-option-${city.id}`}
              role="option"
              aria-selected={city.id === selectedCityId}
              className="cursor-pointer px-3 py-2 text-foreground hover:bg-accent hover:text-accent-foreground"
              onMouseDown={(event) => event.preventDefault()}
              onClick={() => handleSelect(city)}
            >
              {city.name}
            </li>
          ))}
        </ul>
      )}
    </div>
  )
}
