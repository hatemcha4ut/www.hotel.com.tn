import { useState, useEffect } from 'react'
import { Hotel } from '@/types'
import { api } from '@/lib/api'
import { ResultsList } from '@/components/ResultsList'
import { Tag } from '@phosphor-icons/react'
import { useApp } from '@/contexts/AppContext'

interface DealsSectionProps {
  onViewHotel: (hotelId: string) => void
}

export function DealsSection({ onViewHotel }: DealsSectionProps) {
  const [deals, setDeals] = useState<Hotel[]>([])
  const [loading, setLoading] = useState(true)
  const { language } = useApp()

  useEffect(() => {
    const loadDeals = async () => {
      try {
        const hotelsWithDeals = await api.getHotelsWithPromotions()
        setDeals(hotelsWithDeals)
      } catch (error) {
        console.error('Error loading deals:', error)
      } finally {
        setLoading(false)
      }
    }
    loadDeals()
  }, [])

  const title = {
    fr: 'Offres Spéciales',
    en: 'Special Offers',
    ar: 'عروض خاصة'
  }

  const subtitle = {
    fr: 'Profitez de nos promotions exclusives et économisez jusqu\'à 20% sur votre séjour',
    en: 'Enjoy our exclusive promotions and save up to 20% on your stay',
    ar: 'استمتع بعروضنا الحصرية ووفر حتى 20٪ على إقامتك'
  }

  if (loading) {
    return (
      <section className="py-16 bg-muted/30" id="deals">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <div className="inline-flex items-center gap-2 bg-accent/20 text-accent-foreground px-4 py-2 rounded-full mb-4">
              <Tag size={20} weight="fill" />
              <span className="font-semibold">Promotions Actuelles</span>
            </div>
            <h2 className="text-3xl md:text-4xl font-bold mb-4">{title[language]}</h2>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              {subtitle[language]}
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {Array.from({ length: 6 }).map((_, i) => (
              <div key={i} className="h-96 bg-card animate-pulse rounded-lg" />
            ))}
          </div>
        </div>
      </section>
    )
  }

  if (deals.length === 0) {
    return null
  }

  return (
    <section className="py-16 bg-muted/30" id="deals">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <div className="inline-flex items-center gap-2 bg-accent/20 text-accent-foreground px-4 py-2 rounded-full mb-4">
            <Tag size={20} weight="fill" />
            <span className="font-semibold">Promotions Actuelles</span>
          </div>
          <h2 className="text-3xl md:text-4xl font-bold mb-4">{title[language]}</h2>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            {subtitle[language]}
          </p>
        </div>

         <ResultsList hotels={deals} onViewHotel={onViewHotel} />
      </div>
    </section>
  )
}
