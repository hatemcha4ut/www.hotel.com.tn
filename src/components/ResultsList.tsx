import { HotelCard } from '@/components/HotelCard'
import type { Hotel, MyGoHotel } from '@/types'

interface ResultsListProps {
  hotels: Array<Hotel | MyGoHotel>
  onViewHotel: (hotelId: string) => void
}

export function ResultsList({ hotels, onViewHotel }: ResultsListProps) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
      {hotels.map((hotel, index) => (
        <HotelCard
          key={`${'id' in hotel ? `hotel-${hotel.id}` : `mygo-${hotel.Name}`}`}
          hotel={hotel}
          onViewDetails={onViewHotel}
        />
      ))}
    </div>
  )
}
