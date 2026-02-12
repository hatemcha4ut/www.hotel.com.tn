import { createContext, useContext, useState, ReactNode } from 'react'
import { SearchParams, Language, Hotel } from '@/types'

interface SearchResultsData {
  hotels: Hotel[]
  rawCount?: number
  visibleCount?: number
}

interface AppContextType {
  language: Language
  setLanguage: (lang: Language) => void
  searchParams: SearchParams
  setSearchParams: (params: SearchParams) => void
  searchResults: SearchResultsData | null
  setSearchResults: (results: SearchResultsData | null) => void
}

const AppContext = createContext<AppContextType | undefined>(undefined)

const getDefaultDates = () => {
  const today = new Date()
  today.setHours(0, 0, 0, 0)
  
  const tomorrow = new Date(today)
  tomorrow.setDate(tomorrow.getDate() + 1)
  
  return { checkIn: today, checkOut: tomorrow }
}

const defaultSearchParams: SearchParams = {
  searchMode: 'city',
  cityId: undefined,
  hotelName: undefined,
  ...getDefaultDates(),
  rooms: [
    {
      adults: 2,
      children: []
    }
  ],
}

export function AppProvider({ children }: { children: ReactNode }) {
  const [language, setLanguage] = useState<Language>('fr')
  const [searchParams, setSearchParams] = useState<SearchParams>(defaultSearchParams)
  const [searchResults, setSearchResults] = useState<SearchResultsData | null>(null)

  return (
    <AppContext.Provider
      value={{
        language,
        setLanguage,
        searchParams,
        setSearchParams,
        searchResults,
        setSearchResults,
      }}
    >
      {children}
    </AppContext.Provider>
  )
}

export function useApp() {
  const context = useContext(AppContext)
  if (!context) {
    throw new Error('useApp must be used within AppProvider')
  }
  return context
}
