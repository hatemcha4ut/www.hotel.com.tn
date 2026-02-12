import { useState, useEffect } from 'react'
import { Hero } from '@/components/Hero'
import { FeaturedDestinations } from '@/components/FeaturedDestinations'
import { WhyBookWithUs } from '@/components/WhyBookWithUs'
import { DealsSection } from '@/components/DealsSection'
import { ResultsList } from '@/components/ResultsList'
import { Hotel } from '@/types'
import type { SearchHotelsResult } from '@/services/searchHotels'
import { fetchSearchHotels, mapSearchHotelsToList } from '@/services/searchHotels'
 copilot/resolve-merge-conflicts
import { format, addDays } from 'date-fns'

 copilot/fix-frontend-issues
import { format, addDays } from 'date-fns'

 main
import { useApp } from '@/contexts/AppContext'
 main

interface HomePageProps {
  onSearch: () => void
  onViewHotel: (hotelId: string) => void
  onResultsFound: (results: SearchHotelsResult) => void
}

// Constants for popular hotels section
const POPULAR_HOTELS_CHECKIN_DAYS = 7  // Days from today for check-in
const POPULAR_HOTELS_CHECKOUT_DAYS = 10 // Days from today for check-out
const POPULAR_HOTELS_CITY_ID = 1 // Tunis
const POPULAR_HOTELS_COUNT = 6

export function HomePage({ onSearch, onViewHotel, onResultsFound }: HomePageProps) {
  const [popularHotels, setPopularHotels] = useState<Hotel[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const loadPopularHotels = async () => {
      try {
 copilot/resolve-merge-conflicts

 copilot/fix-frontend-issues
 main
        // Fetch hotels from Tunis for the popular hotels section
        const checkIn = format(addDays(new Date(), POPULAR_HOTELS_CHECKIN_DAYS), 'yyyy-MM-dd')
        const checkOut = format(addDays(new Date(), POPULAR_HOTELS_CHECKOUT_DAYS), 'yyyy-MM-dd')
        
        const response = await fetchSearchHotels({
          cityId: POPULAR_HOTELS_CITY_ID,
          checkIn,
          checkOut,
 copilot/resolve-merge-conflicts

          rooms: [{ adults: 2 }],
        })
        
        const hotels = mapSearchHotelsToList(response.hotels)
        setPopularHotels(hotels.slice(0, POPULAR_HOTELS_COUNT))
      } catch (error) {
        console.error('Error loading popular hotels:', error)
        // Don't show error to user - just leave empty state

        // Search for hotels in Tunis (cityId=1) for next 7 days
        const today = new Date()
        const checkIn = new Date(today)
        checkIn.setDate(today.getDate() + 7)
        const checkOut = new Date(checkIn)
        checkOut.setDate(checkIn.getDate() + 3)

        const payload = {
          cityId: 1, // Tunis
          checkIn: format(checkIn, 'yyyy-MM-dd'),
          checkOut: format(checkOut, 'yyyy-MM-dd'),
 main
          rooms: [{ adults: 2 }],
        })
        
        const hotels = mapSearchHotelsToList(response.hotels)
        setPopularHotels(hotels.slice(0, POPULAR_HOTELS_COUNT))
      } catch (error) {
        console.error('Error loading popular hotels:', error)
 copilot/resolve-merge-conflicts
        // Don't show error to user - just leave empty state

        // Don't show error to user, just show empty list
 main
 main
        setPopularHotels([])
      } finally {
        setLoading(false)
      }
    }
    loadPopularHotels()
  }, [])

  return (
    <div>
      <Hero onSearch={onSearch} onResultsFound={onResultsFound} />
      <FeaturedDestinations />
      <DealsSection onViewHotel={onViewHotel} />
      <WhyBookWithUs />
      
      <section className="py-16 bg-background" id="hotels">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">Hôtels Populaires</h2>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              Découvrez notre sélection des meilleurs hôtels de Tunisie
            </p>
          </div>

           {loading ? (
             <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
               {Array.from({ length: 6 }).map((_, i) => (
                 <div key={i} className="h-96 bg-muted animate-pulse rounded-lg" />
               ))}
             </div>
           ) : (
             <ResultsList hotels={popularHotels} onViewHotel={onViewHotel} />
           )}
        </div>
      </section>
    </div>
  )
}
