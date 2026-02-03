import { useState, useEffect } from 'react'
import { Hero } from '@/components/Hero'
import { FeaturedDestinations } from '@/components/FeaturedDestinations'
import { WhyBookWithUs } from '@/components/WhyBookWithUs'
import { DealsSection } from '@/components/DealsSection'
import { ResultsList } from '@/components/ResultsList'
import { api } from '@/lib/api'
import { Hotel } from '@/types'
import { useApp } from '@/contexts/AppContext'

interface HomePageProps {
  onSearch: () => void
  onViewHotel: (hotelId: string) => void
  onResultsFound: (hotels: Hotel[]) => void
}

export function HomePage({ onSearch, onViewHotel, onResultsFound }: HomePageProps) {
  const [popularHotels, setPopularHotels] = useState<Hotel[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const loadPopularHotels = async () => {
      try {
        const hotels = await api.searchHotels({})
        setPopularHotels(hotels.slice(0, 6))
      } catch (error) {
        console.error('Error loading hotels:', error)
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
