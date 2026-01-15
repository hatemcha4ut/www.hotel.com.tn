import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Star, MapPin } from '@phosphor-icons/react'
import { Hotel } from '@/types'
import { t } from '@/lib/translations'
import { useApp } from '@/contexts/AppContext'

interface HotelCardProps {
  hotel: Hotel
  onViewDetails: (hotelId: string) => void
}

export function HotelCard({ hotel, onViewDetails }: HotelCardProps) {
  const { language } = useApp()

  return (
    <Card className="overflow-hidden hover:shadow-lg transition-all duration-300 hover:scale-[1.02]">
      <div className="relative h-48 overflow-hidden">
        <img
          src={hotel.image}
          alt={hotel.name}
          className="w-full h-full object-cover"
          loading="lazy"
        />
        <Badge className="absolute top-3 right-3 bg-accent text-accent-foreground">
          <Star size={14} weight="fill" className="mr-1" />
          {hotel.stars} étoiles
        </Badge>
      </div>
      
      <CardContent className="p-4">
        <div className="mb-2">
          <h3 className="text-xl font-semibold mb-1 line-clamp-1">{hotel.name}</h3>
          <div className="flex items-center gap-1 text-sm text-muted-foreground">
            <MapPin size={14} weight="fill" />
            <span>{hotel.city}</span>
          </div>
        </div>

        <div className="flex items-center gap-2 mb-3">
          <div className="flex items-center gap-1">
            {Array.from({ length: 5 }).map((_, i) => (
              <Star
                key={i}
                size={14}
                weight={i < Math.floor(hotel.rating) ? 'fill' : 'regular'}
                className="text-accent"
              />
            ))}
          </div>
          <span className="text-sm font-medium">{hotel.rating}</span>
          <span className="text-sm text-muted-foreground">({hotel.reviewCount} avis)</span>
        </div>

        <p className="text-sm text-muted-foreground mb-4 line-clamp-2">
          {hotel.description}
        </p>

        <div className="flex items-center justify-between pt-4 border-t border-border">
          <div>
            <div className="text-sm text-muted-foreground">{t('common.from', language)}</div>
            <div className="text-2xl font-bold text-primary">
              {hotel.price} <span className="text-sm font-normal">{t('common.currency', language)}</span>
            </div>
            <div className="text-xs text-muted-foreground">{t('common.perNight', language)}</div>
          </div>
          <Button onClick={() => onViewDetails(hotel.id)}>
            {t('common.viewDetails', language)}
          </Button>
        </div>
      </CardContent>
    </Card>
  )
}
