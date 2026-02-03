import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Star, MapPin, Tag } from '@phosphor-icons/react'
import { Hotel } from '@/types'
import { t } from '@/lib/translations'
import { useApp } from '@/contexts/AppContext'

const PLACEHOLDER_IMAGE =
  'https://images.unsplash.com/photo-1501117716987-c8e1ecb210b1?w=800&h=600&fit=crop'

const getImageBaseUrl = () =>
  (import.meta.env.VITE_API_BASE_URL ?? 'https://admin.mygo.co').replace(/\/$/, '')

const resolveImageSrc = (image: string | undefined) => {
  const trimmed = image?.trim()
  if (!trimmed) {
    return PLACEHOLDER_IMAGE
  }

  if (trimmed.startsWith('http://') || trimmed.startsWith('https://')) {
    return trimmed
  }

  if (trimmed.startsWith('//')) {
    return `https:${trimmed}`
  }

  if (trimmed.startsWith('/')) {
    return `${getImageBaseUrl()}${trimmed}`
  }

  return `${getImageBaseUrl()}/${trimmed}`
}

interface HotelCardProps {
  hotel: Hotel
  onViewDetails: (hotelId: string) => void
}

export function HotelCard({ hotel, onViewDetails }: HotelCardProps) {
  const { language } = useApp()
  const imageSrc = resolveImageSrc(hotel.image)

  return (
    <Card className="overflow-hidden hover:shadow-lg transition-all duration-300 hover:scale-[1.02]">
      <div className="relative h-48 overflow-hidden">
        <img
          src={imageSrc}
          alt={hotel.name}
          className="w-full h-full object-cover"
          loading="lazy"
          onError={(event) => {
            event.currentTarget.onerror = null
            event.currentTarget.src = PLACEHOLDER_IMAGE
            event.currentTarget.alt = `${hotel.name} (placeholder)`
          }}
        />
        {hotel.promotion && (
          <Badge className="absolute top-3 left-3 bg-destructive text-destructive-foreground flex items-center gap-1">
            <Tag size={14} weight="fill" />
            -{hotel.promotion.discount}%
          </Badge>
        )}
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
            {hotel.promotion ? (
              <div>
                <div className="text-sm line-through text-muted-foreground">
                  {hotel.promotion.originalPrice} {t('common.currency', language)}
                </div>
                <div className="text-2xl font-bold text-destructive">
                  {hotel.price} <span className="text-sm font-normal">{t('common.currency', language)}</span>
                </div>
              </div>
            ) : (
              <div className="text-2xl font-bold text-primary">
                {hotel.price} <span className="text-sm font-normal">{t('common.currency', language)}</span>
              </div>
            )}
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
