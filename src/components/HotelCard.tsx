import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { MapPin } from '@phosphor-icons/react'
import type { Hotel, MyGoHotel } from '@/types'
import { t } from '@/lib/translations'
import { useApp } from '@/contexts/AppContext'

interface HotelCardProps {
  hotel: Hotel | MyGoHotel
  onViewDetails: (hotelId: string) => void
}

const fallbackImage =
  'https://images.unsplash.com/photo-1566073771259-6a8506099945?w=800&h=600&fit=crop'

export function HotelCard({ hotel, onViewDetails }: HotelCardProps) {
  const { language } = useApp()
  const isMyGoHotel = (value: Hotel | MyGoHotel): value is MyGoHotel => 'Name' in value
  const name = isMyGoHotel(hotel) ? hotel.Name : hotel.name
  const address = isMyGoHotel(hotel) ? hotel.Address : hotel.address || hotel.city
  const stars = Math.max(
    0,
    Math.min(5, Math.round(isMyGoHotel(hotel) ? hotel.Category : hotel.stars))
  )
  const imageUrl = isMyGoHotel(hotel)
    ? hotel.MainPhoto
      ? `https://admin.mygo.co${hotel.MainPhoto}`
      : fallbackImage
    : hotel.image || fallbackImage
  const price = isMyGoHotel(hotel) ? hotel.MinPrice : hotel.price
  const hotelId = isMyGoHotel(hotel) ? hotel.Name : hotel.id

  return (
    <Card className="group overflow-hidden hover:shadow-xl transition-all duration-300 hover:-translate-y-1">
      <div className="relative h-52 overflow-hidden bg-muted">
        <img
          src={imageUrl}
          alt={name}
          className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
          loading="lazy"
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

        <div className="flex items-center gap-1">
          {Array.from({ length: 5 }).map((_, index) => (
            <span
              key={index}
              className={index < stars ? 'text-yellow-400' : 'text-muted-foreground/40'}
              aria-hidden="true"
            >
              ⭐
            </span>
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
            Voir Disponibilité
          </Button>
        </div>
      </CardContent>
    </Card>
  )
}
