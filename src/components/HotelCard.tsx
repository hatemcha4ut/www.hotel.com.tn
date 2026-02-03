import { useCallback, useMemo } from 'react'
import type { SyntheticEvent } from 'react'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { MapPin, Star } from '@phosphor-icons/react'
import type { Hotel, MyGoHotel } from '@/types'
import { t } from '@/lib/translations'
import { useApp } from '@/contexts/AppContext'
import {
  getMyGoHotelIdentifier,
  HOTEL_FALLBACK_IMAGE,
  isMyGoHotel,
  MYGO_BASE_URL
} from '@/lib/hotel'

const PLACEHOLDER_IMAGE =
  'https://images.unsplash.com/photo-1501117716987-c8e1ecb210b1?w=800&h=600&fit=crop'

const IMAGE_BASE_URL = (import.meta.env.VITE_API_BASE_URL ?? 'https://admin.mygo.co').replace(
  /\/$/,
  ''
)

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
    return `${IMAGE_BASE_URL}${trimmed}`
  }

  return `${IMAGE_BASE_URL}/${trimmed}`
}

interface HotelCardProps {
  hotel: Hotel | MyGoHotel
  onViewDetails: (hotelId: string) => void
}

const MIN_STARS = 0
const MAX_STARS = 5

export function HotelCard({ hotel, onViewDetails }: HotelCardProps) {
  const { language } = useApp()

  const name = isMyGoHotel(hotel) ? hotel.Name : hotel.name
  const address = isMyGoHotel(hotel) ? hotel.Address : hotel.address || hotel.city
  const stars = Math.max(
    MIN_STARS,
    Math.min(MAX_STARS, Math.round(isMyGoHotel(hotel) ? hotel.Category : hotel.stars))
  )
  const starsLabel = t('common.starsRating', language).replace('{stars}', String(stars))
  const imageUrl = isMyGoHotel(hotel)
    ? hotel.MainPhoto
      ? `${MYGO_BASE_URL}${hotel.MainPhoto}`
      : HOTEL_FALLBACK_IMAGE
    : hotel.image || HOTEL_FALLBACK_IMAGE
  const price = isMyGoHotel(hotel) ? hotel.MinPrice : hotel.price
  const hotelId = isMyGoHotel(hotel) ? getMyGoHotelIdentifier(hotel) : hotel.id
  
  const handleImageError = useCallback(
    (event: SyntheticEvent<HTMLImageElement>) => {
      event.currentTarget.onerror = null
      event.currentTarget.src = PLACEHOLDER_IMAGE
      event.currentTarget.alt = `${event.currentTarget.alt} (placeholder)`
    },
    []
  )

  return (
    <Card className="group overflow-hidden hover:shadow-xl transition-all duration-300 hover:-translate-y-1">
      <div className="relative h-52 overflow-hidden bg-muted">
        <img
          src={imageUrl}
          alt={name}
          className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
          loading="lazy"
          onError={handleImageError}
        />
      </div>
      
      <CardContent className="p-5 space-y-4">
        <div>
          <h3 className="text-lg font-semibold text-foreground line-clamp-2">{name}</h3>
          <div className="flex items-center gap-2 text-sm text-muted-foreground mt-1">
            <MapPin size={14} weight="fill" />
            <span className="line-clamp-1">{address}</span>
          </div>
        </div>

        <div className="flex items-center gap-1" role="img" aria-label={starsLabel}>
          {Array.from({ length: 5 }).map((_, index) => (
            <Star
              key={index}
              size={16}
              weight={index < stars ? 'fill' : 'regular'}
              className={index < stars ? 'text-yellow-400' : 'text-muted-foreground/40'}
              aria-hidden="true"
            />
          ))}
        </div>

        <div className="flex items-center justify-between pt-4 border-t border-border">
          <div>
            <div className="text-sm text-muted-foreground">{t('common.from', language)}</div>
            <div className="text-2xl font-bold text-primary">
              {price}{' '}
              <span className="text-sm font-normal text-muted-foreground">
                {t('common.currency', language)}
              </span>
            </div>
            <div className="text-xs text-muted-foreground">{t('common.perNight', language)}</div>
          </div>
          <Button onClick={() => onViewDetails(hotelId)}>
            {t('common.viewAvailability', language)}
          </Button>
        </div>
      </CardContent>
    </Card>
  )
}
